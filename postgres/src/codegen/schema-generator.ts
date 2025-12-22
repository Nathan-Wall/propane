/**
 * Schema Generator
 *
 * Generates PostgreSQL schema definitions from parsed .pmsg files.
 * Finds all Table<{...}> types and converts them to DatabaseSchema.
 */

import type { PmtFile, PmtMessage, PmtProperty, PmtType } from '@/tools/parser/types.js';
import type { DatabaseSchema, TableDefinition, IndexDefinition } from '../schema/types.js';
import { SchemaBuilder, TableBuilder, ColumnBuilder } from '../schema/builder.js';
import {
  mapScalarType,
  analyzeUnionType,
  generateUnionCheckConstraint,
  type ScalarType,
  type UnionAnalysis,
} from '../mapping/type-mapper.js';

/**
 * Known database wrapper types from @propane/postgres.
 * These modify how a field is stored in the database.
 */
const DB_WRAPPER_TYPES = new Set([
  'PrimaryKey', // Primary key (supports composite)
  'Auto',       // Auto-increment
  'Index',      // Create index
  'Unique',     // Unique constraint
  'Normalize',  // Normalize arrays into separate tables
  'Json',       // Force JSONB storage
  'References', // Foreign key reference
]);

/**
 * Result of unwrapping database wrapper types.
 */
interface UnwrappedType {
  /** The base type after removing all wrappers */
  baseType: PmtType;
  /** Whether this field is a primary key */
  isPrimaryKey: boolean;
  /** Explicit order in composite PK (1-based), undefined for declaration order */
  primaryKeyOrder?: number;
  /** Whether this field is auto-increment */
  isAutoIncrement: boolean;
  /** Whether to create an index on this field */
  createIndex: boolean;
  /** Whether this field has a unique constraint */
  isUnique: boolean;
  /** Whether to normalize array into separate table (not used in column generation) */
  forceNormalize: boolean;
  /** Whether to force JSONB storage */
  forceJson: boolean;
  /** Foreign key reference info */
  foreignKey?: {
    referencedType: string;
    referencedColumn: string;
  };
}

/**
 * Unwrap database wrapper types from a PmtType.
 *
 * For example, `PrimaryKey<Auto<bigint>>` unwraps to:
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
    forceNormalize: false,
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
      case 'PrimaryKey':
        result.isPrimaryKey = true;
        // Extract explicit order if provided: PrimaryKey<T, 1>
        if (current.typeArguments[1]?.kind === 'literal') {
          const orderValue = current.typeArguments[1].value;
          if (typeof orderValue === 'number') {
            result.primaryKeyOrder = orderValue;
          }
        }
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
      case 'Normalize':
        result.forceNormalize = true;
        break;
      case 'Json':
        result.forceJson = true;
        break;
      case 'References': {
        // References<User> or References<User, 'code'>
        const refType = current.typeArguments[0];
        const refCol = current.typeArguments[1];

        if (refType?.kind === 'reference') {
          result.foreignKey = {
            referencedType: refType.name,
            referencedColumn:
              refCol?.kind === 'literal' && typeof refCol.value === 'string'
                ? refCol.value
                : 'id',
          };
        }
        // References doesn't have further nested wrappers, so we set baseType from the referenced type
        // The actual column type will be inferred later from the referenced table
        result.baseType = innerType;
        return result;
      }
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
 *
 * @throws Error if precision or scale are out of PostgreSQL bounds
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

    // Validate bounds (PostgreSQL limits)
    if (precision !== undefined && (precision < 1 || precision > 1000)) {
      throw new Error(`Decimal precision must be between 1 and 1000, got: ${precision}`);
    }
    if (scale !== undefined && scale < 0) {
      throw new Error(`Decimal scale must be non-negative, got: ${scale}`);
    }
    if (scale !== undefined && precision !== undefined && scale > precision) {
      throw new Error(`Decimal scale (${scale}) cannot exceed precision (${precision})`);
    }

    return { precision, scale };
  }
  return {};
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
 *
 * @param builder - The column builder
 * @param prop - The property definition
 * @param unwrapped - The unwrapped type info
 * @param isCompositePk - Whether this table has a composite primary key
 * @param messageTypeNames - Set of known message type names for union analysis
 * @param tableName - Table name for generating CHECK constraint names
 */
function configureColumn(
  builder: ColumnBuilder,
  prop: PmtProperty,
  unwrapped: UnwrappedType,
  isCompositePk: boolean,
  messageTypeNames: Set<string>,
  tableName: string
): { checkConstraint?: { name: string; expression: string } } {
  const baseType = unwrapped.baseType;
  const columnName = toSnakeCase(prop.name);

  // Handle field number for rename detection
  if (prop.fieldNumber !== null) {
    builder.fieldNumber(prop.fieldNumber);
  }

  // Analyze union type to determine storage strategy
  const unionAnalysis = analyzeUnionType(baseType, messageTypeNames);

  // Handle auto-increment (takes precedence)
  if (unwrapped.isAutoIncrement) {
    const scalarType = toScalarType(baseType);
    if (scalarType === 'bigint') {
      builder.bigserial();
    } else {
      builder.serial();
    }
    // Auto-increment columns are not null by default via SERIAL/BIGSERIAL
    if (unwrapped.isPrimaryKey && !isCompositePk) {
      builder.primaryKey();
    }
    if (unwrapped.isUnique) {
      builder.unique();
    }
    return {};
  }

  // Handle JSONB strategy for complex unions
  if (unionAnalysis.strategy === 'jsonb' || unwrapped.forceJson) {
    builder.jsonb();
    // JSONB columns are nullable if union has null OR undefined
    // (both map to database NULL, but we use JSONB format to distinguish)
    if (unionAnalysis.hasNull || unionAnalysis.hasUndefined || prop.optional) {
      builder.nullable();
    } else {
      builder.notNull();
    }
    if (unwrapped.isPrimaryKey && !isCompositePk) {
      builder.primaryKey();
    }
    if (unwrapped.isUnique) {
      builder.unique();
    }
    return {};
  }

  // Native storage strategy
  const scalarType = unionAnalysis.baseType ?? toScalarType(baseType);
  const decimalOptions = extractDecimalOptions(baseType);
  const pgType = mapScalarType(scalarType, decimalOptions);

  if (pgType.isJsonb) {
    builder.jsonb();
  } else {
    builder.type(pgType.sqlType);
  }

  // Handle nullability for native storage
  // Native columns are nullable if:
  // - prop.optional is true (declared as optional via '?')
  // - union includes null (T | null)
  // - union includes undefined (T | undefined)
  const nullable = prop.optional || unionAnalysis.hasNull || unionAnalysis.hasUndefined;
  if (nullable) {
    builder.nullable();
  } else {
    builder.notNull();
  }

  // Handle primary key (only inline for single-column PKs)
  // Composite PKs are handled separately via compositePrimaryKey()
  if (unwrapped.isPrimaryKey && !isCompositePk) {
    builder.primaryKey();
  }

  // Handle unique constraint
  if (unwrapped.isUnique) {
    builder.unique();
  }

  // Generate CHECK constraint for literal unions
  let checkConstraint: { name: string; expression: string } | undefined;
  if (unionAnalysis.literalValues && unionAnalysis.literalValues.length > 0) {
    const constraintName = `${tableName}_${columnName}_check`;
    const expression = generateUnionCheckConstraint(columnName, unionAnalysis.literalValues.map(String));
    checkConstraint = { name: constraintName, expression };
  }

  return { checkConstraint };
}

/**
 * Result from generating a table, including any child tables.
 */
interface GenerateTableResult {
  childTables: TableDefinition[];
}

/**
 * Generate a table definition from a Table<{...}> message.
 */
function generateTable(
  tableBuilder: TableBuilder,
  message: PmtMessage,
  indexes: IndexDefinition[],
  tableName: string,
  pkInfo: PrimaryKeyInfo | null,
  typeRegistry?: Map<string, PmtMessage>,
  messageTypeNames?: Set<string>
): GenerateTableResult {
  tableBuilder.sourceType(message.name);

  const childTables: TableDefinition[] = [];
  const isCompositePk = pkInfo?.isComposite ?? false;
  // Build messageTypeNames from registry if not provided
  const msgTypeNames = messageTypeNames ?? buildMessageTypeNames(typeRegistry);

  for (const prop of message.properties) {
    const columnName = toSnakeCase(prop.name);
    const unwrapped = unwrapDbWrappers(prop.type);

    // Handle Normalize<T[]> - generate child table instead of column
    if (unwrapped.forceNormalize) {
      if (pkInfo && unwrapped.baseType.kind === 'array') {
        const childTable = generateChildTable({
          parentTable: tableName,
          parentPkColumn: pkInfo.columnName,
          parentPkType: pkInfo.sqlType,
          fieldName: prop.name,
          columnName,
          elementType: unwrapped.baseType.elementType,
        });
        childTables.push(childTable);
      }
      // Skip creating column in parent table
      continue;
    }

    // Handle References<T> - create column with foreign key constraint
    if (unwrapped.foreignKey) {
      const { referencedType, referencedColumn } = unwrapped.foreignKey;
      const refTableName = toTableName(referencedType);
      const refColumnName = toSnakeCase(referencedColumn);
      const fkName = `${tableName}_${columnName}_fkey`;

      // Try to infer column type from referenced table
      let columnType = 'BIGINT'; // Default assumption
      if (typeRegistry) {
        const refMessage = typeRegistry.get(referencedType);
        if (refMessage) {
          const refPkInfo = findPrimaryKeyInfo(refMessage);
          if (refPkInfo) {
            columnType = refPkInfo.sqlType;
          }
        }
      }

      tableBuilder.column(columnName, col => {
        col.type(columnType);
        if (!prop.optional && !isNullable(unwrapped.baseType)) {
          col.notNull();
        } else {
          col.nullable();
        }
        if (prop.fieldNumber !== null) {
          col.fieldNumber(prop.fieldNumber);
        }
      });

      tableBuilder.foreignKey(
        fkName,
        [columnName],
        refTableName,
        [refColumnName],
        { onDelete: 'NO ACTION', onUpdate: 'NO ACTION' }
      );

      // Generate index if Index<T> wrapper was also used
      if (unwrapped.createIndex) {
        const indexName = `${tableName}_${columnName}_idx`;
        indexes.push({
          name: indexName,
          columns: [columnName],
          unique: unwrapped.isUnique,
        });
      }

      continue;
    }

    // Regular column - configureColumn handles union analysis and CHECK constraints
    let checkConstraint: { name: string; expression: string } | undefined;
    tableBuilder.column(columnName, col => {
      const result = configureColumn(col, prop, unwrapped, isCompositePk, msgTypeNames, tableName);
      checkConstraint = result.checkConstraint;
    });

    // Add CHECK constraint if generated by configureColumn
    if (checkConstraint) {
      tableBuilder.check(checkConstraint.name, checkConstraint.expression);
    }

    // Generate index if Index<T> wrapper was used
    if (unwrapped.createIndex) {
      const indexName = `${tableName}_${columnName}_idx`;
      indexes.push({
        name: indexName,
        columns: [columnName],
        unique: unwrapped.isUnique,
      });
    }
  }

  // Add the collected indexes
  for (const idx of indexes) {
    tableBuilder.index(idx.name, idx.columns, { unique: idx.unique });
  }

  // Set composite primary key if applicable
  if (isCompositePk && pkInfo) {
    const pkColumnNames = pkInfo.columns.map(c => c.columnName);
    tableBuilder.compositePrimaryKey(pkColumnNames);
  }

  return { childTables };
}

/**
 * Build a set of message type names from the type registry.
 */
function buildMessageTypeNames(typeRegistry?: Map<string, PmtMessage>): Set<string> {
  const names = new Set<string>();
  if (typeRegistry) {
    for (const message of typeRegistry.values()) {
      // Include both Table and Message types
      names.add(message.name);
    }
  }
  return names;
}

/**
 * Info about a child table to be generated from Normalize<T[]>.
 */
interface ChildTableInfo {
  parentTable: string;
  parentPkColumn: string;
  parentPkType: string;
  fieldName: string;
  columnName: string;
  elementType: PmtType;
}

/**
 * Info about a single column in the primary key.
 */
interface PrimaryKeyColumn {
  columnName: string;
  sqlType: string;
  fieldName: string;
  declarationIndex: number;
  explicitOrder?: number;
  isAutoIncrement: boolean;
  isOptional: boolean;
  isNullable: boolean;
}

/**
 * Info about the primary key of a table.
 */
interface PrimaryKeyInfo {
  /** Single-column PK backward compatibility fields */
  columnName: string;
  sqlType: string;
  /** All columns in the PK (sorted by order) */
  columns: PrimaryKeyColumn[];
  /** Whether this is a composite (multi-column) primary key */
  isComposite: boolean;
}

/**
 * Find the primary key info for a message.
 */
function findPrimaryKeyInfo(message: PmtMessage): PrimaryKeyInfo | null {
  const columns: PrimaryKeyColumn[] = [];
  let pkDeclarationIndex = 0;

  for (const prop of message.properties) {
    const unwrapped = unwrapDbWrappers(prop.type);
    if (unwrapped.isPrimaryKey) {
      const columnName = toSnakeCase(prop.name);
      const scalarType = toScalarType(unwrapped.baseType);
      const pgType = mapScalarType(scalarType, {});

      // Determine the actual type (not SERIAL/BIGSERIAL for FK references)
      let sqlType = pgType.sqlType;
      if (unwrapped.isAutoIncrement) {
        sqlType = scalarType === 'bigint' ? 'BIGINT' : 'INTEGER';
      }

      columns.push({
        columnName,
        sqlType,
        fieldName: prop.name,
        declarationIndex: pkDeclarationIndex++,
        explicitOrder: unwrapped.primaryKeyOrder,
        isAutoIncrement: unwrapped.isAutoIncrement,
        isOptional: prop.optional,
        isNullable: isNullable(unwrapped.baseType),
      });
    }
  }

  if (columns.length === 0) {
    return null;
  }

  // Sort by explicit order if provided, otherwise by declaration order
  columns.sort((a, b) => {
    const orderA = a.explicitOrder ?? a.declarationIndex;
    const orderB = b.explicitOrder ?? b.declarationIndex;
    return orderA - orderB;
  });

  const firstColumn = columns[0]!;
  return {
    columnName: firstColumn.columnName,
    sqlType: firstColumn.sqlType,
    columns,
    isComposite: columns.length > 1,
  };
}

/**
 * Convert a plural table name to singular for FK column naming.
 */
function singularize(tableName: string): string {
  // Simple singularization - handle common cases
  if (tableName.endsWith('ies')) {
    return tableName.slice(0, -3) + 'y';
  }
  if (tableName.endsWith('ses') || tableName.endsWith('xes') || tableName.endsWith('ches') || tableName.endsWith('shes')) {
    return tableName.slice(0, -2);
  }
  if (tableName.endsWith('s') && !tableName.endsWith('ss')) {
    return tableName.slice(0, -1);
  }
  return tableName;
}

/**
 * Generate a child table for a Normalize<T[]> field.
 */
function generateChildTable(info: ChildTableInfo): TableDefinition {
  const childTableName = `${info.parentTable}_${info.columnName}`;
  const parentFkColumn = `${singularize(info.parentTable)}_id`;

  const builder = new TableBuilder(childTableName);

  // Add id column (always BIGSERIAL for child tables)
  builder.column('id', col => col.bigserial().primaryKey());

  // Add parent foreign key column
  builder.column(parentFkColumn, col => {
    col.type(info.parentPkType).notNull();
  });

  // Add array index column
  builder.column('array_index', col => col.integer().notNull());

  // Add value column(s) based on element type
  const elementType = info.elementType;
  const scalarType = toScalarType(elementType);

  if (scalarType !== 'object' && elementType.kind !== 'reference') {
    // Primitive element - single 'value' column
    const pgType = mapScalarType(scalarType, {});
    builder.column('value', col => col.type(pgType.sqlType).notNull());
  } else {
    // Complex type - store as JSONB
    builder.column('value', col => col.jsonb().notNull());
  }

  // Add foreign key constraint
  builder.foreignKey(
    `${childTableName}_${parentFkColumn}_fkey`,
    [parentFkColumn],
    info.parentTable,
    [info.parentPkColumn],
    { onDelete: 'CASCADE' }
  );

  // Add index on parent FK for join performance
  builder.index(
    `${childTableName}_${parentFkColumn}_idx`,
    [parentFkColumn]
  );

  return builder.build();
}

/**
 * Options for schema generation.
 */
export interface SchemaGeneratorOptions {
  /** Schema name (default: 'public') */
  schemaName?: string;
  /** Schema version */
  version?: string;
  /** Type registry for resolving references (built from parsed files) */
  typeRegistry?: Map<string, PmtMessage>;
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
 * import { parseFiles } from '@propane/parser';
 * import { generateSchema } from '@propane/postgres';
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

  // Build type registry if not provided
  const typeRegistry = options.typeRegistry ?? buildTypeRegistry(files);

  // Collect all child tables to add after parent tables
  const allChildTables: TableDefinition[] = [];

  // Find all Table<{...}> types across all files
  for (const file of files) {
    for (const message of file.messages) {
      if (!message.isTableType) {
        continue; // Skip non-table types
      }

      const tableName = toTableName(message.name);
      const indexes: IndexDefinition[] = [];
      const pkInfo = findPrimaryKeyInfo(message);

      builder.table(tableName, tableBuilder => {
        const result = generateTable(
          tableBuilder,
          message,
          indexes,
          tableName,
          pkInfo,
          typeRegistry
        );
        allChildTables.push(...result.childTables);
      });
    }
  }

  // Add child tables to schema
  for (const childTable of allChildTables) {
    builder.table(childTable.name, tableBuilder => {
      // Copy the pre-built table definition
      tableBuilder.sourceType(childTable.sourceType ?? '');
      for (const [colName, colDef] of Object.entries(childTable.columns)) {
        tableBuilder.column(colName, col => {
          col.type(colDef.type);
          if (colDef.nullable) {
            col.nullable();
          } else {
            col.notNull();
          }
          if (colDef.isPrimaryKey) {
            col.primaryKey();
          }
          if (colDef.isUnique) {
            col.unique();
          }
          if (colDef.fieldNumber !== undefined) {
            col.fieldNumber(colDef.fieldNumber);
          }
        });
      }
      for (const fk of childTable.foreignKeys) {
        tableBuilder.foreignKey(
          fk.name,
          fk.columns,
          fk.referencedTable,
          fk.referencedColumns,
          { onDelete: fk.onDelete, onUpdate: fk.onUpdate }
        );
      }
      for (const idx of childTable.indexes) {
        tableBuilder.index(idx.name, idx.columns, { unique: idx.unique });
      }
    });
  }

  return builder.build();
}

/**
 * Build a type registry from parsed files for resolving type references.
 *
 * @param files - Parsed .pmsg files
 * @returns Map from type name to message definition
 */
export function buildTypeRegistry(files: PmtFile[]): Map<string, PmtMessage> {
  const registry = new Map<string, PmtMessage>();

  for (const file of files) {
    for (const message of file.messages) {
      registry.set(message.name, message);
    }
  }

  return registry;
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
 * Validation error codes.
 */
export type ValidationErrorCode =
  | 'INVALID_AUTO_TYPE'
  | 'AUTO_IN_COMPOSITE_PK'
  | 'MIXED_PK_ORDER'
  | 'PK_ORDER_MUST_START_AT_1'
  | 'PK_ORDER_NOT_SEQUENTIAL'
  | 'REFERENCES_COMPOSITE_PK'
  | 'NULLABLE_PRIMARY_KEY'
  | 'NORMALIZE_NOT_ARRAY'
  | 'DUPLICATE_FIELD_NUMBER'
  | 'REFERENCES_NOT_TABLE';

/**
 * A validation error from schema generation.
 */
export interface SchemaValidationError {
  /** Error code */
  code: ValidationErrorCode;
  /** Human-readable error message */
  message: string;
  /** Table/type name where the error occurred */
  table: string;
  /** Field name where the error occurred (if applicable) */
  field?: string;
}

/**
 * Result of validating a table message.
 */
export interface SchemaValidationResult {
  /** Whether the message is valid */
  valid: boolean;
  /** Validation errors (empty if valid) */
  errors: SchemaValidationError[];
}

/**
 * Internal struct for tracking PK field info during validation.
 */
interface PkFieldInfo {
  name: string;
  isAutoIncrement: boolean;
  primaryKeyOrder?: number;
  isOptional: boolean;
  isNullable: boolean;
}

/**
 * Validate a Table<{...}> message for schema generation.
 *
 * @param message - The message to validate
 * @param typeRegistry - Optional type registry for checking FK references
 * @returns Validation result with any errors
 */
export function validateTableMessage(
  message: PmtMessage,
  typeRegistry?: Map<string, PmtMessage>
): SchemaValidationResult {
  const errors: SchemaValidationError[] = [];
  const pkFields: PkFieldInfo[] = [];
  const fieldNumbers = new Map<number, string[]>();

  for (const prop of message.properties) {
    const unwrapped = unwrapDbWrappers(prop.type);

    // Check Auto<T> only on numeric types
    if (unwrapped.isAutoIncrement) {
      const baseScalar = toScalarType(unwrapped.baseType);
      if (!['number', 'bigint', 'int32'].includes(baseScalar)) {
        errors.push({
          code: 'INVALID_AUTO_TYPE',
          message: `Auto<T> only supports numeric types. Got: ${baseScalar}. Use PrimaryKey<Auto<bigint>> or PrimaryKey<Auto<number>> for auto-increment primary keys.`,
          table: message.name,
          field: prop.name,
        });
      }
    }

    // Track PK fields
    if (unwrapped.isPrimaryKey) {
      pkFields.push({
        name: prop.name,
        isAutoIncrement: unwrapped.isAutoIncrement,
        primaryKeyOrder: unwrapped.primaryKeyOrder,
        isOptional: prop.optional,
        isNullable: isNullable(unwrapped.baseType),
      });
    }

    // Check Normalize<T> requires array
    if (unwrapped.forceNormalize && unwrapped.baseType.kind !== 'array') {
      errors.push({
        code: 'NORMALIZE_NOT_ARRAY',
        message: `Normalize<T> requires an array type`,
        table: message.name,
        field: prop.name,
      });
    }

    // Check References<T> references a Table type (if registry available)
    if (unwrapped.foreignKey && typeRegistry) {
      const refMessage = typeRegistry.get(unwrapped.foreignKey.referencedType);
      if (refMessage) {
        if (!refMessage.isTableType) {
          errors.push({
            code: 'REFERENCES_NOT_TABLE',
            message: `References<T> requires a Table type, got Message type: ${unwrapped.foreignKey.referencedType}`,
            table: message.name,
            field: prop.name,
          });
        } else {
          // Check if referenced table has composite PK
          const refPkInfo = findPrimaryKeyInfo(refMessage);
          if (refPkInfo && refPkInfo.isComposite) {
            errors.push({
              code: 'REFERENCES_COMPOSITE_PK',
              message: `Cannot use References<T> to reference table '${refMessage.name}' which has a composite primary key. Define separate FK columns instead.`,
              table: message.name,
              field: prop.name,
            });
          }
        }
      }
    }

    // Track field numbers for duplicates
    if (prop.fieldNumber !== null) {
      const existing = fieldNumbers.get(prop.fieldNumber) ?? [];
      existing.push(prop.name);
      fieldNumbers.set(prop.fieldNumber, existing);
    }
  }

  // Validate nullable PK columns
  for (const pkField of pkFields) {
    if (pkField.isOptional || pkField.isNullable) {
      errors.push({
        code: 'NULLABLE_PRIMARY_KEY',
        message: `Primary key column '${pkField.name}' cannot be nullable`,
        table: message.name,
        field: pkField.name,
      });
    }
  }

  // Composite PK validations (only if more than 1 PK field)
  if (pkFields.length > 1) {
    // Auto<T> not allowed in composite PK
    for (const pkField of pkFields) {
      if (pkField.isAutoIncrement) {
        errors.push({
          code: 'AUTO_IN_COMPOSITE_PK',
          message: `Auto<T> cannot be used in composite primary key`,
          table: message.name,
          field: pkField.name,
        });
      }
    }

    // Check for mixed implicit/explicit ordering
    const withOrder = pkFields.filter(f => f.primaryKeyOrder !== undefined);
    const withoutOrder = pkFields.filter(f => f.primaryKeyOrder === undefined);
    if (withOrder.length > 0 && withoutOrder.length > 0) {
      errors.push({
        code: 'MIXED_PK_ORDER',
        message: `Cannot mix implicit and explicit PrimaryKey ordering. Either all PrimaryKey fields must have an order parameter, or none. Fields with order: ${withOrder.map(f => f.name).join(', ')}. Fields without: ${withoutOrder.map(f => f.name).join(', ')}.`,
        table: message.name,
      });
    }

    // Validate explicit ordering (only if all explicit)
    if (withOrder.length === pkFields.length && withOrder.length > 0) {
      const orders = withOrder.map(f => f.primaryKeyOrder!).sort((a, b) => a - b);

      // Must start with 1
      if (orders[0] !== 1) {
        errors.push({
          code: 'PK_ORDER_MUST_START_AT_1',
          message: `PrimaryKey order must start at 1, got: ${orders[0]}`,
          table: message.name,
        });
      }

      // Must be sequential (no gaps or duplicates)
      for (let i = 0; i < orders.length; i++) {
        if (orders[i] !== i + 1) {
          errors.push({
            code: 'PK_ORDER_NOT_SEQUENTIAL',
            message: `PrimaryKey order must be sequential starting at 1. Expected ${i + 1}, got: ${orders[i]}`,
            table: message.name,
          });
          break;
        }
      }
    }
  }

  // Check for duplicate field numbers
  for (const [num, fields] of fieldNumbers) {
    if (fields.length > 1) {
      errors.push({
        code: 'DUPLICATE_FIELD_NUMBER',
        message: `Duplicate field number ${num}: ${fields.join(', ')}`,
        table: message.name,
      });
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validate all Table<{...}> messages in the given files.
 *
 * @param files - Parsed .pmsg files
 * @returns Combined validation result
 */
export function validateSchema(files: PmtFile[]): SchemaValidationResult {
  const allErrors: SchemaValidationError[] = [];
  const typeRegistry = buildTypeRegistry(files);

  for (const file of files) {
    for (const message of file.messages) {
      if (message.isTableType) {
        const result = validateTableMessage(message, typeRegistry);
        allErrors.push(...result.errors);
      }
    }
  }

  return {
    valid: allErrors.length === 0,
    errors: allErrors,
  };
}

/**
 * Result of generating a table definition, including any child tables.
 */
export interface GenerateTableDefinitionResult {
  /** The main table definition */
  table: TableDefinition;
  /** Any child tables generated from Normalize<T[]> fields */
  childTables: TableDefinition[];
}

/**
 * Generate a single table definition from a message.
 *
 * @param message - A Table<{...}> message
 * @param typeRegistry - Optional type registry for resolving FK references
 * @returns The table definition and any child tables
 */
export function generateTableDefinition(
  message: PmtMessage,
  typeRegistry?: Map<string, PmtMessage>
): GenerateTableDefinitionResult {
  const tableName = toTableName(message.name);
  const tableBuilder = new TableBuilder(tableName);
  const indexes: IndexDefinition[] = [];
  const pkInfo = findPrimaryKeyInfo(message);

  const result = generateTable(
    tableBuilder,
    message,
    indexes,
    tableName,
    pkInfo,
    typeRegistry
  );

  return {
    table: tableBuilder.build(),
    childTables: result.childTables,
  };
}
