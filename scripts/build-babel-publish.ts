/**
 * Build script for publishing @propane/babel-messages as a standalone package.
 *
 * This script:
 * 1. Compiles TypeScript with preserved monorepo structure
 * 2. Resolves @/ path aliases to relative paths
 * 3. Rewrites internal imports to published package imports
 * 4. Generates package.json with correct dependencies
 *
 * Usage:
 *   npx tsx scripts/build-babel-publish.ts
 *
 * Output:
 *   dist/babel-messages/
 *   ├── package.json
 *   ├── common/strings/levenshtein.js
 *   ├── tools/parser/*.js
 *   └── tools/babel/messages/*.js
 */
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const distDir = path.join(projectRoot, 'dist', 'babel-messages');

/**
 * Read version from a package.json file.
 */
function getPackageVersion(packagePath: string, fallback: string): string {
  const pkgPath = path.join(projectRoot, packagePath, 'package.json');
  try {
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
    const version = pkg.version;
    return version && version !== '0.0.0' ? version : fallback;
  } catch {
    return fallback;
  }
}

/**
 * Generate package.json for the published package.
 */
function createPackageJson(): object {
  const version = getPackageVersion('tools/babel/messages', '0.0.1');
  const typesVersion = getPackageVersion('types', '0.1.0');

  return {
    name: '@propane/babel-messages',
    version,
    description: 'Babel plugin for transforming Propane .pmsg type definitions',
    type: 'module',
    main: './tools/babel/messages/index.js',
    types: './tools/babel/messages/index.d.ts',
    exports: {
      '.': {
        types: './tools/babel/messages/index.d.ts',
        import: './tools/babel/messages/index.js',
      },
    },
    files: ['common', 'tools'],
    dependencies: {
      '@babel/code-frame': '^7.26.0',
      '@babel/parser': '^7.26.0',
      '@babel/traverse': '^7.26.0',
      '@babel/types': '^7.26.0',
      '@propane/types': `^${typesVersion}`,
    },
    peerDependencies: {
      '@babel/core': '^7.0.0',
    },
    keywords: ['babel-plugin', 'propane', 'typescript', 'code-generation'],
    author: 'Nathan Wall',
    license: 'ISC',
    repository: {
      type: 'git',
      url: 'git+https://github.com/Nathan-Wall/propane.git',
      directory: 'tools/babel/messages',
    },
  };
}

/**
 * Run a command and exit on failure.
 */
function run(command: string, description: string): void {
  console.log(`${description}...`);
  try {
    execSync(command, { cwd: projectRoot, stdio: 'inherit' });
  } catch {
    console.error(`Failed: ${description}`);
    process.exit(1);
  }
}

function main() {
  console.log('Building @propane/babel-messages for publishing...\n');

  // Clean output directory
  if (fs.existsSync(distDir)) {
    fs.rmSync(distDir, { recursive: true });
  }
  fs.mkdirSync(distDir, { recursive: true });

  // Build steps
  run('npx tsc -p tsconfig.babel-publish.json', 'Compiling TypeScript');
  run('npx tsc-alias -p tsconfig.babel-publish.json', 'Resolving path aliases');

  const rewriteScript = path.join(projectRoot, 'scripts/rewrite-imports.ts');
  run(
    `npx tsx "${rewriteScript}" "${distDir}" --delete-rewritten`,
    'Rewriting imports to package imports'
  );

  // Generate package.json
  const pkgJson = createPackageJson();
  fs.writeFileSync(path.join(distDir, 'package.json'), JSON.stringify(pkgJson, null, 2) + '\n');
  console.log('Generated package.json');

  // Copy README if it exists
  const readmeSrc = path.join(projectRoot, 'tools/babel/messages/README.md');
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
