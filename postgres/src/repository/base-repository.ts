/**
 * Base repository for CRUD operations on Propane messages.
 */

import type { Connection } from '../connection/connection.js';
import type { Pool, PoolClient } from '../connection/pool.js';
import type { Transaction } from '../connection/transaction.js';
import { buildWhere, buildOrderBy, type WhereCondition, type OrderBy } from './where-builder.js';
import { serializeValue, deserializeValue, escapeIdentifier } from '../mapping/serializer.js';

/**
 * Options for find operations.
 */
export interface FindOptions<T> {
  /** Fields to select (default: all) */
  select?: (keyof T)[];
  /** Ordering */
  orderBy?: OrderBy<T>;
  /** Maximum number of results */
  limit?: number;
  /** Number of results to skip */
  offset?: number;
}

/**
 * Options for create operations.
 */
export interface CreateOptions {
  /** Whether to return the created entity */
  returning?: boolean;
}

/**
 * Result of a count operation.
 */
export interface CountResult {
  count: number;
}

/**
 * Base repository class for database operations.
 */
export class BaseRepository<T extends Record<string, unknown>> {
  protected connection: Connection | Pool | PoolClient | Transaction;
  protected tableName: string;
  protected schemaName: string;
  protected primaryKey: string;
  protected columns: string[];
  protected columnTypes: Record<string, string>;

  constructor(
    connection: Connection | Pool | PoolClient | Transaction,
    config: {
      tableName: string;
      schemaName?: string;
      primaryKey: string;
      columns: string[];
      columnTypes: Record<string, string>;
    }
  ) {
    this.connection = connection;
    this.tableName = config.tableName;
    this.schemaName = config.schemaName ?? 'public';
    this.primaryKey = config.primaryKey;
    this.columns = config.columns;
    this.columnTypes = config.columnTypes;
  }

  /**
   * Get the fully qualified table name.
   */
  protected get qualifiedTableName(): string {
    return `${escapeIdentifier(this.schemaName)}.${escapeIdentifier(this.tableName)}`;
  }

  /**
   * Find a record by primary key.
   */
  async findById<K extends (keyof T)[]>(
    id: unknown,
    select?: K
  ): Promise<Pick<T, K[number]> | null> {
    const columns = this.buildSelectColumns(select);
    const result = await this.connection.execute<T>(
      `SELECT ${columns} FROM ${this.qualifiedTableName} WHERE ${escapeIdentifier(this.primaryKey)} = $1`,
      [id]
    );
    const firstRow = result[0];
    return firstRow ? this.deserializeRow(firstRow, select) : null;
  }

  /**
   * Find multiple records by primary keys.
   */
  async findByIds<K extends (keyof T)[]>(
    ids: unknown[],
    select?: K
  ): Promise<Pick<T, K[number]>[]> {
    if (ids.length === 0) return [];

    const columns = this.buildSelectColumns(select);
    const placeholders = ids.map((_, i) => `$${i + 1}`).join(', ');
    const result = await this.connection.execute<T>(
      `SELECT ${columns} FROM ${this.qualifiedTableName} WHERE ${escapeIdentifier(this.primaryKey)} IN (${placeholders})`,
      ids
    );
    return result.map((row) => this.deserializeRow(row, select));
  }

  /**
   * Find a single record matching the condition.
   */
  async findOne<K extends (keyof T)[]>(
    where: WhereCondition<T>,
    options?: FindOptions<T> & { select?: K }
  ): Promise<Pick<T, K[number]> | null> {
    const results = await this.findMany(where, { ...options, limit: 1 });
    return results[0] ?? null;
  }

  /**
   * Find all records matching the condition.
   */
  async findMany<K extends (keyof T)[]>(
    where: WhereCondition<T>,
    options?: FindOptions<T> & { select?: K }
  ): Promise<Pick<T, K[number]>[]> {
    const columns = this.buildSelectColumns(options?.select);
    const { sql: whereSql, params } = buildWhere(where);

    let query = `SELECT ${columns} FROM ${this.qualifiedTableName} WHERE ${whereSql}`;

    if (options?.orderBy) {
      query += ` ORDER BY ${buildOrderBy(options.orderBy)}`;
    }

    if (options?.limit !== undefined) {
      query += ` LIMIT ${options.limit}`;
    }

    if (options?.offset !== undefined) {
      query += ` OFFSET ${options.offset}`;
    }

    const result = await this.connection.execute<T>(query, params);
    return result.map((row) => this.deserializeRow(row, options?.select));
  }

  /**
   * Find all records in the table.
   */
  async findAll<K extends (keyof T)[]>(
    options?: FindOptions<T> & { select?: K }
  ): Promise<Pick<T, K[number]>[]> {
    return this.findMany({} as WhereCondition<T>, options);
  }

  /**
   * Create a new record.
   */
  async create(data: Partial<T>): Promise<T> {
    const { columns, values, placeholders } = this.buildInsertData(data);

    const query = `INSERT INTO ${this.qualifiedTableName} (${columns}) VALUES (${placeholders}) RETURNING *`;
    const result = await this.connection.execute<T>(query, values);

    return this.deserializeRow(result[0]!);
  }

  /**
   * Create multiple records.
   */
  async createMany(dataArray: Partial<T>[]): Promise<T[]> {
    if (dataArray.length === 0) return [];

    // Use the first item to determine columns
    const { columns: colNames } = this.buildInsertData(dataArray[0]!);

    const allValues: unknown[] = [];
    const allPlaceholders: string[] = [];

    for (const data of dataArray) {
      const { values, placeholders } = this.buildInsertData(
        data,
        allValues.length + 1
      );
      allValues.push(...values);
      allPlaceholders.push(`(${placeholders})`);
    }

    const query = `INSERT INTO ${this.qualifiedTableName} (${colNames}) VALUES ${
      allPlaceholders.join(', ')
    } RETURNING *`;
    const result = await this.connection.execute<T>(query, allValues);

    return result.map((row) => this.deserializeRow(row));
  }

  /**
   * Update a record by primary key.
   */
  async update(id: unknown, data: Partial<T>): Promise<T | null> {
    const { setClauses, values } = this.buildUpdateData(data);

    if (setClauses.length === 0) {
      return this.findById(id) as Promise<T | null>;
    }

    values.push(id);
    const query = `UPDATE ${this.qualifiedTableName} SET ${setClauses.join(', ')} WHERE ${
      escapeIdentifier(this.primaryKey)
    } = $${values.length} RETURNING *`;
    const result = await this.connection.execute<T>(query, values);
    const firstRow = result[0];

    return firstRow ? this.deserializeRow(firstRow) : null;
  }

  /**
   * Update multiple records matching the condition.
   */
  async updateMany(
    where: WhereCondition<T>,
    data: Partial<T>
  ): Promise<number> {
    const { setClauses, values } = this.buildUpdateData(data);

    if (setClauses.length === 0) {
      return 0;
    }

    const { sql: whereSql, params: whereParams } = buildWhere(
      where,
      values.length + 1
    );
    values.push(...whereParams);

    const query = `UPDATE ${this.qualifiedTableName} SET ${
      setClauses.join(', ')
    } WHERE ${whereSql}`;
    const result = await this.connection.execute(query, values);

    return result.count;
  }

  /**
   * Delete a record by primary key.
   */
  async delete(id: unknown): Promise<boolean> {
    const result = await this.connection.execute(
      `DELETE FROM ${this.qualifiedTableName} WHERE ${escapeIdentifier(this.primaryKey)} = $1`,
      [id]
    );
    return result.count > 0;
  }

  /**
   * Delete multiple records matching the condition.
   */
  async deleteMany(where: WhereCondition<T>): Promise<number> {
    const { sql: whereSql, params } = buildWhere(where);
    const result = await this.connection.execute(
      `DELETE FROM ${this.qualifiedTableName} WHERE ${whereSql}`,
      params
    );
    return result.count;
  }

  /**
   * Count records matching the condition.
   */
  async count(where?: WhereCondition<T>): Promise<number> {
    let query = `SELECT COUNT(*) as count FROM ${this.qualifiedTableName}`;
    let params: unknown[] = [];

    if (where && Object.keys(where).length > 0) {
      const built = buildWhere(where);
      query += ` WHERE ${built.sql}`;
      params = built.params;
    }

    const result = await this.connection.execute<{ count: string }>(
      query,
      params
    );
    return Number.parseInt(result[0]?.count ?? '0', 10);
  }

  /**
   * Check if any records exist matching the condition.
   */
  async exists(where: WhereCondition<T>): Promise<boolean> {
    const { sql: whereSql, params } = buildWhere(where);
    const query = `SELECT EXISTS(SELECT 1 FROM ${
      this.qualifiedTableName
    } WHERE ${whereSql}) as exists`;
    const result = await this.connection.execute<{ exists: boolean }>(
      query,
      params
    );
    return result[0]?.exists ?? false;
  }

  /**
   * Upsert (insert or update) a record.
   */
  async upsert(data: Partial<T>, conflictKeys: (keyof T)[]): Promise<T> {
    const { columns, values, placeholders } = this.buildInsertData(data);
    const conflictCols = conflictKeys
      .map((k) => escapeIdentifier(this.toSnakeCase(String(k))))
      .join(', ');

    // Build UPDATE SET clause excluding conflict keys
    const updateCols = this.columns.filter((c) => {
      const camelKey = this.toCamelCase(c) as keyof T;
      return !conflictKeys.includes(camelKey) && data[camelKey] !== undefined;
    });
    const updateSet = updateCols
      .map(
        (c) => `${escapeIdentifier(c)} = EXCLUDED.${escapeIdentifier(c)}`
      )
      .join(', ');

    let query = `INSERT INTO ${this.qualifiedTableName} (${columns}) VALUES (${
      placeholders
    })`;
    query += ` ON CONFLICT (${conflictCols})`;

    query += updateSet ? ` DO UPDATE SET ${updateSet}` : ` DO NOTHING`;

    query += ' RETURNING *';

    const result = await this.connection.execute<T>(query, values);
    return this.deserializeRow(result[0]!);
  }

  /**
   * Build SELECT column list.
   */
  protected buildSelectColumns(select?: (keyof T)[]): string {
    if (!select || select.length === 0) {
      return '*';
    }
    return select.map((col) => escapeIdentifier(this.toSnakeCase(String(col)))).join(', ');
  }

  /**
   * Build INSERT data.
   */
  protected buildInsertData(
    data: Partial<T>,
    startIndex = 1
  ): { columns: string; values: unknown[]; placeholders: string } {
    const cols: string[] = [];
    const values: unknown[] = [];
    const placeholders: string[] = [];

    let paramIndex = startIndex;

    for (const [key, value] of Object.entries(data)) {
      if (value === undefined) continue;

      const colName = this.toSnakeCase(key);
      const colType = this.columnTypes[colName] ?? 'TEXT';

      cols.push(escapeIdentifier(colName));
      values.push(serializeValue(value, colType));
      placeholders.push(`$${paramIndex++}`);
    }

    return {
      columns: cols.join(', '),
      values,
      placeholders: placeholders.join(', '),
    };
  }

  /**
   * Build UPDATE data.
   */
  protected buildUpdateData(data: Partial<T>): {
    setClauses: string[];
    values: unknown[];
  } {
    const setClauses: string[] = [];
    const values: unknown[] = [];

    let paramIndex = 1;

    for (const [key, value] of Object.entries(data)) {
      if (value === undefined) continue;

      const colName = this.toSnakeCase(key);
      const colType = this.columnTypes[colName] ?? 'TEXT';

      setClauses.push(`${escapeIdentifier(colName)} = $${paramIndex++}`);
      values.push(serializeValue(value, colType));
    }

    return { setClauses, values };
  }

  /**
   * Deserialize a database row to an entity.
   */
  protected deserializeRow<K extends (keyof T)[]>(
    row: Record<string, unknown>,
    select?: K
  ): Pick<T, K[number]> {
    const result: Record<string, unknown> = {};

    const columnsToProcess = select
      ? select.map((k) => this.toSnakeCase(String(k)))
      : this.columns;

    for (const col of columnsToProcess) {
      const camelKey = this.toCamelCase(col);
      const colType = this.columnTypes[col] ?? 'TEXT';
      result[camelKey] = deserializeValue(row[col], colType);
    }

    return result as Pick<T, K[number]>;
  }

  /**
   * Convert camelCase to snake_case.
   */
  protected toSnakeCase(str: string): string {
    return str.replaceAll(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
  }

  /**
   * Convert snake_case to camelCase.
   */
  protected toCamelCase(str: string): string {
    return str.replaceAll(/_([a-z])/g, (_, letter: string) =>
      letter.toUpperCase()
    );
  }
}

/**
 * Create a repository for a table.
 */
export function createRepository<T extends Record<string, unknown>>(
  connection: Connection | Pool | PoolClient | Transaction,
  config: {
    tableName: string;
    schemaName?: string;
    primaryKey: string;
    columns: string[];
    columnTypes: Record<string, string>;
  }
): BaseRepository<T> {
  return new BaseRepository<T>(connection, config);
}
