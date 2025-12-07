/**
 * Core scalar types for Propane database storage.
 *
 * These are branded types that represent specific database column types.
 * At runtime, they are just regular JavaScript values (number/string),
 * but the type system tracks the intended storage format.
 */

import type { Brand } from '../types/brand.js';

/**
 * Module-scoped namespace symbol for scalar type brands.
 * Ensures these types are unique even if same tag is used elsewhere.
 */
declare const unused_scalars_ns: unique symbol;
type unused_$ns = typeof unused_scalars_ns;

/**
 * A 32-bit signed integer.
 *
 * - PostgreSQL: INTEGER
 * - JavaScript: number
 * - Java: int
 * - C++: int32_t
 * - Protocol Buffers: int32
 *
 * Range: -2,147,483,648 to 2,147,483,647
 *
 * @example
 * ```typescript
 * export type Product = {
 *   '1:id': PK<bigint>;
 *   '2:quantity': int32;
 * };
 * ```
 */
export type int32 = Brand<number, 'int32', typeof unused_scalars_ns>;

/**
 * A fixed-precision decimal number.
 *
 * - PostgreSQL: NUMERIC(P,S)
 * - JavaScript: string (to preserve precision)
 * - Java: BigDecimal
 * - C++: std::string
 * - Protocol Buffers: string
 *
 * @typeParam P - Precision (total number of digits)
 * @typeParam S - Scale (digits after decimal point)
 *
 * @example
 * ```typescript
 * export type Account = {
 *   '1:id': PK<bigint>;
 *   '2:balance': decimal<12, 2>;  // Up to 12 digits, 2 after decimal
 * };
 * ```
 */
export type decimal<P extends number, S extends number> = Brand<string, 'decimal', typeof unused_scalars_ns> & {
  readonly __precision: P;
  readonly __scale: S;
};

/**
 * Helper to create an int32 value at runtime.
 * Validates that the value is within the 32-bit signed integer range.
 */
export function toInt32(value: number): int32 {
  if (!Number.isInteger(value)) {
    throw new TypeError(`int32 value must be an integer, got: ${value}`);
  }
  if (value < -2_147_483_648 || value > 2_147_483_647) {
    throw new RangeError(`int32 value out of range: ${value}`);
  }
  return value as int32;
}

/**
 * Helper to create a decimal value at runtime.
 * The value should be passed as a string to preserve precision.
 */
export function toDecimal<P extends number, S extends number>(
  value: string | number
): decimal<P, S> {
  const str = typeof value === 'number' ? value.toString() : value;
  // Basic validation - ensure it looks like a number
  if (!/^-?\d+(\.\d+)?$/.test(str)) {
    throw new TypeError(`Invalid decimal value: ${str}`);
  }
  return str as decimal<P, S>;
}
