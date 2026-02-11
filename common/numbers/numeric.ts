/**
 * Unified numeric operations for number, bigint, Decimal, and Rational types.
 */

import {
  Decimal,
  Rational,
  pow10,
} from './decimal.js';
import { gcdBigInt } from './decimal-shared.js';

/**
 * Type for any numeric value: number, bigint, Decimal, or Rational.
 */
export type numeric = number | bigint | Decimal<number, number> | Rational;

export type ComparisonResult = -1 | 0 | 1;

// -----------------------------------------------------------------------------
// Core Comparison
// -----------------------------------------------------------------------------

export function compare(a: numeric, b: numeric): ComparisonResult {
  return numericCompare(a, b);
}

export function numericCompare(a: numeric, b: numeric): ComparisonResult {
  if (typeof a === 'number' && typeof b === 'number') {
    return compareNumbers(a, b);
  }
  if (typeof a === 'bigint' && typeof b === 'bigint') {
    return a < b ? -1 : a > b ? 1 : 0;
  }

  if (Decimal.isInstance(a) && Decimal.isInstance(b)) {
    const leftDecimal = a as Decimal<number, number>;
    const rightDecimal = b as Decimal<number, number>;
    return leftDecimal.compare(rightDecimal);
  }
  if (Rational.isInstance(a) && Rational.isInstance(b)) {
    const leftRational = a as Rational;
    const rightRational = b as Rational;
    return leftRational.compare(rightRational);
  }

  if (typeof a === 'number' || typeof b === 'number') {
    return compareMixedWithNumber(a, b);
  }

  return toRational(a).compare(toRational(b));
}

function compareNumbers(a: number, b: number): ComparisonResult {
  if (Number.isNaN(a)) return Number.isNaN(b) ? 0 : 1;
  if (Number.isNaN(b)) return -1;
  return a < b ? -1 : a > b ? 1 : 0;
}

function compareMixedWithNumber(a: numeric, b: numeric): ComparisonResult {
  const aNum = typeof a === 'number' ? a : null;
  const bNum = typeof b === 'number' ? b : null;

  if (aNum !== null && Number.isNaN(aNum)) return 1;
  if (bNum !== null && Number.isNaN(bNum)) return -1;

  if (aNum === Infinity) return 1;
  if (bNum === Infinity) return -1;
  if (aNum === -Infinity) return -1;
  if (bNum === -Infinity) return 1;

  return toRational(a).compare(toRational(b));
}

function toRational(value: numeric): Rational {
  if (Rational.isInstance(value)) return value;
  if (Decimal.isInstance(value)) {
    const decimalValue = value as Decimal<number, number>;
    return decimalValue.toRational();
  }
  if (typeof value === 'bigint') return Rational.fromInt(value);
  if (typeof value === 'number') {
    if (Number.isSafeInteger(value)) {
      return Rational.fromInt(value);
    }
    return fromFloatExact(value);
  }
  throw new TypeError(`Cannot convert ${typeof value} to Rational`);
}

function fromFloatExact(value: number): Rational {
  if (!Number.isFinite(value)) {
    throw new TypeError(`Cannot convert ${value} to Rational`);
  }
  if (value === 0) {
    return Rational.zero();
  }

  const buffer = new ArrayBuffer(8);
  const view = new DataView(buffer);
  view.setFloat64(0, value, false);
  const hi = view.getUint32(0);
  const lo = view.getUint32(4);

  const sign = hi >>> 31 ? -1n : 1n;
  const expBits = hi >>> 20 & 0x7_FF;
  const mantissaHi = hi & 0xF_FF_FF;
  const mantissaLo = lo;

  const mantissaBits = BigInt(mantissaHi) * 0x1_00_00_00_00n
    + BigInt(mantissaLo);

  let numerator: bigint;
  let denominator: bigint;

  if (expBits === 0) {
    numerator = sign * mantissaBits;
    denominator = 1n << 1074n;
  } else {
    const significand = (1n << 52n) + mantissaBits;
    const exp = BigInt(expBits) - 1023n - 52n;

    if (exp >= 0n) {
      numerator = sign * significand * (1n << exp);
      denominator = 1n;
    } else {
      numerator = sign * significand;
      denominator = 1n << -exp;
    }
  }

  const g = gcdBigInt(numerator, denominator);
  return Rational.fromInts(numerator / g, denominator / g);
}

// -----------------------------------------------------------------------------
// Binary Comparisons
// -----------------------------------------------------------------------------

export function equals(a: numeric, b: numeric): boolean {
  return compare(a, b) === 0;
}

export function greaterThan(a: numeric, b: numeric): boolean {
  return compare(a, b) === 1;
}

export function greaterThanOrEqual(a: numeric, b: numeric): boolean {
  return compare(a, b) >= 0;
}

export function lessThan(a: numeric, b: numeric): boolean {
  return compare(a, b) === -1;
}

export function lessThanOrEqual(a: numeric, b: numeric): boolean {
  return compare(a, b) <= 0;
}

// -----------------------------------------------------------------------------
// Sign Checks
// -----------------------------------------------------------------------------

export function isPositive(value: numeric): boolean {
  if (typeof value === 'number') {
    return !Number.isNaN(value) && value > 0;
  }
  return numericCompare(value, 0) > 0;
}

export function isNegative(value: numeric): boolean {
  if (typeof value === 'number') {
    return !Number.isNaN(value) && value < 0;
  }
  return numericCompare(value, 0) < 0;
}

export function isZero(value: numeric): boolean {
  if (typeof value === 'number') {
    return value === 0;
  }
  return numericCompare(value, 0) === 0;
}

export function isNonNegative(value: numeric): boolean {
  if (typeof value === 'number') {
    return !Number.isNaN(value) && value >= 0;
  }
  return numericCompare(value, 0) >= 0;
}

export function isNonPositive(value: numeric): boolean {
  if (typeof value === 'number') {
    return !Number.isNaN(value) && value <= 0;
  }
  return numericCompare(value, 0) <= 0;
}

// -----------------------------------------------------------------------------
// Range Checks
// -----------------------------------------------------------------------------

export function inRange(value: numeric, min: numeric, max: numeric): boolean {
  if (typeof value === 'number' && Number.isNaN(value)) return false;
  if (typeof min === 'number' && Number.isNaN(min)) return false;
  if (typeof max === 'number' && Number.isNaN(max)) return false;
  return greaterThanOrEqual(value, min) && lessThanOrEqual(value, max);
}

export function inRangeExclusive(
  value: numeric,
  min: numeric,
  max: numeric
): boolean {
  if (typeof value === 'number' && Number.isNaN(value)) return false;
  if (typeof min === 'number' && Number.isNaN(min)) return false;
  if (typeof max === 'number' && Number.isNaN(max)) return false;
  return greaterThan(value, min) && lessThan(value, max);
}

// -----------------------------------------------------------------------------
// Integer Check
// -----------------------------------------------------------------------------

export function isInteger(value: numeric): boolean {
  if (typeof value === 'bigint') {
    return true;
  }
  if (typeof value === 'number') {
    return Number.isInteger(value);
  }
  if (Rational.isInstance(value)) {
    return value.denominator === 1n;
  }
  const decimalValue = value as Decimal<number, number>;
  if (decimalValue.scale <= 0) return true;
  return decimalValue.mantissa % pow10(decimalValue.scale) === 0n;
}
