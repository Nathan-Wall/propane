import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import { transformSync } from '@babel/core';
import propanePlugin from '../babel/propane-plugin.js';
import { createTestContext } from './test-harness.ts';
import type { TestContext } from './test-harness.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const testsDir = path.join(projectRoot, 'tests');
const failPattern = /(?:^|[.-])fail$/i;

const COLOR_RESET = '\x1b[0m';
const COLOR_GREEN = '\x1b[32m';
const COLOR_RED = '\x1b[31m';

function formatStatus(status: 'PASS' | 'FAIL'): string {
  const color = status === 'PASS' ? COLOR_GREEN : COLOR_RED;
  return `${color}[${status}]${COLOR_RESET}`;
}

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
    const moduleUrl = pathToFileURL(testFile).href;
    const mod = (await import(moduleUrl)) as { default?: (ctx: TestContext) => Promise<void> | void };
    const runTests = mod?.default;
    if (typeof runTests !== 'function') {
      throw new Error('Test file must export a default function.');
    }
    await runTests(context);
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

  return files.sort();
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
      entry.isFile() &&
      (entry.name.endsWith('.test.js') || entry.name.endsWith('.test.ts'))
    ) {
      files.push(fullPath);
    }
  }

  return files.sort();
}

function formatError(error: unknown): string {
  if (error instanceof Error) {
    return error.stack ?? error.message;
  }
  return String(error);
}
