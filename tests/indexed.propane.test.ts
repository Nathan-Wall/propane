import { assert, assertThrows } from './assert.ts';
import { Indexed as IndexedClass } from './tmp/indexed.propane.js';

type IndexedInstance = IndexedClass;
type IndexedConstructor = typeof IndexedClass;

export default function runIndexedPropaneTests() {
  const Indexed: IndexedConstructor = IndexedClass;
  if (typeof Indexed !== 'function') {
    throw new Error('Indexed class was not exported.');
  }

  const instance: IndexedInstance = new Indexed({
    id: 1,
    name: 'Alice',
    age: 30,
    active: true,
    nickname: 'Al',
    score: 42,
    alias: 'Ace',
    status: 'READY',
  });

  const renamed = instance.setName('Bobette');
  assert(instance.name === 'Alice', 'setName should not mutate original instance.');
  assert(renamed.name === 'Bobette', 'setName should apply to returned copy.');
  const aliasCleared = renamed.setAlias(undefined);
  assert(aliasCleared.alias === undefined, 'setAlias should allow clearing optional field.');
  assert(renamed.alias === 'Ace', 'setAlias should not mutate source instance.');

  const serialized = instance.serialize();
  const expectedSerialized = ':{1,Alice,30,true,Al,42,Ace,READY}';
  assert(
    serialized === expectedSerialized,
    'Serialized string did not match expected.'
  );

  const cerealObj = instance.cerealize();
  assert(cerealObj.name === 'Alice', 'cerealize lost name.');
  assert(cerealObj.alias === 'Ace', 'cerealize lost alias.');

  const hydrated = Indexed.deserialize(serialized);
  assert(hydrated instanceof Indexed, 'Deserialize should produce class instance.');
  const hydratedCereal = hydrated.cerealize();
  assert(hydratedCereal.name === 'Alice', 'Roundtrip lost data.');

  const rawString = ':{3,"Chris",24,false,"CJ",99,null,"PENDING"}';
  const hydratedFromString = Indexed.deserialize(rawString);
  const hydratedFromStringCereal = hydratedFromString.cerealize();
  assert(hydratedFromStringCereal.name === 'Chris', 'Raw string deserialize lost name.');
  assert(hydratedFromStringCereal.score === 99, 'Raw string deserialize lost score.');
  assert(hydratedFromStringCereal.alias === null, 'Raw string deserialize lost alias.');
  assert(hydratedFromStringCereal.status === 'PENDING', 'Raw string deserialize lost status.');

  const cerealInput = ':{2,"Bob",28,false,"B",80,null,"IDLE"}';
  const fromCereal = Indexed.deserialize(cerealInput);
  const fromCerealPayload = fromCereal.cerealize();
  assert(fromCerealPayload.name === 'Bob', 'Decerealize failed.');
  assert(fromCerealPayload.score === 80, 'Decerealize lost score.');
  assert(fromCerealPayload.alias === null, 'Decerealize lost alias.');
  assert(fromCerealPayload.status === 'IDLE', 'Decerealize lost status.');

  assertThrows(
    () => Indexed.deserialize(':{"name":"Charlie","age":22,"active":true}'),
    'Missing required fields should throw.'
  );

  assertThrows(
    () =>
      Indexed.deserialize(':{"1":"bad","name":"Dana","age":40,"active":true}'),
    'Invalid field types should throw.'
  );

  const optionalMissing = new Indexed({
    id: 4,
    name: 'Optional',
    age: 35,
    active: false,
    score: 0,
    alias: undefined,
    status: 'MISSING',
  });
  const optionalSerial = optionalMissing.serialize();
  assert(
    optionalSerial === ':{4,Optional,35,false,6:0,8:MISSING}',
    'Optional slot string incorrect.'
  );
  const optionalObject = optionalMissing.cerealize();
  assert(optionalObject.nickname === undefined, 'Object cerealize should omit nickname.');

  const optionalRawWithValue = ':{6,"OptName",31,true,"CJ",12,"CJ-A","RUN"}';
  const optionalHydrated = Indexed.deserialize(optionalRawWithValue);
  const optionalHydratedCereal = optionalHydrated.cerealize();
  assert(optionalHydratedCereal.nickname === 'CJ', 'Raw optional value not preserved.');
  assert(optionalHydratedCereal.score === 12, 'Raw score lost.');
  assert(optionalHydratedCereal.alias === 'CJ-A', 'Raw alias lost.');

  const optionalRawMissing =
    ':{"1":7,"2":"OptName","3":31,"4":true,"6":5,"8":"RESTING"}';
  const optionalHydratedMissing = Indexed.deserialize(optionalRawMissing);
  const optionalHydratedMissingCereal = optionalHydratedMissing.cerealize();
  assert(optionalHydratedMissingCereal.nickname === undefined, 'Missing optional value should stay undefined.');
  assert(optionalHydratedMissingCereal.score === 5, 'Missing optional roundtrip lost score.');
  assert(optionalHydratedMissingCereal.alias === undefined, 'Missing alias should stay undefined.');

  const scoreNullInstance = new Indexed({
    id: 9,
    name: 'Null Score',
    age: 25,
    active: false,
    nickname: 'NS',
    score: null,
    alias: 'Alias',
    status: 'testing',
  });
  const scoreNullSerialized = scoreNullInstance.serialize();
  assert(
    scoreNullSerialized === ':{9,Null Score,25,false,NS,null,Alias,testing}',
    'Null score serialization incorrect.'
  );
  const scoreNullRaw = ':{10,"Score Raw",33,true,"NR",null,"AliasRaw","HALT"}';
  const scoreNullHydrated = Indexed.deserialize(scoreNullRaw);
  const scoreNullHydratedCereal = scoreNullHydrated.cerealize();
  assert(scoreNullHydratedCereal.score === null, 'Score null raw not preserved.');
  assert(scoreNullHydratedCereal.alias === 'AliasRaw', 'Score raw alias lost.');

  const aliasNullInstance = new Indexed({
    id: 11,
    name: 'Alias Null',
    age: 40,
    active: true,
    nickname: 'AN',
    score: 7,
    alias: null,
    status: 'alias-null',
  });
  const aliasNullSerialized = aliasNullInstance.serialize();
  assert(
    aliasNullSerialized === ':{11,Alias Null,40,true,AN,7,null,alias-null}',
    'Alias null serialization incorrect.'
  );
  const aliasNullRaw = ':{12,Alias Raw,41,true,AR,8,null,alias-raw}';
  const aliasNullHydrated = Indexed.deserialize(aliasNullRaw);
  const aliasNullHydratedCereal = aliasNullHydrated.cerealize();
  assert(aliasNullHydratedCereal.alias === null, 'Alias null raw not preserved.');
}
