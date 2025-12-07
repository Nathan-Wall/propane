/**
 * Integration tests for PostgreSQL connection and pool.
 */

import { describe, it, before, after } from 'node:test';
import assert from 'node:assert';
import {
  createTestPool,
  isDatabaseAvailable,
  logSkipMessage,
  withTestSchema,
} from './test-utils.js';
import type { Pool } from '../../src/connection/pool.js';

describe('Connection Integration', { skip: !isDatabaseAvailable() }, () => {
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

  it('should execute basic queries', async () => {
    const result = await pool.execute<{ one: number }>('SELECT 1 as one');
    assert.strictEqual(result[0]?.one, 1);
  });

  it('should handle parameterized queries', async () => {
    const result = await pool.execute<{ sum: number }>(
      'SELECT $1::int + $2::int as sum',
      [2, 3]
    );
    assert.strictEqual(result[0]?.sum, 5);
  });

  it('should handle string parameters', async () => {
    const result = await pool.execute<{ greeting: string }>(
      'SELECT $1::text || $2::text as greeting',
      ['Hello, ', 'World!']
    );
    assert.strictEqual(result[0]?.greeting, 'Hello, World!');
  });

  it('should handle null parameters', async () => {
    const result = await pool.execute<{ val: string | null }>(
      'SELECT $1::text as val',
      [null]
    );
    assert.strictEqual(result[0]?.val, null);
  });

  it('should create isolated test schema', async () => {
    await withTestSchema(pool, async (schemaName, schemaPool) => {
      // Create a table in the test schema
      await schemaPool.execute(`
        CREATE TABLE test_users (
          id SERIAL PRIMARY KEY,
          name TEXT NOT NULL
        )
      `);

      // Insert and query
      await schemaPool.execute(
        'INSERT INTO test_users (name) VALUES ($1)',
        ['Test User']
      );

      const result = await schemaPool.execute<{ name: string }>(
        'SELECT name FROM test_users'
      );
      assert.strictEqual(result[0]?.name, 'Test User');

      // Verify schema exists
      const schemaExists = await pool.execute<{ exists: boolean }>(
        `SELECT EXISTS (
          SELECT 1 FROM information_schema.schemata
          WHERE schema_name = $1
        ) as exists`,
        [schemaName]
      );
      assert.strictEqual(schemaExists[0]?.exists, true);
    });
    // Schema should be cleaned up after withTestSchema
  });

  it('should handle connection errors gracefully', async () => {
    await assert.rejects(
      pool.execute('SELECT * FROM nonexistent_table_xyz_123'),
      /relation.*does not exist/i
    );
  });

  it('should handle syntax errors', async () => {
    await assert.rejects(
      pool.execute('SELCT * FROM'),
      /syntax error/i
    );
  });

  it('should execute concurrent queries', async () => {
    const queries = Array.from({ length: 10 }, (_, i) =>
      pool.execute<{ n: number }>('SELECT $1::int as n', [i])
    );

    const results = await Promise.all(queries);

    for (let i = 0; i < 10; i++) {
      assert.strictEqual(results[i]![0]?.n, i);
    }
  });

  it('should handle large result sets', async () => {
    const result = await pool.execute<{ n: number }>(
      'SELECT generate_series(1, 1000) as n'
    );
    assert.strictEqual(result.length, 1000);
    assert.strictEqual(result[0]?.n, 1);
    assert.strictEqual(result[999]?.n, 1000);
  });

  it('should handle boolean values', async () => {
    const result = await pool.execute<{ t: boolean; f: boolean }>(
      'SELECT true as t, false as f'
    );
    assert.strictEqual(result[0]?.t, true);
    assert.strictEqual(result[0]?.f, false);
  });

  it('should handle date values', async () => {
    const result = await pool.execute<{ d: Date }>(
      "SELECT '2024-01-15'::date as d"
    );
    assert.ok(result[0]?.d instanceof Date);
  });

  it('should handle JSON values', async () => {
    const result = await pool.execute<{ data: { key: string } }>(
      `SELECT '{"key": "value"}'::jsonb as data`
    );
    assert.deepStrictEqual(result[0]?.data, { key: 'value' });
  });

  it('should report row count for INSERT', async () => {
    await withTestSchema(pool, async (_schemaName, schemaPool) => {
      await schemaPool.execute(`
        CREATE TABLE count_test (id SERIAL PRIMARY KEY, val TEXT)
      `);

      const result = await schemaPool.execute(
        `INSERT INTO count_test (val) VALUES ('a'), ('b'), ('c')`
      );
      assert.strictEqual(result.count, 3);
    });
  });

  it('should report row count for UPDATE', async () => {
    await withTestSchema(pool, async (_schemaName, schemaPool) => {
      await schemaPool.execute(`
        CREATE TABLE update_test (id SERIAL PRIMARY KEY, val TEXT)
      `);
      await schemaPool.execute(
        `INSERT INTO update_test (val) VALUES ('a'), ('b'), ('c')`
      );

      const result = await schemaPool.execute(
        `UPDATE update_test SET val = 'updated' WHERE val IN ('a', 'b')`
      );
      assert.strictEqual(result.count, 2);
    });
  });

  it('should report row count for DELETE', async () => {
    await withTestSchema(pool, async (_schemaName, schemaPool) => {
      await schemaPool.execute(`
        CREATE TABLE delete_test (id SERIAL PRIMARY KEY, val TEXT)
      `);
      await schemaPool.execute(
        `INSERT INTO delete_test (val) VALUES ('a'), ('b'), ('c')`
      );

      const result = await schemaPool.execute(
        `DELETE FROM delete_test WHERE val = 'a'`
      );
      assert.strictEqual(result.count, 1);
    });
  });
});
