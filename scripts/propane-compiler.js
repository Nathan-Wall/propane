#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const { transformSync } = require('@babel/core');
const propaneCommentPlugin = require('../babel/propane-comment-plugin');

const targets = process.argv.slice(2);

if (!targets.length) {
  console.error('Usage: npm run propane:compile -- <file-or-directory> [more paths]');
  process.exit(1);
}

function collectPropaneFiles(targetPath) {
  const stats = fs.statSync(targetPath);

  if (stats.isDirectory()) {
    return fs
      .readdirSync(targetPath)
      .flatMap((entry) => collectPropaneFiles(path.join(targetPath, entry)));
  }

  if (stats.isFile() && targetPath.endsWith('.propane')) {
    return [targetPath];
  }

  return [];
}

function transpileFile(sourcePath) {
  const sourceCode = fs.readFileSync(sourcePath, 'utf8');
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
    plugins: [propaneCommentPlugin],
    ast: false,
  });

  if (!result || typeof result.code !== 'string') {
    throw new Error(`Failed to transpile ${sourcePath}`);
  }

  const outputPath = sourcePath.replace(/\.propane$/, '.ts');
  fs.writeFileSync(outputPath, result.code, 'utf8');
  console.log(`Transpiled ${path.relative(process.cwd(), sourcePath)} -> ${path.relative(process.cwd(), outputPath)}`);
}

const propaneFiles = [...new Set(targets.flatMap((target) => collectPropaneFiles(path.resolve(target))))];

if (!propaneFiles.length) {
  console.error('No .propane files found for the provided paths.');
  process.exit(1);
}

propaneFiles.forEach((filePath) => {
  try {
    transpileFile(filePath);
  } catch (err) {
    console.error(err.message);
    process.exitCode = 1;
  }
});

if (process.exitCode) {
  process.exit(process.exitCode);
}
