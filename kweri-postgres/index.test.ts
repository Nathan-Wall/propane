import { describe, it } from 'node:test';
import assert from 'node:assert';
import { PostgresAdapter } from './index.js';
import {
  sql,
  column,
  table,
  identifier,
  literal,
  raw,
  join,
  and,
} from '@/kweri-core/index.js';

describe('@kweri/postgres', () => {
  describe('PostgresAdapter', () => {
    const pg = new PostgresAdapter();

    describe('render()', () => {
      it('should render column reference with double quotes', () => {
        const frag = column('name');
        assert.strictEqual(pg.render(frag), '"name"');
      });

      it('should render qualified column', () => {
        const frag = column('users', 'email');
        assert.strictEqual(pg.render(frag), '"users"."email"');
      });

      it('should render schema-qualified column', () => {
        const frag = column('public', 'users', 'email');
        assert.strictEqual(pg.render(frag), '"public"."users"."email"');
      });

      it('should render table reference', () => {
        const frag = table('users');
        assert.strictEqual(pg.render(frag), '"users"');
      });

      it('should render schema-qualified table', () => {
        const frag = table('public', 'users');
        assert.strictEqual(pg.render(frag), '"public"."users"');
      });

      it('should render identifier', () => {
        const frag = identifier('idx_users_email');
        assert.strictEqual(pg.render(frag), '"idx_users_email"');
      });

      it('should render string literal with single quotes', () => {
        const frag = literal('hello');
        assert.strictEqual(pg.render(frag), "'hello'");
      });

      it('should render number literal', () => {
        const frag = literal(42);
        assert.strictEqual(pg.render(frag), '42');
      });

      it('should render bigint literal', () => {
        const frag = literal(9_007_199_254_740_993n);
        assert.strictEqual(pg.render(frag), '9007199254740993');
      });

      it('should render boolean true', () => {
        const frag = literal(true);
        assert.strictEqual(pg.render(frag), 'true');
      });

      it('should render boolean false', () => {
        const frag = literal(false);
        assert.strictEqual(pg.render(frag), 'false');
      });

      it('should render null as NULL', () => {
        const frag = literal(null);
        assert.strictEqual(pg.render(frag), 'NULL');
      });

      it('should render raw SQL unchanged', () => {
        const frag = raw('ASC NULLS LAST');
        assert.strictEqual(pg.render(frag), 'ASC NULLS LAST');
      });

      it('should render complex fragment', () => {
        const frag = sql`SELECT * FROM ${table('users')} WHERE ${column('name')} = ${'Alice'}`;
        assert.strictEqual(
          pg.render(frag),
          'SELECT * FROM "users" WHERE "name" = \'Alice\''
        );
      });
    });

    describe('render() with handlers', () => {
      it('should use custom handler for ColumnRef', () => {
        const frag = column('name');
        const result = pg.render(frag, {
          ColumnRef: () => '$col$',
        });
        assert.strictEqual(result, '$col$');
      });

      it('should fall back to default for unhandled types', () => {
        const frag = sql`${column('name')} = ${'Alice'}`;
        const result = pg.render(frag, {
          ColumnRef: () => '$col$',
        });
        assert.strictEqual(result, "$col$ = 'Alice'");
      });

      it('should handle custom TableRef handler', () => {
        const frag = table('users');
        const result = pg.render(frag, {
          TableRef: () => '$table$',
        });
        assert.strictEqual(result, '$table$');
      });
    });

    describe('toQuery()', () => {
      it('should parameterize literal values', () => {
        const frag = sql`${column('name')} = ${'Alice'}`;
        const { text, values } = pg.toQuery(frag);
        assert.strictEqual(text, '"name" = $1');
        assert.deepStrictEqual(values, ['Alice']);
      });

      it('should number placeholders sequentially', () => {
        const frag = sql`${column('a')} = ${1} AND ${column('b')} = ${2}`;
        const { text, values } = pg.toQuery(frag);
        assert.strictEqual(text, '"a" = $1 AND "b" = $2');
        assert.deepStrictEqual(values, [1, 2]);
      });

      it('should handle join with parameterized values', () => {
        const frag = sql`${column('status')} IN (${join(['a', 'b', 'c'])})`;
        const { text, values } = pg.toQuery(frag);
        assert.strictEqual(text, '"status" IN ($1, $2, $3)');
        assert.deepStrictEqual(values, ['a', 'b', 'c']);
      });

      it('should preserve null in values array', () => {
        const frag = sql`${column('name')} = ${null}`;
        const { text, values } = pg.toQuery(frag);
        assert.strictEqual(text, '"name" = $1');
        assert.deepStrictEqual(values, [null]);
      });
    });

    describe('string escaping', () => {
      describe('standard mode (default)', () => {
        it('should escape single quotes by doubling', () => {
          const frag = literal("O'Brien");
          assert.strictEqual(pg.render(frag), "'O''Brien'");
        });
      });

      describe('escape mode', () => {
        const pgEscape = new PostgresAdapter({ strings: 'escape' });

        it('should use E-string syntax', () => {
          const frag = literal('hello');
          assert.strictEqual(pgEscape.render(frag), "E'hello'");
        });

        it('should escape backslashes', () => {
          const frag = literal(String.raw`path\to\file`);
          assert.strictEqual(pgEscape.render(frag), String.raw`E'path\\to\\file'`);
        });

        it('should escape single quotes', () => {
          const frag = literal("O'Brien");
          assert.strictEqual(pgEscape.render(frag), "E'O''Brien'");
        });
      });
    });

    describe('quote escaping', () => {
      it('should escape double quotes in identifiers', () => {
        const frag = column('col"name');
        assert.strictEqual(pg.render(frag), '"col""name"');
      });
    });

    describe('special number handling', () => {
      it('should render NaN as quoted string', () => {
        const frag = literal(NaN);
        assert.strictEqual(pg.render(frag), "'NaN'");
      });

      it('should render Infinity as quoted string', () => {
        const frag = literal(Infinity);
        assert.strictEqual(pg.render(frag), "'Infinity'");
      });

      it('should render -Infinity as quoted string', () => {
        const frag = literal(-Infinity);
        assert.strictEqual(pg.render(frag), "'-Infinity'");
      });
    });

    describe('NUL byte rejection', () => {
      it('should throw for identifier containing NUL', () => {
        assert.throws(
          () => pg.quoteIdentifier('name\u0000'),
          /NUL byte/
        );
      });
    });

    describe('integration', () => {
      it('should generate CHECK constraint expression', () => {
        const col = column('price');
        const check = sql`${col} > ${0}`;
        assert.strictEqual(pg.render(check), '"price" > 0');
      });

      it('should generate IN clause', () => {
        const col = column('status');
        const values = ['pending', 'active', 'closed'];
        const check = sql`${col} IN (${join(values)})`;
        assert.strictEqual(
          pg.render(check),
          "\"status\" IN ('pending', 'active', 'closed')"
        );
      });

      it('should generate hashable output with custom handlers', () => {
        const col = column('price');
        const check = sql`${col} > ${0}`;
        const hashable = pg.render(check, {
          ColumnRef: () => '$col$',
        });
        assert.strictEqual(hashable, '$col$ > 0');
      });

      it('should handle and() with conditions', () => {
        const conditions = and([
          sql`${column('active')} = ${true}`,
          sql`${column('price')} > ${0}`,
        ]);
        const result = pg.render(conditions);
        assert.strictEqual(result, '("active" = true AND "price" > 0)');
      });
    });
  });
});
