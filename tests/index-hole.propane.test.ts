import { assert } from './assert.ts';
import { Hole as HoleClass } from './tmp/index-hole.propane.js';

type HoleInstance = HoleClass;
type HoleConstructor = typeof HoleClass;

export default function runIndexHoleTests() {
  const Hole: HoleConstructor = HoleClass;

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
  assert(holeInstance.cerealize().id === 20, 'Hole serialization lost data.');
  const hydratedHole = Hole.deserialize(holeSerialized);
  assert(hydratedHole.cerealize().name === 'Hole', 'Hole roundtrip failed.');

  const holeRaw = ':{"1":20,"3":42,"name":"Hole"}';
  const holeHydrated = Hole.deserialize(holeRaw);
  const holeHydratedCereal = holeHydrated.cerealize();
  assert(holeHydratedCereal.name === 'Hole', 'Hole raw deserialize lost name.');
}
