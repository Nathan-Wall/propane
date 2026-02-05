import { assert } from './assert.js';
import { ImmutableArray } from '../runtime/common/array/immutable.js';
import { ImmutableMap } from '../runtime/common/map/immutable.js';
import { ImmutableSet } from '../runtime/common/set/immutable.js';
import { DefaultCollections } from './default-collections.pmsg.js';
import { test } from 'node:test';

export default function runDefaultCollectionsTests() {
  // Create instance without providing any values - should use defaults
  const instance = new DefaultCollections();

  // Verify default array is an ImmutableArray, not a frozen array
  assert(
    ImmutableArray.isInstance(instance.arr),
    `Default arr should be ImmutableArray, got ${Object.prototype.toString.call(instance.arr)}`
  );
  assert(instance.arr.length === 0, 'Default arr should be empty');

  // Verify default map is an ImmutableMap, not a plain Map
  assert(
    ImmutableMap.isInstance(instance.map),
    `Default map should be ImmutableMap, got ${Object.prototype.toString.call(instance.map)}`
  );
  assert(instance.map.size === 0, 'Default map should be empty');

  // Verify default set is an ImmutableSet, not a plain Set
  assert(
    ImmutableSet.isInstance(instance.tags),
    `Default tags should be ImmutableSet, got ${Object.prototype.toString.call(instance.tags)}`
  );
  assert(instance.tags.size === 0, 'Default tags should be empty');

  // Verify equality works with empty defaults
  const instance2 = new DefaultCollections();
  assert(instance.equals(instance2), 'Two instances with default values should be equal');
  assert(instance.hashCode() === instance2.hashCode(), 'Two instances with default values should have same hashCode');

  // Verify serialization/deserialization roundtrip works with defaults
  const serialized = instance.serialize();
  const deserialized = DefaultCollections.deserialize(serialized);
  assert(ImmutableArray.isInstance(deserialized.arr), 'Deserialized arr should be ImmutableArray');
  assert(ImmutableMap.isInstance(deserialized.map), 'Deserialized map should be ImmutableMap');
  assert(ImmutableSet.isInstance(deserialized.tags), 'Deserialized tags should be ImmutableSet');
  assert(instance.equals(deserialized), 'Deserialized instance should equal original');
}

test('runDefaultCollectionsTests', () => {
  runDefaultCollectionsTests();
});
