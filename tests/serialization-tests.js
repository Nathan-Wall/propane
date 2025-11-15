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
    fixture: 'tests/simple.propane',
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
    status: 'READY',
  });

  const cereal = instance.cerealize();
  assert(Array.isArray(cereal), 'Expected cereal to be an array.');
  assert(cereal[0] === 1, 'Numbered field not serialized correctly.');
  assert(cereal[1] === 'Alice', 'Name field incorrect.');
  assert(cereal[4] === 'Al', 'Optional field incorrect.');
  assert(cereal[5] === 'READY', 'Status field incorrect.');

  const serialized = instance.serialize();
  const expectedSerialized = ':[1,"Alice",30,true,"Al","READY"]';
  assert(
    serialized === expectedSerialized,
    'Serialized string did not match expected.'
  );

  const hydrated = Simple.deserialize(serialized);
  assert(hydrated instanceof Simple, 'Deserialize should produce class instance.');
  const hydratedCereal = hydrated.cerealize();
  assert(hydratedCereal[1] === 'Alice', 'Roundtrip lost data.');

  const rawString = ':[3,"Chris",24,false,"CJ","PENDING"]';
  const hydratedFromString = Simple.deserialize(rawString);
  const hydratedFromStringCereal = hydratedFromString.cerealize();
  assert(hydratedFromStringCereal[0] === 3, 'Raw string deserialize failed.');
  assert(hydratedFromStringCereal[1] === 'Chris', 'Raw string deserialize lost name.');
  assert(
    hydratedFromStringCereal[5] === 'PENDING',
    'Raw string deserialize lost status.'
  );

  const cerealInput = {
    '1': 2,
    '2': 'Bob',
    '3': 28,
    '4': false,
    '6': 'IDLE',
  };
  const fromCereal = Simple.decerealize(cerealInput);
  const fromCerealPayload = fromCereal.cerealize();
  assert(fromCerealPayload[1] === 'Bob', 'Decerealize failed.');
  assert(fromCerealPayload[5] === 'IDLE', 'Decerealize lost status.');

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
    status: 'MISSING',
  });
  const optionalCereal = optionalMissing.cerealize();
  assert(Array.isArray(optionalCereal), 'Optional cereal should be array.');
  assert(optionalCereal[4] === undefined, 'Optional slot should be undefined.');

  const optionalRawWithValue = ':[6,"OptName",31,true,"CJ","RUN"]';
  const optionalHydrated = Simple.deserialize(optionalRawWithValue);
  const optionalHydratedCereal = optionalHydrated.cerealize();
  assert(
    optionalHydratedCereal[4] === 'CJ',
    'Raw optional value not preserved.'
  );

  const optionalRawMissing =
    ':{\"1\":7,\"2\":\"OptName\",\"3\":31,\"4\":true,\"6\":\"RESTING\"}';
  const optionalHydratedMissing = Simple.deserialize(optionalRawMissing);
  const optionalHydratedMissingCereal = optionalHydratedMissing.cerealize();
  assert(
    optionalHydratedMissingCereal[4] === undefined,
    'Missing optional value should stay undefined.'
  );

  const optionalNullInstance = new Simple({
    id: 9,
    name: 'Null Nick',
    age: 25,
    active: false,
    nickname: null,
    status: 'testing',
  });
  const optionalNullSerialized = optionalNullInstance.serialize();
  assert(
    optionalNullSerialized === ':[9,"Null Nick",25,false,null,"testing"]',
    'Null optional serialization incorrect.'
  );
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
  const objectCereal = objectInstance.cerealize();
  assert(
    !Array.isArray(objectCereal),
    'Non-indexed properties should serialize as object.'
  );
  assert(objectCereal.name === 'ObjectOnly', 'Non-indexed serialization failed.');

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
  const holeCereal = holeInstance.cerealize();
  assert(
    !Array.isArray(holeCereal),
    'Serialization with holes should fall back to object.'
  );
  assert(holeCereal.id === 20, 'Hole serialization lost data.');

  const holeRaw =
    ':{\"1\":20,\"3\":42,\"name\":\"Hole\"}';
  const holeHydrated = Hole.deserialize(holeRaw);
  const holeHydratedCereal = holeHydrated.cerealize();
  assert(
    !Array.isArray(holeHydratedCereal),
    'Hole raw deserialize should produce object cereal.'
  );
  assert(holeHydratedCereal.name === 'Hole', 'Hole raw deserialize lost name.');

  const objectRaw =
    ':{\"id\":30,\"name\":\"Obj\",\"age\":60,\"active\":true}';
  const objectHydrated = ObjectOnly.deserialize(objectRaw);
  assert(
    objectHydrated.cerealize().name === 'Obj',
    'Object raw deserialize lost name.'
  );
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
