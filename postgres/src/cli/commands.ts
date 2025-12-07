/**
 * CLI command implementations for ppg.
 */

import fs from 'node:fs';
import path from 'node:path';
import { createPool, type PoolOptions } from '../connection/pool.js';
import { createSchemaManager } from '../branch/schema-manager.js';
import { createMigrationRunner, type MigrationToRun } from '../migration/runner.js';
import { formatMigrationFile, generateMigrationFilename } from '../migration/generator.js';
import { introspectDatabase } from '../migration/introspector.js';
import { compareSchemas } from '../migration/differ.js';

/**
 * Configuration for the CLI.
 */
export interface CliConfig {
  connection: PoolOptions;
  schema?: {
    defaultSchema?: string;
  };
  migration?: {
    directory?: string;
    tableName?: string;
  };
  codegen?: {
    outputDir?: string;
  };
  pmsgFiles?: string[];
}

/**
 * Load configuration from file.
 */
export async function loadConfig(configPath?: string): Promise<CliConfig> {
  const searchPaths = configPath
    ? [configPath]
    : ['propane-pg.config.ts', 'propane-pg.config.js', 'propane-pg.config.json'];

  for (const searchPath of searchPaths) {
    const fullPath = path.resolve(process.cwd(), searchPath);
    if (fs.existsSync(fullPath)) {
      if (fullPath.endsWith('.json')) {
        return JSON.parse(fs.readFileSync(fullPath, 'utf8')) as CliConfig;
      }
      // For TS/JS files, use dynamic import
      const module: { default?: CliConfig } = await import(fullPath);
      return module.default ?? (module as unknown as CliConfig);
    }
  }

  // Return default config
  return {
    connection: {
      host: process.env['DB_HOST'] ?? 'localhost',
      port: Number.parseInt(process.env['DB_PORT'] ?? '5432', 10),
      database: process.env['DB_NAME'] ?? 'postgres',
      user: process.env['DB_USER'] ?? 'postgres',
      password: process.env['DB_PASSWORD'] ?? '',
    },
    migration: {
      directory: './migrations',
    },
  };
}

/**
 * Generate schema from .pmsg files.
 */
export function generateCommand(unused_config: CliConfig): void {
  console.log('Generating schema from .pmsg files...');

  // TODO: Implement .pmsg parsing and schema generation
  // This would integrate with the existing Propane parser

  console.log('Schema generation not yet implemented.');
  console.log('This will parse .pmsg files and generate the database schema.');
}

/**
 * Show diff between current database and schema.
 *
 * Note: Currently only shows the introspected database schema.
 * Full diff requires .pmsg parsing integration (generateCommand).
 */
export async function diffCommand(config: CliConfig): Promise<void> {
  console.log('Introspecting database schema...');

  const pool = createPool(config.connection);
  const schemaName = config.schema?.defaultSchema ?? 'public';

  try {
    const currentSchema = await introspectDatabase(pool, schemaName);

    console.log(`\nDatabase schema: ${schemaName}`);
    console.log(`Tables found: ${Object.keys(currentSchema.tables).length}`);

    for (const [tableName, table] of Object.entries(currentSchema.tables)) {
      console.log(`\n  ${tableName}:`);
      for (const [colName, col] of Object.entries(table.columns)) {
        const flags: string[] = [];
        if (col.isPrimaryKey) flags.push('PK');
        if (col.isAutoIncrement) flags.push('AUTO');
        if (col.isUnique) flags.push('UNIQUE');
        if (!col.nullable) flags.push('NOT NULL');
        const flagStr = flags.length > 0 ? ` [${flags.join(', ')}]` : '';
        console.log(`    ${colName}: ${col.type}${flagStr}`);
      }
      if (table.indexes.length > 0) {
        console.log('    Indexes:');
        for (const idx of table.indexes) {
          const unique = idx.unique ? 'UNIQUE ' : '';
          console.log(`      ${idx.name}: ${unique}(${idx.columns.join(', ')})`);
        }
      }
      if (table.foreignKeys.length > 0) {
        console.log('    Foreign Keys:');
        for (const fk of table.foreignKeys) {
          console.log(`      ${fk.name}: (${fk.columns.join(', ')}) -> ${fk.referencedTable}(${fk.referencedColumns.join(', ')})`);
        }
      }
    }

    console.log('\nNote: Full diff with .pmsg files requires `ppg generate` first.');
  } finally {
    await pool.end();
  }
}

/**
 * Create a new migration.
 */
export async function migrateCreateCommand(
  config: CliConfig,
  description: string
): Promise<void> {
  console.log(`Creating migration: ${description}`);

  const migrationDir = config.migration?.directory ?? './migrations';

  // Ensure migrations directory exists
  if (!fs.existsSync(migrationDir)) {
    fs.mkdirSync(migrationDir, { recursive: true });
  }

  const pool = createPool(config.connection);

  try {
    // Generate version timestamp
    const version = new Date().toISOString().replaceAll(/[-:T.]/g, '').slice(0, 14);

    // TODO: Get current database schema and desired schema
    // For now, create an empty migration template

    const migration = {
      version,
      description,
      up: '-- Add your migration SQL here',
      down: '-- Add your rollback SQL here',
      hasBreakingChanges: false,
    };

    const filename = generateMigrationFilename(version, description);
    const filepath = path.join(migrationDir, filename);
    const content = formatMigrationFile(migration);

    fs.writeFileSync(filepath, content);
    console.log(`Created migration: ${filepath}`);
  } finally {
    await pool.end();
  }
}

/**
 * Apply pending migrations.
 */
export async function migrateUpCommand(config: CliConfig): Promise<void> {
  console.log('Applying pending migrations...');

  const pool = createPool(config.connection);
  const runner = createMigrationRunner(pool, {
    schemaName: config.schema?.defaultSchema ?? 'public',
  });

  try {
    await runner.initialize();

    // Load migrations from directory
    const migrations = await loadMigrations(config.migration?.directory ?? './migrations');
    const result = await runner.up(migrations);

    if (result.applied.length === 0) {
      console.log('No pending migrations.');
    } else {
      console.log(`Applied ${result.applied.length} migration(s):`);
      for (const version of result.applied) {
        console.log(`  - ${version}`);
      }
    }

    if (result.failed.length > 0) {
      console.error('Failed migrations:');
      for (const { version, error } of result.failed) {
        console.error(`  - ${version}: ${error.message}`);
      }
      process.exit(1);
    }
  } finally {
    await pool.end();
  }
}

/**
 * Rollback the last migration.
 */
export async function migrateDownCommand(config: CliConfig): Promise<void> {
  console.log('Rolling back last migration...');

  const pool = createPool(config.connection);
  const runner = createMigrationRunner(pool, {
    schemaName: config.schema?.defaultSchema ?? 'public',
  });

  try {
    await runner.initialize();

    const migrations = await loadMigrations(config.migration?.directory ?? './migrations');
    const result = await runner.down(migrations);

    if (result.reverted.length === 0) {
      console.log('No migrations to rollback.');
    } else {
      console.log(`Rolled back ${result.reverted.length} migration(s):`);
      for (const version of result.reverted) {
        console.log(`  - ${version}`);
      }
    }

    if (result.failed.length > 0) {
      console.error('Failed rollbacks:');
      for (const { version, error } of result.failed) {
        console.error(`  - ${version}: ${error.message}`);
      }
      process.exit(1);
    }
  } finally {
    await pool.end();
  }
}

/**
 * Create a branch schema.
 */
export async function branchCreateCommand(
  config: CliConfig,
  branchName: string
): Promise<void> {
  console.log(`Creating branch schema: ${branchName}`);

  const pool = createPool(config.connection);
  const manager = createSchemaManager(pool);

  try {
    const schemaName = await manager.createBranch(branchName);
    console.log(`Created schema: ${schemaName}`);
  } finally {
    await pool.end();
  }
}

/**
 * Clone a branch schema.
 */
export async function branchCloneCommand(
  config: CliConfig,
  sourceBranch: string,
  targetBranch: string
): Promise<void> {
  console.log(`Cloning branch schema: ${sourceBranch} -> ${targetBranch}`);

  const pool = createPool(config.connection);
  const manager = createSchemaManager(pool);

  try {
    const schemaName = await manager.cloneBranch(sourceBranch, targetBranch);
    console.log(`Cloned to schema: ${schemaName}`);
  } finally {
    await pool.end();
  }
}

/**
 * Drop a branch schema.
 */
export async function branchDropCommand(
  config: CliConfig,
  branchName: string
): Promise<void> {
  console.log(`Dropping branch schema: ${branchName}`);

  const pool = createPool(config.connection);
  const manager = createSchemaManager(pool);

  try {
    await manager.dropBranch(branchName);
    console.log(`Dropped schema for branch: ${branchName}`);
  } finally {
    await pool.end();
  }
}

/**
 * List all branch schemas.
 */
export async function branchListCommand(config: CliConfig): Promise<void> {
  const pool = createPool(config.connection);
  const manager = createSchemaManager(pool);

  try {
    const branches = await manager.listBranches();

    if (branches.length === 0) {
      console.log('No branch schemas found.');
    } else {
      console.log('Branch schemas:');
      for (const branch of branches) {
        console.log(`  ${branch.schemaName} (${branch.tableCount} tables)`);
      }
    }
  } finally {
    await pool.end();
  }
}

/**
 * Load migrations from a directory.
 */
function loadMigrations(directory: string): Promise<MigrationToRun[]> {
  const migrations: MigrationToRun[] = [];

  if (!fs.existsSync(directory)) {
    return Promise.resolve(migrations);
  }

  const files = fs.readdirSync(directory).filter((f) => f.endsWith('.sql')).toSorted();

  for (const file of files) {
    const content = fs.readFileSync(path.join(directory, file), 'utf8');
    const parsed = parseMigrationFile(content, file);
    if (parsed) {
      migrations.push(parsed);
    }
  }

  return Promise.resolve(migrations);
}

/**
 * Parse a migration SQL file.
 */
function parseMigrationFile(
  content: string,
  filename: string
): MigrationToRun | null {
  // Extract version from filename (assumes format: VERSION_description.sql)
  const match = /^(\d+)/.exec(filename);
  if (!match?.[1]) {
    console.warn(`Skipping invalid migration file: ${filename}`);
    return null;
  }

  const version = match[1];

  // Parse up and down sections
  const sections = content.split(/^-- (Up|Down)$/m);

  let up = '';
  let down = '';
  let description = '';

  // Extract description from header comment
  const descMatch = /^-- Migration: (.+)$/m.exec(content);
  if (descMatch?.[1]) {
    description = descMatch[1];
  }

  for (let i = 1; i < sections.length; i += 2) {
    const sectionName = sections[i];
    const sectionContent = sections[i + 1]?.trim() ?? '';

    if (sectionName === 'Up') {
      up = sectionContent;
    } else if (sectionName === 'Down') {
      down = sectionContent;
    }
  }

  return { version, description, up, down };
}
