import { describe, it } from 'node:test';
import assert from 'node:assert';
import { toInt53 } from '../runtime/common/numbers/int53.js';

describe('toInt53', () => {
  describe('valid values', () => {
    it('should accept zero', () => {
      assert.strictEqual(toInt53(0), 0);
    });

    it('should accept positive integers', () => {
      assert.strictEqual(toInt53(1), 1);
      assert.strictEqual(toInt53(42), 42);
      assert.strictEqual(toInt53(1000000), 1000000);
    });

    it('should accept negative integers', () => {
      assert.strictEqual(toInt53(-1), -1);
      assert.strictEqual(toInt53(-42), -42);
      assert.strictEqual(toInt53(-1000000), -1000000);
    });

    it('should accept values larger than int32 range', () => {
      assert.strictEqual(toInt53(3_000_000_000), 3_000_000_000);
      assert.strictEqual(toInt53(-3_000_000_000), -3_000_000_000);
    });

    it('should accept minimum safe integer', () => {
      assert.strictEqual(toInt53(Number.MIN_SAFE_INTEGER), Number.MIN_SAFE_INTEGER);
    });

    it('should accept maximum safe integer', () => {
      assert.strictEqual(toInt53(Number.MAX_SAFE_INTEGER), Number.MAX_SAFE_INTEGER);
    });
  });

  describe('invalid values', () => {
    it('should reject non-integers', () => {
      assert.throws(() => toInt53(1.5), TypeError);
      assert.throws(() => toInt53(0.1), TypeError);
      assert.throws(() => toInt53(-3.14), TypeError);
    });

    it('should reject values below minimum safe integer', () => {
      assert.throws(() => toInt53(Number.MIN_SAFE_INTEGER - 1), RangeError);
    });

    it('should reject values above maximum safe integer', () => {
      assert.throws(() => toInt53(Number.MAX_SAFE_INTEGER + 1), RangeError);
    });

    it('should reject NaN', () => {
      assert.throws(() => toInt53(NaN), TypeError);
    });

    it('should reject Infinity', () => {
      assert.throws(() => toInt53(Infinity), TypeError);
      assert.throws(() => toInt53(-Infinity), TypeError);
    });
  });
});
