import { assert } from './assert.js';
import { Hole } from './index-hole.pmsg.js';
import { test } from 'node:test';

export default function runIndexHoleTests() {

  const holeInstance = new Hole({
    id: 20,
    name: 'Hole',
    value: 42,
  });
  const holeSerialized = holeInstance.serialize();
  const expectedHoleSerialization = ':{20,3:42,Hole}';
  assert(
    holeSerialized === expectedHoleSerialization,
    `Hole serialization should use compact object literal. Got: ${holeSerialized}`
  );
  assert(holeInstance.id === 20, 'Hole serialization lost data.');
  const hydratedHole = Hole.deserialize(holeSerialized);
  assert(hydratedHole.name === 'Hole', 'Hole roundtrip failed.');

  const holeRaw = ':{"1":20,"3":42,"name":"Hole"}';
  const holeHydrated = Hole.deserialize(holeRaw);
  assert(holeHydrated.name === 'Hole', 'Hole raw deserialize lost name.');
}

test('runIndexHoleTests', () => {
  runIndexHoleTests();
});
