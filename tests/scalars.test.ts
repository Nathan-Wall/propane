import { describe, it } from 'node:test';
import assert from 'node:assert';
import { toInt32, toDecimal } from '../runtime/common/numbers/scalars.js';

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
