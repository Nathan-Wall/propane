import { assert } from './assert.ts';
// Import Person from extension file (not pmsg file) to get extended class
import { Person } from './extend-basic.pmsg.ext.ts';

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
  // Note: deserialization returns Person$Base, not the extended Person
  // This is expected behavior for the current implementation

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
