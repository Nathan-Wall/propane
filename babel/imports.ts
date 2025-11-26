import fs from 'node:fs';
import path from 'node:path';
import { parse } from '@babel/parser';
import * as t from '@babel/types';
import type { NodePath } from '@babel/traverse';

export function resolveImportPath(
  importSource: unknown,
  filename: string | null
): string | null {
  if (
    !filename
    || typeof importSource !== 'string'
    || !importSource.startsWith('.')
  ) {
    return null;
  }

  const dir = path.dirname(filename);
  const basePath = path.resolve(dir, importSource);

  const candidates = [
    basePath,
    `${basePath}.propane`,
  ];

  for (const candidate of candidates) {
    if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) {
      return candidate;
    }
  }

  return null;
}

export function analyzePropaneModule(filename: string): Set<string> {
  try {
    const source = fs.readFileSync(filename, 'utf8');
    const ast = parse(source, {
      sourceType: 'module',
      plugins: ['typescript'],
    });

    const names = new Set<string>();

    for (const node of ast.program.body) {
      if (node.type !== 'ExportNamedDeclaration') {
        continue;
      }

      const declaration = node.declaration;
      if (
        declaration?.type === 'TSTypeAliasDeclaration'
        && declaration.id?.type === 'Identifier'
        && declaration.typeAnnotation?.type === 'TSTypeLiteral'
      ) {
        names.add(declaration.id.name);
      }
    }

    return names;
  } catch {
    return new Set();
  }
}

export function getImportedName(
  importPath: NodePath<
    t.ImportSpecifier | t.ImportDefaultSpecifier | t.ImportNamespaceSpecifier
  >
): string | null {
  if (importPath.isImportSpecifier()) {
    const imported = importPath.node.imported;
    if (t.isIdentifier(imported)) {
      return imported.name;
    }
    if (t.isStringLiteral(imported)) {
      return imported.value;
    }
    return null;
  }

  if (importPath.isImportDefaultSpecifier()) {
    return 'default';
  }

  return null;
}

/* eslint-disable @typescript-eslint/no-explicit-any */
export function getFilename(nodePath: NodePath<t.Node>): string | null {
  const typePath = (nodePath as any).findParent(
    (p: any) => p.isTSTypeAliasDeclaration()
  );
  if (!typePath) return null;
  return typePath.hub?.file?.opts?.filename ?? null;
}