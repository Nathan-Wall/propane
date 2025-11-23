

import path from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distRuntimeDir = path.resolve(__dirname, '..', 'dist', 'runtime');

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
  run('npm publish', { cwd: distRuntimeDir });

  console.log('@propanejs/runtime published successfully.');
} catch (err) {
  console.error('Failed to publish @propanejs/runtime.');
  process.exit(err.status || 1);
}
