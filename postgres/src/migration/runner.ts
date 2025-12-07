/**
 * Migration runner for applying and reverting migrations.
 */

import type { Connection } from '../connection/connection.js';
import type { Pool } from '../connection/pool.js';
import { MigrationHistory } from './history.js';

/**
 * A migration to be run.
 */
export interface MigrationToRun {
  /** Migration version */
  version: string;
  /** Migration description */
  description: string;
  /** SQL for applying the migration */
  up: string;
  /** SQL for reverting the migration */
  down: string;
}

/**
 * Result of running migrations.
 */
export interface MigrationResult {
  /** Migrations that were applied */
  applied: string[];
  /** Migrations that were reverted */
  reverted: string[];
  /** Migrations that failed */
  failed: { version: string; error: Error }[];
  /** Whether all migrations succeeded */
  success: boolean;
}

/**
 * Options for running migrations.
 */
export interface RunnerOptions {
  /** Schema name to use */
  schemaName?: string;
  /** Whether to use advisory locks for concurrency protection */
  useLocks?: boolean;
  /** Lock timeout in milliseconds */
  lockTimeout?: number;
}

const DEFAULT_OPTIONS: Required<RunnerOptions> = {
  schemaName: 'public',
  useLocks: true,
  lockTimeout: 30_000,
};

// Advisory lock ID for migrations (arbitrary but consistent)
const MIGRATION_LOCK_ID = 0x50_52_4F_50; // 'PROP' in hex

/**
 * Runner for applying database migrations.
 */
export class MigrationRunner {
  private connection: Connection | Pool;
  private history: MigrationHistory;
  private options: Required<RunnerOptions>;

  constructor(connection: Connection | Pool, options: RunnerOptions = {}) {
    this.connection = connection;
    this.options = { ...DEFAULT_OPTIONS, ...options };
    this.history = new MigrationHistory(connection, this.options.schemaName);
  }

  /**
   * Initialize the migration history table.
   */
  async initialize(): Promise<void> {
    await this.history.ensureTable();
  }

  /**
   * Get list of applied migrations.
   */
  async getAppliedMigrations(): Promise<string[]> {
    return this.history.getApplied();
  }

  /**
   * Get list of pending migrations.
   */
  async getPendingMigrations(
    allMigrations: MigrationToRun[]
  ): Promise<MigrationToRun[]> {
    const applied = await this.getAppliedMigrations();
    const appliedSet = new Set(applied);
    return allMigrations.filter((m) => !appliedSet.has(m.version));
  }

  /**
   * Apply all pending migrations.
   */
  async up(migrations: MigrationToRun[]): Promise<MigrationResult> {
    const pending = await this.getPendingMigrations(migrations);
    return this.runMigrations(pending, 'up');
  }

  /**
   * Apply a specific number of pending migrations.
   */
  async upTo(
    migrations: MigrationToRun[],
    count: number
  ): Promise<MigrationResult> {
    const pending = await this.getPendingMigrations(migrations);
    const toApply = pending.slice(0, count);
    return this.runMigrations(toApply, 'up');
  }

  /**
   * Revert the last applied migration.
   */
  async down(migrations: MigrationToRun[]): Promise<MigrationResult> {
    const applied = await this.getAppliedMigrations();
    if (applied.length === 0) {
      return { applied: [], reverted: [], failed: [], success: true };
    }

    const lastVersion = applied.at(-1)!;
    const migration = migrations.find((m) => m.version === lastVersion);

    if (!migration) {
      return {
        applied: [],
        reverted: [],
        failed: [{ version: lastVersion, error: new Error('Migration not found') }],
        success: false,
      };
    }

    return this.runMigrations([migration], 'down');
  }

  /**
   * Revert a specific number of migrations.
   */
  async downTo(
    migrations: MigrationToRun[],
    count: number
  ): Promise<MigrationResult> {
    const applied = await this.getAppliedMigrations();
    const toRevert = applied.slice(-count).toReversed();

    const migrationsToRevert = toRevert
      .map((version) => migrations.find((m) => m.version === version))
      .filter((m): m is MigrationToRun => m !== undefined);

    return this.runMigrations(migrationsToRevert, 'down');
  }

  /**
   * Revert all migrations.
   */
  async reset(migrations: MigrationToRun[]): Promise<MigrationResult> {
    const applied = await this.getAppliedMigrations();
    const toRevert = applied.toReversed();

    const migrationsToRevert = toRevert
      .map((version) => migrations.find((m) => m.version === version))
      .filter((m): m is MigrationToRun => m !== undefined);

    return this.runMigrations(migrationsToRevert, 'down');
  }

  /**
   * Run migrations with optional locking.
   */
  private async runMigrations(
    migrations: MigrationToRun[],
    direction: 'up' | 'down'
  ): Promise<MigrationResult> {
    const result: MigrationResult = {
      applied: [],
      reverted: [],
      failed: [],
      success: true,
    };

    if (migrations.length === 0) {
      return result;
    }

    // Acquire advisory lock
    if (this.options.useLocks) {
      const acquired = await this.acquireLock();
      if (!acquired) {
        throw new Error('Could not acquire migration lock. Another migration may be in progress.');
      }
    }

    try {
      for (const migration of migrations) {
        try {
          await this.runSingleMigration(migration, direction);

          if (direction === 'up') {
            result.applied.push(migration.version);
          } else {
            result.reverted.push(migration.version);
          }
        } catch (error) {
          result.failed.push({
            version: migration.version,
            error: error instanceof Error ? error : new Error(String(error)),
          });
          result.success = false;
          break; // Stop on first failure
        }
      }
    } finally {
      // Release advisory lock
      if (this.options.useLocks) {
        await this.releaseLock();
      }
    }

    return result;
  }

  /**
   * Run a single migration.
   */
  private async runSingleMigration(
    migration: MigrationToRun,
    direction: 'up' | 'down'
  ): Promise<void> {
    const sql = direction === 'up' ? migration.up : migration.down;

    // Execute migration SQL
    await this.connection.execute(sql);

    // Update history
    await (direction === 'up'
      ? this.history.recordApplied(migration.version, migration.description)
      : this.history.recordReverted(migration.version));
  }

  /**
   * Acquire advisory lock.
   */
  private async acquireLock(): Promise<boolean> {
    const result = await this.connection.execute<{
      pg_try_advisory_lock: boolean;
    }>('SELECT pg_try_advisory_lock($1)', [MIGRATION_LOCK_ID]);
    return result[0]?.pg_try_advisory_lock ?? false;
  }

  /**
   * Release advisory lock.
   */
  private async releaseLock(): Promise<void> {
    await this.connection.execute('SELECT pg_advisory_unlock($1)', [MIGRATION_LOCK_ID]);
  }
}

/**
 * Create a migration runner.
 */
export function createMigrationRunner(
  connection: Connection | Pool,
  options: RunnerOptions = {}
): MigrationRunner {
  return new MigrationRunner(connection, options);
}
