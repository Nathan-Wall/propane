/**
 * Fixed-precision decimal type for Propane database storage.
 *
 * Provides a branded type that maps to PostgreSQL NUMERIC(P,S) and
 * preserves exact decimal precision using string representation.
 */

import type { Brand } from '../types/brand.js';

/**
 * Module-scoped namespace symbol for decimal type brand.
 */
declare const unused_decimal_ns: unique symbol;

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
export type decimal<P extends number, S extends number> = Brand<string, 'decimal', typeof unused_decimal_ns> & {
  readonly __precision: P;
  readonly __scale: S;
};

/**
 * Helper to create a decimal value at runtime.
 * Validates that the value fits within the specified precision and scale.
 *
 * When a `number` is passed, it is rounded to the specified scale (since
 * floating-point values are inherently imprecise). When a `string` is passed,
 * it must exactly fit the scale (no rounding is applied).
 *
 * @param precision - Total number of significant digits (P in NUMERIC(P,S))
 * @param scale - Number of digits after the decimal point (S in NUMERIC(P,S))
 * @param value - The numeric value as string or number
 * @returns A branded decimal value
 *
 * @example
 * ```typescript
 * const price = toDecimal(10, 2, '123.45');     // OK: 5 digits, 2 after decimal
 * const big = toDecimal(10, 2, '12345678.90'); // OK: 10 digits total
 * const third = toDecimal(10, 2, 1/3);         // OK: rounds to '0.33'
 * toDecimal(10, 2, '123456789.00');            // Error: 11 digits exceeds precision
 * toDecimal(10, 2, '123.456');                 // Error: 3 decimal places exceeds scale
 * ```
 */
export function toDecimal<P extends number, S extends number>(
  precision: P,
  scale: S,
  value: string | number
): decimal<P, S> {
  // Validate scale <= precision
  if (scale > precision) {
    throw new RangeError(
      `Invalid decimal specification: scale (${scale}) cannot exceed precision (${precision})`
    );
  }

  // For numbers, round to scale before converting to string
  // This handles floating-point imprecision (e.g., 1/3 → 0.33 for scale 2)
  let str: string;
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) {
      throw new TypeError(`Invalid decimal value: ${value}`);
    }
    str = value.toFixed(scale);
  } else {
    str = value;
  }

  // Validate format
  if (!/^-?\d+(\.\d+)?$/.test(str)) {
    throw new TypeError(`Invalid decimal value: ${str}`);
  }

  // Parse parts
  const isNegative = str.startsWith('-');
  const absolute = isNegative ? str.slice(1) : str;
  const parts = absolute.split('.');
  const integerPart = parts[0] ?? '0';
  const decimalPart = parts[1] ?? '';

  // Validate scale (digits after decimal point) - only strict for string input
  if (decimalPart.length > scale) {
    throw new RangeError(
      `Decimal scale exceeded: ${decimalPart.length} digits after decimal, maximum is ${scale}`
    );
  }

  // Count significant digits (exclude leading zeros from integer part)
  const trimmedInteger = integerPart.replace(/^0+/, '') || '0';
  const totalDigits = trimmedInteger === '0' && decimalPart.length > 0
    ? decimalPart.replace(/^0+/, '').length  // For 0.00123, count significant decimal digits
    : trimmedInteger.length + decimalPart.length;

  // Validate precision (total significant digits)
  if (totalDigits > precision) {
    throw new RangeError(
      `Decimal precision exceeded: ${totalDigits} significant digits, maximum is ${precision}`
    );
  }

  // Normalize: pad decimal part to match scale
  const normalizedDecimal = decimalPart.padEnd(scale, '0');
  const normalized = scale > 0
    ? `${isNegative ? '-' : ''}${integerPart}.${normalizedDecimal}`
    : `${isNegative ? '-' : ''}${integerPart}`;

  return normalized as decimal<P, S>;
}
