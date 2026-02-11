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
 * Primary key value type - single value for simple PKs, object for composite PKs.
 *
 * For a table with `PrimaryKey<bigint>`:
 *   PrimaryKeyValue = bigint
 *
 * For a table with composite key `PrimaryKey<bigint>` + `PrimaryKey<bigint>`:
 *   PrimaryKeyValue = { userId: bigint; roleId: bigint }
 */
export type PrimaryKeyValue<T> = T[keyof T] | Partial<T>;

/**
 * Base repository class for database operations.
 */
export class BaseRepository<T extends Record<string, unknown>> {
  protected connection: Connection | Pool | PoolClient | Transaction;
  protected tableName: string;
  protected schemaName: string;
  /** Primary key column(s). String for single PK, array for composite. */
  protected primaryKey: string | string[];
  protected columns: string[];
  protected columnTypes: Record<string, string>;
  /** Whether this table has a composite primary key. */
  protected isCompositePk: boolean;

  constructor(
    connection: Connection | Pool | PoolClient | Transaction,
    config: {
      tableName: string;
      schemaName?: string;
      /** Primary key column(s). String for single PK, array for composite. */
      primaryKey: string | string[];
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
    this.isCompositePk = Array.isArray(config.primaryKey)
      && config.primaryKey.length > 1;
  }

  /**
   * Get the fully qualified table name.
   */
  protected get qualifiedTableName(): string {
    return `${escapeIdentifier(this.schemaName)}.${escapeIdentifier(this.tableName)}`;
  }

  /**
   * Find a record by primary key.
   *
   * For single-column PK: `findById(1n)`
   * For composite PK: `findById({ userId: 1n, roleId: 2n })`
   */
  async findById<K extends (keyof T)[]>(
    id: PrimaryKeyValue<T>,
    select?: K
  ): Promise<Pick<T, K[number]> | null> {
    const columns = this.buildSelectColumns(select);
    const { whereClause, params } = this.buildPkWhereClause(id);
    const result = await this.connection.execute<T>(
      `SELECT ${columns} FROM ${this.qualifiedTableName} WHERE ${whereClause}`,
      params
    );
    const firstRow = result[0];
    return firstRow ? this.deserializeRow(firstRow, select) : null;
  }

  /**
   * Find multiple records by primary keys.
   *
   * For single-column PK: `findByIds([1n, 2n, 3n])`
   * For composite PK: `findByIds([{ userId: 1n, roleId: 2n }, { userId: 1n, roleId: 3n }])`
   */
  async findByIds<K extends (keyof T)[]>(
    ids: PrimaryKeyValue<T>[],
    select?: K
  ): Promise<Pick<T, K[number]>[]> {
    if (ids.length === 0) return [];

    const columns = this.buildSelectColumns(select);

    if (this.isCompositePk) {
      // For composite keys, use OR clauses
      const { orClauses, params } = this.buildMultiplePkWhereClauses(ids);
      const result = await this.connection.execute<T>(
        `SELECT ${columns} FROM ${this.qualifiedTableName} WHERE ${orClauses}`,
        params
      );
      return result.map(row => this.deserializeRow(row, select));
    }

    // Simple single-column PK
    const placeholders = ids.map((_, i) => `$${i + 1}`).join(', ');
    const pkCol = Array.isArray(this.primaryKey)
      ? this.primaryKey[0]!
      : this.primaryKey;
    const result = await this.connection.execute<T>(
      `SELECT ${columns} FROM ${this.qualifiedTableName} WHERE ${escapeIdentifier(pkCol)} IN (${placeholders})`,
      ids
    );
    return result.map(row => this.deserializeRow(row, select));
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
    return result.map(row => this.deserializeRow(row, options?.select));
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

    const firstRow = result[0];
    if (!firstRow) {
      throw new Error('INSERT did not return a row');
    }
    return this.deserializeRow(firstRow);
  }

  /**
   * Create multiple records.
   */
  async createMany(dataArray: Partial<T>[]): Promise<T[]> {
    if (dataArray.length === 0) return [];

    // Use the first item to determine columns
    const firstData = dataArray[0];
    if (!firstData) {
      return [];
    }
    const { columns: colNames } = this.buildInsertData(firstData);

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

    return result.map(row => this.deserializeRow(row));
  }

  /**
   * Update a record by primary key.
   *
   * For single-column PK: `update(1n, { name: 'New Name' })`
   * For composite PK: `update({ userId: 1n, roleId: 2n }, { grantedAt: new Date() })`
   */
  async update(id: PrimaryKeyValue<T>, data: Partial<T>): Promise<T | null> {
    const { setClauses, values } = this.buildUpdateData(data);

    if (setClauses.length === 0) {
      return this.findById(id) as Promise<T | null>;
    }

    const {
      whereClause,
      params: whereParams,
    } = this.buildPkWhereClause(id, values.length + 1);
    values.push(...whereParams);

    const query = `UPDATE ${this.qualifiedTableName} SET ${setClauses.join(', ')} WHERE ${whereClause} RETURNING *`;
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
   *
   * For single-column PK: `delete(1n)`
   * For composite PK: `delete({ userId: 1n, roleId: 2n })`
   */
  async delete(id: PrimaryKeyValue<T>): Promise<boolean> {
    const { whereClause, params } = this.buildPkWhereClause(id);
    const result = await this.connection.execute(
      `DELETE FROM ${this.qualifiedTableName} WHERE ${whereClause}`,
      params
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
      .map(k => escapeIdentifier(this.toSnakeCase(String(k))))
      .join(', ');

    // Build UPDATE SET clause excluding conflict keys
    const updateCols = this.columns.filter(c => {
      const camelKey = this.toCamelCase(c) as keyof T;
      return !conflictKeys.includes(camelKey) && data[camelKey] !== undefined;
    });
    const updateSet = updateCols
      .map(
        c => `${escapeIdentifier(c)} = EXCLUDED.${escapeIdentifier(c)}`
      )
      .join(', ');

    let query = `INSERT INTO ${this.qualifiedTableName} (${columns}) VALUES (${
      placeholders
    })`;
    query += ` ON CONFLICT (${conflictCols})`;

    query += updateSet ? ` DO UPDATE SET ${updateSet}` : ` DO NOTHING`;

    query += ' RETURNING *';

    const result = await this.connection.execute<T>(query, values);
    const firstRow = result[0];
    if (!firstRow) {
      throw new Error('UPSERT did not return a row');
    }
    return this.deserializeRow(firstRow);
  }

  /**
   * Build SELECT column list.
   */
  protected buildSelectColumns(select?: (keyof T)[]): string {
    if (!select || select.length === 0) {
      return '*';
    }
    return select.map(col => escapeIdentifier(this.toSnakeCase(String(col)))).join(', ');
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
      ? select.map(k => this.toSnakeCase(String(k)))
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
    return str.replaceAll(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
  }

  /**
   * Convert snake_case to camelCase.
   */
  protected toCamelCase(str: string): string {
    return str.replaceAll(/_([a-z])/g, (_, letter: string) =>
      letter.toUpperCase()
    );
  }

  /**
   * Build WHERE clause for primary key lookup.
   *
   * @param id - Primary key value (single value or object for composite)
   * @param startIndex - Parameter placeholder start index
   * @returns WHERE clause SQL and parameter values
   */
  protected buildPkWhereClause(
    id: PrimaryKeyValue<T>,
    startIndex = 1
  ): { whereClause: string; params: unknown[] } {
    if (this.isCompositePk) {
      // Composite PK - id should be an object like { userId: 1n, roleId: 2n }
      const pkCols = this.primaryKey as string[];
      const conditions: string[] = [];
      const params: unknown[] = [];
      let paramIndex = startIndex;

      for (const col of pkCols) {
        const camelKey = this.toCamelCase(col);
        const value = (id as Record<string, unknown>)[camelKey];
        if (value === undefined) {
          throw new Error(`Missing primary key column '${camelKey}' in composite key`);
        }
        const colType = this.columnTypes[col] ?? 'TEXT';
        conditions.push(`${escapeIdentifier(col)} = $${paramIndex++}`);
        params.push(serializeValue(value, colType));
      }

      return {
        whereClause: conditions.join(' AND '),
        params,
      };
    }

    // Single-column PK
    const pkCol = Array.isArray(this.primaryKey)
      ? this.primaryKey[0]!
      : this.primaryKey;
    const colType = this.columnTypes[pkCol] ?? 'TEXT';
    return {
      whereClause: `${escapeIdentifier(pkCol)} = $${startIndex}`,
      params: [serializeValue(id, colType)],
    };
  }

  /**
   * Build WHERE clause for multiple primary key lookups (used by findByIds).
   *
   * @param ids - Array of primary key values
   * @returns OR clause SQL and parameter values
   */
  protected buildMultiplePkWhereClauses(
    ids: PrimaryKeyValue<T>[]
  ): { orClauses: string; params: unknown[] } {
    const pkCols = this.primaryKey as string[];
    const clauses: string[] = [];
    const params: unknown[] = [];
    let paramIndex = 1;

    for (const id of ids) {
      const conditions: string[] = [];
      for (const col of pkCols) {
        const camelKey = this.toCamelCase(col);
        const value = (id as Record<string, unknown>)[camelKey];
        if (value === undefined) {
          throw new Error(`Missing primary key column '${camelKey}' in composite key`);
        }
        const colType = this.columnTypes[col] ?? 'TEXT';
        conditions.push(`${escapeIdentifier(col)} = $${paramIndex++}`);
        params.push(serializeValue(value, colType));
      }
      clauses.push(`(${conditions.join(' AND ')})`);
    }

    return {
      orClauses: clauses.join(' OR '),
      params,
    };
  }

  /**
   * Query a related table and return a single row.
   *
   * Used by generated belongs-to relation methods. Queries another table
   * by matching column values (typically FK -> PK lookup).
   *
   * @param targetTable - Table name to query (snake_case)
   * @param targetColumns - Column(s) to match against (snake_case)
   * @param values - Value(s) to match (in same order as targetColumns)
   * @param targetColumnTypes - Column type map for the target table
   * @returns The first matching row, or null if no match or null FK value
   *
   * @example
   * // In generated PostRepository.getAuthor():
   * const row = await this.queryRelatedOne(
   *   'users',
   *   ['id'],
   *   [entity.authorId],
   *   { id: 'BIGINT', name: 'TEXT', email: 'TEXT' }
   * );
   */
  protected async queryRelatedOne(
    targetTable: string,
    targetColumns: string[],
    values: unknown[],
    targetColumnTypes: Record<string, string>
  ): Promise<Record<string, unknown> | null> {
    // Return null if any FK value is null/undefined (no relation)
    if (values.some(v => v === null || v === undefined)) {
      return null;
    }

    // Build WHERE clause: col1 = $1 AND col2 = $2 ...
    const conditions = targetColumns
      .map((col, i) => `${escapeIdentifier(col)} = $${i + 1}`)
      .join(' AND ');

    // Serialize values using target column types
    const serializedValues = values.map((v, i) => {
      const col = targetColumns[i]!;
      const colType = targetColumnTypes[col] ?? 'TEXT';
      return serializeValue(v, colType);
    });

    // Build qualified table name
    const qualifiedTable = `${escapeIdentifier(this.schemaName)}.${escapeIdentifier(targetTable)}`;

    const result = await this.connection.execute<Record<string, unknown>>(
      `SELECT * FROM ${qualifiedTable} WHERE ${conditions} LIMIT 1`,
      serializedValues
    );

    return result[0] ?? null;
  }

  /**
   * Query a related table and return all matching rows.
   *
   * Used by generated has-many relation methods. Queries another table
   * by matching column values (typically PK -> FK reverse lookup).
   *
   * @param targetTable - Table name to query (snake_case)
   * @param targetColumns - Column(s) to match against (snake_case)
   * @param values - Value(s) to match (in same order as targetColumns)
   * @param targetColumnTypes - Column type map for the target table
   * @returns Array of matching rows, or empty array if null PK value
   *
   * @example
   * // In generated UserRepository.getPosts():
   * const rows = await this.queryRelatedMany(
   *   'posts',
   *   ['author_id'],
   *   [entity.id],
   *   { id: 'BIGINT', title: 'TEXT', author_id: 'BIGINT' }
   * );
   */
  protected async queryRelatedMany(
    targetTable: string,
    targetColumns: string[],
    values: unknown[],
    targetColumnTypes: Record<string, string>
  ): Promise<Record<string, unknown>[]> {
    // Return empty array if any value is null/undefined
    if (values.some(v => v === null || v === undefined)) {
      return [];
    }

    // Build WHERE clause: col1 = $1 AND col2 = $2 ...
    const conditions = targetColumns
      .map((col, i) => `${escapeIdentifier(col)} = $${i + 1}`)
      .join(' AND ');

    // Serialize values using target column types
    const serializedValues = values.map((v, i) => {
      const col = targetColumns[i]!;
      const colType = targetColumnTypes[col] ?? 'TEXT';
      return serializeValue(v, colType);
    });

    // Build qualified table name
    const qualifiedTable = `${escapeIdentifier(this.schemaName)}.${escapeIdentifier(targetTable)}`;

    const result = await this.connection.execute<Record<string, unknown>>(
      `SELECT * FROM ${qualifiedTable} WHERE ${conditions}`,
      serializedValues
    );

    return result;
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
    /** Primary key column(s). String for single PK, array for composite. */
    primaryKey: string | string[];
    columns: string[];
    columnTypes: Record<string, string>;
  }
): BaseRepository<T> {
  return new BaseRepository<T>(connection, config);
}
