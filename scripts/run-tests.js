#!/usr/bin/env node
/**
 * Run tests excluding integration tests.
 *
 * Integration tests require a PostgreSQL database and the `postgres` npm package,
 * which is a peer dependency and may not be installed.
 *
 * Run integration tests separately with: npm run test:integration
 */

import { globSync } from 'node:fs';
import { spawn } from 'node:child_process';

// Find all test files excluding integration tests
const allTestFiles = globSync('build/**/*.test.js');
const testFiles = allTestFiles.filter(f => !f.includes('/integration/'));

if (testFiles.length === 0) {
  console.log('No test files found. Run `npm run build` first.');
  process.exit(1);
}

// Run node --test with the filtered list of files
const child = spawn('node', ['--test', ...testFiles], {
  stdio: 'inherit',
});

child.on('close', code => {
  process.exit(code ?? 0);
});
