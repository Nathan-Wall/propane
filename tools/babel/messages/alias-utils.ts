import * as t from '@babel/types';
import type { NodePath, Scope } from '@babel/traverse';
import type { TypeAliasConfig, TypeAliasKind, TypeAliasMap } from '@/tools/parser/type-aliases.js';

export const COLLECTION_ALIAS_TARGETS = new Set([
  'ImmutableArray',
  'ImmutableMap',
  'ImmutableSet',
]);

function shouldApplyAlias(config: TypeAliasConfig, applyKind: TypeAliasKind | 'all'): boolean {
  if (applyKind === 'all') return true;
  return config.kind === applyKind;
}

export function getAliasTargets(
  aliases: TypeAliasMap,
  applyKind: TypeAliasKind | 'all' = 'message'
): Set<string> {
  const targets = new Set<string>();
  for (const config of Object.values(aliases)) {
    if (!shouldApplyAlias(config, applyKind)) continue;
    targets.add(config.target);
  }
  return targets;
}

export function getAliasSourcesForTarget(
  target: string,
  aliases: TypeAliasMap,
  scope?: Scope | null,
  applyKind: TypeAliasKind | 'all' = 'message'
): string[] {
  const sources: string[] = [];
  for (const [alias, config] of Object.entries(aliases)) {
    if (config.target !== target) continue;
    if (!shouldApplyAlias(config, applyKind)) continue;
    if (scope?.getBinding(alias)) continue;
    sources.push(alias);
  }
  return sources;
}

export function getAliasImportFrom(
  target: string,
  aliases: TypeAliasMap
): string | null {
  for (const config of Object.values(aliases)) {
    if (config.target === target) {
      return config.importFrom;
    }
  }
  return null;
}

export function resolveAliasConfigForName(
  name: string,
  aliases: TypeAliasMap,
  scope?: Scope | null
): TypeAliasConfig | null {
  const config = aliases[name];
  if (!config) return null;
  if (scope?.getBinding(name)) {
    return null;
  }
  return config;
}

export function resolveAliasForTypeReference(
  typeRef: t.TSTypeReference | NodePath<t.TSTypeReference>,
  aliases: TypeAliasMap,
  scope?: Scope | null
): TypeAliasConfig | null {
  const node = 'node' in typeRef ? typeRef.node : typeRef;
  if (!t.isIdentifier(node.typeName)) {
    return null;
  }
  const resolvedScope = scope ?? ('scope' in typeRef ? typeRef.scope : null);
  return resolveAliasConfigForName(node.typeName.name, aliases, resolvedScope);
}

export function resolveAliasTargetName(
  typeRef: t.TSTypeReference | NodePath<t.TSTypeReference>,
  aliases: TypeAliasMap,
  scope?: Scope | null,
  applyKind: TypeAliasKind | 'all' = 'message'
): string | null {
  const config = resolveAliasForTypeReference(typeRef, aliases, scope);
  if (!config || !shouldApplyAlias(config, applyKind)) {
    return null;
  }
  return config.target;
}

export function resolveAliasTypeNode(
  node: t.TSType,
  aliases: TypeAliasMap,
  scope?: Scope | null,
  applyKind: TypeAliasKind | 'all' = 'message'
): t.TSType {
  if (t.isTSParenthesizedType(node)) {
    return t.tsParenthesizedType(
      resolveAliasTypeNode(node.typeAnnotation, aliases, scope, applyKind)
    );
  }

  if (t.isTSUnionType(node)) {
    return t.tsUnionType(
      node.types.map(member =>
        resolveAliasTypeNode(member, aliases, scope, applyKind)
      )
    );
  }

  if (t.isTSArrayType(node)) {
    const alias = resolveAliasConfigForName('Array', aliases, scope);
    const element = resolveAliasTypeNode(
      node.elementType,
      aliases,
      scope,
      applyKind
    );
    if (alias && shouldApplyAlias(alias, applyKind)) {
      return t.tsTypeReference(
        t.identifier(alias.target),
        t.tsTypeParameterInstantiation([element])
      );
    }
    return t.tsArrayType(element);
  }

  if (t.isTSTypeReference(node)) {
    const typeParams = node.typeParameters?.params ?? [];
    const resolvedParams = typeParams.map(param =>
      resolveAliasTypeNode(param, aliases, scope, applyKind)
    );

    if (t.isIdentifier(node.typeName)) {
      const alias = resolveAliasConfigForName(
        node.typeName.name,
        aliases,
        scope
      );
      if (alias && shouldApplyAlias(alias, applyKind)) {
        return t.tsTypeReference(
          t.identifier(alias.target),
          resolvedParams.length > 0
            ? t.tsTypeParameterInstantiation(resolvedParams)
            : undefined
        );
      }
    }

    return t.tsTypeReference(
      t.cloneNode(node.typeName),
      resolvedParams.length > 0
        ? t.tsTypeParameterInstantiation(resolvedParams)
        : undefined
    );
  }

  return node;
}
