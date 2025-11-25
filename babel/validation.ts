import * as t from '@babel/types';
import type { NodePath } from '@babel/traverse';
import {
  isArrayBufferReference,
  isImmutableArrayBufferReference,
  isBrandReference,
  isDateReference,
  isImmutableDateReference,
  isMapReference,
  isImmutableUrlReference,
  isPrimitiveKeyword,
  isPrimitiveLiteral,
  isSetReference,
  isUrlReference,
  resolveQualifiedRoot,
} from './type-guards';

export function assertSupportedMapType(
  typePath: NodePath<t.TSTypeReference>,
  declaredTypeNames: Set<string>
): void {
  const typeParametersPath = typePath.get('typeParameters');
  if (typeParametersPath?.node?.params.length !== 2) {
    throw typePath.buildCodeFrameError(
      'Propane Map types must specify both key and value types.'
    );
  }

  const [keyTypePath, valueTypePath] = typeParametersPath.get('params');
  assertSupportedMapKeyType(keyTypePath!, declaredTypeNames);
  assertSupportedType(valueTypePath!, declaredTypeNames);
}

export function assertSupportedSetType(
  typePath: NodePath<t.TSTypeReference>,
  declaredTypeNames: Set<string>
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
  assertSupportedType(elementPath, declaredTypeNames);
}

export function assertSupportedMapKeyType(
  typePath: NodePath<t.TSType>,
  declaredTypeNames: Set<string>
): void {
  if (!typePath?.node) {
    throw typePath.buildCodeFrameError('Missing Map key type.');
  }

  if (typePath.isTSParenthesizedType()) {
    assertSupportedMapKeyType(typePath.get('typeAnnotation'), declaredTypeNames);
    return;
  }

  if (typePath.isTSUnionType()) {
    for (const memberPath of typePath.get('types')) {
      assertSupportedMapKeyType(memberPath, declaredTypeNames);
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
        declaredTypeNames
      );
    }
    return;
  }

  if (typePath.isTSArrayType()) {
    assertSupportedType(typePath.get('elementType'), declaredTypeNames);
    return; // Arrays are allowed as map keys
  }

  if (typePath.isTSTypeReference() && isDateReference(typePath.node)) {
    return; // Date is allowed as a map key
  }

  if (typePath.isTSTypeReference() && isUrlReference(typePath.node)) {
    return; // URL is allowed as a map key
  }

  // key types must still be valid primitives/identifiers
  assertSupportedType(typePath, declaredTypeNames);
}

export function assertSupportedTopLevelType(
  typePath: NodePath<t.TSType>
): void {
  if (isPrimitiveLikeType(typePath)) {
    return;
  }

  throw typePath.buildCodeFrameError(
    'Propane files must export an object type or a primitive-like '
    + 'alias (string, number, boolean, bigint, null, undefined, '
    + 'Date, URL, ArrayBuffer, Brand).'
  );
}

export function assertSupportedType(
  typePath: NodePath<t.TSType>,
  declaredTypeNames: Set<string>
): void {
  if (!typePath?.node) {
    throw new Error('Missing type information for propane property.');
  }

  if (isPrimitiveKeyword(typePath) || isPrimitiveLiteral(typePath)) {
    return;
  }

  if (typePath.isTSUnionType()) {
    for (const memberPath of typePath.get('types')) {
      assertSupportedType(memberPath, declaredTypeNames);
    }
    return;
  }

  if (typePath.isTSArrayType()) {
    assertSupportedType(typePath.get('elementType'), declaredTypeNames);
    return;
  }

  if (typePath.isTSTypeReference()) {
    if (isDateReference(typePath.node)) {
      return;
    }

    if (isUrlReference(typePath.node)) {
      return;
    }

    if (isBrandReference(typePath.node)) {
      return;
    }

    if (
      isArrayBufferReference(typePath.node)
      || isImmutableArrayBufferReference(typePath.node)
    ) {
      return;
    }

    if (isMapReference(typePath.node)) {
      assertSupportedMapType(typePath, declaredTypeNames);
      return;
    }

    if (isSetReference(typePath.node)) {
      assertSupportedSetType(typePath, declaredTypeNames);
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
    assertSupportedType(typePath.get('typeAnnotation'), declaredTypeNames);
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
        declaredTypeNames
      );
    }
    return;
  }

  throw typePath.buildCodeFrameError(
    'Unsupported type in propane file. Only primitives, identifiers, '
    + 'Date, Brand, or object literals are allowed.'
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
  declaredTypeNames: Set<string>
): void {
  if (t.isIdentifier(typeAlias.id)) {
    declaredTypeNames.add(typeAlias.id.name);
  }
}

function isPrimitiveLikeType(typePath: NodePath<t.TSType>): boolean {
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
    return (
      isDateReference(typePath.node)
      || isImmutableDateReference(typePath.node)
      || isUrlReference(typePath.node)
      || isImmutableUrlReference(typePath.node)
      || isArrayBufferReference(typePath.node)
      || isImmutableArrayBufferReference(typePath.node)
      || isBrandReference(typePath.node)
    );
  }

  return false;
}
