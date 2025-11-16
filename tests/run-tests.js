'use strict';

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { transformSync } from '@babel/core';
import propanePlugin from '../babel/propane-plugin.js';
import { pathToFileURL } from 'url';
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
    const moduleUrl = pathToFileURL(testFile).href;
    const mod = await import(moduleUrl);
    const runTests = mod && mod.default;
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

    if (entry.isFile() && entry.name.endsWith('.test.js')) {
      files.push(fullPath);
    }
  }

  return files.sort();
}
