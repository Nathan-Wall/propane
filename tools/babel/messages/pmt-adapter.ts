/**
 * PMT to Babel Type Adapter
 *
 * Converts PMT (Propane Message Tree) types to Babel AST types
 * for use in code generation.
 */

import * as t from '@babel/types';
import type {
  PmtType,
  PmtPrimitive,
  PmtProperty,
  PmtTypeParameter,
} from '@/tools/parser/types.js';
import {
  wrapImmutableType,
  buildInputAcceptingMutable,
  type PropDescriptor,
  type TypeParameter,
} from './properties.js';

// ============================================================================
// Core Type Conversion
// ============================================================================

/**
 * Convert a PmtType to a raw Babel TSType.
 * This produces the "original" type as written in source.
 */
export function pmtTypeToBabelType(pmtType: PmtType): t.TSType {
  switch (pmtType.kind) {
    case 'primitive':
      return primitiveToTsType(pmtType.primitive);

    case 'array':
      return t.tsArrayType(pmtTypeToBabelType(pmtType.elementType));

    case 'map':
      return t.tsTypeReference(
        t.identifier('Map'),
        t.tsTypeParameterInstantiation([
          pmtTypeToBabelType(pmtType.keyType),
          pmtTypeToBabelType(pmtType.valueType),
        ])
      );

    case 'set':
      return t.tsTypeReference(
        t.identifier('Set'),
        t.tsTypeParameterInstantiation([
          pmtTypeToBabelType(pmtType.elementType),
        ])
      );

    case 'date':
      return t.tsTypeReference(t.identifier('Date'));

    case 'url':
      return t.tsTypeReference(t.identifier('URL'));

    case 'arraybuffer':
      return t.tsTypeReference(t.identifier('ArrayBuffer'));

    case 'union':
      return t.tsUnionType(pmtType.types.map(pmtTypeToBabelType));

    case 'reference':
      if (pmtType.typeArguments.length === 0) {
        return t.tsTypeReference(buildTypeName(pmtType.name));
      }
      return t.tsTypeReference(
        buildTypeName(pmtType.name),
        t.tsTypeParameterInstantiation(
          pmtType.typeArguments.map(pmtTypeToBabelType)
        )
      );

    case 'literal':
      return buildLiteralType(pmtType.value);
  }
}

/**
 * Build a type name, handling qualified names like "Namespace.Type".
 */
function buildTypeName(name: string): t.Identifier | t.TSQualifiedName {
  const parts = name.split('.');
  if (parts.length === 1) {
    return t.identifier(name);
  }

  let result: t.Identifier | t.TSQualifiedName = t.identifier(parts[0]!);
  for (let i = 1; i < parts.length; i++) {
    result = t.tsQualifiedName(result, t.identifier(parts[i]!));
  }
  return result;
}

/**
 * Convert a PMT primitive to a TypeScript type keyword.
 */
function primitiveToTsType(primitive: PmtPrimitive): t.TSType {
  switch (primitive) {
    case 'string':
      return t.tsStringKeyword();
    case 'number':
      return t.tsNumberKeyword();
    case 'boolean':
      return t.tsBooleanKeyword();
    case 'bigint':
      return t.tsBigIntKeyword();
    case 'null':
      return t.tsNullKeyword();
    case 'undefined':
      return t.tsUndefinedKeyword();
  }
}

/**
 * Build a literal type from a value.
 */
function buildLiteralType(value: string | number | boolean): t.TSType {
  if (typeof value === 'string') {
    return t.tsLiteralType(t.stringLiteral(value));
  }
  if (typeof value === 'boolean') {
    return t.tsLiteralType(t.booleanLiteral(value));
  }
  if (value < 0) {
    return t.tsLiteralType(
      t.unaryExpression('-', t.numericLiteral(-value))
    );
  }
  return t.tsLiteralType(t.numericLiteral(value));
}

// ============================================================================
// Derived Type Conversions
// ============================================================================

/**
 * Convert PmtType to runtime type (wrapped with Immutable* variants).
 * Used for: typeAnnotation field in PropDescriptor
 */
export function pmtTypeToRuntimeType(pmtType: PmtType): t.TSType {
  return wrapImmutableType(pmtTypeToBabelType(pmtType));
}

/**
 * Convert PmtType to input type (union accepting mutable or immutable).
 * Used for: inputTypeAnnotation, mapKeyInputType, etc.
 */
export function pmtTypeToInputType(pmtType: PmtType): t.TSType {
  return buildInputAcceptingMutable(pmtTypeToBabelType(pmtType));
}

/**
 * Build display type for user-facing API (setters, constructors).
 * Used for: displayType field in PropDescriptor
 */
export function buildDisplayType(
  pmtType: PmtType,
  messageTypeName: string | null
): t.TSType {
  // Message types use MessageType.Value
  if (messageTypeName) {
    return t.tsTypeReference(
      t.tsQualifiedName(t.identifier(messageTypeName), t.identifier('Value'))
    );
  }

  // Date/URL/ArrayBuffer show both variants
  if (pmtType.kind === 'date') {
    return t.tsUnionType([
      t.tsTypeReference(t.identifier('ImmutableDate')),
      t.tsTypeReference(t.identifier('Date')),
    ]);
  }

  if (pmtType.kind === 'url') {
    return t.tsUnionType([
      t.tsTypeReference(t.identifier('ImmutableUrl')),
      t.tsTypeReference(t.identifier('URL')),
    ]);
  }

  if (pmtType.kind === 'arraybuffer') {
    return t.tsUnionType([
      t.tsTypeReference(t.identifier('ImmutableArrayBuffer')),
      t.tsTypeReference(t.identifier('ArrayBuffer')),
    ]);
  }

  // Collections show Type | Iterable<...>
  if (pmtType.kind === 'map') {
    const keyType = pmtTypeToBabelType(pmtType.keyType);
    const valueType = pmtTypeToBabelType(pmtType.valueType);
    return t.tsUnionType([
      t.tsTypeReference(
        t.identifier('Map'),
        t.tsTypeParameterInstantiation([
          t.cloneNode(keyType),
          t.cloneNode(valueType),
        ])
      ),
      t.tsTypeReference(
        t.identifier('Iterable'),
        t.tsTypeParameterInstantiation([
          t.tsTupleType([t.cloneNode(keyType), t.cloneNode(valueType)]),
        ])
      ),
    ]);
  }

  if (pmtType.kind === 'set') {
    const elementType = pmtTypeToBabelType(pmtType.elementType);
    return t.tsUnionType([
      t.tsTypeReference(
        t.identifier('Set'),
        t.tsTypeParameterInstantiation([t.cloneNode(elementType)])
      ),
      t.tsTypeReference(
        t.identifier('Iterable'),
        t.tsTypeParameterInstantiation([t.cloneNode(elementType)])
      ),
    ]);
  }

  if (pmtType.kind === 'array') {
    const elementType = pmtTypeToBabelType(pmtType.elementType);
    return t.tsUnionType([
      t.tsArrayType(t.cloneNode(elementType)),
      t.tsTypeReference(
        t.identifier('Iterable'),
        t.tsTypeParameterInstantiation([t.cloneNode(elementType)])
      ),
    ]);
  }

  return pmtTypeToBabelType(pmtType);
}

// ============================================================================
// Generic Type Parameter Helpers
// ============================================================================

/**
 * Check if a PmtType is a reference to a generic type parameter.
 */
function getGenericParamInfo(
  pmtType: PmtType,
  typeParameters: TypeParameter[]
): { name: string; index: number; requiresConstructor: boolean } | null {
  if (pmtType.kind !== 'reference') {
    return null;
  }

  const paramIndex = typeParameters.findIndex((p) => p.name === pmtType.name);
  if (paramIndex !== -1) {
    return {
      name: pmtType.name,
      index: paramIndex,
      requiresConstructor: typeParameters[paramIndex]!.requiresConstructor,
    };
  }

  return null;
}

/**
 * Extract generic parameter names from a union type.
 */
function extractUnionGenericParams(
  pmtType: PmtType,
  typeParameters: TypeParameter[]
): string[] {
  if (pmtType.kind !== 'union') {
    const info = getGenericParamInfo(pmtType, typeParameters);
    return info ? [info.name] : [];
  }

  const genericParams: string[] = [];
  for (const memberType of pmtType.types) {
    const info = getGenericParamInfo(memberType, typeParameters);
    if (info) {
      genericParams.push(info.name);
    }
  }
  return genericParams;
}

// ============================================================================
// Message Type Helpers
// ============================================================================

/**
 * Check if a PmtType references a known message type.
 */
function getMessageTypeName(
  pmtType: PmtType,
  knownMessages: Set<string>
): string | null {
  if (pmtType.kind === 'reference' && knownMessages.has(pmtType.name)) {
    return pmtType.name;
  }
  return null;
}

/**
 * Extract message type names from a union.
 */
function extractUnionMessageTypes(
  pmtType: PmtType,
  knownMessages: Set<string>
): string[] {
  if (pmtType.kind !== 'union') {
    return [];
  }

  return pmtType.types
    .filter(
      (memberType) =>
        memberType.kind === 'reference' && knownMessages.has(memberType.name)
    )
    .map((memberType) => (memberType as { kind: 'reference'; name: string }).name);
}

// ============================================================================
// PropDescriptor Conversion
// ============================================================================

/**
 * Convert PMT type parameters to Babel plugin TypeParameter format.
 */
export function pmtTypeParametersToTypeParameters(
  pmtTypeParams: PmtTypeParameter[],
  declaredMessageTypeNames: Set<string>
): TypeParameter[] {
  return pmtTypeParams.map((param) => {
    if (!param.constraint) {
      throw new Error(
        `Generic type parameter "${param.name}" must have an "extends" constraint. `
        + `Example: ${param.name} extends Message`
      );
    }
    const constraintType = pmtTypeToBabelType(param.constraint);
    const requiresConstructor =
      param.constraint.kind === 'reference'
      && (param.constraint.name === 'Message'
        || declaredMessageTypeNames.has(param.constraint.name.split('.')[0]!));
    return {
      name: param.name,
      constraint: constraintType,
      requiresConstructor,
    };
  });
}

/**
 * Convert a PmtProperty to a PropDescriptor.
 *
 * This is the main conversion function that bridges PMT parsed data
 * to the Babel plugin's internal representation.
 */
export function pmtPropertyToDescriptor(
  prop: PmtProperty,
  knownMessages: Set<string>,
  typeParameters: TypeParameter[]
): PropDescriptor {
  const messageTypeName = getMessageTypeName(prop.type, knownMessages);
  const arrayElementMessageTypeName = prop.type.kind === 'array'
    ? getMessageTypeName(prop.type.elementType, knownMessages)
    : null;
  const setElementMessageTypeName = prop.type.kind === 'set'
    ? getMessageTypeName(prop.type.elementType, knownMessages)
    : null;
  const mapKeyMessageTypeName = prop.type.kind === 'map'
    ? getMessageTypeName(prop.type.keyType, knownMessages)
    : null;
  const mapValueMessageTypeName = prop.type.kind === 'map'
    ? getMessageTypeName(prop.type.valueType, knownMessages)
    : null;
  const arrayElementUnionMessageTypes = prop.type.kind === 'array'
    ? extractUnionMessageTypes(prop.type.elementType, knownMessages)
    : [];
  const setElementUnionMessageTypes = prop.type.kind === 'set'
    ? extractUnionMessageTypes(prop.type.elementType, knownMessages)
    : [];
  const mapKeyUnionMessageTypes = prop.type.kind === 'map'
    ? extractUnionMessageTypes(prop.type.keyType, knownMessages)
    : [];
  const mapValueUnionMessageTypes = prop.type.kind === 'map'
    ? extractUnionMessageTypes(prop.type.valueType, knownMessages)
    : [];

  // Detect generic type parameters
  const genericInfo = getGenericParamInfo(prop.type, typeParameters);
  const unionGenericParams = extractUnionGenericParams(prop.type, typeParameters);

  // Build the PropDescriptor
  return {
    name: prop.name,
    fieldNumber: prop.fieldNumber,
    optional: prop.optional,
    readonly: prop.readonly,

    // Boolean flags derived from PmtType.kind
    isArray: prop.type.kind === 'array',
    isSet: prop.type.kind === 'set',
    isMap: prop.type.kind === 'map',
    isDateType: prop.type.kind === 'date',
    isUrlType: prop.type.kind === 'url',
    isArrayBufferType: prop.type.kind === 'arraybuffer',
    isMessageType: messageTypeName !== null,
    messageTypeName,
    arrayElementMessageTypeName,
    setElementMessageTypeName,
    mapKeyMessageTypeName,
    mapValueMessageTypeName,
    unionMessageTypes: extractUnionMessageTypes(prop.type, knownMessages),
    arrayElementUnionMessageTypes,
    setElementUnionMessageTypes,
    mapKeyUnionMessageTypes,
    mapValueUnionMessageTypes,

    // Babel type fields
    typeAnnotation: pmtTypeToRuntimeType(prop.type),
    inputTypeAnnotation: pmtTypeToInputType(prop.type),
    displayType: buildDisplayType(prop.type, messageTypeName),

    // Element/key/value types for collections
    arrayElementType:
      prop.type.kind === 'array'
        ? pmtTypeToBabelType(prop.type.elementType)
        : null,
    mapKeyType:
      prop.type.kind === 'map' ? pmtTypeToBabelType(prop.type.keyType) : null,
    mapValueType:
      prop.type.kind === 'map'
        ? pmtTypeToBabelType(prop.type.valueType)
        : null,
    mapKeyInputType:
      prop.type.kind === 'map' ? pmtTypeToInputType(prop.type.keyType) : null,
    mapValueInputType:
      prop.type.kind === 'map'
        ? pmtTypeToInputType(prop.type.valueType)
        : null,
    setElementType:
      prop.type.kind === 'set'
        ? pmtTypeToBabelType(prop.type.elementType)
        : null,
    setElementInputType:
      prop.type.kind === 'set'
        ? pmtTypeToInputType(prop.type.elementType)
        : null,

    // Generic type parameter tracking
    isGenericParam: genericInfo !== null,
    genericParamName: genericInfo?.name ?? null,
    genericParamIndex: genericInfo?.index ?? null,
    genericParamRequiresConstructor: genericInfo?.requiresConstructor ?? false,
    unionGenericParams,
  };
}
