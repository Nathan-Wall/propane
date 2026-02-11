/**
 * Build script for publishing @propane/postgres as a standalone package.
 *
 * This script:
 * 1. Compiles TypeScript with bundled dependencies (parser, common utilities)
 * 2. Resolves @/ path aliases to relative paths
 * 3. Rewrites runtime imports to @propane/runtime
 * 4. Generates package.json with correct dependencies
 *
 * Usage:
 *   npx tsx scripts/build-postgres-publish.ts
 *
 * Output:
 *   dist/postgres/
 *   ├── package.json
 *   ├── src/...
 *   ├── tools/parser/...  (bundled)
 *   └── common/strings/... (bundled)
 */
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const distDir = path.join(projectRoot, 'dist', 'postgres');

/**
 * Read version from a package.json file.
 */
function getPackageVersion(packagePath: string, fallback: string): string {
  const pkgPath = path.join(projectRoot, packagePath, 'package.json');
  try {
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8')) as {
      version?: unknown;
    };
    const version = pkg.version;
    return typeof version === 'string' && version !== '0.0.0'
      ? version
      : fallback;
  } catch {
    return fallback;
  }
}

/**
 * Generate package.json for the published package.
 */
function createPackageJson(): object {
  const version = getPackageVersion('postgres', '0.1.0');
  const runtimeVersion = getPackageVersion('runtime', '0.1.0');

  return {
    name: '@propane/postgres',
    version,
    description: 'PostgreSQL storage and migrations for Propane message types',
    type: 'module',
    main: './src/index.js',
    types: './src/index.d.ts',
    exports: {
      '.': {
        types: './src/index.d.ts',
        import: './src/index.js',
      },
    },
    bin: {
      ppg: './src/cli/index.js',
    },
    files: [
      'src',
      'common',
      'tools',
    ],
    dependencies: {
      '@propane/runtime': `^${runtimeVersion}`,
      'postgres': '^3.4.4',
    },
    keywords: ['propane', 'postgres', 'postgresql', 'database', 'orm', 'migrations'],
    author: 'Nathan Wall',
    license: 'ISC',
    repository: {
      type: 'git',
      url: 'git+https://github.com/Nathan-Wall/propane.git',
      directory: 'postgres',
    },
  };
}

/**
 * Rewrite runtime imports from relative paths to package imports.
 */
function rewriteRuntimeImports(dir: string): void {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      rewriteRuntimeImports(fullPath);
    } else if (entry.isFile() && (entry.name.endsWith('.js') || entry.name.endsWith('.d.ts'))) {
      let content = fs.readFileSync(fullPath, 'utf8');
      const original = content;

      // Rewrite runtime imports to @propane/runtime
      // After tsc-alias, they look like: '../../../runtime/...'
      content = content.replaceAll(
        /from ['"](?:\.\.\/)*runtime\/[^'"]+['"]/g,
        "from '@propane/runtime'"
      );

      if (content !== original) {
        fs.writeFileSync(fullPath, content);
        console.log(`  [rewritten] ${path.relative(distDir, fullPath)}`);
      }
    }
  }
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
  console.log('Building @propane/postgres for publishing...\n');

  // Clean output directory
  if (fs.existsSync(distDir)) {
    fs.rmSync(distDir, { recursive: true });
  }
  fs.mkdirSync(distDir, { recursive: true });

  // Create tsconfig for postgres publish
  const tsconfigPath = path.join(projectRoot, 'tsconfig.postgres-publish.json');
  const tsconfig = {
    extends: './tsconfig.json',
    compilerOptions: {
      outDir: './dist/postgres',
      rootDir: '.',
      declaration: true,
      declarationMap: true,
      sourceMap: true,
    },
    include: [
      'postgres/src/**/*.ts',
      'tools/parser/types.ts',
      'tools/parser/index.ts',
      'tools/parser/parse-ast.ts',
      'tools/parser/babel-config.ts',
      'tools/parser/properties.ts',
      'tools/parser/type-parser.ts',
      'tools/parser/validation.ts',
      'tools/parser/decorators.ts',
      'tools/parser/wrapper-detection.ts',
      'common/strings/pluralize.ts',
    ],
    exclude: [
      'node_modules',
      'build',
      'dist',
      '**/*.test.ts',
    ],
  };
  fs.writeFileSync(tsconfigPath, JSON.stringify(tsconfig, null, 2));

  try {
    // Build steps
    run(`npx tsc -p ${tsconfigPath}`, 'Compiling TypeScript');
    run(`npx tsc-alias -p ${tsconfigPath}`, 'Resolving path aliases');

    // Rewrite runtime imports
    console.log('Rewriting runtime imports...');
    rewriteRuntimeImports(distDir);

    // Delete runtime directory if it got included
    const runtimeDir = path.join(distDir, 'runtime');
    if (fs.existsSync(runtimeDir)) {
      fs.rmSync(runtimeDir, { recursive: true });
      console.log('  [deleted] runtime/');
    }

  } finally {
    // Clean up temporary tsconfig
    fs.unlinkSync(tsconfigPath);
  }

  // Generate package.json
  const pkgJson = createPackageJson();
  fs.writeFileSync(path.join(distDir, 'package.json'), JSON.stringify(pkgJson, null, 2) + '\n');
  console.log('Generated package.json');

  // Copy README if it exists
  const readmeSrc = path.join(projectRoot, 'postgres', 'README.md');
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
