import { assert } from './assert.js';
// Import from the generated .pmsg.js re-export to get the extended class.
import { Person } from './extend-basic.pmsg.js';
import { test } from 'node:test';

// Note: We can't use `ReturnType<typeof Person.deserialize>` to verify the return type
// because TypeScript's ReturnType doesn't capture the `this` polymorphism from
// `static deserialize<T extends typeof Person$Base>(this: T, ...): InstanceType<T>`.
// Instead, we verify the type works correctly at call sites in the tests below.
// See: planning/wip/type-system-limitations.md

export default function runExtendBasicTests() {
  // Test creating an extended person
  const person = new Person({
    firstName: 'John',
    lastName: 'Doe',
    age: 25,
  });

  // Test that base properties work
  assert(person.firstName === 'John', 'firstName should be "John"');
  assert(person.lastName === 'Doe', 'lastName should be "Doe"');
  assert(person.age === 25, 'age should be 25');

  // Test custom getter: fullName
  assert(person.fullName === 'John Doe', 'fullName should be "John Doe"');

  // Test custom getter: isAdult
  assert(person.isAdult === true, 'isAdult should be true for age 25');

  // Test custom method: greet
  assert(person.greet() === 'Hello, John Doe!', 'greet() should return greeting');

  // Test that setters return the extended type
  const updatedPerson = person.setFirstName('Jane');
  assert(updatedPerson.firstName === 'Jane', 'setFirstName should update firstName');
  assert(updatedPerson.fullName === 'Jane Doe', 'updated person should have fullName getter');
  assert(typeof updatedPerson.greet === 'function', 'updated person should have greet method');

  // Test chained setters preserve extension
  const chainedPerson = person
    .setFirstName('Bob')
    .setLastName('Smith')
    .setAge(17);
  assert(chainedPerson.fullName === 'Bob Smith', 'chained setters should preserve fullName');
  assert(chainedPerson.isAdult === false, 'isAdult should be false for age 17');

  // Test serialization and deserialization
  const serialized = person.serialize();
  assert(typeof serialized === 'string', 'serialize should return string');

  const deserialized = Person.deserialize(serialized);
  assert(deserialized.firstName === 'John', 'deserialized firstName should match');
  assert(deserialized.lastName === 'Doe', 'deserialized lastName should match');
  assert(deserialized.age === 25, 'deserialized age should match');
  // Verify deserialize returns the extended Person class, not Person$Base
  assert(deserialized instanceof Person, 'deserialized should be instanceof Person');
  assert(deserialized.fullName === 'John Doe', 'deserialized should have fullName getter');
  assert(typeof deserialized.greet === 'function', 'deserialized should have greet method');

  // Test deserialized instance can call extension methods
  assert(deserialized.greet() === 'Hello, John Doe!', 'deserialized greet() should work');

  // Test deserialized instance setters return extended type
  const deserializedModified = deserialized.setFirstName('Modified');
  assert(deserializedModified instanceof Person, 'setter on deserialized should return Person');
  assert(deserializedModified.fullName === 'Modified Doe', 'modified deserialized should have fullName');
  assert(typeof deserializedModified.greet === 'function', 'modified deserialized should have greet');

  // Test re-serialization of deserialized instance
  const reserialized = deserialized.serialize();
  assert(reserialized === serialized, 'reserialized should equal original serialized');

  // Test equality between original and deserialized
  assert(person.equals(deserialized), 'original and deserialized should be equal');
  assert(deserialized.equals(person), 'deserialized and original should be equal');

  // Test with skipValidation option
  const deserializedSkipValidation = Person.deserialize(serialized, { skipValidation: true });
  assert(deserializedSkipValidation instanceof Person, 'skipValidation deserialize should return Person');
  assert(deserializedSkipValidation.fullName === 'John Doe', 'skipValidation deserialize should have extension');

  // Test that instanceof works
  assert(person instanceof Person, 'person should be instanceof Person');

  // Test equality
  const samePerson = new Person({
    firstName: 'John',
    lastName: 'Doe',
    age: 25,
  });
  assert(person.equals(samePerson), 'equal persons should be equal');

  const differentPerson = new Person({
    firstName: 'Jane',
    lastName: 'Doe',
    age: 25,
  });
  assert(!person.equals(differentPerson), 'different persons should not be equal');
}

test('runExtendBasicTests', () => {
  runExtendBasicTests();
});
