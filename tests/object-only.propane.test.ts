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
  const expectedSerialized = ':{id:10,name:ObjectOnly,age:50,active:false}';
  assert(
    objectSerialized === expectedSerialized,
    'Object serialization should omit unnecessary quotes.'
  );
  assert(objectInstance.cerealize().name === 'ObjectOnly', 'Non-indexed serialization failed.');
  const objectRoundTrip = ObjectOnly.deserialize(objectSerialized);
  assert(objectRoundTrip.cerealize().name === 'ObjectOnly', 'Compact object serialization should be readable.');

  const compactRaw = ':{id:30,name:Obj,age:60,active:true}';
  const compactHydrated = ObjectOnly.deserialize(compactRaw);
  assert(compactHydrated.cerealize().name === 'Obj', 'Compact object raw deserialize lost name.');

  const legacyRaw = ':{"id":30,"name":"Obj","age":60,"active":true}';
  const legacyHydrated = ObjectOnly.deserialize(legacyRaw);
  assert(legacyHydrated.cerealize().name === 'Obj', 'Legacy object raw deserialize lost name.');
}
