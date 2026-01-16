import { assert } from './assert.js';
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
  const decoded = Wrapper.deserialize(serialized);

  assert(
    decoded.union instanceof Alpha,
    `untagged union should match first type (Alpha). Got: ${decoded.union?.constructor?.name}`
  );
  assert(
    !(decoded.union instanceof Beta),
    'untagged union should not match Beta when Alpha matches first'
  );

  const listValues = decoded.list ? [...decoded.list] : [];
  assert(listValues.length === 2, 'list should contain two items');
  assert(
    listValues.every((value) => value instanceof Alpha),
    'untagged list elements should match Alpha (first union type)'
  );

  const setValues = decoded.itemSet ? [...decoded.itemSet.values()] : [];
  assert(setValues.length === 1, 'set should contain one item');
  assert(
    setValues.every((value) => value instanceof Alpha),
    'untagged set elements should match Alpha (first union type)'
  );

  assert(
    decoded.map?.get('key') instanceof Alpha,
    `untagged map values should match Alpha (first union type). Got: ${decoded.map?.get('key')?.constructor?.name}`
  );
}

test('runAmbiguousUnionTests', () => {
  runAmbiguousUnionTests();
});
