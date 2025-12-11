/**
 * 53-bit signed integer type for safe JavaScript integers.
 *
 * Provides a branded type that represents integers within JavaScript's
 * safe integer range (Number.MIN_SAFE_INTEGER to Number.MAX_SAFE_INTEGER).
 */

import type { Brand } from '../types/brand.js';

/**
 * Module-scoped namespace symbol for int53 type brand.
 */
declare const unused_int53_ns: unique symbol;

/**
 * A safe JavaScript integer (53-bit precision).
 *
 * - PostgreSQL: BIGINT (when value fits in safe range)
 * - JavaScript: number
 * - Java: long (with overflow check)
 * - C++: int64_t (with overflow check)
 *
 * Range: -9,007,199,254,740,991 to 9,007,199,254,740,991
 *
 * This type is useful when you need integers larger than int32 but
 * want to avoid BigInt overhead and maintain JSON compatibility.
 *
 * @example
 * ```typescript
 * export type Event = {
 *   '1:id': bigint;
 *   '2:timestamp': int53;  // Unix timestamp in milliseconds
 * };
 * ```
 */
export type int53 = Brand<number, 'int53', typeof unused_int53_ns>;

/**
 * Helper to create an int53 value at runtime.
 * Validates that the value is within JavaScript's safe integer range.
 *
 * @param value - The number to convert to int53
 * @returns A branded int53 value
 * @throws TypeError if value is not an integer
 * @throws RangeError if value is outside the safe integer range
 *
 * @example
 * ```typescript
 * const timestamp = toInt53(Date.now());           // OK
 * const max = toInt53(Number.MAX_SAFE_INTEGER);    // OK
 * toInt53(1.5);                                    // Error: not an integer
 * toInt53(Number.MAX_SAFE_INTEGER + 1);            // Error: out of range
 * ```
 */
export function toInt53(value: number): int53 {
  if (!Number.isInteger(value)) {
    throw new TypeError(`int53 value must be an integer, got: ${value}`);
  }
  if (value < Number.MIN_SAFE_INTEGER || value > Number.MAX_SAFE_INTEGER) {
    throw new RangeError(`int53 value out of range: ${value}`);
  }
  return value as int53;
}
