/**
 * Transaction support for Propane PostgreSQL.
 */

import type { Connection, QueryResult } from './connection.js';
import type { Pool, PoolClient } from './pool.js';

/**
 * Transaction isolation levels.
 */
export type IsolationLevel =
  | 'read_uncommitted'
  | 'read_committed'
  | 'repeatable_read'
  | 'serializable';

/**
 * Transaction options.
 */
export interface TransactionOptions {
  /** Isolation level for the transaction */
  isolationLevel?: IsolationLevel;
  /** Whether the transaction is read-only */
  readOnly?: boolean;
}

/**
 * A database transaction.
 */
export class Transaction {
  private connection: Connection | PoolClient;
  private _committed = false;
  private _rolledBack = false;
  private savepointCounter = 0;

  constructor(connection: Connection | PoolClient) {
    this.connection = connection;
  }

  /**
   * Whether the transaction has been committed.
   */
  get committed(): boolean {
    return this._committed;
  }

  /**
   * Whether the transaction has been rolled back.
   */
  get rolledBack(): boolean {
    return this._rolledBack;
  }

  /**
   * Whether the transaction is still active.
   */
  get active(): boolean {
    return !this._committed && !this._rolledBack;
  }

  /**
   * Execute a query within the transaction.
   */
  query<T = Record<string, unknown>>(
    strings: TemplateStringsArray,
    ...values: unknown[]
  ): Promise<QueryResult<T>> {
    this.ensureActive();
    return this.connection.query<T>(strings, ...values);
  }

  /**
   * Execute a raw SQL string with parameters.
   */
  execute<T = Record<string, unknown>>(
    query: string,
    params: unknown[] = []
  ): Promise<QueryResult<T>> {
    this.ensureActive();
    return this.connection.execute<T>(query, params);
  }

  /**
   * Create a savepoint within the transaction.
   * Returns a function to rollback to this savepoint.
   */
  async savepoint(): Promise<Savepoint> {
    this.ensureActive();
    const name = `sp_${++this.savepointCounter}`;
    await this.execute(`SAVEPOINT ${name}`);
    return new Savepoint(this, name);
  }

  /**
   * Commit the transaction.
   */
  async commit(): Promise<void> {
    this.ensureActive();
    await this.execute('COMMIT');
    this._committed = true;
  }

  /**
   * Rollback the transaction.
   */
  async rollback(): Promise<void> {
    if (!this.active) return; // Already finished
    await this.execute('ROLLBACK');
    this._rolledBack = true;
  }

  /**
   * Rollback to a savepoint.
   */
  async rollbackToSavepoint(name: string): Promise<void> {
    this.ensureActive();
    await this.execute(`ROLLBACK TO SAVEPOINT ${name}`);
  }

  /**
   * Release a savepoint.
   */
  async releaseSavepoint(name: string): Promise<void> {
    this.ensureActive();
    await this.execute(`RELEASE SAVEPOINT ${name}`);
  }

  private ensureActive(): void {
    if (!this.active) {
      throw new Error(
        this._committed
          ? 'Transaction has already been committed'
          : 'Transaction has already been rolled back'
      );
    }
  }
}

/**
 * A savepoint within a transaction.
 */
export class Savepoint {
  private transaction: Transaction;
  private _name: string;
  private _released = false;
  private _rolledBack = false;

  constructor(transaction: Transaction, name: string) {
    this.transaction = transaction;
    this._name = name;
  }

  /**
   * The savepoint name.
   */
  get name(): string {
    return this._name;
  }

  /**
   * Whether the savepoint has been released.
   */
  get released(): boolean {
    return this._released;
  }

  /**
   * Whether the savepoint has been rolled back to.
   */
  get rolledBack(): boolean {
    return this._rolledBack;
  }

  /**
   * Rollback to this savepoint.
   */
  async rollback(): Promise<void> {
    if (this._released) {
      throw new Error('Savepoint has already been released');
    }
    await this.transaction.rollbackToSavepoint(this._name);
    this._rolledBack = true;
  }

  /**
   * Release this savepoint.
   */
  async release(): Promise<void> {
    if (this._released) return;
    await this.transaction.releaseSavepoint(this._name);
    this._released = true;
  }
}

/**
 * Isolation level SQL strings.
 */
const ISOLATION_LEVEL_SQL: Record<IsolationLevel, string> = {
  read_uncommitted: 'READ UNCOMMITTED',
  read_committed: 'READ COMMITTED',
  repeatable_read: 'REPEATABLE READ',
  serializable: 'SERIALIZABLE',
};

/**
 * Execute a function within a transaction.
 * Automatically commits on success, rolls back on error.
 */
export async function withTransaction<T>(
  connectionOrPool: Connection | Pool,
  fn: (tx: Transaction) => Promise<T>,
  options: TransactionOptions = {}
): Promise<T> {
  // Get a connection
  const connection = 'connect' in connectionOrPool
    ? await connectionOrPool.connect()
    : connectionOrPool;

  // Build BEGIN statement
  let beginSql = 'BEGIN';
  if (options.isolationLevel) {
    beginSql += ` ISOLATION LEVEL ${ISOLATION_LEVEL_SQL[options.isolationLevel]}`;
  }
  if (options.readOnly) {
    beginSql += ' READ ONLY';
  }

  await connection.execute(beginSql);

  const tx = new Transaction(connection);

  try {
    const result = await fn(tx);
    if (tx.active) {
      await tx.commit();
    }
    return result;
  } catch (error) {
    if (tx.active) {
      await tx.rollback();
    }
    throw error;
  } finally {
    // Release the client if it came from a pool
    if ('release' in connection) {
      connection.release();
    }
  }
}
