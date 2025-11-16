import type { TestContext } from './test-harness.ts';

export default function runObjectOnlyTests(ctx: TestContext) {
  const assert: TestContext['assert'] = ctx.assert;
  const loadFixtureClass = ctx.loadFixtureClass;

  const ObjectOnly = loadFixtureClass('tests/object-only.propane', 'ObjectOnly');

  const objectInstance = new ObjectOnly({
    id: 10,
    name: 'ObjectOnly',
    age: 50,
    active: false,
  });
  const objectSerialized = objectInstance.serialize();
  assert(
    objectSerialized.startsWith(':{'),
    'Non-indexed properties should serialize as object literal.'
  );
  assert(objectInstance.cerealize().name === 'ObjectOnly', 'Non-indexed serialization failed.');

  const objectRaw =
    ':{\"id\":30,\"name\":\"Obj\",\"age\":60,\"active\":true}';
  const objectHydrated = ObjectOnly.deserialize(objectRaw);
  assert(objectHydrated.cerealize().name === 'Obj', 'Object raw deserialize lost name.');
}
