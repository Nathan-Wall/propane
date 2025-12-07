/**
 * Value serialization and deserialization between JavaScript and PostgreSQL.
 */

/**
 * Serializes a JavaScript value for PostgreSQL storage.
 */
export function serializeValue(value: unknown, sqlType: string): unknown {
  if (value === null || value === undefined) {
    return null;
  }

  const normalized = sqlType.toUpperCase();

  // Dates
  if (normalized === 'TIMESTAMPTZ' || normalized === 'TIMESTAMP') {
    if (value instanceof Date) {
      return value.toISOString();
    }
    // ImmutableDate support
    if (typeof value === 'object' && value !== null && 'toDate' in value) {
      return (value as { toDate(): Date }).toDate().toISOString();
    }
    return value;
  }

  // URLs
  if (normalized === 'TEXT' && value instanceof URL) {
    return value.href;
  }
  // ImmutableUrl support
  const isImmutableUrl = normalized === 'TEXT'
    && typeof value === 'object'
    && value !== null
    && 'href' in value;
  if (isImmutableUrl) {
    return (value as { href: string }).href;
  }

  // ArrayBuffer/BYTEA
  if (normalized === 'BYTEA') {
    if (value instanceof ArrayBuffer) {
      return Buffer.from(value);
    }
    // ImmutableArrayBuffer support
    const isImmutableBuffer = typeof value === 'object'
      && value !== null
      && 'toArrayBuffer' in value;
    if (isImmutableBuffer) {
      type BufferSource = { toArrayBuffer(): ArrayBuffer };
      return Buffer.from((value as BufferSource).toArrayBuffer());
    }
    return value;
  }

  // JSONB - serialize complex objects
  if (normalized === 'JSONB' || normalized === 'JSON') {
    if (typeof value === 'object') {
      // Handle Propane Message instances
      const valueObj = value as Record<string, unknown>;
      if ('toJSON' in valueObj && typeof valueObj['toJSON'] === 'function') {
        return (value as { toJSON(): unknown }).toJSON();
      }
      // Handle ImmutableSet/Set - check before Map since Set also has 'entries'
      const isSetLike = value instanceof Set
        || Symbol.iterator in value && 'has' in value && 'add' in value;
      if (isSetLike) {
        return [...(value as unknown as Iterable<unknown>)];
      }
      // Handle ImmutableMap/Map
      const isMapLike = value instanceof Map
        || 'entries' in value && 'get' in value;
      if (isMapLike) {
        type EntryProvider = { entries(): Iterable<[unknown, unknown]> };
        const entries = value instanceof Map
          ? [...value.entries()]
          : [...(value as EntryProvider).entries()];
        return Object.fromEntries(entries);
      }
      // Handle ImmutableArray/Array
      if (Array.isArray(value) || typeof value === 'object' && Symbol.iterator in value) {
        return [...(value as Iterable<unknown>)].map(v => serializeValue(v, 'JSONB'));
      }
      return value;
    }
    return value;
  }

  // BigInt
  if (normalized === 'BIGINT' || normalized === 'BIGSERIAL') {
    if (typeof value === 'bigint') {
      return value.toString();
    }
    return value;
  }

  // Decimal - keep as string
  if (normalized.startsWith('NUMERIC') || normalized.startsWith('DECIMAL')) {
    if (typeof value === 'number') {
      return value.toString();
    }
    return value;
  }

  return value;
}

/**
 * Deserializes a PostgreSQL value to JavaScript.
 */
export function deserializeValue(
  value: unknown,
  sqlType: string,
  targetType?: string
): unknown {
  if (value === null || value === undefined) {
    return null;
  }

  const normalized = sqlType.toUpperCase();

  // Dates
  if (normalized === 'TIMESTAMPTZ' || normalized === 'TIMESTAMP') {
    if (typeof value === 'string' || typeof value === 'number') {
      return new Date(value);
    }
    if (value instanceof Date) {
      return value;
    }
    return value;
  }

  // URLs
  if (targetType === 'URL' && typeof value === 'string') {
    return new URL(value);
  }

  // ArrayBuffer/BYTEA
  if (normalized === 'BYTEA') {
    if (Buffer.isBuffer(value)) {
      const start = value.byteOffset;
      const end = start + value.byteLength;
      return value.buffer.slice(start, end);
    }
    return value;
  }

  // BigInt
  if (normalized === 'BIGINT' || normalized === 'BIGSERIAL') {
    if (typeof value === 'string') {
      return BigInt(value);
    }
    if (typeof value === 'number') {
      return BigInt(value);
    }
    return value;
  }

  // JSONB - already parsed by postgres driver
  if (normalized === 'JSONB' || normalized === 'JSON') {
    // postgres.js automatically parses JSON
    return value;
  }

  // Decimal stays as string
  if (normalized.startsWith('NUMERIC') || normalized.startsWith('DECIMAL')) {
    return typeof value === 'number' ? value.toString() : value;
  }

  return value;
}

/**
 * Escapes a value for safe SQL interpolation.
 * Note: Always prefer parameterized queries. This is for special cases only.
 */
export function escapeSqlValue(value: unknown): string {
  if (value === null || value === undefined) {
    return 'NULL';
  }

  if (typeof value === 'string') {
    return `'${value.replaceAll('\'', "''")}'`;
  }

  if (typeof value === 'number') {
    if (!Number.isFinite(value)) {
      throw new TypeError(`Cannot escape non-finite number: ${value}`);
    }
    return value.toString();
  }

  if (typeof value === 'bigint') {
    return value.toString();
  }

  if (typeof value === 'boolean') {
    return value ? 'TRUE' : 'FALSE';
  }

  if (value instanceof Date) {
    return `'${value.toISOString()}'`;
  }

  if (typeof value === 'object') {
    return `'${JSON.stringify(value).replaceAll('\'', "''")}'::jsonb`;
  }

  throw new Error(`Cannot escape value of type ${typeof value}`);
}

/**
 * Escapes an identifier (table name, column name) for safe SQL.
 */
export function escapeIdentifier(name: string): string {
  // Check for valid identifier characters
  if (!/^[a-z_][a-z0-9_$]*$/i.test(name)) {
    // Quote the identifier
    return `"${name.replaceAll('"', '""')}"`;
  }
  return name;
}
