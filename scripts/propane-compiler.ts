#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { transformSync } from '@babel/core';
import propanePlugin from '@/tools/babel/messages/index.js';
import type { TypeAliasMap } from '@/tools/parser/type-aliases.js';

interface PropaneConfig {
  runtimeImportPath?: string;
  messageTypeIdPrefix?: string;
  messageTypeIdRoot?: string;
  typeAliases?: TypeAliasMap;
}

interface LoadedConfig {
  config: PropaneConfig;
  configDir: string | undefined;
}

const targets = process.argv.slice(2);

if (!targets.length) {
  console.error('Usage: npm run propane:compile -- <file-or-directory> [more paths]');
  process.exit(1);
}

// Load propane config
function loadPropaneConfig(): LoadedConfig {
  const configPath = path.resolve(process.cwd(), 'propane.config.json');
  if (fs.existsSync(configPath)) {
    try {
      return {
        config: JSON.parse(fs.readFileSync(configPath, 'utf8')) as PropaneConfig,
        configDir: path.dirname(configPath),
      };
    } catch {
      return { config: {}, configDir: undefined };
    }
  }
  return { config: {}, configDir: undefined };
}

const { config: propaneConfig, configDir } = loadPropaneConfig();
function collectPropaneFiles(targetPath: string): string[] {
  const stats = fs.statSync(targetPath);

  if (stats.isDirectory()) {
    return fs
      .readdirSync(targetPath)
      .flatMap((entry) => collectPropaneFiles(path.join(targetPath, entry)));
  }

  if (stats.isFile() && targetPath.endsWith('.pmsg')) {
    return [targetPath];
  }

  return [];
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
  sourcePath: string,
  messageTypes: string[],
  extendedTypes: Record<string, { path: string }>
): string {
  const baseName = path.basename(sourcePath, '.pmsg');
  const relative = path.relative(process.cwd(), sourcePath).replaceAll('\\', '/');
  const lines: string[] = [];
  lines.push(`// Generated from ${relative}`);

  for (const typeName of messageTypes) {
    const extendInfo = extendedTypes[typeName];
    if (!extendInfo?.path) continue;
    lines.push(`export { ${typeName} } from '${toJsPath(extendInfo.path)}';`);
  }

  lines.push(`export * from './${baseName}.pmsg.base.js';`);
  return lines.join('\n');
}

function transpileFile(sourcePath: string): void {
  const sourceCode = fs.readFileSync(sourcePath, 'utf8');
  const pluginOptions: Record<string, unknown> = {};
  const relativePath = path.relative(process.cwd(), sourcePath).replaceAll('\\', '/');
  if (propaneConfig.runtimeImportPath) {
    pluginOptions['runtimeImportPath'] = propaneConfig.runtimeImportPath;
  }
  if (configDir) {
    pluginOptions['runtimeImportBase'] = configDir;
  }
  if (propaneConfig.messageTypeIdPrefix) {
    pluginOptions['messageTypeIdPrefix'] = propaneConfig.messageTypeIdPrefix;
  }
  if (propaneConfig.messageTypeIdRoot) {
    pluginOptions['messageTypeIdRoot'] = path.resolve(
      configDir ?? process.cwd(),
      propaneConfig.messageTypeIdRoot
    );
  }
  if (propaneConfig.typeAliases) {
    pluginOptions['typeAliases'] = propaneConfig.typeAliases;
  }
  const result = transformSync(sourceCode, {
    filename: sourcePath,
    parserOpts: {
      sourceType: 'module',
      plugins: ['typescript'],
    },
    // generatorOpts is valid but not in @types/babel__core
    generatorOpts: {
      retainLines: false,
      compact: false,
    },
    plugins: [[propanePlugin, pluginOptions]],
    ast: false,
  } as Parameters<typeof transformSync>[1]);

  if (!result || typeof result.code !== 'string') {
    throw new Error(`Failed to transpile ${sourcePath}`);
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

  const baseCode = result.code.replaceAll(/\.pmsg(['"])/g, '.pmsg.js$1');
  const baseOutputPath = sourcePath.replace(/\.pmsg$/, '.pmsg.base.ts');
  writeIfChanged(baseOutputPath, baseCode);

  const reexportOutputPath = sourcePath.replace(/\.pmsg$/, '.pmsg.ts');
  const reexportCode = generateReexportFile(sourcePath, messageTypes, extendedTypes);
  writeIfChanged(reexportOutputPath, reexportCode);

  console.log(
    `Transpiled ${path.relative(process.cwd(), sourcePath)} -> ${path.relative(process.cwd(), reexportOutputPath)}`
  );
}

const propaneFiles = [
  ...new Set(targets.flatMap(
    (target) => collectPropaneFiles(path.resolve(target))
  )),
];

if (!propaneFiles.length) {
  console.error('No .pmsg files found for the provided paths.');
  process.exit(1);
}

for (const filePath of propaneFiles) {
  try {
    transpileFile(filePath);
  } catch (err) {
    console.error((err as Error).message);
    process.exitCode = 1;
  }
}

if (process.exitCode) {
  process.exit(process.exitCode);
}
