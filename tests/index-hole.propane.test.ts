import type { TestContext } from './test-harness.ts';

export default function runIndexHoleTests(ctx: TestContext) {
  const assert: TestContext['assert'] = ctx.assert;
  const loadFixtureClass = ctx.loadFixtureClass;

  const Hole = loadFixtureClass('tests/index-hole.propane', 'Hole');

  const holeInstance = new Hole({
    id: 20,
    name: 'Hole',
    value: 42,
  });
  const holeSerialized = holeInstance.serialize();
  assert(
    holeSerialized.startsWith(':{'),
    'Serialization with holes should fall back to object literal.'
  );
  assert(holeInstance.cerealize().id === 20, 'Hole serialization lost data.');

  const holeRaw =
    ':{\"1\":20,\"3\":42,\"name\":\"Hole\"}';
  const holeHydrated = Hole.deserialize(holeRaw);
  const holeHydratedCereal = holeHydrated.cerealize();
  assert(holeHydratedCereal.name === 'Hole', 'Hole raw deserialize lost name.');
}
