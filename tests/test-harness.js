'use strict';

import fs from 'fs';
import path from 'path';
import vm from 'vm';
import ts from 'typescript';

const MAP_OBJECT_TAG = '[object Map]';
const IMMUTABLE_MAP_OBJECT_TAG = '[object ImmutableMap]';
const PROPANE_MODULE_CACHE = new Map();

export function createTestContext({ projectRoot, transform }) {
  const runtimeExports = buildRuntimeExports(projectRoot);
  const loadFixtureClass = (fixture, exportName) =>
    buildClassFromFixture({
      projectRoot,
      transform,
      runtimeExports,
      fixture,
      exportName,
    });

  return {
    projectRoot,
    transform,
    runtimeExports,
    assert,
    assertThrows,
    isMapValue,
    loadFixtureClass,
  };
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
  const exports = loadPropaneModule({
    projectRoot,
    transform,
    runtimeExports,
    filePath,
  });
  return exports[exportName];
}

function loadPropaneModule({
  projectRoot,
  transform,
  runtimeExports,
  filePath,
}) {
  const normalized = path.resolve(projectRoot, filePath);
  if (PROPANE_MODULE_CACHE.has(normalized)) {
    return PROPANE_MODULE_CACHE.get(normalized);
  }

  const source = fs.readFileSync(normalized, 'utf8');
  const transformed = transform(source, normalized);
  const relative = path.relative(projectRoot, normalized) || path.basename(normalized);
  const js = transpileTs(transformed, `${relative}.ts`);
  const dir = path.dirname(normalized);

  const exports = evaluateModule(js, (id) => {
    if (id === '@propanejs/runtime') {
      return runtimeExports;
    }

    if (id.startsWith('.')) {
      const resolved = path.resolve(dir, id);
      const withExt = resolved.endsWith('.propane') ? resolved : `${resolved}.propane`;
      if (fs.existsSync(withExt)) {
        return loadPropaneModule({
          projectRoot,
          transform,
          runtimeExports,
          filePath: withExt,
        });
      }
    }

    throw new Error(`Unexpected require: ${id}`);
  });

  PROPANE_MODULE_CACHE.set(normalized, exports);
  return exports;
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
  const resolve =
    typeof resolvers === 'function'
      ? resolvers
      : (id) => {
          if (resolvers && resolvers[id]) {
            return resolvers[id];
          }
          throw new Error(`Unexpected require: ${id}`);
        };
  const sandbox = {
    module,
    exports: module.exports,
    console,
    require: (id) => {
      return resolve(id);
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

function isMapValue(value) {
  if (!value || typeof value !== 'object') {
    return false;
  }
  const tag = Object.prototype.toString.call(value);
  return tag === MAP_OBJECT_TAG || tag === IMMUTABLE_MAP_OBJECT_TAG;
}
