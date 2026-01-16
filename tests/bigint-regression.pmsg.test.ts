import { assert } from './assert.js';
import { Wrapper, Wrapper_Payload_Union1 } from './bigint-regression.pmsg.js';
import { test } from 'node:test';

export default function runBigIntNestedTests() {
  // Top-level BigInt (should pass)
  const w1 = new Wrapper({ payload: 100n });
  assert(w1.payload === 100n, 'Top-level BigInt should be preserved');

  // Nested BigInt in union message
  const nested = new Wrapper_Payload_Union1({ id: 200n });
  const w2 = new Wrapper({ payload: nested });
  const serialized = w2.serialize();
  assert(
    serialized.includes('$Wrapper_Payload_Union1{'),
    `Union payload should be tagged. Got: ${serialized}`
  );
  const w3 = Wrapper.deserialize(serialized);
  assert(
    w3.payload instanceof Wrapper_Payload_Union1,
    `Union payload should deserialize to Wrapper_Payload_Union1. Got: ${w3.payload?.constructor?.name}`
  );
  const p3 = w3.payload as Wrapper_Payload_Union1;
  assert(p3.id === 200n, 'Nested BigInt value matches');

  // Untagged object union should still coerce to implicit message type
  const untagged = ':{payload:{id:200n}}';
  const w4 = Wrapper.deserialize(untagged);
  assert(
    w4.payload instanceof Wrapper_Payload_Union1,
    `Untagged object union should coerce to Wrapper_Payload_Union1. Got: ${w4.payload?.constructor?.name}`
  );
  assert((w4.payload as Wrapper_Payload_Union1).id === 200n, 'Untagged BigInt value matches');
}

test('runBigIntNestedTests', () => {
  runBigIntNestedTests();
});
