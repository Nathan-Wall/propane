

import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import ts from 'typescript';

export type TransformFn = (source: string, filename: string) => string;

export interface TestContext {
  projectRoot: string;
  transform: TransformFn;
  runtimeExports: Record<string, unknown>;
  assert(condition: unknown, message: string): asserts condition;
  assertThrows(fn: () => unknown, message: string): void;
  isMapValue(value: unknown): value is ReadonlyMap<unknown, unknown>;
  loadFixtureClass<T = unknown>(fixture: string, exportName: string): T;
}

const MAP_OBJECT_TAG = '[object Map]';
const IMMUTABLE_MAP_OBJECT_TAG = '[object ImmutableMap]';
type PropaneExports = Record<string, unknown>;
const PROPANE_MODULE_CACHE = new Map<string, PropaneExports>();

interface BuildClassParams {
  projectRoot: string;
  transform: TransformFn;
  runtimeExports: PropaneExports;
  fixture: string;
  exportName: string;
}

interface LoadPropaneModuleParams {
  projectRoot: string;
  transform: TransformFn;
  runtimeExports: PropaneExports;
  filePath: string;
}

type ModuleResolvers = PropaneExports | ((id: string) => unknown);

export function createTestContext({
  projectRoot,
  transform,
}: {
  projectRoot: string;
  transform: TransformFn;
}): TestContext {
  const runtimeExports = buildRuntimeExports(projectRoot);
  function loadFixtureClass<T = unknown>(
    fixture: string,
    exportName: string
  ): T {
    return buildClassFromFixture<T>({
      projectRoot,
      transform,
      runtimeExports,
      fixture,
      exportName,
    });
  }

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

function buildRuntimeExports(projectRoot: string): PropaneExports {
  const jsonParseJs = transpileTs(
    fs.readFileSync(path.join(projectRoot, 'common/json/parse.ts'), 'utf8'),
    'common/json/parse.ts'
  );
  const jsonParseExports = evaluateModule(jsonParseJs);

  const jsonStringifyJs = transpileTs(
    fs.readFileSync(path.join(projectRoot, 'common/json/stringify.ts'), 'utf8'),
    'common/json/stringify.ts'
  );
  const jsonStringifyExports = evaluateModule(jsonStringifyJs);

  const immutableMapJs = transpileTs(
    fs.readFileSync(path.join(projectRoot, 'common/map/immutable.ts'), 'utf8'),
    'common/map/immutable.ts'
  );
  const immutableMapExports = evaluateModule(immutableMapJs, {
    '../json/stringify': jsonStringifyExports,
  });
  const immutableSetJs = transpileTs(
    fs.readFileSync(path.join(projectRoot, 'common/set/immutable.ts'), 'utf8'),
    'common/set/immutable.ts'
  );
  const immutableSetExports = evaluateModule(immutableSetJs, {
    '../json/stringify': jsonStringifyExports,
  });

  const messageJs = transpileTs(
    fs.readFileSync(path.join(projectRoot, 'runtime/message.ts'), 'utf8'),
    'runtime/message.ts'
  );
  const messageExports = evaluateModule(messageJs, {
    '../common/map/immutable': immutableMapExports,
    '../common/set/immutable': immutableSetExports,
    '../common/json/parse': jsonParseExports,
    '../common/json/stringify': jsonStringifyExports,
  });

  const indexJs = transpileTs(
    fs.readFileSync(path.join(projectRoot, 'runtime/index.ts'), 'utf8'),
    'runtime/index.ts'
  );

  return evaluateModule(indexJs, {
    './message': messageExports,
    '../common/map/immutable': immutableMapExports,
    '../common/set/immutable': immutableSetExports,
  });
}

function buildClassFromFixture<T = unknown>({
  projectRoot,
  transform,
  runtimeExports,
  fixture,
  exportName,
}: BuildClassParams): T {
  const filePath = path.join(projectRoot, fixture);
  const moduleExports = loadPropaneModule({
    projectRoot,
    transform,
    runtimeExports,
    filePath,
  });

  if (!(exportName in moduleExports)) {
    throw new Error(`Export ${exportName} not found in ${fixture}`);
  }

  return moduleExports[exportName] as T;
}

function loadPropaneModule({
  projectRoot,
  transform,
  runtimeExports,
  filePath,
}: LoadPropaneModuleParams): PropaneExports {
  const normalized = path.resolve(projectRoot, filePath);
  const cached = PROPANE_MODULE_CACHE.get(normalized);
  if (cached) {
    return cached;
  }

  const source = fs.readFileSync(normalized, 'utf8');
  const transformed = transform(source, normalized);
  const relative = path.relative(projectRoot, normalized)
    || path.basename(normalized);
  const js = transpileTs(transformed, `${relative}.ts`);
  const dir = path.dirname(normalized);

  const moduleExports = evaluateModule(js, (id) => {
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

  PROPANE_MODULE_CACHE.set(normalized, moduleExports);
  return moduleExports;
}

function transpileTs(source: string, fileName: string): string {
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

function evaluateModule(
  code: string,
  resolvers?: ModuleResolvers
): PropaneExports {
  const module = { exports: {} as PropaneExports };
  const resolve: (id: string) => unknown =
    typeof resolvers === 'function'
      ? resolvers
      : ((records: PropaneExports) =>
        (id: string) => {
          if (id in records) {
            return records[id];
          }
          throw new Error(`Unexpected require: ${id}`);
        })(resolvers ?? {});
  const sandbox: Record<string, unknown> = {
    module,
    exports: module.exports,
    console,
    require: (id: string): unknown => {
      return resolve(id);
    },
  };

  vm.runInNewContext(code, sandbox, { timeout: 1000 });
  return module.exports;
}

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

function assertThrows(fn: () => unknown, message: string): void {
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

function isMapValue(value: unknown): value is ReadonlyMap<unknown, unknown> {
  if (!value || typeof value !== 'object') {
    return false;
  }
  const tag = Object.prototype.toString.call(value);
  return tag === MAP_OBJECT_TAG || tag === IMMUTABLE_MAP_OBJECT_TAG;
}
