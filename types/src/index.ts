/**
 * @propane/types - Type definitions and registry for Propane
 *
 * This package provides:
 * - Type definitions for use in .pmsg files
 * - The registry for compiler configuration
 * - No runtime dependencies on other @propane/* packages
 *
 * @example
 * ```typescript
 * // User's .pmsg file - single import for everything
 * import {
 *   Message,
 *   Table,
 *   PrimaryKey,
 *   Auto,
 *   Normalize,
 *   Positive,
 *   Range,
 *   int32,
 *   Decimal,
 * } from '@propane/types';
 *
 * export type User = Table<{
 *   '1:id': PrimaryKey<Auto<bigint>>;
 *   '2:score': Positive<int32>;
 *   '3:rating': Range<Decimal<3, 2>, 0, 5>;
 *   '4:tags': Normalize<string[]>;
 * }>;
 * ```
 */

// Message and Table wrappers
export type { Message } from './message.js';
export type { Table } from './table.js';

// DB wrappers
export type {
  PrimaryKey,
  Auto,
  Index,
  Unique,
  Normalize,
  Json,
  References,
} from './db-wrappers.js';

// Validators
export type {
  numeric,
  NumericBound,
  Positive,
  Negative,
  NonNegative,
  NonPositive,
  Min,
  Max,
  GreaterThan,
  LessThan,
  Range,
  NonEmpty,
  MinLength,
  MaxLength,
  Length,
  MinCharLength,
  MaxCharLength,
  CharLength,
  Check,
  Validator,
} from './validators.js';

// Branded types
export type { int32, int53 } from './brands.js';
export type { Decimal, Rational, RoundingMode } from '@/common/numbers/decimal.js';

// Registry for compiler configuration
export {
  buildRegistry,
  propaneTypes,
} from './registry.js';

export type {
  TypeCategory,
  TypeRegistration,
  ValidatorRegistration,
  DbWrapperRegistration,
  MessageRegistration,
  TableRegistration,
  BrandRegistration,
  AnyTypeRegistration,
  RegistryKey,
  TypeRegistry,
  BuildRegistryOptions,
  ValidatorDefinition,
  JsGeneratorContext,
  SqlGeneratorContext,
  MessageGeneratorContext,
  TypeInfo,
  ImportCollector,
  BrandDefinition,
  BrandSqlContext,
  BrandJsContext,
} from './registry.js';
