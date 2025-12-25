/**
 * Decimal Validation Tests
 *
 * Tests for isDecimal (strict), canBeDecimal (lenient), and
 * isValidDecimalString (format-only) functions.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert';
import { isDecimal, canBeDecimal, isValidDecimalString } from '@propane/runtime';

describe('isDecimal (strict)', () => {
  describe('valid normalized decimals', () => {
    it('should accept exact scale match', () => {
      assert.strictEqual(isDecimal('123.45', 10, 2), true);
      assert.strictEqual(isDecimal('0.00', 10, 2), true);
      assert.strictEqual(isDecimal('100.00', 10, 2), true);
    });

    it('should accept negative values', () => {
      assert.strictEqual(isDecimal('-123.45', 10, 2), true);
      assert.strictEqual(isDecimal('-0.00', 10, 2), true);
    });

    it('should accept scale 0 (integers)', () => {
      assert.strictEqual(isDecimal('123', 10, 0), true);
      assert.strictEqual(isDecimal('-456', 10, 0), true);
    });
  });

  describe('invalid inputs', () => {
    it('should reject non-strings', () => {
      assert.strictEqual(isDecimal(100, 10, 2), false);
      assert.strictEqual(isDecimal(100.00, 10, 2), false);
      assert.strictEqual(isDecimal(null, 10, 2), false);
      assert.strictEqual(isDecimal(undefined, 10, 2), false);
    });

    it('should reject wrong scale (strict)', () => {
      // Missing decimal places
      assert.strictEqual(isDecimal('100', 10, 2), false);
      assert.strictEqual(isDecimal('100.0', 10, 2), false);
      // Too many decimal places
      assert.strictEqual(isDecimal('100.000', 10, 2), false);
    });

    it('should reject values exceeding precision', () => {
      assert.strictEqual(isDecimal('12345678901.00', 10, 2), false);
    });

    it('should reject invalid format', () => {
      assert.strictEqual(isDecimal('abc', 10, 2), false);
      assert.strictEqual(isDecimal('12.34.56', 10, 2), false);
      assert.strictEqual(isDecimal('', 10, 2), false);
    });
  });
});

describe('canBeDecimal (lenient)', () => {
  describe('valid inputs', () => {
    it('should accept numbers', () => {
      assert.strictEqual(canBeDecimal(100, 10, 2), true);
      assert.strictEqual(canBeDecimal(100.5, 10, 2), true);
      assert.strictEqual(canBeDecimal(-50.25, 10, 2), true);
    });

    it('should accept strings with fewer decimal places', () => {
      assert.strictEqual(canBeDecimal('100', 10, 2), true);
      assert.strictEqual(canBeDecimal('100.0', 10, 2), true);
      assert.strictEqual(canBeDecimal('100.00', 10, 2), true);
    });

    it('should accept negative values', () => {
      assert.strictEqual(canBeDecimal(-100, 10, 2), true);
      assert.strictEqual(canBeDecimal('-100', 10, 2), true);
    });
  });

  describe('invalid inputs', () => {
    it('should reject non-finite numbers', () => {
      assert.strictEqual(canBeDecimal(Infinity, 10, 2), false);
      assert.strictEqual(canBeDecimal(-Infinity, 10, 2), false);
      assert.strictEqual(canBeDecimal(NaN, 10, 2), false);
    });

    it('should reject strings with too many decimal places', () => {
      assert.strictEqual(canBeDecimal('100.123', 10, 2), false);
    });

    it('should reject values exceeding precision', () => {
      assert.strictEqual(canBeDecimal(12345678901, 10, 2), false);
      assert.strictEqual(canBeDecimal('12345678901', 10, 2), false);
    });

    it('should reject non-string/number types', () => {
      assert.strictEqual(canBeDecimal(null, 10, 2), false);
      assert.strictEqual(canBeDecimal(undefined, 10, 2), false);
      assert.strictEqual(canBeDecimal({}, 10, 2), false);
    });

    it('should reject invalid string format', () => {
      assert.strictEqual(canBeDecimal('abc', 10, 2), false);
      assert.strictEqual(canBeDecimal('12.34.56', 10, 2), false);
    });
  });

  describe('precision/scale edge cases', () => {
    it('should handle scale 0', () => {
      assert.strictEqual(canBeDecimal(100, 10, 0), true);
      assert.strictEqual(canBeDecimal('100', 10, 0), true);
    });

    it('should handle high precision', () => {
      assert.strictEqual(canBeDecimal('12345678901234567890.12', 38, 2), true);
    });
  });
});

describe('isDecimal vs canBeDecimal comparison', () => {
  it('isDecimal is stricter than canBeDecimal', () => {
    // These pass canBeDecimal but fail isDecimal (strict scale)
    assert.strictEqual(canBeDecimal('100', 10, 2), true);
    assert.strictEqual(isDecimal('100', 10, 2), false);

    assert.strictEqual(canBeDecimal(100, 10, 2), true);
    assert.strictEqual(isDecimal(100, 10, 2), false);

    // These pass both
    assert.strictEqual(canBeDecimal('100.00', 10, 2), true);
    assert.strictEqual(isDecimal('100.00', 10, 2), true);
  });
});

describe('isValidDecimalString (format-only)', () => {
  describe('valid decimal strings', () => {
    it('should accept integers', () => {
      assert.strictEqual(isValidDecimalString('0'), true);
      assert.strictEqual(isValidDecimalString('123'), true);
      assert.strictEqual(isValidDecimalString('999999999'), true);
    });

    it('should accept decimals', () => {
      assert.strictEqual(isValidDecimalString('123.45'), true);
      assert.strictEqual(isValidDecimalString('0.00'), true);
      assert.strictEqual(isValidDecimalString('100.00'), true);
      assert.strictEqual(isValidDecimalString('0.123456789'), true);
    });

    it('should accept negative values', () => {
      assert.strictEqual(isValidDecimalString('-123'), true);
      assert.strictEqual(isValidDecimalString('-123.45'), true);
      assert.strictEqual(isValidDecimalString('-0.00'), true);
    });
  });

  describe('invalid strings', () => {
    it('should reject empty string', () => {
      assert.strictEqual(isValidDecimalString(''), false);
    });

    it('should reject non-numeric strings', () => {
      assert.strictEqual(isValidDecimalString('abc'), false);
      assert.strictEqual(isValidDecimalString('12a34'), false);
      assert.strictEqual(isValidDecimalString('hello'), false);
    });

    it('should reject multiple decimal points', () => {
      assert.strictEqual(isValidDecimalString('1.2.3'), false);
      assert.strictEqual(isValidDecimalString('12.34.56'), false);
    });

    it('should reject leading/trailing decimal points', () => {
      assert.strictEqual(isValidDecimalString('.123'), false);
      assert.strictEqual(isValidDecimalString('123.'), false);
    });

    it('should reject spaces and special characters', () => {
      assert.strictEqual(isValidDecimalString(' 123'), false);
      assert.strictEqual(isValidDecimalString('123 '), false);
      assert.strictEqual(isValidDecimalString('1 23'), false);
      assert.strictEqual(isValidDecimalString('$100'), false);
      assert.strictEqual(isValidDecimalString('100%'), false);
    });

    it('should reject scientific notation', () => {
      assert.strictEqual(isValidDecimalString('1e10'), false);
      assert.strictEqual(isValidDecimalString('1.5e-3'), false);
    });

    it('should reject multiple minus signs', () => {
      assert.strictEqual(isValidDecimalString('--123'), false);
      assert.strictEqual(isValidDecimalString('123-'), false);
    });

    it('should reject plus sign', () => {
      assert.strictEqual(isValidDecimalString('+123'), false);
    });
  });
});
