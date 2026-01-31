import * as t from '@babel/types';
import type { NodePath } from '@babel/traverse';
import {
  isBrandReference,
  isMapReference,
  isPrimitiveKeyword,
  isPrimitiveLiteral,
  isSetReference,
  resolveQualifiedRoot,
} from './type-guards.js';
import type { TypeAliasMap } from '@/tools/parser/type-aliases.js';
import { getAliasTargets, resolveAliasTargetName } from './alias-utils.js';

function isGenericTypeReference(
  typePath: NodePath<t.TSType>,
  typeParamNames?: Set<string>
): boolean {
  if (!typeParamNames || typeParamNames.size === 0) {
    return false;
  }
  if (!typePath.isTSTypeReference()) {
    return false;
  }
  const typeName = typePath.node.typeName;
  return t.isIdentifier(typeName) && typeParamNames.has(typeName.name);
}

export function assertSupportedMapType(
  typePath: NodePath<t.TSTypeReference>,
  declaredTypeNames: Set<string>,
  typeParamNames?: Set<string>,
  typeAliases?: TypeAliasMap
): void {
  const typeParametersPath = typePath.get('typeParameters');
  if (typeParametersPath?.node?.params.length !== 2) {
    throw typePath.buildCodeFrameError(
      'Propane Map types must specify both key and value types.'
    );
  }

  const [keyTypePath, valueTypePath] = typeParametersPath.get('params');
  assertSupportedMapKeyType(keyTypePath!, declaredTypeNames, typeParamNames, typeAliases);
  assertSupportedType(valueTypePath!, declaredTypeNames, typeParamNames, typeAliases);
}

export function assertSupportedSetType(
  typePath: NodePath<t.TSTypeReference>,
  declaredTypeNames: Set<string>,
  typeParamNames?: Set<string>,
  typeAliases?: TypeAliasMap
): void {
  const typeNode = typePath.node;

  if (!t.isTSTypeReference(typeNode)) {
    throw typePath.buildCodeFrameError('Invalid Set type.');
  }

  const typeParams = typeNode.typeParameters;
  if (typeParams?.params.length !== 1) {
    throw typePath.buildCodeFrameError(
      'Propane Set types must specify a single element type, '
      + 'e.g. Set<string>.'
    );
  }

  const elementPath = typePath.get('typeParameters').get('params')[0]!;
  assertSupportedType(elementPath, declaredTypeNames, typeParamNames, typeAliases);
}

export function assertSupportedMapKeyType(
  typePath: NodePath<t.TSType>,
  declaredTypeNames: Set<string>,
  typeParamNames?: Set<string>,
  typeAliases?: TypeAliasMap
): void {
  if (!typePath?.node) {
    throw typePath.buildCodeFrameError('Missing Map key type.');
  }

  if (isGenericTypeReference(typePath, typeParamNames)) {
    return;
  }

  if (typePath.isTSParenthesizedType()) {
    assertSupportedMapKeyType(
      typePath.get('typeAnnotation'),
      declaredTypeNames,
      typeParamNames,
      typeAliases
    );
    return;
  }

  if (typePath.isTSUnionType()) {
    for (const memberPath of typePath.get('types')) {
      assertSupportedMapKeyType(memberPath, declaredTypeNames, typeParamNames, typeAliases);
    }
    return;
  }

  if (typePath.isTSTypeLiteral()) {
    // Inline objects are allowed as map keys - they will be converted to messages
    for (const memberPath of typePath.get('members')) {
      if (!memberPath.isTSPropertySignature()) {
        throw memberPath.buildCodeFrameError(
          'Propane map key object types can only contain property signatures.'
        );
      }
      const keyPath = memberPath.get('key');
      if (!keyPath.isIdentifier() || memberPath.node.computed) {
        throw memberPath.buildCodeFrameError(
          'Propane map key object properties must use simple identifier names.'
        );
      }
      const nestedTypeAnnotation = memberPath.get('typeAnnotation');
      if (!nestedTypeAnnotation?.node) {
        throw memberPath.buildCodeFrameError(
          'Propane map key object properties must include type annotations.'
        );
      }
      assertSupportedType(
        nestedTypeAnnotation.get('typeAnnotation'),
        declaredTypeNames,
        typeParamNames,
        typeAliases
      );
    }
    return;
  }

  if (typePath.isTSArrayType()) {
    assertSupportedType(
      typePath.get('elementType'),
      declaredTypeNames,
      typeParamNames,
      typeAliases
    );
    return; // Arrays are allowed as map keys
  }

  const aliases = typeAliases ?? {};
  const aliasTarget = typePath.isTSTypeReference()
    ? resolveAliasTargetName(typePath, aliases, typePath.scope)
    : null;
  const typeName = typePath.isTSTypeReference() && t.isIdentifier(typePath.node.typeName)
    ? typePath.node.typeName.name
    : null;
  const resolvedTarget = aliasTarget
    ?? (typeName && getAliasTargets(aliases, 'message').has(typeName) ? typeName : null);

  if (resolvedTarget === 'ImmutableDate' || resolvedTarget === 'ImmutableUrl') {
    return; // Alias wrapper targets are allowed as map keys
  }

  // key types must still be valid primitives/identifiers
  assertSupportedType(typePath, declaredTypeNames, typeParamNames, typeAliases);
}

export function assertSupportedTopLevelType(
  typePath: NodePath<t.TSType>,
  typeAliases?: TypeAliasMap
): void {
  if (isPrimitiveLikeType(typePath, typeAliases)) {
    return;
  }

  throw typePath.buildCodeFrameError(
    'Propane files must export an object type or a primitive-like '
    + 'alias (string, number, boolean, bigint, null, undefined, Brand).'
  );
}

export function assertSupportedType(
  typePath: NodePath<t.TSType>,
  declaredTypeNames: Set<string>,
  typeParamNames?: Set<string>,
  typeAliases?: TypeAliasMap
): void {
  if (!typePath?.node) {
    throw new Error('Missing type information for propane property.');
  }

  if (isGenericTypeReference(typePath, typeParamNames)) {
    return;
  }

  if (isPrimitiveKeyword(typePath) || isPrimitiveLiteral(typePath)) {
    return;
  }

  if (typePath.isTSUnionType()) {
    for (const memberPath of typePath.get('types')) {
      assertSupportedType(memberPath, declaredTypeNames, typeParamNames, typeAliases);
    }
    return;
  }

  if (typePath.isTSArrayType()) {
    assertSupportedType(
      typePath.get('elementType'),
      declaredTypeNames,
      typeParamNames,
      typeAliases
    );
    return;
  }

  if (typePath.isTSTypeReference()) {
    const aliases = typeAliases ?? {};
    const aliasTarget = resolveAliasTargetName(typePath, aliases, typePath.scope);
    const aliasMessageTargets = getAliasTargets(aliases, 'message');
    const typeName = t.isIdentifier(typePath.node.typeName)
      ? typePath.node.typeName.name
      : null;

    if (aliasTarget || (typeName && aliasMessageTargets.has(typeName))) {
      return;
    }

    if (isBrandReference(typePath.node)) {
      return;
    }

    if (isMapReference(typePath.node) || aliasTarget === 'ImmutableMap') {
      assertSupportedMapType(typePath, declaredTypeNames, typeParamNames, typeAliases);
      return;
    }

    if (isSetReference(typePath.node) || aliasTarget === 'ImmutableSet') {
      assertSupportedSetType(typePath, declaredTypeNames, typeParamNames, typeAliases);
      return;
    }

    if (isAllowedTypeReference(typePath, declaredTypeNames)) {
      return;
    }

    throw typePath.buildCodeFrameError(
      'Propane property references must refer to imported or locally '
      + 'declared identifiers.'
    );
  }

  if (typePath.isTSParenthesizedType()) {
    assertSupportedType(
      typePath.get('typeAnnotation'),
      declaredTypeNames,
      typeParamNames
    );
    return;
  }

  if (typePath.isTSTypeLiteral()) {
    for (const memberPath of typePath.get('members')) {
      if (!memberPath.isTSPropertySignature()) {
        throw memberPath.buildCodeFrameError(
          'Propane nested object types can only contain property '
          + 'signatures.'
        );
      }

      const keyPath = memberPath.get('key');
      if (!keyPath.isIdentifier() || memberPath.node.computed) {
        throw memberPath.buildCodeFrameError(
          'Propane nested object properties must use simple identifier '
          + 'names.'
        );
      }

      const nestedTypeAnnotation = memberPath.get('typeAnnotation');
      if (!nestedTypeAnnotation?.node) {
        throw memberPath.buildCodeFrameError(
          'Propane nested object properties must include type '
          + 'annotations.'
        );
      }

      assertSupportedType(
        nestedTypeAnnotation.get('typeAnnotation'),
        declaredTypeNames,
        typeParamNames
      );
    }
    return;
  }

  throw typePath.buildCodeFrameError(
    'Unsupported type in propane file. Only primitives, identifiers, '
    + 'Brand, or object literals are allowed.'
  );
}

export function isAllowedTypeReference(
  typePath: NodePath<t.TSTypeReference>,
  declaredTypeNames: Set<string>
): boolean {
  const typeName = typePath.node.typeName;

  if (t.isIdentifier(typeName)) {
    if (declaredTypeNames.has(typeName.name)) {
      return true;
    }

    return Boolean(typePath.scope.getBinding(typeName.name));
  }

  if (t.isTSQualifiedName(typeName)) {
    const root = resolveQualifiedRoot(typeName);
    if (root && declaredTypeNames.has(root.name)) {
      return true;
    }

    return root ? Boolean(typePath.scope.getBinding(root.name)) : false;
  }

  return false;
}

export function registerTypeAlias(
  typeAlias: t.TSTypeAliasDeclaration,
  declaredTypeNames: Set<string>,
  typeAliasDefinitions?: Map<string, t.TSType>
): void {
  if (t.isIdentifier(typeAlias.id)) {
    declaredTypeNames.add(typeAlias.id.name);
    // Store the type annotation for resolving default values
    if (typeAliasDefinitions && typeAlias.typeAnnotation) {
      typeAliasDefinitions.set(typeAlias.id.name, typeAlias.typeAnnotation);
    }
  }
}

function isPrimitiveLikeType(
  typePath: NodePath<t.TSType>,
  typeAliases?: TypeAliasMap
): boolean {
  if (!typePath?.node) {
    return false;
  }

  if (typePath.isTSParenthesizedType()) {
    return isPrimitiveLikeType(typePath.get('typeAnnotation'));
  }

  if (isPrimitiveKeyword(typePath) || isPrimitiveLiteral(typePath)) {
    return true;
  }

  if (typePath.isTSUnionType()) {
    const unionTypes = typePath.get('types');
    return (
      unionTypes.length > 0
      && unionTypes.every((member) => isPrimitiveLikeType(member))
    );
  }

  if (typePath.isTSTypeReference()) {
    if (isBrandReference(typePath.node)) {
      return true;
    }
    const aliases = typeAliases ?? {};
    const aliasTarget = resolveAliasTargetName(typePath, aliases, typePath.scope, 'all');
    if (aliasTarget) {
      return true;
    }
    const typeName = t.isIdentifier(typePath.node.typeName)
      ? typePath.node.typeName.name
      : null;
    if (!typeName) {
      return false;
    }
    const aliasTargets = getAliasTargets(aliases, 'all');
    return aliasTargets.has(typeName);
  }

  return false;
}
