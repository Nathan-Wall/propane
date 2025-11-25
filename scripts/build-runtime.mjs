import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const runtimeDir = path.join(projectRoot, 'runtime');
const distDir = path.join(projectRoot, 'dist', 'runtime');
const tsconfigPath = path.join(projectRoot, 'tsconfig.json');

function readTsConfig() {
  const configFile = ts.readConfigFile(tsconfigPath, ts.sys.readFile);
  if (configFile.error) {
    throw new Error(ts.formatDiagnosticsWithColorAndContext(
      [configFile.error],
      {
        getCurrentDirectory: () => projectRoot,
        getCanonicalFileName: (fileName) => fileName,
        getNewLine: () => ts.sys.newLine,
      }
    ));
  }

  const parsed = ts.parseJsonConfigFileContent(
    configFile.config,
    ts.sys,
    projectRoot
  );

  return parsed.options;
}

function collectSourceFiles(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    if (entry.name === 'node_modules' || entry.name === 'dist') {
      continue;
    }

    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...collectSourceFiles(fullPath));
      continue;
    }

    if (entry.isFile() && entry.name.endsWith('.ts')) {
      files.push(fullPath);
    }
  }

  return files;
}

function ensureCleanDist() {
  fs.rmSync(distDir, { recursive: true, force: true });
  fs.mkdirSync(distDir, { recursive: true });
}

function copyPackageJson() {
  const pkgPath = path.join(runtimeDir, 'package.json');
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
  const distPkgPath = path.join(distDir, 'package.json');
  fs.writeFileSync(distPkgPath, JSON.stringify(pkg, null, 2));
}

function formatDiagnostics(diagnostics) {
  return ts.formatDiagnosticsWithColorAndContext(diagnostics, {
    getCanonicalFileName: (fileName) => fileName,
    getCurrentDirectory: () => projectRoot,
    getNewLine: () => ts.sys.newLine,
  });
}

function buildRuntime() {
  ensureCleanDist();

  const baseOptions = readTsConfig();
  const compilerOptions = {
    ...baseOptions,
    rootDir: projectRoot,
    outDir: distDir,
    declaration: true,
    declarationMap: true,
    sourceMap: true,
    composite: false,
    noEmit: false,
    module: ts.ModuleKind.CommonJS,
    target: ts.ScriptTarget.ES2023,
  };

  const sourceFiles = collectSourceFiles(runtimeDir);
  const program = ts.createProgram(sourceFiles, compilerOptions);
  const emitResult = program.emit();
  const diagnostics = [
    ...ts.getPreEmitDiagnostics(program),
    ...emitResult.diagnostics,
  ];

  if (diagnostics.length > 0) {
    console.error(formatDiagnostics(diagnostics));
    process.exitCode = 1;
    return;
  }

  copyPackageJson();
}

buildRuntime();
