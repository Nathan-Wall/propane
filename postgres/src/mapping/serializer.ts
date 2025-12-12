/**
 * Value serialization and deserialization between JavaScript and PostgreSQL.
 */

import type { UnionAnalysis } from './type-mapper.js';
import { extractTypeName } from './type-mapper.js';

// ============================================================================
// JSONB Union Format
// ============================================================================
//
// All JSONB union storage uses a consistent {"$t": ..., "$v": ...} format:
//
// | Value Type | Format |
// |------------|--------|
// | Message | {"$t": "message", "$v": ":$TypeName{...}"} |
// | string | {"$t": "string", "$v": "hello"} |
// | number | {"$t": "number", "$v": 42} |
// | bigint | {"$t": "bigint", "$v": "12345678901234567890"} |
// | boolean | {"$t": "boolean", "$v": true} |
// | Date | {"$t": "Date", "$v": "2024-01-01T00:00:00.000Z"} |
// | URL | {"$t": "URL", "$v": "https://example.com"} |
// | null | {"$v": null} |
// | undefined | {} |
//
// ============================================================================

/**
 * JSONB wrapper for union values.
 */
export interface JsonbUnionWrapper {
  /** Type discriminator: "message" for messages, scalar type name for scalars */
  $t?: string;
  /** The value: tagged cereal for messages, native JSON for scalars */
  $v?: unknown;
}

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

// ============================================================================
// Union-Aware Serialization/Deserialization
// ============================================================================

/**
 * Serializes a value for PostgreSQL storage, using union analysis to determine format.
 *
 * For JSONB unions:
 * - Messages: {"$t": "message", "$v": ":$TypeName{...}"}
 * - Scalars: {"$t": "string", "$v": "hello"}
 * - null: {"$v": null}
 * - undefined: {}
 */
export function serializeUnionValue(
  value: unknown,
  sqlType: string,
  unionAnalysis: UnionAnalysis
): unknown {
  // Handle undefined
  if (value === undefined) {
    if (unionAnalysis.strategy === 'jsonb' && unionAnalysis.hasNull) {
      // Must distinguish from null - use empty object
      return {};
    }
    // Native storage: undefined becomes NULL
    return null;
  }

  // Handle null
  if (value === null) {
    if (unionAnalysis.strategy === 'jsonb' && unionAnalysis.hasUndefined) {
      // Must distinguish from undefined - use explicit null wrapper
      return { $v: null } satisfies JsonbUnionWrapper;
    }
    // Native storage: null stays NULL
    return null;
  }

  // For native strategy, use standard serialization
  if (unionAnalysis.strategy === 'native') {
    return serializeValue(value, sqlType);
  }

  // JSONB strategy - wrap with type discriminator

  // Check if value is a Propane message (has $typeName and serialize)
  if (isMessage(value)) {
    const message = value as MessageLike;
    return {
      $t: 'message',
      $v: message.serialize({ includeTag: true }),
    } satisfies JsonbUnionWrapper;
  }

  // Scalar value - determine type and wrap
  const scalarType = getScalarTypeName(value);
  const serializedValue = serializeScalarForJsonb(value);

  // If there's only one possible type (single scalar with null/undefined), skip $t
  const needsTypeTag = unionAnalysis.unionMembers && unionAnalysis.unionMembers.length > 1;
  if (!needsTypeTag) {
    return { $v: serializedValue } satisfies JsonbUnionWrapper;
  }

  return {
    $t: scalarType,
    $v: serializedValue,
  } satisfies JsonbUnionWrapper;
}

/**
 * Deserializes a PostgreSQL value using union analysis.
 */
export function deserializeUnionValue(
  value: unknown,
  sqlType: string,
  unionAnalysis: UnionAnalysis
): unknown {
  // Handle NULL
  if (value === null) {
    if (unionAnalysis.hasUndefined && !unionAnalysis.hasNull) {
      // T | undefined - NULL means undefined
      return undefined;
    }
    // T | null - NULL means null
    return null;
  }

  // For native strategy, use standard deserialization
  if (unionAnalysis.strategy === 'native') {
    const result = deserializeValue(value, sqlType);
    // Convert null to undefined for T | undefined types
    if (result === null && unionAnalysis.hasUndefined && !unionAnalysis.hasNull) {
      return undefined;
    }
    return result;
  }

  // JSONB strategy - unwrap the discriminated format
  if (typeof value !== 'object' || value === null) {
    return value;
  }

  const obj = value as JsonbUnionWrapper;

  // Empty object = undefined
  if (Object.keys(obj).length === 0) {
    return undefined;
  }

  // {$v: ...} without $t = wrapped value (simple or null)
  if ('$v' in obj && !('$t' in obj)) {
    return obj.$v === null ? null : obj.$v;
  }

  // Tagged format: {"$t": ..., "$v": ...}
  if ('$t' in obj && '$v' in obj) {
    const typeTag = obj.$t as string;

    // Message: {"$t": "message", "$v": ":$TypeName{...}"}
    if (typeTag === 'message') {
      const taggedCereal = obj.$v as string;
      const typeName = extractTypeName(taggedCereal);
      const MessageClass = unionAnalysis.messageClasses?.get(typeName);
      if (MessageClass) {
        // Strip the tag to get standard cereal format: ":$TypeName{...}" -> ":{...}"
        const cereal = ':' + taggedCereal.slice(taggedCereal.indexOf('{'));
        return MessageClass.deserialize(cereal);
      }
      throw new Error(`Unknown message type in union: ${typeName}`);
    }

    // Scalar: {"$t": "string", "$v": "hello"}
    return deserializeScalarByType(obj.$v, typeTag);
  }

  // Fallback to standard deserialization
  return deserializeValue(value, sqlType);
}

// ============================================================================
// Helper Types and Functions
// ============================================================================

/**
 * Interface for checking if a value is a Propane message.
 */
interface MessageLike {
  $typeName: string;
  serialize(options?: { includeTag?: boolean }): string;
}

/**
 * Checks if a value is a Propane message.
 */
function isMessage(value: unknown): value is MessageLike {
  return (
    typeof value === 'object' &&
    value !== null &&
    '$typeName' in value &&
    'serialize' in value &&
    typeof (value as MessageLike).serialize === 'function'
  );
}

/**
 * Gets the scalar type name for a value.
 */
function getScalarTypeName(value: unknown): string {
  if (typeof value === 'string') return 'string';
  if (typeof value === 'number') return 'number';
  if (typeof value === 'bigint') return 'bigint';
  if (typeof value === 'boolean') return 'boolean';
  if (value instanceof Date) return 'Date';
  if (value instanceof URL) return 'URL';
  if (value instanceof ArrayBuffer) return 'ArrayBuffer';
  // Check for immutable types
  if (typeof value === 'object' && value !== null) {
    if ('toDate' in value) return 'Date';
    if ('href' in value) return 'URL';
    if ('toArrayBuffer' in value) return 'ArrayBuffer';
  }
  return 'unknown';
}

/**
 * Serializes a scalar value for JSONB storage.
 */
function serializeScalarForJsonb(value: unknown): unknown {
  if (typeof value === 'bigint') {
    return value.toString();
  }
  if (value instanceof Date) {
    return value.toISOString();
  }
  if (value instanceof URL) {
    return value.href;
  }
  if (value instanceof ArrayBuffer) {
    // Base64 encode
    return Buffer.from(value).toString('base64');
  }
  // Check for immutable types
  if (typeof value === 'object' && value !== null) {
    if ('toDate' in value) {
      return (value as { toDate(): Date }).toDate().toISOString();
    }
    if ('href' in value) {
      return (value as { href: string }).href;
    }
    if ('toArrayBuffer' in value) {
      const buf = (value as { toArrayBuffer(): ArrayBuffer }).toArrayBuffer();
      return Buffer.from(buf).toString('base64');
    }
  }
  return value;
}

/**
 * Deserializes a scalar value based on its type name.
 */
function deserializeScalarByType(value: unknown, typeName: string): unknown {
  switch (typeName) {
    case 'string':
      return String(value);
    case 'number':
      return Number(value);
    case 'bigint':
      return BigInt(value as string);
    case 'boolean':
      return Boolean(value);
    case 'Date':
      return new Date(value as string);
    case 'URL':
      return new URL(value as string);
    case 'ArrayBuffer':
      // Base64 decode
      return Buffer.from(value as string, 'base64').buffer;
    default:
      return value;
  }
}
