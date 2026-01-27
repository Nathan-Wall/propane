import { assert, assertThrows } from './assert.js';
import { Alpha, Beta, Wrapper } from './ambiguous-union.pmsg.js';
import { test } from 'node:test';

export default function runAmbiguousUnionTests() {
  const alpha = new Alpha({ name: 'Alpha' });
  const beta = new Beta({ name: 'Beta' });
  const taggedMap = new Map<string, Alpha | Beta>([
    ['a', alpha],
    ['b', beta],
  ]);
  const taggedWrapper = new Wrapper({
    union: alpha,
    list: [alpha, beta],
    itemSet: new Set([alpha, beta]),
    map: taggedMap,
  });
  const taggedSerialized = taggedWrapper.serialize();
  assert(
    taggedSerialized.includes('$Alpha{'),
    `ambiguous union should tag Alpha. Got: ${taggedSerialized}`
  );
  assert(
    taggedSerialized.includes('$Beta{'),
    `ambiguous union should tag Beta. Got: ${taggedSerialized}`
  );

  const serialized = ':{union:{name:Alpha},list:[{name:One},{name:Two}],itemSet:S[{name:Three}],map:M[[key,{name:Four}]]}';
  assertThrows(
    () => Wrapper.deserialize(serialized),
    'untagged unions should throw when multiple message types exist.'
  );
}

test('runAmbiguousUnionTests', () => {
  runAmbiguousUnionTests();
});
