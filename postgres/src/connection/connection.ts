/**
 * Database connection wrapper for postgres.js
 */

import postgres from 'postgres';

/**
 * Connection configuration options.
 */
export interface ConnectionOptions {
  /** Database host */
  host?: string;
  /** Database port (default: 5432) */
  port?: number;
  /** Database name */
  database?: string;
  /** Database user */
  user?: string;
  /** Database password */
  password?: string;
  /** PostgreSQL schema to use (default: 'public') */
  schema?: string;
  /** SSL configuration */
  ssl?: boolean | 'require' | 'prefer' | object;
  /** Connection timeout in milliseconds */
  connectionTimeout?: number;
  /** Idle timeout in milliseconds */
  idleTimeout?: number;
  /** Maximum number of connections in pool */
  max?: number;
  /** Connection string (alternative to individual options) */
  connectionString?: string;
}

/**
 * Query result type - an array with a count property.
 */
export interface QueryResult<T = Record<string, unknown>> extends Array<T> {
  count: number;
}

/**
 * postgres.js Sql type - using explicit interface to avoid import resolution issues
 * with the local postgres/ folder conflicting with the npm postgres package.
 */
interface PostgresSql {
  (strings: TemplateStringsArray, ...values: unknown[]): Promise<unknown[]>;
  unsafe(query: string, params?: unknown[]): Promise<unknown[]>;
  end(): Promise<void>;
  begin<T>(fn: (sql: PostgresSql) => Promise<T>): Promise<T>;
}

/**
 * Database connection wrapper.
 */
export class Connection {
  private sql: PostgresSql;
  private _schema: string;
  private _closed = false;

  constructor(options: ConnectionOptions = {}) {
    this._schema = options.schema ?? 'public';

    const connOpts = {
      max: options.max ?? 10,
      idle_timeout: options.idleTimeout ? options.idleTimeout / 1000 : 30,
      connect_timeout: options.connectionTimeout
        ? options.connectionTimeout / 1000
        : 10,
    };

    this.sql = options.connectionString
      ? postgres(options.connectionString, connOpts) as unknown as PostgresSql
      : postgres({
          host: options.host ?? 'localhost',
          port: options.port ?? 5432,
          database: options.database ?? 'postgres',
          user: options.user ?? 'postgres',
          password: options.password ?? '',
          ssl: options.ssl,
          ...connOpts,
        }) as unknown as PostgresSql;
  }

  /**
   * The current PostgreSQL schema.
   */
  get schema(): string {
    return this._schema;
  }

  /**
   * Whether the connection is closed.
   */
  get closed(): boolean {
    return this._closed;
  }

  /**
   * Execute a raw SQL query with template literals.
   * Uses postgres.js tagged template literal syntax for safe parameterization.
   *
   * @example
   * ```typescript
   * const users = await conn.query`SELECT * FROM users WHERE id = ${userId}`;
   * ```
   */
  async query<T = Record<string, unknown>>(
    strings: TemplateStringsArray,
    ...values: unknown[]
  ): Promise<QueryResult<T>> {
    this.ensureOpen();
    const result = await this.sql(strings, ...values);
    const rows = result as T[];
    const queryResult = rows as QueryResult<T>;
    queryResult.count = rows.length;
    return queryResult;
  }

  /**
   * Execute a raw SQL string with parameters.
   *
   * @example
   * ```typescript
   * const users = await conn.execute('SELECT * FROM users WHERE id = $1', [userId]);
   * ```
   */
  async execute<T = Record<string, unknown>>(
    query: string,
    params: unknown[] = []
  ): Promise<QueryResult<T>> {
    this.ensureOpen();
    // Use unsafe for raw SQL strings - params are still safely interpolated
    const result = await this.sql.unsafe(query, params);
    const rows = result as unknown as T[];
    const queryResult = rows as QueryResult<T>;
    queryResult.count = rows.length;
    return queryResult;
  }

  /**
   * Set the search path to the configured schema.
   */
  async setSearchPath(): Promise<void> {
    await this.execute(`SET search_path TO ${this._schema}, public`);
  }

  /**
   * Creates a new connection with a different schema.
   */
  withSchema(schema: string): Connection {
    const conn = new Connection({});
    conn.sql = this.sql;
    conn._schema = schema;
    return conn;
  }

  /**
   * Begin a transaction.
   */
  async begin(): Promise<void> {
    await this.execute('BEGIN');
  }

  /**
   * Commit the current transaction.
   */
  async commit(): Promise<void> {
    await this.execute('COMMIT');
  }

  /**
   * Rollback the current transaction.
   */
  async rollback(): Promise<void> {
    await this.execute('ROLLBACK');
  }

  /**
   * Create a savepoint within a transaction.
   */
  async savepoint(name: string): Promise<void> {
    await this.execute(`SAVEPOINT ${name}`);
  }

  /**
   * Rollback to a savepoint.
   */
  async rollbackToSavepoint(name: string): Promise<void> {
    await this.execute(`ROLLBACK TO SAVEPOINT ${name}`);
  }

  /**
   * Release a savepoint.
   */
  async releaseSavepoint(name: string): Promise<void> {
    await this.execute(`RELEASE SAVEPOINT ${name}`);
  }

  /**
   * Close the connection.
   */
  async close(): Promise<void> {
    if (!this._closed) {
      this._closed = true;
      await this.sql.end();
    }
  }

  /**
   * Ensure the connection is open.
   */
  private ensureOpen(): void {
    if (this._closed) {
      throw new Error('Connection is closed');
    }
  }
}

/**
 * Create a database connection.
 */
export function createConnection(options: ConnectionOptions = {}): Connection {
  return new Connection(options);
}
