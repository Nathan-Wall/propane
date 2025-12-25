/**
 * Branded numeric types for database-specific precision.
 *
 * These types provide type-safety and map to specific SQL types.
 */

// Re-export decimal from shared location for cross-package compatibility
export type { decimal } from '@/common/numbers/decimal.js';

/**
 * 32-bit signed integer type.
 *
 * Range: -2,147,483,648 to 2,147,483,647
 * SQL: INTEGER
 *
 * @example
 * ```typescript
 * '1:count': int32;
 * '2:port': int32;
 * ```
 */
export type int32 = number & { readonly __int32: unique symbol };

/**
 * 53-bit signed integer type (safe JavaScript integer range).
 *
 * Range: -9,007,199,254,740,991 to 9,007,199,254,740,991
 * SQL: BIGINT (with range constraint)
 *
 * Use this for large integers that stay within JavaScript's safe integer range.
 * For larger values, use `bigint` instead.
 *
 * @example
 * ```typescript
 * '1:snowflakeId': int53;
 * '2:timestamp': int53;
 * ```
 */
export type int53 = number & { readonly __int53: unique symbol };
