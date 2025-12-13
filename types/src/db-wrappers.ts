/**
 * Database wrapper types for Table field definitions.
 *
 * These wrappers indicate how fields should be stored and indexed
 * in the database. They have no runtime behavior - they're purely
 * compile-time markers for the schema generator.
 */

/**
 * Marks a field as the primary key.
 *
 * @example
 * ```typescript
 * '1:id': PrimaryKey<bigint>;
 * '1:id': PrimaryKey<Auto<bigint>>;  // Auto-increment primary key
 * ```
 *
 * For composite keys, use the second type parameter to specify order:
 * @example
 * ```typescript
 * '1:orgId': PrimaryKey<bigint, 1>;   // First part of composite key
 * '2:userId': PrimaryKey<bigint, 2>;  // Second part of composite key
 * ```
 */
export type PrimaryKey<T, N extends number = 1> = T & {
  readonly __primaryKey: N;
};

/**
 * Marks a field as auto-increment (SERIAL/BIGSERIAL in PostgreSQL).
 *
 * @example
 * ```typescript
 * '1:id': Auto<bigint>;
 * '1:id': PrimaryKey<Auto<bigint>>;  // Auto-increment primary key
 * ```
 */
export type Auto<T extends number | bigint> = T & {
  readonly __auto: unique symbol;
};

/**
 * Creates a B-tree index on the field.
 *
 * @example
 * ```typescript
 * '2:email': Index<string>;
 * '3:createdAt': Index<Date>;
 * ```
 */
export type Index<T> = T & { readonly __index: unique symbol };

/**
 * Adds a unique constraint to the field.
 *
 * @example
 * ```typescript
 * '2:email': Unique<string>;
 * '3:slug': Unique<Index<string>>;  // Unique with index
 * ```
 */
export type Unique<T> = T & { readonly __unique: unique symbol };

/**
 * Normalizes an array into a separate table (one-to-many relationship).
 *
 * @example
 * ```typescript
 * '5:tags': Normalize<string[]>;
 * '6:addresses': Normalize<Address[]>;
 * ```
 */
export type Normalize<T extends unknown[]> = T & {
  readonly __normalize: unique symbol;
};

/**
 * Forces JSONB storage for the field.
 *
 * @example
 * ```typescript
 * '4:metadata': Json<Record<string, unknown>>;
 * '5:settings': Json<UserSettings>;
 * ```
 */
export type Json<T> = T & { readonly __json: unique symbol };

/**
 * Creates a foreign key reference to another table.
 *
 * @example
 * ```typescript
 * '3:authorId': References<User, 'id'>;
 * '4:categoryId': References<Category>;  // Defaults to 'id'
 * ```
 */
export type References<
  T,
  K extends keyof T = 'id' extends keyof T ? 'id' : never,
> = T[K] & {
  readonly __references: { table: T; key: K };
};
