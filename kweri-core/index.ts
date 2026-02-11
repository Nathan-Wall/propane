/**
 * @kweri/core - SQL fragment building and transformation
 *
 * Build composable, database-agnostic SQL fragments that can be rendered
 * by database-specific adapters.
 */

import {
  SqlFragment,
  ColumnRef,
  TableRef,
  IdentifierRef,
  LiteralValue,
  RawSql,
  type FragmentPart,
} from './fragment.js';

/**
 * Values that can be interpolated into a fragment.
 * Markers return SqlFragment, primitives are wrapped in LiteralValue internally.
 */
export type FragmentValue =
  | SqlFragment
  | string
  | number
  | bigint
  | boolean
  | null;

/**
 * Helper to wrap a primitive value in LiteralValue.
 * Throws on undefined or unsupported types.
 */
function wrapValue(val: unknown): LiteralValue {
  if (val === undefined) {
    throw new Error('undefined is not a valid fragment value');
  }
  if (val !== null && !['string', 'number', 'bigint', 'boolean'].includes(typeof val)) {
    throw new Error(`Unsupported value type: ${typeof val}`);
  }
  return new LiteralValue({
    value: val as string | number | bigint | boolean | null,
  });
}

/**
 * Create a column reference.
 *
 * @example
 * column('name')                    // "name"
 * column('users', 'name')           // "users"."name"
 * column('public', 'users', 'name') // "public"."users"."name"
 */
export function column(name: string): SqlFragment;
export function column(table: string, name: string): SqlFragment;
export function column(
  schema: string,
  table: string,
  name: string
): SqlFragment;
export function column(a: string, b?: string, c?: string): SqlFragment {
  const ref = new ColumnRef({
    schema: c === undefined ? null : a,
    table: c === undefined ? b === undefined ? null : a : b!,
    name: c ?? b ?? a,
  });
  return new SqlFragment({ parts: [ref] });
}

/**
 * Create a table reference.
 *
 * @example
 * table('users')           // "users"
 * table('public', 'users') // "public"."users"
 */
export function table(name: string): SqlFragment;
export function table(schema: string, name: string): SqlFragment;
export function table(schemaOrName: string, maybeName?: string): SqlFragment {
  const ref = new TableRef({
    schema: maybeName === undefined ? null : schemaOrName,
    name: maybeName ?? schemaOrName,
  });
  return new SqlFragment({ parts: [ref] });
}

/**
 * Create a generic identifier reference.
 * Use for constraint names, index names, or other identifiers.
 *
 * @example
 * identifier('idx_users_email') // "idx_users_email"
 */
export function identifier(name: string): SqlFragment {
  return new SqlFragment({ parts: [new IdentifierRef({ name })] });
}

/**
 * Create a literal value expression.
 * - With render(): The value is inlined as a SQL literal (properly escaped)
 * - With toQuery(): The value becomes a placeholder with the value passed separately
 *
 * @example
 * literal('active') // 'active'
 * literal(42)       // 42
 * literal(true)     // true
 */
export function literal(
  value: string | number | bigint | boolean | null
): SqlFragment {
  return new SqlFragment({ parts: [new LiteralValue({ value })] });
}

/**
 * Inject raw SQL. Use for SQL keywords and syntax that don't fit other markers.
 *
 * WARNING: raw() bypasses the safety model. Never use with untrusted input.
 * WARNING: Do not include driver placeholders ($1, ?) when using toQuery().
 *
 * @example
 * raw('ASC NULLS LAST')
 * raw('->')  // JSON accessor operator
 */
export function raw(sqlString: string): SqlFragment {
  return new SqlFragment({ parts: [new RawSql({ sql: sqlString })] });
}

/**
 * Build a SQL fragment from a template with interpolated values.
 *
 * @example
 * sql`${column('price')} >= ${100}`
 * sql`SELECT * FROM ${table('users')} WHERE ${column('active')} = ${true}`
 */
export function sql(
  strings: TemplateStringsArray,
  ...values: FragmentValue[]
): SqlFragment {
  const parts: FragmentPart[] = [];

  for (let i = 0; i < strings.length; i++) {
    // Template segments are raw SQL
    const str = strings[i];
    if (str) {
      parts.push(new RawSql({ sql: str }));
    }

    if (i < values.length) {
      const val = values[i];
      if (val === undefined) {
        throw new Error(`sql interpolation at index ${i} is undefined`);
      }
      if (val instanceof SqlFragment) {
        // Unwrap nested fragment's parts
        parts.push(...val.parts);
      } else {
        // Wrap primitives in LiteralValue
        parts.push(wrapValue(val));
      }
    }
  }

  return new SqlFragment({ parts });
}

/**
 * Empty fragment for conditional composition.
 *
 * @example
 * const whereClause = condition ? sql`WHERE ${column('active')}` : empty;
 */
export const empty: SqlFragment = new SqlFragment({ parts: [] });

/**
 * Join multiple values with a separator.
 * Default separator is ', '.
 *
 * - String separators are treated as raw SQL (for ' AND ', ' OR ', etc.)
 * - undefined values are silently skipped (enables conditional composition)
 * - Throws on non-string, non-fragment separators
 *
 * @example
 * join(['a', 'b', 'c'])                    // 'a', 'b', 'c'
 * join(' AND ', [cond1, cond2])            // cond1 AND cond2
 * join([column('id'), column('name')])    // "id", "name"
 */
export function join(values: Iterable<FragmentValue | undefined>): SqlFragment;
export function join(
  separator: string | SqlFragment,
  values: Iterable<FragmentValue | undefined>
): SqlFragment;
export function join(
  separatorOrValues: string | SqlFragment | Iterable<FragmentValue | undefined>,
  maybeValues?: Iterable<FragmentValue | undefined>
): SqlFragment {
  let separator: string | SqlFragment;
  let values: Iterable<FragmentValue | undefined>;

  if (maybeValues === undefined) {
    separator = ', ';
    values = separatorOrValues as Iterable<FragmentValue | undefined>;
  } else {
    separator = separatorOrValues as string | SqlFragment;
    values = maybeValues;
  }

  // Validate separator type
  if (!(separator instanceof SqlFragment) && typeof separator !== 'string') {
    throw new TypeError(
      `join separator must be a string or SqlFragment, got ${typeof separator}`
    );
  }

  // Convert separator to parts
  function separatorToParts(): FragmentPart[] {
    if (separator instanceof SqlFragment) {
      return [...separator.parts];
    }
    // String separators are raw SQL (for ' AND ', ' OR ', etc.)
    return [new RawSql({ sql: separator })];
  }

  // Build parts by interleaving values with separator
  const parts: FragmentPart[] = [];
  let count = 0;

  for (const val of values) {
    // Skip undefined values (enables conditional composition)
    if (val === undefined) continue;

    if (count > 0) {
      parts.push(...separatorToParts());
    }

    if (val instanceof SqlFragment) {
      parts.push(...val.parts);
    } else {
      // Wrap primitives in LiteralValue
      parts.push(wrapValue(val));
    }

    count++;
  }

  return new SqlFragment({ parts });
}

/**
 * Join conditions with AND, wrapping in parentheses.
 * - undefined values are skipped
 * - Empty iterable returns empty fragment
 * - Single condition returns that condition unchanged (no parentheses)
 * - Multiple conditions are wrapped in parentheses
 *
 * @example
 * and([
 *   sql`${column('active')} = ${true}`,
 *   sql`${column('price')} > ${0}`,
 * ])
 * // ("active" = true AND "price" > 0)
 */
export function and(
  conditions: Iterable<SqlFragment | undefined>
): SqlFragment {
  const arr = Array.from(conditions).filter(
    (c): c is SqlFragment => c !== undefined
  );
  if (arr.length === 0) return empty;
  if (arr.length === 1) return arr[0]!;
  return sql`(${join(' AND ', arr)})`;
}

/**
 * Join conditions with OR, wrapping in parentheses.
 * - undefined values are skipped
 * - Empty iterable returns empty fragment
 * - Single condition returns that condition unchanged (no parentheses)
 * - Multiple conditions are wrapped in parentheses
 *
 * @example
 * or([
 *   sql`${column('status')} = ${'pending'}`,
 *   sql`${column('status')} = ${'review'}`,
 * ])
 * // ("status" = 'pending' OR "status" = 'review')
 */
export function or(conditions: Iterable<SqlFragment | undefined>): SqlFragment {
  const arr = Array.from(conditions).filter(
    (c): c is SqlFragment => c !== undefined
  );
  if (arr.length === 0) return empty;
  if (arr.length === 1) return arr[0]!;
  return sql`(${join(' OR ', arr)})`;
}

export {
  type PartHandlers,
  SqlFragment,
  ColumnRef,
  TableRef,
  IdentifierRef,
  LiteralValue,
  RawSql,
  type FragmentPart,
} from './fragment.js';
