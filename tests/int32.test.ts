import { describe, it } from 'node:test';
import assert from 'node:assert';
import { toInt32 } from '@/common/numbers/int32.js';

describe('toInt32', () => {
  describe('valid values', () => {
    it('should accept zero', () => {
      assert.strictEqual(toInt32(0), 0);
    });

    it('should accept positive integers', () => {
      assert.strictEqual(toInt32(1), 1);
      assert.strictEqual(toInt32(42), 42);
      assert.strictEqual(toInt32(1_000_000), 1_000_000);
    });

    it('should accept negative integers', () => {
      assert.strictEqual(toInt32(-1), -1);
      assert.strictEqual(toInt32(-42), -42);
      assert.strictEqual(toInt32(-1_000_000), -1_000_000);
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
