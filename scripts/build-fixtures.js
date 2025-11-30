import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { transformSync } from '@babel/core';
import ts from 'typescript';
import propanePlugin from '@propanejs/babel-messages';

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

  const failPattern = /(?:^|[.-])fail.propane$/i;

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

    const rewritten = rewriteImports(code);
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

async function buildReact() {
  const reactDir = path.join(projectRoot, 'react');
  const reactOutDir = path.join(projectRoot, 'build', 'react');
  ensureDir(reactOutDir);

  const srcPath = path.join(reactDir, 'index.ts');
  const destPath = path.join(reactOutDir, 'index.js');

  const source = fs.readFileSync(srcPath, 'utf8');

  // Rewrite imports
  let rewritten = source;
  rewritten = rewritten.replaceAll('@propanejs/runtime', '../runtime/index.js');

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

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function ensurePackageTypeModule(dir) {
  const pkgPath = path.join(dir, 'package.json');
  if (fs.existsSync(pkgPath)) return;
  fs.writeFileSync(pkgPath, JSON.stringify({ type: 'module' }, null, 2));
}

function rewriteImports(code) {
  let result = code;
  // Rewrite relative .propane imports to point at built JS artifacts
  result = result.replaceAll(/\.propane(['"])/g, '.propane.js$1');

  // Remove runtime-only type imports
  result = result.replaceAll(/,?\s*MessagePropDescriptor/g, '');
  result = result.replace(/^import\s*{\s*Brand\s*}\s*from[^;]+;\n?/m, '');

  // Append .js to relative imports without an explicit extension
  // (excluding the .propane.js ones we just set)
  result = result.replaceAll(
    /(from\s+['"])(\.\.{1,2}\/[^'"][^'"]*)(['"])/g,
    (match, p1, p2, p3) => {
      if (/\.js$|\.ts$|\.json$/.test(p2) || p2.endsWith('.propane.js')) {
        return match;
      }
      return `${p1}${p2}.js${p3}`;
    }
  );
  
  // Fix relative paths for build/ structure
  // Source: tests/file.ts imports ../runtime/...
  // Build: build/tests/file.js imports ../runtime/...
  // If source uses ../../runtime, we need to fix it or understand why.
  // Let's assume source uses ../../runtime (legacy artifact?).
  // We want ../runtime/ in build.
  
  // Fix relative paths for build/ structure
  // Explicitly handle the pattern seen in tests using string replacement
  // Handle case without trailing slash just in case
  result = result.split('../../runtime').join('../runtime');
  result = result.split('../../common').join('../runtime/common');
  
  // Regex backup
  result = result.replaceAll(/from\s+(['"])(?:\.\.\/)+runtime\//g, "from $1../runtime/");
  result = result.replaceAll(/from\s+(['"])(?:\.\.\/)+common\//g, "from $1../runtime/common/");
  
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

  // Transpile helper files (non-test utilities)
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

  // Fix relative paths for build/ structure
  // Explicitly handle the pattern seen in tests using string replacement
  // Handle case without trailing slash just in case
  result = result.split('../../runtime').join('../runtime');
  result = result.split('../../common').join('../runtime/common');

  // Handle react imports - ../react/ from tests/ becomes ../react/ from build/tests/
  result = result.split('../react/index.ts').join('../react/index.js');
  result = result.split('../react/').join('../react/');

  // Regex backup
  result = result.replaceAll(/from\s+(['"])(?:\.\.\/)+runtime\//g, "from $1../runtime/");
  result = result.replaceAll(/from\s+(['"])(?:\.\.\/)+common\//g, "from $1../runtime/common/");

  result = result.replaceAll(/from ['"]\.\/assert\.ts['"]/g, "from './assert.js'");
  result = result.replaceAll(/from ['"]\.\/hash-helpers\.ts['"]/g, "from './hash-helpers.js'");
  result = result.replaceAll(/from ['"]\.\/test-harness\.ts['"]/g, "from './test-harness.js'");
  result = result.replaceAll(/from ['"](\.\.\/tools\/babel\/messages\/[^'"]+)['"]/g, "from '$1.js'");

  // generic .ts -> .js for relative imports
  result = result.replaceAll(/(from\s+['"])(\.\.?(?:\/[^'"]+))\.ts(['"])/g, '$1$2.js$3');
  result = result.replaceAll(/(import\(\s*['"])(\.\.?(?:\/[^'"]+))\.ts(['"]\s*\))/g, '$1$2.js$3');
  return result;
}

function findTestFiles(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    if (entry.name.startsWith('.') || entry.name === 'tmp') continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...findTestFiles(full));
    } else if (entry.isFile() && /\.test\.(t|j)s$/.test(entry.name)) {
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
