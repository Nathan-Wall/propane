/**
 * Compiles all .pmsg files to .pmsg.ts using the Babel plugin.
 * This script must be run AFTER the babel plugin has been built.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { transformSync } from '@babel/core';
import propanePlugin from '@/tools/babel/messages/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// When running from build/scripts/, go up two levels to reach project root
const projectRoot = path.resolve(__dirname, '../..');

interface PropaneConfig {
  runtimeImportPath?: string;
}

// Load propane config
function loadPropaneConfig(): PropaneConfig {
  const configPath = path.join(projectRoot, 'propane.config.json');
  if (fs.existsSync(configPath)) {
    try {
      return JSON.parse(fs.readFileSync(configPath, 'utf8')) as PropaneConfig;
    } catch {
      return {};
    }
  }
  return {};
}

const propaneConfig = loadPropaneConfig();

// Directories to scan for .pmsg files (test directories only)
// pms-server/src is excluded because response.pmsg.ts is checked in
const scanDirs = [
  'tests',
  'pms-server/tests',
];

// Suffix for files expected to fail (don't compile these)
const failSuffix = '-fail.pmsg';

function findPmsgFiles(dir: string): string[] {
  const fullDir = path.join(projectRoot, dir);
  if (!fs.existsSync(fullDir)) return [];

  const entries = fs.readdirSync(fullDir, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    if (entry.name.startsWith('.')) continue;
    const fullPath = path.join(fullDir, entry.name);

    if (entry.isDirectory()) {
      // Recursively search subdirectories
      const relSubdir = path.join(dir, entry.name);
      files.push(...findPmsgFiles(relSubdir));
    } else if (entry.isFile() && entry.name.endsWith('.pmsg') && !entry.name.endsWith(failSuffix)) {
      files.push(fullPath);
    }
  }

  return files;
}

function compilePmsgFile(filePath: string): void {
  const source = fs.readFileSync(filePath, 'utf8');

  // Use config if available, otherwise use relative path
  const pluginOptions: Record<string, unknown> = {};
  if (propaneConfig.runtimeImportPath) {
    pluginOptions['runtimeImportPath'] = propaneConfig.runtimeImportPath;
    pluginOptions['runtimeImportBase'] = projectRoot;
  }

  const result = transformSync(source, {
    filename: filePath,
    parserOpts: {
      sourceType: 'module',
      plugins: ['typescript'],
    },
    plugins: [[propanePlugin, pluginOptions]],
  });

  if (!result?.code) {
    throw new Error(`Failed to compile ${filePath}`);
  }

  // Rewrite .pmsg imports to .pmsg.js for ESM compatibility
  let code = result.code.replaceAll(/\.pmsg(['"])/g, '.pmsg.js$1');

  const outputPath = filePath.replace(/\.pmsg$/, '.pmsg.ts');
  code = code.endsWith('\n') ? code : code + '\n';

  // Only write if content changed
  if (fs.existsSync(outputPath)) {
    const existing = fs.readFileSync(outputPath, 'utf8');
    if (existing === code) {
      return; // No change
    }
  }

  fs.writeFileSync(outputPath, code, 'utf8');
  console.log(`Compiled: ${path.relative(projectRoot, filePath)}`);
}

// Find and compile all .pmsg files
const allFiles: string[] = [];
for (const dir of scanDirs) {
  allFiles.push(...findPmsgFiles(dir));
}

let errorCount = 0;
for (const file of allFiles) {
  try {
    compilePmsgFile(file);
  } catch (err) {
    console.error(`Error compiling ${file}: ${(err as Error).message}`);
    errorCount++;
  }
}

if (errorCount > 0) {
  process.exit(1);
}

console.log(`Compiled ${allFiles.length} .pmsg files`);
