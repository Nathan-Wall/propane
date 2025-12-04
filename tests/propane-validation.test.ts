/**
 * Tests that validate .pmsg files transform correctly (or fail as expected).
 * Files ending in -fail.pmsg are expected to fail transformation.
 *
 * Note: This test runs from build/tests/ but validates source files in tests/
 */
import { describe, it } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { transformSync } from '@babel/core';
import propanePlugin from '@propanejs/babel-messages';

// When running from build/tests/, go up to find source tests/
const testsDir = path.resolve(import.meta.dirname, '../../tests');
const failPattern = /(?:^|[.-])fail$/i;

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

    if (entry.isFile() && entry.name.endsWith('.pmsg')) {
      files.push(fullPath);
    }
  }

  return files.toSorted();
}

const propaneFiles = findPropaneFiles(testsDir);

describe('Propane file validation', () => {
  for (const filePath of propaneFiles) {
    const relativeName = path.relative(testsDir, filePath);
    const baseName = path.basename(filePath, '.pmsg');
    const expectError = failPattern.test(baseName);

    if (expectError) {
      it(`${relativeName} should fail transformation`, () => {
        const source = fs.readFileSync(filePath, 'utf8');
        assert.throws(() => {
          transformSync(source, {
            filename: filePath,
            parserOpts: { sourceType: 'module', plugins: ['typescript'] },
            plugins: [propanePlugin],
          });
        }, `Expected ${relativeName} to fail transformation`);
      });
    } else {
      it(`${relativeName} should transform successfully`, () => {
        const source = fs.readFileSync(filePath, 'utf8');
        assert.doesNotThrow(() => {
          transformSync(source, {
            filename: filePath,
            parserOpts: { sourceType: 'module', plugins: ['typescript'] },
            plugins: [propanePlugin],
          });
        }, `Expected ${relativeName} to transform successfully`);
      });
    }
  }
});
