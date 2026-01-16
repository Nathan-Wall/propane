import { describe, it } from 'node:test';
import assert from 'node:assert';
import { hashCombine } from '@/common/numbers/decimal-shared.js';

describe('hashCombine', () => {
  it('uses the 31x + value policy', () => {
    assert.strictEqual(hashCombine(0, 0), 0);
    assert.strictEqual(hashCombine(0, 1), 1);
    assert.strictEqual(hashCombine(1, 2), 33);
    assert.strictEqual(hashCombine(33, 3), 1026);
  });

  it('chains deterministically', () => {
    assert.strictEqual(hashCombine(hashCombine(0, 5), 7), 162);
  });

  it('preserves int32 wrapping', () => {
    assert.strictEqual(hashCombine(-1, 1), -30);
  });
});
