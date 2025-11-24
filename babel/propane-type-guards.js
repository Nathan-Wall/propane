import * as t from '@babel/types';

export function isDateReference(node) {
  return t.isIdentifier(node.typeName) && node.typeName.name === 'Date';
}

export function isImmutableDateReference(node) {
  return t.isIdentifier(node.typeName) && node.typeName.name === 'ImmutableDate';
}

export function isUrlReference(node) {
  return t.isIdentifier(node.typeName) && node.typeName.name === 'URL';
}

export function isImmutableUrlReference(node) {
  return t.isIdentifier(node.typeName) && node.typeName.name === 'ImmutableUrl';
}

export function isArrayBufferReference(node) {
  return t.isIdentifier(node.typeName) && node.typeName.name === 'ArrayBuffer';
}

export function isImmutableArrayBufferReference(node) {
  return t.isIdentifier(node.typeName) && node.typeName.name === 'ImmutableArrayBuffer';
}

export function isSetReference(node) {
  return (
    t.isIdentifier(node.typeName)
    && (
      node.typeName.name === 'Set'
      || node.typeName.name === 'ReadonlySet'
      || node.typeName.name === 'ImmutableSet'
    )
  );
}

export function isMapReference(node) {
  return (
    t.isIdentifier(node.typeName)
    && (
      node.typeName.name === 'Map'
      || node.typeName.name === 'ReadonlyMap'
      || node.typeName.name === 'ImmutableMap'
    )
  );
}

export function isBrandReference(node) {
  if (!t.isIdentifier(node.typeName) || node.typeName.name !== 'Brand') {
    return false;
  }

  if (!node.typeParameters || node.typeParameters.params.length === 0) {
    return false;
  }

  const [first] = node.typeParameters.params;
  return t.isTSStringKeyword(first);
}

export function isPrimitiveKeyword(typePath) {
  if (
    !typePath
    || typeof typePath.isTSStringKeyword !== 'function'
  ) {
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

export function isPrimitiveLiteral(typePath) {
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

export function resolveQualifiedRoot(qualifiedName) {
  if (t.isIdentifier(qualifiedName.left)) {
    return qualifiedName.left;
  }

  if (t.isTSQualifiedName(qualifiedName.left)) {
    return resolveQualifiedRoot(qualifiedName.left);
  }

  return null;
}

export function isArrayTypeNode(node) {
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

export function isSetTypeNode(node) {
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

export function isMapTypeNode(node) {
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

export function getMapTypeArguments(node) {
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
    && node.typeParameters
    && node.typeParameters.params.length === 2
  ) {
    const [keyType, valueType] = node.typeParameters.params;
    return { keyType, valueType };
  }

  return null;
}

export function getSetTypeArguments(node) {
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
    && node.typeParameters
    && node.typeParameters.params.length === 1
  ) {
    return node.typeParameters.params[0];
  }

  return null;
}

export function getArrayElementType(node) {
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
    && node.typeParameters
    && node.typeParameters.params.length === 1
  ) {
    return node.typeParameters.params[0];
  }

  return null;
}

export function isPrimitiveLikeType(typePath) {
  if (!typePath || !typePath.node) {
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

export function getTypeName(typeNode) {
  if (t.isTSTypeReference(typeNode) && t.isIdentifier(typeNode.typeName)) {
    return typeNode.typeName.name;
  }
  return null;
}
