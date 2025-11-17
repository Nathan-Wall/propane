import type { TestContext } from './test-harness.ts';
import type {
  PropaneMessageConstructor,
  PropaneMessageInstance,
} from './propane-test-types.ts';

interface HoleProps {
  id: number;
  value: number;
  name: string;
}

type HoleInstance = PropaneMessageInstance<HoleProps>;

type HoleConstructor = PropaneMessageConstructor<HoleProps, HoleInstance>;

export default function runIndexHoleTests(ctx: TestContext) {
  const assert: TestContext['assert'] = (condition, message) => {
    ctx.assert(condition, message);
  };
  const loadFixtureClass: TestContext['loadFixtureClass'] = (fixture, exportName) => {
    return ctx.loadFixtureClass(fixture, exportName);
  };

  const Hole = loadFixtureClass<HoleConstructor>('tests/index-hole.propane', 'Hole');

  const holeInstance = new Hole({
    id: 20,
    name: 'Hole',
    value: 42,
  });
  const holeSerialized = holeInstance.serialize();
  const expectedHoleSerialization = ':{1:20,3:42,4:Hole}';
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
