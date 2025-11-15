'use strict';

const path = require('path');
const { execSync } = require('child_process');

const runtimeDir = path.resolve(__dirname, '..', 'runtime');

function run(command, options = {}) {
  execSync(command, {
    stdio: 'inherit',
    ...options,
  });
}

try {
  console.log('Building @propanejs/runtime...');
  run('npm --prefix runtime run build', { cwd: path.resolve(__dirname, '..') });

  console.log('Publishing @propanejs/runtime...');
  run('npm publish', { cwd: runtimeDir });

  console.log('@propanejs/runtime published successfully.');
} catch (err) {
  console.error('Failed to publish propane-runtime.');
  process.exit(err.status || 1);
}
