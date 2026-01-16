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
  Decimal,
  Rational,
  RoundingMode,
  DecimalOverflowError,
  DecimalInexactError,
  DecimalDivisionByZeroError,
  RationalOverflowError,
  type DecimalFactory,
  type DecimalFactoryOptions,
  type FromStringOptions,
  type AllocationStrategy,
  type AllocateOptions,
  type MultiplyOptions,
  type MultiplyTargetOptions,
  type DivideOptions,
  ensureValidPrecisionScale,
  pow10,
  scaleByPow10,
  isDecimalOf,
  isRational,
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
