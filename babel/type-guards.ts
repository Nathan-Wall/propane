import * as t from '@babel/types';
import type { NodePath } from '@babel/traverse';

export function isDateReference(node: t.TSTypeReference): boolean {
  return t.isIdentifier(node.typeName) && node.typeName.name === 'Date';
}

export function isImmutableDateReference(node: t.TSTypeReference): boolean {
  return t.isIdentifier(node.typeName) && node.typeName.name === 'ImmutableDate';
}

export function isUrlReference(node: t.TSTypeReference): boolean {
  return t.isIdentifier(node.typeName) && node.typeName.name === 'URL';
}

export function isImmutableUrlReference(node: t.TSTypeReference): boolean {
  return t.isIdentifier(node.typeName) && node.typeName.name === 'ImmutableUrl';
}

export function isArrayBufferReference(node: t.TSTypeReference): boolean {
  return t.isIdentifier(node.typeName) && node.typeName.name === 'ArrayBuffer';
}

export function isImmutableArrayBufferReference(node: t.TSTypeReference): boolean {
  return t.isIdentifier(node.typeName) && node.typeName.name === 'ImmutableArrayBuffer';
}

export function isSetReference(node: t.TSTypeReference): boolean {
  return (
    t.isIdentifier(node.typeName)
    && (
      node.typeName.name === 'Set'
      || node.typeName.name === 'ReadonlySet'
      || node.typeName.name === 'ImmutableSet'
    )
  );
}

export function isMapReference(node: t.TSTypeReference): boolean {
  return (
    t.isIdentifier(node.typeName)
    && (
      node.typeName.name === 'Map'
      || node.typeName.name === 'ReadonlyMap'
      || node.typeName.name === 'ImmutableMap'
    )
  );
}

export function isBrandReference(node: t.TSTypeReference): boolean {
  if (!t.isIdentifier(node.typeName) || node.typeName.name !== 'Brand') {
    return false;
  }

  if (!node.typeParameters || node.typeParameters.params.length === 0) {
    return false;
  }

  const [first] = node.typeParameters.params;
  return t.isTSStringKeyword(first);
}

export function isPrimitiveKeyword(typePath: NodePath<t.TSType> | null | undefined): boolean {
  if (!typePath || typeof typePath.isTSStringKeyword !== 'function') {
    return false;
  }

  return (
    typePath.isTSStringKeyword()
    || typePath.isTSNumberKeyword()
    || typePath.isTSBooleanKeyword()
    || typePath.isTSBigIntKeyword()
    || typePath.isTSNullKeyword()
    || typePath.isTSUndefinedKeyword()
  );
}

export function isPrimitiveLiteral(typePath: NodePath<t.TSType> | null | undefined): boolean {
  if (!typePath || typeof typePath.isTSLiteralType !== 'function') {
    return false;
  }

  if (!typePath.isTSLiteralType()) {
    return false;
  }

  const literal = typePath.node.literal;
  if (!literal || typeof literal.type !== 'string') {
    return false;
  }

  return (
    literal.type === 'StringLiteral'
    || literal.type === 'NumericLiteral'
    || literal.type === 'BooleanLiteral'
    || literal.type === 'BigIntLiteral'
  );
}

export function resolveQualifiedRoot(qualifiedName: t.TSQualifiedName): t.Identifier | null {
  if (t.isIdentifier(qualifiedName.left)) {
    return qualifiedName.left;
  }

  if (t.isTSQualifiedName(qualifiedName.left)) {
    return resolveQualifiedRoot(qualifiedName.left);
  }

  return null;
}

export function isArrayTypeNode(node: t.TSType | null | undefined): boolean {
  if (!node) {
    return false;
  }

  if (t.isTSParenthesizedType(node)) {
    return isArrayTypeNode(node.typeAnnotation);
  }

  if (t.isTSArrayType(node)) {
    return true;
  }

  return (
    t.isTSTypeReference(node)
    && t.isIdentifier(node.typeName)
    && (
      node.typeName.name === 'Array'
      || node.typeName.name === 'ReadonlyArray'
      || node.typeName.name === 'ImmutableArray'
    )
  );
}

export function isSetTypeNode(node: t.TSType | null | undefined): boolean {
  if (!node) {
    return false;
  }

  if (t.isTSParenthesizedType(node)) {
    return isSetTypeNode(node.typeAnnotation);
  }

  return (
    t.isTSTypeReference(node)
    && t.isIdentifier(node.typeName)
    && (
      node.typeName.name === 'Set'
      || node.typeName.name === 'ReadonlySet'
      || node.typeName.name === 'ImmutableSet'
    )
  );
}

export function isMapTypeNode(node: t.TSType | null | undefined): boolean {
  if (!node) {
    return false;
  }

  if (t.isTSParenthesizedType(node)) {
    return isMapTypeNode(node.typeAnnotation);
  }

  return (
    t.isTSTypeReference(node)
    && t.isIdentifier(node.typeName)
    && (
      node.typeName.name === 'Map'
      || node.typeName.name === 'ReadonlyMap'
      || node.typeName.name === 'ImmutableMap'
    )
  );
}

export function getMapTypeArguments(node: t.TSType | null | undefined): { keyType: t.TSType; valueType: t.TSType } | null {
  if (!node) {
    return null;
  }

  if (t.isTSParenthesizedType(node)) {
    return getMapTypeArguments(node.typeAnnotation);
  }

  if (
    t.isTSTypeReference(node)
    && t.isIdentifier(node.typeName)
    && (
      node.typeName.name === 'Map'
      || node.typeName.name === 'ReadonlyMap'
      || node.typeName.name === 'ImmutableMap'
    )
  ) {
    const params = node.typeParameters?.params;
    if (params?.length === 2) {
      const keyType = params[0]!;
      const valueType = params[1]!;
      return { keyType, valueType };
    }
  }

  return null;
}

export function getSetTypeArguments(node: t.TSType | null | undefined): t.TSType | null {
  if (!node) {
    return null;
  }

  if (t.isTSParenthesizedType(node)) {
    return getSetTypeArguments(node.typeAnnotation);
  }

  if (
    t.isTSTypeReference(node)
    && t.isIdentifier(node.typeName)
    && (
      node.typeName.name === 'Set'
      || node.typeName.name === 'ReadonlySet'
      || node.typeName.name === 'ImmutableSet'
    )
  ) {
    const params = node.typeParameters?.params;
    if (params?.length === 1) {
      return params[0]!;
    }
  }

  return null;
}

export function getArrayElementType(node: t.TSType | null | undefined): t.TSType | null {
  if (!node) {
    return null;
  }

  if (t.isTSParenthesizedType(node)) {
    return getArrayElementType(node.typeAnnotation);
  }

  if (t.isTSArrayType(node)) {
    return node.elementType;
  }

  if (
    t.isTSTypeReference(node)
    && t.isIdentifier(node.typeName)
    && (
      node.typeName.name === 'Array'
      || node.typeName.name === 'ReadonlyArray'
      || node.typeName.name === 'ImmutableArray'
    )
  ) {
    const params = node.typeParameters?.params;
    if (params?.length === 1) {
      return params[0]!;
    }
  }

  return null;
}

export function isPrimitiveLikeType(typePath: NodePath<t.TSType> | null | undefined): boolean {
  if (!typePath?.node) {
    return false;
  }

  if (typePath.isTSParenthesizedType()) {
    return isPrimitiveLikeType(typePath.get('typeAnnotation') as NodePath<t.TSType>);
  }

  if (isPrimitiveKeyword(typePath) || isPrimitiveLiteral(typePath)) {
    return true;
  }

  if (typePath.isTSUnionType()) {
    const unionTypes = typePath.get('types');
    return unionTypes.length > 0 && unionTypes.every((member) => isPrimitiveLikeType(member));
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

export function getTypeName(typeNode: t.TSType): string | null {
  if (t.isTSTypeReference(typeNode) && t.isIdentifier(typeNode.typeName)) {
    return typeNode.typeName.name;
  }
  return null;
}
