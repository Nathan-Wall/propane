/**
 * @propanejs/types - Type definitions and registry for Propane
 *
 * This package provides:
 * - Type definitions for use in .pmsg files
 * - The registry for compiler configuration
 * - No runtime dependencies on other @propanejs/* packages
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
 *   decimal,
 * } from '@propanejs/types';
 *
 * export type User = Table<{
 *   '1:id': PrimaryKey<Auto<bigint>>;
 *   '2:score': Positive<int32>;
 *   '3:rating': Range<decimal<3, 2>, 0, 5>;
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
  Check,
  Validator,
} from './validators.js';

// Branded types
export type { int32, int53, decimal } from './brands.js';

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
