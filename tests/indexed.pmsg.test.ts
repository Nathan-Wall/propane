import { assert, assertThrows } from './assert.js';
import { Indexed } from './indexed.pmsg.js';
import { test } from 'node:test';

// Note: ReturnType<typeof Indexed.deserialize> doesn't work with polymorphic static methods.
// The type is verified at call sites instead. See: planning/wip/type-system-limitations.md

export default function runIndexedPropaneTests() {
  if (typeof Indexed !== 'function') {
    throw new TypeError('Indexed class was not exported.');
  }

  const instance: Indexed = new Indexed({
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

  assert(instance.name === 'Alice', 'Instance lost name.');
  assert(instance.alias === 'Ace', 'Instance lost alias.');

  const hydrated = Indexed.deserialize(serialized);
  assert(hydrated instanceof Indexed, 'Deserialize should produce class instance.');
  assert(hydrated.name === 'Alice', 'Roundtrip lost data.');

  const rawString = ':{3,"Chris",24,false,"CJ",99,null,"PENDING"}';
  const hydratedFromString = Indexed.deserialize(rawString);
  assert(hydratedFromString.name === 'Chris', 'Raw string deserialize lost name.');
  assert(hydratedFromString.score === 99, 'Raw string deserialize lost score.');
  assert(hydratedFromString.alias === null, 'Raw string deserialize lost alias.');
  assert(hydratedFromString.status === 'PENDING', 'Raw string deserialize lost status.');

  const cerealInput = ':{2,"Bob",28,false,"B",80,null,"IDLE"}';
  const fromCereal = Indexed.deserialize(cerealInput);
  assert(fromCereal.name === 'Bob', 'Deserialize failed.');
  assert(fromCereal.score === 80, 'Deserialize lost score.');
  assert(fromCereal.alias === null, 'Deserialize lost alias.');
  assert(fromCereal.status === 'IDLE', 'Deserialize lost status.');

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

    status: 'MISSING',
  });
  const optionalSerial = optionalMissing.serialize();
  assert(
    optionalSerial === ':{4,Optional,35,false,6:0,8:MISSING}',
    'Optional slot string incorrect.'
  );
  assert(optionalMissing.nickname === undefined, 'Optional should omit nickname.');

  const optionalRawWithValue = ':{6,"OptName",31,true,"CJ",12,"CJ-A","RUN"}';
  const optionalHydrated = Indexed.deserialize(optionalRawWithValue);
  assert(optionalHydrated.nickname === 'CJ', 'Raw optional value not preserved.');
  assert(optionalHydrated.score === 12, 'Raw score lost.');
  assert(optionalHydrated.alias === 'CJ-A', 'Raw alias lost.');

  const optionalRawMissing =
    ':{"1":7,"2":"OptName","3":31,"4":true,"6":5,"8":"RESTING"}';
  const optionalHydratedMissing = Indexed.deserialize(optionalRawMissing);
  assert(optionalHydratedMissing.nickname === undefined, 'Missing optional value should stay undefined.');
  assert(optionalHydratedMissing.score === 5, 'Missing optional roundtrip lost score.');
  assert(optionalHydratedMissing.alias === undefined, 'Missing alias should stay undefined.');

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
  assert(scoreNullHydrated.score === null, 'Score null raw not preserved.');
  assert(scoreNullHydrated.alias === 'AliasRaw', 'Score raw alias lost.');

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
  assert(aliasNullHydrated.alias === null, 'Alias null raw not preserved.');
}

test('runIndexedPropaneTests', () => {
  runIndexedPropaneTests();
});
