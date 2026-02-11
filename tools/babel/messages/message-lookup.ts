import * as t from '@babel/types';
import type { NodePath } from '@babel/traverse';
import {
  analyzePropaneModule,
  getFilename,
  getImportedName,
  resolveImportPath,
} from './imports.js';
import type { TypeAliasMap } from '@/tools/parser/type-aliases.js';
import { normalizeTypeAliases } from '@/tools/parser/type-aliases.js';
import { COLLECTION_ALIAS_TARGETS, getAliasTargets, resolveAliasConfigForName } from './alias-utils.js';

export type MessageReferenceResolver = (
  typePath: NodePath<t.TSType>
) => string | null;

export function createMessageReferenceResolver(
  declaredMessageTypeNames: Set<string>,
  typeAliases?: TypeAliasMap
): MessageReferenceResolver {
  const messageModuleCache = new Map<string, Set<string>>();
  const aliases = normalizeTypeAliases(typeAliases).aliases;
  const aliasMessageTargets = getAliasTargets(aliases, 'message');
  for (const target of COLLECTION_ALIAS_TARGETS) {
    aliasMessageTargets.delete(target);
  }
  const builtinMessageNames = new Set([
    'Decimal',
    'Rational',
    ...aliasMessageTargets,
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

    const alias = resolveAliasConfigForName(name, aliases, typePath.scope);
    if (alias?.kind === 'message' && !COLLECTION_ALIAS_TARGETS.has(alias.target)) {
      return alias.target;
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
