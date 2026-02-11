/**
 * Relation Discovery
 *
 * Discovers relations between tables by analyzing foreign key constraints.
 * Used by the repository generator to create typed relation methods.
 */

import type {
  DatabaseSchema,
  ForeignKeyDefinition,
  RelationInfo,
  TableDefinition,
} from '../schema/types.js';
import { pluralize } from '@/common/strings/pluralize.js';

/**
 * Convert a FK column name to a belongs-to method name.
 *
 * @example
 * fkColumnToMethodName('author_id') // 'getAuthor'
 * fkColumnToMethodName('category_id') // 'getCategory'
 * fkColumnToMethodName('parent_comment_id') // 'getParentComment'
 */
function fkColumnToMethodName(column: string): string {
  // Remove _id suffix
  const base = column.replace(/_id$/, '');
  // Convert snake_case to camelCase
  const camel = base.replaceAll(/_([a-z])/g, (_, c: string) => c.toUpperCase());
  // Capitalize first letter and prefix with 'get'
  return `get${camel.charAt(0).toUpperCase()}${camel.slice(1)}`;
}

/**
 * Convert a type name to a has-many method name (pluralized).
 *
 * @example
 * typeToHasManyMethodName('Post') // 'getPosts'
 * typeToHasManyMethodName('Category') // 'getCategories'
 * typeToHasManyMethodName('Person') // 'getPeople' (uses pluralize helper)
 */
function typeToHasManyMethodName(typeName: string): string {
  return `get${pluralize(typeName)}`;
}

/**
 * Convert a FK column name to a suffix for disambiguation.
 *
 * @example
 * fkColumnToSuffix('author_id') // 'ByAuthor'
 * fkColumnToSuffix('reviewer_id') // 'ByReviewer'
 * fkColumnToSuffix('parent_category_id') // 'ByParentCategory'
 */
function fkColumnToSuffix(column: string): string {
  // Remove _id suffix
  const base = column.replace(/_id$/, '');
  // Convert snake_case to PascalCase
  const pascal = base
    .split('_')
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');
  return `By${pascal}`;
}

/**
 * Discover belongs-to relations for a table.
 *
 * A belongs-to relation exists when this table has a FK pointing to another table.
 * For example, if Post has author_id FK to User, then Post "belongs to" User.
 *
 * @param schema - The database schema
 * @param tableName - The table to find relations for
 * @returns Array of belongs-to relations
 */
export function discoverBelongsToRelations(
  schema: DatabaseSchema,
  tableName: string
): RelationInfo[] {
  const table = schema.tables[tableName];
  if (!table) return [];

  const relations: RelationInfo[] = [];

  for (const fk of table.foreignKeys) {
    // Find the target table to get its sourceType
    const targetTable = schema.tables[fk.referencedTable];

    // Skip if target table doesn't exist or has no sourceType
    if (!targetTable?.sourceType) continue;

    // Generate method name from FK column (e.g., author_id -> getAuthor)
    const firstColumn = fk.columns[0];
    if (!firstColumn) continue;

    const methodName = fkColumnToMethodName(firstColumn);

    relations.push({
      methodName,
      type: 'belongs_to',
      localColumns: fk.columns,
      targetTable: fk.referencedTable,
      targetColumns: fk.referencedColumns,
      targetType: targetTable.sourceType,
    });
  }

  return relations;
}

/**
 * Discover has-many relations for a table.
 *
 * A has-many relation exists when another table has a FK pointing to this table.
 * For example, if Post has author_id FK to User, then User "has many" Posts.
 *
 * When multiple FKs from the same source table point to this table, method names
 * are disambiguated by appending the FK column info:
 * - Single FK: getPosts
 * - Multiple FKs: getPostsByAuthor, getPostsByReviewer
 *
 * @param schema - The database schema
 * @param tableName - The table to find relations for
 * @returns Array of has-many relations
 */
export function discoverHasManyRelations(
  schema: DatabaseSchema,
  tableName: string
): RelationInfo[] {
  const table = schema.tables[tableName];
  if (!table) return [];

  // First pass: collect all FKs pointing to this table, grouped by source table
  const fksBySourceTable = new Map<
    string,
    {
      fk: ForeignKeyDefinition;
      sourceTable: TableDefinition;
      sourceTableName: string;
    }[]
  >();

  for (const [otherTableName, otherTable] of Object.entries(schema.tables)) {
    // Skip self for grouping (self-references handled separately)
    if (otherTableName === tableName) continue;

    for (const fk of otherTable.foreignKeys) {
      if (fk.referencedTable !== tableName) continue;
      if (!otherTable.sourceType) continue;

      const key = otherTableName;
      if (!fksBySourceTable.has(key)) {
        fksBySourceTable.set(key, []);
      }
      fksBySourceTable.get(key)!.push({
        fk,
        sourceTable: otherTable,
        sourceTableName: otherTableName,
      });
    }
  }

  // Second pass: generate relations with disambiguated names where needed
  const relations: RelationInfo[] = [];

  for (const [, fks] of fksBySourceTable) {
    const needsDisambiguation = fks.length > 1;

    for (const { fk, sourceTable, sourceTableName } of fks) {
      // Generate method name
      let methodName: string;
      if (needsDisambiguation) {
        // Multiple FKs from same table: getPostsByAuthor, getPostsByReviewer
        const baseName = typeToHasManyMethodName(sourceTable.sourceType!);
        const suffix = fkColumnToSuffix(fk.columns[0]!);
        methodName = baseName + suffix;
      } else {
        // Single FK: getPosts
        methodName = typeToHasManyMethodName(sourceTable.sourceType!);
      }

      relations.push({
        methodName,
        type: 'has_many',
        localColumns: fk.referencedColumns, // Our columns (usually PK)
        targetTable: sourceTableName,
        targetColumns: fk.columns, // Their FK columns
        targetType: sourceTable.sourceType!,
      });
    }
  }

  // Handle self-referencing FKs separately
  const selfTable = schema.tables[tableName];
  if (selfTable?.sourceType) {
    const selfFks = selfTable.foreignKeys.filter(
      fk => fk.referencedTable === tableName
    );
    const needsDisambiguation = selfFks.length > 1;

    for (const fk of selfFks) {
      let methodName: string;
      if (needsDisambiguation) {
        const baseName = typeToHasManyMethodName(selfTable.sourceType);
        const suffix = fkColumnToSuffix(fk.columns[0]!);
        methodName = baseName + suffix;
      } else {
        methodName = typeToHasManyMethodName(selfTable.sourceType);
      }

      relations.push({
        methodName,
        type: 'has_many',
        localColumns: fk.referencedColumns,
        targetTable: tableName,
        targetColumns: fk.columns,
        targetType: selfTable.sourceType,
      });
    }
  }

  return relations;
}

/**
 * Discover all relations for a table.
 *
 * Combines belongs-to and has-many relations.
 *
 * @param schema - The database schema
 * @param tableName - The table to find relations for
 * @returns Array of all relations (belongs-to first, then has-many)
 */
export function discoverRelations(
  schema: DatabaseSchema,
  tableName: string
): RelationInfo[] {
  return [
    ...discoverBelongsToRelations(schema, tableName),
    ...discoverHasManyRelations(schema, tableName),
  ];
}
