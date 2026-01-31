/**
 * Validator type wrappers for field definitions.
 *
 * These wrappers specify validation constraints that are enforced:
 * - At runtime in JavaScript (constructor, setters, set() method)
 * - In the database via CHECK constraints (for Table types)
 */

import type { Decimal, Rational } from '@/common/numbers/decimal.js';

/**
 * Union of all numeric types that can be validated.
 *
 * Covers:
 * - `number` (including branded types like int32, int53)
 * - `bigint`
 * - `Decimal<P,S>`
 * - `Rational`
 */
export type numeric = number | bigint | Decimal<any, any> | Rational;

type Lengthwise = { readonly length: number };

/**
 * Value must be greater than zero.
 *
 * @example
 * ```typescript
 * '1:price': Positive<number>;
 * '2:quantity': Positive<bigint>;
 * '3:amount': Positive<Decimal<10,2>>;
 * ```
 */
export type Positive<T extends numeric> = T & {
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
export type Negative<T extends numeric> = T & {
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
export type NonNegative<T extends numeric> = T & {
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
export type NonPositive<T extends numeric> = T & {
  readonly __nonPositive: unique symbol;
};

/**
 * Bound type for numeric validators.
 * Allows number literals for number, bigint literals for bigint,
 * and string literals for decimals.
 */
export type NumericBound = number | bigint | string;

/**
 * Value must be greater than or equal to the minimum.
 *
 * @example
 * ```typescript
 * '1:age': Min<number, 0>;
 * '2:year': Min<number, 1900>;
 * '3:price': Min<Decimal<10,2>, '0.00'>;
 * ```
 */
export type Min<T extends numeric, MinValue extends NumericBound> = T & {
  readonly __min: MinValue;
};

/**
 * Value must be less than or equal to the maximum.
 *
 * @example
 * ```typescript
 * '1:percentage': Max<number, 100>;
 * '2:hour': Max<number, 23>;
 * '3:price': Max<Decimal<10,2>, '999.99'>;
 * ```
 */
export type Max<T extends numeric, MaxValue extends NumericBound> = T & {
  readonly __max: MaxValue;
};

/**
 * Value must be strictly greater than the bound.
 *
 * @example
 * ```typescript
 * '1:id': GreaterThan<number, 0>;
 * '2:amount': GreaterThan<Decimal<10,2>, '0.00'>;
 * ```
 */
export type GreaterThan<
  T extends numeric,
  Bound extends NumericBound,
> = T & {
  readonly __greaterThan: Bound;
};

/**
 * Value must be strictly less than the bound.
 *
 * @example
 * ```typescript
 * '1:discount': LessThan<number, 100>;
 * '2:fee': LessThan<Decimal<5,2>, '100.00'>;
 * ```
 */
export type LessThan<T extends numeric, Bound extends NumericBound> = T & {
  readonly __lessThan: Bound;
};

/**
 * Value must be within the range [MinValue, MaxValue] (inclusive).
 *
 * @example
 * ```typescript
 * '1:rating': Range<number, 1, 5>;
 * '2:month': Range<number, 1, 12>;
 * '3:price': Range<Decimal<10,2>, '0.00', '999.99'>;
 * ```
 */
export type Range<
  T extends numeric,
  MinValue extends NumericBound,
  MaxValue extends NumericBound,
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
export type NonEmpty<T extends string | Lengthwise> = T & {
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
  T extends string | Lengthwise,
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
  T extends string | Lengthwise,
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
  T extends string | Lengthwise,
  MinLen extends number,
  MaxLen extends number,
> = T & {
  readonly __length: [MinLen, MaxLen];
};

/**
 * String must have at least N unicode code points.
 *
 * Uses `[...v].length` in JS which matches PostgreSQL's `char_length()`.
 * For byte length, use `MinLength` instead.
 *
 * @example
 * ```typescript
 * '1:bio': MinCharLength<string, 10>;
 * ```
 */
export type MinCharLength<T extends string, N extends number> = T & {
  readonly __minCharLength: N;
};

/**
 * String must have at most N unicode code points.
 *
 * Uses `[...v].length` in JS which matches PostgreSQL's `char_length()`.
 * For byte length, use `MaxLength` instead.
 *
 * @example
 * ```typescript
 * '1:title': MaxCharLength<string, 100>;
 * ```
 */
export type MaxCharLength<T extends string, N extends number> = T & {
  readonly __maxCharLength: N;
};

/**
 * String must have unicode code point count within range [Min, Max] (inclusive).
 *
 * Uses `[...v].length` in JS which matches PostgreSQL's `char_length()`.
 * For byte length, use `Length` instead.
 *
 * @example
 * ```typescript
 * '1:username': CharLength<string, 3, 30>;
 * ```
 */
export type CharLength<
  T extends string,
  Min extends number,
  Max extends number,
> = T & {
  readonly __charLength: [Min, Max];
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
