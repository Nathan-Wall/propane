import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { transformSync } from '@babel/core';
import ts from 'typescript';
import propanePlugin from '../babel/propane-plugin.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const testsDir = path.join(projectRoot, 'tests');
const outDir = path.join(projectRoot, 'build', 'tests');

await cleanOutput();
await buildAll();
await copyTests();

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
  // Replace import from '@propanejs/runtime' with relative path to runtime/index.ts
  const runtimePath = path.relative(path.dirname(outPath), path.join(projectRoot, 'runtime', 'index.ts'));
  const normalized = runtimePath.startsWith('.') ? runtimePath : `./${runtimePath}`;
  let result = code.replace(/@propanejs\/runtime/g, normalized.replace(/\\/g, '/'));

  // Rewrite relative .propane imports to point at built JS artifacts
  result = result.replace(/\.propane(['"])/g, '.propane.js$1');

  // Remove runtime-only type imports
  result = result.replace(/,?\s*MessagePropDescriptor/g, '');
  result = result.replace(/^import\s*\{\s*Brand\s*\}\s*from[^;]+;\n?/m, '');

  // Append .ts to relative imports without an explicit extension (excluding the .propane.js ones we just set)
  result = result.replace(/(from\s+['"])(\.{1,2}\/[^'".][^'"]*)(['"])/g, (match, p1, p2, p3) => {
    if (/\.js$|\.ts$|\.json$/.test(p2) || p2.endsWith('.propane.js')) {
      return match;
    }
    return `${p1}${p2}.ts${p3}`;
  });

  // Fix path for shared common/types in build/tests output
  result = result.replace(/from ['"]\.\.\/common\/types\/brand\.ts['"]/g, "from '../../common/types/brand.ts'");
  return result;
}

async function copyTests() {
  const testFiles = findTestFiles(testsDir);
  for (const file of testFiles) {
    const rel = path.relative(testsDir, file);
    const dest = path.join(outDir, rel);
    ensureDir(path.dirname(dest));
    let content = fs.readFileSync(file, 'utf8');

    // Strip tmp prefixes introduced earlier
    content = content.replace(/\.\/tmp\//g, './');
    // Ensure we import compiled artifacts next to mirrored tests
    content = content.replace(/from ['"]\.\/(.+?\.propane)\.js['"]/g, "from './$1.js'");
    content = content.replace(/from ['"]\.\/(.+?\.propane)\.ts['"]/g, "from './$1.js'");
    // Fix runtime relative path when mirrored into build/tests (./build/tests/* -> ../../runtime)
    content = content.replace(/from ['"]\.\.\/runtime\//g, "from '../../runtime/");
    // Fix assert path
    content = content.replace(/from ['"]\.\/assert\.ts['"]/g, "from './assert.ts'");

    fs.writeFileSync(dest, content, 'utf8');
  }

  // copy loaders / runner
  for (const helper of ['run-tests.ts', 'ts-loader.mjs', 'assert.ts']) {
    fs.copyFileSync(path.join(testsDir, helper), path.join(outDir, helper));
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
