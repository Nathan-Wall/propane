import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  toDecimal,
  assertDecimal,
  ensureDecimal,
  decimalCompare,
  decimalEquals,
  decimalGreaterThan,
  decimalGreaterThanOrEqual,
  decimalLessThan,
  decimalLessThanOrEqual,
  decimalIsPositive,
  decimalIsNegative,
  decimalIsZero,
  decimalIsNonNegative,
  decimalIsNonPositive,
  decimalInRange,
  decimalInRangeExclusive,
} from '@/common/numbers/decimal.js';

describe('toDecimal', () => {
  describe('valid string inputs', () => {
    it('should accept valid decimal strings', () => {
      assert.strictEqual(toDecimal(10, 2, '123.45'), '123.45');
      assert.strictEqual(toDecimal(10, 2, '0.99'), '0.99');
      assert.strictEqual(toDecimal(10, 2, '1.00'), '1.00');
    });

    it('should accept integers and pad to scale', () => {
      assert.strictEqual(toDecimal(10, 2, '100'), '100.00');
      assert.strictEqual(toDecimal(10, 4, '42'), '42.0000');
    });

    it('should accept negative values', () => {
      assert.strictEqual(toDecimal(10, 2, '-123.45'), '-123.45');
      assert.strictEqual(toDecimal(10, 2, '-0.01'), '-0.01');
    });

    it('should pad shorter decimal parts to match scale', () => {
      assert.strictEqual(toDecimal(10, 4, '3.14'), '3.1400');
      assert.strictEqual(toDecimal(10, 3, '1.5'), '1.500');
    });

    it('should accept zero', () => {
      assert.strictEqual(toDecimal(10, 2, '0'), '0.00');
      assert.strictEqual(toDecimal(10, 2, '0.00'), '0.00');
    });

    it('should handle scale of 0 (integers only)', () => {
      assert.strictEqual(toDecimal(10, 0, '12345'), '12345');
      assert.strictEqual(toDecimal(5, 0, '99999'), '99999');
    });

    it('should normalize leading zeros in integer part', () => {
      // Leading zeros are stripped during normalization
      assert.strictEqual(toDecimal(10, 2, '00123.45'), '123.45');
      assert.strictEqual(toDecimal(10, 2, '007'), '7.00');
      assert.strictEqual(toDecimal(10, 2, '00.5'), '0.50');
    });
  });

  describe('valid number inputs (with rounding)', () => {
    it('should round floating-point numbers to scale', () => {
      assert.strictEqual(toDecimal(10, 2, 1 / 3), '0.33');
      assert.strictEqual(toDecimal(10, 4, 1 / 3), '0.3333');
      assert.strictEqual(toDecimal(10, 6, 1 / 3), '0.333333');
    });

    it('should round up when appropriate', () => {
      assert.strictEqual(toDecimal(10, 2, 0.335), '0.34');
      // Note: 0.345 is 0.344999... in floating-point, so rounds to 0.34
      assert.strictEqual(toDecimal(10, 2, 0.3451), '0.35');
      assert.strictEqual(toDecimal(10, 2, 1.999), '2.00');
    });

    it('should round down when appropriate', () => {
      assert.strictEqual(toDecimal(10, 2, 0.334), '0.33');
      assert.strictEqual(toDecimal(10, 2, 0.344), '0.34');
    });

    it('should handle PI', () => {
      assert.strictEqual(toDecimal(10, 2, Math.PI), '3.14');
      assert.strictEqual(toDecimal(10, 5, Math.PI), '3.14159');
    });

    it('should handle negative floating-point numbers', () => {
      assert.strictEqual(toDecimal(10, 2, -1 / 3), '-0.33');
      assert.strictEqual(toDecimal(10, 2, -0.335), '-0.34');
    });

    it('should handle whole numbers passed as number type', () => {
      assert.strictEqual(toDecimal(10, 2, 100), '100.00');
      assert.strictEqual(toDecimal(10, 2, -50), '-50.00');
    });

    it('should handle very small numbers', () => {
      assert.strictEqual(toDecimal(10, 6, 0.000001), '0.000001');
      assert.strictEqual(toDecimal(10, 2, 0.001), '0.00');
    });
  });

  describe('precision validation', () => {
    it('should accept values at maximum precision', () => {
      assert.strictEqual(toDecimal(5, 2, '123.45'), '123.45');
      assert.strictEqual(toDecimal(10, 2, '12345678.90'), '12345678.90');
    });

    it('should reject values exceeding precision', () => {
      assert.throws(
        () => toDecimal(5, 2, '1234.56'),
        /precision exceeded.*6.*maximum is 5/i
      );
      assert.throws(
        () => toDecimal(10, 2, '123456789.00'),
        /precision exceeded.*11.*maximum is 10/i
      );
    });

    it('should count significant digits correctly for small decimals', () => {
      // 0.00123 -> leading zeros in decimal don't count, 3 significant digits
      assert.strictEqual(toDecimal(5, 5, '0.00123'), '0.00123');
      // Precision of 3 is enough for 3 significant digits
      assert.strictEqual(toDecimal(3, 3, '0.123'), '0.123');
      // But precision of 2 is not enough
      assert.throws(
        () => toDecimal(2, 3, '0.123'),
        /scale.*cannot exceed precision/i
      );

      // Scale exceeded tests (string input is strict)
      assert.throws(
        () => toDecimal(5, 2, '0.123'),
        /scale exceeded/i
      );
    });

    it('should count significant digits correctly for integers with leading zeros', () => {
      // Leading zeros in integer part don't count toward precision
      // 00123.45 = 123.45 = 5 significant digits (3 integer + 2 decimal)
      // Output is normalized (leading zeros stripped)
      assert.strictEqual(toDecimal(5, 2, '00123.45'), '123.45');
      assert.throws(
        () => toDecimal(4, 2, '00123.45'),
        /precision exceeded/i
      );
      // 007.00 = 7.00 = 3 digits (1 integer + 2 decimal places)
      // Decimal places always count toward precision
      // Output is normalized (leading zeros stripped)
      assert.strictEqual(toDecimal(3, 2, '007.00'), '7.00');
      assert.throws(
        () => toDecimal(2, 2, '007.00'),
        /precision exceeded/i
      );
    });

    it('should reject number inputs that exceed precision after rounding', () => {
      // 123456789.99 has 11 significant digits
      assert.throws(
        () => toDecimal(10, 2, 123456789.99),
        /precision exceeded/i
      );
    });
  });

  describe('scale validation', () => {
    it('should reject string values exceeding scale', () => {
      assert.throws(
        () => toDecimal(10, 2, '123.456'),
        /scale exceeded.*3.*maximum is 2/i
      );
      assert.throws(
        () => toDecimal(10, 0, '123.4'),
        /scale exceeded.*1.*maximum is 0/i
      );
    });

    it('should allow number values with excess decimal places (rounds them)', () => {
      // Numbers get rounded, so this should work
      assert.strictEqual(toDecimal(10, 2, 123.456), '123.46');
      assert.strictEqual(toDecimal(10, 0, 123.456), '123');
    });
  });

  describe('scale vs precision validation', () => {
    it('should reject scale greater than precision', () => {
      assert.throws(
        () => toDecimal(5, 10, '1.5'),
        /scale.*10.*cannot exceed precision.*5/i
      );
      assert.throws(
        () => toDecimal(2, 5, 1.5),
        /scale.*5.*cannot exceed precision.*2/i
      );
    });

    it('should allow scale equal to precision', () => {
      assert.strictEqual(toDecimal(4, 4, '0.1234'), '0.1234');
    });

    it('should reject non-integer precision', () => {
      assert.throws(
        () => toDecimal(5.5, 2, '1.5'),
        /Invalid decimal precision.*5.5.*must be a positive integer/i
      );
    });

    it('should reject negative precision', () => {
      assert.throws(
        () => toDecimal(-1, 2, '1.5'),
        /Invalid decimal precision.*-1.*must be a positive integer/i
      );
    });

    it('should reject zero precision', () => {
      assert.throws(
        () => toDecimal(0, 0, '5'),
        /Invalid decimal precision.*0.*must be a positive integer/i
      );
    });

    it('should reject non-integer scale', () => {
      assert.throws(
        () => toDecimal(10, 2.5, '1.5'),
        /Invalid decimal scale.*2.5.*must be a non-negative integer/i
      );
    });

    it('should reject negative scale', () => {
      assert.throws(
        () => toDecimal(10, -1, '1.5'),
        /Invalid decimal scale.*-1.*must be a non-negative integer/i
      );
    });
  });

  describe('invalid format', () => {
    it('should reject non-numeric strings', () => {
      assert.throws(() => toDecimal(10, 2, 'abc'), TypeError);
      assert.throws(() => toDecimal(10, 2, '12.34.56'), TypeError);
      assert.throws(() => toDecimal(10, 2, ''), TypeError);
      assert.throws(() => toDecimal(10, 2, ' '), TypeError);
    });

    it('should reject strings with invalid characters', () => {
      assert.throws(() => toDecimal(10, 2, '12,345.67'), TypeError);
      assert.throws(() => toDecimal(10, 2, '$100.00'), TypeError);
      assert.throws(() => toDecimal(10, 2, '1e5'), TypeError);
    });

    it('should reject Infinity', () => {
      assert.throws(() => toDecimal(10, 2, Infinity), TypeError);
      assert.throws(() => toDecimal(10, 2, -Infinity), TypeError);
    });

    it('should reject NaN', () => {
      assert.throws(() => toDecimal(10, 2, NaN), TypeError);
    });
  });

  describe('edge cases', () => {
    it('should handle maximum safe integer', () => {
      // Number.MAX_SAFE_INTEGER = 9007199254740991 (16 digits)
      assert.strictEqual(
        toDecimal(20, 2, Number.MAX_SAFE_INTEGER),
        '9007199254740991.00'
      );
    });

    it('should handle very large string values', () => {
      assert.strictEqual(
        toDecimal(30, 2, '123456789012345678901234567.89'),
        '123456789012345678901234567.89'
      );
    });

    it('should handle negative zero', () => {
      // -0 becomes '0.00' when converted
      assert.strictEqual(toDecimal(10, 2, -0), '0.00');
    });

    it('should handle string negative zero', () => {
      assert.strictEqual(toDecimal(10, 2, '-0'), '-0.00');
      assert.strictEqual(toDecimal(10, 2, '-0.00'), '-0.00');
    });

    it('should preserve exact string representation for critical values', () => {
      // These values might be imprecise as floating-point
      assert.strictEqual(toDecimal(10, 2, '0.10'), '0.10');
      assert.strictEqual(toDecimal(10, 2, '0.30'), '0.30');
    });

    it('should handle precision = scale (all decimal digits)', () => {
      assert.strictEqual(toDecimal(4, 4, '0.1234'), '0.1234');
      assert.strictEqual(toDecimal(2, 2, '0.99'), '0.99');
    });

    it('should handle large precision with large scale', () => {
      assert.strictEqual(
        toDecimal(38, 18, '12345678901234567890.123456789012345678'),
        '12345678901234567890.123456789012345678'
      );
    });
  });
});

describe('decimalCompare', () => {
  describe('equal values', () => {
    it('should return 0 for identical strings', () => {
      // @ts-expect-error testing decimal functions with string literals
      assert.strictEqual(decimalCompare('10.50', '10.50'), 0);
      // @ts-expect-error testing decimal functions with string literals
      assert.strictEqual(decimalCompare('0', '0'), 0);
      // @ts-expect-error testing decimal functions with string literals
      assert.strictEqual(decimalCompare('-5.25', '-5.25'), 0);
    });

    it('should return 0 for equivalent values with different formatting', () => {
      // @ts-expect-error testing decimal functions with string literals
      assert.strictEqual(decimalCompare('10.50', '10.5'), 0);
      // @ts-expect-error testing decimal functions with string literals
      assert.strictEqual(decimalCompare('10.00', '10'), 0);
      // @ts-expect-error testing decimal functions with string literals
      assert.strictEqual(decimalCompare('007.50', '7.5'), 0);
      // @ts-expect-error testing decimal functions with string literals
      assert.strictEqual(decimalCompare('0.0', '0'), 0);
    });
  });

  describe('positive comparisons', () => {
    it('should compare positive values correctly', () => {
      // @ts-expect-error testing decimal functions with string literals
      assert.strictEqual(decimalCompare('10.50', '10.49'), 1);
      // @ts-expect-error testing decimal functions with string literals
      assert.strictEqual(decimalCompare('10.49', '10.50'), -1);
      // @ts-expect-error testing decimal functions with string literals
      assert.strictEqual(decimalCompare('100', '99.99'), 1);
      // @ts-expect-error testing decimal functions with string literals
      assert.strictEqual(decimalCompare('99.99', '100'), -1);
    });

    it('should handle different integer lengths', () => {
      // @ts-expect-error testing decimal functions with string literals
      assert.strictEqual(decimalCompare('1000', '999'), 1);
      // @ts-expect-error testing decimal functions with string literals
      assert.strictEqual(decimalCompare('999', '1000'), -1);
      // @ts-expect-error testing decimal functions with string literals
      assert.strictEqual(decimalCompare('10', '9'), 1);
    });
  });

  describe('negative comparisons', () => {
    it('should compare negative values correctly', () => {
      // @ts-expect-error testing decimal functions with string literals
      assert.strictEqual(decimalCompare('-5.00', '-10.00'), 1);
      // @ts-expect-error testing decimal functions with string literals
      assert.strictEqual(decimalCompare('-10.00', '-5.00'), -1);
      // @ts-expect-error testing decimal functions with string literals
      assert.strictEqual(decimalCompare('-0.01', '-0.02'), 1);
    });
  });

  describe('mixed sign comparisons', () => {
    it('should always order negative before positive', () => {
      // @ts-expect-error testing decimal functions with string literals
      assert.strictEqual(decimalCompare('-1', '1'), -1);
      // @ts-expect-error testing decimal functions with string literals
      assert.strictEqual(decimalCompare('1', '-1'), 1);
      // @ts-expect-error testing decimal functions with string literals
      assert.strictEqual(decimalCompare('-0.01', '0.01'), -1);
      // @ts-expect-error testing decimal functions with string literals
      assert.strictEqual(decimalCompare('-1000', '0.001'), -1);
    });
  });

  describe('zero comparisons', () => {
    it('should treat different zero representations as equal', () => {
      // @ts-expect-error testing decimal functions with string literals
      assert.strictEqual(decimalCompare('0', '0.00'), 0);
      // @ts-expect-error testing decimal functions with string literals
      assert.strictEqual(decimalCompare('-0', '0'), 0);
      // @ts-expect-error testing decimal functions with string literals
      assert.strictEqual(decimalCompare('-0.00', '0.00'), 0);
    });

    it('should compare zero with positive/negative correctly', () => {
      // @ts-expect-error testing decimal functions with string literals
      assert.strictEqual(decimalCompare('0', '0.01'), -1);
      // @ts-expect-error testing decimal functions with string literals
      assert.strictEqual(decimalCompare('0', '-0.01'), 1);
    });
  });
});

describe('decimalEquals', () => {
  it('should return true for equal values', () => {
    // @ts-expect-error testing decimal functions with string literals
    assert.strictEqual(decimalEquals('10.50', '10.5'), true);
    // @ts-expect-error testing decimal functions with string literals
    assert.strictEqual(decimalEquals('100', '100.00'), true);
    // @ts-expect-error testing decimal functions with string literals
    assert.strictEqual(decimalEquals('-5', '-5.0'), true);
  });

  it('should return false for unequal values', () => {
    // @ts-expect-error testing decimal functions with string literals
    assert.strictEqual(decimalEquals('10.50', '10.51'), false);
    // @ts-expect-error testing decimal functions with string literals
    assert.strictEqual(decimalEquals('100', '-100'), false);
  });
});

describe('decimalGreaterThan', () => {
  it('should return true when a > b', () => {
    // @ts-expect-error testing decimal functions with string literals
    assert.strictEqual(decimalGreaterThan('10.50', '10.49'), true);
    // @ts-expect-error testing decimal functions with string literals
    assert.strictEqual(decimalGreaterThan('0', '-1'), true);
  });

  it('should return false when a <= b', () => {
    // @ts-expect-error testing decimal functions with string literals
    assert.strictEqual(decimalGreaterThan('10.50', '10.50'), false);
    // @ts-expect-error testing decimal functions with string literals
    assert.strictEqual(decimalGreaterThan('10.49', '10.50'), false);
  });
});

describe('decimalGreaterThanOrEqual', () => {
  it('should return true when a >= b', () => {
    // @ts-expect-error testing decimal functions with string literals
    assert.strictEqual(decimalGreaterThanOrEqual('10.50', '10.49'), true);
    // @ts-expect-error testing decimal functions with string literals
    assert.strictEqual(decimalGreaterThanOrEqual('10.50', '10.50'), true);
  });

  it('should return false when a < b', () => {
    // @ts-expect-error testing decimal functions with string literals
    assert.strictEqual(decimalGreaterThanOrEqual('10.49', '10.50'), false);
  });
});

describe('decimalLessThan', () => {
  it('should return true when a < b', () => {
    // @ts-expect-error testing decimal functions with string literals
    assert.strictEqual(decimalLessThan('10.49', '10.50'), true);
    // @ts-expect-error testing decimal functions with string literals
    assert.strictEqual(decimalLessThan('-1', '0'), true);
  });

  it('should return false when a >= b', () => {
    // @ts-expect-error testing decimal functions with string literals
    assert.strictEqual(decimalLessThan('10.50', '10.50'), false);
    // @ts-expect-error testing decimal functions with string literals
    assert.strictEqual(decimalLessThan('10.50', '10.49'), false);
  });
});

describe('decimalLessThanOrEqual', () => {
  it('should return true when a <= b', () => {
    // @ts-expect-error testing decimal functions with string literals
    assert.strictEqual(decimalLessThanOrEqual('10.49', '10.50'), true);
    // @ts-expect-error testing decimal functions with string literals
    assert.strictEqual(decimalLessThanOrEqual('10.50', '10.50'), true);
  });

  it('should return false when a > b', () => {
    // @ts-expect-error testing decimal functions with string literals
    assert.strictEqual(decimalLessThanOrEqual('10.51', '10.50'), false);
  });
});

describe('decimalIsPositive', () => {
  it('should return true for positive values', () => {
    // @ts-expect-error testing decimal functions with string literals
    assert.strictEqual(decimalIsPositive('10.50'), true);
    // @ts-expect-error testing decimal functions with string literals
    assert.strictEqual(decimalIsPositive('0.01'), true);
    // @ts-expect-error testing decimal functions with string literals
    assert.strictEqual(decimalIsPositive('1'), true);
  });

  it('should return false for zero', () => {
    // @ts-expect-error testing decimal functions with string literals
    assert.strictEqual(decimalIsPositive('0'), false);
    // @ts-expect-error testing decimal functions with string literals
    assert.strictEqual(decimalIsPositive('0.00'), false);
    // @ts-expect-error testing decimal functions with string literals
    assert.strictEqual(decimalIsPositive('0.0000'), false);
  });

  it('should return false for negative values', () => {
    // @ts-expect-error testing decimal functions with string literals
    assert.strictEqual(decimalIsPositive('-10.50'), false);
    // @ts-expect-error testing decimal functions with string literals
    assert.strictEqual(decimalIsPositive('-0.01'), false);
  });
});

describe('decimalIsNegative', () => {
  it('should return true for negative values', () => {
    // @ts-expect-error testing decimal functions with string literals
    assert.strictEqual(decimalIsNegative('-10.50'), true);
    // @ts-expect-error testing decimal functions with string literals
    assert.strictEqual(decimalIsNegative('-0.01'), true);
    // @ts-expect-error testing decimal functions with string literals
    assert.strictEqual(decimalIsNegative('-1'), true);
  });

  it('should return false for zero', () => {
    // @ts-expect-error testing decimal functions with string literals
    assert.strictEqual(decimalIsNegative('0'), false);
    // @ts-expect-error testing decimal functions with string literals
    assert.strictEqual(decimalIsNegative('-0'), false);
    // @ts-expect-error testing decimal functions with string literals
    assert.strictEqual(decimalIsNegative('-0.00'), false);
  });

  it('should return false for positive values', () => {
    // @ts-expect-error testing decimal functions with string literals
    assert.strictEqual(decimalIsNegative('10.50'), false);
    // @ts-expect-error testing decimal functions with string literals
    assert.strictEqual(decimalIsNegative('0.01'), false);
  });
});

describe('decimalIsZero', () => {
  it('should return true for zero values', () => {
    // @ts-expect-error testing decimal functions with string literals
    assert.strictEqual(decimalIsZero('0'), true);
    // @ts-expect-error testing decimal functions with string literals
    assert.strictEqual(decimalIsZero('0.00'), true);
    // @ts-expect-error testing decimal functions with string literals
    assert.strictEqual(decimalIsZero('-0'), true);
    // @ts-expect-error testing decimal functions with string literals
    assert.strictEqual(decimalIsZero('-0.00'), true);
    // @ts-expect-error testing decimal functions with string literals
    assert.strictEqual(decimalIsZero('0.0000000'), true);
  });

  it('should return false for non-zero values', () => {
    // @ts-expect-error testing decimal functions with string literals
    assert.strictEqual(decimalIsZero('0.01'), false);
    // @ts-expect-error testing decimal functions with string literals
    assert.strictEqual(decimalIsZero('-0.01'), false);
    // @ts-expect-error testing decimal functions with string literals
    assert.strictEqual(decimalIsZero('1'), false);
  });
});

describe('decimalIsNonNegative', () => {
  it('should return true for positive and zero values', () => {
    // @ts-expect-error testing decimal functions with string literals
    assert.strictEqual(decimalIsNonNegative('10.50'), true);
    // @ts-expect-error testing decimal functions with string literals
    assert.strictEqual(decimalIsNonNegative('0'), true);
    // @ts-expect-error testing decimal functions with string literals
    assert.strictEqual(decimalIsNonNegative('0.00'), true);
  });

  it('should return false for negative values', () => {
    // @ts-expect-error testing decimal functions with string literals
    assert.strictEqual(decimalIsNonNegative('-0.01'), false);
    // @ts-expect-error testing decimal functions with string literals
    assert.strictEqual(decimalIsNonNegative('-10.50'), false);
  });
});

describe('decimalIsNonPositive', () => {
  it('should return true for negative and zero values', () => {
    // @ts-expect-error testing decimal functions with string literals
    assert.strictEqual(decimalIsNonPositive('-10.50'), true);
    // @ts-expect-error testing decimal functions with string literals
    assert.strictEqual(decimalIsNonPositive('0'), true);
    // @ts-expect-error testing decimal functions with string literals
    assert.strictEqual(decimalIsNonPositive('-0.00'), true);
  });

  it('should return false for positive values', () => {
    // @ts-expect-error testing decimal functions with string literals
    assert.strictEqual(decimalIsNonPositive('0.01'), false);
    // @ts-expect-error testing decimal functions with string literals
    assert.strictEqual(decimalIsNonPositive('10.50'), false);
  });
});

describe('decimalInRange', () => {
  it('should return true for values within range (inclusive)', () => {
    // @ts-expect-error testing decimal functions with string literals
    assert.strictEqual(decimalInRange('50', '0', '100'), true);
    // @ts-expect-error testing decimal functions with string literals
    assert.strictEqual(decimalInRange('0', '0', '100'), true);
    // @ts-expect-error testing decimal functions with string literals
    assert.strictEqual(decimalInRange('100', '0', '100'), true);
    // @ts-expect-error testing decimal functions with string literals
    assert.strictEqual(decimalInRange('0.5', '0', '1'), true);
  });

  it('should return false for values outside range', () => {
    // @ts-expect-error testing decimal functions with string literals
    assert.strictEqual(decimalInRange('-0.01', '0', '100'), false);
    // @ts-expect-error testing decimal functions with string literals
    assert.strictEqual(decimalInRange('100.01', '0', '100'), false);
    // @ts-expect-error testing decimal functions with string literals
    assert.strictEqual(decimalInRange('200', '0', '100'), false);
  });

  it('should handle negative ranges', () => {
    // @ts-expect-error testing decimal functions with string literals
    assert.strictEqual(decimalInRange('-50', '-100', '0'), true);
    // @ts-expect-error testing decimal functions with string literals
    assert.strictEqual(decimalInRange('-100', '-100', '0'), true);
    // @ts-expect-error testing decimal functions with string literals
    assert.strictEqual(decimalInRange('0', '-100', '0'), true);
    // @ts-expect-error testing decimal functions with string literals
    assert.strictEqual(decimalInRange('-101', '-100', '0'), false);
  });
});

describe('decimalInRangeExclusive', () => {
  it('should return true for values strictly within range', () => {
    // @ts-expect-error testing decimal functions with string literals
    assert.strictEqual(decimalInRangeExclusive('50', '0', '100'), true);
    // @ts-expect-error testing decimal functions with string literals
    assert.strictEqual(decimalInRangeExclusive('0.01', '0', '100'), true);
    // @ts-expect-error testing decimal functions with string literals
    assert.strictEqual(decimalInRangeExclusive('99.99', '0', '100'), true);
  });

  it('should return false for boundary values', () => {
    // @ts-expect-error testing decimal functions with string literals
    assert.strictEqual(decimalInRangeExclusive('0', '0', '100'), false);
    // @ts-expect-error testing decimal functions with string literals
    assert.strictEqual(decimalInRangeExclusive('100', '0', '100'), false);
  });

  it('should return false for values outside range', () => {
    // @ts-expect-error testing decimal functions with string literals
    assert.strictEqual(decimalInRangeExclusive('-0.01', '0', '100'), false);
    // @ts-expect-error testing decimal functions with string literals
    assert.strictEqual(decimalInRangeExclusive('100.01', '0', '100'), false);
  });
});

describe('assertDecimal', () => {
  describe('single argument (format only)', () => {
    it('should return the value for valid normalized decimal strings', () => {
      assert.strictEqual(assertDecimal('123.45'), '123.45');
      assert.strictEqual(assertDecimal('0'), '0');
      assert.strictEqual(assertDecimal('-99.99'), '-99.99');
      assert.strictEqual(assertDecimal('0.10'), '0.10');
      assert.strictEqual(assertDecimal('1.0'), '1.0');
    });

    it('should throw for non-normalized formats', () => {
      assert.throws(() => assertDecimal('00.1'), TypeError);
      assert.throws(() => assertDecimal('007'), TypeError);
      assert.throws(() => assertDecimal('00.10'), TypeError);
      assert.throws(() => assertDecimal('01'), TypeError);
    });

    it('should throw for invalid formats', () => {
      assert.throws(() => assertDecimal('abc'), TypeError);
      assert.throws(() => assertDecimal('1.2.3'), TypeError);
      assert.throws(() => assertDecimal(''), TypeError);
      assert.throws(() => assertDecimal('$100'), TypeError);
    });
  });

  describe('three arguments (precision, scale, value)', () => {
    it('should return the value for valid decimal with exact scale', () => {
      assert.strictEqual(assertDecimal(10, 2, '123.45'), '123.45');
      assert.strictEqual(assertDecimal(10, 2, '0.00'), '0.00');
      assert.strictEqual(assertDecimal(5, 0, '12345'), '12345');
    });

    it('should throw for scale mismatch', () => {
      assert.throws(() => assertDecimal(10, 2, '123.4'), TypeError);
      assert.throws(() => assertDecimal(10, 2, '123'), TypeError);
      assert.throws(() => assertDecimal(10, 2, '123.456'), TypeError);
    });

    it('should throw for precision exceeded', () => {
      assert.throws(() => assertDecimal(5, 2, '1234.56'), TypeError);
    });

    it('should throw for non-normalized formats', () => {
      assert.throws(() => assertDecimal(10, 2, '00.10'), TypeError);
      assert.throws(() => assertDecimal(10, 2, '007.00'), TypeError);
      assert.throws(() => assertDecimal(10, 2, '0123.45'), TypeError);
    });
  });

  describe('toDecimal output compatibility', () => {
    it('should accept toDecimal output in single-arg form', () => {
      // This was the bug: toDecimal output with leading zeros in input
      // would fail assertDecimal. Now toDecimal normalizes, so this works.
      const val1 = toDecimal(10, 2, '00.1');
      assert.doesNotThrow(() => assertDecimal(val1));
      assert.strictEqual(assertDecimal(val1), '0.10');

      const val2 = toDecimal(10, 2, '007');
      assert.doesNotThrow(() => assertDecimal(val2));
      assert.strictEqual(assertDecimal(val2), '7.00');
    });

    it('should accept toDecimal output in three-arg form', () => {
      const val = toDecimal(10, 2, '00123.45');
      assert.doesNotThrow(() => assertDecimal(10, 2, val));
      assert.strictEqual(val, '123.45');
    });
  });
});

describe('ensureDecimal', () => {
  describe('single argument (format only)', () => {
    it('should return the value for valid normalized decimal strings', () => {
      assert.strictEqual(ensureDecimal('123.45'), '123.45');
      assert.strictEqual(ensureDecimal('0'), '0');
      assert.strictEqual(ensureDecimal('-99.99'), '-99.99');
      assert.strictEqual(ensureDecimal('0.10'), '0.10');
      assert.strictEqual(ensureDecimal('1.0'), '1.0');
    });

    it('should throw for non-normalized formats', () => {
      assert.throws(() => ensureDecimal('00.1'), TypeError);
      assert.throws(() => ensureDecimal('007'), TypeError);
      assert.throws(() => ensureDecimal('00.10'), TypeError);
      assert.throws(() => ensureDecimal('01'), TypeError);
    });

    it('should throw for invalid formats', () => {
      assert.throws(() => ensureDecimal('abc'), TypeError);
      assert.throws(() => ensureDecimal('1.2.3'), TypeError);
      assert.throws(() => ensureDecimal(''), TypeError);
      assert.throws(() => ensureDecimal('$100'), TypeError);
    });
  });

  describe('three arguments (precision, scale, value)', () => {
    it('should return the value for valid decimal with exact scale', () => {
      assert.strictEqual(ensureDecimal(10, 2, '123.45'), '123.45');
      assert.strictEqual(ensureDecimal(10, 2, '0.00'), '0.00');
      assert.strictEqual(ensureDecimal(5, 0, '12345'), '12345');
    });

    it('should throw for scale mismatch', () => {
      assert.throws(() => ensureDecimal(10, 2, '123.4'), TypeError);
      assert.throws(() => ensureDecimal(10, 2, '123'), TypeError);
      assert.throws(() => ensureDecimal(10, 2, '123.456'), TypeError);
    });

    it('should throw for precision exceeded', () => {
      assert.throws(() => ensureDecimal(5, 2, '1234.56'), TypeError);
    });

    it('should throw for non-normalized formats', () => {
      assert.throws(() => ensureDecimal(10, 2, '00.10'), TypeError);
      assert.throws(() => ensureDecimal(10, 2, '007.00'), TypeError);
      assert.throws(() => ensureDecimal(10, 2, '0123.45'), TypeError);
    });
  });

  describe('toDecimal output compatibility', () => {
    it('should accept toDecimal output in single-arg form', () => {
      const val1 = toDecimal(10, 2, '00.1');
      assert.doesNotThrow(() => ensureDecimal(val1));
      assert.strictEqual(ensureDecimal(val1), '0.10');

      const val2 = toDecimal(10, 2, '007');
      assert.doesNotThrow(() => ensureDecimal(val2));
      assert.strictEqual(ensureDecimal(val2), '7.00');
    });

    it('should accept toDecimal output in three-arg form', () => {
      const val = toDecimal(10, 2, '00123.45');
      assert.doesNotThrow(() => ensureDecimal(10, 2, val));
      assert.strictEqual(val, '123.45');
    });
  });
});

describe('non-normalized format handling', () => {
  it('decimalCompare should treat non-normalized formats as equal', () => {
    // @ts-expect-error testing with string literals
    assert.strictEqual(decimalCompare('00.1', '0.1'), 0);
    // @ts-expect-error testing with string literals
    assert.strictEqual(decimalCompare('00.10', '0.1'), 0);
    // @ts-expect-error testing with string literals
    assert.strictEqual(decimalCompare('007', '7'), 0);
    // @ts-expect-error testing with string literals
    assert.strictEqual(decimalCompare('007.00', '7'), 0);
    // @ts-expect-error testing with string literals
    assert.strictEqual(decimalCompare('-00.5', '-0.5'), 0);
  });

  it('decimalIsPositive should handle non-normalized formats', () => {
    // @ts-expect-error testing with string literals
    assert.strictEqual(decimalIsPositive('00.1'), true);
    // @ts-expect-error testing with string literals
    assert.strictEqual(decimalIsPositive('007'), true);
    // @ts-expect-error testing with string literals
    assert.strictEqual(decimalIsPositive('00.00'), false);
  });

  it('decimalIsNegative should handle non-normalized formats', () => {
    // @ts-expect-error testing with string literals
    assert.strictEqual(decimalIsNegative('-00.1'), true);
    // @ts-expect-error testing with string literals
    assert.strictEqual(decimalIsNegative('-007'), true);
    // @ts-expect-error testing with string literals
    assert.strictEqual(decimalIsNegative('-00.00'), false);
  });

  it('decimalIsZero should handle non-normalized formats', () => {
    // @ts-expect-error testing with string literals
    assert.strictEqual(decimalIsZero('00.00'), true);
    // @ts-expect-error testing with string literals
    assert.strictEqual(decimalIsZero('000'), true);
    // @ts-expect-error testing with string literals
    assert.strictEqual(decimalIsZero('-00.00'), true);
    // @ts-expect-error testing with string literals
    assert.strictEqual(decimalIsZero('00.01'), false);
  });

  it('decimalInRange should handle non-normalized formats', () => {
    // @ts-expect-error testing with string literals
    assert.strictEqual(decimalInRange('007', '0', '10'), true);
    // @ts-expect-error testing with string literals
    assert.strictEqual(decimalInRange('00.5', '00.0', '01.0'), true);
  });
});
