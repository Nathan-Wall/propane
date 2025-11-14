'use strict';

const fs = require('fs');
const path = require('path');
const { transformSync } = require('@babel/core');
const propaneCommentPlugin = require('../babel/propane-comment-plugin');

const projectRoot = path.resolve(__dirname, '..');

const cases = [
  {
    name: 'top-level Function alias is rejected',
    file: path.join(projectRoot, 'tests/fail.propane'),
    expectError: true,
    errorIncludes: 'Propane files must export an object type or a primitive-like alias',
  },
  {
    name: 'property Function type is rejected',
    file: path.join(projectRoot, 'tests/fail-property.propane'),
    expectError: true,
    errorIncludes: 'Propane property references must refer to imported or locally declared identifiers',
  },
  {
    name: 'nested Function type is rejected',
    file: path.join(projectRoot, 'tests/fail-nested.propane'),
    expectError: true,
    errorIncludes: 'Propane property references must refer to imported or locally declared identifiers',
  },
];

let hasFailure = false;

for (const testCase of cases) {
  try {
    const source = fs.readFileSync(testCase.file, 'utf8');
    transformSync(source, {
      filename: testCase.file,
      parserOpts: { sourceType: 'module', plugins: ['typescript'] },
      plugins: [propaneCommentPlugin],
    });

    if (testCase.expectError) {
      console.error(`[FAIL] ${testCase.name}`);
      console.error('Expected transform to throw, but it succeeded.');
      hasFailure = true;
      continue;
    }
  } catch (err) {
    if (!testCase.expectError) {
      console.error(`[FAIL] ${testCase.name}`);
      console.error('Unexpected error:\n', err && err.message);
      hasFailure = true;
      continue;
    }

    if (!err.message.includes(testCase.errorIncludes)) {
      console.error(`[FAIL] ${testCase.name}`);
      console.error('Expected error message to contain:', testCase.errorIncludes);
      console.error('Received message:\n', err.message);
      hasFailure = true;
      continue;
    }

    console.log(`[PASS] ${testCase.name}`);
    continue;
  }

  if (!testCase.expectError) {
    console.log(`[PASS] ${testCase.name}`);
  }
}

process.exit(hasFailure ? 1 : 0);
