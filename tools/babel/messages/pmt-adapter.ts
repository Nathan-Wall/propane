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
import type { TypeAliasMap } from '@/tools/parser/type-aliases.js';
import {
  wrapImmutableType,
  buildInputAcceptingMutable,
  type PropDescriptor,
  type TypeParameter,
} from './properties.js';
import { getAliasSourcesForTarget } from './alias-utils.js';

const DEFAULT_ALIAS_STRING_TYPE: PmtType = { kind: 'primitive', primitive: 'string' };

function resolveAliasType(pmtType: PmtType): PmtType {
  if (pmtType.kind !== 'alias') {
    return pmtType;
  }

  switch (pmtType.target) {
    case 'ImmutableArray':
      return {
        kind: 'array',
        elementType: pmtType.typeArguments[0] ?? DEFAULT_ALIAS_STRING_TYPE,
      };
    case 'ImmutableMap':
      return {
        kind: 'map',
        keyType: pmtType.typeArguments[0] ?? DEFAULT_ALIAS_STRING_TYPE,
        valueType: pmtType.typeArguments[1] ?? DEFAULT_ALIAS_STRING_TYPE,
      };
    case 'ImmutableSet':
      return {
        kind: 'set',
        elementType: pmtType.typeArguments[0] ?? DEFAULT_ALIAS_STRING_TYPE,
      };
    default:
      return {
        kind: 'reference',
        name: pmtType.target,
        typeArguments: pmtType.typeArguments,
      };
  }
}

function resolveAliasTypeForMessage(pmtType: PmtType): PmtType | null {
  if (pmtType.kind !== 'alias') {
    return pmtType;
  }
  if (pmtType.aliasKind !== 'message') {
    return null;
  }
  return resolveAliasType(pmtType);
}

function resolveRuntimeType(pmtType: PmtType): PmtType {
  if (pmtType.kind === 'alias') {
    if (pmtType.aliasKind === 'message') {
      return resolveRuntimeType(resolveAliasType(pmtType));
    }
    return pmtType;
  }

  if (pmtType.kind === 'array') {
    return {
      kind: 'array',
      elementType: resolveRuntimeType(pmtType.elementType),
    };
  }

  if (pmtType.kind === 'set') {
    return {
      kind: 'set',
      elementType: resolveRuntimeType(pmtType.elementType),
    };
  }

  if (pmtType.kind === 'map') {
    return {
      kind: 'map',
      keyType: resolveRuntimeType(pmtType.keyType),
      valueType: resolveRuntimeType(pmtType.valueType),
    };
  }

  if (pmtType.kind === 'union') {
    return {
      kind: 'union',
      types: pmtType.types.map((member) => resolveRuntimeType(member)),
    };
  }

  if (pmtType.kind === 'reference') {
    return {
      kind: 'reference',
      name: pmtType.name,
      typeArguments: pmtType.typeArguments.map((arg) => resolveRuntimeType(arg)),
    };
  }

  return pmtType;
}

function isWrapperMessageTypeName(name: string): boolean {
  return name === 'ImmutableDate'
    || name === 'ImmutableUrl'
    || name === 'ImmutableArrayBuffer';
}

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

    case 'union':
      return t.tsUnionType(pmtType.types.map(pmtTypeToBabelType));

    case 'alias': {
      const typeParams = pmtType.typeArguments;
      if (typeParams.length === 0) {
        return t.tsTypeReference(t.identifier(pmtType.source));
      }
      return t.tsTypeReference(
        t.identifier(pmtType.source),
        t.tsTypeParameterInstantiation(typeParams.map(pmtTypeToBabelType))
      );
    }

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
function buildLiteralType(value: string | number | boolean | bigint): t.TSType {
  if (typeof value === 'string') {
    return t.tsLiteralType(t.stringLiteral(value));
  }
  if (typeof value === 'boolean') {
    return t.tsLiteralType(t.booleanLiteral(value));
  }
  if (typeof value === 'bigint') {
    const literal = t.bigIntLiteral(value.toString());
    return t.tsLiteralType(literal);
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
export function pmtTypeToRuntimeType(
  pmtType: PmtType,
  aliases?: TypeAliasMap
): t.TSType {
  const resolved = resolveRuntimeType(pmtType);
  return wrapImmutableType(pmtTypeToBabelType(resolved), aliases);
}

/**
 * Convert PmtType to input type (union accepting mutable or immutable).
 * Used for: inputTypeAnnotation, mapKeyInputType, etc.
 */
export function pmtTypeToInputType(
  pmtType: PmtType,
  aliases?: TypeAliasMap
): t.TSType {
  const resolved = resolveRuntimeType(pmtType);
  return buildInputAcceptingMutable(pmtTypeToBabelType(resolved), aliases);
}

/**
 * Build display type for user-facing API (setters, constructors).
 * Used for: displayType field in PropDescriptor
 */
export function buildDisplayType(
  pmtType: PmtType,
  messageTypeName: string | null,
  aliases?: TypeAliasMap
): t.TSType {
  // Message types use MessageType.Value
  if (messageTypeName) {
    return t.tsTypeReference(
      t.tsQualifiedName(t.identifier(messageTypeName), t.identifier('Value'))
    );
  }

  if (pmtType.kind === 'union') {
    const unionDisplay = buildUnionDateUrlDisplayType(pmtType, aliases);
    if (unionDisplay) {
      return unionDisplay;
    }
  }

  // Alias message targets show both variants
  if (isDateType(pmtType)) {
    const aliasSources = aliases
      ? getAliasSourcesForTarget('ImmutableDate', aliases)
      : [];
    return t.tsUnionType([
      t.tsTypeReference(t.identifier('ImmutableDate')),
      ...aliasSources.map((source) => t.tsTypeReference(t.identifier(source))),
    ]);
  }

  if (isUrlType(pmtType)) {
    const aliasSources = aliases
      ? getAliasSourcesForTarget('ImmutableUrl', aliases)
      : [];
    return t.tsUnionType([
      t.tsTypeReference(t.identifier('ImmutableUrl')),
      ...aliasSources.map((source) => t.tsTypeReference(t.identifier(source))),
    ]);
  }

  if (isArrayBufferType(pmtType)) {
    const aliasSources = aliases
      ? getAliasSourcesForTarget('ImmutableArrayBuffer', aliases)
      : [];
    return t.tsUnionType([
      t.tsTypeReference(t.identifier('ImmutableArrayBuffer')),
      ...aliasSources.map((source) => t.tsTypeReference(t.identifier(source))),
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
    let elementType = pmtTypeToBabelType(pmtType.elementType);
    if (isArrayBufferType(pmtType.elementType)) {
      const aliasSources = aliases
        ? getAliasSourcesForTarget('ImmutableArrayBuffer', aliases)
        : [];
      elementType = t.tsUnionType([
        t.tsTypeReference(t.identifier('ImmutableArrayBuffer')),
        ...aliasSources.map((source) => t.tsTypeReference(t.identifier(source))),
      ]);
    } else if (isDateType(pmtType.elementType)) {
      const aliasSources = aliases
        ? getAliasSourcesForTarget('ImmutableDate', aliases)
        : [];
      elementType = t.tsUnionType([
        t.tsTypeReference(t.identifier('ImmutableDate')),
        ...aliasSources.map((source) => t.tsTypeReference(t.identifier(source))),
      ]);
    } else if (isUrlType(pmtType.elementType)) {
      const aliasSources = aliases
        ? getAliasSourcesForTarget('ImmutableUrl', aliases)
        : [];
      elementType = t.tsUnionType([
        t.tsTypeReference(t.identifier('ImmutableUrl')),
        ...aliasSources.map((source) => t.tsTypeReference(t.identifier(source))),
      ]);
    }
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

function buildUnionDateUrlDisplayType(
  pmtType: PmtType,
  aliases?: TypeAliasMap
): t.TSType | null {
  if (pmtType.kind !== 'union') return null;
  let hasDateOrUrl = false;
  const types: t.TSType[] = [];

  for (const member of pmtType.types) {
    if (isDateType(member)) {
      hasDateOrUrl = true;
      const aliasSources = aliases
        ? getAliasSourcesForTarget('ImmutableDate', aliases)
        : [];
      types.push(t.tsTypeReference(t.identifier('ImmutableDate')));
      for (const source of aliasSources) {
        types.push(t.tsTypeReference(t.identifier(source)));
      }
      continue;
    }
    if (isUrlType(member)) {
      hasDateOrUrl = true;
      const aliasSources = aliases
        ? getAliasSourcesForTarget('ImmutableUrl', aliases)
        : [];
      types.push(t.tsTypeReference(t.identifier('ImmutableUrl')));
      for (const source of aliasSources) {
        types.push(t.tsTypeReference(t.identifier(source)));
      }
      continue;
    }
    types.push(pmtTypeToBabelType(member));
  }

  if (!hasDateOrUrl) return null;
  return t.tsUnionType(types);
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
  const resolved = resolveAliasTypeForMessage(pmtType);
  if (!resolved) {
    return null;
  }
  if (resolved.kind === 'reference'
    && (knownMessages.has(resolved.name) || isWrapperMessageTypeName(resolved.name))
  ) {
    return resolved.name;
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

  const names: string[] = [];
  for (const memberType of pmtType.types) {
    const messageName = getMessageTypeName(memberType, knownMessages);
    if (messageName) {
      names.push(messageName);
    }
  }
  return names;
}

// ============================================================================
// PropDescriptor Conversion
// ============================================================================

/**
 * Convert PMT type parameters to Babel plugin TypeParameter format.
 */
export function pmtTypeParametersToTypeParameters(
  pmtTypeParams: PmtTypeParameter[],
  declaredMessageTypeNames: Set<string>,
  isValueWrapper = false
): TypeParameter[] {
  return pmtTypeParams.map((param) => {
    if (!param.constraint) {
      throw new Error(
        `Generic type parameter "${param.name}" must have an "extends" constraint. `
        + `Example: ${param.name} extends Message`
      );
    }
    const resolvedConstraint = resolveAliasTypeForMessage(param.constraint) ?? param.constraint;
    const constraintType = pmtTypeToBabelType(param.constraint);
    const requiresConstructor =
      !isValueWrapper
      && resolvedConstraint.kind === 'reference'
      && (resolvedConstraint.name === 'Message'
        || declaredMessageTypeNames.has(resolvedConstraint.name.split('.')[0]!));
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
  typeParameters: TypeParameter[],
  aliases?: TypeAliasMap
): PropDescriptor {
  const resolvedType = resolveRuntimeType(prop.type);
  const messageTypeName = getMessageTypeName(prop.type, knownMessages);
  const isDate = isDateType(resolvedType);
  const isUrl = isUrlType(resolvedType);
  const isArrayBuffer = isArrayBufferType(resolvedType);
  const effectiveMessageTypeName = (isDate || isUrl) ? null : messageTypeName;
  const arrayElementMessageTypeName = resolvedType.kind === 'array'
    ? getMessageTypeName(resolvedType.elementType, knownMessages)
    : null;
  const setElementMessageTypeName = resolvedType.kind === 'set'
    ? getMessageTypeName(resolvedType.elementType, knownMessages)
    : null;
  const mapKeyMessageTypeName = resolvedType.kind === 'map'
    ? getMessageTypeName(resolvedType.keyType, knownMessages)
    : null;
  const mapValueMessageTypeName = resolvedType.kind === 'map'
    ? getMessageTypeName(resolvedType.valueType, knownMessages)
    : null;
  const arrayElementUnionMessageTypes = resolvedType.kind === 'array'
    ? extractUnionMessageTypes(resolvedType.elementType, knownMessages)
    : [];
  const setElementUnionMessageTypes = resolvedType.kind === 'set'
    ? extractUnionMessageTypes(resolvedType.elementType, knownMessages)
    : [];
  const mapKeyUnionMessageTypes = resolvedType.kind === 'map'
    ? extractUnionMessageTypes(resolvedType.keyType, knownMessages)
    : [];
  const mapValueUnionMessageTypes = resolvedType.kind === 'map'
    ? extractUnionMessageTypes(resolvedType.valueType, knownMessages)
    : [];
  const unionHasString = extractUnionHasString(resolvedType);
  const unionHasDate = extractUnionHasDate(resolvedType);
  const unionHasUrl = extractUnionHasUrl(resolvedType);
  const arrayElementUnionHasString = resolvedType.kind === 'array'
    ? extractUnionHasString(resolvedType.elementType)
    : false;
  const setElementUnionHasString = resolvedType.kind === 'set'
    ? extractUnionHasString(resolvedType.elementType)
    : false;
  const mapKeyUnionHasString = resolvedType.kind === 'map'
    ? extractUnionHasString(resolvedType.keyType)
    : false;
  const mapValueUnionHasString = resolvedType.kind === 'map'
    ? extractUnionHasString(resolvedType.valueType)
    : false;

  // Detect generic type parameters
  const genericInfo = getGenericParamInfo(prop.type, typeParameters);
  const unionGenericParams = extractUnionGenericParams(prop.type, typeParameters);

  let inputTypeAnnotation = pmtTypeToInputType(resolvedType, aliases);
  let displayType = buildDisplayType(resolvedType, effectiveMessageTypeName, aliases);

  if (isDate || isUrl) {
    inputTypeAnnotation = displayType;
  } else if (isArrayBuffer) {
    inputTypeAnnotation = t.tsUnionType([
      displayType,
      t.tsTypeReference(t.identifier('ArrayBufferView')),
      t.tsTypeReference(
        t.identifier('Iterable'),
        t.tsTypeParameterInstantiation([t.tsNumberKeyword()])
      ),
      t.tsArrayType(t.tsNumberKeyword()),
    ]);
  }

  if (messageTypeName && !isDate && !isUrl) {
    const typeArgs = resolvedType.kind === 'reference'
      && resolvedType.typeArguments.length > 0
      ? t.tsTypeParameterInstantiation(
        resolvedType.typeArguments.map((arg) => pmtTypeToBabelType(arg))
      )
      : null;
    inputTypeAnnotation = t.tsTypeReference(
      t.tsQualifiedName(
        t.identifier(messageTypeName),
        t.identifier('Value')
      ),
      typeArgs ?? undefined
    );
    displayType = t.cloneNode(inputTypeAnnotation);
  }

  // Build the PropDescriptor
  return {
    name: prop.name,
    fieldNumber: prop.fieldNumber,
    optional: prop.optional,
    readonly: prop.readonly,

    // Boolean flags derived from resolved type
    isArray: resolvedType.kind === 'array',
    isSet: resolvedType.kind === 'set',
    isMap: resolvedType.kind === 'map',
    isDateType: isDate,
    isUrlType: isUrl,
    isArrayBufferType: isArrayBuffer,
    isMessageType: messageTypeName !== null,
    messageTypeName,
    arrayElementMessageTypeName,
    setElementMessageTypeName,
    mapKeyMessageTypeName,
    mapValueMessageTypeName,
    unionMessageTypes: extractUnionMessageTypes(resolvedType, knownMessages),
    arrayElementUnionMessageTypes,
    setElementUnionMessageTypes,
    mapKeyUnionMessageTypes,
    mapValueUnionMessageTypes,
    unionHasString,
    arrayElementUnionHasString,
    setElementUnionHasString,
    mapKeyUnionHasString,
    mapValueUnionHasString,
    unionHasDate,
    unionHasUrl,

    // Babel type fields
    typeAnnotation: pmtTypeToRuntimeType(resolvedType, aliases),
    inputTypeAnnotation,
    displayType,

    // Element/key/value types for collections
    arrayElementType:
      resolvedType.kind === 'array'
        ? pmtTypeToBabelType(resolvedType.elementType)
        : null,
    mapKeyType:
      resolvedType.kind === 'map' ? pmtTypeToBabelType(resolvedType.keyType) : null,
    mapValueType:
      resolvedType.kind === 'map'
        ? pmtTypeToBabelType(resolvedType.valueType)
        : null,
    mapKeyInputType:
      resolvedType.kind === 'map' ? pmtTypeToInputType(resolvedType.keyType) : null,
    mapValueInputType:
      resolvedType.kind === 'map'
        ? pmtTypeToInputType(resolvedType.valueType)
        : null,
    setElementType:
      resolvedType.kind === 'set'
        ? pmtTypeToBabelType(resolvedType.elementType)
        : null,
    setElementInputType:
      resolvedType.kind === 'set'
        ? pmtTypeToInputType(resolvedType.elementType)
        : null,

    // Generic type parameter tracking
    isGenericParam: genericInfo !== null,
    genericParamName: genericInfo?.name ?? null,
    genericParamIndex: genericInfo?.index ?? null,
    genericParamRequiresConstructor: genericInfo?.requiresConstructor ?? false,
    unionGenericParams,
  };
}

function extractUnionHasString(type: PmtType): boolean {
  if (type.kind !== 'union') return false;
  return type.types.some((member) => isStringType(member));
}

function extractUnionHasDate(type: PmtType): boolean {
  if (type.kind !== 'union') return false;
  return type.types.some((member) => isDateType(member));
}

function extractUnionHasUrl(type: PmtType): boolean {
  if (type.kind !== 'union') return false;
  return type.types.some((member) => isUrlType(member));
}

function isStringType(type: PmtType): boolean {
  if (type.kind === 'primitive') {
    return type.primitive === 'string';
  }
  if (type.kind === 'literal') {
    return typeof type.value === 'string';
  }
  if (type.kind === 'union') {
    return type.types.some((member) => isStringType(member));
  }
  return false;
}

function isDateType(type: PmtType): boolean {
  if (type.kind === 'union') {
    return type.types.some((member) => isDateType(member));
  }
  const resolved = resolveAliasTypeForMessage(type);
  if (!resolved) {
    return false;
  }
  return resolved.kind === 'reference' && resolved.name === 'ImmutableDate';
}

function isUrlType(type: PmtType): boolean {
  if (type.kind === 'union') {
    return type.types.some((member) => isUrlType(member));
  }
  const resolved = resolveAliasTypeForMessage(type);
  if (!resolved) {
    return false;
  }
  return resolved.kind === 'reference' && resolved.name === 'ImmutableUrl';
}

function isArrayBufferType(type: PmtType): boolean {
  if (type.kind === 'union') {
    return type.types.some((member) => isArrayBufferType(member));
  }
  const resolved = resolveAliasTypeForMessage(type);
  if (!resolved) {
    return false;
  }
  return resolved.kind === 'reference' && resolved.name === 'ImmutableArrayBuffer';
}
