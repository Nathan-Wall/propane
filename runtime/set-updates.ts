import type { SKIP } from './skip.js';

/**
 * Helper type for set() method - adds SKIP as an option for each field.
 *
 * This type is used in the signature of the generated `set()` method
 * to allow fields to be either updated with a new value or skipped
 * using the `SKIP` sentinel.
 *
 * @example
 * ```typescript
 * // Generated set() method signature:
 * set(updates: Partial<SetUpdates<User.Data>>): User
 *
 * // Usage:
 * user.set({
 *   name: 'New Name',           // Update name
 *   email: SKIP,                // Keep existing email
 *   age: shouldUpdateAge ? 30 : SKIP,  // Conditionally update
 * });
 * ```
 */
export type SetUpdates<T> = {
  [K in keyof T]: T[K] | typeof SKIP;
};
