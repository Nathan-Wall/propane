import type { TestContext } from './test-harness.ts';
import type {
  PropaneMessageConstructor,
  PropaneMessageInstance,
} from './propane-test-types.ts';

interface ObjectOnlyProps {
  id: number;
  name: string;
  age: number;
  active: boolean;
}

interface ObjectOnlyInstance extends ObjectOnlyProps, PropaneMessageInstance<ObjectOnlyProps> {}

type ObjectOnlyConstructor = PropaneMessageConstructor<ObjectOnlyProps, ObjectOnlyInstance>;

export default function runObjectOnlyTests(ctx: TestContext) {
  const assert: TestContext['assert'] = (condition, message) => {
    ctx.assert(condition, message);
  };
  const loadFixtureClass: TestContext['loadFixtureClass'] = (fixture, exportName) => {
    return ctx.loadFixtureClass(fixture, exportName);
  };

  const ObjectOnly = loadFixtureClass<ObjectOnlyConstructor>('tests/object-only.propane', 'ObjectOnly');

  const objectInstance: ObjectOnlyInstance = new ObjectOnly({
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
    ':{"id":30,"name":"Obj","age":60,"active":true}';
  const objectHydrated = ObjectOnly.deserialize(objectRaw);
  assert(objectHydrated.cerealize().name === 'Obj', 'Object raw deserialize lost name.');
}
