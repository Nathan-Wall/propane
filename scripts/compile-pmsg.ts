/**
 * Compiles all .pmsg files to .pmsg.base.ts plus a re-export .pmsg.ts file
 * using the Babel plugin.
 * This script must be run AFTER the babel plugin has been built.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { transformSync } from '@babel/core';
import propanePlugin from '@/tools/babel/messages/index.js';
import type { TypeAliasMap } from '@/tools/parser/type-aliases.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// When running from build/scripts/, go up two levels to reach project root
const projectRoot = path.resolve(__dirname, '../..');

interface PropaneConfig {
  runtimeImportPath?: string;
  messageTypeIdPrefix?: string;
  messageTypeIdRoot?: string;
  typeAliases?: TypeAliasMap;
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
  'common/numbers',
  'common/data',
  'common/time',
  'common/web',
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

function toJsPath(value: string): string {
  if (value.endsWith('.ts')) {
    return value.slice(0, -3) + '.js';
  }
  if (value.endsWith('.tsx')) {
    return value.slice(0, -4) + '.js';
  }
  return value;
}

function writeIfChanged(outputPath: string, content: string): void {
  const normalized = content.endsWith('\n') ? content : content + '\n';
  if (fs.existsSync(outputPath)) {
    const existing = fs.readFileSync(outputPath, 'utf8');
    if (existing === normalized) {
      return;
    }
  }
  fs.writeFileSync(outputPath, normalized, 'utf8');
}

function generateReexportFile(
  filePath: string,
  messageTypes: string[],
  extendedTypes: Record<string, { path: string }>
): string {
  const baseName = path.basename(filePath, '.pmsg');
  const relative = path
    .relative(projectRoot, filePath)
    .replaceAll('\\', '/');
  const lines: string[] = [];
  lines.push(`// Generated from ${relative}`);

  for (const typeName of messageTypes) {
    const extendInfo = extendedTypes[typeName];
    if (!extendInfo?.path) continue;
    lines.push(
      `export { ${typeName} } from '${toJsPath(extendInfo.path)}';`
    );
  }

  lines.push(`export * from './${baseName}.pmsg.base.js';`);
  return lines.join('\n');
}

function compilePmsgFile(filePath: string): void {
  const source = fs.readFileSync(filePath, 'utf8');
  const relativePath = path
    .relative(projectRoot, filePath)
    .replaceAll('\\', '/');
  // Use config if available, otherwise use relative path
  const pluginOptions: Record<string, unknown> = {};
  if (propaneConfig.runtimeImportPath) {
    pluginOptions['runtimeImportPath'] = propaneConfig.runtimeImportPath;
    pluginOptions['runtimeImportBase'] = projectRoot;
  }
  if (propaneConfig.messageTypeIdPrefix) {
    pluginOptions['messageTypeIdPrefix'] = propaneConfig.messageTypeIdPrefix;
  }
  if (propaneConfig.messageTypeIdRoot) {
    pluginOptions['messageTypeIdRoot'] = path.resolve(
      projectRoot,
      propaneConfig.messageTypeIdRoot
    );
  }
  if (propaneConfig.typeAliases) {
    pluginOptions['typeAliases'] = propaneConfig.typeAliases;
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

  const metadata = (result as {
    metadata?: {
      propane?: {
        messageTypes?: string[];
        extendedTypes?: Record<string, { path: string }>;
      };
    };
  }).metadata?.propane;
  const messageTypes = metadata?.messageTypes ?? [];
  const extendedTypes = metadata?.extendedTypes ?? {};

  // Rewrite .pmsg imports to .pmsg.js for ESM compatibility
  const baseCode = result.code.replaceAll(/\.pmsg(['"])/g, '.pmsg.js$1');

  const baseOutputPath = filePath.replace(/\.pmsg$/, '.pmsg.base.ts');
  writeIfChanged(baseOutputPath, baseCode);

  const reexportOutputPath = filePath.replace(/\.pmsg$/, '.pmsg.ts');
  const reexportCode = generateReexportFile(filePath, messageTypes, extendedTypes);
  writeIfChanged(reexportOutputPath, reexportCode);

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
