/**
 * Decimal type and operations for Propane database storage.
 *
 * Provides functions for working with decimal values that map to
 * PostgreSQL NUMERIC(P,S) and preserve exact decimal precision
 * using string representation.
 */

/**
 * Fixed-precision decimal type.
 *
 * At runtime, decimal values are represented as strings to preserve
 * exact precision (avoiding floating-point errors).
 *
 * @typeParam P - Precision (total number of digits)
 * @typeParam S - Scale (digits after decimal point)
 *
 * SQL: NUMERIC(P, S)
 *
 * @example
 * ```typescript
 * '1:price': decimal<10, 2>;      // Up to 99999999.99
 * '2:latitude': decimal<9, 6>;    // Up to 999.999999
 * '3:percentage': decimal<5, 2>;  // Up to 999.99
 * ```
 */
export type decimal<P extends number, S extends number> = string & {
  readonly __decimal: unique symbol;
  readonly __precision: P;
  readonly __scale: S;
};

/**
 * Type for any decimal value regardless of precision and scale.
 * Use this when you need to accept decimals without caring about specific P,S values.
 */
export type AnyDecimal = decimal<number, number>;

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
  // Validate precision and scale are positive integers
  if (!Number.isInteger(precision) || precision < 1) {
    throw new RangeError(`Invalid decimal precision: ${precision} (must be a positive integer)`);
  }
  if (!Number.isInteger(scale) || scale < 0) {
    throw new RangeError(`Invalid decimal scale: ${scale} (must be a non-negative integer)`);
  }
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

// -----------------------------------------------------------------------------
// Decimal Comparison Functions
// -----------------------------------------------------------------------------

/** Result of comparing two decimals: -1 (a < b), 0 (a === b), 1 (a > b) */
export type ComparisonResult = -1 | 0 | 1;

/**
 * Compare absolute values of two non-negative decimal strings.
 * Assumes inputs are valid decimal format without negative sign.
 */
function compareAbsolute(a: string, b: string): ComparisonResult {
  const [aInt, aDec = ''] = a.split('.');
  const [bInt, bDec = ''] = b.split('.');

  // Normalize integer parts by removing leading zeros
  const aNormInt = aInt?.replace(/^0+/, '') || '0';
  const bNormInt = bInt?.replace(/^0+/, '') || '0';

  // Compare integer part lengths first (longer = larger)
  if (aNormInt.length > bNormInt.length) return 1;
  if (aNormInt.length < bNormInt.length) return -1;

  // Same length - compare lexicographically
  if (aNormInt > bNormInt) return 1;
  if (aNormInt < bNormInt) return -1;

  // Integer parts are equal - compare decimal parts
  // Pad to same length for fair comparison
  const maxDecLen = Math.max(aDec.length, bDec.length);
  const aPaddedDec = aDec.padEnd(maxDecLen, '0');
  const bPaddedDec = bDec.padEnd(maxDecLen, '0');

  if (aPaddedDec > bPaddedDec) return 1;
  if (aPaddedDec < bPaddedDec) return -1;

  return 0;
}

/**
 * Compare two decimal values.
 *
 * @param a - First decimal value
 * @param b - Second decimal value
 * @returns -1 if a < b, 0 if a === b, 1 if a > b
 *
 * @example
 * ```typescript
 * decimalCompare(price1, price2);   // 0 (equal)
 * decimalCompare(amount, limit);    // 1 (a > b)
 * ```
 */
export function decimalCompare(a: AnyDecimal, b: AnyDecimal): ComparisonResult {
  const aIsNegative = a.startsWith('-');
  const bIsNegative = b.startsWith('-');

  // Get absolute values
  const aAbs = aIsNegative ? a.slice(1) : a;
  const bAbs = bIsNegative ? b.slice(1) : b;

  // Check if either is zero (treat -0 as 0)
  const aIsZero = isZeroString(aAbs);
  const bIsZero = isZeroString(bAbs);

  // Both zero (including -0 vs 0)
  if (aIsZero && bIsZero) return 0;

  // Effective signs (zero is neither positive nor negative)
  const aEffectiveNegative = aIsNegative && !aIsZero;
  const bEffectiveNegative = bIsNegative && !bIsZero;

  // Different effective signs: negative < positive
  if (aEffectiveNegative && !bEffectiveNegative) return -1;
  if (!aEffectiveNegative && bEffectiveNegative) return 1;

  // Same effective sign - compare absolute values
  const absComparison = compareAbsolute(aAbs, bAbs);

  // If both negative, reverse the comparison
  if (aEffectiveNegative && absComparison !== 0) {
    return absComparison === 1 ? -1 : 1;
  }

  return absComparison;
}

/**
 * Check if an absolute value string represents zero.
 */
function isZeroString(absValue: string): boolean {
  return absValue.replace(/[.0]/g, '').length === 0;
}

/**
 * Check if two decimal values are equal.
 *
 * @example
 * ```typescript
 * decimalEquals(price1, price2);   // true if equal
 * ```
 */
export function decimalEquals(a: AnyDecimal, b: AnyDecimal): boolean {
  return decimalCompare(a, b) === 0;
}

/**
 * Check if a decimal value is greater than another.
 */
export function decimalGreaterThan(a: AnyDecimal, b: AnyDecimal): boolean {
  return decimalCompare(a, b) === 1;
}

/**
 * Check if a decimal value is greater than or equal to another.
 */
export function decimalGreaterThanOrEqual(a: AnyDecimal, b: AnyDecimal): boolean {
  return decimalCompare(a, b) >= 0;
}

/**
 * Check if a decimal value is less than another.
 */
export function decimalLessThan(a: AnyDecimal, b: AnyDecimal): boolean {
  return decimalCompare(a, b) === -1;
}

/**
 * Check if a decimal value is less than or equal to another.
 */
export function decimalLessThanOrEqual(a: AnyDecimal, b: AnyDecimal): boolean {
  return decimalCompare(a, b) <= 0;
}

// -----------------------------------------------------------------------------
// Decimal Sign Check Functions
// -----------------------------------------------------------------------------

/**
 * Check if a decimal value is positive (greater than zero).
 */
export function decimalIsPositive(value: AnyDecimal): boolean {
  // Negative values are not positive
  if (value.startsWith('-')) return false;

  // Check if it's zero (all digits are 0)
  const withoutSign = value.replace(/^-/, '');
  const normalized = withoutSign.replace(/[.0]/g, '');
  return normalized.length > 0;
}

/**
 * Check if a decimal value is negative (less than zero).
 */
export function decimalIsNegative(value: AnyDecimal): boolean {
  if (!value.startsWith('-')) return false;

  // Check if it's negative zero (treat as not negative)
  const withoutSign = value.slice(1);
  const normalized = withoutSign.replace(/[.0]/g, '');
  return normalized.length > 0;
}

/**
 * Check if a decimal value is zero.
 */
export function decimalIsZero(value: AnyDecimal): boolean {
  const withoutSign = value.replace(/^-/, '');
  const normalized = withoutSign.replace(/[.0]/g, '');
  return normalized.length === 0;
}

/**
 * Check if a decimal value is non-negative (>= zero).
 */
export function decimalIsNonNegative(value: AnyDecimal): boolean {
  return !decimalIsNegative(value);
}

/**
 * Check if a decimal value is non-positive (<= zero).
 */
export function decimalIsNonPositive(value: AnyDecimal): boolean {
  return !decimalIsPositive(value);
}

/**
 * Strict validation: checks if value is already in normalized decimal form.
 *
 * Requires exact scale match (e.g., '100.00' for scale 2, not '100').
 * Only accepts strings (normalized decimal values are always strings).
 *
 * Use this for validating stored/normalized values.
 * For validating user input before normalization, use `canBeDecimal`.
 *
 * @param value - The value to check
 * @param precision - Total number of significant digits (P in NUMERIC(P,S))
 * @param scale - Number of digits after the decimal point (S in NUMERIC(P,S))
 * @returns true if the value is a valid normalized decimal string
 *
 * @example
 * ```typescript
 * isDecimal('123.45', 10, 2);      // true: exact scale match
 * isDecimal('100.00', 10, 2);      // true: exact scale match
 * isDecimal('100', 10, 2);         // false: missing decimal places
 * isDecimal('100.0', 10, 2);       // false: wrong scale (1 != 2)
 * isDecimal(100, 10, 2);           // false: must be a string
 * ```
 */
export function isDecimal(value: unknown, precision: number, scale: number): boolean {
  // Must be a string (normalized decimals are always strings)
  if (typeof value !== 'string') {
    return false;
  }

  // Validate precision and scale
  if (!Number.isInteger(precision) || precision < 1) {
    return false;
  }
  if (!Number.isInteger(scale) || scale < 0) {
    return false;
  }
  if (scale > precision) {
    return false;
  }

  // Validate format
  if (!/^-?\d+(\.\d+)?$/.test(value)) {
    return false;
  }

  // Parse parts
  const isNegative = value.startsWith('-');
  const absolute = isNegative ? value.slice(1) : value;
  const parts = absolute.split('.');
  const integerPart = parts[0] ?? '0';
  const decimalPart = parts[1] ?? '';

  // Strict scale check: exact match required
  if (decimalPart.length !== scale) {
    return false;
  }

  // Count significant digits (exclude leading zeros from integer part)
  const trimmedInteger = integerPart.replace(/^0+/, '') || '0';
  const totalDigits = trimmedInteger === '0' && decimalPart.length > 0
    ? decimalPart.replace(/^0+/, '').length  // For 0.00123, count significant decimal digits
    : trimmedInteger.length + decimalPart.length;

  // Check precision (total significant digits)
  if (totalDigits > precision) {
    return false;
  }

  return true;
}

/**
 * Lenient validation: checks if value CAN BE converted to the decimal type.
 *
 * Accepts string | number to match toDecimal()'s input type.
 * - Numbers: validates precision after rounding to scale (mirrors toDecimal behavior)
 * - Strings: accepts fewer decimal places (e.g., '100' for scale 2 is valid)
 *
 * Use this for validating user input before normalization (runtime brand validation,
 * compile-time bound validation).
 * For validating already-normalized values, use `isDecimal`.
 *
 * @param value - The value to check
 * @param precision - Total number of significant digits (P in NUMERIC(P,S))
 * @param scale - Number of digits after the decimal point (S in NUMERIC(P,S))
 * @returns true if the value can be converted to a valid decimal
 *
 * @example
 * ```typescript
 * canBeDecimal(100, 10, 2);        // true: number accepted
 * canBeDecimal('100', 10, 2);      // true: fewer decimal places OK
 * canBeDecimal('100.00', 10, 2);   // true: exact scale OK
 * canBeDecimal('100.0', 10, 2);    // true: fewer decimal places OK
 * canBeDecimal('100.123', 10, 2);  // false: too many decimal places
 * canBeDecimal(Infinity, 10, 2);   // false: not finite
 * ```
 */
export function canBeDecimal(value: unknown, precision: number, scale: number): boolean {
  // Validate precision and scale
  if (!Number.isInteger(precision) || precision < 1) {
    return false;
  }
  if (!Number.isInteger(scale) || scale < 0) {
    return false;
  }
  if (scale > precision) {
    return false;
  }

  // Accept numbers (will be rounded by toDecimal)
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) {
      return false;
    }
    // Convert to string to check precision (mirrors toDecimal logic)
    const str = value.toFixed(scale);
    // Parse and check precision on the converted string
    const isNegative = str.startsWith('-');
    const absolute = isNegative ? str.slice(1) : str;
    const parts = absolute.split('.');
    const integerPart = parts[0] ?? '0';
    const decimalPart = parts[1] ?? '';

    // Count significant digits
    const trimmedInteger = integerPart.replace(/^0+/, '') || '0';
    const totalDigits = trimmedInteger === '0' && decimalPart.length > 0
      ? decimalPart.replace(/^0+/, '').length
      : trimmedInteger.length + decimalPart.length;

    return totalDigits <= precision;
  }

  // Accept strings with lenient scale check
  if (typeof value === 'string') {
    // Validate format
    if (!/^-?\d+(\.\d+)?$/.test(value)) {
      return false;
    }

    // Parse parts
    const isNegative = value.startsWith('-');
    const absolute = isNegative ? value.slice(1) : value;
    const parts = absolute.split('.');
    const integerPart = parts[0] ?? '0';
    const decimalPart = parts[1] ?? '';

    // Lenient scale check: allows fewer digits
    if (decimalPart.length > scale) {
      return false;
    }

    // Count significant digits (exclude leading zeros from integer part)
    const trimmedInteger = integerPart.replace(/^0+/, '') || '0';
    const totalDigits = trimmedInteger === '0' && decimalPart.length > 0
      ? decimalPart.replace(/^0+/, '').length
      : trimmedInteger.length + decimalPart.length;

    // Check precision
    return totalDigits <= precision;
  }

  return false;
}

/**
 * Check if a string is a valid decimal format.
 *
 * This is a simple format check without precision/scale validation.
 * Use this for build-time validation of decimal string literals.
 *
 * @param value - The string to check
 * @returns true if the string is a valid decimal format
 *
 * @example
 * ```typescript
 * isValidDecimalString('123.45');   // true
 * isValidDecimalString('-100.00');  // true
 * isValidDecimalString('100');      // true
 * isValidDecimalString('abc');      // false
 * isValidDecimalString('1.2.3');    // false
 * isValidDecimalString('');         // false
 * ```
 */
export function isValidDecimalString(value: string): boolean {
  return /^-?\d+(\.\d+)?$/.test(value);
}

// -----------------------------------------------------------------------------
// Decimal Range Check Functions
// -----------------------------------------------------------------------------

/**
 * Check if a decimal value is within a range (inclusive).
 *
 * @param value - The value to check
 * @param min - Minimum value (inclusive)
 * @param max - Maximum value (inclusive)
 */
export function decimalInRange(value: AnyDecimal, min: AnyDecimal, max: AnyDecimal): boolean {
  return decimalGreaterThanOrEqual(value, min) && decimalLessThanOrEqual(value, max);
}

/**
 * Check if a decimal value is within a range (exclusive).
 *
 * @param value - The value to check
 * @param min - Minimum value (exclusive)
 * @param max - Maximum value (exclusive)
 */
export function decimalInRangeExclusive(value: AnyDecimal, min: AnyDecimal, max: AnyDecimal): boolean {
  return decimalGreaterThan(value, min) && decimalLessThan(value, max);
}
