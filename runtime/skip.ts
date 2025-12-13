/**
 * Sentinel value for set() to skip updating a field at runtime.
 *
 * Use when you want to conditionally update fields:
 *
 * @example
 * ```typescript
 * product.set({
 *   price: shouldUpdatePrice ? newPrice : SKIP,
 *   name: 'New Name',  // Always update
 * });
 * ```
 *
 * Fields set to `SKIP` retain their original value. This is useful when
 * building update objects dynamically where some fields may or may not
 * need to be updated based on runtime conditions.
 */
export const SKIP: unique symbol = Symbol('SKIP');
