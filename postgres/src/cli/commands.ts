/**
 * CLI command implementations for ppg.
 */

import fs, { globSync } from 'node:fs';
import path from 'node:path';
import { createPool, type PoolOptions } from '../connection/pool.js';
import { createSchemaManager } from '../branch/schema-manager.js';
import { createMigrationRunner, type MigrationToRun } from '../migration/runner.js';
import {
  formatMigrationFile,
  generateMigrationFilename,
  generateMigration,
} from '../migration/generator.js';
import { introspectDatabase } from '../migration/introspector.js';
import { compareSchemas } from '../migration/differ.js';
import { parseFiles } from '@/tools/parser/index.js';
import type { TypeAliasMap } from '@/tools/parser/type-aliases.js';
import { generateSchema, validateSchema } from '../codegen/schema-generator.js';
import { generateRepositories } from '../codegen/repository-generator.js';
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
    /** Whether to generate repositories by default */
    generateRepositories?: boolean;
    /** Import path prefix for source types in generated repositories */
    typesImportPrefix?: string;
  };
  pmsgFiles?: string[];
  typeAliases?: TypeAliasMap;
}

/**
 * Options for the generate command.
 */
export interface GenerateCommandOptions {
  /** Generate repository classes */
  repositories?: boolean;
  /** Output directory for generated files */
  outputDir?: string;
}

/**
 * Options for the migrate:create command.
 */
export interface MigrateCreateOptions {
  /** Preview SQL without creating migration file */
  dryRun?: boolean;
  /** Disable transaction wrapping (default: migrations are wrapped in BEGIN/COMMIT) */
  noTransaction?: boolean;
}

/**
 * Validation error for CLI configuration.
 */
export class ConfigValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ConfigValidationError';
  }
}

/**
 * Validate that a value is a plain object.
 */
function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Validate and return a CLI configuration object.
 * Throws ConfigValidationError with a descriptive message if validation fails.
 */
export function validateCliConfig(value: unknown, source: string): CliConfig {
  if (!isPlainObject(value)) {
    throw new ConfigValidationError(
      `Config from ${source} must be an object, got ${typeof value}`
    );
  }

  // Helper to check field types
  const checkString = (
    obj: Record<string, unknown>,
    field: string,
    path: string
  ) => {
    if (obj[field] !== undefined && typeof obj[field] !== 'string') {
      throw new ConfigValidationError(
        `Config ${path} must be a string, got ${typeof obj[field]}`
      );
    }
  };
  const checkNumber = (
    obj: Record<string, unknown>,
    field: string,
    path: string
  ) => {
    if (obj[field] !== undefined && typeof obj[field] !== 'number') {
      throw new ConfigValidationError(
        `Config ${path} must be a number, got ${typeof obj[field]}`
      );
    }
  };
  const checkBoolean = (
    obj: Record<string, unknown>,
    field: string,
    path: string
  ) => {
    if (obj[field] !== undefined && typeof obj[field] !== 'boolean') {
      throw new ConfigValidationError(
        `Config ${path} must be a boolean, got ${typeof obj[field]}`
      );
    }
  };

  // Validate connection
  if (value['connection'] !== undefined) {
    if (!isPlainObject(value['connection'])) {
      throw new ConfigValidationError(
        `Config connection must be an object, got ${typeof value['connection']}`
      );
    }
    const conn = value['connection'];
    checkString(conn, 'host', 'connection.host');
    checkNumber(conn, 'port', 'connection.port');
    checkString(conn, 'database', 'connection.database');
    checkString(conn, 'user', 'connection.user');
    checkString(conn, 'password', 'connection.password');
    checkString(conn, 'schema', 'connection.schema');
    checkString(conn, 'connectionString', 'connection.connectionString');
    checkNumber(conn, 'connectionTimeout', 'connection.connectionTimeout');
    checkNumber(conn, 'idleTimeout', 'connection.idleTimeout');
    checkNumber(conn, 'max', 'connection.max');
    checkNumber(conn, 'min', 'connection.min');
    if (conn['ssl'] !== undefined
        && typeof conn['ssl'] !== 'boolean'
        && conn['ssl'] !== 'require'
        && conn['ssl'] !== 'prefer'
        && !isPlainObject(conn['ssl'])) {
      throw new ConfigValidationError(
        `Config connection.ssl must be boolean, 'require', 'prefer', or an object`
      );
    }
  }

  // Validate schema
  if (value['schema'] !== undefined) {
    if (!isPlainObject(value['schema'])) {
      throw new ConfigValidationError(
        `Config schema must be an object, got ${typeof value['schema']}`
      );
    }
    checkString(value['schema'], 'defaultSchema', 'schema.defaultSchema');
  }

  // Validate migration
  if (value['migration'] !== undefined) {
    if (!isPlainObject(value['migration'])) {
      throw new ConfigValidationError(
        `Config migration must be an object, got ${typeof value['migration']}`
      );
    }
    checkString(value['migration'], 'directory', 'migration.directory');
    checkString(value['migration'], 'tableName', 'migration.tableName');
  }

  // Validate codegen
  if (value['codegen'] !== undefined) {
    if (!isPlainObject(value['codegen'])) {
      throw new ConfigValidationError(
        `Config codegen must be an object, got ${typeof value['codegen']}`
      );
    }
    checkString(value['codegen'], 'outputDir', 'codegen.outputDir');
    checkBoolean(value['codegen'], 'generateRepositories', 'codegen.generateRepositories');
    checkString(value['codegen'], 'typesImportPrefix', 'codegen.typesImportPrefix');
  }

  // Validate pmsgFiles
  if (value['pmsgFiles'] !== undefined) {
    if (!Array.isArray(value['pmsgFiles'])) {
      throw new ConfigValidationError(
        `Config pmsgFiles must be an array, got ${typeof value['pmsgFiles']}`
      );
    }
    const files = value['pmsgFiles'] as unknown[];
    for (let i = 0; i < files.length; i++) {
      if (typeof files[i] !== 'string') {
        throw new ConfigValidationError(
          `Config pmsgFiles[${i}] must be a string, got ${typeof files[i]}`
        );
      }
    }
  }

  return value as unknown as CliConfig;
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
        const content = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
        return validateCliConfig(content, fullPath);
      }
      // For TS/JS files, use dynamic import
      const importedModule = await import(fullPath);
      const moduleRecord = importedModule as Record<string, unknown>;
      const content = 'default' in moduleRecord
        ? moduleRecord['default']
        : moduleRecord;
      return validateCliConfig(content, fullPath);
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
export function generateCommand(
  config: CliConfig,
  options: GenerateCommandOptions = {}
): void {
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
  const { files, diagnostics } = parseFiles(pmsgPaths, {
    typeAliases: config.typeAliases,
  });

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

  // 6. Generate repositories if requested
  const shouldGenerateRepos = options.repositories
    ?? config.codegen?.generateRepositories;
  if (shouldGenerateRepos) {
    const outputDir = options.outputDir ?? config.codegen?.outputDir ?? './generated';

    console.log(`\nGenerating repositories to ${outputDir}...`);

    const repoResult = generateRepositories(files, schema, {
      schemaName,
      typesImportPrefix: config.codegen?.typesImportPrefix,
    });

    if (repoResult.repositories.length === 0) {
      console.log('No repositories to generate.');
      return;
    }

    // Ensure output directory exists
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Write repository files
    for (const repo of repoResult.repositories) {
      const filepath = path.join(outputDir, `${repo.filename}.ts`);
      fs.writeFileSync(filepath, repo.source);
      console.log(`  Generated: ${filepath}`);
    }

    // Write barrel export
    if (repoResult.barrelExport) {
      const barrelPath = path.join(outputDir, 'index.ts');
      fs.writeFileSync(barrelPath, repoResult.barrelExport);
      console.log(`  Generated: ${barrelPath}`);
    }

    console.log(`\nGenerated ${repoResult.repositories.length} repository file(s).`);
  }
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

    const { files, diagnostics } = parseFiles(pmsgPaths, {
      typeAliases: config.typeAliases,
    });
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
  description: string,
  options: MigrateCreateOptions = {}
): Promise<void> {
  if (options.dryRun) {
    console.log('Dry run - migration will not be created\n');
  } else {
    console.log(`Creating migration: ${description}`);
  }

  const migrationDir = config.migration?.directory ?? './migrations';
  const schemaName = config.schema?.defaultSchema ?? 'public';

  // Ensure migrations directory exists
  if (!fs.existsSync(migrationDir)) {
    fs.mkdirSync(migrationDir, { recursive: true });
  }

  const pool = createPool(config.connection);

  try {
    // Generate version timestamp
    const version = new Date().toISOString().replaceAll(/[-:T.]/g, '').slice(0, 14);

    // Discover and parse .pmsg files to get desired schema
    const patterns = config.pmsgFiles ?? ['**/*.pmsg'];
    const pmsgPaths = discoverPmsgFiles(patterns);

    let migration;

    if (pmsgPaths.length === 0) {
      // No .pmsg files - create empty migration template
      console.log('No .pmsg files found. Creating empty migration template.');
      migration = {
        version,
        description,
        up: '-- Add your migration SQL here',
        down: '-- Add your rollback SQL here',
        hasBreakingChanges: false,
      };
    } else {
      // Parse .pmsg files
      const { files, diagnostics } = parseFiles(pmsgPaths, {
        typeAliases: config.typeAliases,
      });
      const errors = diagnostics.filter(d => d.severity === 'error');
      if (errors.length > 0) {
        console.error('Parse errors in .pmsg files:');
        for (const err of errors) {
          console.error(`  ${err.filePath}:${err.location.start.line}: ${err.message}`);
        }
        process.exit(1);
      }

      // Validate schema
      const validation = validateSchema(files);
      if (!validation.valid) {
        console.error('Schema validation errors:');
        for (const err of validation.errors) {
          const field = err.field ? '.' + err.field : '';
          console.error(`  ${err.table}${field}: ${err.message}`);
        }
        process.exit(1);
      }

      // Generate desired schema from .pmsg files
      const desiredSchema = generateSchema(files, { schemaName });

      // Introspect current database schema
      const currentSchema = await introspectDatabase(pool, schemaName);

      // Compare schemas to generate diff
      const diff = compareSchemas(currentSchema, desiredSchema);

      // Check if there are any changes
      const hasChanges =
        diff.tablesToCreate.length > 0
        || diff.tablesToDrop.length > 0
        || diff.tablesToAlter.length > 0;

      if (hasChanges) {
        // Generate migration SQL from diff
        // Wrap in transaction by default (unless --no-transaction is specified)
        migration = generateMigration(diff, {
          version,
          description,
          schemaName,
          wrapInTransaction: !options.noTransaction,
        });

        console.log(`\nDetected changes:`);
        if (diff.tablesToCreate.length > 0) {
          console.log(`  + ${diff.tablesToCreate.length} table(s) to create`);
        }
        if (diff.tablesToDrop.length > 0) {
          console.log(`  - ${diff.tablesToDrop.length} table(s) to drop`);
        }
        if (diff.tablesToAlter.length > 0) {
          console.log(`  ~ ${diff.tablesToAlter.length} table(s) to alter`);
        }
        if (migration.hasBreakingChanges) {
          console.log('\n  WARNING: This migration contains breaking changes!');
        }
      } else {
        console.log('No schema changes detected. Creating empty migration.');
        migration = {
          version,
          description,
          up: '-- No changes detected',
          down: '-- No changes to revert',
          hasBreakingChanges: false,
        };
      }
    }

    // Dry run: print SQL and exit without creating file
    if (options.dryRun) {
      console.log('-- Up');
      console.log(migration.up);
      console.log('\n-- Down');
      console.log(migration.down);
      if (migration.hasBreakingChanges) {
        console.log('\nWARNING: This migration contains breaking changes!');
      }
      console.log('\nTo create this migration, run without --dry-run');
      return;
    }

    const filename = generateMigrationFilename(version, description);
    const filepath = path.join(migrationDir, filename);
    const content = formatMigrationFile(migration);

    // Ensure migrations directory exists
    if (!fs.existsSync(migrationDir)) {
      fs.mkdirSync(migrationDir, { recursive: true });
    }

    fs.writeFileSync(filepath, content);
    console.log(`\nCreated migration: ${filepath}`);
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

  const files = fs.readdirSync(directory).filter(f => f.endsWith('.sql')).toSorted();

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
