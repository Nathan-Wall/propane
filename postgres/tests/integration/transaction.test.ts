/**
 * Integration tests for transactions.
 */

import { describe, it, before, after, beforeEach } from 'node:test';
import assert from 'node:assert';
import {
  createTestPool,
  isDatabaseAvailable,
  logSkipMessage,
  setupTestSchema,
  teardownTestSchema,
} from './test-utils.js';
import { withTransaction } from '../../src/connection/transaction.js';
import type { Pool } from '../../src/connection/pool.js';

describe('Transaction Integration', { skip: !isDatabaseAvailable() }, () => {
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

    await schemaPool.execute(`
      CREATE TABLE accounts (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        balance INTEGER NOT NULL DEFAULT 0
      )
    `);
  });

  after(async () => {
    if (pool) {
      await teardownTestSchema(pool, schemaName);
      await pool.end();
    }
  });

  beforeEach(async () => {
    if (!pool) return;
    await schemaPool.execute('DELETE FROM accounts');
  });

  it('should commit transaction on success', async () => {
    await withTransaction(schemaPool, async tx => {
      await tx.execute(
        'INSERT INTO accounts (name, balance) VALUES ($1, $2)',
        ['Alice', 100]
      );
    });

    const result = await schemaPool.execute<{ name: string }>(
      'SELECT name FROM accounts'
    );
    assert.strictEqual(result.length, 1);
    assert.strictEqual(result[0]?.name, 'Alice');
  });

  it('should rollback transaction on error', async () => {
    await assert.rejects(async () => {
      await withTransaction(schemaPool, async tx => {
        await tx.execute(
          'INSERT INTO accounts (name, balance) VALUES ($1, $2)',
          ['Bob', 100]
        );
        throw new Error('Intentional failure');
      });
    }, /Intentional failure/);

    // Record should not exist
    const result = await schemaPool.execute<{ count: string }>(
      'SELECT COUNT(*) as count FROM accounts'
    );
    assert.strictEqual(result[0]?.count, '0');
  });

  it('should support multiple operations in transaction', async () => {
    await withTransaction(schemaPool, async tx => {
      await tx.execute(
        'INSERT INTO accounts (name, balance) VALUES ($1, $2)',
        ['Alice', 100]
      );
      await tx.execute(
        'INSERT INTO accounts (name, balance) VALUES ($1, $2)',
        ['Bob', 200]
      );
      await tx.execute(
        'UPDATE accounts SET balance = balance + 50 WHERE name = $1',
        ['Alice']
      );
    });

    const result = await schemaPool.execute<{ name: string; balance: number }>(
      'SELECT name, balance FROM accounts ORDER BY name'
    );
    assert.strictEqual(result.length, 2);
    assert.strictEqual(result[0]?.name, 'Alice');
    assert.strictEqual(result[0]?.balance, 150);
    assert.strictEqual(result[1]?.name, 'Bob');
    assert.strictEqual(result[1]?.balance, 200);
  });

  it('should support savepoints', async () => {
    await withTransaction(schemaPool, async tx => {
      await tx.execute(
        'INSERT INTO accounts (name, balance) VALUES ($1, $2)',
        ['Alice', 100]
      );

      const sp = await tx.savepoint();

      await tx.execute(
        'INSERT INTO accounts (name, balance) VALUES ($1, $2)',
        ['Bob', 200]
      );

      // Rollback to savepoint (removes Bob)
      await sp.rollback();

      await tx.execute(
        'INSERT INTO accounts (name, balance) VALUES ($1, $2)',
        ['Charlie', 300]
      );
    });

    const result = await schemaPool.execute<{ name: string }>(
      'SELECT name FROM accounts ORDER BY name'
    );
    assert.strictEqual(result.length, 2);
    assert.strictEqual(result[0]?.name, 'Alice');
    assert.strictEqual(result[1]?.name, 'Charlie');
    // Bob should not exist
  });

  it('should support nested savepoints', async () => {
    await withTransaction(schemaPool, async tx => {
      await tx.execute(
        'INSERT INTO accounts (name, balance) VALUES ($1, $2)',
        ['A', 1]
      );

      const sp1 = await tx.savepoint();
      await tx.execute(
        'INSERT INTO accounts (name, balance) VALUES ($1, $2)',
        ['B', 2]
      );

      const sp2 = await tx.savepoint();
      await tx.execute(
        'INSERT INTO accounts (name, balance) VALUES ($1, $2)',
        ['C', 3]
      );

      // Rollback to sp2 (removes C)
      await sp2.rollback();

      await tx.execute(
        'INSERT INTO accounts (name, balance) VALUES ($1, $2)',
        ['D', 4]
      );

      // sp1 is still valid, rolling back removes B and D
      await sp1.rollback();

      await tx.execute(
        'INSERT INTO accounts (name, balance) VALUES ($1, $2)',
        ['E', 5]
      );
    });

    const result = await schemaPool.execute<{ name: string }>(
      'SELECT name FROM accounts ORDER BY name'
    );
    assert.strictEqual(result.length, 2);
    assert.strictEqual(result[0]?.name, 'A');
    assert.strictEqual(result[1]?.name, 'E');
  });

  it('should transfer funds atomically', async () => {
    // Setup accounts
    await schemaPool.execute(
      'INSERT INTO accounts (name, balance) VALUES ($1, $2), ($3, $4)',
      ['Alice', 100, 'Bob', 50]
    );

    // Transfer 30 from Alice to Bob
    await withTransaction(schemaPool, async tx => {
      await tx.execute(
        'UPDATE accounts SET balance = balance - $1 WHERE name = $2',
        [30, 'Alice']
      );
      await tx.execute(
        'UPDATE accounts SET balance = balance + $1 WHERE name = $2',
        [30, 'Bob']
      );
    });

    const result = await schemaPool.execute<{ name: string; balance: number }>(
      'SELECT name, balance FROM accounts ORDER BY name'
    );
    assert.strictEqual(result[0]?.name, 'Alice');
    assert.strictEqual(result[0]?.balance, 70);
    assert.strictEqual(result[1]?.name, 'Bob');
    assert.strictEqual(result[1]?.balance, 80);
  });

  it('should rollback failed transfer', async () => {
    // Setup accounts
    await schemaPool.execute(
      'INSERT INTO accounts (name, balance) VALUES ($1, $2), ($3, $4)',
      ['Alice', 100, 'Bob', 50]
    );

    // Attempt transfer that fails midway
    await assert.rejects(async () => {
      await withTransaction(schemaPool, async tx => {
        await tx.execute(
          'UPDATE accounts SET balance = balance - $1 WHERE name = $2',
          [30, 'Alice']
        );
        // Simulate failure before completing transfer
        throw new Error('Transfer failed');
      });
    });

    // Balances should be unchanged
    const result = await schemaPool.execute<{ name: string; balance: number }>(
      'SELECT name, balance FROM accounts ORDER BY name'
    );
    assert.strictEqual(result[0]?.balance, 100); // Alice unchanged
    assert.strictEqual(result[1]?.balance, 50);  // Bob unchanged
  });

  it('should return value from transaction', async () => {
    const result = await withTransaction(schemaPool, async tx => {
      await tx.execute(
        'INSERT INTO accounts (name, balance) VALUES ($1, $2)',
        ['Alice', 100]
      );
      const rows = await tx.execute<{ id: number }>(
        'SELECT id FROM accounts WHERE name = $1',
        ['Alice']
      );
      return rows[0]?.id;
    });

    assert.ok(result);
    assert.strictEqual(typeof result, 'number');
  });

  it('should support read-only transaction', async () => {
    // Setup data first
    await schemaPool.execute(
      'INSERT INTO accounts (name, balance) VALUES ($1, $2)',
      ['Alice', 100]
    );

    // Read-only transaction should work for reads
    const result = await withTransaction(
      schemaPool,
      async tx => {
        const rows = await tx.execute<{ balance: number }>(
          'SELECT balance FROM accounts WHERE name = $1',
          ['Alice']
        );
        return rows[0]?.balance;
      },
      { readOnly: true }
    );

    assert.strictEqual(result, 100);
  });

  it('should query within transaction', async () => {
    await withTransaction(schemaPool, async tx => {
      await tx.execute(
        'INSERT INTO accounts (name, balance) VALUES ($1, $2)',
        ['Test', 42]
      );

      // Query using tagged template
      const result = await tx.query<{ balance: number }>`
        SELECT balance FROM accounts WHERE name = 'Test'
      `;
      assert.strictEqual(result[0]?.balance, 42);
    });
  });
});
