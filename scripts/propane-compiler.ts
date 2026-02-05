#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import type { TypeAliasMap } from '@/tools/parser/type-aliases.js';
import { compilePmsgFile } from '@/tools/pmsg/compiler.js';

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

function transpileFile(sourcePath: string): void {
  const pluginOptions: Record<string, unknown> = {};
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
  const { reexportOutputPath } = compilePmsgFile(sourcePath, {
    runtimeImportPath: pluginOptions['runtimeImportPath'] as string | undefined,
    runtimeImportBase: pluginOptions['runtimeImportBase'] as string | undefined,
    messageTypeIdPrefix: pluginOptions['messageTypeIdPrefix'] as string | undefined,
    messageTypeIdRoot: pluginOptions['messageTypeIdRoot'] as string | undefined,
    typeAliases: pluginOptions['typeAliases'] as TypeAliasMap | undefined,
    generatorOpts: {
      retainLines: false,
      compact: false,
    },
    ast: false,
  });

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
