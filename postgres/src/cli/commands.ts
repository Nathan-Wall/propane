/**
 * CLI command implementations for ppg.
 */

import fs, { globSync } from 'node:fs';
import path from 'node:path';
import { createPool, type PoolOptions } from '../connection/pool.js';
import { createSchemaManager } from '../branch/schema-manager.js';
import { createMigrationRunner, type MigrationToRun } from '../migration/runner.js';
import { formatMigrationFile, generateMigrationFilename } from '../migration/generator.js';
import { introspectDatabase } from '../migration/introspector.js';
import { compareSchemas } from '../migration/differ.js';
import { parseFiles } from '@/tools/parser/index.js';
import { generateSchema, validateSchema } from '../codegen/schema-generator.js';
import type {
  DatabaseSchema,
  SchemaDiff,
  TableAlteration,
  ColumnAlteration,
} from '../schema/types.js';

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
 * Discover .pmsg files matching the given glob patterns.
 */
function discoverPmsgFiles(patterns: string[]): string[] {
  const files: string[] = [];
  for (const pattern of patterns) {
    files.push(...globSync(pattern));
  }
  // Dedupe and sort
  return [...new Set(files)].toSorted();
}

/**
 * Generate schema from .pmsg files.
 */
export function generateCommand(config: CliConfig): void {
  console.log('Generating schema from .pmsg files...');

  // 1. Discover .pmsg files
  const patterns = config.pmsgFiles ?? ['**/*.pmsg'];
  const pmsgPaths = discoverPmsgFiles(patterns);

  if (pmsgPaths.length === 0) {
    console.log('No .pmsg files found matching patterns:', patterns.join(', '));
    return;
  }

  console.log(`Found ${pmsgPaths.length} .pmsg file(s)`);

  // 2. Parse files
  const { files, diagnostics } = parseFiles(pmsgPaths);

  // Report parse errors
  const errors = diagnostics.filter(d => d.severity === 'error');
  if (errors.length > 0) {
    console.error('\nParse errors:');
    for (const err of errors) {
      console.error(`  ${err.filePath}:${err.location.start.line}: ${err.message}`);
    }
    process.exit(1);
  }

  // 3. Validate schema
  const validation = validateSchema(files);
  if (!validation.valid) {
    console.error('\nSchema validation errors:');
    for (const err of validation.errors) {
      const field = err.field ? '.' + err.field : '';
      console.error(`  ${err.table}${field}: ${err.message}`);
    }
    process.exit(1);
  }

  // 4. Generate schema
  const schemaName = config.schema?.defaultSchema ?? 'public';
  const schema = generateSchema(files, { schemaName });

  // 5. Output summary
  const tableNames = Object.keys(schema.tables);
  console.log(`\nGenerated schema: ${schemaName}`);
  console.log(`Tables: ${tableNames.length}`);

  if (tableNames.length === 0) {
    console.log('\nNo Table<{...}> types found in parsed files.');
    return;
  }

  for (const tableName of tableNames) {
    const table = schema.tables[tableName]!;
    const colCount = Object.keys(table.columns).length;
    const idxCount = table.indexes.length;
    const fkCount = table.foreignKeys.length;
    console.log(`  ${tableName}: ${colCount} columns, ${idxCount} indexes, ${fkCount} FKs`);
  }

  console.log('\nSchema generated successfully.');
}

/**
 * Show diff between current database and desired schema from .pmsg files.
 */
export async function diffCommand(config: CliConfig): Promise<void> {
  console.log('Comparing schema...\n');

  const pool = createPool(config.connection);
  const schemaName = config.schema?.defaultSchema ?? 'public';

  try {
    // 1. Discover and parse .pmsg files
    const patterns = config.pmsgFiles ?? ['**/*.pmsg'];
    const pmsgPaths = discoverPmsgFiles(patterns);

    if (pmsgPaths.length === 0) {
      console.log('No .pmsg files found. Showing database schema only.\n');
      const currentSchema = await introspectDatabase(pool, schemaName);
      displayDatabaseSchema(currentSchema, schemaName);
      return;
    }

    const { files, diagnostics } = parseFiles(pmsgPaths);
    const errors = diagnostics.filter(d => d.severity === 'error');
    if (errors.length > 0) {
      console.error('Parse errors in .pmsg files:');
      for (const err of errors) {
        console.error(`  ${err.filePath}:${err.location.start.line}: ${err.message}`);
      }
      process.exit(1);
    }

    // 2. Generate desired schema
    const desiredSchema = generateSchema(files, { schemaName });

    // 3. Introspect current database schema
    const currentSchema = await introspectDatabase(pool, schemaName);

    // 4. Compare schemas
    const diff = compareSchemas(currentSchema, desiredSchema);

    // 5. Display diff
    if (!hasDiffChanges(diff)) {
      console.log('Database schema matches .pmsg files. No changes needed.');
      return;
    }

    displaySchemaDiff(diff);

    if (diff.warnings.length > 0) {
      console.log('\nWarnings:');
      for (const warning of diff.warnings) {
        console.log(`  ${warning.table}: ${warning.message}`);
        if (warning.suggestion) {
          console.log(`    Hint: ${warning.suggestion}`);
        }
      }
    }

    if (diff.hasBreakingChanges) {
      console.log('\nThis diff contains breaking changes (DROP operations).');
    }
  } finally {
    await pool.end();
  }
}

/**
 * Display a database schema in a readable format.
 */
function displayDatabaseSchema(
  schema: DatabaseSchema,
  schemaName: string
): void {
  console.log(`Database schema: ${schemaName}`);
  console.log(`Tables found: ${Object.keys(schema.tables).length}`);

  for (const [tableName, table] of Object.entries(schema.tables)) {
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
}

/**
 * Check if a SchemaDiff has any changes.
 */
function hasDiffChanges(diff: SchemaDiff): boolean {
  return (
    diff.tablesToCreate.length > 0
    || diff.tablesToDrop.length > 0
    || diff.tablesToAlter.length > 0
  );
}

/**
 * Display a schema diff in a readable format.
 */
function displaySchemaDiff(diff: SchemaDiff): void {
  let changeCount = 0;

  // Tables to create
  for (const table of diff.tablesToCreate) {
    changeCount++;
    console.log(`+ CREATE TABLE ${table.name}`);
    for (const [colName, col] of Object.entries(table.columns)) {
      const flags: string[] = [];
      if (col.isPrimaryKey) flags.push('PK');
      if (col.isAutoIncrement) flags.push('AUTO');
      if (!col.nullable) flags.push('NOT NULL');
      const flagStr = flags.length > 0 ? ` [${flags.join(', ')}]` : '';
      console.log(`    + ${colName}: ${col.type}${flagStr}`);
    }
  }

  // Tables to drop
  for (const tableName of diff.tablesToDrop) {
    changeCount++;
    console.log(`- DROP TABLE ${tableName}`);
  }

  // Tables to alter
  for (const alteration of diff.tablesToAlter) {
    displayTableAlteration(alteration);
    changeCount++;
  }

  console.log(`\nFound ${changeCount} change(s).`);
}

/**
 * Display alterations for a single table.
 */
function displayTableAlteration(alteration: TableAlteration): void {
  console.log(`~ ALTER TABLE ${alteration.tableName}`);

  for (const col of alteration.columnsToAdd) {
    console.log(`    + ADD COLUMN ${col.name}: ${col.type}`);
  }

  for (const colName of alteration.columnsToDrop) {
    console.log(`    - DROP COLUMN ${colName}`);
  }

  for (const rename of alteration.columnsToRename) {
    console.log(`    ~ RENAME COLUMN ${rename.from} TO ${rename.to}`);
  }

  for (const colAlt of alteration.columnsToAlter) {
    displayColumnAlteration(alteration.tableName, colAlt);
  }

  for (const idx of alteration.indexesToCreate) {
    const unique = idx.unique ? 'UNIQUE ' : '';
    console.log(`    + CREATE ${unique}INDEX ${idx.name} (${idx.columns.join(', ')})`);
  }

  for (const idxName of alteration.indexesToDrop) {
    console.log(`    - DROP INDEX ${idxName}`);
  }

  for (const fk of alteration.foreignKeysToAdd) {
    console.log(`    + ADD FK ${fk.name}: (${fk.columns.join(', ')}) -> ${fk.referencedTable}`);
  }

  for (const fkName of alteration.foreignKeysToDrop) {
    console.log(`    - DROP FK ${fkName}`);
  }

  for (const check of alteration.checksToAdd) {
    console.log(`    + ADD CHECK ${check.name}`);
  }

  for (const checkName of alteration.checksToDrop) {
    console.log(`    - DROP CHECK ${checkName}`);
  }
}

/**
 * Display alterations for a single column.
 */
function displayColumnAlteration(
  unused_tableName: string,
  alteration: ColumnAlteration
): void {
  const changes: string[] = [];

  if (alteration.typeChange) {
    changes.push(`type: ${alteration.typeChange.from} -> ${alteration.typeChange.to}`);
  }

  if (alteration.nullableChange) {
    const from = alteration.nullableChange.from ? 'NULL' : 'NOT NULL';
    const to = alteration.nullableChange.to ? 'NULL' : 'NOT NULL';
    changes.push(`${from} -> ${to}`);
  }

  if (alteration.defaultChange) {
    const from = alteration.defaultChange.from ?? 'none';
    const to = alteration.defaultChange.to ?? 'none';
    changes.push(`default: ${from} -> ${to}`);
  }

  if (changes.length > 0) {
    console.log(`    ~ ALTER COLUMN ${alteration.columnName}: ${changes.join(', ')}`);
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
