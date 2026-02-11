import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  generateRepositories,
  generateRepository,
  type RepositoryGeneratorOptions,
} from './repository-generator.js';
import type { PmtFile, PmtMessage, SourceLocation } from '@/tools/parser/types.js';
import type { DatabaseSchema, TableDefinition, ColumnDefinition } from '../schema/types.js';

const dummyLocation: SourceLocation = {
  start: { line: 1, column: 0 },
  end: { line: 1, column: 10 },
};

/**
 * Helper to create a minimal PmtMessage for testing.
 */
function createMessage(
  name: string,
  properties: { name: string; fieldNumber?: number | null }[] = []
): PmtMessage {
  return {
    name,
    isMessageType: true,
    isTableType: true,
    isWrapperValue: false,
    extendPath: null,
    typeId: null,
    compact: false,
    properties: properties.map(p => ({
      name: p.name,
      fieldNumber: p.fieldNumber ?? null,
      optional: false,
      readonly: false,
      type: { kind: 'primitive', primitive: 'string' },
      location: dummyLocation,
    })),
    typeParameters: [],
    wrapper: null,
    location: dummyLocation,
  };
}

/**
 * Helper to create a minimal TableDefinition for testing.
 */
function createTable(
  tableName: string,
  columns: Record<
    string,
    { type: string; isPrimaryKey?: boolean; nullable?: boolean }
  >
): TableDefinition {
  const cols: Record<string, ColumnDefinition> = {};
  for (const [colName, col] of Object.entries(columns)) {
    cols[colName] = {
      name: colName,
      type: col.type,
      nullable: col.nullable ?? false,
      isPrimaryKey: col.isPrimaryKey ?? false,
      isAutoIncrement: false,
      isUnique: false,
    };
  }
  return {
    name: tableName,
    columns: cols,
    primaryKey: Object.entries(columns)
      .filter(([unused_colName, c]) => {
        void unused_colName;
        return c.isPrimaryKey;
      })
      .map(([name]) => name),
    indexes: [],
    foreignKeys: [],
    checkConstraints: [],
  };
}

/**
 * Helper to create a minimal PmtFile for testing.
 */
function createFile(messages: PmtMessage[]): PmtFile {
  return {
    path: '/test/test.pmsg',
    messages,
    typeAliases: [],
    imports: [],
    diagnostics: [],
  };
}

/**
 * Helper to create a minimal DatabaseSchema for testing.
 */
function createSchema(tables: Record<string, TableDefinition>): DatabaseSchema {
  return {
    schemaName: 'public',
    tables,
  };
}

/**
 * Helper to wrap a single table in a schema.
 */
function schemaWith(table: TableDefinition): DatabaseSchema {
  return createSchema({ [table.name]: table });
}

describe('Repository Generator', () => {
  describe('generateRepository', () => {
    it('should generate a basic repository class', () => {
      const message = createMessage('User', [
        { name: 'id', fieldNumber: 1 },
        { name: 'email', fieldNumber: 2 },
        { name: 'name', fieldNumber: 3 },
      ]);

      const table = createTable('users', {
        id: { type: 'BIGINT', isPrimaryKey: true },
        email: { type: 'TEXT' },
        name: { type: 'TEXT' },
      });

      const result = generateRepository(message, table, schemaWith(table));

      assert.strictEqual(result.className, 'UserRepository');
      assert.strictEqual(result.filename, 'user-repository');
      assert.strictEqual(result.sourceType, 'User');
      assert.strictEqual(result.tableName, 'users');

      // Check source contains expected elements
      assert.ok(result.source.includes('class UserRepository extends BaseRepository'));
      assert.ok(result.source.includes("tableName: 'users'"));
      assert.ok(result.source.includes("primaryKey: 'id'"));
      assert.ok(result.source.includes("columns: ['id', 'email', 'name']"));
    });

    it('should normalize SERIAL to INTEGER in columnTypes', () => {
      const message = createMessage('Post', [{ name: 'id' }]);
      const table = createTable('posts', {
        id: { type: 'SERIAL', isPrimaryKey: true },
      });

      const result = generateRepository(message, table, schemaWith(table));

      assert.ok(result.source.includes("id: 'INTEGER'"));
      assert.ok(!result.source.includes("id: 'SERIAL'"));
    });

    it('should normalize BIGSERIAL to BIGINT in columnTypes', () => {
      const message = createMessage('Post', [{ name: 'id' }]);
      const table = createTable('posts', {
        id: { type: 'BIGSERIAL', isPrimaryKey: true },
      });

      const result = generateRepository(message, table, schemaWith(table));

      assert.ok(result.source.includes("id: 'BIGINT'"));
      assert.ok(!result.source.includes("id: 'BIGSERIAL'"));
    });

    it('should normalize VARCHAR(N) to TEXT in columnTypes', () => {
      const message = createMessage('User', [{ name: 'email' }]);
      const table = createTable('users', {
        email: { type: 'VARCHAR(255)' },
      });

      const result = generateRepository(message, table, schemaWith(table));

      assert.ok(result.source.includes("email: 'TEXT'"));
      assert.ok(!result.source.includes('VARCHAR'));
    });

    it('should preserve NUMERIC/DECIMAL with precision', () => {
      const message = createMessage('Product', [{ name: 'price' }]);
      const table = createTable('products', {
        price: { type: 'NUMERIC(10,2)' },
      });

      const result = generateRepository(message, table, schemaWith(table));

      assert.ok(result.source.includes("price: 'NUMERIC(10,2)'"));
    });

    it('should generate warning comment when no primary key', () => {
      const message = createMessage('Log', [{ name: 'message' }]);
      const table = createTable('logs', {
        message: { type: 'TEXT' },
      });

      const result = generateRepository(message, table, schemaWith(table));

      assert.ok(result.source.includes('WARNING: This table has no primary key'));
      assert.ok(result.source.includes("primaryKey: ''"));
    });

    it('should use custom postgres import path', () => {
      const message = createMessage('User', [{ name: 'id' }]);
      const table = createTable('users', {
        id: { type: 'BIGINT', isPrimaryKey: true },
      });

      const result = generateRepository(message, table, schemaWith(table), {
        postgresImport: '../lib/postgres',
      });

      assert.ok(result.source.includes("from '../lib/postgres'"));
    });

    it('should include type import when typesImportPrefix is set', () => {
      const message = createMessage('User', [{ name: 'id' }]);
      const table = createTable('users', {
        id: { type: 'BIGINT', isPrimaryKey: true },
      });

      const result = generateRepository(message, table, schemaWith(table), {
        typesImportPrefix: '../models',
      });

      assert.ok(result.source.includes("import type { User } from '../models/user.pmsg.js'"));
      assert.ok(result.source.includes('User & Record<string, unknown>'));
    });

    it('should use custom schema name', () => {
      const message = createMessage('User', [{ name: 'id' }]);
      const table = createTable('users', {
        id: { type: 'BIGINT', isPrimaryKey: true },
      });

      const result = generateRepository(message, table, schemaWith(table), {
        schemaName: 'myapp',
      });

      assert.ok(result.source.includes("schemaName = 'myapp'"));
    });

    it('should handle PascalCase type names with multiple words', () => {
      const message = createMessage('UserProfile', [{ name: 'id' }]);
      const table = createTable('user_profiles', {
        id: { type: 'BIGINT', isPrimaryKey: true },
      });

      const result = generateRepository(message, table, schemaWith(table));

      assert.strictEqual(result.className, 'UserProfileRepository');
      assert.strictEqual(result.filename, 'user-profile-repository');
      assert.ok(result.source.includes('class UserProfileRepository'));
    });

    it('should handle acronyms in type names', () => {
      const message = createMessage('ApiKey', [{ name: 'id' }]);
      const table = createTable('api_keys', {
        id: { type: 'BIGINT', isPrimaryKey: true },
      });

      const result = generateRepository(message, table, schemaWith(table));

      assert.strictEqual(result.className, 'ApiKeyRepository');
      assert.strictEqual(result.filename, 'api-key-repository');
    });
  });

  describe('generateRepositories', () => {
    it('should generate repositories for all Table types', () => {
      const files: PmtFile[] = [
        createFile([
          createMessage('User', [{ name: 'id' }, { name: 'email' }]),
          createMessage('Post', [{ name: 'id' }, { name: 'title' }]),
        ]),
      ];

      const schema = createSchema({
        users: createTable('users', {
          id: { type: 'BIGINT', isPrimaryKey: true },
          email: { type: 'TEXT' },
        }),
        posts: createTable('posts', {
          id: { type: 'BIGINT', isPrimaryKey: true },
          title: { type: 'TEXT' },
        }),
      });

      const result = generateRepositories(files, schema);

      assert.strictEqual(result.repositories.length, 2);

      const classNames = new Set(result.repositories.map(r => r.className));
      assert.ok(classNames.has('UserRepository'));
      assert.ok(classNames.has('PostRepository'));
    });

    it('should skip non-Table types', () => {
      const messageType: PmtMessage = {
        name: 'Request',
        isMessageType: true,
        isTableType: false,
        isWrapperValue: false,
        extendPath: null,
        typeId: null,
        compact: false,
        properties: [],
        typeParameters: [],
        wrapper: null,
        location: dummyLocation,
      };

      const files: PmtFile[] = [
        createFile([
          createMessage('User', [{ name: 'id' }]),
          messageType,
        ]),
      ];

      const schema = createSchema({
        users: createTable('users', {
          id: { type: 'BIGINT', isPrimaryKey: true },
        }),
      });

      const result = generateRepositories(files, schema);

      assert.strictEqual(result.repositories.length, 1);
      assert.strictEqual(result.repositories[0]!.className, 'UserRepository');
    });

    it('should skip tables not in schema', () => {
      const files: PmtFile[] = [
        createFile([
          createMessage('User', [{ name: 'id' }]),
          createMessage('OrphanType', [{ name: 'id' }]),
        ]),
      ];

      const schema = createSchema({
        users: createTable('users', {
          id: { type: 'BIGINT', isPrimaryKey: true },
        }),
        // No orphan_types table
      });

      const result = generateRepositories(files, schema);

      assert.strictEqual(result.repositories.length, 1);
      assert.strictEqual(result.repositories[0]!.className, 'UserRepository');
    });

    it('should generate barrel export by default', () => {
      const files: PmtFile[] = [
        createFile([
          createMessage('User', [{ name: 'id' }]),
          createMessage('Post', [{ name: 'id' }]),
        ]),
      ];

      const schema = createSchema({
        users: createTable('users', { id: { type: 'BIGINT', isPrimaryKey: true } }),
        posts: createTable('posts', { id: { type: 'BIGINT', isPrimaryKey: true } }),
      });

      const result = generateRepositories(files, schema);

      assert.ok(result.barrelExport);
      assert.ok(result.barrelExport.includes("export { PostRepository } from './post-repository.js'"));
      assert.ok(result.barrelExport.includes("export { UserRepository } from './user-repository.js'"));
    });

    it('should skip barrel export when generateBarrel is false', () => {
      const files: PmtFile[] = [
        createFile([createMessage('User', [{ name: 'id' }])]),
      ];

      const schema = createSchema({
        users: createTable('users', { id: { type: 'BIGINT', isPrimaryKey: true } }),
      });

      const result = generateRepositories(
        files,
        schema,
        { generateBarrel: false }
      );

      assert.strictEqual(result.barrelExport, undefined);
    });

    it('should not generate barrel export when no repositories', () => {
      const files: PmtFile[] = [createFile([])];
      const schema = createSchema({});

      const result = generateRepositories(files, schema);

      assert.strictEqual(result.repositories.length, 0);
      assert.strictEqual(result.barrelExport, undefined);
    });

    it('should sort repositories by class name', () => {
      const files: PmtFile[] = [
        createFile([
          createMessage('Zebra', [{ name: 'id' }]),
          createMessage('Apple', [{ name: 'id' }]),
          createMessage('Mango', [{ name: 'id' }]),
        ]),
      ];

      const schema = createSchema({
        zebras: createTable('zebras', { id: { type: 'BIGINT', isPrimaryKey: true } }),
        apples: createTable('apples', { id: { type: 'BIGINT', isPrimaryKey: true } }),
        mangoes: createTable('mangoes', { id: { type: 'BIGINT', isPrimaryKey: true } }),
      });

      const result = generateRepositories(files, schema);

      assert.strictEqual(result.repositories[0]!.className, 'AppleRepository');
      assert.strictEqual(result.repositories[1]!.className, 'MangoRepository');
      assert.strictEqual(result.repositories[2]!.className, 'ZebraRepository');
    });

    it('should handle multiple files', () => {
      const files: PmtFile[] = [
        createFile([createMessage('User', [{ name: 'id' }])]),
        createFile([createMessage('Post', [{ name: 'id' }])]),
      ];

      const schema = createSchema({
        users: createTable('users', { id: { type: 'BIGINT', isPrimaryKey: true } }),
        posts: createTable('posts', { id: { type: 'BIGINT', isPrimaryKey: true } }),
      });

      const result = generateRepositories(files, schema);

      assert.strictEqual(result.repositories.length, 2);
    });

    it('should apply options to all generated repositories', () => {
      const files: PmtFile[] = [
        createFile([
          createMessage('User', [{ name: 'id' }]),
          createMessage('Post', [{ name: 'id' }]),
        ]),
      ];

      const schema = createSchema({
        users: createTable('users', { id: { type: 'BIGINT', isPrimaryKey: true } }),
        posts: createTable('posts', { id: { type: 'BIGINT', isPrimaryKey: true } }),
      });

      const options: RepositoryGeneratorOptions = {
        schemaName: 'custom_schema',
        typesImportPrefix: '../types',
      };

      const result = generateRepositories(files, schema, options);

      for (const repo of result.repositories) {
        assert.ok(repo.source.includes("schemaName = 'custom_schema'"));
        assert.ok(repo.source.includes("from '../types/"));
      }
    });
  });

  describe('edge cases', () => {
    it('should handle tables with many columns', () => {
      const props = Array.from({ length: 20 }, (_, i) => ({ name: `col${i}` }));
      const message = createMessage('BigTable', props);

      const columns: Record<
        string,
        { type: string; isPrimaryKey?: boolean }
      > = {};
      for (let i = 0; i < 20; i++) {
        columns[`col${i}`] = { type: 'TEXT', isPrimaryKey: i === 0 };
      }
      const table = createTable('big_tables', columns);

      const result = generateRepository(message, table, schemaWith(table));

      assert.ok(result.source.includes('col0'));
      assert.ok(result.source.includes('col19'));
    });

    it('should handle table names that are already plural', () => {
      const message = createMessage('News', [{ name: 'id' }]);
      // 'News' -> 'news' (already ends in 's')
      const table = createTable('news', {
        id: { type: 'BIGINT', isPrimaryKey: true },
      });

      const result = generateRepository(message, table, schemaWith(table));

      assert.strictEqual(result.tableName, 'news');
      assert.ok(result.source.includes("tableName: 'news'"));
    });

    it('should handle column names with underscores', () => {
      const message = createMessage('User', [{ name: 'created_at' }]);
      const table = createTable('users', {
        created_at: { type: 'TIMESTAMPTZ' },
      });

      const result = generateRepository(message, table, schemaWith(table));

      assert.ok(result.source.includes("'created_at'"));
      assert.ok(result.source.includes("created_at: 'TIMESTAMPTZ'"));
    });

    it('should handle composite primary keys', () => {
      const message = createMessage('UserRole', [
        { name: 'user_id', fieldNumber: 1 },
        { name: 'role_id', fieldNumber: 2 },
        { name: 'granted_at', fieldNumber: 3 },
      ]);
      const table = createTable('user_roles', {
        user_id: { type: 'BIGINT', isPrimaryKey: true },
        role_id: { type: 'BIGINT', isPrimaryKey: true },
        granted_at: { type: 'TIMESTAMPTZ' },
      });

      const result = generateRepository(message, table, schemaWith(table));

      assert.ok(result.source.includes("primaryKey: ['user_id', 'role_id']"));
      assert.strictEqual(result.className, 'UserRoleRepository');
    });

    it('should handle single primary key from primaryKey array', () => {
      const message = createMessage('User', [{ name: 'id' }]);
      const table: TableDefinition = {
        name: 'users',
        columns: {
          id: {
            name: 'id',
            type: 'BIGINT',
            nullable: false,
            isPrimaryKey: false, // Not marked at column level
            isAutoIncrement: false,
            isUnique: false,
          },
        },
        primaryKey: ['id'], // Single-element array
        indexes: [],
        foreignKeys: [],
        checkConstraints: [],
      };

      const result = generateRepository(message, table, schemaWith(table));

      // Should be a string, not an array, for single PK
      assert.ok(result.source.includes("primaryKey: 'id'"));
      assert.ok(!result.source.includes("primaryKey: ['id']"));
    });
  });

  describe('relation generation', () => {
    /**
     * Helper to create a schema with foreign keys.
     */
    // eslint-disable-next-line unicorn/consistent-function-scoping
    function createSchemaWithFk(): DatabaseSchema {
      return {
        schemaName: 'public',
        tables: {
          users: {
            name: 'users',
            columns: {
              id: { name: 'id', type: 'BIGINT', nullable: false, isPrimaryKey: true, isUnique: false, isAutoIncrement: true },
              name: { name: 'name', type: 'TEXT', nullable: false, isPrimaryKey: false, isUnique: false, isAutoIncrement: false },
            },
            primaryKey: ['id'],
            indexes: [],
            foreignKeys: [],
            checkConstraints: [],
            sourceType: 'User',
          },
          posts: {
            name: 'posts',
            columns: {
              id: { name: 'id', type: 'BIGINT', nullable: false, isPrimaryKey: true, isUnique: false, isAutoIncrement: true },
              title: { name: 'title', type: 'TEXT', nullable: false, isPrimaryKey: false, isUnique: false, isAutoIncrement: false },
              author_id: { name: 'author_id', type: 'BIGINT', nullable: false, isPrimaryKey: false, isUnique: false, isAutoIncrement: false },
            },
            primaryKey: ['id'],
            indexes: [],
            foreignKeys: [{
              name: 'posts_author_id_fkey',
              columns: ['author_id'],
              referencedTable: 'users',
              referencedColumns: ['id'],
              onDelete: 'NO ACTION',
              onUpdate: 'NO ACTION',
            }],
            checkConstraints: [],
            sourceType: 'Post',
          },
        },
      };
    }

    it('should generate belongs-to relation method', () => {
      const postMessage = createMessage('Post', [
        { name: 'id', fieldNumber: 1 },
        { name: 'title', fieldNumber: 2 },
        { name: 'author_id', fieldNumber: 3 },
      ]);

      const schema = createSchemaWithFk();
      const result = generateRepository(postMessage, schema.tables['posts']!, schema, {
        typesImportPrefix: '../models',
      });

      // Should have getAuthor method
      assert.ok(result.source.includes('async getAuthor(entity: Partial<Post>): Promise<User | null>'));
      assert.ok(result.source.includes('queryRelatedOne'));
      assert.ok(result.source.includes("'users'"));
      assert.ok(result.source.includes('[entity.authorId]'));

      // Should have deserialize helper
      assert.ok(result.source.includes('private deserializeAsUser(row: Record<string, unknown>): User'));

      // Should import User type (value import for instantiation)
      assert.ok(result.source.includes("import { User } from '../models/user.pmsg.js'"));

      // Should import deserializeValue
      assert.ok(result.source.includes('import { BaseRepository, deserializeValue }'));
    });

    it('should generate has-many relation method', () => {
      const userMessage = createMessage('User', [
        { name: 'id', fieldNumber: 1 },
        { name: 'name', fieldNumber: 2 },
      ]);

      const schema = createSchemaWithFk();
      const result = generateRepository(userMessage, schema.tables['users']!, schema, {
        typesImportPrefix: '../models',
      });

      // Should have getPosts method
      assert.ok(result.source.includes('async getPosts(entity: Partial<User>): Promise<Post[]>'));
      assert.ok(result.source.includes('queryRelatedMany'));
      assert.ok(result.source.includes("'posts'"));
      assert.ok(result.source.includes('[entity.id]'));

      // Should have deserialize helper
      assert.ok(result.source.includes('private deserializeAsPost(row: Record<string, unknown>): Post'));

      // Should import Post type (value import)
      assert.ok(result.source.includes("import { Post } from '../models/post.pmsg.js'"));
    });

    it('should not generate relations when generateRelations is false', () => {
      const postMessage = createMessage('Post', [
        { name: 'id', fieldNumber: 1 },
        { name: 'author_id', fieldNumber: 2 },
      ]);

      const schema = createSchemaWithFk();
      const result = generateRepository(postMessage, schema.tables['posts']!, schema, {
        typesImportPrefix: '../models',
        generateRelations: false,
      });

      assert.ok(!result.source.includes('getAuthor'));
      assert.ok(!result.source.includes('queryRelatedOne'));
    });

    it('should not generate relations without typesImportPrefix', () => {
      const postMessage = createMessage('Post', [
        { name: 'id', fieldNumber: 1 },
        { name: 'author_id', fieldNumber: 2 },
      ]);

      const schema = createSchemaWithFk();
      const result = generateRepository(postMessage, schema.tables['posts']!, schema, {
        // No typesImportPrefix
      });

      // Without typesImportPrefix, we can't generate typed relation methods
      assert.ok(!result.source.includes('getAuthor'));
    });

    it('should not import self type twice for self-referencing FK', () => {
      const categoryMessage = createMessage('Category', [
        { name: 'id', fieldNumber: 1 },
        { name: 'parent_id', fieldNumber: 2 },
      ]);

      const schema: DatabaseSchema = {
        schemaName: 'public',
        tables: {
          categories: {
            name: 'categories',
            columns: {
              id: { name: 'id', type: 'BIGINT', nullable: false, isPrimaryKey: true, isUnique: false, isAutoIncrement: true },
              parent_id: { name: 'parent_id', type: 'BIGINT', nullable: true, isPrimaryKey: false, isUnique: false, isAutoIncrement: false },
            },
            primaryKey: ['id'],
            indexes: [],
            foreignKeys: [{
              name: 'categories_parent_id_fkey',
              columns: ['parent_id'],
              referencedTable: 'categories',
              referencedColumns: ['id'],
              onDelete: 'NO ACTION',
              onUpdate: 'NO ACTION',
            }],
            checkConstraints: [],
            sourceType: 'Category',
          },
        },
      };

      const result = generateRepository(categoryMessage, schema.tables['categories']!, schema, {
        typesImportPrefix: '../models',
      });

      // Should have a value import for Category (for instantiation in deserialize helper)
      const categoryValueImports = (
        result.source.match(/import \{ Category \}/g)
        || []
      ).length;
      assert.strictEqual(categoryValueImports, 1);

      // Should NOT have a type import (we use value import instead)
      const categoryTypeImports = (
        result.source.match(/import type \{ Category \}/g)
        || []
      ).length;
      assert.strictEqual(categoryTypeImports, 0);

      // Should have both getParent and getCategories
      assert.ok(result.source.includes('getParent'));
      assert.ok(result.source.includes('getCategories'));
    });

    it('should handle multiple relations to same type', () => {
      const postMessage = createMessage('Post', [
        { name: 'id', fieldNumber: 1 },
        { name: 'author_id', fieldNumber: 2 },
        { name: 'editor_id', fieldNumber: 3 },
      ]);

      const schema: DatabaseSchema = {
        schemaName: 'public',
        tables: {
          users: {
            name: 'users',
            columns: {
              id: { name: 'id', type: 'BIGINT', nullable: false, isPrimaryKey: true, isUnique: false, isAutoIncrement: true },
            },
            primaryKey: ['id'],
            indexes: [],
            foreignKeys: [],
            checkConstraints: [],
            sourceType: 'User',
          },
          posts: {
            name: 'posts',
            columns: {
              id: { name: 'id', type: 'BIGINT', nullable: false, isPrimaryKey: true, isUnique: false, isAutoIncrement: true },
              author_id: { name: 'author_id', type: 'BIGINT', nullable: false, isPrimaryKey: false, isUnique: false, isAutoIncrement: false },
              editor_id: { name: 'editor_id', type: 'BIGINT', nullable: true, isPrimaryKey: false, isUnique: false, isAutoIncrement: false },
            },
            primaryKey: ['id'],
            indexes: [],
            foreignKeys: [
              {
                name: 'posts_author_id_fkey',
                columns: ['author_id'],
                referencedTable: 'users',
                referencedColumns: ['id'],
                onDelete: 'NO ACTION',
                onUpdate: 'NO ACTION',
              },
              {
                name: 'posts_editor_id_fkey',
                columns: ['editor_id'],
                referencedTable: 'users',
                referencedColumns: ['id'],
                onDelete: 'NO ACTION',
                onUpdate: 'NO ACTION',
              },
            ],
            checkConstraints: [],
            sourceType: 'Post',
          },
        },
      };

      const result = generateRepository(postMessage, schema.tables['posts']!, schema, {
        typesImportPrefix: '../models',
      });

      // Should have both methods
      assert.ok(result.source.includes('getAuthor'));
      assert.ok(result.source.includes('getEditor'));

      // Should only have one deserializeAsUser helper (not duplicated)
      const deserializeCount = (
        result.source.match(/private deserializeAsUser/g)
        || []
      ).length;
      assert.strictEqual(deserializeCount, 1);
    });

    it('should generate correct JSDoc comments', () => {
      const postMessage = createMessage('Post', [
        { name: 'id', fieldNumber: 1 },
        { name: 'author_id', fieldNumber: 2 },
      ]);

      const schema = createSchemaWithFk();
      const result = generateRepository(postMessage, schema.tables['posts']!, schema, {
        typesImportPrefix: '../models',
      });

      assert.ok(result.source.includes('Get the related User for this Post'));
      assert.ok(result.source.includes('Follows FK: author_id -> users(id)'));
    });

    it('should generate disambiguated has-many methods when multiple FKs from same table', () => {
      const userMessage = createMessage('User', [
        { name: 'id', fieldNumber: 1 },
      ]);

      const schema: DatabaseSchema = {
        schemaName: 'public',
        tables: {
          users: {
            name: 'users',
            columns: {
              id: { name: 'id', type: 'BIGINT', nullable: false, isPrimaryKey: true, isUnique: false, isAutoIncrement: true },
            },
            primaryKey: ['id'],
            indexes: [],
            foreignKeys: [],
            checkConstraints: [],
            sourceType: 'User',
          },
          posts: {
            name: 'posts',
            columns: {
              id: { name: 'id', type: 'BIGINT', nullable: false, isPrimaryKey: true, isUnique: false, isAutoIncrement: true },
              author_id: { name: 'author_id', type: 'BIGINT', nullable: false, isPrimaryKey: false, isUnique: false, isAutoIncrement: false },
              reviewer_id: { name: 'reviewer_id', type: 'BIGINT', nullable: true, isPrimaryKey: false, isUnique: false, isAutoIncrement: false },
            },
            primaryKey: ['id'],
            indexes: [],
            foreignKeys: [
              {
                name: 'posts_author_id_fkey',
                columns: ['author_id'],
                referencedTable: 'users',
                referencedColumns: ['id'],
                onDelete: 'NO ACTION',
                onUpdate: 'NO ACTION',
              },
              {
                name: 'posts_reviewer_id_fkey',
                columns: ['reviewer_id'],
                referencedTable: 'users',
                referencedColumns: ['id'],
                onDelete: 'NO ACTION',
                onUpdate: 'NO ACTION',
              },
            ],
            checkConstraints: [],
            sourceType: 'Post',
          },
        },
      };

      const result = generateRepository(userMessage, schema.tables['users']!, schema, {
        typesImportPrefix: '../models',
      });

      // Should have disambiguated method names
      assert.ok(result.source.includes('getPostsByAuthor'));
      assert.ok(result.source.includes('getPostsByReviewer'));

      // Should NOT have simple getPosts (would be ambiguous)
      assert.ok(!/\bgetPosts\s*\(/.test(result.source));
    });
  });
});
