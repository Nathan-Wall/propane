import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { transformSync } from '@babel/core';
import propanePlugin from '../babel/propane-plugin.js';
import { spawnSync } from 'node:child_process';
import { assert } from './assert.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const testsDir = path.join(projectRoot, 'tests');
const builtTestsDir = path.join(projectRoot, 'build', 'tests');
const failPattern = /(?:^|[.-])fail$/i;

const COLOR_RESET = '\u001b[0m';
const COLOR_GREEN = '\u001b[32m';
const COLOR_RED = '\u001b[31m';

function formatStatus(status: 'PASS' | 'FAIL'): string {
  const color = status === 'PASS' ? COLOR_GREEN : COLOR_RED;
  return `${color}[${status}]${COLOR_RESET}`;
}

let hasFailure = false;

// Build fixtures to tests/tmp before running tests
const buildResult = spawnSync('node', [path.join(projectRoot, 'scripts', 'build-fixtures.js')], {
  stdio: 'inherit',
});
if (buildResult.status !== 0) {
  process.exit(buildResult.status ?? 1);
}

const propaneFiles = findPropaneFiles(testsDir);

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

    console.log(`${formatStatus('PASS')} ${relativeName}`);
  } catch (err) {
    if (!expectError) {
      console.error(`${formatStatus('FAIL')} ${relativeName}`);
      console.error('Unexpected error:\n', formatError(err));
      hasFailure = true;
      continue;
    }

    console.log(`${formatStatus('PASS')} ${relativeName}`);
  }
}

const testFiles = findTestFiles(builtTestsDir);

for (const testFile of testFiles) {
  const relativeName = path.relative(projectRoot, testFile);
  try {
    const moduleUrl = pathToFileURL(testFile).href;
    const mod = (await import(moduleUrl)) as { default?: () => Promise<void> | void };
    const runTests = mod?.default;
    assert(typeof runTests === 'function', 'Test file must export a default function.');
    await runTests();
    console.log(`${formatStatus('PASS')} ${relativeName}`);
  } catch (err) {
    console.error(`${formatStatus('FAIL')} ${relativeName}`);
    console.error(formatError(err));
    hasFailure = true;
  }
}

process.exit(hasFailure ? 1 : 0);

function findPropaneFiles(dir: string): string[] {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files: string[] = [];

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

  return files.toSorted();
}

function findTestFiles(dir: string): string[] {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files: string[] = [];

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
      entry.isFile()
      && (
        entry.name.endsWith('.test.js')
        || entry.name.endsWith('.test.ts')
      )
    ) {
      files.push(fullPath);
    }
  }

  return files.toSorted();
}

function formatError(error: unknown): string {
  if (error instanceof Error) {
    return error.stack ?? error.message;
  }
  return String(error);
}
