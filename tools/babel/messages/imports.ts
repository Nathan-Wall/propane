import fs from 'node:fs';
import path from 'node:path';
import { parse } from '@babel/parser';
import * as t from '@babel/types';
import type { NodePath } from '@babel/traverse';
import { findParentTypeAlias, getSourceFilename } from './babel-helpers.js';

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
    `${basePath}.pmsg`,
  ];

  for (const candidate of candidates) {
    if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) {
      return candidate;
    }
  }

  return null;
}

/**
 * Check if a type annotation represents a message type.
 * This includes:
 * - Raw object literal types: `type Foo = { ... }`
 * - Message/Table wrapped types: `type Foo = Message<{ ... }>`
 */
function isMessageTypeAnnotation(typeAnnotation: t.TSType): boolean {
  // Raw object literal type
  if (typeAnnotation.type === 'TSTypeLiteral') {
    return true;
  }

  // Message<{...}> or Table<{...}> wrapper
  if (
    typeAnnotation.type === 'TSTypeReference'
    && typeAnnotation.typeName.type === 'Identifier'
    && (typeAnnotation.typeName.name === 'Message'
      || typeAnnotation.typeName.name === 'Table')
    && typeAnnotation.typeParameters?.params?.[0]?.type === 'TSTypeLiteral'
  ) {
    return true;
  }

  return false;
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
        && isMessageTypeAnnotation(declaration.typeAnnotation)
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

export function getFilename(nodePath: NodePath<t.Node>): string | null {
  const typePath = findParentTypeAlias(nodePath);
  if (!typePath) return null;
  return getSourceFilename(typePath) || null;
}
