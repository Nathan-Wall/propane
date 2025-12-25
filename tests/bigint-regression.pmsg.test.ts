import { assert } from './assert.js';
import { Wrapper } from './bigint-regression.pmsg.js';
import { test } from 'node:test';

export default function runBigIntNestedTests() {
  // Top-level BigInt (should pass with current code)
  try {
    const unused_w1 = new Wrapper({ payload: 100n });
    assert(true, 'Top-level BigInt serialized successfully');
  } catch (e) {
    assert(false, `Top-level BigInt failed: ${e}`);
  }

  // Nested BigInt in plain object (EXPECTED TO FAIL with current code)
  try {
    const unused_w2 = new Wrapper({ payload: { id: 200n } });
    assert(true, 'Nested BigInt serialized successfully');
  } catch (e) {
    console.log('Caught expected error for nested BigInt:', e);
    // We want this to pass, so if it throws, it's a bug in the current code
    throw new Error('Regression: Nested BigInt inside plain object failed to serialize');
  }
}

test('runBigIntNestedTests', () => {
  runBigIntNestedTests();
});
