/**
 * Tests for the where clause builder.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert';
import { buildWhere, buildOrderBy, type OrderBy } from '../src/repository/where-builder.js';

describe('buildWhere', () => {
  it('should build simple equality condition', () => {
    const { sql, params } = buildWhere({ name: 'Alice' });
    assert.strictEqual(sql, 'name = $1');
    assert.deepStrictEqual(params, ['Alice']);
  });

  it('should build multiple conditions with AND', () => {
    const { sql, params } = buildWhere({ name: 'Alice', age: 30 });
    assert.ok(sql.includes('name = $1'));
    assert.ok(sql.includes('age = $2'));
    assert.ok(sql.includes(' AND '));
    assert.deepStrictEqual(params, ['Alice', 30]);
  });

  it('should handle null values', () => {
    const { sql, params } = buildWhere({ name: null });
    assert.strictEqual(sql, 'name IS NULL');
    assert.deepStrictEqual(params, []);
  });

  it('should handle eq operator', () => {
    const { sql, params } = buildWhere({ name: { eq: 'Alice' } });
    assert.strictEqual(sql, 'name = $1');
    assert.deepStrictEqual(params, ['Alice']);
  });

  it('should handle neq operator', () => {
    const { sql, params } = buildWhere({ name: { neq: 'Bob' } });
    assert.strictEqual(sql, 'name != $1');
    assert.deepStrictEqual(params, ['Bob']);
  });

  it('should handle gt operator', () => {
    const { sql, params } = buildWhere({ age: { gt: 18 } });
    assert.strictEqual(sql, 'age > $1');
    assert.deepStrictEqual(params, [18]);
  });

  it('should handle gte operator', () => {
    const { sql, params } = buildWhere({ age: { gte: 21 } });
    assert.strictEqual(sql, 'age >= $1');
    assert.deepStrictEqual(params, [21]);
  });

  it('should handle lt operator', () => {
    const { sql, params } = buildWhere({ age: { lt: 65 } });
    assert.strictEqual(sql, 'age < $1');
    assert.deepStrictEqual(params, [65]);
  });

  it('should handle lte operator', () => {
    const { sql, params } = buildWhere({ score: { lte: 100 } });
    assert.strictEqual(sql, 'score <= $1');
    assert.deepStrictEqual(params, [100]);
  });

  it('should handle in operator', () => {
    const { sql, params } = buildWhere({ status: { in: ['active', 'pending'] } });
    assert.strictEqual(sql, 'status IN ($1, $2)');
    assert.deepStrictEqual(params, ['active', 'pending']);
  });

  it('should handle empty in operator', () => {
    const { sql, params } = buildWhere({ status: { in: [] } });
    assert.strictEqual(sql, 'FALSE');
    assert.deepStrictEqual(params, []);
  });

  it('should handle notIn operator', () => {
    const { sql, params } = buildWhere({ status: { notIn: ['deleted', 'banned'] } });
    assert.strictEqual(sql, 'status NOT IN ($1, $2)');
    assert.deepStrictEqual(params, ['deleted', 'banned']);
  });

  it('should handle empty notIn operator', () => {
    const { sql, params } = buildWhere({ status: { notIn: [] } });
    assert.strictEqual(sql, 'TRUE');
    assert.deepStrictEqual(params, []);
  });

  it('should handle like operator', () => {
    const { sql, params } = buildWhere({ name: { like: 'A%' } });
    assert.strictEqual(sql, 'name LIKE $1');
    assert.deepStrictEqual(params, ['A%']);
  });

  it('should handle ilike operator', () => {
    const { sql, params } = buildWhere({ name: { ilike: '%alice%' } });
    assert.strictEqual(sql, 'name ILIKE $1');
    assert.deepStrictEqual(params, ['%alice%']);
  });

  it('should handle contains operator', () => {
    const { sql, params } = buildWhere({ name: { contains: 'ali' } });
    assert.strictEqual(sql, 'name ILIKE $1');
    assert.deepStrictEqual(params, ['%ali%']);
  });

  it('should handle startsWith operator', () => {
    const { sql, params } = buildWhere({ name: { startsWith: 'Ali' } });
    assert.strictEqual(sql, 'name ILIKE $1');
    assert.deepStrictEqual(params, ['Ali%']);
  });

  it('should handle endsWith operator', () => {
    const { sql, params } = buildWhere({ email: { endsWith: '@example.com' } });
    assert.strictEqual(sql, 'email ILIKE $1');
    assert.deepStrictEqual(params, ['%@example.com']);
  });

  it('should handle isNull operator', () => {
    const { sql, params } = buildWhere({ deletedAt: { isNull: true } });
    assert.strictEqual(sql, 'deleted_at IS NULL');
    assert.deepStrictEqual(params, []);
  });

  it('should handle isNull false', () => {
    const { sql, params } = buildWhere({ deletedAt: { isNull: false } });
    assert.strictEqual(sql, 'deleted_at IS NOT NULL');
    assert.deepStrictEqual(params, []);
  });

  it('should handle between operator', () => {
    const { sql, params } = buildWhere({ age: { between: [18, 65] } });
    assert.strictEqual(sql, 'age BETWEEN $1 AND $2');
    assert.deepStrictEqual(params, [18, 65]);
  });

  it('should handle AND logical operator', () => {
    const { sql, params } = buildWhere({
      AND: [{ age: { gte: 18 } }, { age: { lte: 65 } }],
    });
    assert.ok(sql.includes('age >= $1'));
    assert.ok(sql.includes('age <= $2'));
    assert.ok(sql.includes(' AND '));
    assert.deepStrictEqual(params, [18, 65]);
  });

  it('should handle OR logical operator', () => {
    const { sql, params } = buildWhere({
      OR: [{ status: 'active' }, { status: 'pending' }],
    });
    assert.ok(sql.includes('status = $1'));
    assert.ok(sql.includes('status = $2'));
    assert.ok(sql.includes(' OR '));
    assert.deepStrictEqual(params, ['active', 'pending']);
  });

  it('should handle NOT logical operator', () => {
    const { sql, params } = buildWhere({
      NOT: { status: 'deleted' },
    });
    assert.strictEqual(sql, 'NOT (status = $1)');
    assert.deepStrictEqual(params, ['deleted']);
  });

  it('should convert camelCase to snake_case', () => {
    const { sql, params } = buildWhere({ createdAt: new Date('2024-01-01') });
    assert.ok(sql.includes('created_at'));
    assert.strictEqual(params.length, 1);
  });

  it('should return TRUE for empty condition', () => {
    const { sql, params } = buildWhere({});
    assert.strictEqual(sql, 'TRUE');
    assert.deepStrictEqual(params, []);
  });

  it('should escape special LIKE characters in contains', () => {
    const { sql, params } = buildWhere({ name: { contains: '100%' } });
    assert.strictEqual(sql, 'name ILIKE $1');
    assert.strictEqual(params[0], String.raw`%100\%%`);
  });

  it('should support starting param index', () => {
    const { sql, params } = buildWhere({ name: 'Alice' }, 5);
    assert.strictEqual(sql, 'name = $5');
    assert.deepStrictEqual(params, ['Alice']);
  });
});

describe('buildOrderBy', () => {
  it('should build simple order by', () => {
    const orderBy: OrderBy<{ name: string }> = { name: 'asc' };
    const sql = buildOrderBy(orderBy);
    assert.strictEqual(sql, 'name ASC');
  });

  it('should build descending order', () => {
    const orderBy: OrderBy<{ createdAt: Date }> = { createdAt: 'desc' };
    const sql = buildOrderBy(orderBy);
    assert.strictEqual(sql, 'created_at DESC');
  });

  it('should build multiple order by', () => {
    const orderBy: OrderBy<{ name: string; age: number }> = { name: 'asc', age: 'desc' };
    const sql = buildOrderBy(orderBy);
    assert.ok(sql.includes('name ASC'));
    assert.ok(sql.includes('age DESC'));
  });

  it('should handle array syntax', () => {
    type User = { name: string; age: number };
    const orderBy = [
      { field: 'name' as keyof User, direction: 'asc' as const },
      { field: 'age' as keyof User, direction: 'desc' as const },
    ];
    const sql = buildOrderBy<User>(orderBy);
    assert.strictEqual(sql, 'name ASC, age DESC');
  });

  it('should convert camelCase to snake_case', () => {
    const orderBy: OrderBy<{ createdAt: Date }> = { createdAt: 'desc' };
    const sql = buildOrderBy(orderBy);
    assert.strictEqual(sql, 'created_at DESC');
  });
});
