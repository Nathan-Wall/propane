/**
 * Database schema introspector for PostgreSQL.
 *
 * Reads the current schema from a live PostgreSQL database,
 * returning a DatabaseSchema that can be compared with the
 * desired schema from .pmsg files.
 */

import type { Connection, QueryResult } from '../connection/connection.js';
import type {
  DatabaseSchema,
  TableDefinition,
  ColumnDefinition,
  IndexDefinition,
  ForeignKeyDefinition,
  CheckConstraint,
  ForeignKeyAction,
} from '../schema/types.js';

/**
 * Interface for objects that can execute SQL queries.
 * Both Connection and Pool satisfy this interface.
 */
export interface Queryable {
  execute<T = Record<string, unknown>>(
    query: string,
    params?: unknown[]
  ): Promise<QueryResult<T>>;
}

/**
 * Options for database introspection.
 */
export interface IntrospectionOptions {
  /** Tables to include (if not specified, all tables are included) */
  includeTables?: string[];
  /** Tables to exclude */
  excludeTables?: string[];
  /** Whether to include system tables (default: false) */
  includeSystemTables?: boolean;
}

/**
 * Row type for table query.
 */
interface TableRow {
  table_name: string;
}

/**
 * Row type for column query.
 */
interface ColumnRow {
  column_name: string;
  data_type: string;
  udt_name: string;
  is_nullable: string;
  column_default: string | null;
  character_maximum_length: number | null;
  numeric_precision: number | null;
  numeric_scale: number | null;
}

/**
 * Row type for primary key query.
 */
interface PrimaryKeyRow {
  table_name: string;
  column_name: string;
}

/**
 * Row type for index query.
 */
interface IndexRow {
  indexname: string;
  indexdef: string;
}

/**
 * Row type for foreign key query.
 */
interface ForeignKeyRow {
  constraint_name: string;
  column_name: string;
  foreign_table_name: string;
  foreign_column_name: string;
  delete_rule: string;
  update_rule: string;
}

/**
 * Row type for check constraint query.
 */
interface CheckConstraintRow {
  constraint_name: string;
  check_clause: string;
}

/**
 * Row type for unique constraint query.
 */
interface UniqueConstraintRow {
  table_name: string;
  column_name: string;
  constraint_name: string;
}

/**
 * Introspect a PostgreSQL database schema.
 *
 * @param queryable - Database connection or pool that can execute queries
 * @param schemaName - Schema name to introspect (default: 'public')
 * @param options - Introspection options
 * @returns The database schema
 */
export async function introspectDatabase(
  queryable: Queryable,
  schemaName = 'public',
  options: IntrospectionOptions = {}
): Promise<DatabaseSchema> {
  // Get all tables in the schema
  const tables = await getTables(queryable, schemaName, options);

  // Get primary keys for all tables at once
  const primaryKeys = await getPrimaryKeys(queryable, schemaName);

  // Get unique constraints for all tables at once
  const uniqueConstraints = await getUniqueConstraints(queryable, schemaName);

  // Build table definitions
  const tableDefinitions: Record<string, TableDefinition> = {};

  for (const tableName of tables) {
    const columns = await getColumns(queryable, schemaName, tableName);
    const indexes = await getIndexes(queryable, schemaName, tableName);
    const foreignKeys = await getForeignKeys(queryable, schemaName, tableName);
    const checkConstraints = await getCheckConstraints(queryable, schemaName, tableName);

    const pkColumns = primaryKeys
      .filter(pk => pk.table_name === tableName)
      .map(pk => pk.column_name);

    const uniqueCols = new Set(
      uniqueConstraints
        .filter(uc => uc.table_name === tableName)
        .map(uc => uc.column_name)
    );

    const columnDefs: Record<string, ColumnDefinition> = {};
    for (const col of columns) {
      columnDefs[col.column_name] = {
        name: col.column_name,
        type: normalizeDataType(col),
        nullable: col.is_nullable === 'YES',
        defaultValue: col.column_default ?? undefined,
        isPrimaryKey: pkColumns.includes(col.column_name),
        isUnique: uniqueCols.has(col.column_name),
        isAutoIncrement: isAutoIncrement(col),
      };
    }

    // Filter out primary key indexes (PostgreSQL auto-creates them)
    const filteredIndexes = indexes.filter(
      idx => !idx.indexname.endsWith('_pkey')
    );

    tableDefinitions[tableName] = {
      name: tableName,
      columns: columnDefs,
      primaryKey: pkColumns,
      indexes: filteredIndexes.map(parseIndexDefinition),
      foreignKeys: groupForeignKeys(foreignKeys),
      checkConstraints: checkConstraints.map(cc => ({
        name: cc.constraint_name,
        expression: cc.check_clause,
      })),
    };
  }

  return {
    schemaName,
    tables: tableDefinitions,
  };
}

/**
 * Get all tables in a schema.
 */
async function getTables(
  queryable: Queryable,
  schemaName: string,
  options: IntrospectionOptions
): Promise<string[]> {
  const result = await queryable.execute<TableRow>(
    `SELECT table_name
     FROM information_schema.tables
     WHERE table_schema = $1
       AND table_type = 'BASE TABLE'
     ORDER BY table_name`,
    [schemaName]
  );

  let tables = result.map(row => row.table_name);

  // Filter by include/exclude lists
  if (options.includeTables?.length) {
    const includeSet = new Set(options.includeTables);
    tables = tables.filter(t => includeSet.has(t));
  }

  if (options.excludeTables?.length) {
    const excludeSet = new Set(options.excludeTables);
    tables = tables.filter(t => !excludeSet.has(t));
  }

  // Exclude system tables by default
  if (!options.includeSystemTables) {
    tables = tables.filter(t => !t.startsWith('_'));
  }

  return tables;
}

/**
 * Get all columns for a table.
 */
async function getColumns(
  queryable: Queryable,
  schemaName: string,
  tableName: string
): Promise<ColumnRow[]> {
  const result = await queryable.execute<ColumnRow>(
    `SELECT column_name, data_type, udt_name, is_nullable, column_default,
            character_maximum_length, numeric_precision, numeric_scale
     FROM information_schema.columns
     WHERE table_schema = $1 AND table_name = $2
     ORDER BY ordinal_position`,
    [schemaName, tableName]
  );

  return [...result];
}

/**
 * Get primary keys for all tables in a schema.
 */
async function getPrimaryKeys(
  queryable: Queryable,
  schemaName: string
): Promise<PrimaryKeyRow[]> {
  const result = await queryable.execute<PrimaryKeyRow>(
    `SELECT tc.table_name, kcu.column_name
     FROM information_schema.table_constraints tc
     JOIN information_schema.key_column_usage kcu
       ON tc.constraint_name = kcu.constraint_name
       AND tc.table_schema = kcu.table_schema
     WHERE tc.constraint_type = 'PRIMARY KEY'
       AND tc.table_schema = $1
     ORDER BY tc.table_name, kcu.ordinal_position`,
    [schemaName]
  );

  return [...result];
}

/**
 * Get unique constraints for all tables in a schema.
 */
async function getUniqueConstraints(
  queryable: Queryable,
  schemaName: string
): Promise<UniqueConstraintRow[]> {
  const result = await queryable.execute<UniqueConstraintRow>(
    `SELECT tc.table_name, kcu.column_name, tc.constraint_name
     FROM information_schema.table_constraints tc
     JOIN information_schema.key_column_usage kcu
       ON tc.constraint_name = kcu.constraint_name
       AND tc.table_schema = kcu.table_schema
     WHERE tc.constraint_type = 'UNIQUE'
       AND tc.table_schema = $1`,
    [schemaName]
  );

  return [...result];
}

/**
 * Get indexes for a table.
 */
async function getIndexes(
  queryable: Queryable,
  schemaName: string,
  tableName: string
): Promise<IndexRow[]> {
  const result = await queryable.execute<IndexRow>(
    `SELECT indexname, indexdef
     FROM pg_indexes
     WHERE schemaname = $1 AND tablename = $2`,
    [schemaName, tableName]
  );

  return [...result];
}

/**
 * Get foreign keys for a table.
 */
async function getForeignKeys(
  queryable: Queryable,
  schemaName: string,
  tableName: string
): Promise<ForeignKeyRow[]> {
  const result = await queryable.execute<ForeignKeyRow>(
    `SELECT
       tc.constraint_name,
       kcu.column_name,
       ccu.table_name AS foreign_table_name,
       ccu.column_name AS foreign_column_name,
       rc.delete_rule,
       rc.update_rule
     FROM information_schema.table_constraints tc
     JOIN information_schema.key_column_usage kcu
       ON tc.constraint_name = kcu.constraint_name
       AND tc.table_schema = kcu.table_schema
     JOIN information_schema.constraint_column_usage ccu
       ON ccu.constraint_name = tc.constraint_name
       AND ccu.table_schema = tc.table_schema
     JOIN information_schema.referential_constraints rc
       ON rc.constraint_name = tc.constraint_name
       AND rc.constraint_schema = tc.table_schema
     WHERE tc.constraint_type = 'FOREIGN KEY'
       AND tc.table_schema = $1
       AND tc.table_name = $2
     ORDER BY tc.constraint_name, kcu.ordinal_position`,
    [schemaName, tableName]
  );

  return [...result];
}

/**
 * Get check constraints for a table.
 */
async function getCheckConstraints(
  queryable: Queryable,
  schemaName: string,
  tableName: string
): Promise<CheckConstraintRow[]> {
  const result = await queryable.execute<CheckConstraintRow>(
    `SELECT cc.constraint_name, cc.check_clause
     FROM information_schema.check_constraints cc
     JOIN information_schema.table_constraints tc
       ON cc.constraint_name = tc.constraint_name
       AND cc.constraint_schema = tc.table_schema
     WHERE tc.table_schema = $1
       AND tc.table_name = $2
       AND tc.constraint_type = 'CHECK'
       AND cc.constraint_name NOT LIKE '%_not_null'`,
    [schemaName, tableName]
  );

  return [...result];
}

/**
 * Normalize PostgreSQL data type to our standard format.
 */
function normalizeDataType(col: ColumnRow): string {
  const { data_type, udt_name, character_maximum_length, numeric_precision, numeric_scale } = col;

  // Handle special PostgreSQL types
  switch (udt_name) {
    case 'int4':
      return 'INTEGER';
    case 'int8':
      return 'BIGINT';
    case 'int2':
      return 'SMALLINT';
    case 'float4':
      return 'REAL';
    case 'float8':
      return 'DOUBLE PRECISION';
    case 'bool':
      return 'BOOLEAN';
    case 'timestamptz':
      return 'TIMESTAMPTZ';
    case 'timestamp':
      return 'TIMESTAMP';
    case 'jsonb':
      return 'JSONB';
    case 'json':
      return 'JSON';
    case 'bytea':
      return 'BYTEA';
    case 'uuid':
      return 'UUID';
    case 'text':
      return 'TEXT';
  }

  // Handle varchar with length
  if (data_type === 'character varying') {
    if (character_maximum_length) {
      return `VARCHAR(${character_maximum_length})`;
    }
    return 'VARCHAR';
  }

  // Handle numeric with precision/scale
  if (data_type === 'numeric') {
    if (numeric_precision !== null && numeric_scale !== null) {
      return `NUMERIC(${numeric_precision},${numeric_scale})`;
    }
    if (numeric_precision !== null) {
      return `NUMERIC(${numeric_precision})`;
    }
    return 'NUMERIC';
  }

  // Default: uppercase the data type
  return data_type.toUpperCase();
}

/**
 * Check if a column uses auto-increment (SERIAL/BIGSERIAL).
 */
function isAutoIncrement(col: ColumnRow): boolean {
  if (!col.column_default) return false;

  // PostgreSQL SERIAL columns have a default like: nextval('table_column_seq'::regclass)
  return col.column_default.includes('nextval(');
}

/**
 * Parse an index definition from pg_indexes.
 */
function parseIndexDefinition(row: IndexRow): IndexDefinition {
  const { indexname, indexdef } = row;

  // Example indexdef: CREATE UNIQUE INDEX users_email_idx ON public.users USING btree (email)
  const isUnique = indexdef.toUpperCase().includes('UNIQUE');

  // Extract method (btree, hash, gin, gist, etc.)
  const methodMatch = indexdef.match(/USING\s+(\w+)/i);
  const method = methodMatch?.[1]?.toLowerCase() ?? 'btree';

  // Extract columns
  const colMatch = indexdef.match(/\(([^)]+)\)/);
  const columns = colMatch?.[1]
    ? colMatch[1].split(',').map(c => c.trim().replace(/"/g, ''))
    : [];

  // Extract WHERE clause for partial indexes
  const whereMatch = indexdef.match(/WHERE\s+(.+)$/i);
  const where = whereMatch ? whereMatch[1] : undefined;

  return {
    name: indexname,
    columns,
    unique: isUnique,
    method: method !== 'btree' ? method : undefined,
    where,
  };
}

/**
 * Group foreign key rows by constraint name into ForeignKeyDefinition objects.
 */
function groupForeignKeys(rows: ForeignKeyRow[]): ForeignKeyDefinition[] {
  const grouped = new Map<string, ForeignKeyDefinition>();

  for (const row of rows) {
    const existing = grouped.get(row.constraint_name);
    if (existing) {
      existing.columns.push(row.column_name);
      existing.referencedColumns.push(row.foreign_column_name);
    } else {
      grouped.set(row.constraint_name, {
        name: row.constraint_name,
        columns: [row.column_name],
        referencedTable: row.foreign_table_name,
        referencedColumns: [row.foreign_column_name],
        onDelete: mapForeignKeyAction(row.delete_rule),
        onUpdate: mapForeignKeyAction(row.update_rule),
      });
    }
  }

  return Array.from(grouped.values());
}

/**
 * Map PostgreSQL foreign key action string to our ForeignKeyAction type.
 */
function mapForeignKeyAction(action: string): ForeignKeyAction {
  switch (action.toUpperCase()) {
    case 'CASCADE':
      return 'CASCADE';
    case 'SET NULL':
      return 'SET NULL';
    case 'SET DEFAULT':
      return 'SET DEFAULT';
    case 'RESTRICT':
      return 'RESTRICT';
    default:
      return 'NO ACTION';
  }
}
