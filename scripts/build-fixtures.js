import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { transformSync } from '@babel/core';
import ts from 'typescript';
import propanePlugin from '../build/babel/plugin.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const testsDir = path.join(projectRoot, 'tests');
const outDir = path.join(projectRoot, 'build', 'tests');

await cleanOutput();
await buildAll();
await copyTests();
await copyCommon();
await copyRuntime();

async function buildAll() {
  const files = findPropaneFiles(testsDir);
  ensureDir(outDir);
  ensurePackageTypeModule(outDir);

  const failPattern = /(?:^|[.-])fail\.propane$/i;

  for (const file of files) {
    if (failPattern.test(path.basename(file))) {
      continue; // fixtures expected to fail compile
    }
    const rel = path.relative(testsDir, file); // e.g., index-hole.propane
    const outPath = path.join(outDir, `${rel}.js`); // keep .propane in name for clarity
    ensureDir(path.dirname(outPath));
    const source = fs.readFileSync(file, 'utf8');
    const { code } = transformSync(source, {
      filename: file,
      parserOpts: { sourceType: 'module', plugins: ['typescript'] },
      plugins: [propanePlugin],
    });

    const rewritten = rewriteImports(code, outPath);
    const transpiled = ts.transpileModule(rewritten, {
      compilerOptions: {
        module: ts.ModuleKind.ESNext,
        target: ts.ScriptTarget.ES2020,
        esModuleInterop: true,
        moduleResolution: ts.ModuleResolutionKind.NodeNext,
      },
      fileName: outPath,
    });
    const finalized = ensureValueExport(transpiled.outputText, source, file);

    fs.writeFileSync(outPath, finalized, 'utf8');
  }
}

function findPropaneFiles(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const found = [];
  for (const entry of entries) {
    if (entry.name.startsWith('.')) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      found.push(...findPropaneFiles(full));
    } else if (entry.isFile() && entry.name.endsWith('.propane')) {
      found.push(full);
    }
  }
  return found;
}

async function cleanOutput() {
  if (fs.existsSync(outDir)) {
    fs.rmSync(outDir, { recursive: true, force: true });
  }
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function ensurePackageTypeModule(dir) {
  const pkgPath = path.join(dir, 'package.json');
  if (fs.existsSync(pkgPath)) return;
  fs.writeFileSync(pkgPath, JSON.stringify({ type: 'module' }, null, 2));
}

function rewriteImports(code, outPath) {
  // Replace import from '@propanejs/runtime' with relative path to runtime/index.js
  const runtimePath = path.relative(path.dirname(outPath), path.join(projectRoot, 'build', 'runtime', 'index.js'));
  const normalized = runtimePath.startsWith('.') ? runtimePath : `./${runtimePath}`;
  let result = code.replaceAll('@propanejs/runtime', normalized.replaceAll('\\', '/'));

  // Rewrite relative .propane imports to point at built JS artifacts
  result = result.replaceAll(/\.propane(['"])/g, '.propane.js$1');

  // Remove runtime-only type imports
  result = result.replaceAll(/,?\s*MessagePropDescriptor/g, '');
  result = result.replace(/^import\s*\{\s*Brand\s*\}\s*from[^;]+;\n?/m, '');

  // Append .js to relative imports without an explicit extension (excluding the .propane.js ones we just set)
  result = result.replaceAll(/(from\s+['"])(\.{1,2}\/[^'".][^'"]*)(['"])/g, (match, p1, p2, p3) => {
    if (/\.js$|\.ts$|\.json$/.test(p2) || p2.endsWith('.propane.js')) {
      return match;
    }
    return `${p1}${p2}.js${p3}`;
  });

  // Fix path for shared common/types in build/tests output
  result = result.replaceAll(/from ['"]\.\.\/common\/types\/brand\.ts['"]/g, "from '../../common/types/brand.js'");
  return result;
}

async function copyTests() {
  const testFiles = findTestFiles(testsDir);
  for (const file of testFiles) {
    const rel = path.relative(testsDir, file);
    const dest = path.join(outDir, rel.replace(/\.ts$/, '.js'));
    ensureDir(path.dirname(dest));
    const source = fs.readFileSync(file, 'utf8');
    const rewritten = rewriteTestImports(source);
    const transpiled = ts.transpileModule(rewritten, {
      compilerOptions: {
        module: ts.ModuleKind.ESNext,
        target: ts.ScriptTarget.ES2020,
        esModuleInterop: true,
        moduleResolution: ts.ModuleResolutionKind.NodeNext,
      },
      fileName: file,
    });
    fs.writeFileSync(dest, transpiled.outputText, 'utf8');
  }

  // Transpile helper files
  const helpers = ['run-tests.ts', 'assert.ts', 'hash-helpers.ts', 'test-harness.ts', 'propane-test-types.ts'];
  for (const helper of helpers) {
    const srcPath = path.join(testsDir, helper);
    if (!fs.existsSync(srcPath)) continue;
    const destPath = path.join(outDir, helper.replace(/\.ts$/, '.js'));
    ensureDir(path.dirname(destPath));
    const source = fs.readFileSync(srcPath, 'utf8');
    const rewritten = rewriteTestImports(source);
    const transpiled = ts.transpileModule(rewritten, {
      compilerOptions: {
        module: ts.ModuleKind.ESNext,
        target: ts.ScriptTarget.ES2020,
        esModuleInterop: true,
        moduleResolution: ts.ModuleResolutionKind.NodeNext,
      },
      fileName: srcPath,
    });
    fs.writeFileSync(destPath, transpiled.outputText, 'utf8');
  }
}

function rewriteTestImports(content) {
  let result = content.replaceAll('./tmp/', './');
  result = result.replaceAll(/from ['"]\.\/(.+?\.propane)\.ts['"]/g, "from './$1.js'");
  result = result.replaceAll(/from ['"]\.\/(.+?\.propane)\.js['"]/g, "from './$1.js'");
  result = result.replaceAll(/from ['"]\.\.\/runtime\//g, "from '../runtime/");
  result = result.replaceAll(/from ['"]\.\.\/\.\.\/common\//g, "from '../common/");
  result = result.replaceAll(/from ['"]\.\/assert\.ts['"]/g, "from './assert.js'");
  result = result.replaceAll(/from ['"]\.\/hash-helpers\.ts['"]/g, "from './hash-helpers.js'");
  result = result.replaceAll(/from ['"]\.\/test-harness\.ts['"]/g, "from './test-harness.js'");
  result = result.replaceAll(/from ['"](\.\.\/babel\/[^'"]+)['"]/g, "from '$1.js'");
  // generic .ts -> .js for relative imports
  result = result.replaceAll(/(from\s+['"])(\.\.?(?:\/[^'"]+))\.ts(['"])/g, '$1$2.js$3');
  result = result.replaceAll(/(import\(\s*['"])(\.\.?(?:\/[^'"]+))\.ts(['"]\s*\))/g, '$1$2.js$3');
  return result;
}

async function copyCommon() {
  const commonSrc = path.join(projectRoot, 'common');
  const commonDest = path.join(outDir, '..', 'common');
  ensureDir(commonDest);
  ensurePackageTypeModule(commonDest);

  const filesToCopy = [
    ['json', 'parse.ts'],
    ['json', 'stringify.ts'],
    ['map', 'immutable.ts'],
    ['array', 'immutable.ts'],
    ['set', 'immutable.ts'],
    ['data', 'immutable-array-buffer.ts'],
    ['time', 'date.ts'],
    ['web', 'url.ts'],
  ];

  for (const [subdir, file] of filesToCopy) {
    const srcPath = path.join(commonSrc, subdir, file);
    const destPath = path.join(commonDest, subdir, file.replace(/\.ts$/, '.js'));
    ensureDir(path.dirname(destPath));
    const source = fs.readFileSync(srcPath, 'utf8');
    const transpiled = ts.transpileModule(source, {
      compilerOptions: {
        module: ts.ModuleKind.ESNext,
        target: ts.ScriptTarget.ES2020,
        esModuleInterop: true,
        moduleResolution: ts.ModuleResolutionKind.NodeNext,
      },
      fileName: srcPath,
    });
    const rewritten = transpiled.outputText.replaceAll(/\.ts(['"])/g, '.js$1');
    fs.writeFileSync(destPath, rewritten, 'utf8');
  }
}

async function copyRuntime() {
  const runtimeSrc = path.join(projectRoot, 'runtime');
  const runtimeDest = path.join(outDir, '..', 'runtime');
  ensureDir(runtimeDest);
  ensurePackageTypeModule(runtimeDest);

  for (const file of ['index.ts', 'message.ts']) {
    const srcPath = path.join(runtimeSrc, file);
    if (!fs.existsSync(srcPath)) continue;
    const destPath = path.join(runtimeDest, file.replace(/\.ts$/, '.js'));
    const source = fs.readFileSync(srcPath, 'utf8');
    const transpiled = ts.transpileModule(source, {
      compilerOptions: {
        module: ts.ModuleKind.ESNext,
        target: ts.ScriptTarget.ES2020,
        esModuleInterop: true,
        moduleResolution: ts.ModuleResolutionKind.NodeNext,
      },
      fileName: srcPath,
    });
    const rewritten = transpiled.outputText.replaceAll(/\.ts(['"])/g, '.js$1');
    fs.writeFileSync(destPath, rewritten, 'utf8');
  }
}

function findTestFiles(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    if (entry.name.startsWith('.') || entry.name === 'tmp') continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...findTestFiles(full));
    } else if (entry.isFile() && /\.propane\.test\.(t|j)s$/.test(entry.name)) {
      files.push(full);
    }
  }
  return files;
}

function ensureValueExport(outputText, source, filePath) {
  const trimmed = outputText.trim();
  if (trimmed === 'export {};') {
    const nameMatch = source.match(/export\s+type\s+([A-Za-z0-9_]+)/);
    const name = nameMatch ? nameMatch[1] : path.basename(filePath, '.propane');
    return `// Auto-generated value shim for type-only module\nexport const ${name} = Symbol('${name}');\n`;
  }
  return outputText;
}
