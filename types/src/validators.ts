/**
 * Validator type wrappers for field definitions.
 *
 * These wrappers specify validation constraints that are enforced:
 * - At runtime in JavaScript (constructor, setters, set() method)
 * - In the database via CHECK constraints (for Table types)
 */

/**
 * Value must be greater than zero.
 *
 * @example
 * ```typescript
 * '1:price': Positive<number>;
 * '2:quantity': Positive<bigint>;
 * ```
 */
export type Positive<T extends number | bigint> = T & {
  readonly __positive: unique symbol;
};

/**
 * Value must be less than zero.
 *
 * @example
 * ```typescript
 * '1:debt': Negative<number>;
 * ```
 */
export type Negative<T extends number | bigint> = T & {
  readonly __negative: unique symbol;
};

/**
 * Value must be greater than or equal to zero.
 *
 * @example
 * ```typescript
 * '1:count': NonNegative<number>;
 * ```
 */
export type NonNegative<T extends number | bigint> = T & {
  readonly __nonNegative: unique symbol;
};

/**
 * Value must be less than or equal to zero.
 *
 * @example
 * ```typescript
 * '1:balance': NonPositive<number>;
 * ```
 */
export type NonPositive<T extends number | bigint> = T & {
  readonly __nonPositive: unique symbol;
};

/**
 * Value must be greater than or equal to the minimum.
 *
 * @example
 * ```typescript
 * '1:age': Min<number, 0>;
 * '2:year': Min<number, 1900>;
 * ```
 */
export type Min<T extends number | bigint, MinValue extends number> = T & {
  readonly __min: MinValue;
};

/**
 * Value must be less than or equal to the maximum.
 *
 * @example
 * ```typescript
 * '1:percentage': Max<number, 100>;
 * '2:hour': Max<number, 23>;
 * ```
 */
export type Max<T extends number | bigint, MaxValue extends number> = T & {
  readonly __max: MaxValue;
};

/**
 * Value must be strictly greater than the bound.
 *
 * @example
 * ```typescript
 * '1:id': GreaterThan<number, 0>;
 * ```
 */
export type GreaterThan<
  T extends number | bigint,
  Bound extends number,
> = T & {
  readonly __greaterThan: Bound;
};

/**
 * Value must be strictly less than the bound.
 *
 * @example
 * ```typescript
 * '1:discount': LessThan<number, 100>;
 * ```
 */
export type LessThan<T extends number | bigint, Bound extends number> = T & {
  readonly __lessThan: Bound;
};

/**
 * Value must be within the range [MinValue, MaxValue] (inclusive).
 *
 * @example
 * ```typescript
 * '1:rating': Range<number, 1, 5>;
 * '2:month': Range<number, 1, 12>;
 * ```
 */
export type Range<
  T extends number | bigint,
  MinValue extends number,
  MaxValue extends number,
> = T & {
  readonly __range: [MinValue, MaxValue];
};

/**
 * String or array must have at least one element/character.
 *
 * @example
 * ```typescript
 * '1:name': NonEmpty<string>;
 * '2:tags': NonEmpty<string[]>;
 * ```
 */
export type NonEmpty<T extends string | unknown[]> = T & {
  readonly __nonEmpty: unique symbol;
};

/**
 * String or array must have at least the minimum length.
 *
 * @example
 * ```typescript
 * '1:password': MinLength<string, 8>;
 * '2:items': MinLength<Item[], 1>;
 * ```
 */
export type MinLength<
  T extends string | unknown[],
  MinLen extends number,
> = T & {
  readonly __minLength: MinLen;
};

/**
 * String or array must have at most the maximum length.
 *
 * @example
 * ```typescript
 * '1:title': MaxLength<string, 100>;
 * '2:items': MaxLength<Item[], 10>;
 * ```
 */
export type MaxLength<
  T extends string | unknown[],
  MaxLen extends number,
> = T & {
  readonly __maxLength: MaxLen;
};

/**
 * String or array must have length within the range [MinLen, MaxLen] (inclusive).
 *
 * @example
 * ```typescript
 * '1:username': Length<string, 3, 20>;
 * '2:tags': Length<string[], 1, 5>;
 * ```
 */
export type Length<
  T extends string | unknown[],
  MinLen extends number,
  MaxLen extends number,
> = T & {
  readonly __length: [MinLen, MaxLen];
};

/**
 * Custom validator using a function.
 *
 * For `Message` types, the function runs in JavaScript only.
 * For `Table` types, the function must be transpilable to SQL.
 *
 * @example
 * ```typescript
 * const isEven: Validator<number> = (v) => v % 2 === 0;
 *
 * '1:evenNumber': Check<number, typeof isEven>;
 * ```
 */
export type Check<T, V extends Validator<T>> = T & {
  readonly __check: V;
};

/**
 * Validator function type.
 *
 * @example
 * ```typescript
 * const isPositive: Validator<number> = (v) => v > 0;
 * const isValidEmail: Validator<string> = (v) => v.includes('@');
 * ```
 */
export type Validator<T> = (value: T) => boolean;
