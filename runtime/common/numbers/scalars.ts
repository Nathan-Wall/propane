/**
 * Core scalar types for Propane database storage.
 *
 * These are branded types that represent specific database column types.
 * At runtime, they are just regular JavaScript values (number/string),
 * but the type system tracks the intended storage format.
 *
 * This module re-exports all scalar types for convenience.
 */

export { int32, toInt32 } from './int32.js';
export { decimal, toDecimal } from './decimal.js';
