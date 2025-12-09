import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  toInt32,
  toDecimal,
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
  compare,
  equals,
  greaterThan,
  greaterThanOrEqual,
  lessThan,
  lessThanOrEqual,
  isPositive,
  isNegative,
  isZero,
  isNonNegative,
  isNonPositive,
  inRange,
  inRangeExclusive,
  isInteger,
} from '../runtime/common/numbers/scalars.js';

describe('toInt32', () => {
  describe('valid values', () => {
    it('should accept zero', () => {
      assert.strictEqual(toInt32(0), 0);
    });

    it('should accept positive integers', () => {
      assert.strictEqual(toInt32(1), 1);
      assert.strictEqual(toInt32(42), 42);
      assert.strictEqual(toInt32(1000000), 1000000);
    });

    it('should accept negative integers', () => {
      assert.strictEqual(toInt32(-1), -1);
      assert.strictEqual(toInt32(-42), -42);
      assert.strictEqual(toInt32(-1000000), -1000000);
    });

    it('should accept minimum int32 value', () => {
      assert.strictEqual(toInt32(-2_147_483_648), -2_147_483_648);
    });

    it('should accept maximum int32 value', () => {
      assert.strictEqual(toInt32(2_147_483_647), 2_147_483_647);
    });
  });

  describe('invalid values', () => {
    it('should reject non-integers', () => {
      assert.throws(() => toInt32(1.5), TypeError);
      assert.throws(() => toInt32(0.1), TypeError);
      assert.throws(() => toInt32(-3.14), TypeError);
    });

    it('should reject values below minimum', () => {
      assert.throws(() => toInt32(-2_147_483_649), RangeError);
      assert.throws(() => toInt32(-3_000_000_000), RangeError);
    });

    it('should reject values above maximum', () => {
      assert.throws(() => toInt32(2_147_483_648), RangeError);
      assert.throws(() => toInt32(3_000_000_000), RangeError);
    });

    it('should reject NaN', () => {
      assert.throws(() => toInt32(NaN), TypeError);
    });

    it('should reject Infinity', () => {
      // Infinity fails isInteger check before range check
      assert.throws(() => toInt32(Infinity), TypeError);
      assert.throws(() => toInt32(-Infinity), TypeError);
    });
  });
});

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

    it('should handle leading zeros in integer part', () => {
      assert.strictEqual(toDecimal(10, 2, '00123.45'), '00123.45');
      assert.strictEqual(toDecimal(10, 2, '007'), '007.00');
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
      assert.strictEqual(toDecimal(5, 2, '00123.45'), '00123.45');
      assert.throws(
        () => toDecimal(4, 2, '00123.45'),
        /precision exceeded/i
      );
      // 007.00 = 7.00 = 3 digits (1 integer + 2 decimal places)
      // Decimal places always count toward precision
      assert.strictEqual(toDecimal(3, 2, '007.00'), '007.00');
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
      assert.strictEqual(decimalCompare('10.50', '10.50'), 0);
      assert.strictEqual(decimalCompare('0', '0'), 0);
      assert.strictEqual(decimalCompare('-5.25', '-5.25'), 0);
    });

    it('should return 0 for equivalent values with different formatting', () => {
      assert.strictEqual(decimalCompare('10.50', '10.5'), 0);
      assert.strictEqual(decimalCompare('10.00', '10'), 0);
      assert.strictEqual(decimalCompare('007.50', '7.5'), 0);
      assert.strictEqual(decimalCompare('0.0', '0'), 0);
    });
  });

  describe('positive comparisons', () => {
    it('should compare positive values correctly', () => {
      assert.strictEqual(decimalCompare('10.50', '10.49'), 1);
      assert.strictEqual(decimalCompare('10.49', '10.50'), -1);
      assert.strictEqual(decimalCompare('100', '99.99'), 1);
      assert.strictEqual(decimalCompare('99.99', '100'), -1);
    });

    it('should handle different integer lengths', () => {
      assert.strictEqual(decimalCompare('1000', '999'), 1);
      assert.strictEqual(decimalCompare('999', '1000'), -1);
      assert.strictEqual(decimalCompare('10', '9'), 1);
    });
  });

  describe('negative comparisons', () => {
    it('should compare negative values correctly', () => {
      assert.strictEqual(decimalCompare('-5.00', '-10.00'), 1);
      assert.strictEqual(decimalCompare('-10.00', '-5.00'), -1);
      assert.strictEqual(decimalCompare('-0.01', '-0.02'), 1);
    });
  });

  describe('mixed sign comparisons', () => {
    it('should always order negative before positive', () => {
      assert.strictEqual(decimalCompare('-1', '1'), -1);
      assert.strictEqual(decimalCompare('1', '-1'), 1);
      assert.strictEqual(decimalCompare('-0.01', '0.01'), -1);
      assert.strictEqual(decimalCompare('-1000', '0.001'), -1);
    });
  });

  describe('zero comparisons', () => {
    it('should treat different zero representations as equal', () => {
      assert.strictEqual(decimalCompare('0', '0.00'), 0);
      assert.strictEqual(decimalCompare('-0', '0'), 0);
      assert.strictEqual(decimalCompare('-0.00', '0.00'), 0);
    });

    it('should compare zero with positive/negative correctly', () => {
      assert.strictEqual(decimalCompare('0', '0.01'), -1);
      assert.strictEqual(decimalCompare('0', '-0.01'), 1);
    });
  });
});

describe('decimalEquals', () => {
  it('should return true for equal values', () => {
    assert.strictEqual(decimalEquals('10.50', '10.5'), true);
    assert.strictEqual(decimalEquals('100', '100.00'), true);
    assert.strictEqual(decimalEquals('-5', '-5.0'), true);
  });

  it('should return false for unequal values', () => {
    assert.strictEqual(decimalEquals('10.50', '10.51'), false);
    assert.strictEqual(decimalEquals('100', '-100'), false);
  });
});

describe('decimalGreaterThan', () => {
  it('should return true when a > b', () => {
    assert.strictEqual(decimalGreaterThan('10.50', '10.49'), true);
    assert.strictEqual(decimalGreaterThan('0', '-1'), true);
  });

  it('should return false when a <= b', () => {
    assert.strictEqual(decimalGreaterThan('10.50', '10.50'), false);
    assert.strictEqual(decimalGreaterThan('10.49', '10.50'), false);
  });
});

describe('decimalGreaterThanOrEqual', () => {
  it('should return true when a >= b', () => {
    assert.strictEqual(decimalGreaterThanOrEqual('10.50', '10.49'), true);
    assert.strictEqual(decimalGreaterThanOrEqual('10.50', '10.50'), true);
  });

  it('should return false when a < b', () => {
    assert.strictEqual(decimalGreaterThanOrEqual('10.49', '10.50'), false);
  });
});

describe('decimalLessThan', () => {
  it('should return true when a < b', () => {
    assert.strictEqual(decimalLessThan('10.49', '10.50'), true);
    assert.strictEqual(decimalLessThan('-1', '0'), true);
  });

  it('should return false when a >= b', () => {
    assert.strictEqual(decimalLessThan('10.50', '10.50'), false);
    assert.strictEqual(decimalLessThan('10.50', '10.49'), false);
  });
});

describe('decimalLessThanOrEqual', () => {
  it('should return true when a <= b', () => {
    assert.strictEqual(decimalLessThanOrEqual('10.49', '10.50'), true);
    assert.strictEqual(decimalLessThanOrEqual('10.50', '10.50'), true);
  });

  it('should return false when a > b', () => {
    assert.strictEqual(decimalLessThanOrEqual('10.51', '10.50'), false);
  });
});

describe('decimalIsPositive', () => {
  it('should return true for positive values', () => {
    assert.strictEqual(decimalIsPositive('10.50'), true);
    assert.strictEqual(decimalIsPositive('0.01'), true);
    assert.strictEqual(decimalIsPositive('1'), true);
  });

  it('should return false for zero', () => {
    assert.strictEqual(decimalIsPositive('0'), false);
    assert.strictEqual(decimalIsPositive('0.00'), false);
    assert.strictEqual(decimalIsPositive('0.0000'), false);
  });

  it('should return false for negative values', () => {
    assert.strictEqual(decimalIsPositive('-10.50'), false);
    assert.strictEqual(decimalIsPositive('-0.01'), false);
  });
});

describe('decimalIsNegative', () => {
  it('should return true for negative values', () => {
    assert.strictEqual(decimalIsNegative('-10.50'), true);
    assert.strictEqual(decimalIsNegative('-0.01'), true);
    assert.strictEqual(decimalIsNegative('-1'), true);
  });

  it('should return false for zero', () => {
    assert.strictEqual(decimalIsNegative('0'), false);
    assert.strictEqual(decimalIsNegative('-0'), false);
    assert.strictEqual(decimalIsNegative('-0.00'), false);
  });

  it('should return false for positive values', () => {
    assert.strictEqual(decimalIsNegative('10.50'), false);
    assert.strictEqual(decimalIsNegative('0.01'), false);
  });
});

describe('decimalIsZero', () => {
  it('should return true for zero values', () => {
    assert.strictEqual(decimalIsZero('0'), true);
    assert.strictEqual(decimalIsZero('0.00'), true);
    assert.strictEqual(decimalIsZero('-0'), true);
    assert.strictEqual(decimalIsZero('-0.00'), true);
    assert.strictEqual(decimalIsZero('0.0000000'), true);
  });

  it('should return false for non-zero values', () => {
    assert.strictEqual(decimalIsZero('0.01'), false);
    assert.strictEqual(decimalIsZero('-0.01'), false);
    assert.strictEqual(decimalIsZero('1'), false);
  });
});

describe('decimalIsNonNegative', () => {
  it('should return true for positive and zero values', () => {
    assert.strictEqual(decimalIsNonNegative('10.50'), true);
    assert.strictEqual(decimalIsNonNegative('0'), true);
    assert.strictEqual(decimalIsNonNegative('0.00'), true);
  });

  it('should return false for negative values', () => {
    assert.strictEqual(decimalIsNonNegative('-0.01'), false);
    assert.strictEqual(decimalIsNonNegative('-10.50'), false);
  });
});

describe('decimalIsNonPositive', () => {
  it('should return true for negative and zero values', () => {
    assert.strictEqual(decimalIsNonPositive('-10.50'), true);
    assert.strictEqual(decimalIsNonPositive('0'), true);
    assert.strictEqual(decimalIsNonPositive('-0.00'), true);
  });

  it('should return false for positive values', () => {
    assert.strictEqual(decimalIsNonPositive('0.01'), false);
    assert.strictEqual(decimalIsNonPositive('10.50'), false);
  });
});

describe('decimalInRange', () => {
  it('should return true for values within range (inclusive)', () => {
    assert.strictEqual(decimalInRange('50', '0', '100'), true);
    assert.strictEqual(decimalInRange('0', '0', '100'), true);
    assert.strictEqual(decimalInRange('100', '0', '100'), true);
    assert.strictEqual(decimalInRange('0.5', '0', '1'), true);
  });

  it('should return false for values outside range', () => {
    assert.strictEqual(decimalInRange('-0.01', '0', '100'), false);
    assert.strictEqual(decimalInRange('100.01', '0', '100'), false);
    assert.strictEqual(decimalInRange('200', '0', '100'), false);
  });

  it('should handle negative ranges', () => {
    assert.strictEqual(decimalInRange('-50', '-100', '0'), true);
    assert.strictEqual(decimalInRange('-100', '-100', '0'), true);
    assert.strictEqual(decimalInRange('0', '-100', '0'), true);
    assert.strictEqual(decimalInRange('-101', '-100', '0'), false);
  });
});

describe('decimalInRangeExclusive', () => {
  it('should return true for values strictly within range', () => {
    assert.strictEqual(decimalInRangeExclusive('50', '0', '100'), true);
    assert.strictEqual(decimalInRangeExclusive('0.01', '0', '100'), true);
    assert.strictEqual(decimalInRangeExclusive('99.99', '0', '100'), true);
  });

  it('should return false for boundary values', () => {
    assert.strictEqual(decimalInRangeExclusive('0', '0', '100'), false);
    assert.strictEqual(decimalInRangeExclusive('100', '0', '100'), false);
  });

  it('should return false for values outside range', () => {
    assert.strictEqual(decimalInRangeExclusive('-0.01', '0', '100'), false);
    assert.strictEqual(decimalInRangeExclusive('100.01', '0', '100'), false);
  });
});

// =============================================================================
// Numeric Functions (number | bigint | decimal)
// =============================================================================

describe('compare', () => {
  describe('number comparisons', () => {
    it('should compare numbers correctly', () => {
      assert.strictEqual(compare(10, 5), 1);
      assert.strictEqual(compare(5, 10), -1);
      assert.strictEqual(compare(10, 10), 0);
    });

    it('should handle negative numbers', () => {
      assert.strictEqual(compare(-5, -10), 1);
      assert.strictEqual(compare(-10, -5), -1);
      assert.strictEqual(compare(-5, 5), -1);
    });

    it('should handle zero', () => {
      assert.strictEqual(compare(0, 0), 0);
      assert.strictEqual(compare(0, 1), -1);
      assert.strictEqual(compare(1, 0), 1);
    });
  });

  describe('bigint comparisons', () => {
    it('should compare bigints correctly', () => {
      assert.strictEqual(compare(10n, 5n), 1);
      assert.strictEqual(compare(5n, 10n), -1);
      assert.strictEqual(compare(10n, 10n), 0);
    });

    it('should handle very large bigints', () => {
      const big1 = 9007199254740993n; // > MAX_SAFE_INTEGER
      const big2 = 9007199254740994n;
      assert.strictEqual(compare(big1, big2), -1);
      assert.strictEqual(compare(big2, big1), 1);
    });
  });

  describe('decimal (string) comparisons', () => {
    it('should compare decimal strings correctly', () => {
      assert.strictEqual(compare('10.50', '10.49'), 1);
      assert.strictEqual(compare('10.49', '10.50'), -1);
      assert.strictEqual(compare('10.50', '10.5'), 0);
    });
  });

  describe('mixed type comparisons', () => {
    it('should compare number with decimal string', () => {
      assert.strictEqual(compare(10, '10'), 0);
      assert.strictEqual(compare(10, '9.99'), 1);
      assert.strictEqual(compare(10, '10.01'), -1);
    });

    it('should compare bigint with decimal string', () => {
      assert.strictEqual(compare(10n, '10'), 0);
      assert.strictEqual(compare(10n, '9'), 1);
      assert.strictEqual(compare(10n, '11'), -1);
    });

    it('should compare number with bigint', () => {
      assert.strictEqual(compare(10, 10n), 0);
      assert.strictEqual(compare(10, 5n), 1);
      assert.strictEqual(compare(5, 10n), -1);
    });
  });
});

describe('equals', () => {
  it('should return true for equal values of same type', () => {
    assert.strictEqual(equals(10, 10), true);
    assert.strictEqual(equals(10n, 10n), true);
    assert.strictEqual(equals('10.50', '10.5'), true);
  });

  it('should return true for equal values of different types', () => {
    assert.strictEqual(equals(10, '10'), true);
    assert.strictEqual(equals(10n, '10'), true);
  });

  it('should return false for unequal values', () => {
    assert.strictEqual(equals(10, 11), false);
    assert.strictEqual(equals('10.50', '10.51'), false);
  });
});

describe('greaterThan', () => {
  it('should work with numbers', () => {
    assert.strictEqual(greaterThan(10, 5), true);
    assert.strictEqual(greaterThan(5, 10), false);
    assert.strictEqual(greaterThan(10, 10), false);
  });

  it('should work with bigints', () => {
    assert.strictEqual(greaterThan(10n, 5n), true);
    assert.strictEqual(greaterThan(5n, 10n), false);
  });

  it('should work with decimal strings', () => {
    assert.strictEqual(greaterThan('10.50', '10.49'), true);
    assert.strictEqual(greaterThan('10.49', '10.50'), false);
  });
});

describe('greaterThanOrEqual', () => {
  it('should work with numbers', () => {
    assert.strictEqual(greaterThanOrEqual(10, 5), true);
    assert.strictEqual(greaterThanOrEqual(10, 10), true);
    assert.strictEqual(greaterThanOrEqual(5, 10), false);
  });
});

describe('lessThan', () => {
  it('should work with numbers', () => {
    assert.strictEqual(lessThan(5, 10), true);
    assert.strictEqual(lessThan(10, 5), false);
    assert.strictEqual(lessThan(10, 10), false);
  });
});

describe('lessThanOrEqual', () => {
  it('should work with numbers', () => {
    assert.strictEqual(lessThanOrEqual(5, 10), true);
    assert.strictEqual(lessThanOrEqual(10, 10), true);
    assert.strictEqual(lessThanOrEqual(10, 5), false);
  });
});

describe('isPositive', () => {
  it('should work with numbers', () => {
    assert.strictEqual(isPositive(10), true);
    assert.strictEqual(isPositive(0.01), true);
    assert.strictEqual(isPositive(0), false);
    assert.strictEqual(isPositive(-10), false);
  });

  it('should work with bigints', () => {
    assert.strictEqual(isPositive(10n), true);
    assert.strictEqual(isPositive(0n), false);
    assert.strictEqual(isPositive(-10n), false);
  });

  it('should work with decimal strings', () => {
    assert.strictEqual(isPositive('10.50'), true);
    assert.strictEqual(isPositive('0.01'), true);
    assert.strictEqual(isPositive('0'), false);
    assert.strictEqual(isPositive('-10.50'), false);
  });
});

describe('isNegative', () => {
  it('should work with numbers', () => {
    assert.strictEqual(isNegative(-10), true);
    assert.strictEqual(isNegative(-0.01), true);
    assert.strictEqual(isNegative(0), false);
    assert.strictEqual(isNegative(10), false);
  });

  it('should work with bigints', () => {
    assert.strictEqual(isNegative(-10n), true);
    assert.strictEqual(isNegative(0n), false);
    assert.strictEqual(isNegative(10n), false);
  });

  it('should work with decimal strings', () => {
    assert.strictEqual(isNegative('-10.50'), true);
    assert.strictEqual(isNegative('-0.01'), true);
    assert.strictEqual(isNegative('0'), false);
    assert.strictEqual(isNegative('10.50'), false);
  });
});

describe('isZero', () => {
  it('should work with numbers', () => {
    assert.strictEqual(isZero(0), true);
    assert.strictEqual(isZero(-0), true);
    assert.strictEqual(isZero(0.01), false);
  });

  it('should work with bigints', () => {
    assert.strictEqual(isZero(0n), true);
    assert.strictEqual(isZero(1n), false);
  });

  it('should work with decimal strings', () => {
    assert.strictEqual(isZero('0'), true);
    assert.strictEqual(isZero('0.00'), true);
    assert.strictEqual(isZero('-0'), true);
    assert.strictEqual(isZero('0.01'), false);
  });
});

describe('isNonNegative', () => {
  it('should work with all types', () => {
    assert.strictEqual(isNonNegative(10), true);
    assert.strictEqual(isNonNegative(0), true);
    assert.strictEqual(isNonNegative(-10), false);
    assert.strictEqual(isNonNegative(10n), true);
    assert.strictEqual(isNonNegative('10.50'), true);
    assert.strictEqual(isNonNegative('-0.01'), false);
  });
});

describe('isNonPositive', () => {
  it('should work with all types', () => {
    assert.strictEqual(isNonPositive(-10), true);
    assert.strictEqual(isNonPositive(0), true);
    assert.strictEqual(isNonPositive(10), false);
    assert.strictEqual(isNonPositive(-10n), true);
    assert.strictEqual(isNonPositive('-10.50'), true);
    assert.strictEqual(isNonPositive('0.01'), false);
  });
});

describe('inRange', () => {
  it('should work with numbers', () => {
    assert.strictEqual(inRange(50, 0, 100), true);
    assert.strictEqual(inRange(0, 0, 100), true);
    assert.strictEqual(inRange(100, 0, 100), true);
    assert.strictEqual(inRange(101, 0, 100), false);
  });

  it('should work with bigints', () => {
    assert.strictEqual(inRange(50n, 0n, 100n), true);
    assert.strictEqual(inRange(0n, 0n, 100n), true);
    assert.strictEqual(inRange(101n, 0n, 100n), false);
  });

  it('should work with decimal strings', () => {
    assert.strictEqual(inRange('50.00', '0', '100'), true);
    assert.strictEqual(inRange('0', '0', '100'), true);
    assert.strictEqual(inRange('100.01', '0', '100'), false);
  });

  it('should work with mixed types', () => {
    assert.strictEqual(inRange(50, '0', '100'), true);
    assert.strictEqual(inRange('50', 0, 100), true);
    assert.strictEqual(inRange(50n, '0', '100'), true);
  });
});

describe('inRangeExclusive', () => {
  it('should work with numbers', () => {
    assert.strictEqual(inRangeExclusive(50, 0, 100), true);
    assert.strictEqual(inRangeExclusive(0, 0, 100), false);
    assert.strictEqual(inRangeExclusive(100, 0, 100), false);
  });

  it('should work with bigints', () => {
    assert.strictEqual(inRangeExclusive(50n, 0n, 100n), true);
    assert.strictEqual(inRangeExclusive(0n, 0n, 100n), false);
  });

  it('should work with decimal strings', () => {
    assert.strictEqual(inRangeExclusive('50.00', '0', '100'), true);
    assert.strictEqual(inRangeExclusive('0', '0', '100'), false);
    assert.strictEqual(inRangeExclusive('0.01', '0', '100'), true);
  });
});

describe('isInteger', () => {
  it('should work with numbers', () => {
    assert.strictEqual(isInteger(42), true);
    assert.strictEqual(isInteger(0), true);
    assert.strictEqual(isInteger(-42), true);
    assert.strictEqual(isInteger(42.5), false);
    assert.strictEqual(isInteger(0.1), false);
  });

  it('should always return true for bigints', () => {
    assert.strictEqual(isInteger(42n), true);
    assert.strictEqual(isInteger(0n), true);
    assert.strictEqual(isInteger(-42n), true);
    assert.strictEqual(isInteger(9007199254740993n), true);
  });

  it('should work with decimal strings', () => {
    assert.strictEqual(isInteger('42'), true);
    assert.strictEqual(isInteger('42.00'), true);
    assert.strictEqual(isInteger('42.0000'), true);
    assert.strictEqual(isInteger('-42.00'), true);
    assert.strictEqual(isInteger('42.50'), false);
    assert.strictEqual(isInteger('42.01'), false);
    assert.strictEqual(isInteger('0.1'), false);
  });
});
