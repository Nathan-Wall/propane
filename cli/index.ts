#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import { transformSync } from '@babel/core';
import propanePlugin from '@propanejs/babel-messages';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const args = (process as unknown as { argv: string[] }).argv.slice(2);

// Parse flags
let watch = false;
const targets: string[] = [];

for (const arg of args) {
  if (arg.startsWith('-')) {
    switch (arg) {
      case '--watch':
      case '-w':
        watch = true;
        break;
      case '--help':
      case '-h':
        printUsage();
        process.exit(0);
        break;
      case '--version':
      case '-v': {
        const pkgPath = path.resolve(__dirname, '..', 'package.json');
        const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8')) as { version: string };
        console.log(`propanec v${pkg.version}`);
        process.exit(0);
      }
        break;
      default:
        console.error(`Unknown option: ${arg}`);
        printUsage();
        process.exit(1);
        break;
    }
  } else {
    targets.push(arg);
  }
}

function printUsage() {
  console.log(`
Usage: propanec [options] <file-or-directory> [more paths...]

Compile .propane files to TypeScript.

Options:
  -w, --watch    Watch for changes and recompile
  -h, --help     Show this help message
  -v, --version  Show version number

Examples:
  propanec src/models
  propanec src/models/user.propane
  propanec src --watch
`);
}

if (!targets.length) {
  console.error('Error: No files or directories specified.');
  printUsage();
  process.exit(1);
}

function collectPropaneFiles(targetPath: string): string[] {
  const resolved = path.resolve(targetPath);

  if (!fs.existsSync(resolved)) {
    console.error(`Error: Path does not exist: ${targetPath}`);
    return [];
  }

  const stats = fs.statSync(resolved);

  if (stats.isDirectory()) {
    return fs
      .readdirSync(resolved)
      .flatMap((entry) => collectPropaneFiles(path.join(resolved, entry)));
  }

  if (stats.isFile() && resolved.endsWith('.propane')) {
    return [resolved];
  }

  return [];
}

function transpileFile(sourcePath: string) {
  const sourceCode = fs.readFileSync(sourcePath, 'utf8');

  try {
    const result = transformSync(sourceCode, {
      filename: sourcePath,
      parserOpts: {
        sourceType: 'module',
        plugins: ['typescript'],
      },
      plugins: [propanePlugin],
    });

    if (!result || typeof result.code !== 'string') {
      throw new Error(`Babel transform returned no code`);
    }

    const outputPath = sourcePath.replace(/\.propane$/, '.propane.ts');
    const code = result.code.endsWith('\n') ? result.code : result.code + '\n';
    fs.writeFileSync(outputPath, code, 'utf8');

    const relSource = path.relative(process.cwd(), sourcePath);
    const relOutput = path.relative(process.cwd(), outputPath);
    console.log(
      `✓ ${relSource} → `
      + `${relOutput}`
    );

    return true;
  } catch (err: unknown) {
    const relSource = path.relative(process.cwd(), sourcePath);
    // eslint-disable-next-line @typescript-eslint/no-base-to-string
    const message = err instanceof Error ? err.message : String(err);
    console.error(`✗ ${relSource}: ${message}`);
    return false;
  }
}

function compileAll() {
  const propaneFiles = [...new Set(
    targets.flatMap((target) => collectPropaneFiles(target))
  )];

  if (!propaneFiles.length) {
    console.error('No .propane files found.');
    return false;
  }

  let success = true;
  for (const filePath of propaneFiles) {
    if (!transpileFile(filePath)) {
      success = false;
    }
  }

  return success;
}

// Initial compilation
const success = compileAll();

if (watch) {
  console.log('\nWatching for changes...\n');

  // Collect directories to watch from targets
  const directories = new Set<string>();
  for (const target of targets) {
    const resolved = path.resolve(target);
    if (fs.existsSync(resolved)) {
      const stats = fs.statSync(resolved);
      if (stats.isDirectory()) {
        directories.add(resolved);
      } else if (stats.isFile()) {
        directories.add(path.dirname(resolved));
      }
    }
  }

  for (const dir of directories) {
    fs.watch(dir, { recursive: true }, (eventType, filename) => {
      if (filename?.endsWith('.propane')) {
        const fullPath = path.join(dir, filename);
        if (fs.existsSync(fullPath)) {
          transpileFile(fullPath);
        }
      }
    });
  }
} else if (!success) {
  process.exit(1);
}
