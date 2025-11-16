'use strict';

import fs from 'fs';
import path from 'path';
import vm from 'vm';
import ts from 'typescript';

export default function runSerializationTests({ projectRoot, transform }) {
  const runtimeExports = buildRuntimeExports(projectRoot);
  const Simple = buildClassFromFixture({
    projectRoot,
    transform,
    runtimeExports,
    fixture: 'tests/indexed.propane',
    exportName: 'Simple',
  });
  if (typeof Simple !== 'function') {
    throw new Error('Simple class was not exported.');
  }

  const instance = new Simple({
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
  const expectedSerialized = ':[1,Alice,30,true,Al,42,Ace,READY]';
  assert(
    serialized === expectedSerialized,
    'Serialized string did not match expected.'
  );

  const cerealObj = instance.cerealize();
  assert(cerealObj.name === 'Alice', 'cerealize lost name.');
  assert(cerealObj.alias === 'Ace', 'cerealize lost alias.');

  const hydrated = Simple.deserialize(serialized);
  assert(hydrated instanceof Simple, 'Deserialize should produce class instance.');
  const hydratedCereal = hydrated.cerealize();
  assert(hydratedCereal.name === 'Alice', 'Roundtrip lost data.');

  const rawString = ':[3,"Chris",24,false,"CJ",99,null,"PENDING"]';
  const hydratedFromString = Simple.deserialize(rawString);
  const hydratedFromStringCereal = hydratedFromString.cerealize();
  assert(hydratedFromStringCereal.name === 'Chris', 'Raw string deserialize lost name.');
  assert(hydratedFromStringCereal.score === 99, 'Raw string deserialize lost score.');
  assert(hydratedFromStringCereal.alias === null, 'Raw string deserialize lost alias.');
  assert(hydratedFromStringCereal.status === 'PENDING', 'Raw string deserialize lost status.');

  const cerealInput = ':[2,"Bob",28,false,"B",80,null,"IDLE"]';
  const fromCereal = Simple.deserialize(cerealInput);
  const fromCerealPayload = fromCereal.cerealize();
  assert(fromCerealPayload.name === 'Bob', 'Decerealize failed.');
  assert(fromCerealPayload.score === 80, 'Decerealize lost score.');
  assert(fromCerealPayload.alias === null, 'Decerealize lost alias.');
  assert(fromCerealPayload.status === 'IDLE', 'Decerealize lost status.');

  assertThrows(
    () => Simple.deserialize(':{\"name\":\"Charlie\",\"age\":22,\"active\":true}'),
    'Missing required fields should throw.'
  );

  assertThrows(
    () =>
      Simple.deserialize(':{\"1\":\"bad\",\"name\":\"Dana\",\"age\":40,\"active\":true}'),
    'Invalid field types should throw.'
  );
  const optionalMissing = new Simple({
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
    optionalSerial === ':[4,Optional,35,false,undefined,0,undefined,MISSING]',
    'Optional slot string incorrect.'
  );
  const optionalObject = optionalMissing.cerealize();
  assert(optionalObject.nickname === undefined, 'Object cerealize should omit nickname.');

  const optionalRawWithValue = ':[6,"OptName",31,true,"CJ",12,"CJ-A","RUN"]';
  const optionalHydrated = Simple.deserialize(optionalRawWithValue);
  const optionalHydratedCereal = optionalHydrated.cerealize();
  assert(optionalHydratedCereal.nickname === 'CJ', 'Raw optional value not preserved.');
  assert(optionalHydratedCereal.score === 12, 'Raw score lost.');
  assert(optionalHydratedCereal.alias === 'CJ-A', 'Raw alias lost.');

  const optionalRawMissing =
    ':{\"1\":7,\"2\":\"OptName\",\"3\":31,\"4\":true,\"6\":5,\"8\":\"RESTING\"}';
  const optionalHydratedMissing = Simple.deserialize(optionalRawMissing);
  const optionalHydratedMissingCereal = optionalHydratedMissing.cerealize();
  assert(optionalHydratedMissingCereal.nickname === undefined, 'Missing optional value should stay undefined.');
  assert(optionalHydratedMissingCereal.score === 5, 'Missing optional roundtrip lost score.');
  assert(optionalHydratedMissingCereal.alias === undefined, 'Missing alias should stay undefined.');

  const scoreNullInstance = new Simple({
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
    scoreNullSerialized === ':[9,Null Score,25,false,NS,null,Alias,testing]',
    'Null score serialization incorrect.'
  );
  const scoreNullRaw = ':[10,"Score Raw",33,true,"NR",null,"AliasRaw","HALT"]';
  const scoreNullHydrated = Simple.deserialize(scoreNullRaw);
  const scoreNullHydratedCereal = scoreNullHydrated.cerealize();
  assert(scoreNullHydratedCereal.score === null, 'Score null raw not preserved.');
  assert(scoreNullHydratedCereal.alias === 'AliasRaw', 'Score raw alias lost.');

  const aliasNullInstance = new Simple({
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
    aliasNullSerialized === ':[11,Alias Null,40,true,AN,7,null,alias-null]',
    'Alias null serialization incorrect.'
  );
  const aliasNullRaw = ':[12,Alias Raw,41,true,AR,8,null,alias-raw]';
  const aliasNullHydrated = Simple.deserialize(aliasNullRaw);
  const aliasNullHydratedCereal = aliasNullHydrated.cerealize();
  assert(aliasNullHydratedCereal.alias === null, 'Alias null raw not preserved.');
  const ObjectOnly = buildClassFromFixture({
    projectRoot,
    transform,
    runtimeExports,
    fixture: 'tests/object-only.propane',
    exportName: 'ObjectOnly',
  });
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

  const Hole = buildClassFromFixture({
    projectRoot,
    transform,
    runtimeExports,
    fixture: 'tests/index-hole.propane',
    exportName: 'Hole',
  });

  const holeInstance = new Hole({
    id: 20,
    name: 'Hole',
    value: 42,
  });
  const holeSerialized = holeInstance.serialize();
  assert(
    holeSerialized.startsWith(':{'),
    'Serialization with holes should fall back to object literal.'
  );
  assert(holeInstance.cerealize().id === 20, 'Hole serialization lost data.');

  const holeRaw =
    ':{\"1\":20,\"3\":42,\"name\":\"Hole\"}';
  const holeHydrated = Hole.deserialize(holeRaw);
  const holeHydratedCereal = holeHydrated.cerealize();
  assert(holeHydratedCereal.name === 'Hole', 'Hole raw deserialize lost name.');

  const objectRaw =
    ':{\"id\":30,\"name\":\"Obj\",\"age\":60,\"active\":true}';
  const objectHydrated = ObjectOnly.deserialize(objectRaw);
  assert(objectHydrated.cerealize().name === 'Obj', 'Object raw deserialize lost name.');

  const UnionStringBool = buildClassFromFixture({
    projectRoot,
    transform,
    runtimeExports,
    fixture: 'tests/union-string-bool.propane',
    exportName: 'UnionStringBool',
  });

  const unionStringInstance = new UnionStringBool({
    value: 'true',
    optional: '42',
  });
  assert(
    unionStringInstance.serialize() === ':[\"true\",\"42\"]',
    'String union serialization failed.'
  );

  const unionBoolInstance = new UnionStringBool({
    value: true,
    optional: false,
  });
  assert(
    unionBoolInstance.serialize() === ':[true,false]',
    'Boolean union serialization failed.'
  );

  const unionStringRaw = UnionStringBool.deserialize(':[\"true\",false]');
  const unionStringRawData = unionStringRaw.cerealize();
  assert(unionStringRawData.value === 'true', 'Union string raw lost string value.');
  assert(unionStringRawData.optional === false, 'Union string raw lost optional boolean.');

  const unionBoolRaw = UnionStringBool.deserialize(':[true,\"false\"]');
  const unionBoolRawData = unionBoolRaw.cerealize();
  assert(unionBoolRawData.value === true, 'Union bool raw lost boolean value.');
  assert(unionBoolRawData.optional === 'false', 'Union bool raw lost string optional.');

  const ArrayMessage = buildClassFromFixture({
    projectRoot,
    transform,
    runtimeExports,
    fixture: 'tests/indexed-array.propane',
    exportName: 'ArrayMessage',
  });

  const arrayInstance = new ArrayMessage({
    names: ['Alpha', 'Beta', 'Gamma Value'],
    scores: [1, 2, 3],
    flags: [true, false],
    labels: [{ name: 'Label A' }],
  });

  assert(
    arrayInstance.serialize() === ':[[Alpha,Beta,Gamma Value],[1,2,3],[true,false],[{\"name\":\"Label A\"}]]',
    'Array serialization incorrect.'
  );

  const arrayRaw = ArrayMessage.deserialize(':[[Delta,Echo],[4,5],undefined,[{\"name\":\"Label B\"}]]');
  const arrayRawData = arrayRaw.cerealize();
  assert(arrayRawData.names[0] === 'Delta', 'Array raw lost names.');
  assert(arrayRawData.flags === undefined, 'Array raw optional flags should be undefined.');
  assert(arrayRawData.labels[0].name === 'Label B', 'Array raw labels lost.');

  const MapMessage = buildClassFromFixture({
    projectRoot,
    transform,
    runtimeExports,
    fixture: 'tests/map.propane',
    exportName: 'MapMessage',
  });

  const labels = new Map([
    ['one', 1],
    [2, 4],
  ]);
  const metadata = new Map([['owner', { value: 'Alice' }]]);
  const extras = new Map([
    ['alpha', { note: 'A' }],
    ['beta', { note: null }],
  ]);

  const mapInstance = new MapMessage({
    labels,
    metadata,
    extras,
  });
  assert(
    mapInstance.serialize() === ':[[[one,1],[2,4]],[[owner,{"value":"Alice"}]],[[alpha,{"note":"A"}],[beta,{"note":null}]]]',
    'Map serialization incorrect.'
  );
  const mapCereal = mapInstance.cerealize();
  assert(isMapValue(mapCereal.labels), 'Labels should stay Map.');
  assert(mapCereal.labels.get('one') === 1, 'Labels map lost string key.');
  assert(mapCereal.labels.get(2) === 4, 'Labels map lost numeric key.');
  assert(isMapValue(mapCereal.metadata), 'Metadata should stay Map.');
  assert(mapCereal.metadata.get('owner').value === 'Alice', 'Metadata map lost data.');
  const mapExtrasEntries = [...mapCereal.extras.entries()];
  assert(mapExtrasEntries[0][0] === 'alpha', 'Extras map lost string key.');
  assert(mapExtrasEntries[1][1].note === null, 'Extras map lost null value.');
  assert(typeof mapCereal.labels.toMap === 'function', 'Immutable map should expose toMap.');
  const labelsCopy = mapCereal.labels.toMap();
  labelsCopy.set('delta', 8);
  assert(!mapCereal.labels.has('delta'), 'Immutable map should not change when copy mutates.');
  const updatedLabelsInstance = mapInstance.setLabels(
    new Map([
      ['gamma', 7],
      [3, 9],
    ])
  );
  assert(mapInstance.labels.has('one'), 'setLabels should not mutate original instance.');
  assert(updatedLabelsInstance.labels.has('gamma'), 'setLabels result missing new key.');
  const clearedMetadata = mapInstance.setMetadata(undefined);
  assert(clearedMetadata.metadata === undefined, 'setMetadata should allow undefined.');
  assert(mapInstance.metadata.get('owner').value === 'Alice', 'setMetadata should not mutate original metadata.');

  const mapRaw = MapMessage.deserialize(':[[[alpha,10],[5,15]],undefined,[[raw,{"note":null}]]]');
  const mapRawData = mapRaw.cerealize();
  assert(mapRawData.labels.get('alpha') === 10, 'Raw map lost string key.');
  assert(mapRawData.labels.get(5) === 15, 'Raw map lost numeric key.');
  assert(mapRawData.metadata === undefined, 'Raw map optional metadata should be undefined.');
  const rawExtrasEntries = [...mapRawData.extras.entries()];
  assert(rawExtrasEntries[0][0] === 'raw', 'Raw map lost string key.');
  assert(rawExtrasEntries[0][1].note === null, 'Raw map lost null value.');

  const mapObjectRaw = MapMessage.deserialize(
    ':{\"1\":[[\"owner\",1]],\"2\":[[\"meta\",{\"value\":\"Bob\"}]],\"3\":[[\"obj\",{\"note\":\"Value\"}]]}'
  );
  const mapObjectRawData = mapObjectRaw.cerealize();
  assert(isMapValue(mapObjectRawData.metadata), 'Object raw metadata should be Map.');
  assert(mapObjectRawData.metadata.get('meta').value === 'Bob', 'Object raw metadata missing value.');
  const objectExtrasEntries = [...mapObjectRawData.extras.entries()];
  assert(objectExtrasEntries[0][0] === 'obj', 'Object raw extras lost key.');
  assert(objectExtrasEntries[0][1].note === 'Value', 'Object raw extras lost value.');

  const { ImmutableMap } = runtimeExports;
  assert(typeof ImmutableMap === 'function', 'ImmutableMap should be exported.');

  const immutable = new ImmutableMap([
    ['alpha', 1],
    ['beta', 2],
  ]);
  assert(immutable.size === 2, 'ImmutableMap size incorrect.');
  assert(immutable.get('alpha') === 1, 'ImmutableMap get failed.');
  assert(immutable.has('beta'), 'ImmutableMap has failed.');
  assert(
    JSON.stringify(Array.from(immutable.entries())) === JSON.stringify([['alpha', 1], ['beta', 2]]),
    'ImmutableMap entries incorrect.'
  );

  const seen = [];
  immutable.forEach((value, key) => {
    seen.push([key, value]);
  });
  assert(seen.length === 2, 'ImmutableMap forEach did not visit entries.');

  assert(typeof immutable.set === 'undefined', 'ImmutableMap should not expose set.');
  assert(typeof immutable.delete === 'undefined', 'ImmutableMap should not expose delete.');
  assert(typeof immutable.clear === 'undefined', 'ImmutableMap should not expose clear.');

  const plainMap = immutable.toMap();
  plainMap.set('gamma', 3);
  assert(!immutable.has('gamma'), 'ImmutableMap should remain immutable after toMap.');

  const cloned = new ImmutableMap(plainMap);
  assert(cloned.has('gamma'), 'ImmutableMap should accept Map constructor input.');

  const equalsPeer = new ImmutableMap([
    ['alpha', 1],
    ['beta', 2],
  ]);
  assert(immutable.equals(equalsPeer), 'ImmutableMap equals should match identical entries.');
  const equalsMap = new Map(equalsPeer);
  assert(immutable.equals(equalsMap), 'ImmutableMap equals should handle plain Map inputs.');
  const changedSource = equalsPeer.toMap();
  changedSource.set('delta', 4);
  const changedPeer = new ImmutableMap(changedSource);
  assert(!immutable.equals(changedPeer), 'ImmutableMap equals should detect differences.');
  assert(!immutable.equals(null), 'ImmutableMap equals should return false for null input.');
}

function buildRuntimeExports(projectRoot) {
  const immutableMapJs = transpileTs(
    fs.readFileSync(path.join(projectRoot, 'runtime/src/immutable-map.ts'), 'utf8'),
    'runtime/src/immutable-map.ts'
  );
  const immutableMapExports = evaluateModule(immutableMapJs);

  const messageJs = transpileTs(
    fs.readFileSync(path.join(projectRoot, 'runtime/src/message.ts'), 'utf8'),
    'runtime/src/message.ts'
  );
  const messageExports = evaluateModule(messageJs, {
    './immutable-map': immutableMapExports,
  });

  const indexJs = transpileTs(
    fs.readFileSync(path.join(projectRoot, 'runtime/src/index.ts'), 'utf8'),
    'runtime/src/index.ts'
  );

  return evaluateModule(indexJs, {
    './message': messageExports,
    './immutable-map': immutableMapExports,
  });
}

function buildClassFromFixture({
  projectRoot,
  transform,
  runtimeExports,
  fixture,
  exportName,
}) {
  const filePath = path.join(projectRoot, fixture);
  const source = fs.readFileSync(filePath, 'utf8');
  const transformed = transform(source, filePath);
  const js = transpileTs(transformed, `${fixture}.ts`);
  const exports = evaluateModule(js, {
    '@propanejs/runtime': runtimeExports,
  });
  return exports[exportName];
}

function transpileTs(source, fileName) {
  const result = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2019,
      esModuleInterop: true,
    },
    fileName,
  });

  if (!result.outputText) {
    throw new Error(`Failed to transpile ${fileName}`);
  }

  return result.outputText;
}

function evaluateModule(code, resolvers) {
  const module = { exports: {} };
  const sandbox = {
    module,
    exports: module.exports,
    console,
    require: (id) => {
      if (resolvers && resolvers[id]) {
        return resolvers[id];
      }
      throw new Error(`Unexpected require: ${id}`);
    },
  };

  vm.runInNewContext(code, sandbox, { timeout: 1000 });
  return module.exports;
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function assertThrows(fn, message) {
  let threw = false;
  try {
    fn();
  } catch {
    threw = true;
  }
  if (!threw) {
    throw new Error(message);
  }
}

const MAP_OBJECT_TAG = '[object Map]';
const IMMUTABLE_MAP_OBJECT_TAG = '[object ImmutableMap]';

function isMapValue(value) {
  if (!value || typeof value !== 'object') {
    return false;
  }
  const tag = Object.prototype.toString.call(value);
  return tag === MAP_OBJECT_TAG || tag === IMMUTABLE_MAP_OBJECT_TAG;
}
