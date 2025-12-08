/**
 * 32-bit signed integer type for Propane database storage.
 *
 * Provides a branded type that maps to PostgreSQL INTEGER and
 * validates values are within the 32-bit signed integer range.
 */

import type { Brand } from '../types/brand.js';

/**
 * Module-scoped namespace symbol for int32 type brand.
 */
declare const unused_int32_ns: unique symbol;

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
export type int32 = Brand<number, 'int32', typeof unused_int32_ns>;

/**
 * Helper to create an int32 value at runtime.
 * Validates that the value is within the 32-bit signed integer range.
 *
 * @param value - The number to convert to int32
 * @returns A branded int32 value
 * @throws TypeError if value is not an integer
 * @throws RangeError if value is outside the 32-bit signed integer range
 *
 * @example
 * ```typescript
 * const quantity = toInt32(42);        // OK
 * const max = toInt32(2147483647);     // OK (max value)
 * toInt32(1.5);                        // Error: not an integer
 * toInt32(3000000000);                 // Error: out of range
 * ```
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
