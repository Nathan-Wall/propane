'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');
const ts = require('typescript');

module.exports = function runSerializationTests({ projectRoot, transform }) {
  const simplePath = path.join(projectRoot, 'tests/simple.propane');
  const source = fs.readFileSync(simplePath, 'utf8');
  const transformed = transform(source, simplePath);

  const messageTs = fs.readFileSync(
    path.join(projectRoot, 'types/message.ts'),
    'utf8'
  );
  const messageJs = transpileTs(messageTs, 'types/message.ts');
  const messageExports = evaluateModule(messageJs);

  const simpleJs = transpileTs(transformed, 'tests/simple.propane.ts');
  const simpleExports = evaluateModule(simpleJs, {
    '@/types/message': messageExports,
  });

  const Simple = simpleExports.Simple;
  if (typeof Simple !== 'function') {
    throw new Error('Simple class was not exported.');
  }

  const instance = new Simple({
    id: 1,
    name: 'Alice',
    age: 30,
    active: true,
    nickname: 'Al',
  });

  const cereal = instance.cerealize();
  assert(cereal['1'] === 1, 'Numbered field not serialized correctly.');
  assert(cereal.name === 'Alice', 'Named field incorrect.');
  assert(cereal.nickname === 'Al', 'Optional field incorrect.');

  const serialized = instance.serialize();
  assert(serialized.startsWith(':'), 'Serialized string missing prefix.');

  const hydrated = Simple.deserialize(serialized);
  assert(hydrated instanceof Simple, 'Deserialize should produce class instance.');
  const hydratedCereal = hydrated.cerealize();
  assert(hydratedCereal.name === 'Alice', 'Roundtrip lost data.');

  const cerealInput = {
    '1': 2,
    name: 'Bob',
    age: 28,
    active: false,
  };
  const fromCereal = Simple.decerealize(cerealInput);
  assert(fromCereal.cerealize().name === 'Bob', 'Decerealize failed.');

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
};

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
