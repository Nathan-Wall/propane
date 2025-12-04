import { assert } from './assert.ts';
import { ImmutableArray } from '../../runtime/common/array/immutable.ts';
import { ImmutableMap } from '../../runtime/common/map/immutable.ts';
import { ImmutableSet } from '../../runtime/common/set/immutable.ts';
import { DefaultCollections } from './default-collections.pmsg.ts';

export default function runDefaultCollectionsTests() {
  // Create instance without providing any values - should use defaults
  const instance = new DefaultCollections();

  // Verify default array is an ImmutableArray, not a frozen array
  assert(
    instance.arr instanceof ImmutableArray,
    `Default arr should be ImmutableArray, got ${Object.prototype.toString.call(instance.arr)}`
  );
  assert(instance.arr.length === 0, 'Default arr should be empty');

  // Verify default map is an ImmutableMap, not a plain Map
  assert(
    instance.map instanceof ImmutableMap,
    `Default map should be ImmutableMap, got ${Object.prototype.toString.call(instance.map)}`
  );
  assert(instance.map.size === 0, 'Default map should be empty');

  // Verify default set is an ImmutableSet, not a plain Set
  assert(
    instance.set instanceof ImmutableSet,
    `Default set should be ImmutableSet, got ${Object.prototype.toString.call(instance.set)}`
  );
  assert(instance.set.size === 0, 'Default set should be empty');

  // Verify equality works with empty defaults
  const instance2 = new DefaultCollections();
  assert(instance.equals(instance2), 'Two instances with default values should be equal');
  assert(instance.hashCode() === instance2.hashCode(), 'Two instances with default values should have same hashCode');

  // Verify serialization/deserialization roundtrip works with defaults
  const serialized = instance.serialize();
  const deserialized = DefaultCollections.deserialize(serialized);
  assert(deserialized.arr instanceof ImmutableArray, 'Deserialized arr should be ImmutableArray');
  assert(deserialized.map instanceof ImmutableMap, 'Deserialized map should be ImmutableMap');
  assert(deserialized.set instanceof ImmutableSet, 'Deserialized set should be ImmutableSet');
  assert(instance.equals(deserialized), 'Deserialized instance should equal original');
}
