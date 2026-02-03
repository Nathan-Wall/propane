import { test } from 'node:test';
import { assert } from './assert.js';
import {
  CompactTiny,
  CompactFull,
  CompactUnion,
  CompactUnionWithString,
} from './compact-tagging.pmsg.js';

test('compact tiny tag quotes unsafe payloads', () => {
  const compactUnsafe = new CompactTiny({ value: 'hello world' });
  const unsafeSerialized = compactUnsafe.serialize();
  assert(
    unsafeSerialized === ':Z"hello world"',
    `Compact tiny tag should quote unsafe payload. Got: ${unsafeSerialized}`
  );

  const compactSafe = new CompactTiny({ value: 'hello' });
  const safeSerialized = compactSafe.serialize();
  assert(
    safeSerialized === ':Zhello',
    `Compact tiny tag should omit quotes for safe payload. Got: ${safeSerialized}`
  );
});

test('compact union uses full tag when no tiny tag is defined', () => {
  const message = new CompactUnion({ value: new CompactFull({ value: 'hi' }) });
  const serialized = message.serialize();
  assert(
    serialized === ':{$CompactFull"hi"}',
    `Compact union should serialize with full tag. Got: ${serialized}`
  );

  const roundTrip = CompactUnion.deserialize(serialized);
  assert(
    CompactFull.isInstance(roundTrip.value),
    'Compact union should deserialize full tag into CompactFull instance.'
  );
  assert(
    roundTrip.value.value === 'hi',
    'Compact union round trip should preserve compact payload.'
  );
});

test('string unions quote strings while compact messages stay tagged', () => {
  const stringMessage = new CompactUnionWithString({ value: 'hello' });
  const stringSerialized = stringMessage.serialize();
  assert(
    stringSerialized === ':{"hello"}',
    `Union strings should be quoted. Got: ${stringSerialized}`
  );

  const compactMessage = new CompactUnionWithString({ value: new CompactTiny({ value: 'ok' }) });
  const compactSerialized = compactMessage.serialize();
  assert(
    compactSerialized === ':{Zok}',
    `Union compact message should stay tagged. Got: ${compactSerialized}`
  );

  const roundTrip = CompactUnionWithString.deserialize(compactSerialized);
  assert(
    CompactTiny.isInstance(roundTrip.value),
    'Union compact payload should deserialize to CompactTiny.'
  );
});
