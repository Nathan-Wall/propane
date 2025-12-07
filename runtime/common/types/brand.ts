/**
 * Branded type utility for nominal typing.
 *
 * @typeParam T - The underlying type to brand
 * @typeParam B - The brand tag (string identifier)
 * @typeParam NS - Optional namespace symbol for module-scoped uniqueness
 *
 * @example
 * ```typescript
 * // Simple branding (same tag = same type across modules)
 * type UserId = Brand<number, 'UserId'>;
 *
 * // Namespaced branding (unique per module)
 * declare const $ns: unique symbol;
 * type int32 = Brand<number, 'int32', typeof $ns>;
 * ```
 */
export type Brand<T, B extends string, NS extends symbol = never> =
  [NS] extends [never]
    ? T & Readonly<Record<`__brand_${B}`, never>>
    : T & Readonly<Record<NS, B>>;

/**
 * Runtime branding helper (for simple string-based brands).
 */
export const brand =
  <B extends string>(unused_tag: B) =>
  <T>(value: T): Brand<T, B> =>
    value as Brand<T, B>;

/**
 * Runtime unbranding helper.
 */
export const unbrand =
  <B extends string>(unused_tag: B) =>
  <T>(value: Brand<T, B>): T =>
    value as T;

