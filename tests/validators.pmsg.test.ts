/**
 * Validator Runtime Tests
 *
 * Tests runtime validation behavior for generated message classes.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert';
import { ValidationError } from '@propanejs/runtime';
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
      positiveNumber: 1,
      negativeNumber: -1,
      nonNegativeNumber: 0,
      nonPositiveNumber: 0,
    });
    assert.strictEqual(msg.positiveNumber, 1);
  });

  it('should reject invalid positive number', () => {
    assert.throws(
      () => new NumericSignValidators({
        positiveNumber: 0,
        negativeNumber: -1,
        nonNegativeNumber: 0,
        nonPositiveNumber: 0,
      }),
      ValidationError
    );
  });

  it('should reject invalid negative number', () => {
    assert.throws(
      () => new NumericSignValidators({
        positiveNumber: 1,
        negativeNumber: 0,
        nonNegativeNumber: 0,
        nonPositiveNumber: 0,
      }),
      ValidationError
    );
  });

  it('should skip validation with skipValidation option', () => {
    // This would normally throw, but skipValidation bypasses it
    const msg = new NumericSignValidators({
      positiveNumber: 0,
      negativeNumber: 0,
      nonNegativeNumber: -1,
      nonPositiveNumber: 1,
    }, { skipValidation: true });
    assert.strictEqual(msg.positiveNumber, 0);
  });
});

describe('NumericBoundValidators', () => {
  it('should accept values within bounds', () => {
    const msg = new NumericBoundValidators({
      minValue: 0,
      maxValue: 100,
      rangeValue: 50,
    });
    assert.strictEqual(msg.rangeValue, 50);
  });

  it('should reject value below min', () => {
    assert.throws(
      () => new NumericBoundValidators({
        minValue: -1,
        maxValue: 50,
        rangeValue: 50,
      }),
      ValidationError
    );
  });

  it('should reject value above max', () => {
    assert.throws(
      () => new NumericBoundValidators({
        minValue: 0,
        maxValue: 101,
        rangeValue: 50,
      }),
      ValidationError
    );
  });

  it('should reject value outside range', () => {
    assert.throws(
      () => new NumericBoundValidators({
        minValue: 0,
        maxValue: 50,
        rangeValue: 101,
      }),
      ValidationError
    );
  });
});

describe('StringValidators', () => {
  it('should accept valid strings', () => {
    const msg = new StringValidators({
      nonEmptyString: 'hello',
      minLengthString: 'abc',
      maxLengthString: 'short',
      exactLengthString: 'hello',
    });
    assert.strictEqual(msg.nonEmptyString, 'hello');
  });

  it('should reject empty string for NonEmpty', () => {
    assert.throws(
      () => new StringValidators({
        nonEmptyString: '',
        minLengthString: 'abc',
        maxLengthString: 'short',
        exactLengthString: 'hello',
      }),
      ValidationError
    );
  });

  it('should reject string below min length', () => {
    assert.throws(
      () => new StringValidators({
        nonEmptyString: 'hello',
        minLengthString: 'ab',
        maxLengthString: 'short',
        exactLengthString: 'hello',
      }),
      ValidationError
    );
  });
});

describe('BrandedValidators', () => {
  it('should accept valid branded values', () => {
    const msg = new BrandedValidators({
      positiveInt32: 1,
      positiveInt53: 1,
      positiveDecimal: '1.00',
      minDecimal: '100.00',
      maxDecimal: '500.00',
      rangeDecimal: '500.00',
    });
    assert.strictEqual(msg.positiveInt32, 1);
    assert.strictEqual(msg.minDecimal, '100.00');
  });

  it('should accept decimal as number input', () => {
    // Validators accept numbers for decimal fields but don't transform them
    // (transformation to decimal string is a separate concern handled by toDecimal)
    const msg = new BrandedValidators({
      positiveInt32: 1,
      positiveInt53: 1,
      positiveDecimal: 1,
      minDecimal: 100,
      maxDecimal: 500,
      rangeDecimal: 500,
    });
    // Number is accepted (validates via canBeDecimal) but not transformed
    assert.strictEqual(msg.positiveDecimal, 1);
  });

  it('should reject decimal below min', () => {
    assert.throws(
      () => new BrandedValidators({
        positiveInt32: 1,
        positiveInt53: 1,
        positiveDecimal: '1.00',
        minDecimal: '99.99',
        maxDecimal: '500.00',
        rangeDecimal: '500.00',
      }),
      ValidationError
    );
  });
});

describe('OptionalValidators', () => {
  it('should validate required field', () => {
    const msg = new OptionalValidators({
      requiredPositive: 1,
    });
    assert.strictEqual(msg.requiredPositive, 1);
  });

  it('should skip validation for undefined optional field', () => {
    // Optional field not provided - should not throw
    const msg = new OptionalValidators({
      requiredPositive: 1,
      optionalPositive: undefined,
    });
    assert.strictEqual(msg.optionalPositive, undefined);
  });

  it('should validate optional field when provided', () => {
    assert.throws(
      () => new OptionalValidators({
        requiredPositive: 1,
        optionalPositive: 0, // Invalid: not positive
      }),
      ValidationError
    );
  });

  it('should skip validation for null nullable field', () => {
    const msg = new OptionalValidators({
      requiredPositive: 1,
      nullablePositive: null,
    });
    assert.strictEqual(msg.nullablePositive, null);
  });
});

describe('ArrayValidators', () => {
  it('should accept valid arrays', () => {
    const msg = new ArrayValidators({
      nonEmptyArray: ['hello'],
      minLengthArray: [1],
      maxLengthArray: [1, 2, 3],
    });
    assert.strictEqual(msg.nonEmptyArray.length, 1);
  });

  it('should reject empty array for NonEmpty', () => {
    assert.throws(
      () => new ArrayValidators({
        nonEmptyArray: [],
        minLengthArray: [1],
        maxLengthArray: [1],
      }),
      ValidationError
    );
  });
});

describe('BigintValidators', () => {
  it('should accept valid bigint values', () => {
    const msg = new BigintValidators({
      positiveBigint: 1n,
      minBigint: 0n,
      maxBigint: 1000n,
      rangeBigint: 50n,
    });
    assert.strictEqual(msg.positiveBigint, 1n);
  });

  it('should reject invalid positive bigint', () => {
    assert.throws(
      () => new BigintValidators({
        positiveBigint: 0n,
        minBigint: 0n,
        maxBigint: 1000n,
        rangeBigint: 50n,
      }),
      ValidationError
    );
  });
});

describe('validateAll', () => {
  it('should collect all validation errors', () => {
    const errors = NumericSignValidators.validateAll({
      positiveNumber: 0,
      negativeNumber: 0,
      nonNegativeNumber: -1,
      nonPositiveNumber: 1,
    });
    // All four fields are invalid
    assert.strictEqual(errors.length, 4);
  });

  it('should return empty array for valid data', () => {
    const errors = NumericSignValidators.validateAll({
      positiveNumber: 1,
      negativeNumber: -1,
      nonNegativeNumber: 0,
      nonPositiveNumber: 0,
    });
    assert.strictEqual(errors.length, 0);
  });
});
