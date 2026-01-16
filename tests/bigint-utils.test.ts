import { describe, it } from 'node:test';
import assert from 'node:assert';
import { bitLength, countBigIntDigits, gcdBigInt } from '@/common/numbers/decimal-shared.js';

describe('bigint utils', () => {
  it('gcdBigInt handles signs and zeros', () => {
    assert.strictEqual(gcdBigInt(0n, 0n), 0n);
    assert.strictEqual(gcdBigInt(54n, 24n), 6n);
    assert.strictEqual(gcdBigInt(-54n, 24n), 6n);
    assert.strictEqual(gcdBigInt(270n, -192n), 6n);
  });

  it('bitLength matches expected values', () => {
    assert.strictEqual(bitLength(0n), 0);
    assert.strictEqual(bitLength(1n), 1);
    assert.strictEqual(bitLength(2n), 2);
    assert.strictEqual(bitLength(3n), 2);
    assert.strictEqual(bitLength(4n), 3);
    assert.strictEqual(bitLength(-4n), 3);
  });

  it('countBigIntDigits counts decimal digits', () => {
    assert.strictEqual(countBigIntDigits(0n), 1);
    assert.strictEqual(countBigIntDigits(9n), 1);
    assert.strictEqual(countBigIntDigits(10n), 2);
    assert.strictEqual(countBigIntDigits(12345n), 5);
    assert.strictEqual(countBigIntDigits(-123n), 3);
  });
});
