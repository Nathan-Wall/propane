import fs from 'node:fs/promises';
import path from 'node:path';
import ts from 'typescript';

const babelDir = path.resolve('babel');
const outDir = path.resolve('build', 'babel');

const compilerOptions = {
  module: ts.ModuleKind.ESNext,
  target: ts.ScriptTarget.ES2023,
  moduleResolution: ts.ModuleResolutionKind.NodeNext,
  esModuleInterop: true,
  allowSyntheticDefaultImports: true,
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
    .replace(fromPattern, replacer)
    .replace(exportPattern, replacer)
    .replace(dynamicImportPattern, replacer);
}

async function buildFile(tsPath) {
  const source = await fs.readFile(tsPath, 'utf8');
  const { outputText } = ts.transpileModule(source, {
    compilerOptions,
    fileName: tsPath,
  });
  const rewritten = rewriteSpecifiers(outputText);
  const outPath = path.join(outDir, `${path.basename(tsPath, '.ts')}.js`);
  await fs.mkdir(path.dirname(outPath), { recursive: true });
  await fs.writeFile(outPath, rewritten);
}

async function main() {
  await fs.rm(outDir, { recursive: true, force: true });
  await fs.mkdir(outDir, { recursive: true });
  const entries = await fs.readdir(babelDir);
  const tasks = entries
    .filter((file) => file.endsWith('.ts'))
    .map((file) => buildFile(path.join(babelDir, file)));
  await Promise.all(tasks);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
