/**
 * Unified numeric operations for number, bigint, and decimal types.
 *
 * Provides comparison and validation functions that work across all
 * Propane numeric types, using native JS operators for number/bigint
 * and string-based comparison for decimal values.
 */

import {
  type AnyDecimal,
  assertDecimal,
  decimalCompare,
  decimalIsPositive,
  decimalIsNegative,
  decimalIsZero,
  decimalIsNonNegative,
  decimalIsNonPositive,
  decimalInRange,
  decimalInRangeExclusive,
  type ComparisonResult,
} from './decimal.js';

/**
 * Type for any numeric value: number, bigint, or decimal.
 * Used as the constraint for numeric validators like `Positive<T extends numeric>`.
 */
export type numeric = number | bigint | AnyDecimal;

// -----------------------------------------------------------------------------
// Core Comparison
// -----------------------------------------------------------------------------

/**
 * Compare two numeric values.
 *
 * @param a - First value (number, bigint, or decimal string)
 * @param b - Second value (number, bigint, or decimal string)
 * @returns -1 if a < b, 0 if a === b, 1 if a > b
 *
 * @example
 * ```typescript
 * compare(10, 5);           // 1
 * compare(5n, 10n);         // -1
 * compare('10.50', '10.5'); // 0
 * ```
 */
export function compare(a: numeric, b: numeric): ComparisonResult {
  // If either is a string (decimal), convert both to strings and use decimal comparison
  if (typeof a === 'string' || typeof b === 'string') {
    const aStr = typeof a === 'string' ? assertDecimal(a) : assertDecimal(a.toString());
    const bStr = typeof b === 'string' ? assertDecimal(b) : assertDecimal(b.toString());
    return decimalCompare(aStr, bStr);
  }

  // Both are number - use native comparison
  if (typeof a === 'number' && typeof b === 'number') {
    if (a < b) return -1;
    if (a > b) return 1;
    return 0;
  }

  // Both are bigint - use native comparison
  if (typeof a === 'bigint' && typeof b === 'bigint') {
    if (a < b) return -1;
    if (a > b) return 1;
    return 0;
  }

  // Mixed number and bigint - convert to string for precise comparison
  const aStr = assertDecimal(a.toString());
  const bStr = assertDecimal(b.toString());
  return decimalCompare(aStr, bStr);
}

// -----------------------------------------------------------------------------
// Binary Comparisons
// -----------------------------------------------------------------------------

/**
 * Check if two numeric values are equal.
 */
export function equals(a: numeric, b: numeric): boolean {
  return compare(a, b) === 0;
}

/**
 * Check if a numeric value is greater than another.
 */
export function greaterThan(a: numeric, b: numeric): boolean {
  return compare(a, b) === 1;
}

/**
 * Check if a numeric value is greater than or equal to another.
 */
export function greaterThanOrEqual(a: numeric, b: numeric): boolean {
  return compare(a, b) >= 0;
}

/**
 * Check if a numeric value is less than another.
 */
export function lessThan(a: numeric, b: numeric): boolean {
  return compare(a, b) === -1;
}

/**
 * Check if a numeric value is less than or equal to another.
 */
export function lessThanOrEqual(a: numeric, b: numeric): boolean {
  return compare(a, b) <= 0;
}

// -----------------------------------------------------------------------------
// Sign Checks
// -----------------------------------------------------------------------------

/**
 * Check if a numeric value is positive (greater than zero).
 *
 * @example
 * ```typescript
 * isPositive(10);       // true
 * isPositive(0);        // false
 * isPositive(-5n);      // false
 * isPositive('0.01');   // true
 * ```
 */
export function isPositive(value: numeric): boolean {
  if (typeof value === 'string') {
    return decimalIsPositive(assertDecimal(value));
  }
  return value > 0;
}

/**
 * Check if a numeric value is negative (less than zero).
 *
 * @example
 * ```typescript
 * isNegative(-10);      // true
 * isNegative(0);        // false
 * isNegative(5n);       // false
 * isNegative('-0.01');  // true
 * ```
 */
export function isNegative(value: numeric): boolean {
  if (typeof value === 'string') {
    return decimalIsNegative(assertDecimal(value));
  }
  return value < 0;
}

/**
 * Check if a numeric value is zero.
 *
 * @example
 * ```typescript
 * isZero(0);        // true
 * isZero(0n);       // true
 * isZero('0.00');   // true
 * isZero('-0');     // true
 * isZero(0.01);     // false
 * ```
 */
export function isZero(value: numeric): boolean {
  if (typeof value === 'string') {
    return decimalIsZero(assertDecimal(value));
  }
  return value === 0 || value === 0n;
}

/**
 * Check if a numeric value is non-negative (greater than or equal to zero).
 *
 * @example
 * ```typescript
 * isNonNegative(10);      // true
 * isNonNegative(0);       // true
 * isNonNegative(-5n);     // false
 * isNonNegative('0.00');  // true
 * ```
 */
export function isNonNegative(value: numeric): boolean {
  if (typeof value === 'string') {
    return decimalIsNonNegative(assertDecimal(value));
  }
  return value >= 0;
}

/**
 * Check if a numeric value is non-positive (less than or equal to zero).
 *
 * @example
 * ```typescript
 * isNonPositive(-10);     // true
 * isNonPositive(0);       // true
 * isNonPositive(5n);      // false
 * isNonPositive('-0.01'); // true
 * ```
 */
export function isNonPositive(value: numeric): boolean {
  if (typeof value === 'string') {
    return decimalIsNonPositive(assertDecimal(value));
  }
  return value <= 0;
}

// -----------------------------------------------------------------------------
// Range Checks
// -----------------------------------------------------------------------------

/**
 * Check if a numeric value is within a range (inclusive).
 *
 * @param value - The value to check
 * @param min - Minimum value (inclusive)
 * @param max - Maximum value (inclusive)
 *
 * @example
 * ```typescript
 * inRange(50, 0, 100);           // true
 * inRange(0, 0, 100);            // true (min is inclusive)
 * inRange(100n, 0n, 100n);       // true (max is inclusive)
 * inRange('50.00', '0', '100');  // true
 * inRange(101, 0, 100);          // false
 * ```
 */
export function inRange(value: numeric, min: numeric, max: numeric): boolean {
  // If any is a string, use decimal comparison for all
  if (typeof value === 'string' || typeof min === 'string' || typeof max === 'string') {
    const vStr = typeof value === 'string' ? assertDecimal(value) : assertDecimal(value.toString());
    const minStr = typeof min === 'string' ? assertDecimal(min) : assertDecimal(min.toString());
    const maxStr = typeof max === 'string' ? assertDecimal(max) : assertDecimal(max.toString());
    return decimalInRange(vStr, minStr, maxStr);
  }

  // All are number or bigint
  return greaterThanOrEqual(value, min) && lessThanOrEqual(value, max);
}

/**
 * Check if a numeric value is within a range (exclusive).
 *
 * @param value - The value to check
 * @param min - Minimum value (exclusive)
 * @param max - Maximum value (exclusive)
 *
 * @example
 * ```typescript
 * inRangeExclusive(50, 0, 100);           // true
 * inRangeExclusive(0, 0, 100);            // false (min is exclusive)
 * inRangeExclusive(100n, 0n, 100n);       // false (max is exclusive)
 * inRangeExclusive('0.01', '0', '100');   // true
 * ```
 */
export function inRangeExclusive(value: numeric, min: numeric, max: numeric): boolean {
  // If any is a string, use decimal comparison for all
  if (typeof value === 'string' || typeof min === 'string' || typeof max === 'string') {
    const vStr = typeof value === 'string' ? assertDecimal(value) : assertDecimal(value.toString());
    const minStr = typeof min === 'string' ? assertDecimal(min) : assertDecimal(min.toString());
    const maxStr = typeof max === 'string' ? assertDecimal(max) : assertDecimal(max.toString());
    return decimalInRangeExclusive(vStr, minStr, maxStr);
  }

  // All are number or bigint
  return greaterThan(value, min) && lessThan(value, max);
}

// -----------------------------------------------------------------------------
// Integer Check
// -----------------------------------------------------------------------------

/**
 * Check if a numeric value is an integer.
 *
 * - For `number`: uses `Number.isInteger()`
 * - For `bigint`: always true (bigints are always integers)
 * - For `decimal`: checks if the decimal part is all zeros
 *
 * @example
 * ```typescript
 * isInteger(42);        // true
 * isInteger(42.5);      // false
 * isInteger(42n);       // true
 * isInteger('42.00');   // true
 * isInteger('42.50');   // false
 * ```
 */
export function isInteger(value: numeric): boolean {
  if (typeof value === 'bigint') {
    return true;
  }

  if (typeof value === 'number') {
    return Number.isInteger(value);
  }

  // String (decimal) - check if decimal part is all zeros
  const dotIndex = value.indexOf('.');
  if (dotIndex === -1) {
    return true; // No decimal point = integer
  }

  const decimalPart = value.slice(dotIndex + 1);
  return decimalPart.replace(/0/g, '').length === 0;
}
