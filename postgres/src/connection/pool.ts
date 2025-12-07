/**
 * Connection pool management for postgres.js
 *
 * Note: postgres.js has built-in connection pooling, so this is a thin wrapper
 * that provides a familiar API and adds schema management.
 */

import { Connection, type ConnectionOptions, type QueryResult } from './connection.js';

/**
 * Pool configuration options.
 */
export interface PoolOptions extends ConnectionOptions {
  /** Minimum number of connections to maintain (not used by postgres.js, kept for API compatibility) */
  min?: number;
  /** Maximum number of connections in pool (default: 10) */
  max?: number;
  /** Idle timeout in milliseconds (default: 30000) */
  idleTimeout?: number;
  /** Connection timeout in milliseconds (default: 10000) */
  connectionTimeout?: number;
}

/**
 * Connection pool wrapper.
 *
 * postgres.js has built-in connection pooling, so this class provides
 * a familiar pool-like API while delegating to the underlying driver.
 */
export class Pool {
  private connection: Connection;
  private _schema: string;

  constructor(options: PoolOptions = {}) {
    this._schema = options.schema ?? 'public';
    this.connection = new Connection({
      ...options,
      schema: this._schema,
    });
  }

  /**
   * The current PostgreSQL schema.
   */
  get schema(): string {
    return this._schema;
  }

  /**
   * Execute a query using the pool.
   */
  query<T = Record<string, unknown>>(
    strings: TemplateStringsArray,
    ...values: unknown[]
  ): Promise<QueryResult<T>> {
    return this.connection.query<T>(strings, ...values);
  }

  /**
   * Execute a raw SQL string with parameters.
   */
  execute<T = Record<string, unknown>>(
    query: string,
    params: unknown[] = []
  ): Promise<QueryResult<T>> {
    return this.connection.execute<T>(query, params);
  }

  /**
   * Get a connection from the pool.
   * With postgres.js, this returns a wrapped connection that shares the pool.
   */
  async connect(): Promise<PoolClient> {
    await this.connection.setSearchPath();
    return new PoolClient(this.connection, this._schema);
  }

  /**
   * Creates a new pool with a different schema.
   */
  withSchema(schema: string): Pool {
    const pool = new Pool({});
    pool.connection = this.connection.withSchema(schema);
    pool._schema = schema;
    return pool;
  }

  /**
   * Close all connections in the pool.
   */
  async end(): Promise<void> {
    await this.connection.close();
  }
}

/**
 * A client obtained from the pool.
 */
export class PoolClient {
  private connection: Connection;
  private _schema: string;
  private _released = false;

  constructor(connection: Connection, schema: string) {
    this.connection = connection;
    this._schema = schema;
  }

  /**
   * The current PostgreSQL schema.
   */
  get schema(): string {
    return this._schema;
  }

  /**
   * Execute a query.
   */
  query<T = Record<string, unknown>>(
    strings: TemplateStringsArray,
    ...values: unknown[]
  ): Promise<QueryResult<T>> {
    this.ensureNotReleased();
    return this.connection.query<T>(strings, ...values);
  }

  /**
   * Execute a raw SQL string with parameters.
   */
  execute<T = Record<string, unknown>>(
    query: string,
    params: unknown[] = []
  ): Promise<QueryResult<T>> {
    this.ensureNotReleased();
    return this.connection.execute<T>(query, params);
  }

  /**
   * Release the client back to the pool.
   * With postgres.js, this is a no-op since connections are managed automatically.
   */
  release(): void {
    this._released = true;
  }

  private ensureNotReleased(): void {
    if (this._released) {
      throw new Error('Client has been released back to the pool');
    }
  }
}

/**
 * Create a connection pool.
 */
export function createPool(options: PoolOptions = {}): Pool {
  return new Pool(options);
}
