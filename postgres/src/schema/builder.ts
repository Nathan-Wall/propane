/**
 * Fluent builder for constructing database schemas.
 */

import type {
  DatabaseSchema,
  TableDefinition,
  ColumnDefinition,
  IndexDefinition,
  ForeignKeyDefinition,
  ForeignKeyAction,
  CheckConstraint,
} from './types.js';

/**
 * Builder for constructing a database schema.
 */
export class SchemaBuilder {
  private _schemaName = 'public';
  private _tables = new Map<string, TableBuilder>();
  private _version?: string;

  /**
   * Set the schema name.
   */
  schema(name: string): this {
    this._schemaName = name;
    return this;
  }

  /**
   * Set the schema version.
   */
  version(version: string): this {
    this._version = version;
    return this;
  }

  /**
   * Add a table to the schema.
   *
   * @throws Error if a table with this name already exists
   */
  table(name: string, configure: (table: TableBuilder) => void): this {
    if (this._tables.has(name)) {
      throw new Error(`Duplicate table name: ${name}`);
    }
    const builder = new TableBuilder(name);
    configure(builder);
    this._tables.set(name, builder);
    return this;
  }

  /**
   * Build the final schema definition.
   */
  build(): DatabaseSchema {
    const tables: Record<string, TableDefinition> = {};
    for (const [name, builder] of this._tables) {
      tables[name] = builder.build();
    }
    return {
      schemaName: this._schemaName,
      tables,
      version: this._version,
    };
  }
}

/**
 * Builder for constructing a table definition.
 */
export class TableBuilder {
  private _name: string;
  private _columns = new Map<string, ColumnBuilder>();
  private _primaryKey: string[] = [];
  private _indexes: IndexDefinition[] = [];
  private _foreignKeys: ForeignKeyDefinition[] = [];
  private _checks: CheckConstraint[] = [];
  private _sourceType?: string;
  private _fieldNumbers: Record<string, number> = {};

  constructor(name: string) {
    this._name = name;
  }

  /**
   * Set the source Propane type name.
   */
  sourceType(typeName: string): this {
    this._sourceType = typeName;
    return this;
  }

  /**
   * Add a column to the table.
   *
   * @throws Error if a column with this name already exists
   */
  column(name: string, configure: (column: ColumnBuilder) => void): this {
    if (this._columns.has(name)) {
      throw new Error(`Duplicate column name in table ${this._name}: ${name}`);
    }
    const builder = new ColumnBuilder(name);
    configure(builder);
    this._columns.set(name, builder);

    const col = builder.build();
    if (col.isPrimaryKey) {
      this._primaryKey.push(name);
    }
    if (col.fieldNumber !== undefined) {
      this._fieldNumbers[name] = col.fieldNumber;
    }

    return this;
  }

  /**
   * Add an index.
   */
  index(
    name: string,
    columns: string[],
    options: { unique?: boolean; method?: string; where?: string } = {}
  ): this {
    this._indexes.push({
      name,
      columns,
      unique: options.unique ?? false,
      method: options.method,
      where: options.where,
    });
    return this;
  }

  /**
   * Add a unique index.
   */
  uniqueIndex(name: string, columns: string[]): this {
    return this.index(name, columns, { unique: true });
  }

  /**
   * Add a foreign key constraint.
   */
  foreignKey(
    name: string,
    columns: string[],
    referencedTable: string,
    referencedColumns: string[],
    options: { onDelete?: ForeignKeyAction; onUpdate?: ForeignKeyAction } = {}
  ): this {
    this._foreignKeys.push({
      name,
      columns,
      referencedTable,
      referencedColumns,
      onDelete: options.onDelete ?? 'NO ACTION',
      onUpdate: options.onUpdate ?? 'NO ACTION',
    });
    return this;
  }

  /**
   * Add a CHECK constraint.
   */
  check(name: string, expression: string): this {
    this._checks.push({ name, expression });
    return this;
  }

  /**
   * Set composite primary key columns explicitly.
   * Use this when columns should be ordered differently than their declaration order.
   */
  compositePrimaryKey(columns: string[]): this {
    this._primaryKey = columns;
    return this;
  }

  /**
   * Build the final table definition.
   */
  build(): TableDefinition {
    const columns: Record<string, ColumnDefinition> = {};
    for (const [name, builder] of this._columns) {
      columns[name] = builder.build();
    }
    return {
      name: this._name,
      columns,
      primaryKey: this._primaryKey,
      indexes: this._indexes,
      foreignKeys: this._foreignKeys,
      checkConstraints: this._checks,
      sourceType: this._sourceType,
      fieldNumbers:
        Object.keys(this._fieldNumbers).length > 0
          ? this._fieldNumbers
          : undefined,
    };
  }
}

/**
 * Builder for constructing a column definition.
 */
export class ColumnBuilder {
  private _name: string;
  private _type = 'TEXT';
  private _nullable = true;
  private _defaultValue?: string;
  private _isPrimaryKey = false;
  private _isUnique = false;
  private _isAutoIncrement = false;
  private _fieldNumber?: number;

  constructor(name: string) {
    this._name = name;
  }

  /**
   * Set the column type.
   */
  type(sqlType: string): this {
    this._type = sqlType;
    return this;
  }

  // Convenience type methods

  text(): this { return this.type('TEXT'); }
  integer(): this { return this.type('INTEGER'); }
  bigint(): this { return this.type('BIGINT'); }
  serial(): this { this._isAutoIncrement = true; return this.type('SERIAL'); }
  bigserial(): this { this._isAutoIncrement = true; return this.type('BIGSERIAL'); }
  doublePrecision(): this { return this.type('DOUBLE PRECISION'); }
  numeric(precision: number, scale: number): this { return this.type(`NUMERIC(${precision},${scale})`); }
  boolean(): this { return this.type('BOOLEAN'); }
  timestamptz(): this { return this.type('TIMESTAMPTZ'); }
  bytea(): this { return this.type('BYTEA'); }
  jsonb(): this { return this.type('JSONB'); }

  /**
   * Mark as NOT NULL.
   */
  notNull(): this {
    this._nullable = false;
    return this;
  }

  /**
   * Mark as nullable.
   */
  nullable(): this {
    this._nullable = true;
    return this;
  }

  /**
   * Set default value.
   */
  default(expression: string): this {
    this._defaultValue = expression;
    return this;
  }

  /**
   * Mark as primary key.
   */
  primaryKey(): this {
    this._isPrimaryKey = true;
    this._nullable = false;
    return this;
  }

  /**
   * Mark as unique.
   */
  unique(): this {
    this._isUnique = true;
    return this;
  }

  /**
   * Set the Propane field number for rename detection.
   */
  fieldNumber(num: number): this {
    this._fieldNumber = num;
    return this;
  }

  /**
   * Build the final column definition.
   */
  build(): ColumnDefinition {
    return {
      name: this._name,
      type: this._type,
      nullable: this._nullable,
      defaultValue: this._defaultValue,
      isPrimaryKey: this._isPrimaryKey,
      isUnique: this._isUnique,
      isAutoIncrement: this._isAutoIncrement,
      fieldNumber: this._fieldNumber,
    };
  }
}

/**
 * Create a new schema builder.
 */
export function createSchemaBuilder(): SchemaBuilder {
  return new SchemaBuilder();
}

/**
 * Define a schema using a fluent builder.
 */
export function defineSchema(
  configure: (builder: SchemaBuilder) => void
): DatabaseSchema {
  const builder = new SchemaBuilder();
  configure(builder);
  return builder.build();
}
