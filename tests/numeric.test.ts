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
      // @ts-expect-error testing with plain strings (runtime accepts any string as decimal)
      assert.strictEqual(compare('10.50', '10.49'), 1);
      // @ts-expect-error testing with plain strings
      assert.strictEqual(compare('10.49', '10.50'), -1);
      // @ts-expect-error testing with plain strings
      assert.strictEqual(compare('10.50', '10.5'), 0);
    });
  });

  describe('mixed type comparisons', () => {
    it('should compare number with decimal string', () => {
      // @ts-expect-error testing with plain strings
      assert.strictEqual(compare(10, '10'), 0);
      // @ts-expect-error testing with plain strings
      assert.strictEqual(compare(10, '9.99'), 1);
      // @ts-expect-error testing with plain strings
      assert.strictEqual(compare(10, '10.01'), -1);
    });

    it('should compare bigint with decimal string', () => {
      // @ts-expect-error testing with plain strings
      assert.strictEqual(compare(10n, '10'), 0);
      // @ts-expect-error testing with plain strings
      assert.strictEqual(compare(10n, '9'), 1);
      // @ts-expect-error testing with plain strings
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
    // @ts-expect-error testing with plain strings
    assert.strictEqual(equals('10.50', '10.5'), true);
  });

  it('should return true for equal values of different types', () => {
    // @ts-expect-error Testing that runtime handles string bounds (not type-safe)
    assert.strictEqual(equals(10, '10'), true);
    // @ts-expect-error Testing that runtime handles string bounds (not type-safe)
    assert.strictEqual(equals(10n, '10'), true);
  });

  it('should return false for unequal values', () => {
    assert.strictEqual(equals(10, 11), false);
    // @ts-expect-error testing with plain strings
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
    // @ts-expect-error testing with plain strings
    assert.strictEqual(greaterThan('10.50', '10.49'), true);
    // @ts-expect-error testing with plain strings
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
    // @ts-expect-error testing with plain strings
    assert.strictEqual(isPositive('10.50'), true);
    // @ts-expect-error testing with plain strings
    assert.strictEqual(isPositive('0.01'), true);
    // @ts-expect-error testing with plain strings
    assert.strictEqual(isPositive('0'), false);
    // @ts-expect-error testing with plain strings
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
    // @ts-expect-error testing with plain strings
    assert.strictEqual(isNegative('-10.50'), true);
    // @ts-expect-error testing with plain strings
    assert.strictEqual(isNegative('-0.01'), true);
    // @ts-expect-error testing with plain strings
    assert.strictEqual(isNegative('0'), false);
    // @ts-expect-error testing with plain strings
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
    // @ts-expect-error testing with plain strings
    assert.strictEqual(isZero('0'), true);
    // @ts-expect-error testing with plain strings
    assert.strictEqual(isZero('0.00'), true);
    // @ts-expect-error testing with plain strings
    assert.strictEqual(isZero('-0'), true);
    // @ts-expect-error testing with plain strings
    assert.strictEqual(isZero('0.01'), false);
  });
});

describe('isNonNegative', () => {
  it('should work with all types', () => {
    assert.strictEqual(isNonNegative(10), true);
    assert.strictEqual(isNonNegative(0), true);
    assert.strictEqual(isNonNegative(-10), false);
    assert.strictEqual(isNonNegative(10n), true);
    // @ts-expect-error testing with plain strings
    assert.strictEqual(isNonNegative('10.50'), true);
    // @ts-expect-error testing with plain strings
    assert.strictEqual(isNonNegative('-0.01'), false);
  });
});

describe('isNonPositive', () => {
  it('should work with all types', () => {
    assert.strictEqual(isNonPositive(-10), true);
    assert.strictEqual(isNonPositive(0), true);
    assert.strictEqual(isNonPositive(10), false);
    assert.strictEqual(isNonPositive(-10n), true);
    // @ts-expect-error testing with plain strings
    assert.strictEqual(isNonPositive('-10.50'), true);
    // @ts-expect-error testing with plain strings
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
    // @ts-expect-error testing with plain strings
    assert.strictEqual(inRange('50.00', '0', '100'), true);
    // @ts-expect-error testing with plain strings
    assert.strictEqual(inRange('0', '0', '100'), true);
    // @ts-expect-error testing with plain strings
    assert.strictEqual(inRange('100.01', '0', '100'), false);
  });

  it('should work with mixed types', () => {
    // @ts-expect-error Testing that runtime handles string bounds (not type-safe)
    assert.strictEqual(inRange(50, '0', '100'), true);
    // @ts-expect-error Testing with plain string as value (not type-safe)
    assert.strictEqual(inRange('50', 0, 100), true);
    // @ts-expect-error Testing that runtime handles string bounds (not type-safe)
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
    // @ts-expect-error testing with plain strings
    assert.strictEqual(inRangeExclusive('50.00', '0', '100'), true);
    // @ts-expect-error testing with plain strings
    assert.strictEqual(inRangeExclusive('0', '0', '100'), false);
    // @ts-expect-error testing with plain strings
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
    // @ts-expect-error testing with plain strings
    assert.strictEqual(isInteger('42'), true);
    // @ts-expect-error testing with plain strings
    assert.strictEqual(isInteger('42.00'), true);
    // @ts-expect-error testing with plain strings
    assert.strictEqual(isInteger('42.0000'), true);
    // @ts-expect-error testing with plain strings
    assert.strictEqual(isInteger('-42.00'), true);
    // @ts-expect-error testing with plain strings
    assert.strictEqual(isInteger('42.50'), false);
    // @ts-expect-error testing with plain strings
    assert.strictEqual(isInteger('42.01'), false);
    // @ts-expect-error testing with plain strings
    assert.strictEqual(isInteger('0.1'), false);
  });
});
