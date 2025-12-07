/**
 * Schema diffing for migration generation.
 *
 * Compares two database schemas and produces a list of changes needed
 * to transform one into the other.
 */

import type {
  DatabaseSchema,
  TableDefinition,
  ColumnDefinition,
  IndexDefinition,
  ForeignKeyDefinition,
  CheckConstraint,
  SchemaDiff,
  TableAlteration,
  ColumnAlteration,
  DiffWarning,
} from '../schema/types.js';

/**
 * Options for schema comparison.
 */
export interface DiffOptions {
  /** Similarity threshold for rename detection (0-1, default 0.6) */
  renameSimilarityThreshold?: number;
  /** Whether to detect column renames using field numbers */
  useFieldNumbers?: boolean;
  /** Whether to detect column renames using heuristics */
  useHeuristics?: boolean;
}

const DEFAULT_OPTIONS: Required<DiffOptions> = {
  renameSimilarityThreshold: 0.6,
  useFieldNumbers: true,
  useHeuristics: true,
};

/**
 * Compare two schemas and produce a diff.
 */
export function compareSchemas(
  from: DatabaseSchema,
  to: DatabaseSchema,
  options: DiffOptions = {}
): SchemaDiff {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  const tablesToCreate: TableDefinition[] = [];
  const tablesToDrop: string[] = [];
  const tablesToAlter: TableAlteration[] = [];
  const warnings: DiffWarning[] = [];

  const fromTables = new Set(Object.keys(from.tables));
  const toTables = new Set(Object.keys(to.tables));

  // Find tables to create
  for (const tableName of toTables) {
    if (!fromTables.has(tableName)) {
      const table = to.tables[tableName];
      if (table) {
        tablesToCreate.push(table);
      }
    }
  }

  // Find tables to drop
  for (const tableName of fromTables) {
    if (!toTables.has(tableName)) {
      tablesToDrop.push(tableName);
    }
  }

  // Find tables to alter
  for (const tableName of toTables) {
    if (fromTables.has(tableName)) {
      const fromTable = from.tables[tableName];
      const toTable = to.tables[tableName];
      if (fromTable && toTable) {
        const alteration = compareTable(
          fromTable,
          toTable,
          opts,
          warnings
        );
        if (hasChanges(alteration)) {
          tablesToAlter.push(alteration);
        }
      }
    }
  }

  const hasBreakingChanges =
    tablesToDrop.length > 0
    || tablesToAlter.some(
      (a) =>
        a.columnsToDrop.length > 0
        || a.columnsToAlter.some((c) => c.typeChange !== undefined)
    );

  return {
    tablesToCreate,
    tablesToDrop,
    tablesToAlter,
    hasBreakingChanges,
    warnings,
  };
}

/**
 * Compare two table definitions.
 */
function compareTable(
  from: TableDefinition,
  to: TableDefinition,
  options: Required<DiffOptions>,
  warnings: DiffWarning[]
): TableAlteration {
  const columnsToAdd: ColumnDefinition[] = [];
  const columnsToDrop: string[] = [];
  const columnsToRename: { from: string; to: string }[] = [];
  const columnsToAlter: ColumnAlteration[] = [];

  const fromColumns = new Map(Object.entries(from.columns));
  const toColumns = new Map(Object.entries(to.columns));

  // Build field number maps for rename detection
  const fromFieldNumbers = new Map<number, string>();
  const toFieldNumbers = new Map<number, string>();

  if (options.useFieldNumbers && from.fieldNumbers) {
    for (const [name, num] of Object.entries(from.fieldNumbers)) {
      fromFieldNumbers.set(num, name);
    }
  }
  if (options.useFieldNumbers && to.fieldNumbers) {
    for (const [name, num] of Object.entries(to.fieldNumbers)) {
      toFieldNumbers.set(num, name);
    }
  }

  // Track which columns have been matched
  const matchedFrom = new Set<string>();
  const matchedTo = new Set<string>();

  // First pass: detect renames via field numbers
  if (options.useFieldNumbers) {
    for (const [fieldNum, toName] of toFieldNumbers) {
      const fromName = fromFieldNumbers.get(fieldNum);
      if (
        fromName
        && fromName !== toName
        && fromColumns.has(fromName)
        && toColumns.has(toName)
      ) {
        columnsToRename.push({ from: fromName, to: toName });
        matchedFrom.add(fromName);
        matchedTo.add(toName);
      }
    }
  }

  // Second pass: match columns by name
  for (const [name, toCol] of toColumns) {
    if (matchedTo.has(name)) continue;

    if (fromColumns.has(name)) {
      matchedFrom.add(name);
      matchedTo.add(name);

      // Check for alterations
      const fromCol = fromColumns.get(name)!;
      const alteration = compareColumn(fromCol, toCol);
      if (alteration) {
        columnsToAlter.push(alteration);
      }
    }
  }

  // Third pass: detect renames via heuristics for unmatched columns
  if (options.useHeuristics) {
    const unmatchedFrom = [...fromColumns.entries()]
      .filter(([name]) => !matchedFrom.has(name));
    const unmatchedTo = [...toColumns.entries()]
      .filter(([name]) => !matchedTo.has(name));

    for (const [toName, toCol] of unmatchedTo) {
      let bestMatch: { name: string; score: number } | null = null;

      for (const [fromName, fromCol] of unmatchedFrom) {
        if (matchedFrom.has(fromName)) continue;

        // Only consider if types match
        if (fromCol.type !== toCol.type) continue;

        const score = calculateSimilarity(fromName, toName);
        const meetsThreshold = score >= options.renameSimilarityThreshold;
        const isBetter = !bestMatch || score > bestMatch.score;
        if (meetsThreshold && isBetter) {
          bestMatch = { name: fromName, score };
        }
      }

      if (bestMatch) {
        columnsToRename.push({ from: bestMatch.name, to: toName });
        matchedFrom.add(bestMatch.name);
        matchedTo.add(toName);
      }
    }

    // Generate warnings for possible renames that didn't meet threshold
    const stillUnmatchedFrom = unmatchedFrom
      .filter(([name]) => !matchedFrom.has(name));
    const stillUnmatchedTo = unmatchedTo
      .filter(([name]) => !matchedTo.has(name));

    for (const [toName, toCol] of stillUnmatchedTo) {
      for (const [fromName, fromCol] of stillUnmatchedFrom) {
        if (fromCol.type === toCol.type) {
          const score = calculateSimilarity(fromName, toName);
          if (score > 0.3 && score < options.renameSimilarityThreshold) {
            const msg = `Column '${fromName}' dropped and `
              + `'${toName}' added (both ${fromCol.type})`;
            const hint = 'This may be a rename. If so, edit the migration:\n'
              + `  - DROP COLUMN ${fromName} / ADD COLUMN ${toName}  →  `
              + `RENAME COLUMN ${fromName} TO ${toName}`;
            warnings.push({
              type: 'possible_rename',
              message: msg,
              table: to.name,
              column: toName,
              suggestion: hint,
            });
          }
        }
      }
    }
  }

  // Final pass: add/drop unmatched columns
  for (const [name, col] of toColumns) {
    if (!matchedTo.has(name)) {
      columnsToAdd.push(col);
    }
  }

  for (const [name] of fromColumns) {
    if (!matchedFrom.has(name)) {
      columnsToDrop.push(name);
    }
  }

  // Compare indexes
  const indexesToCreate = findNewIndexes(from.indexes, to.indexes);
  const indexesToDrop = findDroppedIndexes(from.indexes, to.indexes);

  // Compare foreign keys
  const foreignKeysToAdd = findNewForeignKeys(
    from.foreignKeys,
    to.foreignKeys
  );
  const foreignKeysToDrop = findDroppedForeignKeys(
    from.foreignKeys,
    to.foreignKeys
  );

  // Compare check constraints
  const checksToAdd = findNewChecks(
    from.checkConstraints,
    to.checkConstraints
  );
  const checksToDrop = findDroppedChecks(
    from.checkConstraints,
    to.checkConstraints
  );

  return {
    tableName: to.name,
    columnsToAdd,
    columnsToDrop,
    columnsToRename,
    columnsToAlter,
    indexesToCreate,
    indexesToDrop,
    foreignKeysToAdd,
    foreignKeysToDrop,
    checksToAdd,
    checksToDrop,
  };
}

/**
 * Compare two column definitions.
 */
function compareColumn(
  from: ColumnDefinition,
  to: ColumnDefinition
): ColumnAlteration | null {
  let hasChanges = false;
  const alteration: ColumnAlteration = { columnName: to.name };

  if (from.type !== to.type) {
    alteration.typeChange = { from: from.type, to: to.type };
    hasChanges = true;
  }

  if (from.nullable !== to.nullable) {
    alteration.nullableChange = { from: from.nullable, to: to.nullable };
    hasChanges = true;
  }

  if (from.defaultValue !== to.defaultValue) {
    alteration.defaultChange = {
      from: from.defaultValue,
      to: to.defaultValue,
    };
    hasChanges = true;
  }

  return hasChanges ? alteration : null;
}

/**
 * Calculate string similarity using Levenshtein distance.
 */
function calculateSimilarity(a: string, b: string): number {
  const longer = a.length > b.length ? a : b;
  const shorter = a.length > b.length ? b : a;

  if (longer.length === 0) return 1;

  const lowerLonger = longer.toLowerCase();
  const lowerShorter = shorter.toLowerCase();
  const distance = levenshteinDistance(lowerLonger, lowerShorter);
  return (longer.length - distance) / longer.length;
}

/**
 * Levenshtein distance algorithm.
 */
function levenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = [];

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }

  const firstRow = matrix[0];
  if (firstRow) {
    for (let j = 0; j <= a.length; j++) {
      firstRow[j] = j;
    }
  }

  for (let i = 1; i <= b.length; i++) {
    const currentRow = matrix[i];
    const prevRow = matrix[i - 1];
    if (!currentRow || !prevRow) continue;

    for (let j = 1; j <= a.length; j++) {
      const prevDiag = prevRow[j - 1] ?? 0;
      const left = (currentRow[j - 1] ?? 0) + 1;
      const up = (prevRow[j] ?? 0) + 1;
      currentRow[j] = b.charAt(i - 1) === a.charAt(j - 1)
        ? prevDiag
        : Math.min(prevDiag + 1, left, up);
    }
  }

  return matrix[b.length]?.[a.length] ?? 0;
}

/**
 * Check if a table alteration has any changes.
 */
function hasChanges(alteration: TableAlteration): boolean {
  return (
    alteration.columnsToAdd.length > 0
    || alteration.columnsToDrop.length > 0
    || alteration.columnsToRename.length > 0
    || alteration.columnsToAlter.length > 0
    || alteration.indexesToCreate.length > 0
    || alteration.indexesToDrop.length > 0
    || alteration.foreignKeysToAdd.length > 0
    || alteration.foreignKeysToDrop.length > 0
    || alteration.checksToAdd.length > 0
    || alteration.checksToDrop.length > 0
  );
}

// Helper functions for comparing indexes, foreign keys, and constraints

function findNewIndexes(
  from: IndexDefinition[],
  to: IndexDefinition[]
): IndexDefinition[] {
  const fromNames = new Set(from.map((i) => i.name));
  return to.filter((i) => !fromNames.has(i.name));
}

function findDroppedIndexes(
  from: IndexDefinition[],
  to: IndexDefinition[]
): string[] {
  const toNames = new Set(to.map((i) => i.name));
  return from.filter((i) => !toNames.has(i.name)).map((i) => i.name);
}

function findNewForeignKeys(
  from: ForeignKeyDefinition[],
  to: ForeignKeyDefinition[]
): ForeignKeyDefinition[] {
  const fromNames = new Set(from.map((f) => f.name));
  return to.filter((f) => !fromNames.has(f.name));
}

function findDroppedForeignKeys(
  from: ForeignKeyDefinition[],
  to: ForeignKeyDefinition[]
): string[] {
  const toNames = new Set(to.map((f) => f.name));
  return from.filter((f) => !toNames.has(f.name)).map((f) => f.name);
}

function findNewChecks(
  from: CheckConstraint[],
  to: CheckConstraint[]
): CheckConstraint[] {
  const fromNames = new Set(from.map((c) => c.name));
  return to.filter((c) => !fromNames.has(c.name));
}

function findDroppedChecks(
  from: CheckConstraint[],
  to: CheckConstraint[]
): string[] {
  const toNames = new Set(to.map((c) => c.name));
  return from.filter((c) => !toNames.has(c.name)).map((c) => c.name);
}
