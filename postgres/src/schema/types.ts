/**
 * Schema definition types for Propane PostgreSQL.
 *
 * These types represent the structure of a PostgreSQL database schema
 * as derived from Propane .pmsg files.
 */

/**
 * A database schema containing tables and their relationships.
 */
export interface DatabaseSchema {
  /** Schema name (e.g., 'public', 'feature_branch') */
  schemaName: string;
  /** Tables in the schema */
  tables: Record<string, TableDefinition>;
  /** Version/timestamp for migration tracking */
  version?: string;
}

/**
 * Definition of a database table.
 */
export interface TableDefinition {
  /** Table name */
  name: string;
  /** Columns in the table */
  columns: Record<string, ColumnDefinition>;
  /** Primary key column(s) */
  primaryKey: string[];
  /** Indexes on the table */
  indexes: IndexDefinition[];
  /** Foreign key constraints */
  foreignKeys: ForeignKeyDefinition[];
  /** Check constraints */
  checkConstraints: CheckConstraint[];
  /** The Propane message type name this table was generated from */
  sourceType?: string;
  /** Field number mappings for rename detection */
  fieldNumbers?: Record<string, number>;
}

/**
 * Definition of a table column.
 */
export interface ColumnDefinition {
  /** Column name */
  name: string;
  /** PostgreSQL data type */
  type: string;
  /** Whether the column is nullable */
  nullable: boolean;
  /** Default value expression */
  defaultValue?: string;
  /** Whether this is a primary key column */
  isPrimaryKey: boolean;
  /** Whether this column has a UNIQUE constraint */
  isUnique: boolean;
  /** Whether this is an auto-increment column (SERIAL/BIGSERIAL) */
  isAutoIncrement: boolean;
  /** The Propane field number for rename detection */
  fieldNumber?: number;
  /** For JSONB columns, the expected structure */
  jsonbSchema?: JsonbSchema;
}

/**
 * Definition of a table index.
 */
export interface IndexDefinition {
  /** Index name */
  name: string;
  /** Columns included in the index */
  columns: string[];
  /** Whether this is a unique index */
  unique: boolean;
  /** Index method (btree, hash, gin, gist, etc.) */
  method?: string;
  /** Partial index WHERE clause */
  where?: string;
}

/**
 * Definition of a foreign key constraint.
 */
export interface ForeignKeyDefinition {
  /** Constraint name */
  name: string;
  /** Column(s) in this table */
  columns: string[];
  /** Referenced table */
  referencedTable: string;
  /** Referenced column(s) */
  referencedColumns: string[];
  /** ON DELETE action */
  onDelete: ForeignKeyAction;
  /** ON UPDATE action */
  onUpdate: ForeignKeyAction;
}

/**
 * Foreign key actions.
 */
export type ForeignKeyAction = 'CASCADE' | 'SET NULL' | 'SET DEFAULT' | 'RESTRICT' | 'NO ACTION';

/**
 * A CHECK constraint.
 */
export interface CheckConstraint {
  /** Constraint name */
  name: string;
  /** SQL expression */
  expression: string;
}

/**
 * Schema for JSONB column validation/documentation.
 */
export interface JsonbSchema {
  /** The type (object, array, etc.) */
  type: 'object' | 'array' | 'string' | 'number' | 'boolean' | 'null';
  /** For objects, the property definitions */
  properties?: Record<string, JsonbSchema>;
  /** For arrays, the item schema */
  items?: JsonbSchema;
  /** Whether additional properties are allowed */
  additionalProperties?: boolean;
}

/**
 * Result of comparing two schemas.
 */
export interface SchemaDiff {
  /** Tables to create */
  tablesToCreate: TableDefinition[];
  /** Tables to drop */
  tablesToDrop: string[];
  /** Tables to alter */
  tablesToAlter: TableAlteration[];
  /** Whether this diff contains breaking changes */
  hasBreakingChanges: boolean;
  /** Warnings about potentially problematic changes */
  warnings: DiffWarning[];
}

/**
 * Alterations needed for a single table.
 */
export interface TableAlteration {
  /** Table name */
  tableName: string;
  /** Columns to add */
  columnsToAdd: ColumnDefinition[];
  /** Columns to drop */
  columnsToDrop: string[];
  /** Columns to rename (old name -> new name) */
  columnsToRename: { from: string; to: string }[];
  /** Columns to alter */
  columnsToAlter: ColumnAlteration[];
  /** Indexes to create */
  indexesToCreate: IndexDefinition[];
  /** Indexes to drop */
  indexesToDrop: string[];
  /** Foreign keys to add */
  foreignKeysToAdd: ForeignKeyDefinition[];
  /** Foreign keys to drop */
  foreignKeysToDrop: string[];
  /** Check constraints to add */
  checksToAdd: CheckConstraint[];
  /** Check constraints to drop */
  checksToDrop: string[];
}

/**
 * Alteration needed for a single column.
 */
export interface ColumnAlteration {
  /** Column name */
  columnName: string;
  /** Type change (if any) */
  typeChange?: { from: string; to: string };
  /** Nullability change (if any) */
  nullableChange?: { from: boolean; to: boolean };
  /** Default value change (if any) */
  defaultChange?: { from?: string; to?: string };
}

/**
 * A warning about a potentially problematic schema change.
 */
export interface DiffWarning {
  /** Warning type */
  type: 'possible_rename' | 'data_loss' | 'type_change' | 'constraint_violation';
  /** Warning message */
  message: string;
  /** Affected table */
  table?: string;
  /** Affected column */
  column?: string;
  /** Suggested fix */
  suggestion?: string;
}
