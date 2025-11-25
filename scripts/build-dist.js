#!/usr/bin/env node

/**
 * Build script for creating the distributable package.
 * Compiles the babel plugin and runtime to the dist/ directory.
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import ts from 'typescript';

const projectRoot = process.cwd();
const distDir = path.resolve(projectRoot, 'dist');

const compilerOptions = {
  module: ts.ModuleKind.ESNext,
  target: ts.ScriptTarget.ES2022,
  moduleResolution: ts.ModuleResolutionKind.NodeNext,
  esModuleInterop: true,
  allowSyntheticDefaultImports: true,
  declaration: true,
  declarationMap: true,
  sourceMap: true,
};

function addJsExtension(specifier) {
  if (!specifier.startsWith('.') && !specifier.startsWith('/')) {
    return specifier;
  }
  if (/\.(js|mjs|cjs|json)$/i.test(specifier)) {
    return specifier;
  }
  return `${specifier}.js`;
}

function rewriteSpecifiers(code) {
  const fromPattern = /(from\s+['"])(\.\.?\/[^'";]+)(['"])/g;
  const exportPattern = /(export\s+\*\s+from\s+['"])(\.\.?\/[^'";]+)(['"])/g;
  const dynamicImportPattern = /(import\(\s*['"])(\.\.?\/[^'";]+)(['"]\s*\))/g;

  const replacer = (_, start, spec, end) => `${start}${addJsExtension(spec)}${end}`;

  return code
    .replaceAll(fromPattern, replacer)
    .replaceAll(exportPattern, replacer)
    .replaceAll(dynamicImportPattern, replacer);
}

async function buildDirectory(srcDir, destDir) {
  await fs.mkdir(destDir, { recursive: true });

  const entries = await fs.readdir(srcDir, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(srcDir, entry.name);
    const destPath = path.join(destDir, entry.name);

    if (entry.isDirectory()) {
      await buildDirectory(srcPath, destPath);
    } else if (entry.isFile() && entry.name.endsWith('.ts') && !entry.name.endsWith('.d.ts')) {
      const source = await fs.readFile(srcPath, 'utf8');
      const result = ts.transpileModule(source, {
        compilerOptions,
        fileName: srcPath,
      });

      const jsPath = destPath.replace(/\.ts$/, '.js');
      const rewritten = rewriteSpecifiers(result.outputText);
      await fs.writeFile(jsPath, rewritten);

      // Write declaration file if generated
      if (result.declarationText) {
        const dtsPath = destPath.replace(/\.ts$/, '.d.ts');
        await fs.writeFile(dtsPath, result.declarationText);
      }

      console.log(`  ${path.relative(projectRoot, srcPath)} → ${path.relative(projectRoot, jsPath)}`);
    }
  }
}

async function main() {
  console.log('Building propanejs distribution...\n');

  // Clean dist directory
  await fs.rm(distDir, { recursive: true, force: true });
  await fs.mkdir(distDir, { recursive: true });

  // Build babel plugin
  console.log('Building babel plugin:');
  await buildDirectory(
    path.join(projectRoot, 'babel'),
    path.join(distDir, 'babel')
  );

  // Build runtime
  console.log('\nBuilding runtime:');
  await buildDirectory(
    path.join(projectRoot, 'runtime'),
    path.join(distDir, 'runtime')
  );

  // Build common utilities
  console.log('\nBuilding common utilities:');
  await buildDirectory(
    path.join(projectRoot, 'common'),
    path.join(distDir, 'common')
  );

  // Create package.json for dist
  const pkg = JSON.parse(await fs.readFile(path.join(projectRoot, 'package.json'), 'utf8'));
  const distPkg = {
    type: 'module',
  };
  await fs.writeFile(
    path.join(distDir, 'package.json'),
    JSON.stringify(distPkg, null, 2)
  );

  console.log('\n✓ Build complete!');
}

try {
  await main();
} catch (err) {
  console.error('Build failed:', err);
  process.exitCode = 1;
}
