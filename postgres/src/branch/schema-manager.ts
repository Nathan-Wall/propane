/**
 * Branch schema management for PostgreSQL.
 *
 * Uses PostgreSQL schemas to isolate database changes between git branches.
 * Each branch gets its own schema (e.g., feature_add_auth.users).
 */

import type { Connection } from '../connection/connection.js';
import type { Pool } from '../connection/pool.js';
import { escapeIdentifier } from '../mapping/serializer.js';

/**
 * Information about a branch schema.
 */
export interface BranchSchemaInfo {
  /** The schema name in PostgreSQL */
  schemaName: string;
  /** The original branch name */
  branchName: string;
  /** When the schema was created */
  createdAt?: Date;
  /** Number of tables in the schema */
  tableCount?: number;
}

/**
 * Manages branch-specific PostgreSQL schemas.
 */
export class SchemaManager {
  private connection: Connection | Pool;

  constructor(connection: Connection | Pool) {
    this.connection = connection;
  }

  /**
   * Convert a branch name to a valid PostgreSQL schema name.
   */
  branchToSchemaName(branchName: string): string {
    return branchName
      .replaceAll(/[^a-z0-9]/gi, '_')
      .toLowerCase()
      .replaceAll(/^_+|_+$/g, '')
      .replaceAll(/_+/g, '_')
      .slice(0, 63); // PostgreSQL identifier limit
  }

  /**
   * Create a new schema for a branch.
   */
  async createBranch(branchName: string): Promise<string> {
    const schemaName = this.branchToSchemaName(branchName);

    await this.connection.execute(
      `CREATE SCHEMA IF NOT EXISTS ${escapeIdentifier(schemaName)}`
    );

    return schemaName;
  }

  /**
   * Clone an existing schema to a new branch schema.
   *
   * This copies all tables, data, indexes, and constraints.
   */
  async cloneBranch(
    sourceBranch: string,
    targetBranch: string
  ): Promise<string> {
    const sourceSchema = this.branchToSchemaName(sourceBranch);
    const targetSchema = this.branchToSchemaName(targetBranch);

    // Create the target schema
    await this.connection.execute(
      `CREATE SCHEMA IF NOT EXISTS ${escapeIdentifier(targetSchema)}`
    );

    // Get all tables in source schema
    const tables = await this.connection.execute<{ table_name: string }>(
      `SELECT table_name FROM information_schema.tables WHERE table_schema = $1 AND table_type = 'BASE TABLE'`,
      [sourceSchema]
    );

    // Clone each table with data
    for (const { table_name } of tables) {
      const sourceTable = `${escapeIdentifier(sourceSchema)}.${escapeIdentifier(table_name)}`;
      const targetTable = `${escapeIdentifier(targetSchema)}.${escapeIdentifier(table_name)}`;

      // Create table structure with data
      await this.connection.execute(
        `CREATE TABLE ${targetTable} (LIKE ${sourceTable} INCLUDING ALL)`
      );

      // Copy data
      await this.connection.execute(
        `INSERT INTO ${targetTable} SELECT * FROM ${sourceTable}`
      );
    }

    // Clone sequences
    const sequences = await this.connection.execute<{ sequence_name: string }>(
      `SELECT sequence_name FROM information_schema.sequences WHERE sequence_schema = $1`,
      [sourceSchema]
    );

    for (const { sequence_name } of sequences) {
      // Get current value
      const seqValue = await this.connection.execute<{ last_value: string }>(
        `SELECT last_value FROM ${escapeIdentifier(sourceSchema)}.${escapeIdentifier(sequence_name)}`
      );

      const firstRow = seqValue[0];
      if (firstRow) {
        // Set the target sequence to the same value
        await this.connection.execute(
          `SELECT setval('${escapeIdentifier(targetSchema)}.${escapeIdentifier(sequence_name)}', $1, true)`,
          [firstRow.last_value]
        );
      }
    }

    return targetSchema;
  }

  /**
   * Drop a branch schema and all its contents.
   */
  async dropBranch(branchName: string): Promise<void> {
    const schemaName = this.branchToSchemaName(branchName);

    // CASCADE drops all objects in the schema
    await this.connection.execute(
      `DROP SCHEMA IF EXISTS ${escapeIdentifier(schemaName)} CASCADE`
    );
  }

  /**
   * Check if a branch schema exists.
   */
  async branchExists(branchName: string): Promise<boolean> {
    const schemaName = this.branchToSchemaName(branchName);

    const result = await this.connection.execute<{ exists: boolean }>(
      `SELECT EXISTS(SELECT 1 FROM information_schema.schemata WHERE schema_name = $1) as exists`,
      [schemaName]
    );

    return result[0]?.exists ?? false;
  }

  /**
   * List all branch schemas.
   *
   * Returns schemas that look like branch names (excludes pg_*, information_schema, public).
   */
  async listBranches(): Promise<BranchSchemaInfo[]> {
    const result = await this.connection.execute<{
      schema_name: string;
      table_count: string;
    }>(`
      SELECT
        s.schema_name,
        COUNT(t.table_name)::text as table_count
      FROM information_schema.schemata s
      LEFT JOIN information_schema.tables t
        ON t.table_schema = s.schema_name AND t.table_type = 'BASE TABLE'
      WHERE s.schema_name NOT LIKE 'pg_%'
        AND s.schema_name != 'information_schema'
        AND s.schema_name != 'public'
      GROUP BY s.schema_name
      ORDER BY s.schema_name
    `);

    return result.map((row) => ({
      schemaName: row.schema_name,
      branchName: row.schema_name, // Best guess - we don't store the original name
      tableCount: Number.parseInt(row.table_count, 10),
    }));
  }

  /**
   * Get information about a specific branch schema.
   */
  async getBranchInfo(branchName: string): Promise<BranchSchemaInfo | null> {
    const schemaName = this.branchToSchemaName(branchName);

    const result = await this.connection.execute<{ table_count: string }>(`
      SELECT COUNT(*)::text as table_count
      FROM information_schema.tables
      WHERE table_schema = $1 AND table_type = 'BASE TABLE'
    `, [schemaName]);

    const firstRow = result[0];
    if (!firstRow) {
      return null;
    }

    return {
      schemaName,
      branchName,
      tableCount: Number.parseInt(firstRow.table_count, 10),
    };
  }

  /**
   * Rename a branch schema.
   */
  async renameBranch(
    oldBranchName: string,
    newBranchName: string
  ): Promise<string> {
    const oldSchema = this.branchToSchemaName(oldBranchName);
    const newSchema = this.branchToSchemaName(newBranchName);

    await this.connection.execute(
      `ALTER SCHEMA ${escapeIdentifier(oldSchema)} RENAME TO ${escapeIdentifier(newSchema)}`
    );

    return newSchema;
  }

  /**
   * Get the current search path.
   */
  async getCurrentSearchPath(): Promise<string[]> {
    const result = await this.connection.execute<{ search_path: string }>(
      'SHOW search_path'
    );
    const searchPath = result[0]?.search_path;
    return searchPath ? searchPath.split(',').map((s) => s.trim()) : ['public'];
  }

  /**
   * Set the search path to include a branch schema.
   */
  async setSearchPath(branchName: string, includePublic = true): Promise<void> {
    const schemaName = this.branchToSchemaName(branchName);
    const path = includePublic ? `${schemaName}, public` : schemaName;

    await this.connection.execute(`SET search_path TO ${path}`);
  }
}

/**
 * Create a schema manager.
 */
export function createSchemaManager(
  connection: Connection | Pool
): SchemaManager {
  return new SchemaManager(connection);
}
