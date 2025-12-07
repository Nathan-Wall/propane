/**
 * Schema Generator
 *
 * Generates PostgreSQL schema definitions from parsed .pmsg files.
 * Finds all Table<{...}> types and converts them to DatabaseSchema.
 */

import type { PmtFile, PmtMessage, PmtProperty, PmtType } from '@/tools/parser/types.js';
import type { DatabaseSchema, TableDefinition, IndexDefinition } from '../schema/types.js';
import { SchemaBuilder, TableBuilder, ColumnBuilder } from '../schema/builder.js';
import { mapScalarType, type ScalarType } from '../mapping/type-mapper.js';

/**
 * Known database wrapper types from @propanejs/postgres.
 * These modify how a field is stored in the database.
 */
const DB_WRAPPER_TYPES = new Set([
  'PK',       // Primary key
  'Auto',     // Auto-increment
  'Index',    // Create index
  'Unique',   // Unique constraint
  'Separate', // Force separate table for arrays
  'Json',     // Force JSONB storage
]);

/**
 * Result of unwrapping database wrapper types.
 */
interface UnwrappedType {
  /** The base type after removing all wrappers */
  baseType: PmtType;
  /** Whether this field is a primary key */
  isPrimaryKey: boolean;
  /** Whether this field is auto-increment */
  isAutoIncrement: boolean;
  /** Whether to create an index on this field */
  createIndex: boolean;
  /** Whether this field has a unique constraint */
  isUnique: boolean;
  /** Whether to force separate table for array (not used in column generation) */
  forceSeparate: boolean;
  /** Whether to force JSONB storage */
  forceJson: boolean;
}

/**
 * Unwrap database wrapper types from a PmtType.
 *
 * For example, `PK<Auto<bigint>>` unwraps to:
 * - baseType: { kind: 'primitive', primitive: 'bigint' }
 * - isPrimaryKey: true
 * - isAutoIncrement: true
 */
function unwrapDbWrappers(type: PmtType): UnwrappedType {
  const result: UnwrappedType = {
    baseType: type,
    isPrimaryKey: false,
    isAutoIncrement: false,
    createIndex: false,
    isUnique: false,
    forceSeparate: false,
    forceJson: false,
  };

  let current = type;

  // Keep unwrapping while we have reference types that are DB wrappers
  while (current.kind === 'reference' && DB_WRAPPER_TYPES.has(current.name)) {
    const wrapperName = current.name;
    const innerType = current.typeArguments[0];

    if (!innerType) {
      // No inner type - this shouldn't happen for valid wrapper usage
      break;
    }

    switch (wrapperName) {
      case 'PK':
        result.isPrimaryKey = true;
        break;
      case 'Auto':
        result.isAutoIncrement = true;
        break;
      case 'Index':
        result.createIndex = true;
        break;
      case 'Unique':
        result.isUnique = true;
        break;
      case 'Separate':
        result.forceSeparate = true;
        break;
      case 'Json':
        result.forceJson = true;
        break;
    }

    current = innerType;
  }

  result.baseType = current;
  return result;
}

/**
 * Convert a PmtType to a ScalarType for type mapping.
 */
function toScalarType(type: PmtType): ScalarType {
  switch (type.kind) {
    case 'primitive':
      switch (type.primitive) {
        case 'string': return 'string';
        case 'number': return 'number';
        case 'boolean': return 'boolean';
        case 'bigint': return 'bigint';
        case 'null': return 'null';
        case 'undefined': return 'undefined';
      }
      break;
    case 'date':
      return 'Date';
    case 'url':
      return 'URL';
    case 'arraybuffer':
      return 'ArrayBuffer';
    case 'array':
      return 'array';
    case 'map':
      return 'map';
    case 'set':
      return 'set';
    case 'union':
      return 'union';
    case 'literal':
      return typeof type.value === 'string' ? 'string' : 'number';
    case 'reference':
      // Check for special scalar types
      if (type.name === 'int32') return 'int32';
      if (type.name === 'decimal') return 'decimal';
      // Other references are treated as objects (nested messages)
      return 'object';
  }
  return 'object';
}

/**
 * Extract decimal precision and scale from a decimal<P,S> type.
 */
function extractDecimalOptions(type: PmtType): { precision?: number; scale?: number } {
  if (type.kind === 'reference' && type.name === 'decimal' && type.typeArguments.length >= 2) {
    const precArg = type.typeArguments[0];
    const scaleArg = type.typeArguments[1];

    let precision: number | undefined;
    let scale: number | undefined;

    if (precArg?.kind === 'literal' && typeof precArg.value === 'number') {
      precision = precArg.value;
    }
    if (scaleArg?.kind === 'literal' && typeof scaleArg.value === 'number') {
      scale = scaleArg.value;
    }

    return { precision, scale };
  }
  return {};
}

/**
 * Check if a union type consists only of string literals.
 */
function isStringLiteralUnion(type: PmtType): string[] | null {
  if (type.kind !== 'union') return null;

  const literals: string[] = [];
  for (const t of type.types) {
    if (t.kind === 'literal' && typeof t.value === 'string') {
      literals.push(t.value);
    } else if (t.kind === 'primitive' && t.primitive === 'null') {
      // Allow null in unions (makes column nullable)
      continue;
    } else {
      return null; // Not a pure string literal union
    }
  }

  return literals.length > 0 ? literals : null;
}

/**
 * Check if a type contains null (making it nullable).
 */
function isNullable(type: PmtType): boolean {
  if (type.kind === 'primitive' && type.primitive === 'null') {
    return true;
  }
  if (type.kind === 'union') {
    return type.types.some(t => t.kind === 'primitive' && t.primitive === 'null');
  }
  return false;
}

/**
 * Convert a property name to snake_case for PostgreSQL.
 */
function toSnakeCase(name: string): string {
  return name
    .replace(/([a-z])([A-Z])/g, '$1_$2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1_$2')
    .toLowerCase();
}

/**
 * Convert a type name to snake_case table name.
 */
function toTableName(typeName: string): string {
  // Convert PascalCase to snake_case and pluralize
  const snake = toSnakeCase(typeName);
  // Simple pluralization (add 's' unless already ends in 's')
  return snake.endsWith('s') ? snake : snake + 's';
}

/**
 * Configure a column builder from a property.
 */
function configureColumn(
  builder: ColumnBuilder,
  prop: PmtProperty,
  unwrapped: UnwrappedType
): void {
  const baseType = unwrapped.baseType;
  const scalarType = toScalarType(baseType);

  // Handle field number for rename detection
  if (prop.fieldNumber !== null) {
    builder.fieldNumber(prop.fieldNumber);
  }

  // Handle decimal precision/scale
  const decimalOptions = extractDecimalOptions(baseType);

  // Map to PostgreSQL type
  const pgType = mapScalarType(scalarType, decimalOptions);

  // Handle auto-increment
  if (unwrapped.isAutoIncrement) {
    if (scalarType === 'bigint') {
      builder.bigserial();
    } else {
      builder.serial();
    }
  } else if (unwrapped.forceJson || pgType.isJsonb) {
    builder.jsonb();
  } else {
    builder.type(pgType.sqlType);
  }

  // Handle nullability
  const nullable = prop.optional || isNullable(baseType);
  if (nullable) {
    builder.nullable();
  } else {
    builder.notNull();
  }

  // Handle primary key
  if (unwrapped.isPrimaryKey) {
    builder.primaryKey();
  }

  // Handle unique constraint
  if (unwrapped.isUnique) {
    builder.unique();
  }
}

/**
 * Generate a table definition from a Table<{...}> message.
 */
function generateTable(
  tableBuilder: TableBuilder,
  message: PmtMessage,
  indexes: IndexDefinition[]
): void {
  tableBuilder.sourceType(message.name);

  for (const prop of message.properties) {
    const columnName = toSnakeCase(prop.name);
    const unwrapped = unwrapDbWrappers(prop.type);

    tableBuilder.column(columnName, col => {
      configureColumn(col, prop, unwrapped);
    });

    // Generate index if Index<T> wrapper was used
    if (unwrapped.createIndex) {
      const indexName = `${toTableName(message.name)}_${columnName}_idx`;
      indexes.push({
        name: indexName,
        columns: [columnName],
        unique: unwrapped.isUnique,
      });
    }

    // Generate CHECK constraint for string literal unions
    const literals = isStringLiteralUnion(unwrapped.baseType);
    if (literals) {
      const constraintName = `${toTableName(message.name)}_${columnName}_check`;
      const escapedLiterals = literals.map(l => `'${l.replaceAll("'", "''")}'`);
      const expression = `${columnName} IN (${escapedLiterals.join(', ')})`;
      tableBuilder.check(constraintName, expression);
    }
  }

  // Add the collected indexes
  for (const idx of indexes) {
    tableBuilder.index(idx.name, idx.columns, { unique: idx.unique });
  }
}

/**
 * Options for schema generation.
 */
export interface SchemaGeneratorOptions {
  /** Schema name (default: 'public') */
  schemaName?: string;
  /** Schema version */
  version?: string;
}

/**
 * Generate a DatabaseSchema from parsed .pmsg files.
 *
 * @param files - Parsed .pmsg files
 * @param options - Generation options
 * @returns The generated database schema
 *
 * @example
 * ```typescript
 * import { parseFiles } from '@propanejs/parser';
 * import { generateSchema } from '@propanejs/postgres';
 *
 * const { files } = parseFiles(['./src/models/*.pmsg']);
 * const schema = generateSchema(files, { schemaName: 'public' });
 * ```
 */
export function generateSchema(
  files: PmtFile[],
  options: SchemaGeneratorOptions = {}
): DatabaseSchema {
  const builder = new SchemaBuilder();

  if (options.schemaName) {
    builder.schema(options.schemaName);
  }
  if (options.version) {
    builder.version(options.version);
  }

  // Find all Table<{...}> types across all files
  for (const file of files) {
    for (const message of file.messages) {
      if (!message.isTableType) {
        continue; // Skip non-table types
      }

      const tableName = toTableName(message.name);
      const indexes: IndexDefinition[] = [];

      builder.table(tableName, tableBuilder => {
        generateTable(tableBuilder, message, indexes);
      });
    }
  }

  return builder.build();
}

/**
 * Find all Table<{...}> types in the given files.
 *
 * @param files - Parsed .pmsg files
 * @returns Messages that are table types
 */
export function findTableTypes(files: PmtFile[]): PmtMessage[] {
  const tables: PmtMessage[] = [];

  for (const file of files) {
    for (const message of file.messages) {
      if (message.isTableType) {
        tables.push(message);
      }
    }
  }

  return tables;
}

/**
 * Generate a single table definition from a message.
 *
 * @param message - A Table<{...}> message
 * @returns The table definition
 */
export function generateTableDefinition(message: PmtMessage): TableDefinition {
  const tableName = toTableName(message.name);
  const tableBuilder = new TableBuilder(tableName);
  const indexes: IndexDefinition[] = [];

  generateTable(tableBuilder, message, indexes);

  return tableBuilder.build();
}
