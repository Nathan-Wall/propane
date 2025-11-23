import fs from 'node:fs/promises';
import ts from 'typescript';

const compilerOptions = {
  module: ts.ModuleKind.ESNext,
  target: ts.ScriptTarget.ES2020,
  esModuleInterop: true,
  moduleResolution: ts.ModuleResolutionKind.NodeNext,
  allowSyntheticDefaultImports: true,
};

export async function load(url, context, defaultLoad) {
  if (!url.endsWith('.ts') && !url.endsWith('.tsx')) {
    return defaultLoad(url, context, defaultLoad);
  }

  const fileUrl = new URL(url);
  const source = await fs.readFile(fileUrl, 'utf8');
  const { outputText } = ts.transpileModule(source, {
    compilerOptions,
    fileName: fileUrl.pathname,
  });

  return {
    format: 'module',
    source: outputText,
    shortCircuit: true,
  };
}
