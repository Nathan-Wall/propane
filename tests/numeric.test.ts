import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
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
} from '@/common/numbers/numeric.js';
import { Decimal, Rational } from '@/common/numbers/decimal.js';

const dA = Decimal.fromStrictString(10, 2, '10.50');
const dB = Decimal.fromStrictString(10, 2, '10.49');
const dC = Decimal.fromStrictString(10, 2, '10.50');
const dSmall = Decimal.fromStrictString(10, 2, '9.99');
const dLarge = Decimal.fromStrictString(10, 2, '10.99');
const dInt = Decimal.fromStrictString(10, 2, '5.00');
const dScale0 = Decimal.fromStrictString(10, 0, '7');
const rOneThird = Rational.fromInts(1, 3);
const rTwoThirds = Rational.fromInts(2, 3);

// =============================================================================
// Numeric Functions (number | bigint | Decimal | Rational)
// =============================================================================

describe('compare', () => {
  it('compares numbers and bigints', () => {
    assert.strictEqual(compare(10, 5), 1);
    assert.strictEqual(compare(5n, 10n), -1);
    assert.strictEqual(compare(10, 10n), 0);
  });

  it('compares Decimals', () => {
    assert.strictEqual(compare(dA, dB), 1);
    assert.strictEqual(compare(dB, dA), -1);
    assert.strictEqual(compare(dA, dC), 0);
  });

  it('compares Decimal with number and bigint', () => {
    assert.strictEqual(compare(10, dA), -1);
    assert.strictEqual(compare(11, dA), 1);
    assert.strictEqual(compare(10n, dA), -1);
  });

  it('compares Rational values', () => {
    assert.strictEqual(compare(rTwoThirds, rOneThird), 1);
    assert.strictEqual(compare(rOneThird, rOneThird), 0);
  });

  it('compares Decimal with Rational', () => {
    const twoThirdsAsDecimal = Decimal.fromStrictString(10, 2, '0.67');
    assert.strictEqual(compare(twoThirdsAsDecimal, rTwoThirds), 1);
  });
});

describe('equals', () => {
  it('returns true for equal values', () => {
    assert.strictEqual(equals(dA, dC), true);
    assert.strictEqual(equals(10, 10n), true);
  });

  it('returns false for unequal values', () => {
    assert.strictEqual(equals(dA, dB), false);
    assert.strictEqual(equals(10, 11), false);
  });
});

describe('ordering helpers', () => {
  it('greater/less comparisons work for Decimal', () => {
    assert.strictEqual(greaterThan(dA, dB), true);
    assert.strictEqual(greaterThanOrEqual(dA, dC), true);
    assert.strictEqual(lessThan(dB, dA), true);
    assert.strictEqual(lessThanOrEqual(dA, dC), true);
  });
});

describe('sign checks', () => {
  it('works for Decimal and Rational', () => {
    assert.strictEqual(isPositive(dA), true);
    assert.strictEqual(isNegative(dA), false);
    assert.strictEqual(isNonNegative(dA), true);
    assert.strictEqual(isNonPositive(dA), false);
    assert.strictEqual(isZero(Decimal.fromStrictString(10, 2, '0.00')), true);
    assert.strictEqual(isPositive(rOneThird), true);
  });

  it('treats non-finite numbers consistently', () => {
    assert.strictEqual(isPositive(Infinity), true);
    assert.strictEqual(isNegative(-Infinity), true);
    assert.strictEqual(isNonNegative(Infinity), true);
    assert.strictEqual(isNonPositive(-Infinity), true);
    assert.strictEqual(isPositive(NaN), false);
    assert.strictEqual(isNegative(NaN), false);
    assert.strictEqual(isNonNegative(NaN), false);
    assert.strictEqual(isNonPositive(NaN), false);
  });
});

describe('range checks', () => {
  it('inRange works with Decimal bounds', () => {
    assert.strictEqual(inRange(dA, dSmall, dLarge), true);
    assert.strictEqual(inRange(dSmall, dA, dLarge), false);
  });

  it('inRangeExclusive works with Decimal bounds', () => {
    assert.strictEqual(inRangeExclusive(dA, dSmall, dLarge), true);
    assert.strictEqual(inRangeExclusive(dSmall, dSmall, dLarge), false);
  });

  it('accepts infinite bounds but rejects NaN', () => {
    assert.strictEqual(inRange(5, -Infinity, Infinity), true);
    assert.strictEqual(inRange(Infinity, 0, Infinity), true);
    assert.strictEqual(inRange(-Infinity, -Infinity, 0), true);
    assert.strictEqual(inRangeExclusive(5, -Infinity, Infinity), true);
    assert.strictEqual(inRangeExclusive(Infinity, 0, Infinity), false);
    assert.strictEqual(inRange(NaN, 0, 1), false);
    assert.strictEqual(inRange(0, NaN, 1), false);
    assert.strictEqual(inRange(0, 0, NaN), false);
  });
});

describe('isInteger', () => {
  it('recognizes integer Decimals and Rationals', () => {
    assert.strictEqual(isInteger(dInt), true);
    assert.strictEqual(isInteger(dScale0), true);
    assert.strictEqual(isInteger(rOneThird), false);
    assert.strictEqual(isInteger(Rational.fromInts(4, 2)), true);
  });
});
