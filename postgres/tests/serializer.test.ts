/**
 * Tests for value serialization and deserialization.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  serializeValue,
  deserializeValue,
  escapeSqlValue,
  escapeIdentifier,
} from '../src/mapping/serializer.js';

describe('serializeValue', () => {
  it('should return null for null values', () => {
    assert.strictEqual(serializeValue(null, 'TEXT'), null);
    assert.strictEqual(serializeValue(undefined, 'TEXT'), null);
  });

  it('should serialize Date to ISO string for TIMESTAMPTZ', () => {
    const date = new Date('2024-01-15T10:30:00.000Z');
    assert.strictEqual(serializeValue(date, 'TIMESTAMPTZ'), '2024-01-15T10:30:00.000Z');
    assert.strictEqual(serializeValue(date, 'TIMESTAMP'), '2024-01-15T10:30:00.000Z');
  });

  it('should serialize ImmutableDate-like objects', () => {
    const immutableDate = {
      toDate: () => new Date('2024-01-15T10:30:00.000Z'),
    };
    assert.strictEqual(serializeValue(immutableDate, 'TIMESTAMPTZ'), '2024-01-15T10:30:00.000Z');
  });

  it('should serialize URL to string for TEXT', () => {
    const url = new URL('https://example.com/path');
    assert.strictEqual(serializeValue(url, 'TEXT'), 'https://example.com/path');
  });

  it('should serialize ArrayBuffer to Buffer for BYTEA', () => {
    const buffer = new ArrayBuffer(4);
    const view = new Uint8Array(buffer);
    view[0] = 1;
    view[1] = 2;
    view[2] = 3;
    view[3] = 4;
    const result = serializeValue(buffer, 'BYTEA');
    assert.ok(Buffer.isBuffer(result));
  });

  it('should serialize bigint to string for BIGINT', () => {
    assert.strictEqual(serializeValue(BigInt(12_345_678_901_234_567_890n), 'BIGINT'), '12345678901234567890');
  });

  it('should serialize number to string for NUMERIC', () => {
    assert.strictEqual(serializeValue(123.45, 'NUMERIC(10,2)'), '123.45');
  });

  it('should pass through primitives unchanged', () => {
    assert.strictEqual(serializeValue('hello', 'TEXT'), 'hello');
    assert.strictEqual(serializeValue(42, 'INTEGER'), 42);
    assert.strictEqual(serializeValue(true, 'BOOLEAN'), true);
  });

  it('should serialize objects with toJSON for JSONB', () => {
    const obj = {
      toJSON: () => ({ id: 1, name: 'Test' }),
    };
    assert.deepStrictEqual(serializeValue(obj, 'JSONB'), { id: 1, name: 'Test' });
  });

  it('should serialize Map to object for JSONB', () => {
    const map = new Map([['key1', 'value1'], ['key2', 'value2']]);
    const result = serializeValue(map, 'JSONB');
    assert.deepStrictEqual(result, { key1: 'value1', key2: 'value2' });
  });

  it('should serialize Set to array for JSONB', () => {
    const set = new Set([1, 2, 3]);
    const result = serializeValue(set, 'JSONB');
    assert.deepStrictEqual(result, [1, 2, 3]);
  });
});

describe('deserializeValue', () => {
  it('should return null for null values', () => {
    assert.strictEqual(deserializeValue(null, 'TEXT'), null);
    assert.strictEqual(deserializeValue(undefined, 'TEXT'), null);
  });

  it('should deserialize string to Date for TIMESTAMPTZ', () => {
    const result = deserializeValue('2024-01-15T10:30:00.000Z', 'TIMESTAMPTZ');
    assert.ok(result instanceof Date);
    assert.strictEqual(result.toISOString(), '2024-01-15T10:30:00.000Z');
  });

  it('should pass through Date for TIMESTAMPTZ', () => {
    const date = new Date('2024-01-15T10:30:00.000Z');
    const result = deserializeValue(date, 'TIMESTAMPTZ');
    assert.strictEqual(result, date);
  });

  it('should deserialize string to URL when targetType is URL', () => {
    const result = deserializeValue('https://example.com/path', 'TEXT', 'URL');
    assert.ok(result instanceof URL);
    assert.strictEqual(result.href, 'https://example.com/path');
  });

  it('should deserialize Buffer to ArrayBuffer for BYTEA', () => {
    const buffer = Buffer.from([1, 2, 3, 4]);
    const result = deserializeValue(buffer, 'BYTEA');
    assert.ok(result instanceof ArrayBuffer);
    const view = new Uint8Array(result);
    assert.deepStrictEqual([...view], [1, 2, 3, 4]);
  });

  it('should deserialize string to bigint for BIGINT', () => {
    const result = deserializeValue('12345678901234567890', 'BIGINT');
    assert.strictEqual(result, 12_345_678_901_234_567_890n);
  });

  it('should deserialize number to bigint for BIGINT', () => {
    const result = deserializeValue(12_345, 'BIGINT');
    assert.strictEqual(result, 12_345n);
  });

  it('should keep NUMERIC as string', () => {
    const result = deserializeValue(123.45, 'NUMERIC(10,2)');
    assert.strictEqual(result, '123.45');
  });

  it('should pass through JSONB values unchanged', () => {
    const obj = { id: 1, name: 'Test' };
    const result = deserializeValue(obj, 'JSONB');
    assert.strictEqual(result, obj);
  });
});

describe('escapeSqlValue', () => {
  it('should return NULL for null/undefined', () => {
    assert.strictEqual(escapeSqlValue(null), 'NULL');
    assert.strictEqual(escapeSqlValue(undefined), 'NULL');
  });

  it('should escape strings with quotes', () => {
    assert.strictEqual(escapeSqlValue('hello'), "'hello'");
    assert.strictEqual(escapeSqlValue("it's"), "'it''s'");
  });

  it('should not quote numbers', () => {
    assert.strictEqual(escapeSqlValue(42), '42');
    assert.strictEqual(escapeSqlValue(3.14), '3.14');
  });

  it('should throw for non-finite numbers', () => {
    assert.throws(() => escapeSqlValue(Infinity));
    assert.throws(() => escapeSqlValue(NaN));
  });

  it('should not quote bigint', () => {
    assert.strictEqual(escapeSqlValue(12_345n), '12345');
  });

  it('should escape booleans', () => {
    assert.strictEqual(escapeSqlValue(true), 'TRUE');
    assert.strictEqual(escapeSqlValue(false), 'FALSE');
  });

  it('should escape dates as ISO strings', () => {
    const date = new Date('2024-01-15T10:30:00.000Z');
    assert.strictEqual(escapeSqlValue(date), "'2024-01-15T10:30:00.000Z'");
  });

  it('should escape objects as JSONB', () => {
    const obj = { id: 1, name: "O'Brien" };
    assert.strictEqual(escapeSqlValue(obj), "'{\"id\":1,\"name\":\"O''Brien\"}'::jsonb");
  });
});

describe('escapeIdentifier', () => {
  it('should not quote simple identifiers', () => {
    assert.strictEqual(escapeIdentifier('users'), 'users');
    assert.strictEqual(escapeIdentifier('user_name'), 'user_name');
    assert.strictEqual(escapeIdentifier('_private'), '_private');
  });

  it('should quote identifiers with special characters', () => {
    assert.strictEqual(escapeIdentifier('user-name'), '"user-name"');
    assert.strictEqual(escapeIdentifier('user name'), '"user name"');
    assert.strictEqual(escapeIdentifier('123users'), '"123users"');
  });

  it('should escape double quotes in identifiers', () => {
    assert.strictEqual(escapeIdentifier('user"name'), '"user""name"');
  });

  it('should not quote identifiers with $ in the middle', () => {
    assert.strictEqual(escapeIdentifier('user$name'), 'user$name');
  });
});
