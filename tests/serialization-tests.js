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

  const serialized = instance.serialize();
  const expectedSerialized = ':[1,"Alice",30,true,"Al",42,"Ace","READY"]';
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

  const cerealInput = {
    '1': 2,
    '2': 'Bob',
    '3': 28,
    '4': false,
    '5': 'B',
    '6': 80,
    '7': null,
    '8': 'IDLE',
  };
  const fromCereal = Simple.decerealize(cerealInput);
  const fromCerealPayload = fromCereal.cerealize();
  assert(fromCerealPayload.name === 'Bob', 'Decerealize failed.');
  assert(fromCerealPayload.score === 80, 'Decerealize lost score.');
  assert(fromCerealPayload.alias === null, 'Decerealize lost alias.');
  assert(fromCerealPayload.status === 'IDLE', 'Decerealize lost status.');

  assertThrows(
    () => Simple.decerealize({ name: 'Charlie', age: 22, active: true }),
    'Missing required fields should throw.'
  );

  assertThrows(
    () =>
      Simple.decerealize({
        '1': 'bad',
        name: 'Dana',
        age: 40,
        active: true,
      }),
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
    optionalSerial === ':[4,"Optional",35,false,undefined,0,undefined,"MISSING"]',
    'Optional slot should be undefined.'
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
    scoreNullSerialized === ':[9,"Null Score",25,false,"NS",null,"Alias","testing"]',
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
    aliasNullSerialized === ':[11,"Alias Null",40,true,"AN",7,null,"alias-null"]',
    'Alias null serialization incorrect.'
  );
  const aliasNullRaw = ':[12,"Alias Raw",41,true,"AR",8,null,"alias-raw"]';
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
}

function buildRuntimeExports(projectRoot) {
  const messagePath = path.join(projectRoot, 'runtime/src/index.ts');
  const messageTs = fs.readFileSync(messagePath, 'utf8');
  const messageJs = transpileTs(messageTs, 'runtime/src/index.ts');
  return evaluateModule(messageJs, {
    './message': evaluateModule(
      transpileTs(
        fs.readFileSync(path.join(projectRoot, 'runtime/src/message.ts'), 'utf8'),
        'runtime/src/message.ts'
      )
    ),
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
