/**
 * Serialization Demo
 *
 * This script demonstrates the serialization output for various message types,
 * including the tagged union format for message unions.
 *
 * Run with: node examples/serialization-demo.js
 */

import { Cat, Dog, PetOwner } from '../build/tests/message-union.propane.js';

console.log('='.repeat(60));
console.log('Propane Serialization Demo');
console.log('='.repeat(60));

// Cat message (standalone, no union)
console.log('\n--- Cat Message (standalone) ---');
const cat = new Cat({
  name: 'Whiskers',
  meows: true,
});
console.log('Input:', JSON.stringify({ name: 'Whiskers', meows: true }));
console.log('Serialized:', cat.serialize());
console.log('Note: No $Cat tag because Cat is not in a union context here');

// Dog message (standalone, no union)
console.log('\n--- Dog Message (standalone) ---');
const dog = new Dog({
  name: 'Buddy',
  barks: true,
});
console.log('Input:', JSON.stringify({ name: 'Buddy', barks: true }));
console.log('Serialized:', dog.serialize());
console.log('Note: No $Dog tag because Dog is not in a union context here');

// PetOwner with Cat (union type - will be tagged)
console.log('\n--- PetOwner with Cat ---');
const catOwner = new PetOwner({
  ownerName: 'Alice',
  pet: new Cat({ name: 'Whiskers', meows: true }),
});
console.log('Input:', JSON.stringify({
  ownerName: 'Alice',
  pet: { name: 'Whiskers', meows: true, _type: 'Cat' },
}));
console.log('Serialized:', catOwner.serialize());
console.log('Note: The pet property contains $Cat{...} tag for union discrimination');

// PetOwner with Dog (union type - will be tagged)
console.log('\n--- PetOwner with Dog ---');
const dogOwner = new PetOwner({
  ownerName: 'Bob',
  pet: new Dog({ name: 'Buddy', barks: true }),
});
console.log('Input:', JSON.stringify({
  ownerName: 'Bob',
  pet: { name: 'Buddy', barks: true, _type: 'Dog' },
}));
console.log('Serialized:', dogOwner.serialize());
console.log('Note: The pet property contains $Dog{...} tag for union discrimination');

// PetOwner with both required and optional pets
console.log('\n--- PetOwner with Optional Pet ---');
const multiPetOwner = new PetOwner({
  ownerName: 'Charlie',
  pet: new Cat({ name: 'Mittens', meows: false }),
  optionalPet: new Dog({ name: 'Rex', barks: true }),
});
console.log('Input:', JSON.stringify({
  ownerName: 'Charlie',
  pet: { name: 'Mittens', meows: false, _type: 'Cat' },
  optionalPet: { name: 'Rex', barks: true, _type: 'Dog' },
}));
console.log('Serialized:', multiPetOwner.serialize());
console.log('Note: Both pet and optionalPet are tagged since they are union types');

// Deserialization roundtrip demo
console.log('\n--- Deserialization Roundtrip ---');
const serialized = catOwner.serialize();
console.log('Original serialized:', serialized);
const deserialized = PetOwner.deserialize(serialized);
console.log('Deserialized pet type:', deserialized.pet.constructor.name);
console.log('Deserialized pet name:', deserialized.pet.name);
console.log('Re-serialized:', deserialized.serialize());
console.log('Roundtrip match:', serialized === deserialized.serialize());

console.log('\n' + '='.repeat(60));
console.log('Demo complete!');
console.log('='.repeat(60));
