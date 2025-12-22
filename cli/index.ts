#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import { transformSync } from '@babel/core';
import propanePlugin from '@/tools/babel/messages/index.js';
import chokidar from 'chokidar';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const args = (process as unknown as { argv: string[] }).argv.slice(2);

// Parse flags
let watch = false;
const targets: string[] = [];
let outputDir: string | undefined;

interface PropaneConfig {
  include?: string[];
  watch?: boolean;
  outputDir?: string;
  /** Custom import path for @propane/runtime in generated files. */
  runtimeImportPath?: string;
}

interface LoadedConfig {
  config: PropaneConfig;
  configDir: string | undefined;
}

function loadConfig(): LoadedConfig {
  const configPath = path.resolve(process.cwd(), 'propane.config.json');
  if (fs.existsSync(configPath)) {
    try {
      const content = fs.readFileSync(configPath, 'utf8');
      return {
        config: JSON.parse(content) as PropaneConfig,
        configDir: path.dirname(configPath),
      };
    } catch (err: unknown) {
      console.error(`Warning: Failed to parse propane.config.json: ${err instanceof Error ? err.message : String(err)}`);
    }
  }
  return { config: {}, configDir: undefined };
}

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
        const pkgPath = path.join(__dirname, 'package.json');
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

// Load and merge config
const { config, configDir } = loadConfig();

if (config.include && targets.length === 0) {
  targets.push(...config.include);
}
if (config.watch && !args.includes('--watch') && !args.includes('-w')) {
  watch = true;
}
if (config.outputDir) {
  outputDir = config.outputDir;
}

const runtimeImportPath = config.runtimeImportPath;
const runtimeImportBase = configDir;

function printUsage() {
  console.log(`
Usage: propanec [options] <file-or-directory> [more paths...]

Compile .pmsg files to TypeScript.

Options:
  -w, --watch    Watch for changes and recompile
  -h, --help     Show this help message
  -v, --version  Show version number

Configuration:
  Reads propane.config.json from current directory if present.

  {
    "include": ["src"],
    "exclude": [],
    "outputDir": "dist",
    "watch": false,
    "runtimeImportPath": "@propane/runtime"
  }

Examples:
  propanec src/models
  propanec src/models/user.pmsg
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

  if (stats.isFile() && resolved.endsWith('.pmsg')) {
    return [resolved];
  }

  return [];
}

function transpileFile(sourcePath: string) {
  const sourceCode = fs.readFileSync(sourcePath, 'utf8');

  try {
    type PluginOpts = {
      runtimeImportPath?: string;
      runtimeImportBase?: string;
    };
    const pluginOptions: PluginOpts = {};
    if (runtimeImportPath) {
      pluginOptions.runtimeImportPath = runtimeImportPath;
    }
    if (runtimeImportBase) {
      pluginOptions.runtimeImportBase = runtimeImportBase;
    }
    const result = transformSync(sourceCode, {
      filename: sourcePath,
      parserOpts: {
        sourceType: 'module',
        plugins: ['typescript'],
      },
      plugins: [[propanePlugin, pluginOptions]],
    });

    if (!result || typeof result.code !== 'string') {
      throw new Error(`Babel transform returned no code`);
    }

    let outputPath: string;
    if (outputDir) {
      const relativePath = path.relative(process.cwd(), sourcePath);
      outputPath = path.resolve(process.cwd(), outputDir, relativePath).replace(/\.pmsg$/, '.pmsg.ts');

      const dir = path.dirname(outputPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    } else {
      outputPath = sourcePath.replace(/\.pmsg$/, '.pmsg.ts');
    }

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
    console.error('No .pmsg files found.');
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
  console.log('\nScanning files.');

  const watcher = chokidar
    .watch(targets, {
      ignored: /(^|[/\\])\../, // ignore dotfiles
      persistent: true,
      ignoreInitial: true, // Don't trigger 'add' events for files that already exist
      depth: 99, // Watch deeply
    })
    .on('ready', () => console.log('Initial scan complete. Watching for changes...'))
    .on('add', (filePath) => {
      if (filePath.endsWith('.pmsg')) {
        transpileFile(filePath);
      }
    })
    .on('change', (filePath) => {
      if (filePath.endsWith('.pmsg')) {
        transpileFile(filePath);
      }
    })
    .on('unlink', (filePath) => {
      // Optional: Delete the generated .pmsg.ts file if the original .pmsg file is deleted
      if (filePath.endsWith('.pmsg')) {
        let outputPath: string;
        if (outputDir) {
          const relativePath = path.relative(process.cwd(), filePath);
          outputPath = path.resolve(process.cwd(), outputDir, relativePath).replace(/\.pmsg$/, '.pmsg.ts');
        } else {
          outputPath = filePath.replace(/\.pmsg$/, '.pmsg.ts');
        }

        if (fs.existsSync(outputPath)) {
          fs.unlinkSync(outputPath);
          const relOutput = path.relative(process.cwd(), outputPath);
          console.log(`✗ Deleted ${relOutput}`);
        }
      }
    });

  const shutdown = () => {
    void watcher.close();
    process.exit(0);
  };
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);

} else if (!success) {
  process.exit(1);
}
