import { assert } from './assert.js';
import { SetMessage } from './set.pmsg.js';
import { ImmutableSet } from '../runtime/common/set/immutable.js';
import { test } from 'node:test';

export default function runSetTests() {
  const tags = new Set(['a', 'b']);
  const ids = new ImmutableSet([1, 2]);
  const msg: SetMessage = new SetMessage({ tags, ids });

  // ctor normalization
  assert(ImmutableSet.isInstance(msg.tags), 'tags should be ImmutableSet');
  assert(msg.tags.has('a') && msg.tags.has('b'), 'tags should retain entries');
  assert(msg.ids && msg.ids.has(1), 'ids should retain entries');

  // fromEntries / deserialize
  const raw = ':{[a,b]}';
  const hydrated = SetMessage.deserialize(raw);
  assert(ImmutableSet.isInstance(hydrated.tags), 'deserialize should yield ImmutableSet');
  assert(hydrated.tags.has('a') && hydrated.tags.has('b'), 'deserialize keeps set values');
  assert(!hydrated.ids, 'optional ids can be omitted');

  // iterable inputs (not Set) should normalize
  const iterableTags = (function* () {
    yield 'x';
    yield 'y';
  })();
  const iterableIds = [9, 10][Symbol.iterator]();
  const iterableMsg = new SetMessage({ tags: iterableTags, ids: iterableIds });
  assert(ImmutableSet.isInstance(iterableMsg.tags), 'iterable tags should normalize to ImmutableSet');
  assert(iterableMsg.tags.has('x') && iterableMsg.tags.has('y'), 'iterable tags should keep entries');
  assert(iterableMsg.ids?.has(9) && iterableMsg.ids?.has(10), 'iterable ids should normalize to ImmutableSet');

  // toJSON
  const json = JSON.parse(JSON.stringify(msg));
  assert(JSON.stringify(json.tags) === JSON.stringify(['a', 'b']), 'toJSON should output array for Set');
  assert(JSON.stringify(json.ids) === JSON.stringify([1, 2]), 'toJSON should output array for optional Set');
}

test('runSetTests', () => {
  runSetTests();
});
