/**
 * Validator Runtime Tests
 *
 * Tests runtime validation behavior for generated message classes.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert';
import { ValidationError, Decimal } from '@propane/runtime';
import type {
  Positive, Negative, NonNegative, NonPositive,
  Min, Max, Range,
  NonEmpty, MinLength, MaxLength, Length,
  int32, int53,
} from '@propane/types';
import {
  NumericSignValidators,
  NumericBoundValidators,
  StringValidators,
  BrandedValidators,
  OptionalValidators,
  ArrayValidators,
  BigintValidators,
} from './validators.pmsg.js';

describe('NumericSignValidators', () => {
  it('should accept valid positive number', () => {
    const msg = new NumericSignValidators({
      positiveNumber: 1 as Positive<number>,
      negativeNumber: -1 as Negative<number>,
      nonNegativeNumber: 0 as NonNegative<number>,
      nonPositiveNumber: 0 as NonPositive<number>,
    });
    assert.strictEqual(msg.positiveNumber, 1);
  });

  it('should reject invalid positive number', () => {
    assert.throws(
      () => new NumericSignValidators({
        positiveNumber: 0 as Positive<number>,
        negativeNumber: -1 as Negative<number>,
        nonNegativeNumber: 0 as NonNegative<number>,
        nonPositiveNumber: 0 as NonPositive<number>,
      }),
      ValidationError
    );
  });

  it('should reject invalid negative number', () => {
    assert.throws(
      () => new NumericSignValidators({
        positiveNumber: 1 as Positive<number>,
        negativeNumber: 0 as Negative<number>,
        nonNegativeNumber: 0 as NonNegative<number>,
        nonPositiveNumber: 0 as NonPositive<number>,
      }),
      ValidationError
    );
  });

  it('should skip validation with skipValidation option', () => {
    // This would normally throw, but skipValidation bypasses it
    const msg = new NumericSignValidators({
      positiveNumber: 0 as Positive<number>,
      negativeNumber: 0 as Negative<number>,
      nonNegativeNumber: -1 as NonNegative<number>,
      nonPositiveNumber: 1 as NonPositive<number>,
    }, { skipValidation: true });
    assert.strictEqual(msg.positiveNumber, 0);
  });
});

describe('NumericBoundValidators', () => {
  it('should accept values within bounds', () => {
    const msg = new NumericBoundValidators({
      minValue: 0 as Min<number, 0>,
      maxValue: 100 as Max<number, 100>,
      rangeValue: 50 as Range<number, 0, 100>,
    });
    assert.strictEqual(msg.rangeValue, 50);
  });

  it('should reject value below min', () => {
    assert.throws(
      () => new NumericBoundValidators({
        minValue: -1 as Min<number, 0>,
        maxValue: 50 as Max<number, 100>,
        rangeValue: 50 as Range<number, 0, 100>,
      }),
      ValidationError
    );
  });

  it('should reject value above max', () => {
    assert.throws(
      () => new NumericBoundValidators({
        minValue: 0 as Min<number, 0>,
        maxValue: 101 as Max<number, 100>,
        rangeValue: 50 as Range<number, 0, 100>,
      }),
      ValidationError
    );
  });

  it('should reject value outside range', () => {
    assert.throws(
      () => new NumericBoundValidators({
        minValue: 0 as Min<number, 0>,
        maxValue: 50 as Max<number, 100>,
        rangeValue: 101 as Range<number, 0, 100>,
      }),
      ValidationError
    );
  });
});

describe('StringValidators', () => {
  it('should accept valid strings', () => {
    const msg = new StringValidators({
      nonEmptyString: 'hello' as NonEmpty<string>,
      minLengthString: 'abc' as MinLength<string, 3>,
      maxLengthString: 'short' as MaxLength<string, 100>,
      exactLengthString: 'hello' as Length<string, 5, 10>,
    });
    assert.strictEqual(msg.nonEmptyString, 'hello');
  });

  it('should reject empty string for NonEmpty', () => {
    assert.throws(
      () => new StringValidators({
        nonEmptyString: '' as NonEmpty<string>,
        minLengthString: 'abc' as MinLength<string, 3>,
        maxLengthString: 'short' as MaxLength<string, 100>,
        exactLengthString: 'hello' as Length<string, 5, 10>,
      }),
      ValidationError
    );
  });

  it('should reject string below min length', () => {
    assert.throws(
      () => new StringValidators({
        nonEmptyString: 'hello' as NonEmpty<string>,
        minLengthString: 'ab' as MinLength<string, 3>,
        maxLengthString: 'short' as MaxLength<string, 100>,
        exactLengthString: 'hello' as Length<string, 5, 10>,
      }),
      ValidationError
    );
  });
});

describe('BrandedValidators', () => {
  it('should accept valid branded values', () => {
    const msg = new BrandedValidators({
      positiveInt32: 1 as Positive<int32>,
      positiveInt53: 1 as Positive<int53>,
      positiveDecimal: Decimal.fromStrictString(10, 2, '1.00') as Positive<Decimal<10, 2>>,
      minDecimal: Decimal.fromStrictString(10, 2, '100.00') as Min<Decimal<10, 2>, '100'>,
      maxDecimal: Decimal.fromStrictString(10, 2, '500.00') as Max<Decimal<10, 2>, '1000'>,
      rangeDecimal: Decimal.fromStrictString(10, 2, '500.00') as Range<Decimal<10, 2>, '0', '999.99'>,
    });
    assert.strictEqual(msg.positiveInt32, 1);
    assert.strictEqual(msg.minDecimal.toString(), '100.00');
  });

  it('should reject decimal as number input', () => {
    assert.throws(
      () => new BrandedValidators({
        positiveInt32: 1 as Positive<int32>,
        positiveInt53: 1 as Positive<int53>,
        positiveDecimal: 1 as unknown as Positive<Decimal<10, 2>>,
        minDecimal: 100 as unknown as Min<Decimal<10, 2>, '100'>,
        maxDecimal: 500 as unknown as Max<Decimal<10, 2>, '1000'>,
        rangeDecimal: 500 as unknown as Range<Decimal<10, 2>, '0', '999.99'>,
      }),
      ValidationError
    );
  });

  it('should reject decimal below min', () => {
    assert.throws(
      () => new BrandedValidators({
        positiveInt32: 1 as Positive<int32>,
        positiveInt53: 1 as Positive<int53>,
        positiveDecimal: Decimal.fromStrictString(10, 2, '1.00') as Positive<Decimal<10, 2>>,
        minDecimal: Decimal.fromStrictString(10, 2, '99.99') as Min<Decimal<10, 2>, '100'>,
        maxDecimal: Decimal.fromStrictString(10, 2, '500.00') as Max<Decimal<10, 2>, '1000'>,
        rangeDecimal: Decimal.fromStrictString(10, 2, '500.00') as Range<Decimal<10, 2>, '0', '999.99'>,
      }),
      ValidationError
    );
  });
});

describe('OptionalValidators', () => {
  it('should validate required field', () => {
    const msg = new OptionalValidators({
      requiredPositive: 1 as Positive<number>,
      nullablePositive: null,
    });
    assert.strictEqual(msg.requiredPositive, 1);
  });

  it('should skip validation for undefined optional field', () => {
    // Optional field not provided - should not throw
    const msg = new OptionalValidators({
      requiredPositive: 1 as Positive<number>,
      optionalPositive: undefined,
      nullablePositive: null,
    });
    assert.strictEqual(msg.optionalPositive, undefined);
  });

  it('should validate optional field when provided', () => {
    assert.throws(
      () => new OptionalValidators({
        requiredPositive: 1 as Positive<number>,
        optionalPositive: 0 as Positive<number>, // Invalid: not positive
        nullablePositive: null,
      }),
      ValidationError
    );
  });

  it('should skip validation for null nullable field', () => {
    const msg = new OptionalValidators({
      requiredPositive: 1 as Positive<number>,
      nullablePositive: null,
    });
    assert.strictEqual(msg.nullablePositive, null);
  });
});

describe('ArrayValidators', () => {
  it('should accept valid arrays', () => {
    const msg = new ArrayValidators({
      nonEmptyArray: ['hello'] as NonEmpty<string[]>,
      minLengthArray: [1] as MinLength<number[], 1>,
      maxLengthArray: [1, 2, 3] as MaxLength<number[], 10>,
    });
    assert.strictEqual(msg.nonEmptyArray.length, 1);
  });

  it('should reject empty array for NonEmpty', () => {
    assert.throws(
      () => new ArrayValidators({
        nonEmptyArray: [] as unknown as NonEmpty<string[]>,
        minLengthArray: [1] as MinLength<number[], 1>,
        maxLengthArray: [1] as MaxLength<number[], 10>,
      }),
      ValidationError
    );
  });
});

describe('BigintValidators', () => {
  it('should accept valid bigint values', () => {
    const msg = new BigintValidators({
      positiveBigint: 1n as Positive<bigint>,
      minBigint: 0n as Min<bigint, 0n>,
      maxBigint: 1000n as Max<bigint, 1000000n>,
      rangeBigint: 50n as Range<bigint, 0n, 100n>,
    });
    assert.strictEqual(msg.positiveBigint, 1n);
  });

  it('should reject invalid positive bigint', () => {
    assert.throws(
      () => new BigintValidators({
        positiveBigint: 0n as Positive<bigint>,
        minBigint: 0n as Min<bigint, 0n>,
        maxBigint: 1000n as Max<bigint, 1000000n>,
        rangeBigint: 50n as Range<bigint, 0n, 100n>,
      }),
      ValidationError
    );
  });
});

describe('validateAll', () => {
  it('should collect all validation errors', () => {
    const errors = NumericSignValidators.validateAll({
      positiveNumber: 0 as Positive<number>,
      negativeNumber: 0 as Negative<number>,
      nonNegativeNumber: -1 as NonNegative<number>,
      nonPositiveNumber: 1 as NonPositive<number>,
    });
    // All four fields are invalid
    assert.strictEqual(errors.length, 4);
  });

  it('should return empty array for valid data', () => {
    const errors = NumericSignValidators.validateAll({
      positiveNumber: 1 as Positive<number>,
      negativeNumber: -1 as Negative<number>,
      nonNegativeNumber: 0 as NonNegative<number>,
      nonPositiveNumber: 0 as NonPositive<number>,
    });
    assert.strictEqual(errors.length, 0);
  });
});
