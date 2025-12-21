/**
 * @kweri/postgres - PostgreSQL adapter for SQL fragments
 */

import {
  SqlFragment,
  ColumnRef,
  TableRef,
  IdentifierRef,
  LiteralValue,
  RawSql,
  type FragmentPart,
} from '@/kweri-core/index.js';

/**
 * Configuration options for PostgresAdapter.
 */
export type PostgresConfig = {
  /**
   * String escaping mode:
   * - 'standard': Simple single-quote escaping (default)
   * - 'escape': E-string syntax with backslash escaping
   */
  strings?: 'standard' | 'escape';
};

/**
 * Handlers for custom part rendering.
 */
export type PartHandlers<T> = {
  ColumnRef?: (part: ColumnRef) => T;
  TableRef?: (part: TableRef) => T;
  IdentifierRef?: (part: IdentifierRef) => T;
  LiteralValue?: (part: LiteralValue) => T;
  RawSql?: (part: RawSql) => T;
};

/**
 * Parameterized query result.
 */
export type QueryConfig = {
  text: string;
  values: unknown[];
};

/**
 * PostgreSQL adapter for rendering SQL fragments.
 *
 * @example
 * const pg = new PostgresAdapter();
 * pg.render(sql`${column('name')} = ${'Alice'}`)
 * // "name" = 'Alice'
 *
 * pg.toQuery(sql`${column('name')} = ${'Alice'}`)
 * // { text: '"name" = $1', values: ['Alice'] }
 */
export class PostgresAdapter {
  private config: Required<PostgresConfig>;

  constructor(config: PostgresConfig = {}) {
    this.config = {
      strings: config.strings ?? 'standard',
    };
  }

  /**
   * Quote an identifier (table name, column name, etc.) for PostgreSQL.
   * Uses double-quotes and escapes embedded double-quotes.
   * Throws on NUL bytes.
   */
  quoteIdentifier(name: string): string {
    if (name.includes('\u0000')) {
      throw new Error('Identifier contains NUL byte');
    }
    return `"${name.replace(/"/g, '""')}"`;
  }

  /**
   * Quote a string value for PostgreSQL.
   * Uses standard or escape mode based on configuration.
   */
  quoteString(value: string): string {
    if (this.config.strings === 'escape') {
      const escaped = value.replace(/\\/g, '\\\\').replace(/'/g, "''");
      return `E'${escaped}'`;
    }
    return `'${value.replace(/'/g, "''")}'`;
  }

  /**
   * Convert a literal value to SQL representation.
   */
  protected literalToSql(value: unknown): string {
    if (value === null) return 'NULL';
    switch (typeof value) {
      case 'string':
        return this.quoteString(value);
      case 'number':
        return this.numberToSql(value);
      case 'bigint':
        return value.toString();
      case 'boolean':
        return value ? 'true' : 'false';
      default:
        throw new Error(`Unsupported literal type: ${typeof value}`);
    }
  }

  /**
   * Convert a number to SQL representation.
   * Handles NaN and Infinity as quoted strings.
   */
  protected numberToSql(value: number): string {
    if (Number.isNaN(value)) return "'NaN'";
    if (!Number.isFinite(value)) return value > 0 ? "'Infinity'" : "'-Infinity'";
    return String(value);
  }

  /**
   * Render a single fragment part to SQL.
   */
  protected renderPart(part: FragmentPart): string {
    if (part instanceof RawSql) return part.sql;
    if (part instanceof LiteralValue) return this.literalToSql(part.value);
    if (part instanceof ColumnRef) {
      const segments: string[] = [];
      if (part.schema) segments.push(this.quoteIdentifier(part.schema));
      if (part.table) segments.push(this.quoteIdentifier(part.table));
      segments.push(this.quoteIdentifier(part.name));
      return segments.join('.');
    }
    if (part instanceof TableRef) {
      return part.schema
        ? `${this.quoteIdentifier(part.schema)}.${this.quoteIdentifier(part.name)}`
        : this.quoteIdentifier(part.name);
    }
    if (part instanceof IdentifierRef) return this.quoteIdentifier(part.name);
    throw new Error(`Unknown part type: ${part}`);
  }

  /**
   * Render a fragment to a SQL string.
   *
   * Optionally accepts handlers to customize rendering of specific part types.
   * Unhandled parts fall back to default rendering.
   *
   * @example
   * pg.render(sql`${column('name')} = ${'Alice'}`)
   * // "name" = 'Alice'
   *
   * // Custom handler for hashable output
   * pg.render(fragment, {
   *   ColumnRef: () => '$col$',
   *   TableRef: () => '$table$',
   * })
   */
  render(fragment: SqlFragment, handlers?: PartHandlers<string>): string {
    if (!handlers) {
      return fragment.parts.map((part) => this.renderPart(part)).join('');
    }

    return fragment.parts
      .map((part) => {
        if (part instanceof ColumnRef && handlers.ColumnRef) return handlers.ColumnRef(part);
        if (part instanceof TableRef && handlers.TableRef) return handlers.TableRef(part);
        if (part instanceof IdentifierRef && handlers.IdentifierRef)
          return handlers.IdentifierRef(part);
        if (part instanceof LiteralValue && handlers.LiteralValue)
          return handlers.LiteralValue(part);
        if (part instanceof RawSql && handlers.RawSql) return handlers.RawSql(part);
        return this.renderPart(part);
      })
      .join('');
  }

  /**
   * Render a fragment to a parameterized query.
   *
   * Literal values become placeholders ($1, $2, etc.) with values
   * collected in the values array.
   *
   * @example
   * pg.toQuery(sql`${column('name')} = ${'Alice'}`)
   * // { text: '"name" = $1', values: ['Alice'] }
   */
  toQuery(fragment: SqlFragment): QueryConfig {
    const values: unknown[] = [];
    let paramIndex = 1;

    const text = fragment.parts
      .map((part) => {
        if (part instanceof LiteralValue) {
          values.push(part.value);
          return `$${paramIndex++}`;
        }
        return this.renderPart(part);
      })
      .join('');

    return { text, values };
  }
}
