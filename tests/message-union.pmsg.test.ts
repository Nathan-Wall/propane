import { assert } from './assert.ts';
import { Cat, Dog, PetOwner } from './message-union.pmsg.ts';

export default function runMessageUnionTests() {
  // Test with Cat as pet
  const catOwner = new PetOwner({
    ownerName: 'Alice',
    pet: new Cat({ name: 'Whiskers', meows: true }),
  });

  // Serialization should include the $Cat tag for the union property
  const catOwnerSerialized = catOwner.serialize();
  assert(
    catOwnerSerialized.includes('$Cat{'),
    `Cat union should be tagged in serialization. Got: ${catOwnerSerialized}`
  );
  assert(
    catOwnerSerialized.includes('Whiskers'),
    `Serialization should include cat name. Got: ${catOwnerSerialized}`
  );

  // Test with Dog as pet
  const dogOwner = new PetOwner({
    ownerName: 'Bob',
    pet: new Dog({ name: 'Buddy', barks: true }),
  });

  const dogOwnerSerialized = dogOwner.serialize();
  assert(
    dogOwnerSerialized.includes('$Dog{'),
    `Dog union should be tagged in serialization. Got: ${dogOwnerSerialized}`
  );
  assert(
    dogOwnerSerialized.includes('Buddy'),
    `Serialization should include dog name. Got: ${dogOwnerSerialized}`
  );

  // Test deserialization roundtrip for Cat
  const catOwnerDeserialized = PetOwner.deserialize(catOwnerSerialized);
  assert(
    catOwnerDeserialized.ownerName === 'Alice',
    'Deserialized owner name should match'
  );
  assert(
    catOwnerDeserialized.pet instanceof Cat,
    `Deserialized pet should be Cat instance. Got: ${catOwnerDeserialized.pet?.constructor.name}`
  );
  const deserializedCat = catOwnerDeserialized.pet as Cat;
  assert(
    deserializedCat.name === 'Whiskers',
    `Cat name should be preserved. Got: ${deserializedCat.name}`
  );
  assert(
    deserializedCat.meows === true,
    `Cat meows should be preserved. Got: ${deserializedCat.meows}`
  );

  // Test deserialization roundtrip for Dog
  const dogOwnerDeserialized = PetOwner.deserialize(dogOwnerSerialized);
  assert(
    dogOwnerDeserialized.ownerName === 'Bob',
    'Deserialized owner name should match'
  );
  assert(
    dogOwnerDeserialized.pet instanceof Dog,
    `Deserialized pet should be Dog instance. Got: ${dogOwnerDeserialized.pet?.constructor.name}`
  );
  const deserializedDog = dogOwnerDeserialized.pet as Dog;
  assert(
    deserializedDog.name === 'Buddy',
    `Dog name should be preserved. Got: ${deserializedDog.name}`
  );
  assert(
    deserializedDog.barks === true,
    `Dog barks should be preserved. Got: ${deserializedDog.barks}`
  );

  // Test optional union property
  const ownerWithOptionalPet = new PetOwner({
    ownerName: 'Charlie',
    pet: new Cat({ name: 'Mittens', meows: false }),
    optionalPet: new Dog({ name: 'Rex', barks: true }),
  });

  const optionalSerialized = ownerWithOptionalPet.serialize();
  assert(
    optionalSerialized.includes('$Cat{') && optionalSerialized.includes('$Dog{'),
    `Both pet and optionalPet should be tagged. Got: ${optionalSerialized}`
  );

  const ownerDeserialized = PetOwner.deserialize(optionalSerialized);
  assert(
    ownerDeserialized.pet instanceof Cat,
    'Required pet should be Cat'
  );
  assert(
    ownerDeserialized.optionalPet instanceof Dog,
    'Optional pet should be Dog'
  );

  // Test without optional pet
  const ownerNoOptional = new PetOwner({
    ownerName: 'Dana',
    pet: new Dog({ name: 'Spot', barks: false }),
  });

  const noOptionalSerialized = ownerNoOptional.serialize();
  const noOptionalDeserialized = PetOwner.deserialize(noOptionalSerialized);
  assert(
    noOptionalDeserialized.optionalPet === undefined,
    'Optional pet should be undefined when not provided'
  );
  assert(
    noOptionalDeserialized.pet instanceof Dog,
    'Required pet should be Dog'
  );

  // Test that non-union message types are NOT tagged
  const standalonecat = new Cat({ name: 'Solo', meows: true });
  const catSerialized = standalonecat.serialize();
  assert(
    !catSerialized.includes('$Cat{'),
    `Standalone Cat serialization should NOT be tagged. Got: ${catSerialized}`
  );
}
