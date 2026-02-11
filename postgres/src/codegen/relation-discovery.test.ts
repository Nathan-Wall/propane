import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  discoverRelations,
  discoverBelongsToRelations,
  discoverHasManyRelations,
} from './relation-discovery.js';
import type {
  DatabaseSchema,
  TableDefinition,
  ColumnDefinition,
  ForeignKeyDefinition,
} from '../schema/types.js';

/**
 * Helper to create a column definition.
 */
function column(
  name: string,
  type: string,
  options: { isPrimaryKey?: boolean; nullable?: boolean } = {}
): ColumnDefinition {
  return {
    name,
    type,
    nullable: options.nullable ?? false,
    isPrimaryKey: options.isPrimaryKey ?? false,
    isUnique: false,
    isAutoIncrement: false,
  };
}

/**
 * Helper to create a foreign key definition.
 */
function foreignKey(
  columns: string[],
  referencedTable: string,
  referencedColumns: string[]
): ForeignKeyDefinition {
  return {
    name: `fk_${columns.join('_')}`,
    columns,
    referencedTable,
    referencedColumns,
    onDelete: 'NO ACTION',
    onUpdate: 'NO ACTION',
  };
}

/**
 * Helper to create a table definition.
 */
function table(
  name: string,
  columns: ColumnDefinition[],
  options: {
    foreignKeys?: ForeignKeyDefinition[];
    sourceType?: string;
  } = {}
): TableDefinition {
  const colRecord: Record<string, ColumnDefinition> = {};
  const primaryKey: string[] = [];

  for (const col of columns) {
    colRecord[col.name] = col;
    if (col.isPrimaryKey) {
      primaryKey.push(col.name);
    }
  }

  return {
    name,
    columns: colRecord,
    primaryKey,
    indexes: [],
    foreignKeys: options.foreignKeys ?? [],
    checkConstraints: [],
    sourceType: options.sourceType,
  };
}

/**
 * Helper to create a schema.
 */
function schema(tables: TableDefinition[]): DatabaseSchema {
  const tableRecord: Record<string, TableDefinition> = {};
  for (const t of tables) {
    tableRecord[t.name] = t;
  }
  return {
    schemaName: 'public',
    tables: tableRecord,
  };
}

describe('relation-discovery', () => {
  describe('discoverBelongsToRelations', () => {
    it('should discover belongs-to relation from FK', () => {
      const s = schema([
        table('users', [column('id', 'BIGINT', { isPrimaryKey: true })], {
          sourceType: 'User',
        }),
        table(
          'posts',
          [
            column('id', 'BIGINT', { isPrimaryKey: true }),
            column('author_id', 'BIGINT'),
          ],
          {
            foreignKeys: [foreignKey(['author_id'], 'users', ['id'])],
            sourceType: 'Post',
          }
        ),
      ]);

      const relations = discoverBelongsToRelations(s, 'posts');

      assert.strictEqual(relations.length, 1);
      assert.strictEqual(relations[0]!.methodName, 'getAuthor');
      assert.strictEqual(relations[0]!.type, 'belongs_to');
      assert.deepStrictEqual(relations[0]!.localColumns, ['author_id']);
      assert.strictEqual(relations[0]!.targetTable, 'users');
      assert.deepStrictEqual(relations[0]!.targetColumns, ['id']);
      assert.strictEqual(relations[0]!.targetType, 'User');
    });

    it('should return empty array for table without FKs', () => {
      const s = schema([
        table('users', [column('id', 'BIGINT', { isPrimaryKey: true })], {
          sourceType: 'User',
        }),
      ]);

      const relations = discoverBelongsToRelations(s, 'users');

      assert.strictEqual(relations.length, 0);
    });

    it('should return empty array for non-existent table', () => {
      const s = schema([]);

      const relations = discoverBelongsToRelations(s, 'nonexistent');

      assert.strictEqual(relations.length, 0);
    });

    it('should skip FK when target table has no sourceType', () => {
      const s = schema([
        table('users', [column('id', 'BIGINT', { isPrimaryKey: true })], {
          // No sourceType
        }),
        table(
          'posts',
          [
            column('id', 'BIGINT', { isPrimaryKey: true }),
            column('author_id', 'BIGINT'),
          ],
          {
            foreignKeys: [foreignKey(['author_id'], 'users', ['id'])],
            sourceType: 'Post',
          }
        ),
      ]);

      const relations = discoverBelongsToRelations(s, 'posts');

      assert.strictEqual(relations.length, 0);
    });

    it('should discover multiple belongs-to relations', () => {
      const s = schema([
        table('users', [column('id', 'BIGINT', { isPrimaryKey: true })], {
          sourceType: 'User',
        }),
        table('categories', [column('id', 'BIGINT', { isPrimaryKey: true })], {
          sourceType: 'Category',
        }),
        table(
          'posts',
          [
            column('id', 'BIGINT', { isPrimaryKey: true }),
            column('author_id', 'BIGINT'),
            column('category_id', 'BIGINT'),
          ],
          {
            foreignKeys: [
              foreignKey(['author_id'], 'users', ['id']),
              foreignKey(['category_id'], 'categories', ['id']),
            ],
            sourceType: 'Post',
          }
        ),
      ]);

      const relations = discoverBelongsToRelations(s, 'posts');

      assert.strictEqual(relations.length, 2);
      assert.strictEqual(relations[0]!.methodName, 'getAuthor');
      assert.strictEqual(relations[1]!.methodName, 'getCategory');
    });

    it('should handle FK column with multiple underscores', () => {
      const s = schema([
        table('comments', [column('id', 'BIGINT', { isPrimaryKey: true })], {
          sourceType: 'Comment',
        }),
        table(
          'replies',
          [
            column('id', 'BIGINT', { isPrimaryKey: true }),
            column('parent_comment_id', 'BIGINT'),
          ],
          {
            foreignKeys: [foreignKey(['parent_comment_id'], 'comments', ['id'])],
            sourceType: 'Reply',
          }
        ),
      ]);

      const relations = discoverBelongsToRelations(s, 'replies');

      assert.strictEqual(relations[0]!.methodName, 'getParentComment');
    });
  });

  describe('discoverHasManyRelations', () => {
    it('should discover has-many relation from reverse FK', () => {
      const s = schema([
        table('users', [column('id', 'BIGINT', { isPrimaryKey: true })], {
          sourceType: 'User',
        }),
        table(
          'posts',
          [
            column('id', 'BIGINT', { isPrimaryKey: true }),
            column('author_id', 'BIGINT'),
          ],
          {
            foreignKeys: [foreignKey(['author_id'], 'users', ['id'])],
            sourceType: 'Post',
          }
        ),
      ]);

      const relations = discoverHasManyRelations(s, 'users');

      assert.strictEqual(relations.length, 1);
      assert.strictEqual(relations[0]!.methodName, 'getPosts');
      assert.strictEqual(relations[0]!.type, 'has_many');
      assert.deepStrictEqual(relations[0]!.localColumns, ['id']);
      assert.strictEqual(relations[0]!.targetTable, 'posts');
      assert.deepStrictEqual(relations[0]!.targetColumns, ['author_id']);
      assert.strictEqual(relations[0]!.targetType, 'Post');
    });

    it('should return empty array for table with no referencing FKs', () => {
      const s = schema([
        table('users', [column('id', 'BIGINT', { isPrimaryKey: true })], {
          sourceType: 'User',
        }),
        table('posts', [column('id', 'BIGINT', { isPrimaryKey: true })], {
          sourceType: 'Post',
          // No FK to users
        }),
      ]);

      const relations = discoverHasManyRelations(s, 'users');

      assert.strictEqual(relations.length, 0);
    });

    it('should return empty array for non-existent table', () => {
      const s = schema([]);

      const relations = discoverHasManyRelations(s, 'nonexistent');

      assert.strictEqual(relations.length, 0);
    });

    it('should skip when referencing table has no sourceType', () => {
      const s = schema([
        table('users', [column('id', 'BIGINT', { isPrimaryKey: true })], {
          sourceType: 'User',
        }),
        table(
          'posts',
          [
            column('id', 'BIGINT', { isPrimaryKey: true }),
            column('author_id', 'BIGINT'),
          ],
          {
            foreignKeys: [foreignKey(['author_id'], 'users', ['id'])],
            // No sourceType
          }
        ),
      ]);

      const relations = discoverHasManyRelations(s, 'users');

      assert.strictEqual(relations.length, 0);
    });

    it('should discover multiple has-many relations', () => {
      const s = schema([
        table('users', [column('id', 'BIGINT', { isPrimaryKey: true })], {
          sourceType: 'User',
        }),
        table(
          'posts',
          [
            column('id', 'BIGINT', { isPrimaryKey: true }),
            column('author_id', 'BIGINT'),
          ],
          {
            foreignKeys: [foreignKey(['author_id'], 'users', ['id'])],
            sourceType: 'Post',
          }
        ),
        table(
          'comments',
          [
            column('id', 'BIGINT', { isPrimaryKey: true }),
            column('user_id', 'BIGINT'),
          ],
          {
            foreignKeys: [foreignKey(['user_id'], 'users', ['id'])],
            sourceType: 'Comment',
          }
        ),
      ]);

      const relations = discoverHasManyRelations(s, 'users');

      assert.strictEqual(relations.length, 2);
      const methodNames = new Set(relations.map(r => r.methodName));
      assert.ok(methodNames.has('getPosts'));
      assert.ok(methodNames.has('getComments'));
    });

    it('should handle pluralization of type ending in y', () => {
      const s = schema([
        table('users', [column('id', 'BIGINT', { isPrimaryKey: true })], {
          sourceType: 'User',
        }),
        table(
          'categories',
          [
            column('id', 'BIGINT', { isPrimaryKey: true }),
            column('user_id', 'BIGINT'),
          ],
          {
            foreignKeys: [foreignKey(['user_id'], 'users', ['id'])],
            sourceType: 'Category',
          }
        ),
      ]);

      const relations = discoverHasManyRelations(s, 'users');

      assert.strictEqual(relations[0]!.methodName, 'getCategories');
    });

    it('should handle pluralization of type ending in s', () => {
      const s = schema([
        table('users', [column('id', 'BIGINT', { isPrimaryKey: true })], {
          sourceType: 'User',
        }),
        table(
          'statuses',
          [
            column('id', 'BIGINT', { isPrimaryKey: true }),
            column('user_id', 'BIGINT'),
          ],
          {
            foreignKeys: [foreignKey(['user_id'], 'users', ['id'])],
            sourceType: 'Status',
          }
        ),
      ]);

      const relations = discoverHasManyRelations(s, 'users');

      assert.strictEqual(relations[0]!.methodName, 'getStatuses');
    });
  });

  describe('discoverRelations', () => {
    it('should combine belongs-to and has-many relations', () => {
      const s = schema([
        table('users', [column('id', 'BIGINT', { isPrimaryKey: true })], {
          sourceType: 'User',
        }),
        table(
          'posts',
          [
            column('id', 'BIGINT', { isPrimaryKey: true }),
            column('author_id', 'BIGINT'),
          ],
          {
            foreignKeys: [foreignKey(['author_id'], 'users', ['id'])],
            sourceType: 'Post',
          }
        ),
      ]);

      // User has has-many relation to Post
      const userRelations = discoverRelations(s, 'users');
      assert.strictEqual(userRelations.length, 1);
      assert.strictEqual(userRelations[0]!.type, 'has_many');
      assert.strictEqual(userRelations[0]!.methodName, 'getPosts');

      // Post has belongs-to relation to User
      const postRelations = discoverRelations(s, 'posts');
      assert.strictEqual(postRelations.length, 1);
      assert.strictEqual(postRelations[0]!.type, 'belongs_to');
      assert.strictEqual(postRelations[0]!.methodName, 'getAuthor');
    });

    it('should return belongs-to before has-many', () => {
      const s = schema([
        table('users', [column('id', 'BIGINT', { isPrimaryKey: true })], {
          sourceType: 'User',
        }),
        table(
          'posts',
          [
            column('id', 'BIGINT', { isPrimaryKey: true }),
            column('author_id', 'BIGINT'),
          ],
          {
            foreignKeys: [foreignKey(['author_id'], 'users', ['id'])],
            sourceType: 'Post',
          }
        ),
        table(
          'comments',
          [
            column('id', 'BIGINT', { isPrimaryKey: true }),
            column('post_id', 'BIGINT'),
          ],
          {
            foreignKeys: [foreignKey(['post_id'], 'posts', ['id'])],
            sourceType: 'Comment',
          }
        ),
      ]);

      // Post: belongs_to User, has_many Comments
      const postRelations = discoverRelations(s, 'posts');

      assert.strictEqual(postRelations.length, 2);
      assert.strictEqual(postRelations[0]!.type, 'belongs_to');
      assert.strictEqual(postRelations[1]!.type, 'has_many');
    });

    it('should return empty array for table with no relations', () => {
      const s = schema([
        table('orphan', [column('id', 'BIGINT', { isPrimaryKey: true })], {
          sourceType: 'Orphan',
        }),
      ]);

      const relations = discoverRelations(s, 'orphan');

      assert.strictEqual(relations.length, 0);
    });
  });

  describe('edge cases', () => {
    it('should handle self-referencing FK', () => {
      const s = schema([
        table(
          'categories',
          [
            column('id', 'BIGINT', { isPrimaryKey: true }),
            column('parent_id', 'BIGINT', { nullable: true }),
          ],
          {
            foreignKeys: [foreignKey(['parent_id'], 'categories', ['id'])],
            sourceType: 'Category',
          }
        ),
      ]);

      const relations = discoverRelations(s, 'categories');

      // Should have both belongs-to (getParent) and has-many (getCategories)
      assert.strictEqual(relations.length, 2);

      const belongsTo = relations.find(r => r.type === 'belongs_to');
      const hasMany = relations.find(r => r.type === 'has_many');

      assert.strictEqual(belongsTo?.methodName, 'getParent');
      assert.strictEqual(hasMany?.methodName, 'getCategories');
    });

    it('should handle multiple FKs to same table (belongs-to side)', () => {
      const s = schema([
        table('users', [column('id', 'BIGINT', { isPrimaryKey: true })], {
          sourceType: 'User',
        }),
        table(
          'posts',
          [
            column('id', 'BIGINT', { isPrimaryKey: true }),
            column('author_id', 'BIGINT'),
            column('editor_id', 'BIGINT', { nullable: true }),
          ],
          {
            foreignKeys: [
              foreignKey(['author_id'], 'users', ['id']),
              foreignKey(['editor_id'], 'users', ['id']),
            ],
            sourceType: 'Post',
          }
        ),
      ]);

      // Belongs-to side: Post has getAuthor, getEditor (no collision)
      const postRelations = discoverBelongsToRelations(s, 'posts');

      assert.strictEqual(postRelations.length, 2);
      assert.strictEqual(postRelations[0]!.methodName, 'getAuthor');
      assert.strictEqual(postRelations[1]!.methodName, 'getEditor');
    });

    it('should disambiguate has-many when multiple FKs from same table', () => {
      const s = schema([
        table('users', [column('id', 'BIGINT', { isPrimaryKey: true })], {
          sourceType: 'User',
        }),
        table(
          'posts',
          [
            column('id', 'BIGINT', { isPrimaryKey: true }),
            column('author_id', 'BIGINT'),
            column('reviewer_id', 'BIGINT', { nullable: true }),
          ],
          {
            foreignKeys: [
              foreignKey(['author_id'], 'users', ['id']),
              foreignKey(['reviewer_id'], 'users', ['id']),
            ],
            sourceType: 'Post',
          }
        ),
      ]);

      // Has-many side: User would have collision without disambiguation
      const userRelations = discoverHasManyRelations(s, 'users');

      assert.strictEqual(userRelations.length, 2);
      // Should be disambiguated: getPostsByAuthor, getPostsByReviewer
      const methodNames = userRelations.map(r => r.methodName).toSorted();
      assert.deepStrictEqual(methodNames, [
        'getPostsByAuthor',
        'getPostsByReviewer',
      ]);
    });

    it('should not disambiguate has-many when single FK from table', () => {
      const s = schema([
        table('users', [column('id', 'BIGINT', { isPrimaryKey: true })], {
          sourceType: 'User',
        }),
        table(
          'posts',
          [
            column('id', 'BIGINT', { isPrimaryKey: true }),
            column('author_id', 'BIGINT'),
          ],
          {
            foreignKeys: [foreignKey(['author_id'], 'users', ['id'])],
            sourceType: 'Post',
          }
        ),
        table(
          'comments',
          [
            column('id', 'BIGINT', { isPrimaryKey: true }),
            column('user_id', 'BIGINT'),
          ],
          {
            foreignKeys: [foreignKey(['user_id'], 'users', ['id'])],
            sourceType: 'Comment',
          }
        ),
      ]);

      // Has-many: single FK from each table, no disambiguation needed
      const userRelations = discoverHasManyRelations(s, 'users');

      assert.strictEqual(userRelations.length, 2);
      const methodNames = userRelations.map(r => r.methodName).toSorted();
      assert.deepStrictEqual(methodNames, ['getComments', 'getPosts']);
    });

    it('should handle composite FK', () => {
      const s = schema([
        table(
          'tenant_users',
          [
            column('tenant_id', 'BIGINT', { isPrimaryKey: true }),
            column('user_id', 'BIGINT', { isPrimaryKey: true }),
          ],
          {
            sourceType: 'TenantUser',
          }
        ),
        table(
          'posts',
          [
            column('id', 'BIGINT', { isPrimaryKey: true }),
            column('tenant_id', 'BIGINT'),
            column('author_user_id', 'BIGINT'),
          ],
          {
            foreignKeys: [
              foreignKey(
                ['tenant_id', 'author_user_id'],
                'tenant_users',
                ['tenant_id', 'user_id']
              ),
            ],
            sourceType: 'Post',
          }
        ),
      ]);

      const relations = discoverBelongsToRelations(s, 'posts');

      assert.strictEqual(relations.length, 1);
      // Method name from first column
      assert.strictEqual(relations[0]!.methodName, 'getTenant');
      // Both columns included
      assert.deepStrictEqual(relations[0]!.localColumns, [
        'tenant_id',
        'author_user_id',
      ]);
      assert.deepStrictEqual(relations[0]!.targetColumns, [
        'tenant_id',
        'user_id',
      ]);
    });

    it('should preserve vowel-y endings in pluralization', () => {
      const s = schema([
        table('users', [column('id', 'BIGINT', { isPrimaryKey: true })], {
          sourceType: 'User',
        }),
        table(
          'api_keys',
          [
            column('id', 'BIGINT', { isPrimaryKey: true }),
            column('user_id', 'BIGINT'),
          ],
          {
            foreignKeys: [foreignKey(['user_id'], 'users', ['id'])],
            sourceType: 'ApiKey', // Key -> Keys, not Kies
          }
        ),
      ]);

      const relations = discoverHasManyRelations(s, 'users');

      assert.strictEqual(relations[0]!.methodName, 'getApiKeys');
    });
  });
});
