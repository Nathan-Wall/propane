import { assert } from './assert.ts';
import { SetMessage } from './set.propane.ts';
import { ImmutableSet } from '../../common/set/immutable.ts';

export default function runSetTests() {
  const tags = new Set(['a', 'b']);
  const ids = new ImmutableSet([1, 2]);
  const msg: SetMessageInstance = new SetMessage({ tags, ids });

  // ctor normalization
  assert(msg.tags instanceof ImmutableSet, 'tags should be ImmutableSet');
  assert(msg.tags.has('a') && msg.tags.has('b'), 'tags should retain entries');
  assert(msg.ids && msg.ids.has(1), 'ids should retain entries');

  // fromEntries / deserialize
  const raw = ':{[a,b]}';
  const hydrated = SetMessage.deserialize(raw);
  const data = hydrated.cerealize();
  assert(data.tags instanceof ImmutableSet, 'deserialize should yield ImmutableSet');
  assert(data.tags.has('a') && data.tags.has('b'), 'deserialize keeps set values');
  assert(!data.ids, 'optional ids can be omitted');

  // toJSON
  const json = JSON.parse(JSON.stringify(msg));
  assert(JSON.stringify(json.tags) === JSON.stringify(['a','b']), 'toJSON should output array for Set');
  assert(JSON.stringify(json.ids) === JSON.stringify([1,2]), 'toJSON should output array for optional Set');
}
