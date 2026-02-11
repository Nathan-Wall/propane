/**
 * Build script for publishing @propane/types as a standalone package.
 *
 * This script:
 * 1. Compiles TypeScript to a dist directory
 * 2. Generates package.json with correct paths
 * 3. Copies necessary files
 *
 * Usage:
 *   npx tsx scripts/build-types-publish.ts
 *
 * Output:
 *   dist/types/
 *   ├── package.json
 *   ├── index.js
 *   ├── index.d.ts
 *   └── ...
 */
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const distDir = path.join(projectRoot, 'dist', 'types');
const sourceDir = path.join(projectRoot, 'types');

/**
 * Read version from package.json.
 */
function getVersion(): string {
  const pkgPath = path.join(sourceDir, 'package.json');
  try {
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8')) as {
      version?: unknown;
    };
    return typeof pkg.version === 'string' ? pkg.version : '0.1.0';
  } catch {
    return '0.1.0';
  }
}

/**
 * Generate package.json for the published package.
 */
function createPackageJson(): object {
  return {
    name: '@propane/types',
    version: getVersion(),
    description: 'Type definitions and registry for Propane',
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
      '*.js.map',
      '*.d.ts.map',
      'validator-definitions',
    ],
    keywords: ['propane', 'types', 'validators', 'schema', 'typescript'],
    author: 'Nathan Wall',
    license: 'ISC',
    repository: {
      type: 'git',
      url: 'git+https://github.com/Nathan-Wall/propane.git',
      directory: 'types',
    },
  };
}

/**
 * Create a standalone tsconfig for this build.
 */
function createTsConfig(): object {
  return {
    compilerOptions: {
      target: 'ES2023',
      module: 'ESNext',
      moduleResolution: 'bundler',
      declaration: true,
      declarationMap: true,
      sourceMap: true,
      strict: true,
      skipLibCheck: true,
      esModuleInterop: true,
      outDir: distDir,
      rootDir: path.join(sourceDir, 'src'),
    },
    include: [path.join(sourceDir, 'src', '**', '*.ts')],
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
  console.log('Building @propane/types for publishing...\n');

  // Clean output directory
  if (fs.existsSync(distDir)) {
    fs.rmSync(distDir, { recursive: true });
  }
  fs.mkdirSync(distDir, { recursive: true });

  // Write temporary tsconfig
  const tsconfigPath = path.join(projectRoot, 'tsconfig.types-publish.json');
  fs.writeFileSync(tsconfigPath, JSON.stringify(createTsConfig(), null, 2));

  try {
    // Compile TypeScript
    run(`npx tsc -p ${tsconfigPath}`, 'Compiling TypeScript');
  } finally {
    // Clean up temporary tsconfig
    fs.unlinkSync(tsconfigPath);
  }

  // Generate package.json
  const pkgJson = createPackageJson();
  fs.writeFileSync(path.join(distDir, 'package.json'), JSON.stringify(pkgJson, null, 2) + '\n');
  console.log('Generated package.json');

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
