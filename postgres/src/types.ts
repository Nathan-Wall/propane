/**
 * Database wrapper types for Propane PostgreSQL storage.
 *
 * These types wrap Propane field types to provide database-specific
 * configuration like primary keys, indexes, and storage strategies.
 */

declare const TABLE_BRAND: unique symbol;
declare const PRIMARY_KEY_BRAND: unique symbol;
declare const AUTO_BRAND: unique symbol;
declare const INDEX_BRAND: unique symbol;
declare const UNIQUE_BRAND: unique symbol;
declare const NORMALIZE_BRAND: unique symbol;
declare const JSON_BRAND: unique symbol;
declare const REFERENCES_BRAND: unique symbol;

/**
 * Marks a type as a database table. Types wrapped with Table<{...}> are
 * transformed into runtime classes (like Message<T>) and generate
 * PostgreSQL schema for database storage.
 *
 * @typeParam T - The object type defining table columns
 *
 * @example
 * ```typescript
 * import { Table, PrimaryKey, Auto, Unique } from '@propane/postgres';
 *
 * export type User = Table<{
 *   '1:id': PrimaryKey<Auto<bigint>>;  // BIGSERIAL PRIMARY KEY
 *   '2:email': Unique<string>;         // TEXT UNIQUE
 *   '3:name': string;
 *   '4:created': Date;                 // TIMESTAMPTZ
 * }>;
 * ```
 */
export type Table<T extends object> = T & { readonly [TABLE_BRAND]: never };

/**
 * Marks a field as part of the primary key.
 *
 * @typeParam T - The underlying type (bigint, int32, string, etc.)
 * @typeParam Order - Optional position in composite key (1-based).
 *                    Defaults to declaration order when not specified.
 *
 * @example
 * ```typescript
 * // Single primary key
 * export type User = Table<{
 *   '1:id': PrimaryKey<Auto<bigint>>;
 *   '2:email': string;
 * }>;
 *
 * // Composite primary key (ordered by declaration order)
 * export type UserRole = Table<{
 *   '1:userId': PrimaryKey<bigint>;
 *   '2:roleId': PrimaryKey<bigint>;
 * }>;
 *
 * // Composite with explicit order
 * export type TenantUser = Table<{
 *   '1:visibleId': string;
 *   '2:tenantId': PrimaryKey<bigint, 1>;  // First in PK
 *   '3:userId': PrimaryKey<bigint, 2>;    // Second in PK
 * }>;
 * ```
 */
export type PrimaryKey<T, Order extends number = never> = T & {
  readonly [PRIMARY_KEY_BRAND]: { order: Order };
};

/**
 * Marks a field for auto-increment. Must be used inside PrimaryKey<>.
 *
 * - PostgreSQL: SERIAL (int32) or BIGSERIAL (bigint)
 * - Cannot be used in composite primary keys
 *
 * @typeParam T - The underlying numeric type (int32 or bigint)
 *
 * @example
 * ```typescript
 * export type User = Table<{
 *   '1:id': PrimaryKey<Auto<bigint>>;  // BIGSERIAL PRIMARY KEY
 * }>;
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
 * export type User = Table<{
 *   '1:id': PrimaryKey<bigint>;
 *   '2:email': Index<string>;           // TEXT with index
 *   '3:code': Unique<Index<string>>;    // TEXT with unique index
 * }>;
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
 * export type User = Table<{
 *   '1:id': PrimaryKey<bigint>;
 *   '2:email': Unique<string>;          // TEXT UNIQUE
 *   '3:code': Unique<Index<string>>;    // TEXT UNIQUE with index
 * }>;
 * ```
 */
export type Unique<T> = T & { readonly [UNIQUE_BRAND]: never };

/**
 * Normalizes an array field into a separate table with foreign keys.
 * This follows database normalization principles (1NF, 2NF, 3NF).
 *
 * Use `Normalize<T[]>` when you need to query or index array elements,
 * or when the array could grow large. Use `Json<T[]>` for small, opaque arrays.
 *
 * @typeParam T - An array type
 *
 * @example
 * ```typescript
 * export type Order = Table<{
 *   '1:id': PrimaryKey<bigint>;
 *   '2:items': Normalize<OrderItem[]>;  // Normalized into order_items table
 * }>;
 * ```
 */
export type Normalize<T extends unknown[]> = T & {
  readonly [NORMALIZE_BRAND]: never;
};

/**
 * Forces a field to be stored as JSONB instead of normalized tables.
 * Useful for arrays or nested objects that don't need to be queried.
 *
 * @typeParam T - The field type (typically an array or object)
 *
 * @example
 * ```typescript
 * export type User = Table<{
 *   '1:id': PrimaryKey<bigint>;
 *   '2:tags': Json<string[]>;           // JSONB array
 *   '3:metadata': Json<UserMeta>;       // JSONB object
 * }>;
 * ```
 */
export type Json<T> = T & { readonly [JSON_BRAND]: never };

/**
 * Marks a field as a foreign key reference to another Table type.
 * The column type is inferred from the referenced table's primary key.
 *
 * Note: Cannot reference tables with composite primary keys.
 * For those cases, define separate FK columns manually.
 *
 * @typeParam T - The referenced Table type (must have single-column PK)
 * @typeParam K - The referenced column name (default: 'id')
 *
 * @example
 * ```typescript
 * export type Post = Table<{
 *   '1:id': PrimaryKey<Auto<bigint>>;
 *   '2:title': string;
 *   '3:authorId': References<User>;              // References users(id)
 *   '4:categoryId': References<Category, 'code'>; // References categories(code)
 * }>;
 * ```
 */
export type References<T extends object, K extends keyof T = 'id' extends keyof T ? 'id' : keyof T> = T[K] & {
  readonly [REFERENCES_BRAND]: { table: T; column: K };
};

/**
 * Type guard utilities for wrapper type detection.
 * Used internally by the schema generator.
 */
export interface WrapperTypeInfo {
  isPrimaryKey: boolean;
  /** Explicit order in composite PK (1-based), undefined for declaration order */
  primaryKeyOrder?: number;
  isAutoIncrement: boolean;
  isIndexed: boolean;
  isUnique: boolean;
  forceNormalize: boolean;
  forceJson: boolean;
  baseType: string;
  /** Foreign key reference info, if References<T> wrapper is used */
  foreignKey?: {
    referencedType: string;
    referencedColumn: string;
  };
}
