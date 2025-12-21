/**
 * Fragment part types for SQL building.
 *
 * These are simple immutable data classes that represent parts of a SQL fragment.
 * Unlike user-defined .pmsg types, these are plain TypeScript classes since they're
 * library infrastructure, not user data.
 */

/**
 * Column reference with optional schema and table qualification.
 */
export class ColumnRef {
  readonly schema: string | null;
  readonly table: string | null;
  readonly name: string;

  constructor(props: { schema: string | null; table: string | null; name: string }) {
    this.schema = props.schema;
    this.table = props.table;
    this.name = props.name;
  }
}

/**
 * Table reference with optional schema qualification.
 */
export class TableRef {
  readonly schema: string | null;
  readonly name: string;

  constructor(props: { schema: string | null; name: string }) {
    this.schema = props.schema;
    this.name = props.name;
  }
}

/**
 * Generic identifier reference (for constraint names, index names, etc.).
 */
export class IdentifierRef {
  readonly name: string;

  constructor(props: { name: string }) {
    this.name = props.name;
  }
}

/**
 * Literal value that will be inlined in SQL or parameterized in queries.
 */
export class LiteralValue {
  readonly value: string | number | bigint | boolean | null;

  constructor(props: { value: string | number | bigint | boolean | null }) {
    this.value = props.value;
  }
}

/**
 * Raw SQL segment (template strings, operators, keywords).
 */
export class RawSql {
  readonly sql: string;

  constructor(props: { sql: string }) {
    this.sql = props.sql;
  }
}

/**
 * Union of all part types that can appear in a fragment.
 */
export type FragmentPart = ColumnRef | TableRef | IdentifierRef | LiteralValue | RawSql;

/**
 * Handlers for transforming specific part types in mapParts().
 */
export type PartHandlers<T> = {
  ColumnRef?: (part: ColumnRef) => T;
  TableRef?: (part: TableRef) => T;
  IdentifierRef?: (part: IdentifierRef) => T;
  LiteralValue?: (part: LiteralValue) => T;
  RawSql?: (part: RawSql) => T;
};

/**
 * SQL fragment containing parts array.
 * Pure data structure - rendering is handled by database adapters.
 */
export class SqlFragment {
  readonly parts: readonly FragmentPart[];

  constructor(props: { parts: FragmentPart[] }) {
    this.parts = props.parts;
  }

  /**
   * Returns true if the fragment has no parts.
   */
  get isEmpty(): boolean {
    return this.parts.length === 0;
  }

  /**
   * Transform parts and return a new SqlFragment.
   *
   * Can take either a function that transforms all parts, or a handlers object
   * that transforms specific part types (unhandled types pass through unchanged).
   */
  mapParts(
    arg: ((part: FragmentPart) => FragmentPart) | PartHandlers<FragmentPart>
  ): SqlFragment {
    let mappedParts: FragmentPart[];

    if (typeof arg === 'function') {
      mappedParts = this.parts.map(arg);
    } else {
      mappedParts = this.parts.map((part) => {
        if (part instanceof ColumnRef && arg.ColumnRef) return arg.ColumnRef(part);
        if (part instanceof TableRef && arg.TableRef) return arg.TableRef(part);
        if (part instanceof IdentifierRef && arg.IdentifierRef) return arg.IdentifierRef(part);
        if (part instanceof LiteralValue && arg.LiteralValue) return arg.LiteralValue(part);
        if (part instanceof RawSql && arg.RawSql) return arg.RawSql(part);
        return part; // unchanged
      });
    }

    return new SqlFragment({ parts: mappedParts });
  }
}
