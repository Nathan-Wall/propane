/**
 * Database wrapper types for Propane PostgreSQL storage.
 *
 * These types wrap Propane field types to provide database-specific
 * configuration like primary keys, indexes, and storage strategies.
 */

declare const TABLE_BRAND: unique symbol;
declare const PK_BRAND: unique symbol;
declare const AUTO_BRAND: unique symbol;
declare const INDEX_BRAND: unique symbol;
declare const UNIQUE_BRAND: unique symbol;
declare const SEPARATE_BRAND: unique symbol;
declare const JSON_BRAND: unique symbol;

/**
 * Marks a type as a database table. Types wrapped with Table<{...}> are
 * transformed into runtime classes (like Message<T>) and generate
 * PostgreSQL schema for database storage.
 *
 * @typeParam T - The object type defining table columns
 *
 * @example
 * ```typescript
 * import { Table, PK, Auto, Unique } from '@propanejs/postgres';
 *
 * export type User = Table<{
 *   '1:id': PK<Auto<bigint>>;        // BIGSERIAL PRIMARY KEY
 *   '2:email': Unique<string>;       // TEXT UNIQUE
 *   '3:name': string;
 *   '4:created': Date;               // TIMESTAMPTZ
 * }>;
 * ```
 */
export type Table<T extends object> = T & { readonly [TABLE_BRAND]: never };

/**
 * Marks a field as the primary key for the table.
 *
 * @typeParam T - The underlying type (typically bigint, int32, or string)
 *
 * @example
 * ```typescript
 * export type User = {
 *   '1:id': PK<bigint>;           // BIGINT PRIMARY KEY
 *   '2:uuid': PK<string>;         // TEXT PRIMARY KEY
 *   '3:id': PK<Auto<bigint>>;     // BIGSERIAL PRIMARY KEY
 * };
 * ```
 */
export type PK<T> = T & { readonly [PK_BRAND]: never };

/**
 * Marks a field for auto-increment. Must be used inside PK<>.
 *
 * - PostgreSQL: SERIAL (int32) or BIGSERIAL (bigint)
 *
 * @typeParam T - The underlying numeric type (int32 or bigint)
 *
 * @example
 * ```typescript
 * export type User = {
 *   '1:id': PK<Auto<bigint>>;     // BIGSERIAL PRIMARY KEY
 * };
 * ```
 */
export type Auto<T extends number | bigint> = T & {
  readonly [AUTO_BRAND]: never;
};

/**
 * Creates a B-tree index on the field.
 *
 * @typeParam T - The underlying field type
 *
 * @example
 * ```typescript
 * export type User = {
 *   '1:id': PK<bigint>;
 *   '2:email': Index<string>;           // TEXT with index
 *   '3:email': Unique<Index<string>>;   // TEXT with unique index
 * };
 * ```
 */
export type Index<T> = T & { readonly [INDEX_BRAND]: never };

/**
 * Adds a UNIQUE constraint to the field.
 *
 * @typeParam T - The underlying field type
 *
 * @example
 * ```typescript
 * export type User = {
 *   '1:id': PK<bigint>;
 *   '2:email': Unique<string>;          // TEXT UNIQUE
 *   '3:code': Unique<Index<string>>;    // TEXT UNIQUE with index
 * };
 * ```
 */
export type Unique<T> = T & { readonly [UNIQUE_BRAND]: never };

/**
 * Forces an array field to be stored in a separate table with foreign keys.
 * This is the default for arrays of messages, but can be used explicitly.
 *
 * @typeParam T - An array type
 *
 * @example
 * ```typescript
 * export type Order = {
 *   '1:id': PK<bigint>;
 *   '2:items': Separate<OrderItem[]>;   // Separate order_items table
 * };
 * ```
 */
export type Separate<T extends unknown[]> = T & {
  readonly [SEPARATE_BRAND]: never;
};

/**
 * Forces a field to be stored as JSONB instead of normalized tables.
 * Useful for arrays or nested objects that don't need to be queried.
 *
 * @typeParam T - The field type (typically an array or object)
 *
 * @example
 * ```typescript
 * export type User = {
 *   '1:id': PK<bigint>;
 *   '2:tags': Json<string[]>;           // JSONB array
 *   '3:metadata': Json<UserMeta>;       // JSONB object
 * };
 * ```
 */
export type Json<T> = T & { readonly [JSON_BRAND]: never };

/**
 * Type guard utilities for wrapper type detection.
 * Used internally by the schema generator.
 */
export interface WrapperTypeInfo {
  isPrimaryKey: boolean;
  isAutoIncrement: boolean;
  isIndexed: boolean;
  isUnique: boolean;
  forceSeparate: boolean;
  forceJson: boolean;
  baseType: string;
}
