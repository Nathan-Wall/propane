/**
 * Build script for publishing @propane/runtime as a standalone package.
 *
 * The runtime is already built as part of the main build process.
 * This script just prepares the dist directory with the correct package.json.
 *
 * Usage:
 *   npx tsx scripts/build-runtime-publish.ts
 *
 * Output:
 *   dist/runtime/
 *   ├── package.json
 *   ├── index.js
 *   ├── message.js
 *   └── common/...
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const buildDir = path.join(projectRoot, 'build', 'runtime');
const distDir = path.join(projectRoot, 'dist', 'runtime');

/**
 * Read version from package.json.
 */
function getVersion(): string {
  const pkgPath = path.join(projectRoot, 'runtime', 'package.json');
  try {
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
    return pkg.version && pkg.version !== '0.0.0' ? pkg.version : '0.1.0';
  } catch {
    return '0.1.0';
  }
}

/**
 * Generate package.json for the published package.
 */
function createPackageJson(): object {
  return {
    name: '@propane/runtime',
    version: getVersion(),
    description: 'Runtime classes for Propane message types',
    type: 'module',
    main: './index.js',
    types: './index.d.ts',
    exports: {
      '.': {
        types: './index.d.ts',
        import: './index.js',
      },
    },
    files: [
      '*.js',
      '*.d.ts',
      'common',
    ],
    keywords: ['propane', 'runtime', 'message', 'immutable', 'serialization'],
    author: 'Nathan Wall',
    license: 'ISC',
    repository: {
      type: 'git',
      url: 'git+https://github.com/Nathan-Wall/propane.git',
      directory: 'runtime',
    },
  };
}

function main() {
  console.log('Building @propane/runtime for publishing...\n');

  // Check that build exists
  if (!fs.existsSync(buildDir)) {
    console.error('Build directory not found. Run `npm run build` first.');
    process.exit(1);
  }

  // Clean output directory
  if (fs.existsSync(distDir)) {
    fs.rmSync(distDir, { recursive: true });
  }

  // Copy build to dist
  fs.cpSync(buildDir, distDir, { recursive: true });
  console.log('Copied build/runtime to dist/runtime');

  // Generate package.json
  const pkgJson = createPackageJson();
  fs.writeFileSync(path.join(distDir, 'package.json'), JSON.stringify(pkgJson, null, 2) + '\n');
  console.log('Generated package.json');

  // Copy README if it exists
  const readmeSrc = path.join(projectRoot, 'runtime', 'README.md');
  if (fs.existsSync(readmeSrc)) {
    fs.copyFileSync(readmeSrc, path.join(distDir, 'README.md'));
    console.log('Copied README.md');
  }

  // Print summary
  console.log('\n' + '='.repeat(50));
  console.log('Build complete!');
  console.log('='.repeat(50));
  console.log(`\nOutput: ${distDir}`);
  console.log('\nTo publish:');
  console.log(`  cd ${path.relative(process.cwd(), distDir)}`);
  console.log('  npm publish --access public');
}

main();
