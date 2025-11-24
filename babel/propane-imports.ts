import fs from 'node:fs';
import path from 'node:path';
import { parse } from '@babel/parser';
import * as t from '@babel/types';
import type { NodePath } from '@babel/traverse';

export function resolveImportPath(importSource: unknown, filename: string | null): string | null {
  if (!filename || typeof importSource !== 'string' || !importSource.startsWith('.')) {
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
      if (
        node.type === 'ExportNamedDeclaration'
        && node.declaration
        && node.declaration.type === 'TSTypeAliasDeclaration'
        && node.declaration.id
        && node.declaration.id.type === 'Identifier'
        && node.declaration.typeAnnotation
        && node.declaration.typeAnnotation.type === 'TSTypeLiteral'
      ) {
        names.add(node.declaration.id.name);
      }
    }

    return names;
  } catch {
    return new Set();
  }
}

export function getImportedName(
  importPath: NodePath<t.ImportSpecifier | t.ImportDefaultSpecifier | t.ImportNamespaceSpecifier>
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

export function getFilename(typePath: NodePath<t.Node>): string | null {
  const file = typePath.hub && typePath.hub.file;
  const opts = file && file.opts;
  return (opts && opts.filename) || null;
}
