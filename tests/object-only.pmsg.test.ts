import { assert } from './assert.js';
import { ObjectOnly } from './object-only.pmsg.js';
import { test } from 'node:test';

export default function runObjectOnlyTests() {

  const objectInstance: ObjectOnly = new ObjectOnly({
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
  assert(objectInstance.name === 'ObjectOnly', 'Non-indexed serialization failed.');
  const objectRoundTrip = ObjectOnly.deserialize(objectSerialized);
  assert(objectRoundTrip.name === 'ObjectOnly', 'Compact object serialization should be readable.');

  const compactRaw = ':{id:30,name:Obj,age:60,active:true}';
  const compactHydrated = ObjectOnly.deserialize(compactRaw);
  assert(compactHydrated.name === 'Obj', 'Compact object raw deserialize lost name.');

  const legacyRaw = ':{"id":30,"name":"Obj","age":60,"active":true}';
  const legacyHydrated = ObjectOnly.deserialize(legacyRaw);
  assert(legacyHydrated.name === 'Obj', 'Legacy object raw deserialize lost name.');
}

test('runObjectOnlyTests', () => {
  runObjectOnlyTests();
});
