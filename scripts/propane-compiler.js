#!/usr/bin/env node


import fs from 'node:fs';
import path from 'node:path';
import { transformSync } from '@babel/core';
import propanePlugin from '@propanejs/babel-messages';

const targets = process.argv.slice(2);

if (!targets.length) {
  console.error('Usage: npm run propane:compile -- <file-or-directory> [more paths]');
  process.exit(1);
}

// Load propane config
function loadPropaneConfig() {
  const configPath = path.resolve(process.cwd(), 'propane.config.json');
  if (fs.existsSync(configPath)) {
    try {
      return {
        config: JSON.parse(fs.readFileSync(configPath, 'utf8')),
        configDir: path.dirname(configPath),
      };
    } catch {
      return { config: {}, configDir: undefined };
    }
  }
  return { config: {}, configDir: undefined };
}

const { config: propaneConfig, configDir } = loadPropaneConfig();

function collectPropaneFiles(targetPath) {
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

function transpileFile(sourcePath) {
  const sourceCode = fs.readFileSync(sourcePath, 'utf8');
  const pluginOptions = {};
  if (propaneConfig.runtimeImportPath) {
    pluginOptions.runtimeImportPath = propaneConfig.runtimeImportPath;
  }
  if (configDir) {
    pluginOptions.runtimeImportBase = configDir;
  }
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
    plugins: [[propanePlugin, pluginOptions]],
    ast: false,
  });

  if (!result || typeof result.code !== 'string') {
    throw new Error(`Failed to transpile ${sourcePath}`);
  }

  const outputPath = sourcePath.replace(/\.pmsg$/, '.pmsg.ts');
  const code = result.code.endsWith('\n') ? result.code : result.code + '\n';
  fs.writeFileSync(outputPath, code, 'utf8');
  console.log(`Transpiled ${path.relative(process.cwd(), sourcePath)} -> ${path.relative(process.cwd(), outputPath)}`);
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
    console.error(err.message);
    process.exitCode = 1;
  }
}

if (process.exitCode) {
  process.exit(process.exitCode);
}
