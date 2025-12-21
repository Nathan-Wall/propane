import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  sql,
  column,
  table,
  identifier,
  literal,
  raw,
  join,
  and,
  or,
  empty,
  SqlFragment,
  ColumnRef,
  TableRef,
  IdentifierRef,
  LiteralValue,
  RawSql,
} from '@/kweri-core/index.js';

describe('@kweri/core', () => {
  describe('identifier()', () => {
    it('should return SqlFragment with IdentifierRef part', () => {
      const frag = identifier('idx_users_email');
      assert.strictEqual(frag.parts.length, 1);
      assert.ok(frag.parts[0] instanceof IdentifierRef);
      assert.strictEqual((frag.parts[0] as IdentifierRef).name, 'idx_users_email');
    });
  });

  describe('column()', () => {
    it('should create single column reference', () => {
      const frag = column('email');
      assert.strictEqual(frag.parts.length, 1);
      assert.ok(frag.parts[0] instanceof ColumnRef);
      const ref = frag.parts[0] as ColumnRef;
      assert.strictEqual(ref.name, 'email');
      assert.strictEqual(ref.table, null);
      assert.strictEqual(ref.schema, null);
    });

    it('should create table-qualified column reference', () => {
      const frag = column('users', 'email');
      const ref = frag.parts[0] as ColumnRef;
      assert.strictEqual(ref.name, 'email');
      assert.strictEqual(ref.table, 'users');
      assert.strictEqual(ref.schema, null);
    });

    it('should create schema-qualified column reference', () => {
      const frag = column('public', 'users', 'email');
      const ref = frag.parts[0] as ColumnRef;
      assert.strictEqual(ref.name, 'email');
      assert.strictEqual(ref.table, 'users');
      assert.strictEqual(ref.schema, 'public');
    });
  });

  describe('table()', () => {
    it('should create single table reference', () => {
      const frag = table('users');
      assert.strictEqual(frag.parts.length, 1);
      assert.ok(frag.parts[0] instanceof TableRef);
      const ref = frag.parts[0] as TableRef;
      assert.strictEqual(ref.name, 'users');
      assert.strictEqual(ref.schema, null);
    });

    it('should create schema-qualified table reference', () => {
      const frag = table('public', 'users');
      const ref = frag.parts[0] as TableRef;
      assert.strictEqual(ref.name, 'users');
      assert.strictEqual(ref.schema, 'public');
    });
  });

  describe('literal()', () => {
    it('should wrap string value', () => {
      const frag = literal('hello');
      assert.ok(frag.parts[0] instanceof LiteralValue);
      assert.strictEqual((frag.parts[0] as LiteralValue).value, 'hello');
    });

    it('should wrap number value', () => {
      const frag = literal(42);
      assert.strictEqual((frag.parts[0] as LiteralValue).value, 42);
    });

    it('should wrap bigint value', () => {
      const frag = literal(123n);
      assert.strictEqual((frag.parts[0] as LiteralValue).value, 123n);
    });

    it('should wrap boolean value', () => {
      const frag = literal(true);
      assert.strictEqual((frag.parts[0] as LiteralValue).value, true);
    });

    it('should wrap null value', () => {
      const frag = literal(null);
      assert.strictEqual((frag.parts[0] as LiteralValue).value, null);
    });
  });

  describe('raw()', () => {
    it('should wrap string in RawSql part', () => {
      const frag = raw('ASC NULLS LAST');
      assert.strictEqual(frag.parts.length, 1);
      assert.ok(frag.parts[0] instanceof RawSql);
      assert.strictEqual((frag.parts[0] as RawSql).sql, 'ASC NULLS LAST');
    });
  });

  describe('sql tagged template', () => {
    it('should interpolate primitive values as LiteralValue', () => {
      const frag = sql`value = ${42}`;
      assert.strictEqual(frag.parts.length, 2);
      assert.ok(frag.parts[0] instanceof RawSql);
      assert.ok(frag.parts[1] instanceof LiteralValue);
      assert.strictEqual((frag.parts[1] as LiteralValue).value, 42);
    });

    it('should flatten nested SqlFragment', () => {
      const inner = column('name');
      const outer = sql`SELECT ${inner}`;
      assert.strictEqual(outer.parts.length, 2);
      assert.ok(outer.parts[0] instanceof RawSql);
      assert.ok(outer.parts[1] instanceof ColumnRef);
    });

    it('should handle multiple interpolations', () => {
      const frag = sql`${column('a')} = ${1} AND ${column('b')} = ${2}`;
      assert.strictEqual(frag.parts.length, 7);
    });

    it('should throw on undefined interpolation', () => {
      assert.throws(
        () => sql`value = ${undefined as unknown as string}`,
        /undefined/
      );
    });
  });

  describe('empty', () => {
    it('should have empty parts array', () => {
      assert.strictEqual(empty.parts.length, 0);
    });

    it('should have isEmpty true', () => {
      assert.strictEqual(empty.isEmpty, true);
    });
  });

  describe('isEmpty getter', () => {
    it('should return true for empty fragment', () => {
      assert.strictEqual(empty.isEmpty, true);
    });

    it('should return false for non-empty fragment', () => {
      assert.strictEqual(sql`SELECT 1`.isEmpty, false);
    });
  });

  describe('join()', () => {
    it('should use default comma separator', () => {
      const frag = join(['a', 'b', 'c']);
      // 'a', ', ', 'b', ', ', 'c'
      assert.strictEqual(frag.parts.length, 5);
    });

    it('should use custom string separator', () => {
      const frag = join(' AND ', [literal('a'), literal('b')]);
      assert.strictEqual(frag.parts.length, 3);
      assert.ok(frag.parts[1] instanceof RawSql);
      assert.strictEqual((frag.parts[1] as RawSql).sql, ' AND ');
    });

    it('should use SqlFragment separator', () => {
      const sep = sql` | `;
      const frag = join(sep, ['a', 'b']);
      assert.strictEqual(frag.parts.length, 3);
    });

    it('should return empty fragment for empty array', () => {
      const frag = join([]);
      assert.strictEqual(frag.parts.length, 0);
      assert.strictEqual(frag.isEmpty, true);
    });

    it('should skip undefined values', () => {
      const frag = join(['a', undefined, 'b']);
      // 'a', ', ', 'b' (no extra separator for undefined)
      assert.strictEqual(frag.parts.length, 3);
    });

    it('should throw on invalid separator type', () => {
      assert.throws(
        () => join(42 as unknown as string, ['a']),
        /separator must be a string or SqlFragment/
      );
    });

    it('should accept generators', () => {
      function* gen() {
        yield 'a';
        yield 'b';
      }
      const frag = join(gen());
      assert.strictEqual(frag.parts.length, 3);
    });

    it('should accept Sets', () => {
      const frag = join(new Set(['a', 'b']));
      assert.strictEqual(frag.parts.length, 3);
    });
  });

  describe('and()', () => {
    it('should join with AND and wrap in parentheses', () => {
      const cond1 = sql`a = 1`;
      const cond2 = sql`b = 2`;
      const frag = and([cond1, cond2]);
      // Should have: '(', cond1 parts, ' AND ', cond2 parts, ')'
      assert.ok(frag.parts.length > 0);
      const first = frag.parts[0] as RawSql;
      assert.strictEqual(first.sql, '(');
    });

    it('should return single condition unchanged (no parentheses)', () => {
      const cond = sql`a = 1`;
      const frag = and([cond]);
      assert.strictEqual(frag, cond);
    });

    it('should return empty for empty array', () => {
      const frag = and([]);
      assert.strictEqual(frag.isEmpty, true);
    });

    it('should skip undefined values', () => {
      const cond = sql`a = 1`;
      const frag = and([undefined, cond, undefined]);
      assert.strictEqual(frag, cond);
    });

    it('should return empty when all undefined', () => {
      const frag = and([undefined, undefined]);
      assert.strictEqual(frag.isEmpty, true);
    });
  });

  describe('or()', () => {
    it('should join with OR and wrap in parentheses', () => {
      const cond1 = sql`a = 1`;
      const cond2 = sql`b = 2`;
      const frag = or([cond1, cond2]);
      const first = frag.parts[0] as RawSql;
      assert.strictEqual(first.sql, '(');
    });

    it('should return single condition unchanged', () => {
      const cond = sql`a = 1`;
      const frag = or([cond]);
      assert.strictEqual(frag, cond);
    });

    it('should return empty for empty array', () => {
      const frag = or([]);
      assert.strictEqual(frag.isEmpty, true);
    });
  });

  describe('mapParts()', () => {
    it('should transform with function', () => {
      const frag = column('name');
      const mapped = frag.mapParts((part) => {
        if (part instanceof ColumnRef) {
          return new ColumnRef({ schema: 'audit', table: 'log', name: part.name });
        }
        return part;
      });
      const ref = mapped.parts[0] as ColumnRef;
      assert.strictEqual(ref.schema, 'audit');
      assert.strictEqual(ref.table, 'log');
    });

    it('should transform with handlers object', () => {
      const frag = column('name');
      const mapped = frag.mapParts({
        ColumnRef: (p) => new ColumnRef({ schema: null, table: 'other', name: p.name }),
      });
      const ref = mapped.parts[0] as ColumnRef;
      assert.strictEqual(ref.table, 'other');
    });

    it('should pass through unhandled part types', () => {
      const frag = sql`${column('a')} = ${42}`;
      const mapped = frag.mapParts({
        ColumnRef: (p) => new ColumnRef({ schema: null, table: 'x', name: p.name }),
      });
      // LiteralValue should be unchanged
      const lit = mapped.parts.find((p) => p instanceof LiteralValue) as LiteralValue;
      assert.strictEqual(lit.value, 42);
    });
  });

  describe('nested fragments', () => {
    it('should handle sql containing sql containing join', () => {
      const cols = join([column('a'), column('b')]);
      const inner = sql`SELECT ${cols}`;
      const outer = sql`${inner} FROM ${table('t')}`;
      // Should flatten all parts correctly
      assert.ok(outer.parts.length > 0);
      assert.ok(outer.parts.some((p) => p instanceof TableRef));
    });
  });

  describe('runtime type validation', () => {
    it('should throw on object value in sql', () => {
      assert.throws(
        () => sql`value = ${{} as unknown as string}`,
        /Unsupported value type/
      );
    });

    it('should throw on array value in sql', () => {
      assert.throws(
        () => sql`value = ${[] as unknown as string}`,
        /Unsupported value type/
      );
    });
  });

  describe('iterables', () => {
    it('should accept Map.values()', () => {
      const map = new Map([
        ['a', 'x'],
        ['b', 'y'],
      ]);
      const frag = join(map.values());
      assert.strictEqual(frag.parts.length, 3);
    });

    it('should accept and() with generator', () => {
      function* gen() {
        yield sql`a = 1`;
        yield sql`b = 2`;
      }
      const frag = and(gen());
      assert.ok(frag.parts.length > 0);
    });
  });
});
