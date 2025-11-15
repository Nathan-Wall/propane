'use strict';

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { transformSync } from '@babel/core';
import propanePlugin from '../babel/propane-plugin.js';
import runSerializationTests from './serialization-tests.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const testsDir = path.join(projectRoot, 'tests');
const failPattern = /(?:^|[.-])fail$/i;

const propaneFiles = findPropaneFiles(testsDir);
let hasFailure = false;

propaneFiles.forEach((filePath) => {
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
      return;
    }

    console.log(`[PASS] ${relativeName}`);
  } catch (err) {
    if (!expectError) {
      console.error(`[FAIL] ${relativeName}`);
      console.error('Unexpected error:\n', err && err.message);
      hasFailure = true;
      return;
    }

    console.log(`[PASS] ${relativeName}`);
  }
});

try {
  runSerializationTests({
    projectRoot,
    transform: (source, filename) =>
      transformSync(source, {
        filename,
        parserOpts: { sourceType: 'module', plugins: ['typescript'] },
        plugins: [propanePlugin],
      }).code,
  });
  console.log('[PASS] serialization roundtrip');
} catch (err) {
  console.error('[FAIL] serialization roundtrip');
  console.error(err && err.message);
  hasFailure = true;
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
