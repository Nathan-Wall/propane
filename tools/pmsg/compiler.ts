import fs from 'node:fs';
import path from 'node:path';
import { transformSync } from '@babel/core';
import propanePlugin from '@/tools/babel/messages/index.js';
import type { TypeAliasMap } from '@/tools/parser/type-aliases.js';

export interface CompilePmsgOptions {
  outputDir?: string;
  rootDir?: string;
  runtimeImportPath?: string;
  runtimeImportBase?: string;
  messageTypeIdPrefix?: string;
  messageTypeIdRoot?: string;
  typeAliases?: TypeAliasMap;
  generatorOpts?: Record<string, unknown>;
  ast?: boolean;
}

export interface CompilePmsgResult {
  baseOutputPath: string;
  reexportOutputPath: string;
  messageTypes: string[];
  extendedTypes: Record<string, { path: string }>;
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
  extendedTypes: Record<string, { path: string }>,
  rootDir: string
): string {
  const baseName = path.basename(sourcePath, '.pmsg');
  const relative = path.relative(rootDir, sourcePath).replaceAll('\\', '/');
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

function ensureDirFor(filePath: string): void {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

export function getOutputPaths(
  sourcePath: string,
  outputDir?: string,
  rootDir: string = process.cwd()
): { baseOutputPath: string; reexportOutputPath: string } {
  if (outputDir) {
    const relativePath = path.relative(rootDir, sourcePath);
    const resolvedBase = path
      .resolve(rootDir, outputDir, relativePath)
      .replace(/\.pmsg$/, '.pmsg.base.ts');
    const resolvedShim = path
      .resolve(rootDir, outputDir, relativePath)
      .replace(/\.pmsg$/, '.pmsg.ts');
    return { baseOutputPath: resolvedBase, reexportOutputPath: resolvedShim };
  }

  return {
    baseOutputPath: sourcePath.replace(/\.pmsg$/, '.pmsg.base.ts'),
    reexportOutputPath: sourcePath.replace(/\.pmsg$/, '.pmsg.ts'),
  };
}

export function compilePmsgFile(
  sourcePath: string,
  options: CompilePmsgOptions
): CompilePmsgResult {
  const sourceCode = fs.readFileSync(sourcePath, 'utf8');
  const pluginOptions: Record<string, unknown> = {};
  if (options.runtimeImportPath) {
    pluginOptions['runtimeImportPath'] = options.runtimeImportPath;
  }
  if (options.runtimeImportBase) {
    pluginOptions['runtimeImportBase'] = options.runtimeImportBase;
  }
  if (options.messageTypeIdPrefix) {
    pluginOptions['messageTypeIdPrefix'] = options.messageTypeIdPrefix;
  }
  if (options.messageTypeIdRoot) {
    pluginOptions['messageTypeIdRoot'] = options.messageTypeIdRoot;
  }
  if (options.typeAliases) {
    pluginOptions['typeAliases'] = options.typeAliases;
  }

  const transformOptions = {
    filename: sourcePath,
    parserOpts: {
      sourceType: 'module',
      plugins: ['typescript'],
    },
    plugins: [[propanePlugin, pluginOptions]],
    ast: options.ast,
  } as Parameters<typeof transformSync>[1];
  if (options.generatorOpts) {
    (transformOptions as { generatorOpts?: Record<string, unknown> }).generatorOpts = options.generatorOpts;
  }

  const result = transformSync(sourceCode, transformOptions);

  if (!result || typeof result.code !== 'string') {
    throw new Error(`Babel transform returned no code`);
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
  const rootDir = options.rootDir ?? process.cwd();
  const { baseOutputPath, reexportOutputPath } = getOutputPaths(
    sourcePath,
    options.outputDir,
    rootDir
  );

  ensureDirFor(baseOutputPath);
  ensureDirFor(reexportOutputPath);
  writeIfChanged(baseOutputPath, baseCode);

  const reexportCode = generateReexportFile(
    sourcePath,
    messageTypes,
    extendedTypes,
    rootDir
  );
  writeIfChanged(reexportOutputPath, reexportCode);

  return { baseOutputPath, reexportOutputPath, messageTypes, extendedTypes };
}
