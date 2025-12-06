import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { transformSync } from '@babel/core';
import ts from 'typescript';
import propanePlugin from '@/tools/babel/messages/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// When running from build/scripts/, go up two levels to reach project root
const projectRoot = path.resolve(__dirname, '../..');
const testsDir = path.join(projectRoot, 'tests');
const outDir = path.join(projectRoot, 'build', 'tests');

// Additional directories containing .pmsg files and tests that need compilation
const additionalTestDirs = [
  { src: path.join(projectRoot, 'pms-server/tests'), out: path.join(projectRoot, 'build/pms-server/tests') },
];

interface PropaneConfig {
  runtimeImportPath?: string;
}

// Load propane config for runtimeImportPath
function loadPropaneConfig(): PropaneConfig {
  const configPath = path.join(projectRoot, 'propane.config.json');
  if (fs.existsSync(configPath)) {
    try {
      return JSON.parse(fs.readFileSync(configPath, 'utf8')) as PropaneConfig;
    } catch {
      return {};
    }
  }
  return {};
}

const propaneConfig = loadPropaneConfig();

cleanOutput();
buildAll();
buildAdditionalTestDirs();
copyTests();

function buildAll(): void {
  const files = findPropaneFiles(testsDir);
  ensureDir(outDir);
  ensurePackageTypeModule(outDir);

  const failPattern = /(?:^|[.-])fail.pmsg$/i;

  for (const file of files) {
    if (failPattern.test(path.basename(file))) {
      continue; // fixtures expected to fail compile
    }
    const rel = path.relative(testsDir, file); // e.g., index-hole.pmsg
    const outPath = path.join(outDir, `${rel}.js`); // keep .pmsg in name for clarity
    ensureDir(path.dirname(outPath));
    const source = fs.readFileSync(file, 'utf8');
    const pluginOptions: Record<string, unknown> = {};
    if (propaneConfig.runtimeImportPath) {
      pluginOptions['runtimeImportPath'] = propaneConfig.runtimeImportPath;
      pluginOptions['runtimeImportBase'] = projectRoot;
    }
    const result = transformSync(source, {
      filename: file,
      parserOpts: { sourceType: 'module', plugins: ['typescript'] },
      plugins: [[propanePlugin, pluginOptions]],
    });

    const rewritten = rewriteImports(result?.code ?? '');
    const transpiled = ts.transpileModule(rewritten, {
      compilerOptions: {
        module: ts.ModuleKind.ESNext,
        target: ts.ScriptTarget.ES2020,
        esModuleInterop: true,
        moduleResolution: ts.ModuleResolutionKind.NodeNext,
      },
      fileName: outPath.replace(/\.js$/, '.ts'),
    });
    const finalized = ensureValueExport(transpiled.outputText, source, file);

    fs.writeFileSync(outPath, finalized, 'utf8');
  }
}

function buildAdditionalTestDirs(): void {
  for (const { src, out } of additionalTestDirs) {
    if (!fs.existsSync(src)) continue;

    ensureDir(out);

    // Compile .pmsg files
    const pmsgFiles = findPropaneFiles(src);
    const failPattern = /(?:^|[.-])fail.pmsg$/i;

    for (const file of pmsgFiles) {
      if (failPattern.test(path.basename(file))) {
        continue;
      }
      const rel = path.relative(src, file);
      const outPath = path.join(out, `${rel}.js`);
      ensureDir(path.dirname(outPath));
      const source = fs.readFileSync(file, 'utf8');
      const pluginOptions: Record<string, unknown> = {};
      if (propaneConfig.runtimeImportPath) {
        pluginOptions['runtimeImportPath'] = propaneConfig.runtimeImportPath;
        pluginOptions['runtimeImportBase'] = projectRoot;
      }
      const result = transformSync(source, {
        filename: file,
        parserOpts: { sourceType: 'module', plugins: ['typescript'] },
        plugins: [[propanePlugin, pluginOptions]],
      });

      // Rewrite imports for additional test directories
      let rewritten = result?.code ?? '';
      // Rewrite relative .pmsg imports
      rewritten = rewritten.replaceAll(/\.pmsg(['"])/g, '.pmsg.js$1');
      // Handle @/ imports - convert to relative paths for build/pms-server/tests/
      rewritten = rewritten.replaceAll('@/runtime/index.js', '../../runtime/index.js');
      rewritten = rewritten.replaceAll('@/pms-core/src/index.js', '../../pms-core/src/index.js');

      const transpiled = ts.transpileModule(rewritten, {
        compilerOptions: {
          module: ts.ModuleKind.ESNext,
          target: ts.ScriptTarget.ES2020,
          esModuleInterop: true,
          moduleResolution: ts.ModuleResolutionKind.NodeNext,
        },
        fileName: outPath.replace(/\.js$/, '.ts'),
      });
      const finalized = ensureValueExport(transpiled.outputText, source, file);

      fs.writeFileSync(outPath, finalized, 'utf8');
    }

    // Compile .test.ts files
    const testFiles = findTestFilesInDir(src);
    for (const file of testFiles) {
      const rel = path.relative(src, file);
      const dest = path.join(out, rel.replace(/\.ts$/, '.js'));
      ensureDir(path.dirname(dest));
      const source = fs.readFileSync(file, 'utf8');
      const rewritten = rewriteAdditionalTestImports(source);
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
  }
}

function findTestFilesInDir(dir: string): string[] {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files: string[] = [];
  for (const entry of entries) {
    if (entry.name.startsWith('.')) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...findTestFilesInDir(full));
    } else if (entry.isFile() && /\.test\.(t|j)s$/.test(entry.name)) {
      files.push(full);
    }
  }
  return files;
}

function rewriteAdditionalTestImports(content: string): string {
  let result = content;

  // Rewrite .pmsg imports to .pmsg.js
  result = result.replaceAll(/from ['"](\.\/[^'"]+)\.pmsg['"]/g, "from '$1.pmsg.js'");

  // Rewrite @/* root imports to relative paths for build/pms-server/tests/
  result = result.replaceAll('@/pms-server/src/index.js', '../../pms-server/src/index.js');
  result = result.replaceAll('@/pms-client/src/index.js', '../../pms-client/src/index.js');
  result = result.replaceAll('@/runtime/index.js', '../../runtime/index.js');
  result = result.replaceAll('@/pms-core/src/index.js', '../../pms-core/src/index.js');

  // generic .ts -> .js for relative imports
  result = result.replaceAll(/(from\s+['"])(\.\.?(?:\/[^'"]+))\.ts(['"])/g, '$1$2.js$3');

  return result;
}

function findPropaneFiles(dir: string): string[] {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const found: string[] = [];
  for (const entry of entries) {
    if (entry.name.startsWith('.')) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      found.push(...findPropaneFiles(full));
    } else if (entry.isFile() && entry.name.endsWith('.pmsg')) {
      found.push(full);
    }
  }
  return found;
}

function cleanOutput(): void {
  if (fs.existsSync(outDir)) {
    fs.rmSync(outDir, { recursive: true, force: true });
  }
}

function ensureDir(dir: string): void {
  fs.mkdirSync(dir, { recursive: true });
}

function ensurePackageTypeModule(dir: string): void {
  const pkgPath = path.join(dir, 'package.json');
  if (fs.existsSync(pkgPath)) return;
  fs.writeFileSync(pkgPath, JSON.stringify({ type: 'module' }, null, 2));
}

function rewriteImports(code: string): string {
  let result = code;
  // Rewrite relative .pmsg imports to point at built JS artifacts
  result = result.replaceAll(/\.pmsg(['"])/g, '.pmsg.js$1');

  // Remove runtime-only type imports (MessagePropDescriptor) from imports
  // This regex targets: import { ..., MessagePropDescriptor, ... } from ...
  const importRegex = /\bimport\s*\{([^}]*)\}\s*from/g;
  result = result.replaceAll(importRegex, (match, imports: string) => {
    const cleanedImports = imports
      .replaceAll(/,?\s*MessagePropDescriptor/g, '')
      .replace(/^\s*,/, '')
      .trim();
    return `import { ${cleanedImports} } from`;
  });
  result = result.replace(/^import\s*{\s*Brand\s*}\s*from[^;]+;\n?/m, '');

  // Append .js to relative imports without an explicit extension
  // (excluding the .pmsg.js ones we just set)
  result = result.replaceAll(
    /(from\s+['"])(\.\.{1,2}\/[^'"][^'"]*)(['"])/g,
    (match, p1: string, p2: string, p3: string) => {
      if (/\.js$|\.ts$|\.json$/.test(p2) || p2.endsWith('.pmsg.js')) {
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

  // Rewrite @/ imports to relative paths for build/tests/
  result = result.replaceAll('@/runtime/index.js', '../runtime/index.js');
  result = result.replaceAll('@/pms-core/src/index.js', '../pms-core/src/index.js');

  // Regex backup - only rewrite ../../common (2+ levels) not ../common (1 level)
  // ../common/ refers to build/common/ (standalone utilities like levenshtein)
  // ../../common/ refers to runtime/common/ (runtime utilities)
  result = result.replaceAll(/from\s+(['"])(?:\.\.\/)+runtime\//g, "from $1../runtime/");
  result = result.replaceAll(/from\s+(['"])(?:\.\.\/){2,}common\//g, "from $1../runtime/common/");

  return result;
}

function copyTests(): void {
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

  // Transpile extension files (*.ext.ts) used by @extend decorator
  const extFiles = findExtensionFiles(testsDir);
  for (const file of extFiles) {
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
}

function rewriteTestImports(content: string): string {
  let result = content.replaceAll('./tmp/', './');
  result = result.replaceAll(/from ['"]\.\/(.+?\.pmsg)\.ts['"]/g, "from './$1.js'");
  result = result.replaceAll(/from ['"]\.\/(.+?\.pmsg)\.js['"]/g, "from './$1.js'");

  // Fix relative paths for build/ structure
  // Explicitly handle the pattern seen in tests using string replacement
  // Handle case without trailing slash just in case
  result = result.split('../../runtime').join('../runtime');
  result = result.split('../../common').join('../runtime/common');

  // Handle react imports - ../react/ from tests/ becomes ../react/ from build/tests/
  result = result.split('../react/index.ts').join('../react/index.js');
  result = result.split('../react/').join('../react/');

  // Rewrite @/ imports to relative paths for build/tests/
  result = result.replaceAll('@/runtime/index.js', '../runtime/index.js');
  result = result.replaceAll('@/pms-core/src/index.js', '../pms-core/src/index.js');
  result = result.replaceAll('@/tools/babel/messages/index.js', '../tools/babel/messages/index.js');

  // Regex backup - only rewrite ../../common (2+ levels) not ../common (1 level)
  // ../common/ refers to build/common/ (standalone utilities like levenshtein)
  // ../../common/ refers to runtime/common/ (runtime utilities)
  result = result.replaceAll(/from\s+(['"])(?:\.\.\/)+runtime\//g, "from $1../runtime/");
  result = result.replaceAll(/from\s+(['"])(?:\.\.\/){2,}common\//g, "from $1../runtime/common/");

  result = result.replaceAll(/from ['"]\.\/assert\.ts['"]/g, "from './assert.js'");
  result = result.replaceAll(/from ['"]\.\/hash-helpers\.ts['"]/g, "from './hash-helpers.js'");
  result = result.replaceAll(/from ['"]\.\/test-harness\.ts['"]/g, "from './test-harness.js'");
  // Only add .js if not already present
  result = result.replaceAll(
    /from ['"](\.\.\/tools\/babel\/messages\/[^'"]+)(?<!\.js)['"]/g,
    "from '$1.js'"
  );

  // generic .ts -> .js for relative imports
  result = result.replaceAll(/(from\s+['"])(\.\.?(?:\/[^'"]+))\.ts(['"])/g, '$1$2.js$3');
  result = result.replaceAll(/(import\(\s*['"])(\.\.?(?:\/[^'"]+))\.ts(['"]\s*\))/g, '$1$2.js$3');
  return result;
}

function findTestFiles(dir: string): string[] {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files: string[] = [];
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

function findExtensionFiles(dir: string): string[] {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files: string[] = [];
  for (const entry of entries) {
    if (entry.name.startsWith('.') || entry.name === 'tmp') continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...findExtensionFiles(full));
    } else if (entry.isFile() && entry.name.endsWith('.ext.ts')) {
      files.push(full);
    }
  }
  return files;
}

function ensureValueExport(
  outputText: string,
  source: string,
  filePath: string
): string {
  const trimmed = outputText.trim();
  if (trimmed === 'export {};') {
    const nameMatch = /export\s+type\s+([A-Za-z0-9_]+)/.exec(source);
    const name = nameMatch ? nameMatch[1] : path.basename(filePath, '.pmsg');
    const sym = `Symbol('${name}')`;
    return `// Auto-generated value shim for type-only module\nexport const ${name} = ${sym};\n`;
  }
  return outputText;
}
