/**
 * Prebuild compile for .pmsg files required by TypeScript builds.
 * Uses the built Babel plugin from build/tools/babel/messages.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { transformSync } from '@babel/core';
import propanePlugin from '../build/tools/babel/messages/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

function loadPropaneConfig() {
  const configPath = path.join(projectRoot, 'propane.config.json');
  if (fs.existsSync(configPath)) {
    try {
      return JSON.parse(fs.readFileSync(configPath, 'utf8'));
    } catch {
      return {};
    }
  }
  return {};
}

const propaneConfig = loadPropaneConfig();

const scanDirs = [
  'common/numbers',
  'runtime/common/data',
  'runtime/common/time',
  'runtime/common/web',
];
const runtimeOverrides = new Set([
  'runtime/common/data/immutable-array-buffer.pmsg',
  'runtime/common/time/date.pmsg',
  'runtime/common/web/url.pmsg',
]);
const failSuffix = '-fail.pmsg';

function findPmsgFiles(dir) {
  const fullDir = path.join(projectRoot, dir);
  if (!fs.existsSync(fullDir)) return [];

  const entries = fs.readdirSync(fullDir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    if (entry.name.startsWith('.')) continue;
    const fullPath = path.join(fullDir, entry.name);

    if (entry.isDirectory()) {
      const relSubdir = path.join(dir, entry.name);
      files.push(...findPmsgFiles(relSubdir));
    } else if (entry.isFile() && entry.name.endsWith('.pmsg') && !entry.name.endsWith(failSuffix)) {
      files.push(fullPath);
    }
  }

  return files;
}

function toJsPath(value) {
  if (value.endsWith('.ts')) {
    return `${value.slice(0, -3)}.js`;
  }
  if (value.endsWith('.tsx')) {
    return `${value.slice(0, -4)}.js`;
  }
  return value;
}

function writeIfChanged(outputPath, content) {
  const normalized = content.endsWith('\n') ? content : `${content}\n`;
  if (fs.existsSync(outputPath)) {
    const existing = fs.readFileSync(outputPath, 'utf8');
    if (existing === normalized) {
      return;
    }
  }
  fs.writeFileSync(outputPath, normalized, 'utf8');
}

function generateReexportFile(filePath, messageTypes, extendedTypes) {
  const baseName = path.basename(filePath, '.pmsg');
  const relative = path.relative(projectRoot, filePath).replaceAll('\\', '/');
  const lines = [];
  lines.push(`// Generated from ${relative}`);

  for (const typeName of messageTypes) {
    const extendInfo = extendedTypes[typeName];
    if (!extendInfo?.path) continue;
    lines.push(`export { ${typeName} } from '${toJsPath(extendInfo.path)}';`);
  }

  lines.push(`export * from './${baseName}.pmsg.base.js';`);
  return lines.join('\n');
}

function compilePmsgFile(filePath) {
  const source = fs.readFileSync(filePath, 'utf8');
  const relativePath = path.relative(projectRoot, filePath).replaceAll('\\', '/');
  const isRuntimeOverride = runtimeOverrides.has(relativePath);

  const pluginOptions = {};
  if (propaneConfig.runtimeImportPath) {
    pluginOptions['runtimeImportPath'] = propaneConfig.runtimeImportPath;
    pluginOptions['runtimeImportBase'] = projectRoot;
  }
  if (isRuntimeOverride) {
    pluginOptions['runtimeImportPath'] = './runtime/pmsg-base.js';
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

  const metadata = result.metadata?.propane ?? {};
  const messageTypes = metadata.messageTypes ?? [];
  const extendedTypes = metadata.extendedTypes ?? {};

  const baseCode = result.code.replaceAll(/\.pmsg(['"])/g, '.pmsg.js$1');
  const baseOutputPath = filePath.replace(/\.pmsg$/, '.pmsg.base.ts');
  writeIfChanged(baseOutputPath, baseCode);

  const reexportOutputPath = filePath.replace(/\.pmsg$/, '.pmsg.ts');
  const reexportCode = generateReexportFile(filePath, messageTypes, extendedTypes);
  writeIfChanged(reexportOutputPath, reexportCode);

  console.log(`Compiled: ${path.relative(projectRoot, filePath)}`);
}

const allFiles = [];
for (const dir of scanDirs) {
  allFiles.push(...findPmsgFiles(dir));
}

let errorCount = 0;
for (const file of allFiles) {
  try {
    compilePmsgFile(file);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`Error compiling ${file}: ${message}`);
    errorCount++;
  }
}

if (errorCount > 0) {
  process.exit(1);
}

console.log(`Compiled ${allFiles.length} .pmsg files`);
