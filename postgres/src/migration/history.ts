/**
 * Migration history tracking.
 *
 * Tracks which migrations have been applied to the database.
 */

import type { Connection } from '../connection/connection.js';
import type { Pool } from '../connection/pool.js';
import { escapeIdentifier } from '../mapping/serializer.js';

/**
 * A recorded migration.
 */
export interface MigrationRecord {
  /** Migration version */
  version: string;
  /** Migration description */
  description: string;
  /** When the migration was applied */
  appliedAt: Date;
}

/**
 * Tracks migration history in a database table.
 */
export class MigrationHistory {
  private connection: Connection | Pool;
  private schemaName: string;
  private tableName: string;

  constructor(
    connection: Connection | Pool,
    schemaName = 'public',
    tableName = '_propane_migrations'
  ) {
    this.connection = connection;
    this.schemaName = schemaName;
    this.tableName = tableName;
  }

  /**
   * Get the fully qualified table name.
   */
  private get qualifiedTableName(): string {
    return `${escapeIdentifier(this.schemaName)}.${escapeIdentifier(this.tableName)}`;
  }

  /**
   * Ensure the migrations table exists.
   */
  async ensureTable(): Promise<void> {
    await this.connection.execute(`
      CREATE TABLE IF NOT EXISTS ${this.qualifiedTableName} (
        version TEXT PRIMARY KEY,
        description TEXT NOT NULL,
        applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
  }

  /**
   * Get list of applied migration versions.
   */
  async getApplied(): Promise<string[]> {
    const result = await this.connection.execute<{ version: string }>(
      `SELECT version FROM ${this.qualifiedTableName} ORDER BY applied_at ASC`
    );
    return result.map((row) => row.version);
  }

  /**
   * Get full records of applied migrations.
   */
  async getAppliedRecords(): Promise<MigrationRecord[]> {
    const result = await this.connection.execute<{
      version: string;
      description: string;
      applied_at: Date;
    }>(`SELECT version, description, applied_at FROM ${this.qualifiedTableName} ORDER BY applied_at ASC`);

    return result.map((row) => ({
      version: row.version,
      description: row.description,
      appliedAt: row.applied_at,
    }));
  }

  /**
   * Check if a migration has been applied.
   */
  async isApplied(version: string): Promise<boolean> {
    const result = await this.connection.execute<{ count: string }>(
      `SELECT COUNT(*) as count FROM ${this.qualifiedTableName} WHERE version = $1`,
      [version]
    );
    return Number.parseInt(result[0]?.count ?? '0', 10) > 0;
  }

  /**
   * Record a migration as applied.
   */
  async recordApplied(version: string, description: string): Promise<void> {
    await this.connection.execute(
      `INSERT INTO ${this.qualifiedTableName} (version, description) VALUES ($1, $2)`,
      [version, description]
    );
  }

  /**
   * Record a migration as reverted (remove from history).
   */
  async recordReverted(version: string): Promise<void> {
    await this.connection.execute(
      `DELETE FROM ${this.qualifiedTableName} WHERE version = $1`,
      [version]
    );
  }

  /**
   * Clear all migration history.
   */
  async clear(): Promise<void> {
    await this.connection.execute(`DELETE FROM ${this.qualifiedTableName}`);
  }

  /**
   * Drop the migrations table.
   */
  async drop(): Promise<void> {
    await this.connection.execute(`DROP TABLE IF EXISTS ${this.qualifiedTableName}`);
  }
}

/**
 * Create a migration history tracker.
 */
export function createMigrationHistory(
  connection: Connection | Pool,
  schemaName = 'public',
  tableName = '_propane_migrations'
): MigrationHistory {
  return new MigrationHistory(connection, schemaName, tableName);
}
