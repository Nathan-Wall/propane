/**
 * Migration SQL generator.
 *
 * Generates SQL statements from schema diffs.
 */

import type {
  SchemaDiff,
  TableDefinition,
  TableAlteration,
  ColumnDefinition,
  ColumnAlteration,
  IndexDefinition,
  ForeignKeyDefinition,
} from '../schema/types.js';
import { escapeIdentifier } from '../mapping/serializer.js';

/**
 * A generated migration.
 */
export interface Migration {
  /** Migration version/timestamp */
  version: string;
  /** Human-readable description */
  description: string;
  /** SQL for applying the migration */
  up: string;
  /** SQL for reverting the migration */
  down: string;
  /** Whether this migration has breaking changes */
  hasBreakingChanges: boolean;
}

/**
 * Options for migration generation.
 */
export interface GeneratorOptions {
  /** Schema name to use in generated SQL */
  schemaName?: string;
  /** Whether to include transaction wrappers */
  wrapInTransaction?: boolean;
}

/**
 * Generate a migration from a schema diff.
 */
export function generateMigration(
  diff: SchemaDiff,
  options: GeneratorOptions & { version: string; description: string }
): Migration {
  const schemaPrefix = options.schemaName && options.schemaName !== 'public'
    ? `${escapeIdentifier(options.schemaName)}.`
    : '';

  const upStatements: string[] = [];
  const downStatements: string[] = [];

  // Create new tables
  for (const table of diff.tablesToCreate) {
    upStatements.push(generateCreateTable(table, schemaPrefix));
    downStatements.unshift(generateDropTable(table.name, schemaPrefix));
  }

  // Drop old tables (in reverse for down)
  for (const tableName of diff.tablesToDrop) {
    upStatements.push(generateDropTable(tableName, schemaPrefix));
    // Note: We can't restore dropped tables without the original definition
    downStatements.unshift(`-- Cannot restore dropped table ${tableName} without original definition`);
  }

  // Alter existing tables
  for (const alteration of diff.tablesToAlter) {
    const { up, down } = generateTableAlteration(alteration, schemaPrefix);
    upStatements.push(...up);
    downStatements.unshift(...down);
  }

  let up = upStatements.join('\n\n');
  let down = downStatements.join('\n\n');

  if (options.wrapInTransaction) {
    up = `BEGIN;\n\n${up}\n\nCOMMIT;`;
    down = `BEGIN;\n\n${down}\n\nCOMMIT;`;
  }

  return {
    version: options.version,
    description: options.description,
    up,
    down,
    hasBreakingChanges: diff.hasBreakingChanges,
  };
}

/**
 * Generate CREATE TABLE statement.
 */
function generateCreateTable(
  table: TableDefinition,
  schemaPrefix: string
): string {
  const lines: string[] = [];
  const constraints: string[] = [];

  // Columns
  for (const [, col] of Object.entries(table.columns)) {
    lines.push(`  ${generateColumnDef(col)}`);
  }

  // Primary key (if not inline with column)
  if (table.primaryKey.length > 1) {
    constraints.push(`  PRIMARY KEY (${table.primaryKey.map(escapeIdentifier).join(', ')})`);
  }

  // Unique constraints (from columns)
  for (const [name, col] of Object.entries(table.columns)) {
    if (col.isUnique && !col.isPrimaryKey) {
      constraints.push(`  UNIQUE (${escapeIdentifier(name)})`);
    }
  }

  // Check constraints
  for (const check of table.checkConstraints) {
    constraints.push(`  CONSTRAINT ${escapeIdentifier(check.name)} CHECK (${check.expression})`);
  }

  const allLines = [...lines, ...constraints];
  const tableName = `${schemaPrefix}${escapeIdentifier(table.name)}`;

  let sql = `CREATE TABLE ${tableName} (\n${allLines.join(',\n')}\n);`;

  // Add indexes
  for (const index of table.indexes) {
    sql += '\n' + generateCreateIndex(index, table.name, schemaPrefix);
  }

  // Add foreign keys
  for (const fk of table.foreignKeys) {
    sql += '\n' + generateAddForeignKey(fk, table.name, schemaPrefix);
  }

  return sql;
}

/**
 * Generate column definition for CREATE TABLE.
 */
function generateColumnDef(col: ColumnDefinition): string {
  const parts: string[] = [escapeIdentifier(col.name)];

  // Type (use SERIAL/BIGSERIAL for auto-increment)
  if (col.isAutoIncrement) {
    parts.push(col.type === 'BIGINT' ? 'BIGSERIAL' : 'SERIAL');
  } else {
    parts.push(col.type);
  }

  // NOT NULL
  if (!col.nullable && !col.isPrimaryKey) {
    parts.push('NOT NULL');
  }

  // Default
  if (col.defaultValue !== undefined) {
    parts.push(`DEFAULT ${col.defaultValue}`);
  }

  // Primary key (inline for single-column PKs)
  if (col.isPrimaryKey) {
    parts.push('PRIMARY KEY');
  }

  return parts.join(' ');
}

/**
 * Generate DROP TABLE statement.
 */
function generateDropTable(tableName: string, schemaPrefix: string): string {
  return `DROP TABLE ${schemaPrefix}${escapeIdentifier(tableName)};`;
}

/**
 * Generate ALTER TABLE statements.
 */
function generateTableAlteration(
  alteration: TableAlteration,
  schemaPrefix: string
): { up: string[]; down: string[] } {
  const up: string[] = [];
  const down: string[] = [];
  const tableName = `${schemaPrefix}${escapeIdentifier(alteration.tableName)}`;

  // Rename columns first (before drops, as they might be renamed before being processed)
  for (const { from, to } of alteration.columnsToRename) {
    up.push(`ALTER TABLE ${tableName} RENAME COLUMN ${escapeIdentifier(from)} TO ${escapeIdentifier(to)};`);
    down.push(`ALTER TABLE ${tableName} RENAME COLUMN ${escapeIdentifier(to)} TO ${escapeIdentifier(from)};`);
  }

  // Add new columns
  for (const col of alteration.columnsToAdd) {
    up.push(`ALTER TABLE ${tableName} ADD COLUMN ${generateColumnDef(col)};`);
    down.push(`ALTER TABLE ${tableName} DROP COLUMN ${escapeIdentifier(col.name)};`);
  }

  // Drop columns
  for (const colName of alteration.columnsToDrop) {
    up.push(`ALTER TABLE ${tableName} DROP COLUMN ${escapeIdentifier(colName)};`);
    down.push(`-- Cannot restore dropped column ${colName} without original definition`);
  }

  // Alter columns
  for (const colAlt of alteration.columnsToAlter) {
    const colUp = generateColumnAlteration(colAlt, tableName);
    up.push(...colUp.up);
    down.push(...colUp.down);
  }

  // Drop indexes (before creating new ones with same name)
  for (const indexName of alteration.indexesToDrop) {
    up.push(`DROP INDEX ${schemaPrefix}${escapeIdentifier(indexName)};`);
    down.push(`-- Cannot restore dropped index ${indexName} without original definition`);
  }

  // Create indexes
  for (const index of alteration.indexesToCreate) {
    up.push(generateCreateIndex(index, alteration.tableName, schemaPrefix));
    down.push(`DROP INDEX ${schemaPrefix}${escapeIdentifier(index.name)};`);
  }

  // Drop foreign keys
  for (const fkName of alteration.foreignKeysToDrop) {
    up.push(`ALTER TABLE ${tableName} DROP CONSTRAINT ${escapeIdentifier(fkName)};`);
    down.push(`-- Cannot restore dropped foreign key ${fkName} without original definition`);
  }

  // Add foreign keys
  for (const fk of alteration.foreignKeysToAdd) {
    up.push(generateAddForeignKey(fk, alteration.tableName, schemaPrefix));
    down.push(`ALTER TABLE ${tableName} DROP CONSTRAINT ${escapeIdentifier(fk.name)};`);
  }

  // Drop check constraints
  for (const checkName of alteration.checksToDrop) {
    up.push(`ALTER TABLE ${tableName} DROP CONSTRAINT ${escapeIdentifier(checkName)};`);
    down.push(`-- Cannot restore dropped check constraint ${checkName} without original definition`);
  }

  // Add check constraints
  for (const check of alteration.checksToAdd) {
    up.push(`ALTER TABLE ${tableName} ADD CONSTRAINT ${escapeIdentifier(check.name)} CHECK (${check.expression});`);
    down.push(`ALTER TABLE ${tableName} DROP CONSTRAINT ${escapeIdentifier(check.name)};`);
  }

  return { up, down };
}

/**
 * Generate column alteration statements.
 */
function generateColumnAlteration(
  alteration: ColumnAlteration,
  tableName: string
): { up: string[]; down: string[] } {
  const up: string[] = [];
  const down: string[] = [];
  const colName = escapeIdentifier(alteration.columnName);

  if (alteration.typeChange) {
    up.push(`ALTER TABLE ${tableName} ALTER COLUMN ${colName} TYPE ${alteration.typeChange.to};`);
    down.push(`ALTER TABLE ${tableName} ALTER COLUMN ${colName} TYPE ${alteration.typeChange.from};`);
  }

  if (alteration.nullableChange) {
    if (alteration.nullableChange.to) {
      up.push(`ALTER TABLE ${tableName} ALTER COLUMN ${colName} DROP NOT NULL;`);
      down.push(`ALTER TABLE ${tableName} ALTER COLUMN ${colName} SET NOT NULL;`);
    } else {
      up.push(`ALTER TABLE ${tableName} ALTER COLUMN ${colName} SET NOT NULL;`);
      down.push(`ALTER TABLE ${tableName} ALTER COLUMN ${colName} DROP NOT NULL;`);
    }
  }

  if (alteration.defaultChange) {
    if (alteration.defaultChange.to === undefined) {
      up.push(`ALTER TABLE ${tableName} ALTER COLUMN ${colName} DROP DEFAULT;`);
    } else {
      up.push(`ALTER TABLE ${tableName} ALTER COLUMN ${colName} SET DEFAULT ${alteration.defaultChange.to};`);
    }

    if (alteration.defaultChange.from === undefined) {
      down.push(`ALTER TABLE ${tableName} ALTER COLUMN ${colName} DROP DEFAULT;`);
    } else {
      down.push(`ALTER TABLE ${tableName} ALTER COLUMN ${colName} SET DEFAULT ${alteration.defaultChange.from};`);
    }
  }

  return { up, down };
}

/**
 * Generate CREATE INDEX statement.
 */
function generateCreateIndex(
  index: IndexDefinition,
  tableName: string,
  schemaPrefix: string
): string {
  const unique = index.unique ? 'UNIQUE ' : '';
  const method = index.method ? ` USING ${index.method}` : '';
  const columns = index.columns.map(escapeIdentifier).join(', ');
  const where = index.where ? ` WHERE ${index.where}` : '';

  return `CREATE ${unique}INDEX ${escapeIdentifier(index.name)} ON `
    + `${schemaPrefix}${escapeIdentifier(tableName)}${method} (${columns})${where};`;
}

/**
 * Generate ADD FOREIGN KEY statement.
 */
function generateAddForeignKey(
  fk: ForeignKeyDefinition,
  tableName: string,
  schemaPrefix: string
): string {
  const columns = fk.columns.map(escapeIdentifier).join(', ');
  const refColumns = fk.referencedColumns.map(escapeIdentifier).join(', ');

  return `ALTER TABLE ${schemaPrefix}${escapeIdentifier(tableName)} `
    + `ADD CONSTRAINT ${escapeIdentifier(fk.name)} `
    + `FOREIGN KEY (${columns}) `
    + `REFERENCES ${schemaPrefix}${escapeIdentifier(fk.referencedTable)} (${refColumns}) `
    + `ON DELETE ${fk.onDelete} ON UPDATE ${fk.onUpdate};`;
}

/**
 * Generate a migration filename.
 */
export function generateMigrationFilename(
  version: string,
  description: string
): string {
  const sanitizedDesc = description
    .toLowerCase()
    .replaceAll(/[^a-z0-9]+/g, '_')
    .replaceAll(/^_|_$/g, '')
    .slice(0, 50);

  return `${version}_${sanitizedDesc}.sql`;
}

/**
 * Format migration as a SQL file with comments.
 */
export function formatMigrationFile(migration: Migration): string {
  const lines: string[] = [
    `-- Migration: ${migration.description}`,
    `-- Version: ${migration.version}`,
    `-- Generated: ${new Date().toISOString()}`,
    migration.hasBreakingChanges ? '-- WARNING: This migration contains breaking changes!' : '',
    '',
    '-- Up',
    migration.up,
    '',
    '-- Down',
    migration.down,
  ];

  return lines.filter(Boolean).join('\n');
}
