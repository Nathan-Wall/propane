/**
 * Wrapper type for Table definitions in .pmsg files.
 *
 * Types wrapped with `Table<T>` are transformed into runtime classes
 * (like `Message<T>`) but also indicate the type is a database table
 * for schema generation.
 *
 * @example
 * ```typescript
 * import { Table, PrimaryKey, Auto, Index } from '@propane/types';
 *
 * export type User = Table<{
 *   '1:id': PrimaryKey<Auto<bigint>>;
 *   '2:email': Index<string>;
 *   '3:name': string;
 *   '4:active': boolean;
 *   '5:created': Date;
 * }>;
 * ```
 */
export type Table<T extends object> = T & { readonly __table: unique symbol };
