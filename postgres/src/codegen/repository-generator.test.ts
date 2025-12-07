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
  properties: Array<{ name: string; fieldNumber?: number | null }> = []
): PmtMessage {
  return {
    name,
    isMessageType: true,
    isTableType: true,
    extendPath: null,
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
  columns: Record<string, { type: string; isPrimaryKey?: boolean; nullable?: boolean }>
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
      .filter(([_, c]) => c.isPrimaryKey)
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

      const result = generateRepository(message, table);

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

      const result = generateRepository(message, table);

      assert.ok(result.source.includes("id: 'INTEGER'"));
      assert.ok(!result.source.includes("id: 'SERIAL'"));
    });

    it('should normalize BIGSERIAL to BIGINT in columnTypes', () => {
      const message = createMessage('Post', [{ name: 'id' }]);
      const table = createTable('posts', {
        id: { type: 'BIGSERIAL', isPrimaryKey: true },
      });

      const result = generateRepository(message, table);

      assert.ok(result.source.includes("id: 'BIGINT'"));
      assert.ok(!result.source.includes("id: 'BIGSERIAL'"));
    });

    it('should normalize VARCHAR(N) to TEXT in columnTypes', () => {
      const message = createMessage('User', [{ name: 'email' }]);
      const table = createTable('users', {
        email: { type: 'VARCHAR(255)' },
      });

      const result = generateRepository(message, table);

      assert.ok(result.source.includes("email: 'TEXT'"));
      assert.ok(!result.source.includes('VARCHAR'));
    });

    it('should preserve NUMERIC/DECIMAL with precision', () => {
      const message = createMessage('Product', [{ name: 'price' }]);
      const table = createTable('products', {
        price: { type: 'NUMERIC(10,2)' },
      });

      const result = generateRepository(message, table);

      assert.ok(result.source.includes("price: 'NUMERIC(10,2)'"));
    });

    it('should generate warning comment when no primary key', () => {
      const message = createMessage('Log', [{ name: 'message' }]);
      const table = createTable('logs', {
        message: { type: 'TEXT' },
      });

      const result = generateRepository(message, table);

      assert.ok(result.source.includes('WARNING: This table has no primary key'));
      assert.ok(result.source.includes("primaryKey: ''"));
    });

    it('should use custom postgres import path', () => {
      const message = createMessage('User', [{ name: 'id' }]);
      const table = createTable('users', {
        id: { type: 'BIGINT', isPrimaryKey: true },
      });

      const result = generateRepository(message, table, {
        postgresImport: '../lib/postgres',
      });

      assert.ok(result.source.includes("from '../lib/postgres'"));
    });

    it('should include type import when typesImportPrefix is set', () => {
      const message = createMessage('User', [{ name: 'id' }]);
      const table = createTable('users', {
        id: { type: 'BIGINT', isPrimaryKey: true },
      });

      const result = generateRepository(message, table, {
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

      const result = generateRepository(message, table, {
        schemaName: 'myapp',
      });

      assert.ok(result.source.includes("schemaName = 'myapp'"));
    });

    it('should handle PascalCase type names with multiple words', () => {
      const message = createMessage('UserProfile', [{ name: 'id' }]);
      const table = createTable('user_profiles', {
        id: { type: 'BIGINT', isPrimaryKey: true },
      });

      const result = generateRepository(message, table);

      assert.strictEqual(result.className, 'UserProfileRepository');
      assert.strictEqual(result.filename, 'user-profile-repository');
      assert.ok(result.source.includes('class UserProfileRepository'));
    });

    it('should handle acronyms in type names', () => {
      const message = createMessage('ApiKey', [{ name: 'id' }]);
      const table = createTable('api_keys', {
        id: { type: 'BIGINT', isPrimaryKey: true },
      });

      const result = generateRepository(message, table);

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

      const classNames = result.repositories.map(r => r.className);
      assert.ok(classNames.includes('UserRepository'));
      assert.ok(classNames.includes('PostRepository'));
    });

    it('should skip non-Table types', () => {
      const messageType: PmtMessage = {
        name: 'Request',
        isMessageType: true,
        isTableType: false,
        extendPath: null,
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

      const result = generateRepositories(files, schema, { generateBarrel: false });

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
        mangos: createTable('mangos', { id: { type: 'BIGINT', isPrimaryKey: true } }),
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

      const columns: Record<string, { type: string; isPrimaryKey?: boolean }> = {};
      for (let i = 0; i < 20; i++) {
        columns[`col${i}`] = { type: 'TEXT', isPrimaryKey: i === 0 };
      }
      const table = createTable('big_tables', columns);

      const result = generateRepository(message, table);

      assert.ok(result.source.includes('col0'));
      assert.ok(result.source.includes('col19'));
    });

    it('should handle table names that are already plural', () => {
      const message = createMessage('News', [{ name: 'id' }]);
      // 'News' -> 'news' (already ends in 's')
      const table = createTable('news', {
        id: { type: 'BIGINT', isPrimaryKey: true },
      });

      const result = generateRepository(message, table);

      assert.strictEqual(result.tableName, 'news');
      assert.ok(result.source.includes("tableName: 'news'"));
    });

    it('should handle column names with underscores', () => {
      const message = createMessage('User', [{ name: 'created_at' }]);
      const table = createTable('users', {
        created_at: { type: 'TIMESTAMPTZ' },
      });

      const result = generateRepository(message, table);

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

      const result = generateRepository(message, table);

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

      const result = generateRepository(message, table);

      // Should be a string, not an array, for single PK
      assert.ok(result.source.includes("primaryKey: 'id'"));
      assert.ok(!result.source.includes("primaryKey: ['id']"));
    });
  });
});
