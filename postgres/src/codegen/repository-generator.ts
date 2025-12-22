/**
 * Repository Generator
 *
 * Generates typed repository classes from Table<{...}> types.
 * Each generated repository extends BaseRepository with pre-configured
 * table metadata, eliminating manual configuration.
 */

import type { PmtFile, PmtMessage } from '@/tools/parser/types.js';
import type { DatabaseSchema, TableDefinition, RelationInfo } from '../schema/types.js';
import { discoverRelations } from './relation-discovery.js';
import { pluralize } from '@/common/strings/pluralize.js';

/**
 * Options for repository generation.
 */
export interface RepositoryGeneratorOptions {
  /** Schema name (default: 'public') */
  schemaName?: string;
  /** Import path for @propane/postgres (default: '@propane/postgres') */
  postgresImport?: string;
  /** Import path prefix for source types (e.g., '../models') */
  typesImportPrefix?: string;
  /** Whether to generate a barrel export file (default: true) */
  generateBarrel?: boolean;
  /** Whether to generate relation methods (default: true) */
  generateRelations?: boolean;
}

/**
 * A generated repository file.
 */
export interface GeneratedRepository {
  /** The TypeScript source code */
  source: string;
  /** The output filename (without extension) */
  filename: string;
  /** The repository class name */
  className: string;
  /** The source type name from .pmsg file */
  sourceType: string;
  /** The table name in the database */
  tableName: string;
}

/**
 * Result of repository generation.
 */
export interface RepositoryGeneratorResult {
  /** Generated repository files */
  repositories: GeneratedRepository[];
  /** Barrel export file content (if generateBarrel is true) */
  barrelExport?: string;
}

/**
 * Info about a table for repository generation.
 */
interface TableInfo {
  message: PmtMessage;
  table: TableDefinition;
  tableName: string;
}

/**
 * Convert PascalCase to kebab-case.
 */
function toKebabCase(str: string): string {
  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1-$2')
    .toLowerCase();
}

/**
 * Convert a type name to a repository class name.
 * User -> UserRepository
 */
function toRepositoryClassName(typeName: string): string {
  return `${typeName}Repository`;
}

/**
 * Convert a type name to a repository filename.
 * User -> user-repository
 */
function toRepositoryFilename(typeName: string): string {
  return `${toKebabCase(typeName)}-repository`;
}

/**
 * Find the primary key column(s) for a table.
 * Returns string for single-column PK, string[] for composite PK, null if no PK.
 */
function findPrimaryKeyColumns(table: TableDefinition): string | string[] | null {
  // First check the table.primaryKey array (most reliable source)
  if (table.primaryKey && table.primaryKey.length > 0) {
    if (table.primaryKey.length === 1) {
      return table.primaryKey[0]!;
    }
    return table.primaryKey;
  }

  // Fallback: check individual columns (for backwards compat)
  const pkCols: string[] = [];
  for (const [colName, col] of Object.entries(table.columns)) {
    if (col.isPrimaryKey) {
      pkCols.push(colName);
    }
  }

  if (pkCols.length === 0) return null;
  if (pkCols.length === 1) return pkCols[0]!;
  return pkCols;
}

/**
 * Normalize PostgreSQL column types for the serializer.
 * SERIAL -> INTEGER, BIGSERIAL -> BIGINT, etc.
 */
function normalizeColumnType(type: string): string {
  const upper = type.toUpperCase();
  if (upper === 'SERIAL') return 'INTEGER';
  if (upper === 'BIGSERIAL') return 'BIGINT';
  if (upper.startsWith('VARCHAR')) return 'TEXT';
  if (upper.startsWith('CHAR(')) return 'TEXT';
  // Keep NUMERIC/DECIMAL with precision
  return upper;
}

/**
 * Build the column types map from a table definition.
 */
function buildColumnTypes(table: TableDefinition): Record<string, string> {
  const types: Record<string, string> = {};
  for (const [colName, col] of Object.entries(table.columns)) {
    types[colName] = normalizeColumnType(col.type);
  }
  return types;
}

/**
 * Convert snake_case to camelCase.
 */
function toCamelCase(str: string): string {
  return str.replace(/_([a-z])/g, (_, c: string) => c.toUpperCase());
}

/**
 * Generate relation methods for a repository.
 */
function generateRelationMethods(
  info: TableInfo,
  schema: DatabaseSchema,
  _options: RepositoryGeneratorOptions
): { methods: string; imports: Set<string>; needsDeserializeValue: boolean } {
  const relations = discoverRelations(schema, info.tableName);
  const imports = new Set<string>();
  const methods: string[] = [];
  let needsDeserializeValue = false;

  for (const rel of relations) {
    // Track imports needed for related types
    imports.add(rel.targetType);
    needsDeserializeValue = true;

    const targetTable = schema.tables[rel.targetTable];
    if (!targetTable) continue;

    const targetColumnTypes = buildColumnTypes(targetTable);

    if (rel.type === 'belongs_to') {
      methods.push(generateBelongsToMethod(info, rel, targetColumnTypes));
    } else {
      methods.push(generateHasManyMethod(info, rel, targetColumnTypes));
    }
  }

  return { methods: methods.join('\n'), imports, needsDeserializeValue };
}

/**
 * Generate a belongs-to relation method.
 */
function generateBelongsToMethod(
  info: TableInfo,
  rel: RelationInfo,
  targetColumnTypes: Record<string, string>
): string {
  // Convert local columns to camelCase for entity access
  const localColumnsCamel = rel.localColumns.map(toCamelCase);
  const valuesExpr = localColumnsCamel.map((c) => `entity.${c}`).join(', ');

  // Format target columns as array literal
  const targetColsLiteral = rel.targetColumns.map((c) => `'${c}'`).join(', ');

  // Format column types as object literal
  const columnTypesLiteral = JSON.stringify(targetColumnTypes);

  return `
  /**
   * Get the related ${rel.targetType} for this ${info.message.name}.
   * Follows FK: ${rel.localColumns.join(', ')} -> ${rel.targetTable}(${rel.targetColumns.join(', ')})
   */
  async ${rel.methodName}(entity: Partial<${info.message.name}>): Promise<${rel.targetType} | null> {
    const row = await this.queryRelatedOne(
      '${rel.targetTable}',
      [${targetColsLiteral}],
      [${valuesExpr}],
      ${columnTypesLiteral}
    );
    return row ? this.deserializeAs${rel.targetType}(row) : null;
  }`;
}

/**
 * Generate a has-many relation method.
 */
function generateHasManyMethod(
  info: TableInfo,
  rel: RelationInfo,
  targetColumnTypes: Record<string, string>
): string {
  // Convert local columns to camelCase for entity access
  const localColumnsCamel = rel.localColumns.map(toCamelCase);
  const valuesExpr = localColumnsCamel.map((c) => `entity.${c}`).join(', ');

  // Format target columns as array literal
  const targetColsLiteral = rel.targetColumns.map((c) => `'${c}'`).join(', ');

  // Format column types as object literal
  const columnTypesLiteral = JSON.stringify(targetColumnTypes);

  return `
  /**
   * Get all ${rel.targetType} records related to this ${info.message.name}.
   * Reverse FK: ${rel.targetTable}(${rel.targetColumns.join(', ')}) -> ${rel.localColumns.join(', ')}
   */
  async ${rel.methodName}(entity: Partial<${info.message.name}>): Promise<${rel.targetType}[]> {
    const rows = await this.queryRelatedMany(
      '${rel.targetTable}',
      [${targetColsLiteral}],
      [${valuesExpr}],
      ${columnTypesLiteral}
    );
    return rows.map((row) => this.deserializeAs${rel.targetType}(row));
  }`;
}

/**
 * Generate deserialize helper methods for related types.
 */
function generateDeserializeHelpers(
  relations: RelationInfo[],
  schema: DatabaseSchema
): string {
  const seen = new Set<string>();
  const helpers: string[] = [];

  for (const rel of relations) {
    // Skip if we've already generated a helper for this type
    if (seen.has(rel.targetType)) continue;
    seen.add(rel.targetType);

    const targetTable = schema.tables[rel.targetTable];
    if (!targetTable) continue;

    const columns = Object.keys(targetTable.columns);
    const columnTypes = buildColumnTypes(targetTable);

    // Generate property assignments
    const assignments = columns.map((col) => {
      const camelKey = toCamelCase(col);
      const colType = columnTypes[col] ?? 'TEXT';
      return `      ${camelKey}: deserializeValue(row['${col}'], '${colType}'),`;
    });

    helpers.push(`
  /**
   * Deserialize a row from the '${rel.targetTable}' table to ${rel.targetType}.
   */
  private deserializeAs${rel.targetType}(row: Record<string, unknown>): ${rel.targetType} {
    return new ${rel.targetType}({
${assignments.join('\n')}
    });
  }`);
  }

  return helpers.join('\n');
}

/**
 * Generate the TypeScript source code for a single repository.
 */
function generateRepositorySource(
  info: TableInfo,
  schema: DatabaseSchema,
  options: RepositoryGeneratorOptions
): string {
  const { message, table, tableName } = info;
  const className = toRepositoryClassName(message.name);
  const postgresImport = options.postgresImport ?? '@propane/postgres';
  const schemaName = options.schemaName ?? 'public';

  const columns = Object.keys(table.columns);
  const columnTypes = buildColumnTypes(table);
  const primaryKey = findPrimaryKeyColumns(table);

  // Generate relation methods if enabled and typesImportPrefix is set
  const shouldGenerateRelations =
    options.generateRelations !== false && options.typesImportPrefix;

  let relationMethods = '';
  let deserializeHelpers = '';
  const relatedTypeImports = new Set<string>();
  let needsDeserializeValue = false;

  if (shouldGenerateRelations) {
    const relations = discoverRelations(schema, tableName);
    if (relations.length > 0) {
      const generated = generateRelationMethods(info, schema, options);
      relationMethods = generated.methods;
      needsDeserializeValue = generated.needsDeserializeValue;

      for (const typeName of generated.imports) {
        relatedTypeImports.add(typeName);
      }

      deserializeHelpers = generateDeserializeHelpers(relations, schema);
    }
  }

  // Build imports
  const baseImports = needsDeserializeValue
    ? `import { BaseRepository, deserializeValue } from '${postgresImport}';`
    : `import { BaseRepository } from '${postgresImport}';`;

  const imports = [
    baseImports,
    `import type { Connection, Pool, PoolClient, Transaction } from '${postgresImport}';`,
  ];

  // Add type import if we have a types import prefix
  if (options.typesImportPrefix) {
    // Convert PascalCase type name to kebab-case file name
    const typeFilename = toKebabCase(message.name);

    // If this type is also a related type (self-referencing FK), use value import for instantiation
    const selfIsRelated = relatedTypeImports.has(message.name);
    if (selfIsRelated) {
      imports.push(
        `import { ${message.name} } from '${options.typesImportPrefix}/${typeFilename}.pmsg.js';`
      );
    } else {
      imports.push(
        `import type { ${message.name} } from '${options.typesImportPrefix}/${typeFilename}.pmsg.js';`
      );
    }

    // Add VALUE imports for related types (not type-only) because we instantiate them with `new`
    for (const relatedType of relatedTypeImports) {
      if (relatedType !== message.name) {
        // Don't import self twice
        const relatedFilename = toKebabCase(relatedType);
        imports.push(
          `import { ${relatedType} } from '${options.typesImportPrefix}/${relatedFilename}.pmsg.js';`
        );
      }
    }
  }

  // Build column types object literal
  const columnTypesLiteral = Object.entries(columnTypes)
    .map(([col, type]) => `    ${col}: '${type}',`)
    .join('\n');

  // Build columns array literal
  const columnsLiteral = columns.map((c) => `'${c}'`).join(', ');

  // Generate warning comment if no primary key
  const pkWarning = primaryKey
    ? ''
    : `
/**
 * WARNING: This table has no primary key defined.
 * Methods like findById() will not work correctly.
 */`;

  // Format primary key for TypeScript - string or string[]
  let primaryKeyLiteral: string;
  if (primaryKey === null) {
    primaryKeyLiteral = "''";
  } else if (Array.isArray(primaryKey)) {
    primaryKeyLiteral = `[${primaryKey.map((k) => `'${k}'`).join(', ')}]`;
  } else {
    primaryKeyLiteral = `'${primaryKey}'`;
  }

  // Build the type parameter - use intersection with Record for BaseRepository constraint
  const typeParam = options.typesImportPrefix
    ? `${message.name} & Record<string, unknown>`
    : 'Record<string, unknown>';

  const source = `${imports.join('\n')}
${pkWarning}
/**
 * Repository for the '${tableName}' table.
 * Generated from Table type: ${message.name}
 */
export class ${className} extends BaseRepository<${typeParam}> {
  constructor(
    connection: Connection | Pool | PoolClient | Transaction,
    schemaName = '${schemaName}'
  ) {
    super(connection, {
      tableName: '${tableName}',
      schemaName,
      primaryKey: ${primaryKeyLiteral},
      columns: [${columnsLiteral}],
      columnTypes: {
${columnTypesLiteral}
      },
    });
  }
${relationMethods}
${deserializeHelpers}
}
`;

  return source;
}

/**
 * Generate a barrel export file that re-exports all repositories.
 */
function generateBarrelExport(repositories: GeneratedRepository[]): string {
  const exports = repositories
    .map(repo => `export { ${repo.className} } from './${repo.filename}.js';`)
    .join('\n');

  return `/**
 * Generated repository exports.
 * Re-exports all repository classes for convenient importing.
 */

${exports}
`;
}

/**
 * Convert a type name to snake_case table name (pluralized).
 */
function toTableName(typeName: string): string {
  // First pluralize, then convert to snake_case
  const plural = pluralize(typeName);
  return plural
    .replace(/([a-z])([A-Z])/g, '$1_$2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1_$2')
    .toLowerCase();
}

/**
 * Find all Table<{...}> types and match them with generated schema tables.
 */
function findTableInfos(
  files: PmtFile[],
  schema: DatabaseSchema
): TableInfo[] {
  const infos: TableInfo[] = [];

  for (const file of files) {
    for (const message of file.messages) {
      if (!message.isTableType) {
        continue;
      }

      const tableName = toTableName(message.name);
      const table = schema.tables[tableName];

      if (table) {
        infos.push({ message, table, tableName });
      }
    }
  }

  return infos;
}

/**
 * Generate repository classes from parsed .pmsg files and schema.
 *
 * @param files - Parsed .pmsg files containing Table<{...}> types
 * @param schema - Generated database schema
 * @param options - Generation options
 * @returns Generated repository files and optional barrel export
 *
 * @example
 * ```typescript
 * import { parseFiles } from '@propane/parser';
 * import { generateSchema, generateRepositories } from '@propane/postgres';
 *
 * const { files } = parseFiles(['./src/models/*.pmsg']);
 * const schema = generateSchema(files);
 * const result = generateRepositories(files, schema, {
 *   typesImportPrefix: '../models',
 * });
 *
 * // Write generated files
 * for (const repo of result.repositories) {
 *   fs.writeFileSync(`./generated/${repo.filename}.ts`, repo.source);
 * }
 * ```
 */
export function generateRepositories(
  files: PmtFile[],
  schema: DatabaseSchema,
  options: RepositoryGeneratorOptions = {}
): RepositoryGeneratorResult {
  const tableInfos = findTableInfos(files, schema);
  const repositories: GeneratedRepository[] = [];

  for (const info of tableInfos) {
    const source = generateRepositorySource(info, schema, options);
    const filename = toRepositoryFilename(info.message.name);
    const className = toRepositoryClassName(info.message.name);

    repositories.push({
      source,
      filename,
      className,
      sourceType: info.message.name,
      tableName: info.tableName,
    });
  }

  // Sort by class name for consistent output
  repositories.sort((a, b) => a.className.localeCompare(b.className));

  const result: RepositoryGeneratorResult = { repositories };

  // Generate barrel export if requested (default: true)
  if (options.generateBarrel !== false && repositories.length > 0) {
    result.barrelExport = generateBarrelExport(repositories);
  }

  return result;
}

/**
 * Generate a single repository class for a table.
 *
 * @param message - A Table<{...}> message definition
 * @param table - The corresponding table definition from schema
 * @param schema - The full database schema (needed for relation discovery)
 * @param options - Generation options
 * @returns Generated repository file
 */
export function generateRepository(
  message: PmtMessage,
  table: TableDefinition,
  schema: DatabaseSchema,
  options: RepositoryGeneratorOptions = {}
): GeneratedRepository {
  const tableName = toTableName(message.name);
  const info: TableInfo = { message, table, tableName };

  const source = generateRepositorySource(info, schema, options);
  const filename = toRepositoryFilename(message.name);
  const className = toRepositoryClassName(message.name);

  return {
    source,
    filename,
    className,
    sourceType: message.name,
    tableName,
  };
}
