/**
 * Integration tests for database introspector.
 */

import { describe, it, before, after } from 'node:test';
import assert from 'node:assert';
import {
  createTestPool,
  isDatabaseAvailable,
  logSkipMessage,
  setupTestSchema,
  teardownTestSchema,
} from './test-utils.js';
import { introspectDatabase } from '../../src/migration/introspector.js';
import type { Pool } from '../../src/connection/pool.js';

describe('Introspector Integration', { skip: !isDatabaseAvailable() }, () => {
  let pool: Pool;
  let schemaPool: Pool;
  let schemaName: string;

  before(async () => {
    const testPool = createTestPool();
    if (!testPool) {
      logSkipMessage();
      return;
    }
    pool = testPool;

    schemaName = await setupTestSchema(pool);
    schemaPool = pool.withSchema(schemaName);

    // Create test tables
    await schemaPool.execute(`
      CREATE TABLE users (
        id BIGSERIAL PRIMARY KEY,
        email TEXT NOT NULL UNIQUE,
        name TEXT NOT NULL,
        role TEXT NOT NULL CHECK (role IN ('admin', 'user', 'guest')),
        score NUMERIC(10,2) DEFAULT 0,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    await schemaPool.execute(
      'CREATE INDEX users_name_idx ON users (name)'
    );

    await schemaPool.execute(`
      CREATE TABLE posts (
        id BIGSERIAL PRIMARY KEY,
        author_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        title TEXT NOT NULL,
        content TEXT,
        published BOOLEAN NOT NULL DEFAULT false,
        view_count INTEGER NOT NULL DEFAULT 0
      )
    `);

    await schemaPool.execute(
      'CREATE INDEX posts_author_idx ON posts (author_id)'
    );

    await schemaPool.execute(
      'CREATE INDEX posts_published_idx ON posts (published) WHERE published = true'
    );
  });

  after(async () => {
    if (pool) {
      await teardownTestSchema(pool, schemaName);
      await pool.end();
    }
  });

  it('should introspect tables', async () => {
    const schema = await introspectDatabase(schemaPool, schemaName);

    assert.ok(schema.tables['users']);
    assert.ok(schema.tables['posts']);
    assert.strictEqual(Object.keys(schema.tables).length, 2);
  });

  it('should introspect schema name', async () => {
    const schema = await introspectDatabase(schemaPool, schemaName);
    assert.strictEqual(schema.schemaName, schemaName);
  });

  it('should introspect columns with correct types', async () => {
    const schema = await introspectDatabase(schemaPool, schemaName);
    const users = schema.tables['users']!;

    // BIGSERIAL column
    assert.ok(users.columns['id']);
    assert.strictEqual(users.columns['id']?.isPrimaryKey, true);
    assert.strictEqual(users.columns['id']?.isAutoIncrement, true);

    // TEXT columns
    assert.strictEqual(users.columns['email']?.type, 'TEXT');
    assert.strictEqual(users.columns['name']?.type, 'TEXT');
    assert.strictEqual(users.columns['role']?.type, 'TEXT');

    // TIMESTAMPTZ column
    assert.ok(
      users.columns['created_at']?.type.includes('TIMESTAMP')
      || users.columns['created_at']?.type === 'TIMESTAMPTZ'
    );
  });

  it('should introspect nullable columns', async () => {
    const schema = await introspectDatabase(schemaPool, schemaName);
    const users = schema.tables['users']!;
    const posts = schema.tables['posts']!;

    // NOT NULL columns
    assert.strictEqual(users.columns['email']?.nullable, false);
    assert.strictEqual(users.columns['name']?.nullable, false);

    // Nullable columns (score has DEFAULT but is nullable)
    assert.strictEqual(users.columns['score']?.nullable, true);

    // content is nullable in posts
    assert.strictEqual(posts.columns['content']?.nullable, true);
  });

  it('should introspect unique constraints', async () => {
    const schema = await introspectDatabase(schemaPool, schemaName);
    const users = schema.tables['users']!;

    assert.strictEqual(users.columns['email']?.isUnique, true);
    assert.strictEqual(users.columns['name']?.isUnique, false);
  });

  it('should introspect primary key', async () => {
    const schema = await introspectDatabase(schemaPool, schemaName);

    assert.deepStrictEqual(schema.tables['users']?.primaryKey, ['id']);
    assert.deepStrictEqual(schema.tables['posts']?.primaryKey, ['id']);
  });

  it('should introspect indexes', async () => {
    const schema = await introspectDatabase(schemaPool, schemaName);
    const users = schema.tables['users']!;
    const posts = schema.tables['posts']!;

    // users_name_idx
    const nameIdx = users.indexes.find(i => i.columns.includes('name'));
    assert.ok(nameIdx, 'Should have index on name');
    assert.strictEqual(nameIdx.unique, false);

    // Unique constraint on email creates an index
    const emailIdx = users.indexes.find(i => i.columns.includes('email'));
    assert.ok(emailIdx, 'Should have index on email (from UNIQUE)');
    assert.strictEqual(emailIdx.unique, true);

    // posts_author_idx
    const authorIdx = posts.indexes.find(i => i.columns.includes('author_id'));
    assert.ok(authorIdx, 'Should have index on author_id');
  });

  it('should introspect foreign keys', async () => {
    const schema = await introspectDatabase(schemaPool, schemaName);
    const posts = schema.tables['posts']!;

    assert.strictEqual(posts.foreignKeys.length, 1);
    const fk = posts.foreignKeys[0]!;

    assert.deepStrictEqual(fk.columns, ['author_id']);
    assert.strictEqual(fk.referencedTable, 'users');
    assert.deepStrictEqual(fk.referencedColumns, ['id']);
    assert.strictEqual(fk.onDelete, 'CASCADE');
  });

  it('should introspect check constraints', async () => {
    const schema = await introspectDatabase(schemaPool, schemaName);
    const users = schema.tables['users']!;

    // Find the role check constraint
    const roleCheck = users.checkConstraints.find(
      c => c.expression.includes('role')
    );
    assert.ok(roleCheck, 'Should have check constraint on role');
    assert.ok(roleCheck.expression.includes('admin'));
    assert.ok(roleCheck.expression.includes('user'));
    assert.ok(roleCheck.expression.includes('guest'));
  });

  it('should introspect default values', async () => {
    const schema = await introspectDatabase(schemaPool, schemaName);
    const users = schema.tables['users']!;
    const posts = schema.tables['posts']!;

    // score has DEFAULT 0
    assert.ok(users.columns['score']?.defaultValue);

    // published has DEFAULT false
    assert.ok(posts.columns['published']?.defaultValue);

    // view_count has DEFAULT 0
    assert.ok(posts.columns['view_count']?.defaultValue);
  });

  it('should introspect NUMERIC precision and scale', async () => {
    const schema = await introspectDatabase(schemaPool, schemaName);
    const users = schema.tables['users']!;

    // score is NUMERIC(10,2)
    const scoreType = users.columns['score']?.type;
    assert.ok(scoreType);
    assert.ok(
      scoreType.includes('NUMERIC') || scoreType.includes('numeric'),
      `Expected NUMERIC type, got ${scoreType}`
    );
  });

  it('should introspect BOOLEAN type', async () => {
    const schema = await introspectDatabase(schemaPool, schemaName);
    const posts = schema.tables['posts']!;

    assert.strictEqual(posts.columns['published']?.type, 'BOOLEAN');
  });

  it('should introspect INTEGER type', async () => {
    const schema = await introspectDatabase(schemaPool, schemaName);
    const posts = schema.tables['posts']!;

    assert.strictEqual(posts.columns['view_count']?.type, 'INTEGER');
  });

  it('should handle table with no indexes', async () => {
    // Create a simple table with no indexes
    await schemaPool.execute(`
      CREATE TABLE simple_table (
        data TEXT
      )
    `);

    try {
      const schema = await introspectDatabase(schemaPool, schemaName);
      const simple = schema.tables['simple_table']!;

      assert.ok(simple);
      assert.strictEqual(simple.indexes.length, 0);
      assert.strictEqual(simple.foreignKeys.length, 0);
      assert.deepStrictEqual(simple.primaryKey, []);
    } finally {
      await schemaPool.execute('DROP TABLE simple_table');
    }
  });

  it('should handle table with composite primary key', async () => {
    await schemaPool.execute(`
      CREATE TABLE composite_pk (
        a INTEGER NOT NULL,
        b INTEGER NOT NULL,
        value TEXT,
        PRIMARY KEY (a, b)
      )
    `);

    try {
      const schema = await introspectDatabase(schemaPool, schemaName);
      const table = schema.tables['composite_pk']!;

      assert.ok(table);
      assert.deepStrictEqual(table.primaryKey.sort(), ['a', 'b']);
    } finally {
      await schemaPool.execute('DROP TABLE composite_pk');
    }
  });

  it('should handle table with composite foreign key', async () => {
    await schemaPool.execute(`
      CREATE TABLE parent_composite (
        a INTEGER NOT NULL,
        b INTEGER NOT NULL,
        PRIMARY KEY (a, b)
      )
    `);

    await schemaPool.execute(`
      CREATE TABLE child_composite (
        id SERIAL PRIMARY KEY,
        parent_a INTEGER NOT NULL,
        parent_b INTEGER NOT NULL,
        FOREIGN KEY (parent_a, parent_b) REFERENCES parent_composite(a, b)
      )
    `);

    try {
      const schema = await introspectDatabase(schemaPool, schemaName);
      const child = schema.tables['child_composite']!;

      assert.strictEqual(child.foreignKeys.length, 1);
      const fk = child.foreignKeys[0]!;
      assert.deepStrictEqual(fk.columns.sort(), ['parent_a', 'parent_b']);
      assert.deepStrictEqual(fk.referencedColumns.sort(), ['a', 'b']);
    } finally {
      await schemaPool.execute('DROP TABLE child_composite');
      await schemaPool.execute('DROP TABLE parent_composite');
    }
  });

  it('should exclude tables when specified', async () => {
    const schema = await introspectDatabase(schemaPool, schemaName, {
      excludeTables: ['posts'],
    });

    assert.ok(schema.tables['users']);
    assert.ok(!schema.tables['posts']);
  });

  it('should include only specified tables', async () => {
    const schema = await introspectDatabase(schemaPool, schemaName, {
      includeTables: ['users'],
    });

    assert.ok(schema.tables['users']);
    assert.ok(!schema.tables['posts']);
  });
});
