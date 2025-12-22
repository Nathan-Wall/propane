/**
 * Decimal Validation Tests
 *
 * Tests for isDecimal (strict) and canBeDecimal (lenient) functions.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert';
import { isDecimal, canBeDecimal } from '@propane/runtime';

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
