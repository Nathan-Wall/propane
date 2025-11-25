#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { transformSync } from '@babel/core';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load the babel plugin from the dist directory
const pluginPath = path.resolve(__dirname, '..', 'dist', 'babel', 'plugin.js');
const propanePlugin = (await import(pluginPath)).default;

const args = process.argv.slice(2);

// Parse flags
let watch = false;
const targets = [];

for (const arg of args) {
  if (arg === '--watch' || arg === '-w') {
    watch = true;
  } else if (arg === '--help' || arg === '-h') {
    printUsage();
    process.exit(0);
  } else if (arg === '--version' || arg === '-v') {
    const pkg = JSON.parse(fs.readFileSync(path.resolve(__dirname, '..', 'package.json'), 'utf8'));
    console.log(`propanec v${pkg.version}`);
    process.exit(0);
  } else if (!arg.startsWith('-')) {
    targets.push(arg);
  } else {
    console.error(`Unknown option: ${arg}`);
    printUsage();
    process.exit(1);
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
  console.error('Error: No files or directories specified.\n');
  printUsage();
  process.exit(1);
}

function collectPropaneFiles(targetPath) {
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

function transpileFile(sourcePath) {
  const sourceCode = fs.readFileSync(sourcePath, 'utf8');

  try {
    const result = transformSync(sourceCode, {
      filename: sourcePath,
      parserOpts: {
        sourceType: 'module',
        plugins: ['typescript'],
      },
      generatorOpts: {
        retainLines: false,
        compact: false,
      },
      plugins: [propanePlugin],
      ast: false,
    });

    if (!result || typeof result.code !== 'string') {
      throw new Error(`Babel transform returned no code`);
    }

    const outputPath = sourcePath.replace(/\.propane$/, '.propane.ts');
    fs.writeFileSync(outputPath, result.code, 'utf8');

    const relSource = path.relative(process.cwd(), sourcePath);
    const relOutput = path.relative(process.cwd(), outputPath);
    console.log(`✓ ${relSource} → ${relOutput}`);

    return true;
  } catch (err) {
    const relSource = path.relative(process.cwd(), sourcePath);
    console.error(`✗ ${relSource}: ${err.message}`);
    return false;
  }
}

function compileAll() {
  const propaneFiles = [...new Set(targets.flatMap((target) => collectPropaneFiles(target)))];

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

  const directories = new Set();
  for (const target of targets) {
    const resolved = path.resolve(target);
    if (fs.existsSync(resolved)) {
      const stats = fs.statSync(resolved);
      directories.add(stats.isDirectory() ? resolved : path.dirname(resolved));
    }
  }

  for (const dir of directories) {
    fs.watch(dir, { recursive: true }, (eventType, filename) => {
      if (filename && filename.endsWith('.propane')) {
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
