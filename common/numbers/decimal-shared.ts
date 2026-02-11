/**
 * Shared helpers for Decimal and Rational.
 */

/**
 * Rounding modes using TC39/Intl.NumberFormat string values.
 */
export enum RoundingMode {
  /** Round ties away from zero. */
  HALF_EXPAND = 'halfExpand',
  /** Round ties to nearest even digit. */
  HALF_EVEN = 'halfEven',
  /** Round ties toward positive infinity. */
  HALF_CEIL = 'halfCeil',
  /** Round ties toward negative infinity. */
  HALF_FLOOR = 'halfFloor',
  /** Round ties toward zero. */
  HALF_TRUNC = 'halfTrunc',
  /** Always round toward zero (truncate). */
  TRUNC = 'trunc',
  /** Always round away from zero. */
  EXPAND = 'expand',
  /** Always round toward negative infinity. */
  FLOOR = 'floor',
  /** Always round toward positive infinity. */
  CEIL = 'ceil',
}

/**
 * Options for parsing decimal strings.
 * All options default to true for permissive parsing.
 */
export interface FromStringOptions {
  /** Allow scientific notation like "1.23e4". */
  allowExponent?: boolean;
  /** Allow grouping separators like "_" or space. */
  allowGrouping?: boolean;
  /** Allow leading/trailing whitespace. */
  allowWhitespace?: boolean;
  /** Allow an explicit leading "+" sign. */
  allowPositiveSign?: boolean;
  /** Allow leading zeros in the integer part. */
  allowLeadingZeros?: boolean;
}

/**
 * Minimum precision (total significant digits).
 */
export const ABSOLUTE_MIN_PRECISION = 1;
/**
 * Maximum precision (total significant digits). Matches PostgreSQL NUMERIC.
 */
export const ABSOLUTE_MAX_PRECISION = 1000;
/**
 * Maximum absolute scale (digits after the decimal point).
 */
export const ABSOLUTE_MAX_SCALE = 1000;
/**
 * Maximum scale difference used to cap intermediate growth.
 */
export const ABSOLUTE_MAX_SCALE_DIFF = 2 * ABSOLUTE_MAX_PRECISION;

/**
 * Maximum digits allowed when parsing Rational strings.
 */
export const MAX_RATIONAL_DIGITS = 3150;

const BITS_PER_DECIMAL_DIGIT = 3.32;
const WORST_CASE_DIGITS = ABSOLUTE_MAX_PRECISION + ABSOLUTE_MAX_SCALE_DIFF;
const WORST_CASE_BITS = Math.ceil(WORST_CASE_DIGITS * BITS_PER_DECIMAL_DIGIT);

/**
 * Trigger Rational reduction when component bit lengths approach this limit.
 */
export const MAX_BITS = Math.ceil(WORST_CASE_BITS * 0.9);
/**
 * Hard cap for Rational component bit lengths after reduction.
 */
export const HARD_CAP_BITS = Math.ceil(WORST_CASE_BITS * 1.05);
/**
 * Perform GCD reduction every N operations for Rational arithmetic.
 */
export const REDUCE_INTERVAL = 64;

const PRECOMPUTED_LIMIT = 42;
const POW10_PRECOMPUTED: bigint[] = [];
for (let i = 0; i <= PRECOMPUTED_LIMIT; i += 1) {
  POW10_PRECOMPUTED[i] = 10n ** BigInt(i);
}
const POW10_LAZY = new Map<number, bigint>();

/**
 * Compute 10^k with caching.
 * Throws if k is negative or exceeds ABSOLUTE_MAX_SCALE_DIFF.
 */
export function pow10(k: number): bigint {
  if (!Number.isInteger(k) || k < 0 || k > ABSOLUTE_MAX_SCALE_DIFF) {
    throw new RangeError(
      `Exponent ${k} must be an integer in range [0, ${ABSOLUTE_MAX_SCALE_DIFF}]`
    );
  }
  if (k <= PRECOMPUTED_LIMIT) {
    return POW10_PRECOMPUTED[k]!;
  }
  let cached = POW10_LAZY.get(k);
  if (cached === undefined) {
    cached = 10n ** BigInt(k);
    POW10_LAZY.set(k, cached);
  }
  return cached;
}

/**
 * Scale a bigint by 10^scale, returning quotient and remainder for division.
 */
export function scaleByPow10(
  value: bigint,
  scale: number
): { result: bigint; remainder: bigint } {
  if (scale === 0) {
    return { result: value, remainder: 0n };
  }
  if (scale > 0) {
    const divisor = pow10(scale);
    return { result: value / divisor, remainder: value % divisor };
  }
  const multiplier = pow10(-scale);
  return { result: value * multiplier, remainder: 0n };
}

/**
 * Validate precision and scale constraints.
 * Precision is total significant digits, scale is digits after the decimal point.
 */
export function ensureValidPrecisionScale(
  precision: number,
  scale: number
): void {
  if (!Number.isInteger(precision)) {
    throw new RangeError(`Precision must be an integer, got ${precision}`);
  }
  if (!Number.isInteger(scale)) {
    throw new RangeError(`Scale must be an integer, got ${scale}`);
  }
  if (
    precision < ABSOLUTE_MIN_PRECISION
    || precision > ABSOLUTE_MAX_PRECISION
  ) {
    throw new RangeError(
      `Precision ${precision} out of range [${ABSOLUTE_MIN_PRECISION}, ${ABSOLUTE_MAX_PRECISION}]`
    );
  }
  if (scale < -ABSOLUTE_MAX_SCALE || scale > ABSOLUTE_MAX_SCALE) {
    throw new RangeError(
      `Scale ${scale} out of range [-${ABSOLUTE_MAX_SCALE}, ${ABSOLUTE_MAX_SCALE}]`
    );
  }
}

/**
 * Validate that a mantissa fits within the given precision.
 */
export function ensureMantissaFitsPrecision(
  precision: number,
  scale: number,
  mantissa: bigint
): void {
  const maxMantissa = pow10(precision);
  const absMantissa = absBigInt(mantissa);
  if (absMantissa >= maxMantissa) {
    throw new DecimalOverflowError(precision, scale);
  }
}

/**
 * Absolute value for bigint.
 */
export function absBigInt(value: bigint): bigint {
  return value < 0n ? -value : value;
}

/**
 * Coerce a safe integer to bigint with consistent error messages.
 */
export function toBigIntSafeInteger(
  value: number | bigint,
  options?: { context?: string; label?: string }
): bigint {
  if (typeof value === 'bigint') {
    return value;
  }
  if (!Number.isFinite(value) || !Number.isInteger(value)) {
    if (options?.label) {
      throw new TypeError(`${options.label} must be a safe integer, got ${value}`);
    }
    if (options?.context) {
      throw new TypeError(`${options.context}: expected integer, got ${value}`);
    }
    throw new TypeError(`Expected integer, got ${value}`);
  }
  if (!Number.isSafeInteger(value)) {
    if (options?.label) {
      throw new TypeError(`${options.label} must be a safe integer, got ${value}`);
    }
    if (options?.context) {
      throw new TypeError(
        `${options.context}: integer ${value} exceeds safe integer range; use bigint`
      );
    }
    throw new TypeError(`Integer ${value} exceeds safe integer range; use bigint`);
  }
  return BigInt(value);
}

/**
 * Compute the bit length of a bigint without string conversion.
 */
export function bitLength(value: bigint): number {
  if (value === 0n) return 0;
  let n = value < 0n ? -value : value;
  let bits = 0;
  while (n >= 0x1_00_00_00_00_00_00_00_00n) {
    n >>= 64n;
    bits += 64;
  }
  while (n >= 0x1_00_00_00_00n) {
    n >>= 32n;
    bits += 32;
  }
  bits += 32 - Math.clz32(Number(n));
  return bits;
}

/**
 * Binary GCD (Stein's algorithm) for bigint.
 */
export function gcdBigInt(a: bigint, b: bigint): bigint {
  if (a === 0n) return b < 0n ? -b : b;
  if (b === 0n) return a < 0n ? -a : a;
  let x = a < 0n ? -a : a;
  let y = b < 0n ? -b : b;
  let shift = 0n;
  while (((x | y) & 1n) === 0n) {
    x >>= 1n;
    y >>= 1n;
    shift += 1n;
  }
  while ((x & 1n) === 0n) x >>= 1n;

  do {
    while ((y & 1n) === 0n) y >>= 1n;
    if (x > y) {
      const tmp = x;
      x = y;
      y = tmp;
    }
    y -= x;
  } while (y !== 0n);

  return x << shift;
}

/**
 * Error thrown when a Decimal exceeds its precision constraints.
 */
export class DecimalOverflowError extends RangeError {
  override readonly name = 'DecimalOverflowError';
  readonly precision: number;
  readonly scale: number;
  readonly actualDigits?: number;

  constructor(
    precision: number,
    scale: number,
    options?: { actualDigits?: number; message?: string }
  ) {
    const digits = options?.actualDigits;
    const message = options?.message ?? (
      digits === undefined
        ? `Value exceeds precision ${precision}`
        : `Value has ${digits} digits, exceeds precision ${precision}`
    );
    super(message);
    this.precision = precision;
    this.scale = scale;
    this.actualDigits = digits;
  }
}

/**
 * Error thrown when an operation would be inexact without rounding.
 */
export class DecimalInexactError extends RangeError {
  override readonly name = 'DecimalInexactError';
  readonly operation: string;
  readonly targetPrecision?: number;
  readonly targetScale?: number;
  readonly sourceDescription?: string;

  constructor(
    operation: string,
    options?: {
      message?: string;
      targetPrecision?: number;
      targetScale?: number;
      sourceDescription?: string;
    }
  ) {
    const message = options?.message
      ?? `Inexact result: rounding mode required for ${operation}`;
    super(message);
    this.operation = operation;
    this.targetPrecision = options?.targetPrecision;
    this.targetScale = options?.targetScale;
    this.sourceDescription = options?.sourceDescription;
  }
}

/**
 * Error thrown for division by zero in Decimal or Rational operations.
 */
export class DecimalDivisionByZeroError extends RangeError {
  override readonly name = 'DecimalDivisionByZeroError';
  readonly operation: string;

  constructor(operation = 'divide', message?: string) {
    super(message ?? `Division by zero in ${operation}`);
    this.operation = operation;
  }
}

/**
 * Error thrown when a Rational exceeds its hard size limit.
 */
export class RationalOverflowError extends RangeError {
  override readonly name = 'RationalOverflowError';
  readonly numeratorBits: number;
  readonly denominatorBits: number;
  readonly maxBits: number;

  constructor(numeratorBits: number, denominatorBits: number) {
    const maxBits = Math.max(numeratorBits, denominatorBits);
    super(
      `Rational overflow: max component has ${maxBits} bits `
      + `(numerator: ${numeratorBits}, denominator: ${denominatorBits}), `
      + `exceeds limit ${HARD_CAP_BITS}`
    );
    this.numeratorBits = numeratorBits;
    this.denominatorBits = denominatorBits;
    this.maxBits = HARD_CAP_BITS;
  }
}

/**
 * Validate that a string input does not exceed a digit limit.
 */
export function validateDigitLength(
  input: string,
  max: number,
  context: string
): void {
  const digitCount = countDigits(input);
  if (digitCount > max) {
    throw new RangeError(
      `${context}: digit count ${digitCount} exceeds maximum ${max}`
    );
  }
}

/**
 * Count ASCII digits in a string (0-9 only).
 */
export function countDigits(input: string): number {
  return input.replaceAll(/[^0-9]/g, '').length;
}

/**
 * Count decimal digits in a bigint.
 */
export function countBigIntDigits(value: bigint): number {
  const n = value < 0n ? -value : value;
  if (n === 0n) return 1;
  return n.toString().length;
}

function normalizeDigits(
  part: string,
  allowGrouping: boolean,
  context: string
): string {
  if (!part) return '';
  if (allowGrouping) {
    const cleaned = part.replaceAll(/[ _]/g, '');
    if (!/^[0-9]+$/.test(cleaned)) {
      throw new SyntaxError(`Invalid ${context} digits: ${part}`);
    }
    return cleaned;
  }
  if (!/^[0-9]+$/.test(part)) {
    throw new SyntaxError(`Invalid ${context} digits: ${part}`);
  }
  return part;
}

type ParseDecimalOptions = FromStringOptions & { allowPlusSign?: boolean };

/**
 * Parse a decimal string into sign, digits, and scale.
 */
export function parseDecimalInput(
  raw: string,
  options: ParseDecimalOptions,
  context: string
): { sign: bigint; digits: string; scale: number } {
  const allowExponent = options.allowExponent ?? true;
  const allowGrouping = options.allowGrouping ?? true;
  const allowWhitespace = options.allowWhitespace ?? true;
  const allowPositiveSign = options.allowPositiveSign
    ?? options.allowPlusSign
    ?? true;
  const allowLeadingZeros = options.allowLeadingZeros ?? true;

  let input = raw;
  if (allowWhitespace) {
    input = input.trim();
  } else if (/\s/.test(input)) {
    throw new SyntaxError(`Invalid ${context} format: whitespace not allowed`);
  }

  if (input.length === 0) {
    throw new SyntaxError(`Invalid ${context} format: empty string`);
  }

  const lower = input.toLowerCase();
  if (
    lower === 'nan'
    || lower === 'infinity'
    || lower === '+infinity'
    || lower === '-infinity'
  ) {
    throw new SyntaxError(`Invalid ${context} format: non-finite value`);
  }

  validateDigitLength(
    input,
    ABSOLUTE_MAX_PRECISION + ABSOLUTE_MAX_SCALE + 2,
    context
  );

  let exponent = 0;
  const expIndex = input.search(/e|E/);
  if (expIndex !== -1) {
    if (!allowExponent) {
      throw new SyntaxError(`Invalid ${context} format: exponent not allowed`);
    }
    const expPart = input.slice(expIndex + 1);
    const base = input.slice(0, expIndex);
    if (!/^[+-]?\d+$/.test(expPart)) {
      throw new SyntaxError(`Invalid ${context} exponent: ${expPart}`);
    }
    exponent = Number.parseInt(expPart, 10);
    if (!Number.isFinite(exponent)) {
      throw new SyntaxError(`Invalid ${context} exponent: ${expPart}`);
    }
    if (Math.abs(exponent) > ABSOLUTE_MAX_SCALE_DIFF) {
      throw new RangeError(
        `Exponent ${exponent} exceeds maximum ${ABSOLUTE_MAX_SCALE_DIFF}`
      );
    }
    input = base;
  }

  let sign = 1n;
  if (input.startsWith('+') || input.startsWith('-')) {
    if (input.startsWith('+')) {
      if (!allowPositiveSign) {
        throw new SyntaxError(`Invalid ${context} format: '+' not allowed`);
      }
    } else {
      sign = -1n;
    }
    input = input.slice(1);
  }

  if (input.length === 0) {
    throw new SyntaxError(`Invalid ${context} format: missing digits`);
  }

  const dotIndex = input.indexOf('.');
  let intPart = input;
  let fracPart = '';
  if (dotIndex !== -1) {
    intPart = input.slice(0, dotIndex);
    fracPart = input.slice(dotIndex + 1);
    if (intPart.length === 0 || fracPart.length === 0) {
      throw new SyntaxError(`Invalid ${context} format: invalid decimal point`);
    }
  }

  const intDigits = normalizeDigits(intPart, allowGrouping, context);
  const fracDigits = normalizeDigits(fracPart, allowGrouping, context);

  if (intDigits.length === 0 && fracDigits.length === 0) {
    throw new SyntaxError(`Invalid ${context} format: missing digits`);
  }
  if (!allowLeadingZeros && intDigits.length > 1 && intDigits.startsWith('0')) {
    throw new SyntaxError(`Invalid ${context} format: leading zeros not allowed`);
  }

  const digits = `${intDigits}${fracDigits}`.replace(/^0+(?=\d)/, '');
  const normalizedDigits = digits.length === 0 ? '0' : digits;
  const scale = fracDigits.length - exponent;
  return { sign, digits: normalizedDigits, scale };
}

/**
 * Round a division result according to the specified rounding mode.
 */
export function roundBigInt(
  numerator: bigint,
  denominator: bigint,
  mode: RoundingMode
): bigint {
  const quotient = numerator / denominator;
  const remainder = numerator % denominator;

  if (remainder === 0n) return quotient;

  const absRemainder = remainder < 0n ? -remainder : remainder;
  const absDenominator = denominator < 0n ? -denominator : denominator;
  const isNegative = numerator < 0n !== denominator < 0n;
  const isExactlyHalf = absRemainder * 2n === absDenominator;
  const isMoreThanHalf = absRemainder * 2n > absDenominator;

  let roundUp = false;
  switch (mode) {
    case RoundingMode.TRUNC:
      roundUp = false;
      break;
    case RoundingMode.EXPAND:
      roundUp = true;
      break;
    case RoundingMode.FLOOR:
      roundUp = isNegative;
      break;
    case RoundingMode.CEIL:
      roundUp = !isNegative;
      break;
    case RoundingMode.HALF_EXPAND:
      roundUp = isExactlyHalf || isMoreThanHalf;
      break;
    case RoundingMode.HALF_TRUNC:
      roundUp = isMoreThanHalf;
      break;
    case RoundingMode.HALF_EVEN:
      if (isExactlyHalf) {
        const absQuotient = quotient < 0n ? -quotient : quotient;
        roundUp = absQuotient % 2n !== 0n;
      } else {
        roundUp = isMoreThanHalf;
      }
      break;
    case RoundingMode.HALF_CEIL:
      roundUp = isExactlyHalf ? !isNegative : isMoreThanHalf;
      break;
    case RoundingMode.HALF_FLOOR:
      roundUp = isExactlyHalf ? isNegative : isMoreThanHalf;
      break;
  }

  if (roundUp) {
    return isNegative ? quotient - 1n : quotient + 1n;
  }
  return quotient;
}

/**
 * Hash a bigint into a 32-bit signed integer.
 */
export function hashBigInt(value: bigint): number {
  let n = value;
  let hash = 0;
  const isNegative = n < 0n;
  if (isNegative) n = -n;
  while (n > 0n) {
    hash = hash * 31 + Number(n & 0xff_ff_ff_ffn) | 0;
    n >>= 32n;
  }
  return isNegative ? ~hash : hash;
}

/**
 * Combine two 32-bit hashes using a 31x multiplier.
 */
export function hashCombine(hash: number, value: number): number {
  return hash * 31 + value | 0;
}
