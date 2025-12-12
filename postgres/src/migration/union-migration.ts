/**
 * Union type migration planning.
 *
 * Handles data migrations when column storage strategies change
 * between native and JSONB formats.
 */

import type { UnionAnalysis } from '../mapping/type-mapper.js';
import { escapeIdentifier } from '../mapping/serializer.js';

/**
 * Migration step type.
 */
export type MigrationStepType =
  | 'add_column'
  | 'migrate_data'
  | 'drop_column'
  | 'rename_column'
  | 'alter_type'
  | 'alter_nullable';

/**
 * A single step in a migration plan.
 */
export interface MigrationStep {
  /** Step type */
  type: MigrationStepType;
  /** SQL to execute */
  sql: string;
  /** Reverse SQL (for down migration) */
  reverseSql?: string;
  /** Human-readable description */
  description: string;
}

/**
 * A pre-check query to validate data before migration.
 */
export interface PreCheckQuery {
  /** Human-readable description */
  description: string;
  /** SQL query that returns a count */
  sql: string;
  /** Condition that causes failure */
  failCondition: 'count > 0';
  /** Error message if check fails */
  errorMessage: string;
}

/**
 * Result of planning a column type migration.
 */
export interface ColumnMigrationPlan {
  /** Type of migration: schema-only or data-migration */
  type: 'schema-only' | 'data-migration';
  /** Steps to execute */
  steps: MigrationStep[];
  /** Warnings for the user */
  warnings: string[];
  /** Pre-checks to run before migration */
  preChecks: PreCheckQuery[];
}

/**
 * Category of migration complexity.
 */
export type MigrationCategory =
  | 'A'  // Safe: Schema-only changes
  | 'B'  // Data migration: Native → JSONB
  | 'C'; // Data migration: JSONB → Native

/**
 * Determine the migration category for a type change.
 */
export function determineMigrationCategory(
  fromAnalysis: UnionAnalysis,
  toAnalysis: UnionAnalysis
): MigrationCategory {
  const fromStrategy = fromAnalysis.strategy;
  const toStrategy = toAnalysis.strategy;

  // Same strategy = schema-only (nullable changes, etc.)
  if (fromStrategy === toStrategy) {
    return 'A';
  }

  // Native → JSONB
  if (fromStrategy === 'native' && toStrategy === 'jsonb') {
    return 'B';
  }

  // JSONB → Native
  if (fromStrategy === 'jsonb' && toStrategy === 'native') {
    return 'C';
  }

  // Default to schema-only
  return 'A';
}

/**
 * Plan a column type migration.
 *
 * @param tableName - Table name
 * @param columnName - Column name
 * @param fromAnalysis - Union analysis for the current type
 * @param toAnalysis - Union analysis for the new type
 * @param schemaPrefix - Schema prefix (e.g., "myschema.")
 */
export function planColumnTypeMigration(
  tableName: string,
  columnName: string,
  fromAnalysis: UnionAnalysis,
  toAnalysis: UnionAnalysis,
  schemaPrefix = ''
): ColumnMigrationPlan {
  const category = determineMigrationCategory(fromAnalysis, toAnalysis);
  const fullTableName = `${schemaPrefix}${escapeIdentifier(tableName)}`;
  const col = escapeIdentifier(columnName);

  switch (category) {
    case 'A':
      return planSchemaOnlyMigration(
        fullTableName,
        col,
        fromAnalysis,
        toAnalysis
      );

    case 'B':
      return planNativeToJsonbMigration(
        fullTableName,
        col,
        columnName,
        fromAnalysis,
        toAnalysis
      );

    case 'C':
      return planJsonbToNativeMigration(
        fullTableName,
        col,
        columnName,
        fromAnalysis,
        toAnalysis
      );
  }
}

/**
 * Plan a schema-only migration (Category A).
 */
function planSchemaOnlyMigration(
  tableName: string,
  col: string,
  fromAnalysis: UnionAnalysis,
  toAnalysis: UnionAnalysis
): ColumnMigrationPlan {
  const steps: MigrationStep[] = [];
  const warnings: string[] = [];

  // Handle nullable changes
  const fromNullable = fromAnalysis.hasNull || fromAnalysis.hasUndefined;
  const toNullable = toAnalysis.hasNull || toAnalysis.hasUndefined;

  if (fromNullable !== toNullable) {
    if (toNullable) {
      // Making nullable - safe
      steps.push({
        type: 'alter_nullable',
        sql: `ALTER TABLE ${tableName} ALTER COLUMN ${col} DROP NOT NULL;`,
        reverseSql: `ALTER TABLE ${tableName} ALTER COLUMN ${col} SET NOT NULL;`,
        description: `Make column ${col} nullable`,
      });
    } else {
      // Making NOT NULL - potentially unsafe
      steps.push({
        type: 'alter_nullable',
        sql: `ALTER TABLE ${tableName} ALTER COLUMN ${col} SET NOT NULL;`,
        reverseSql: `ALTER TABLE ${tableName} ALTER COLUMN ${col} DROP NOT NULL;`,
        description: `Make column ${col} NOT NULL`,
      });
      warnings.push(
        `Setting ${col} to NOT NULL will fail if any NULL values exist. ` +
        `Run: SELECT COUNT(*) FROM ${tableName} WHERE ${col} IS NULL;`
      );
    }
  }

  return {
    type: 'schema-only',
    steps,
    warnings,
    preChecks: [],
  };
}

/**
 * Plan a native to JSONB migration (Category B).
 */
function planNativeToJsonbMigration(
  tableName: string,
  col: string,
  columnName: string,
  fromAnalysis: UnionAnalysis,
  toAnalysis: UnionAnalysis
): ColumnMigrationPlan {
  const steps: MigrationStep[] = [];
  const warnings: string[] = [];
  const colNew = escapeIdentifier(`${columnName}_new`);

  // Determine how to convert existing values
  // - If from T | null, NULL becomes {"$v": null}
  // - If from T | undefined, NULL becomes {}
  // - Values become {"$v": value}
  let nullConversion: string;
  if (fromAnalysis.hasNull) {
    nullConversion = `'{"$v": null}'::jsonb`;
  } else if (fromAnalysis.hasUndefined) {
    nullConversion = `'{}'::jsonb`;
  } else {
    nullConversion = 'NULL'; // Should not happen if type was non-nullable
  }

  // Handle type-specific value wrapping
  const valueWrap = buildValueWrapExpression(col, fromAnalysis, toAnalysis);

  // Step 1: Add new JSONB column
  steps.push({
    type: 'add_column',
    sql: `ALTER TABLE ${tableName} ADD COLUMN ${colNew} JSONB;`,
    reverseSql: `ALTER TABLE ${tableName} DROP COLUMN ${colNew};`,
    description: `Add temporary JSONB column ${columnName}_new`,
  });

  // Step 2: Migrate data
  steps.push({
    type: 'migrate_data',
    sql: `UPDATE ${tableName} SET ${colNew} = CASE
  WHEN ${col} IS NULL THEN ${nullConversion}
  ELSE ${valueWrap}
END;`,
    description: `Migrate data from ${columnName} to ${columnName}_new`,
  });

  // Step 3: Drop old column
  steps.push({
    type: 'drop_column',
    sql: `ALTER TABLE ${tableName} DROP COLUMN ${col};`,
    description: `Drop old column ${columnName}`,
  });

  // Step 4: Rename new column
  steps.push({
    type: 'rename_column',
    sql: `ALTER TABLE ${tableName} RENAME COLUMN ${colNew} TO ${col};`,
    reverseSql: `ALTER TABLE ${tableName} RENAME COLUMN ${col} TO ${colNew};`,
    description: `Rename ${columnName}_new to ${columnName}`,
  });

  warnings.push(
    `Migrating ${columnName} from native type to JSONB. ` +
    `This is a data migration that converts all existing values to JSONB format.`
  );

  return {
    type: 'data-migration',
    steps,
    warnings,
    preChecks: [],
  };
}

/**
 * Plan a JSONB to native migration (Category C).
 */
function planJsonbToNativeMigration(
  tableName: string,
  col: string,
  columnName: string,
  fromAnalysis: UnionAnalysis,
  toAnalysis: UnionAnalysis
): ColumnMigrationPlan {
  const steps: MigrationStep[] = [];
  const warnings: string[] = [];
  const preChecks: PreCheckQuery[] = [];
  const colNew = escapeIdentifier(`${columnName}_new`);

  // Determine the target SQL type
  const targetType = getNativeType(toAnalysis);

  // Add pre-checks for potentially lossy migration
  if (toAnalysis.hasNull && !toAnalysis.hasUndefined) {
    // T | null - check for undefined values ({})
    preChecks.push({
      description: `Check for undefined values in ${columnName}`,
      sql: `SELECT COUNT(*) FROM ${tableName} WHERE ${col} = '{}'::jsonb;`,
      failCondition: 'count > 0',
      errorMessage:
        `Column ${columnName} contains undefined values ({}) which cannot be ` +
        `represented in T | null type. Convert to null or update values first.`,
    });
  } else if (toAnalysis.hasUndefined && !toAnalysis.hasNull) {
    // T | undefined - check for null values ({"$v": null})
    preChecks.push({
      description: `Check for null values in ${columnName}`,
      sql: `SELECT COUNT(*) FROM ${tableName} WHERE ${col} = '{"$v": null}'::jsonb;`,
      failCondition: 'count > 0',
      errorMessage:
        `Column ${columnName} contains explicit null values ({"$v": null}) which cannot be ` +
        `represented in T | undefined type. Remove these values or update to undefined first.`,
    });
  } else if (!toAnalysis.hasNull && !toAnalysis.hasUndefined) {
    // T only - check for both null and undefined values
    preChecks.push({
      description: `Check for null/undefined values in ${columnName}`,
      sql: `SELECT COUNT(*) FROM ${tableName} WHERE ${col} = '{}'::jsonb OR ${col} = '{"$v": null}'::jsonb OR ${col} IS NULL;`,
      failCondition: 'count > 0',
      errorMessage:
        `Column ${columnName} contains null or undefined values which cannot be ` +
        `represented in non-nullable type. Update or remove these values first.`,
    });
  }

  // Determine how to extract values
  // - {} → NULL (for T | undefined)
  // - {"$v": null} → NULL (for T | null)
  // - {"$v": value} → value
  // - {"$t": type, "$v": value} → value (with type checking)
  let valueExtract: string;
  let nullCheck: string;

  if (toAnalysis.hasNull && !toAnalysis.hasUndefined) {
    // T | null: NULL and {"$v": null} both become NULL
    nullCheck = `${col} IS NULL OR ${col} = '{"$v": null}'::jsonb`;
    valueExtract = `(${col}->>'$v')::${targetType}`;
  } else if (toAnalysis.hasUndefined && !toAnalysis.hasNull) {
    // T | undefined: NULL and {} both become NULL
    nullCheck = `${col} IS NULL OR ${col} = '{}'::jsonb`;
    valueExtract = `(${col}->>'$v')::${targetType}`;
  } else {
    // T | null | undefined or T only
    nullCheck = `${col} IS NULL OR ${col} = '{}'::jsonb OR ${col} = '{"$v": null}'::jsonb`;
    valueExtract = `(${col}->>'$v')::${targetType}`;
  }

  // Step 1: Add new native column
  const nullableSuffix = toAnalysis.hasNull || toAnalysis.hasUndefined ? '' : ' NOT NULL';
  steps.push({
    type: 'add_column',
    sql: `ALTER TABLE ${tableName} ADD COLUMN ${colNew} ${targetType}${nullableSuffix};`,
    reverseSql: `ALTER TABLE ${tableName} DROP COLUMN ${colNew};`,
    description: `Add temporary native column ${columnName}_new`,
  });

  // Step 2: Migrate data
  steps.push({
    type: 'migrate_data',
    sql: `UPDATE ${tableName} SET ${colNew} = CASE
  WHEN ${nullCheck} THEN NULL
  ELSE ${valueExtract}
END;`,
    description: `Migrate data from ${columnName} to ${columnName}_new`,
  });

  // Step 3: Drop old column
  steps.push({
    type: 'drop_column',
    sql: `ALTER TABLE ${tableName} DROP COLUMN ${col};`,
    description: `Drop old JSONB column ${columnName}`,
  });

  // Step 4: Rename new column
  steps.push({
    type: 'rename_column',
    sql: `ALTER TABLE ${tableName} RENAME COLUMN ${colNew} TO ${col};`,
    reverseSql: `ALTER TABLE ${tableName} RENAME COLUMN ${col} TO ${colNew};`,
    description: `Rename ${columnName}_new to ${columnName}`,
  });

  warnings.push(
    `Migrating ${columnName} from JSONB to native type. ` +
    `This may fail if data contains values that cannot be converted to the target type.`
  );

  return {
    type: 'data-migration',
    steps,
    warnings,
    preChecks,
  };
}

/**
 * Build a SQL expression to wrap a native value in JSONB format.
 */
function buildValueWrapExpression(
  col: string,
  fromAnalysis: UnionAnalysis,
  toAnalysis: UnionAnalysis
): string {
  // If the target union has multiple types, we need to include the type tag
  const needsTypeTag =
    toAnalysis.unionMembers &&
    toAnalysis.unionMembers.length > 1 &&
    !toAnalysis.hasMessages;

  if (needsTypeTag) {
    // Wrap with type discriminator: {"$t": "string", "$v": value}
    const typeName = getScalarTypeName(fromAnalysis);
    return `jsonb_build_object('$t', '${typeName}', '$v', ${col})`;
  }

  // Simple wrap: {"$v": value}
  return `jsonb_build_object('$v', ${col})`;
}

/**
 * Get the scalar type name for JSONB storage.
 */
function getScalarTypeName(analysis: UnionAnalysis): string {
  switch (analysis.baseType) {
    case 'string':
      return 'string';
    case 'number':
    case 'int32':
      return 'number';
    case 'bigint':
      return 'bigint';
    case 'boolean':
      return 'boolean';
    case 'Date':
      return 'Date';
    case 'URL':
      return 'URL';
    case 'ArrayBuffer':
      return 'ArrayBuffer';
    default:
      return 'string';
  }
}

/**
 * Get the native PostgreSQL type for a union analysis.
 */
function getNativeType(analysis: UnionAnalysis): string {
  switch (analysis.baseType) {
    case 'string':
      return 'TEXT';
    case 'number':
      return 'DOUBLE PRECISION';
    case 'int32':
      return 'INTEGER';
    case 'bigint':
      return 'BIGINT';
    case 'boolean':
      return 'BOOLEAN';
    case 'Date':
      return 'TIMESTAMPTZ';
    case 'decimal':
      return 'NUMERIC';
    default:
      return 'TEXT';
  }
}

/**
 * Format a migration plan as SQL with comments.
 */
export function formatMigrationPlan(
  plan: ColumnMigrationPlan,
  columnName: string
): string {
  const lines: string[] = [];

  // Header
  lines.push(`-- Migration for column: ${columnName}`);
  lines.push(`-- Type: ${plan.type}`);
  lines.push('');

  // Warnings
  if (plan.warnings.length > 0) {
    lines.push('-- WARNINGS:');
    for (const warning of plan.warnings) {
      lines.push(`-- ${warning}`);
    }
    lines.push('');
  }

  // Pre-checks
  if (plan.preChecks.length > 0) {
    lines.push('-- Pre-migration checks (run these queries first):');
    for (const check of plan.preChecks) {
      lines.push(`-- ${check.description}`);
      lines.push(`-- ${check.sql}`);
      lines.push(`-- Expected: ${check.failCondition} means migration will fail`);
      lines.push('');
    }
  }

  // Steps
  lines.push('-- Migration steps:');
  for (let i = 0; i < plan.steps.length; i++) {
    const step = plan.steps[i]!;
    lines.push(`-- Step ${i + 1}: ${step.description}`);
    lines.push(step.sql);
    lines.push('');
  }

  return lines.join('\n');
}
