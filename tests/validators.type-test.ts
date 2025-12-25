/**
 * Type-level tests for validators.
 *
 * This file verifies that branded validator types correctly reject
 * plain values at compile time. Each @ts-expect-error comment must
 * trigger an error, or the build fails.
 *
 * This file is type-checked but not executed.
 *
 * Note: Uses relative import to types source because @propane/types
 * symlink is not available during test compilation phase.
 */
import type {
  Positive,
  Negative,
  NonNegative,
  NonPositive,
  Min,
  Max,
  Range,
  GreaterThan,
  LessThan,
  NonEmpty,
  MinLength,
  MaxLength,
  Length,
  MinCharLength,
  MaxCharLength,
  CharLength,
} from '../types/src/validators.js';

// ============================================================
// Numeric Sign Validators - should reject plain numbers
// ============================================================

// @ts-expect-error: number is not assignable to Positive<number>
const positive: Positive<number> = 1;

// @ts-expect-error: number is not assignable to Negative<number>
const negative: Negative<number> = -1;

// @ts-expect-error: number is not assignable to NonNegative<number>
const nonNegative: NonNegative<number> = 0;

// @ts-expect-error: number is not assignable to NonPositive<number>
const nonPositive: NonPositive<number> = 0;

// ============================================================
// Numeric Bound Validators - should reject plain numbers
// ============================================================

// @ts-expect-error: number is not assignable to Min<number, 0>
const min: Min<number, 0> = 5;

// @ts-expect-error: number is not assignable to Max<number, 100>
const max: Max<number, 100> = 50;

// @ts-expect-error: number is not assignable to Range<number, 0, 100>
const range: Range<number, 0, 100> = 50;

// @ts-expect-error: number is not assignable to GreaterThan<number, 0>
const greaterThan: GreaterThan<number, 0> = 1;

// @ts-expect-error: number is not assignable to LessThan<number, 100>
const lessThan: LessThan<number, 100> = 50;

// ============================================================
// String Length Validators - should reject plain strings
// ============================================================

// @ts-expect-error: string is not assignable to NonEmpty<string>
const nonEmptyString: NonEmpty<string> = 'hello';

// @ts-expect-error: string is not assignable to MinLength<string, 3>
const minLengthString: MinLength<string, 3> = 'hello';

// @ts-expect-error: string is not assignable to MaxLength<string, 100>
const maxLengthString: MaxLength<string, 100> = 'hello';

// @ts-expect-error: string is not assignable to Length<string, 3, 10>
const lengthString: Length<string, 3, 10> = 'hello';

// @ts-expect-error: string is not assignable to MinCharLength<string, 3>
const minCharLengthString: MinCharLength<string, 3> = 'hello';

// @ts-expect-error: string is not assignable to MaxCharLength<string, 100>
const maxCharLengthString: MaxCharLength<string, 100> = 'hello';

// @ts-expect-error: string is not assignable to CharLength<string, 3, 10>
const charLengthString: CharLength<string, 3, 10> = 'hello';

// ============================================================
// Array Length Validators - should reject plain arrays
// ============================================================

// @ts-expect-error: string[] is not assignable to NonEmpty<string[]>
const nonEmptyArray: NonEmpty<string[]> = ['a'];

// @ts-expect-error: number[] is not assignable to MinLength<number[], 1>
const minLengthArray: MinLength<number[], 1> = [1, 2, 3];

// @ts-expect-error: number[] is not assignable to MaxLength<number[], 10>
const maxLengthArray: MaxLength<number[], 10> = [1, 2, 3];

// @ts-expect-error: string[] is not assignable to Length<string[], 1, 5>
const lengthArray: Length<string[], 1, 5> = ['a', 'b'];

// ============================================================
// Bigint Validators - should reject plain bigints
// ============================================================

// @ts-expect-error: bigint is not assignable to Positive<bigint>
const positiveBigint: Positive<bigint> = 1n;

// @ts-expect-error: bigint is not assignable to Negative<bigint>
const negativeBigint: Negative<bigint> = -1n;

// @ts-expect-error: bigint is not assignable to Min<bigint, 0n>
const minBigint: Min<bigint, 0n> = 5n;

// @ts-expect-error: bigint is not assignable to Max<bigint, 100n>
const maxBigint: Max<bigint, 100n> = 50n;

// @ts-expect-error: bigint is not assignable to Range<bigint, 0n, 100n>
const rangeBigint: Range<bigint, 0n, 100n> = 50n;

// ============================================================
// Correct usage patterns - should compile without errors
// ============================================================

// Explicit cast after validation is the intended pattern
function validatePositive(x: number): Positive<number> {
  if (x <= 0) throw new Error('Must be positive');
  return x as Positive<number>;
}

function validateNonEmpty(x: string): NonEmpty<string> {
  if (x.length === 0) throw new Error('Must be non-empty');
  return x as NonEmpty<string>;
}

// These should compile successfully
const validPositive: Positive<number> = validatePositive(5);
const validNonEmpty: NonEmpty<string> = validateNonEmpty('hello');

// Branded values can be used where base type is expected
const num: number = validPositive;
const str: string = validNonEmpty;

// Suppress unused variable warnings
void [
  positive, negative, nonNegative, nonPositive,
  min, max, range, greaterThan, lessThan,
  nonEmptyString, minLengthString, maxLengthString, lengthString,
  minCharLengthString, maxCharLengthString, charLengthString,
  nonEmptyArray, minLengthArray, maxLengthArray, lengthArray,
  positiveBigint, negativeBigint, minBigint, maxBigint, rangeBigint,
  validPositive, validNonEmpty, num, str,
];
