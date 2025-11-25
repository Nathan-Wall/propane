import { assert } from './assert.ts';
import { Wrapper } from './nested-types.propane.js';

export default function runNestedTypesTest() {
  const date = new Date('2025-11-25T12:00:00Z');

  // Case 1: Top-level Date (Should work fine)
  const w1 = new Wrapper({ payload: date });
  assert(w1.payload instanceof Date, 'Top-level Date should be preserved as Date object');
  assert(w1.payload.getTime() === date.getTime(), 'Top-level Date value matches');

  // Case 2: Nested Date in plain object (Likely fails currently)
  const w2 = new Wrapper({ payload: { d: date } });
  
  // Force round-trip via serialize/deserialize to check persistence format
  const serialized = w2.serialize();
  const w3 = Wrapper.deserialize(serialized);
  const p3 = w3.payload as { d: unknown };
  
  assert(p3.d instanceof Date, `Nested Date should be preserved as Date object after round-trip. Got: ${typeof p3.d} (${p3.d})`);
  assert((p3.d as Date).getTime() === date.getTime(), 'Nested Date value matches');
}
