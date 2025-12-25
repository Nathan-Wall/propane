import { assert, assertThrows, isMapValue } from './assert.js';
import { MapMapKey } from './map-map-key.pmsg.js';
import { ImmutableMap } from '../runtime/common/map/immutable.js';
import { test } from 'node:test';

export default function runMapMapKeyTests() {
  const inner = new Map<string, number>([['a', 1]]);
  const nested = new Map<Map<string, number>, string>([[inner, 'alpha']]);

  const instance = new MapMapKey({ nested });
  // Cast inner to ImmutableMap for lookup (structural equality finds it)
  assert(instance.nested.get(inner as unknown as ImmutableMap<string, number>) === 'alpha', 'Map key (Map) should roundtrip through constructor.');

  const serialized = instance.serialize();
  const hydrated = MapMapKey.deserialize(serialized);
  assert(isMapValue(hydrated.nested), 'Nested should remain a map after deserialize.');
  const [hydratedKey] = [...hydrated.nested.keys()];
  assert(isMapValue(hydratedKey), 'Map key should remain a map after deserialize.');
  assert(hydratedKey.get('a') === 1, 'Map key contents should survive serialize/deserialize.');
  assert(hydrated.nested.get(hydratedKey) === 'alpha', 'Nested map value should survive serialize/deserialize.');

  const optKey = new Map<string, number>([['k', 2]]);
  const withOptional = instance.setOptional(new Map([[optKey, 42]]));
  assert(withOptional.optional?.get(optKey as unknown as ImmutableMap<string, number>) === 42, 'Optional map should accept map keys.');

  assertThrows(
    () => MapMapKey.deserialize(':{"nested":M[[[["a",1]],"invalid-key-type"]]}'),
    'Map keys that are not maps should still be rejected.'
  );

  // Structural equality for map keys (different instances, same entries).
  const keyA = new Map([['same', 1]]);
  const keyB = new Map([['same', 1]]);
  const dedupe = new MapMapKey({
    nested: new Map([
      [keyA, 'first'],
      [keyB, 'second'],
    ]),
  });
  assert(dedupe.nested.size === 1, 'Structural map keys should coalesce duplicate entries.');
  assert(dedupe.nested.get(keyA as unknown as ImmutableMap<string, number>) === 'second', 'Latest value should win for structurally equal map keys.');
}

test('runMapMapKeyTests', () => {
  runMapMapKeyTests();
});
