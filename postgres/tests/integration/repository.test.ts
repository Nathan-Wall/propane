/**
 * Integration tests for BaseRepository.
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
import { createRepository } from '../../src/repository/base-repository.js';
import type { Pool } from '../../src/connection/pool.js';
import type { BaseRepository } from '../../src/repository/base-repository.js';

interface UserRecord {
  id: number;
  email: string;
  name: string;
  active: boolean;
}

type User = UserRecord & Record<string, unknown>;

describe('Repository Integration', { skip: !isDatabaseAvailable() }, () => {
  let pool: Pool;
  let schemaPool: Pool;
  let schemaName: string;
  let userRepo: BaseRepository<User>;

  before(async () => {
    const testPool = createTestPool();
    if (!testPool) {
      logSkipMessage();
      return;
    }
    pool = testPool;

    schemaName = await setupTestSchema(pool);
    schemaPool = pool.withSchema(schemaName);

    // Create test table
    await schemaPool.execute(`
      CREATE TABLE users (
        id SERIAL PRIMARY KEY,
        email TEXT NOT NULL UNIQUE,
        name TEXT NOT NULL,
        active BOOLEAN NOT NULL DEFAULT true
      )
    `);

    userRepo = createRepository<User>(schemaPool, {
      tableName: 'users',
      schemaName,
      primaryKey: 'id',
      columns: ['id', 'email', 'name', 'active'],
      columnTypes: {
        id: 'INTEGER',
        email: 'TEXT',
        name: 'TEXT',
        active: 'BOOLEAN',
      },
    });
  });

  after(async () => {
    if (pool) {
      await teardownTestSchema(pool, schemaName);
      await pool.end();
    }
  });

  beforeEach(async () => {
    if (!pool) return;
    // Clear users table before each test
    await schemaPool.execute('DELETE FROM users');
  });

  it('should create and find by id', async () => {
    const created = await userRepo.create({
      email: 'test@example.com',
      name: 'Test User',
      active: true,
    });

    assert.ok(created.id);
    assert.strictEqual(created.email, 'test@example.com');
    assert.strictEqual(created.name, 'Test User');
    assert.strictEqual(created.active, true);

    const found = await userRepo.findById(created.id);
    assert.ok(found);
    assert.strictEqual(found['email'], 'test@example.com');
  });

  it('should return null for non-existent id', async () => {
    const found = await userRepo.findById(999_999);
    assert.strictEqual(found, null);
  });

  it('should find by multiple ids', async () => {
    const users = await userRepo.createMany([
      { email: 'a@example.com', name: 'Alice', active: true },
      { email: 'b@example.com', name: 'Bob', active: true },
      { email: 'c@example.com', name: 'Charlie', active: true },
    ]);

    const ids = [users[0]!.id, users[2]!.id];
    const found = await userRepo.findByIds(ids);

    assert.strictEqual(found.length, 2);
    const names = found.map(u => u['name']).toSorted();
    assert.deepStrictEqual(names, ['Alice', 'Charlie']);
  });

  it('should update a record', async () => {
    const created = await userRepo.create({
      email: 'update@example.com',
      name: 'Original Name',
      active: true,
    });

    const updated = await userRepo.update(created.id, {
      name: 'Updated Name',
    });

    assert.ok(updated);
    assert.strictEqual(updated.name, 'Updated Name');
    assert.strictEqual(updated.email, 'update@example.com');
  });

  it('should return null when updating non-existent record', async () => {
    const updated = await userRepo.update(999_999, { name: 'New Name' });
    assert.strictEqual(updated, null);
  });

  it('should delete a record', async () => {
    const created = await userRepo.create({
      email: 'delete@example.com',
      name: 'To Delete',
      active: true,
    });

    const deleted = await userRepo.delete(created.id);
    assert.strictEqual(deleted, true);

    const found = await userRepo.findById(created.id);
    assert.strictEqual(found, null);
  });

  it('should return false when deleting non-existent record', async () => {
    const deleted = await userRepo.delete(999_999);
    assert.strictEqual(deleted, false);
  });

  it('should find many with conditions', async () => {
    await userRepo.createMany([
      { email: 'a@example.com', name: 'Alice', active: true },
      { email: 'b@example.com', name: 'Bob', active: false },
      { email: 'c@example.com', name: 'Charlie', active: true },
    ]);

    const activeUsers = await userRepo.findMany({ active: true });
    assert.strictEqual(activeUsers.length, 2);

    const inactiveUsers = await userRepo.findMany({ active: false });
    assert.strictEqual(inactiveUsers.length, 1);
    assert.strictEqual(inactiveUsers[0]?.['name'], 'Bob');
  });

  it('should find one with conditions', async () => {
    await userRepo.createMany([
      { email: 'a@example.com', name: 'Alice', active: true },
      { email: 'b@example.com', name: 'Bob', active: false },
    ]);

    const user = await userRepo.findOne({ email: 'b@example.com' });
    assert.ok(user);
    assert.strictEqual(user['name'], 'Bob');
  });

  it('should return null when findOne has no match', async () => {
    const user = await userRepo.findOne({ email: 'nonexistent@example.com' });
    assert.strictEqual(user, null);
  });

  it('should find all records', async () => {
    await userRepo.createMany([
      { email: 'a@example.com', name: 'Alice', active: true },
      { email: 'b@example.com', name: 'Bob', active: false },
    ]);

    const all = await userRepo.findAll();
    assert.strictEqual(all.length, 2);
  });

  it('should count records', async () => {
    await userRepo.createMany([
      { email: 'a@example.com', name: 'Alice', active: true },
      { email: 'b@example.com', name: 'Bob', active: false },
    ]);

    const total = await userRepo.count();
    assert.strictEqual(total, 2);

    const activeCount = await userRepo.count({ active: true });
    assert.strictEqual(activeCount, 1);
  });

  it('should check existence', async () => {
    await userRepo.create({
      email: 'exists@example.com',
      name: 'Exists',
      active: true,
    });

    const exists = await userRepo.exists({ email: 'exists@example.com' });
    assert.strictEqual(exists, true);

    const notExists = await userRepo.exists({ email: 'not@example.com' });
    assert.strictEqual(notExists, false);
  });

  it('should update many records', async () => {
    await userRepo.createMany([
      { email: 'a@example.com', name: 'Alice', active: true },
      { email: 'b@example.com', name: 'Bob', active: true },
      { email: 'c@example.com', name: 'Charlie', active: false },
    ]);

    const count = await userRepo.updateMany(
      { active: true },
      { active: false }
    );
    assert.strictEqual(count, 2);

    const activeCount = await userRepo.count({ active: true });
    assert.strictEqual(activeCount, 0);
  });

  it('should delete many records', async () => {
    await userRepo.createMany([
      { email: 'a@example.com', name: 'Alice', active: true },
      { email: 'b@example.com', name: 'Bob', active: false },
      { email: 'c@example.com', name: 'Charlie', active: false },
    ]);

    const count = await userRepo.deleteMany({ active: false });
    assert.strictEqual(count, 2);

    const remaining = await userRepo.count();
    assert.strictEqual(remaining, 1);
  });

  it('should upsert - insert new record', async () => {
    const created = await userRepo.upsert(
      { email: 'upsert@example.com', name: 'Original', active: true },
      ['email']
    );
    assert.strictEqual(created.name, 'Original');

    const count = await userRepo.count();
    assert.strictEqual(count, 1);
  });

  it('should upsert - update existing record', async () => {
    await userRepo.create({
      email: 'upsert@example.com',
      name: 'Original',
      active: true,
    });

    const updated = await userRepo.upsert(
      { email: 'upsert@example.com', name: 'Updated', active: false },
      ['email']
    );
    assert.strictEqual(updated.name, 'Updated');
    assert.strictEqual(updated.active, false);

    // Should only have one record
    const count = await userRepo.count();
    assert.strictEqual(count, 1);
  });

  it('should paginate results with limit', async () => {
    await userRepo.createMany([
      { email: 'a@example.com', name: 'Alice', active: true },
      { email: 'b@example.com', name: 'Bob', active: true },
      { email: 'c@example.com', name: 'Charlie', active: true },
      { email: 'd@example.com', name: 'David', active: true },
    ]);

    const page = await userRepo.findMany(
      { active: true },
      { limit: 2 }
    );
    assert.strictEqual(page.length, 2);
  });

  it('should paginate results with offset', async () => {
    await userRepo.createMany([
      { email: 'a@example.com', name: 'Alice', active: true },
      { email: 'b@example.com', name: 'Bob', active: true },
      { email: 'c@example.com', name: 'Charlie', active: true },
      { email: 'd@example.com', name: 'David', active: true },
    ]);

    const page1 = await userRepo.findMany(
      { active: true },
      { orderBy: { email: 'asc' }, limit: 2, offset: 0 }
    );
    assert.strictEqual(page1.length, 2);
    assert.strictEqual(page1[0]?.['name'], 'Alice');
    assert.strictEqual(page1[1]?.['name'], 'Bob');

    const page2 = await userRepo.findMany(
      { active: true },
      { orderBy: { email: 'asc' }, limit: 2, offset: 2 }
    );
    assert.strictEqual(page2.length, 2);
    assert.strictEqual(page2[0]?.['name'], 'Charlie');
    assert.strictEqual(page2[1]?.['name'], 'David');
  });

  it('should order results ascending', async () => {
    await userRepo.createMany([
      { email: 'c@example.com', name: 'Charlie', active: true },
      { email: 'a@example.com', name: 'Alice', active: true },
      { email: 'b@example.com', name: 'Bob', active: true },
    ]);

    const ordered = await userRepo.findAll({ orderBy: { name: 'asc' } });
    assert.strictEqual(ordered[0]?.['name'], 'Alice');
    assert.strictEqual(ordered[1]?.['name'], 'Bob');
    assert.strictEqual(ordered[2]?.['name'], 'Charlie');
  });

  it('should order results descending', async () => {
    await userRepo.createMany([
      { email: 'a@example.com', name: 'Alice', active: true },
      { email: 'b@example.com', name: 'Bob', active: true },
      { email: 'c@example.com', name: 'Charlie', active: true },
    ]);

    const ordered = await userRepo.findAll({ orderBy: { name: 'desc' } });
    assert.strictEqual(ordered[0]?.['name'], 'Charlie');
    assert.strictEqual(ordered[1]?.['name'], 'Bob');
    assert.strictEqual(ordered[2]?.['name'], 'Alice');
  });

  it('should select specific columns', async () => {
    const created = await userRepo.create({
      email: 'select@example.com',
      name: 'Select Test',
      active: true,
    });

    const found = await userRepo.findById(created.id, ['name', 'email']);
    assert.ok(found);
    assert.strictEqual(found['name'], 'Select Test');
    assert.strictEqual(found['email'], 'select@example.com');
  });

  it('should handle empty createMany', async () => {
    const created = await userRepo.createMany([]);
    assert.strictEqual(created.length, 0);
  });

  it('should handle empty findByIds', async () => {
    const found = await userRepo.findByIds([]);
    assert.strictEqual(found.length, 0);
  });
});
