import { assert } from './assert.js';
import { Wrapper, Wrapper_Payload_Union1 } from './nested-types.pmsg.js';
import { ImmutableDate } from '../runtime/common/time/date.js';
import { test } from 'node:test';

export default function runNestedTypesTest() {
  const date = new Date('2025-11-25T12:00:00Z');

  // Case 1: Top-level Date (Should work fine)
  const w1 = new Wrapper({ payload: date });
  assert(
    w1.payload instanceof Date || w1.payload instanceof ImmutableDate,
    'Top-level Date should be preserved as Date/ImmutableDate object'
  );
  assert(
    w1.payload.getTime() === date.getTime(),
    'Top-level Date value matches'
  );

  // Case 2: Nested Date in union message
  const nested = new Wrapper_Payload_Union1({ d: date });
  const w2 = new Wrapper({ payload: nested });

  // Force round-trip via serialize/deserialize to check persistence format
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

  assert(
    p3.d instanceof Date || p3.d instanceof ImmutableDate,
    `Nested Date should be preserved as Date/ImmutableDate after round-trip. Got: ${typeof p3.d} (${p3.d})`
  );
  assert(p3.d.getTime() === date.getTime(), 'Nested Date value matches');

  // Case 3: Untagged object union should still coerce to implicit message type
  const untagged = `:{payload:{d:D"${date.toISOString()}"}}`;
  const w4 = Wrapper.deserialize(untagged);
  assert(
    w4.payload instanceof Wrapper_Payload_Union1,
    `Untagged object union should coerce to Wrapper_Payload_Union1. Got: ${w4.payload?.constructor?.name}`
  );
}

test('runNestedTypesTest', () => {
  runNestedTypesTest();
});
