'use strict';

import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import vm from 'vm';
import { createRequire } from 'module';
import ts from 'typescript';
import { transformSync } from '@babel/core';
import propanePlugin from '../babel/propane-plugin.js';
import { createTestContext } from './test-harness.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const testsDir = path.join(projectRoot, 'tests');
const failPattern = /(?:^|[.-])fail$/i;

const propaneFiles = findPropaneFiles(testsDir);
let hasFailure = false;

for (const filePath of propaneFiles) {
  const relativeName = path.relative(projectRoot, filePath);
  const baseName = path.basename(filePath, '.propane');
  const expectError = failPattern.test(baseName);

  try {
    const source = fs.readFileSync(filePath, 'utf8');
    transformSync(source, {
      filename: filePath,
      parserOpts: { sourceType: 'module', plugins: ['typescript'] },
      plugins: [propanePlugin],
    });

    if (expectError) {
      console.error(`[FAIL] ${relativeName}`);
      console.error('Expected transform to throw, but it succeeded.');
      hasFailure = true;
      continue;
    }

    console.log(`[PASS] ${relativeName}`);
  } catch (err) {
    if (!expectError) {
      console.error(`[FAIL] ${relativeName}`);
      console.error('Unexpected error:\n', err && err.message);
      hasFailure = true;
      continue;
    }

    console.log(`[PASS] ${relativeName}`);
  }
}

const context = createTestContext({
  projectRoot,
  transform: (source, filename) =>
    transformSync(source, {
      filename,
      parserOpts: { sourceType: 'module', plugins: ['typescript'] },
      plugins: [propanePlugin],
    }).code,
});

const testFiles = findTestFiles(testsDir);

for (const testFile of testFiles) {
  const relativeName = path.relative(projectRoot, testFile);
  try {
    const runTests = await loadTestRunner(testFile);
    if (typeof runTests !== 'function') {
      throw new Error('Test file must export a default function.');
    }
    await runTests(context);
    console.log(`[PASS] ${relativeName}`);
  } catch (err) {
    console.error(`[FAIL] ${relativeName}`);
    if (err && err.stack) {
      console.error(err.stack);
    } else {
      console.error(err && err.message);
    }
    hasFailure = true;
  }
}

process.exit(hasFailure ? 1 : 0);

function findPropaneFiles(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    if (entry.name.startsWith('.')) {
      continue;
    }

    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      files.push(...findPropaneFiles(fullPath));
      continue;
    }

    if (entry.isFile() && entry.name.endsWith('.propane')) {
      files.push(fullPath);
    }
  }

  return files.sort();
}

function findTestFiles(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    if (entry.name.startsWith('.')) {
      continue;
    }

    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      files.push(...findTestFiles(fullPath));
      continue;
    }

    if (
      entry.isFile() &&
      (entry.name.endsWith('.test.js') || entry.name.endsWith('.test.ts'))
    ) {
      files.push(fullPath);
    }
  }

  return files.sort();
}

async function loadTestRunner(filename) {
  if (filename.endsWith('.ts')) {
    const source = fs.readFileSync(filename, 'utf8');
    const js = transpileTestSource(source, filename);
    const exports = evaluateTestModule(js, filename);
    return exports && exports.default;
  }

  const moduleUrl = pathToFileURL(filename).href;
  const mod = await import(moduleUrl);
  return mod && mod.default;
}

function transpileTestSource(source, filename) {
  const result = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2019,
      esModuleInterop: true,
    },
    fileName: filename,
  });

  if (!result.outputText) {
    throw new Error(`Failed to transpile ${filename}`);
  }

  return result.outputText;
}

function evaluateTestModule(code, filename) {
  const module = { exports: {} };
  const requireFromFile = createRequire(pathToFileURL(filename));
  const sandbox = {
    module,
    exports: module.exports,
    console,
    require: requireFromFile,
  };

  vm.runInNewContext(code, sandbox, { filename });
  return module.exports;
}
