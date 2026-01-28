import { assert, assertThrows } from './assert.js';
import { Wrapper, Wrapper_Payload_Union1 } from './nested-types.pmsg.js';
import { ImmutableDate } from '../runtime/common/time/date.js';
import { test } from 'node:test';

export default function runNestedTypesTest() {
  const date = new Date('2025-11-25T12:00:00Z');

  // Case 1: Top-level Date should require explicit ImmutableDate in union
  assertThrows(
    () => new Wrapper({ payload: date }),
    'Union Date branch should reject raw Date when multiple message types exist.'
  );
  const w1 = new Wrapper({ payload: new ImmutableDate(date) });
  const w1Serialized = w1.serialize();
  assert(
    w1Serialized === `:{payload:D\"${date.toISOString()}\"}`,
    `Union Date branch should serialize with D\"...\". Got: ${w1Serialized}`
  );
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

  // Case 3: Untagged object union should throw for ambiguous message unions
  const untagged = `:{payload:{d:D"${date.toISOString()}"}}`;
  assertThrows(
    () => Wrapper.deserialize(untagged),
    'Untagged object union should throw when multiple message types exist.'
  );
}

test('runNestedTypesTest', () => {
  runNestedTypesTest();
});
