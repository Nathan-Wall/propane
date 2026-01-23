import * as t from '@babel/types';
import type { NodePath } from '@babel/traverse';
import {
  analyzePropaneModule,
  getFilename,
  getImportedName,
  resolveImportPath,
} from './imports.js';

export type MessageReferenceResolver = (
  typePath: NodePath<t.TSType>
) => string | null;

export function createMessageReferenceResolver(
  declaredMessageTypeNames: Set<string>
): MessageReferenceResolver {
  const messageModuleCache = new Map<string, Set<string>>();
  const builtinMessageNames = new Set([
    'Decimal',
    'Rational',
    'ImmutableDate',
    'ImmutableUrl',
    'ImmutableArrayBuffer',
  ]);

  return function getMessageReferenceName(
    typePath: NodePath<t.TSType>
  ): string | null {
    if (!typePath?.isTSTypeReference()) {
      return null;
    }

    const typeName = typePath.node.typeName;
    if (!t.isIdentifier(typeName)) {
      return null;
    }

    const name = typeName.name;

    if (name === 'Date') {
      return 'ImmutableDate';
    }

    if (name === 'URL') {
      return 'ImmutableUrl';
    }

    if (name === 'ArrayBuffer') {
      return 'ImmutableArrayBuffer';
    }

    if (declaredMessageTypeNames.has(name)) {
      return name;
    }

    if (builtinMessageNames.has(name)) {
      return name;
    }

    const binding = typePath.scope.getBinding(name);

    if (
      binding
      && (
        binding.path.isImportSpecifier()
        || binding.path.isImportDefaultSpecifier()
      )
      && binding.path.parentPath?.isImportDeclaration()
    ) {
      const importSource = binding.path.parentPath.node.source.value;
      const filename = getFilename(typePath);
      const resolved = resolveImportPath(importSource, filename);

      if (!resolved) {
        return null;
      }

      if (!messageModuleCache.has(resolved)) {
        messageModuleCache.set(resolved, analyzePropaneModule(resolved));
      }

      const exportNames = messageModuleCache.get(resolved);
      const importedName = getImportedName(binding.path);

      if (exportNames && importedName && exportNames.has(importedName)) {
        return binding.identifier.name;
      }
    }

    return null;
  };
}
