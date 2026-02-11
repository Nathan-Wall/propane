/**
 * Integration tests for migration runner.
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
import {
  createMigrationRunner,
  type MigrationToRun,
} from '../../src/migration/runner.js';
import type { Pool } from '../../src/connection/pool.js';

const testMigrations: MigrationToRun[] = [
  {
    version: '001',
    description: 'Create users table',
    up: 'CREATE TABLE users (id SERIAL PRIMARY KEY, name TEXT NOT NULL)',
    down: 'DROP TABLE users',
  },
  {
    version: '002',
    description: 'Add email to users',
    up: 'ALTER TABLE users ADD COLUMN email TEXT',
    down: 'ALTER TABLE users DROP COLUMN email',
  },
  {
    version: '003',
    description: 'Add posts table',
    up: `CREATE TABLE posts (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id),
      title TEXT
    )`,
    down: 'DROP TABLE posts',
  },
];

describe('Migration Integration', { skip: !isDatabaseAvailable() }, () => {
  let pool: Pool;

  before(() => {
    const testPool = createTestPool();
    if (!testPool) {
      logSkipMessage();
      return;
    }
    pool = testPool;
  });

  after(async () => {
    if (pool) await pool.end();
  });

  it('should initialize migration table', async () => {
    const schemaName = await setupTestSchema(pool);
    const schemaPool = pool.withSchema(schemaName);

    try {
      const runner = createMigrationRunner(schemaPool, { schemaName });
      await runner.initialize();

      // Check that migration history table exists
      const result = await schemaPool.execute<{ exists: boolean }>(`
        SELECT EXISTS (
          SELECT 1 FROM information_schema.tables
          WHERE table_schema = $1 AND table_name = 'propane_migrations'
        ) as exists
      `, [schemaName]);

      assert.strictEqual(result[0]?.exists, true);
    } finally {
      await teardownTestSchema(pool, schemaName);
    }
  });

  it('should apply all migrations', async () => {
    const schemaName = await setupTestSchema(pool);
    const schemaPool = pool.withSchema(schemaName);

    try {
      const runner = createMigrationRunner(schemaPool, { schemaName });
      await runner.initialize();

      const result = await runner.up(testMigrations);

      assert.strictEqual(result.success, true);
      assert.strictEqual(result.applied.length, 3);
      assert.deepStrictEqual(result.applied, ['001', '002', '003']);

      // Verify tables exist
      const tables = await schemaPool.execute<{ table_name: string }>(`
        SELECT table_name FROM information_schema.tables
        WHERE table_schema = $1 AND table_type = 'BASE TABLE'
        ORDER BY table_name
      `, [schemaName]);

      const tableNames = new Set(tables.map(t => t.table_name));
      assert.ok(tableNames.has('users'));
      assert.ok(tableNames.has('posts'));
    } finally {
      await teardownTestSchema(pool, schemaName);
    }
  });

  it('should not reapply applied migrations', async () => {
    const schemaName = await setupTestSchema(pool);
    const schemaPool = pool.withSchema(schemaName);

    try {
      const runner = createMigrationRunner(schemaPool, { schemaName });
      await runner.initialize();

      // First run applies all
      await runner.up(testMigrations);

      // Second run applies none
      const result = await runner.up(testMigrations);
      assert.strictEqual(result.applied.length, 0);
      assert.strictEqual(result.success, true);
    } finally {
      await teardownTestSchema(pool, schemaName);
    }
  });

  it('should rollback last migration', async () => {
    const schemaName = await setupTestSchema(pool);
    const schemaPool = pool.withSchema(schemaName);

    try {
      const runner = createMigrationRunner(schemaPool, { schemaName });
      await runner.initialize();

      await runner.up(testMigrations);

      const result = await runner.down(testMigrations);
      assert.strictEqual(result.success, true);
      assert.deepStrictEqual(result.reverted, ['003']);

      // posts table should be gone
      const tables = await schemaPool.execute<{ table_name: string }>(`
        SELECT table_name FROM information_schema.tables
        WHERE table_schema = $1 AND table_name = 'posts'
      `, [schemaName]);

      assert.strictEqual(tables.length, 0);

      // users table should still exist
      const usersTable = await schemaPool.execute<{ table_name: string }>(`
        SELECT table_name FROM information_schema.tables
        WHERE table_schema = $1 AND table_name = 'users'
      `, [schemaName]);

      assert.strictEqual(usersTable.length, 1);
    } finally {
      await teardownTestSchema(pool, schemaName);
    }
  });

  it('should rollback multiple migrations', async () => {
    const schemaName = await setupTestSchema(pool);
    const schemaPool = pool.withSchema(schemaName);

    try {
      const runner = createMigrationRunner(schemaPool, { schemaName });
      await runner.initialize();

      await runner.up(testMigrations);

      // Rollback 2 migrations
      const result = await runner.downTo(testMigrations, 2);
      assert.strictEqual(result.success, true);
      assert.strictEqual(result.reverted.length, 2);
      assert.deepStrictEqual(result.reverted, ['003', '002']);

      // Only version 001 should be applied
      const applied = await runner.getAppliedMigrations();
      assert.deepStrictEqual(applied, ['001']);
    } finally {
      await teardownTestSchema(pool, schemaName);
    }
  });

  it('should reset all migrations', async () => {
    const schemaName = await setupTestSchema(pool);
    const schemaPool = pool.withSchema(schemaName);

    try {
      const runner = createMigrationRunner(schemaPool, { schemaName });
      await runner.initialize();

      await runner.up(testMigrations);

      const result = await runner.reset(testMigrations);
      assert.strictEqual(result.success, true);
      assert.strictEqual(result.reverted.length, 3);

      const applied = await runner.getAppliedMigrations();
      assert.strictEqual(applied.length, 0);
    } finally {
      await teardownTestSchema(pool, schemaName);
    }
  });

  it('should get pending migrations', async () => {
    const schemaName = await setupTestSchema(pool);
    const schemaPool = pool.withSchema(schemaName);

    try {
      const runner = createMigrationRunner(schemaPool, { schemaName });
      await runner.initialize();

      // Apply first two
      await runner.upTo(testMigrations, 2);

      const pending = await runner.getPendingMigrations(testMigrations);
      assert.strictEqual(pending.length, 1);
      assert.strictEqual(pending[0]?.version, '003');
    } finally {
      await teardownTestSchema(pool, schemaName);
    }
  });

  it('should track migration history', async () => {
    const schemaName = await setupTestSchema(pool);
    const schemaPool = pool.withSchema(schemaName);

    try {
      const runner = createMigrationRunner(schemaPool, { schemaName });
      await runner.initialize();

      await runner.up(testMigrations);

      const applied = await runner.getAppliedMigrations();
      assert.deepStrictEqual(applied, ['001', '002', '003']);
    } finally {
      await teardownTestSchema(pool, schemaName);
    }
  });

  it('should apply migrations incrementally with upTo', async () => {
    const schemaName = await setupTestSchema(pool);
    const schemaPool = pool.withSchema(schemaName);

    try {
      const runner = createMigrationRunner(schemaPool, { schemaName });
      await runner.initialize();

      // Apply first migration only
      const result1 = await runner.upTo(testMigrations, 1);
      assert.strictEqual(result1.applied.length, 1);
      assert.deepStrictEqual(result1.applied, ['001']);

      // Apply next migration
      const result2 = await runner.upTo(testMigrations, 1);
      assert.strictEqual(result2.applied.length, 1);
      assert.deepStrictEqual(result2.applied, ['002']);

      const applied = await runner.getAppliedMigrations();
      assert.deepStrictEqual(applied, ['001', '002']);
    } finally {
      await teardownTestSchema(pool, schemaName);
    }
  });

  it('should handle migration with no pending', async () => {
    const schemaName = await setupTestSchema(pool);
    const schemaPool = pool.withSchema(schemaName);

    try {
      const runner = createMigrationRunner(schemaPool, { schemaName });
      await runner.initialize();

      // Apply all
      await runner.up(testMigrations);

      // Try to apply again
      const result = await runner.upTo(testMigrations, 5);
      assert.strictEqual(result.applied.length, 0);
      assert.strictEqual(result.success, true);
    } finally {
      await teardownTestSchema(pool, schemaName);
    }
  });

  it('should handle down when no migrations applied', async () => {
    const schemaName = await setupTestSchema(pool);
    const schemaPool = pool.withSchema(schemaName);

    try {
      const runner = createMigrationRunner(schemaPool, { schemaName });
      await runner.initialize();

      const result = await runner.down(testMigrations);
      assert.strictEqual(result.reverted.length, 0);
      assert.strictEqual(result.success, true);
    } finally {
      await teardownTestSchema(pool, schemaName);
    }
  });

  it('should fail gracefully on invalid SQL', async () => {
    const schemaName = await setupTestSchema(pool);
    const schemaPool = pool.withSchema(schemaName);

    try {
      const runner = createMigrationRunner(schemaPool, { schemaName });
      await runner.initialize();

      const badMigrations: MigrationToRun[] = [
        {
          version: '001',
          description: 'Bad migration',
          up: 'CREATE TABLE INVALID SYNTAX',
          down: 'DROP TABLE IF EXISTS invalid',
        },
      ];

      const result = await runner.up(badMigrations);
      assert.strictEqual(result.success, false);
      assert.strictEqual(result.failed.length, 1);
      assert.strictEqual(result.failed[0]?.version, '001');
    } finally {
      await teardownTestSchema(pool, schemaName);
    }
  });

  it('should stop on first failure', async () => {
    const schemaName = await setupTestSchema(pool);
    const schemaPool = pool.withSchema(schemaName);

    try {
      const runner = createMigrationRunner(schemaPool, { schemaName });
      await runner.initialize();

      const migrationsWithBad: MigrationToRun[] = [
        {
          version: '001',
          description: 'Good migration',
          up: 'CREATE TABLE good_table (id SERIAL PRIMARY KEY)',
          down: 'DROP TABLE good_table',
        },
        {
          version: '002',
          description: 'Bad migration',
          up: 'INVALID SQL HERE',
          down: 'SELECT 1',
        },
        {
          version: '003',
          description: 'Never reached',
          up: 'CREATE TABLE never_created (id SERIAL)',
          down: 'DROP TABLE never_created',
        },
      ];

      const result = await runner.up(migrationsWithBad);
      assert.strictEqual(result.success, false);
      assert.deepStrictEqual(result.applied, ['001']);
      assert.strictEqual(result.failed.length, 1);
      assert.strictEqual(result.failed[0]?.version, '002');

      // Third migration should not have been attempted
      const applied = await runner.getAppliedMigrations();
      assert.deepStrictEqual(applied, ['001']);
    } finally {
      await teardownTestSchema(pool, schemaName);
    }
  });
});
