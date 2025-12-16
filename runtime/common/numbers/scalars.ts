/**
 * Core scalar types for Propane database storage.
 *
 * These are branded types that represent specific database column types.
 * At runtime, they are just regular JavaScript values (number/string),
 * but the type system tracks the intended storage format.
 *
 * This module re-exports all scalar types for convenience.
 */

export { int32, toInt32, isInt32 } from './int32.js';
export { int53, toInt53, isInt53 } from './int53.js';
export {
  decimal,
  type AnyDecimal,
  toDecimal,
  decimalCompare,
  decimalEquals,
  decimalGreaterThan,
  decimalGreaterThanOrEqual,
  decimalLessThan,
  decimalLessThanOrEqual,
  decimalIsPositive,
  decimalIsNegative,
  decimalIsZero,
  decimalIsNonNegative,
  decimalIsNonPositive,
  decimalInRange,
  decimalInRangeExclusive,
  isDecimal,
  type ComparisonResult,
} from './decimal.js';
export {
  numeric,
  compare,
  equals,
  greaterThan,
  greaterThanOrEqual,
  lessThan,
  lessThanOrEqual,
  isPositive,
  isNegative,
  isZero,
  isNonNegative,
  isNonPositive,
  inRange,
  inRangeExclusive,
  isInteger,
} from './numeric.js';
