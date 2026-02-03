/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument */
import * as t from '@babel/types';
import type { NodePath } from '@babel/traverse';
import {
  getArrayElementType,
  getMapTypeArguments,
  getSetTypeArguments,
  isArrayTypeNode,
  isDecimalReference,
  isMapReference,
  isMapTypeNode,
  isRationalReference,
  isSetReference,
  isSetTypeNode,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getTypeName,
} from './type-guards.js';
import type { TypeAliasMap } from '@/tools/parser/type-aliases.js';
import {
  COLLECTION_ALIAS_TARGETS,
  getAliasSourcesForTarget,
  resolveAliasConfigForName,
  resolveAliasTargetName,
  resolveAliasTypeNode,
} from './alias-utils.js';
import { capitalize } from './utils.js';
import {
  isTSTypeParameterInstantiation,
  getTypeParams,
  isTSTypeAnnotation,
  getTypeAnnotation,
} from './babel-helpers.js';

export interface PluginStateFlags {
  usesImmutableMap: boolean;
  usesImmutableSet: boolean;
  usesImmutableArray: boolean;
  usesImmutableDate: boolean;
  usesImmutableUrl: boolean;
  usesImmutableArrayBuffer: boolean;
  usesEquals: boolean;
  usesTaggedMessageData: boolean;
  usesListeners: boolean;
  usesMessageConstructor: boolean;
  usesMessageValue: boolean;
  usesDataValue: boolean;
  usesParseCerealString: boolean;
  usesDataObject: boolean;
  usesEnsure: boolean;
  usesSkip: boolean;
  hasGenericTypes: boolean;
  // Type-only import flags for GET_MESSAGE_CHILDREN yield type
  needsImmutableArrayType: boolean;
  needsImmutableSetType: boolean;
  needsImmutableMapType: boolean;
  needsSetUpdatesType: boolean;
  // Validation imports
  usesValidationError: boolean;
  usesCharLength: boolean;
  usesIsInt32: boolean;
  usesIsInt53: boolean;
  usesIsDecimalOf: boolean;
  usesIsRational: boolean;
  usesDecimalClass: boolean;
  usesRationalClass: boolean;
  usesIsPositive: boolean;
  usesIsNegative: boolean;
  usesIsNonNegative: boolean;
  usesIsNonPositive: boolean;
  usesGreaterThan: boolean;
  usesGreaterThanOrEqual: boolean;
  usesLessThan: boolean;
  usesLessThanOrEqual: boolean;
  usesInRange: boolean;
  /** Map of message type name to its compact tag (or full tag fallback) */
  messageTagsByName?: Map<string, string>;
  /** Normalized type alias configuration */
  typeAliases?: TypeAliasMap;
  /** Alias targets used in this file (for import generation). */
  aliasTargetsUsed?: Set<string>;
}

/**
 * Represents a generic type parameter like T in `Container<T extends Message>`.
 */
export interface TypeParameter {
  name: string; // e.g., 'T'
  constraint: t.TSType | null; // Constraint type node (e.g., number, Message, User)
  requiresConstructor: boolean; // true if constraint is a Message or message type
}

export interface PropDescriptor {
  name: string;
  fieldNumber: number | null;
  optional: boolean;
  readonly: boolean;
  /** True when this property is the MessageWrapper value field */
  isWrapperValue?: boolean;
  isArray: boolean;
  isSet: boolean;
  isMap: boolean;
  isDateType: boolean;
  isUrlType: boolean;
  isArrayBufferType: boolean;
  isMessageType: boolean;
  messageTypeName: string | null;
  arrayElementMessageTypeName: string | null;
  setElementMessageTypeName: string | null;
  mapKeyMessageTypeName: string | null;
  mapValueMessageTypeName: string | null;
  unionMessageTypes: string[];
  arrayElementUnionMessageTypes: string[];
  setElementUnionMessageTypes: string[];
  mapKeyUnionMessageTypes: string[];
  mapValueUnionMessageTypes: string[];
  unionHasString: boolean;
  arrayElementUnionHasString: boolean;
  setElementUnionHasString: boolean;
  mapKeyUnionHasString: boolean;
  mapValueUnionHasString: boolean;
  unionHasDate: boolean;
  unionHasUrl: boolean;
  typeAnnotation: t.TSType;
  inputTypeAnnotation: t.TSType;
  arrayElementType: t.TSType | null;
  mapKeyType: t.TSType | null;
  mapValueType: t.TSType | null;
  mapKeyInputType: t.TSType | null;
  mapValueInputType: t.TSType | null;
  setElementType: t.TSType | null;
  setElementInputType: t.TSType | null;
  displayType: t.TSType;
  // Generic type parameter tracking
  isGenericParam: boolean;              // true if type is a generic parameter (e.g., T)
  genericParamName: string | null;      // the parameter name (e.g., 'T')
  genericParamIndex: number | null;     // index in the type parameters array
  genericParamRequiresConstructor: boolean; // true if generic param is a message type
  unionGenericParams: string[];         // for unions like T | U, lists ['T', 'U']
}

export function normalizePropertyKey(
  memberPath: NodePath<t.TSPropertySignature>
): { name: string; fieldNumber: number | null } {
  const keyPath = memberPath.get('key');

  if (keyPath.isIdentifier()) {
    const name = keyPath.node.name;
    assertValidPropertyName(name, keyPath);
    return { name, fieldNumber: null };
  }

  if (keyPath.isStringLiteral()) {
    const rawValue = keyPath.node.value;
    const match = /^(\d+):([A-Za-z_][A-Za-z0-9_]*)$/.exec(rawValue);

    if (!match) {
      throw keyPath.buildCodeFrameError(
        'Numbered propane properties must follow the '
        + '"<positive-integer>:<identifier>" format, e.g. \'1:name\'.'
      );
    }

    // Both groups are guaranteed to exist since the regex requires them
    const numberPart = match[1]!;
    const identifierPart = match[2]!;
    const fieldNumber = Number(numberPart);

    if (!Number.isSafeInteger(fieldNumber)) {
      throw keyPath.buildCodeFrameError(
        'Propane property numbers must be integers.'
      );
    }

    if (fieldNumber < 1) {
      throw keyPath.buildCodeFrameError(
        'Field numbers must be positive integers (1 or greater).'
      );
    }

    assertValidPropertyName(identifierPart, keyPath);
    return { name: identifierPart, fieldNumber };
  }

  throw memberPath.buildCodeFrameError(
    'Propane properties must use identifier names or numbered keys '
    + 'like \'1:name\'.'
  );
}

// Reserved names that would collide with Message class or JavaScript internals
const RESERVED_PROPERTY_NAMES = new Set([
  // JavaScript reserved
  'constructor',
  'prototype',
  '__proto__',

  // Message base class methods
  'detach',
  'equals',
  'hashCode',
  'serialize',
  'toJSON',

  // Message static methods
  'deserialize',
  'validateAll',

  // Generated methods
  'set',
]);

export function assertValidPropertyName(
  name: string,
  keyPath: NodePath<t.Identifier | t.StringLiteral>
): void {
  if (name.includes('$')) {
    throw keyPath.buildCodeFrameError(
      'Propane property names cannot contain "$".'
    );
  }
  if (RESERVED_PROPERTY_NAMES.has(name)) {
    throw keyPath.buildCodeFrameError(
      `"${name}" is a reserved name that would collide with Message.${name}().`
    );
  }
}

/**
 * Check if a type reference refers to a generic type parameter.
 */
function getGenericParamInfo(
  typePath: NodePath<t.TSType>,
  typeParameters: TypeParameter[]
): { name: string; index: number; requiresConstructor: boolean } | null {
  if (!typePath.isTSTypeReference()) {
    return null;
  }
  const typeName = typePath.node.typeName;
  if (!t.isIdentifier(typeName)) {
    return null;
  }
  const paramIndex = typeParameters.findIndex((p) => p.name === typeName.name);
  if (paramIndex !== -1) {
    return {
      name: typeName.name,
      index: paramIndex,
      requiresConstructor: typeParameters[paramIndex]!.requiresConstructor,
    };
  }
  return null;
}

/**
 * Extract generic parameter names from a union type (e.g., T | U).
 */
function extractUnionGenericParams(
  typePath: NodePath<t.TSType>,
  typeParameters: TypeParameter[]
): string[] {
  if (!typePath.isTSUnionType()) {
    const info = getGenericParamInfo(typePath, typeParameters);
    return info ? [info.name] : [];
  }

  const genericParams: string[] = [];
  const types = typePath.get('types');
  for (const memberType of types) {
    const info = getGenericParamInfo(memberType, typeParameters);
    if (info) {
      genericParams.push(info.name);
    }
  }
  return genericParams;
}

function unwrapParenthesizedTypePath(
  typePath: NodePath<t.TSType>
): NodePath<t.TSType> {
  if (typePath.isTSParenthesizedType()) {
    return unwrapParenthesizedTypePath(typePath.get('typeAnnotation'));
  }
  return typePath;
}

function getArrayElementTypePath(
  typePath: NodePath<t.TSType>,
  aliases: TypeAliasMap
): NodePath<t.TSType> | null {
  const unwrapped = unwrapParenthesizedTypePath(typePath);
  if (unwrapped.isTSArrayType()) {
    return unwrapped.get('elementType');
  }
  if (unwrapped.isTSTypeReference()) {
    const aliasTarget = resolveAliasTargetName(unwrapped, aliases, unwrapped.scope);
    if (aliasTarget === 'ImmutableArray') {
      const paramsPath = unwrapped.get('typeParameters');
      if (
        !Array.isArray(paramsPath)
        && paramsPath.node
        && t.isTSTypeParameterInstantiation(paramsPath.node)
      ) {
        const params = paramsPath.get('params');
        return Array.isArray(params) ? params[0] ?? null : null;
      }
    }
    const typeName = unwrapped.node.typeName;
    if (
      t.isIdentifier(typeName)
      && (
        typeName.name === 'Array'
        || typeName.name === 'ReadonlyArray'
        || typeName.name === 'ImmutableArray'
      )
    ) {
      const paramsPath = unwrapped.get('typeParameters');
      if (
        !Array.isArray(paramsPath)
        && paramsPath.node
        && t.isTSTypeParameterInstantiation(paramsPath.node)
      ) {
        const params = paramsPath.get('params');
        return Array.isArray(params) ? params[0] ?? null : null;
      }
    }
  }
  return null;
}

function getSetElementTypePath(
  typePath: NodePath<t.TSType>,
  aliases: TypeAliasMap
): NodePath<t.TSType> | null {
  const unwrapped = unwrapParenthesizedTypePath(typePath);
  if (unwrapped.isTSTypeReference()) {
    const aliasTarget = resolveAliasTargetName(unwrapped, aliases, unwrapped.scope);
    if (aliasTarget === 'ImmutableSet') {
      const paramsPath = unwrapped.get('typeParameters');
      if (
        !Array.isArray(paramsPath)
        && paramsPath.node
        && t.isTSTypeParameterInstantiation(paramsPath.node)
      ) {
        const params = paramsPath.get('params');
        return Array.isArray(params) ? params[0] ?? null : null;
      }
    }
    const typeName = unwrapped.node.typeName;
    if (
      t.isIdentifier(typeName)
      && (
        typeName.name === 'Set'
        || typeName.name === 'ReadonlySet'
        || typeName.name === 'ImmutableSet'
      )
    ) {
      const paramsPath = unwrapped.get('typeParameters');
      if (
        !Array.isArray(paramsPath)
        && paramsPath.node
        && t.isTSTypeParameterInstantiation(paramsPath.node)
      ) {
        const params = paramsPath.get('params');
        return Array.isArray(params) ? params[0] ?? null : null;
      }
    }
  }
  return null;
}

function getMapTypeArgumentPaths(
  typePath: NodePath<t.TSType>,
  aliases: TypeAliasMap
): { keyPath: NodePath<t.TSType> | null; valuePath: NodePath<t.TSType> | null } | null {
  const unwrapped = unwrapParenthesizedTypePath(typePath);
  if (!unwrapped.isTSTypeReference()) {
    return null;
  }
  const aliasTarget = resolveAliasTargetName(unwrapped, aliases, unwrapped.scope);
  if (aliasTarget === 'ImmutableMap') {
    const paramsPath = unwrapped.get('typeParameters');
    if (
      !Array.isArray(paramsPath)
      && paramsPath.node
      && t.isTSTypeParameterInstantiation(paramsPath.node)
    ) {
      const params = paramsPath.get('params');
      if (Array.isArray(params)) {
        return {
          keyPath: params[0] ?? null,
          valuePath: params[1] ?? null,
        };
      }
    }
  }
  const typeName = unwrapped.node.typeName;
  if (
    !t.isIdentifier(typeName)
    || (
      typeName.name !== 'Map'
      && typeName.name !== 'ReadonlyMap'
      && typeName.name !== 'ImmutableMap'
    )
  ) {
    return null;
  }
  const paramsPath = unwrapped.get('typeParameters');
  if (
    !Array.isArray(paramsPath)
    && paramsPath.node
    && t.isTSTypeParameterInstantiation(paramsPath.node)
  ) {
    const params = paramsPath.get('params');
    if (Array.isArray(params)) {
      return {
        keyPath: params[0] ?? null,
        valuePath: params[1] ?? null,
      };
    }
  }
  return null;
}

export function extractProperties(
  memberPaths: NodePath<t.TSPropertySignature>[],
  generatedTypes: t.TSTypeAliasDeclaration[],
  parentName: string,
  state: PluginStateFlags,
  declaredTypeNames: Set<string>,
  declaredMessageTypeNames: Set<string>,
  getMessageReferenceName: (typePath: NodePath<t.TSType>) => string | null,
  assertSupportedType: (
    typePath: NodePath<t.TSType>,
    declaredTypeNames: Set<string>
  ) => void,
  typeParameters: TypeParameter[] = []
): PropDescriptor[] {
  const props: PropDescriptor[] = [];
  const usedFieldNumbers = new Set<number>();
  const usedNames = new Set<string>();

  for (const memberPath of memberPaths) {
    if (memberPath.node.computed) {
      throw memberPath.buildCodeFrameError(
        'Propane properties cannot use computed keys.'
      );
    }

    const { name, fieldNumber } = normalizePropertyKey(memberPath);

    if (usedNames.has(name)) {
      throw memberPath.buildCodeFrameError(
        `Duplicate propane property name "${name}".`
      );
    }
    usedNames.add(name);

    if (fieldNumber !== null) {
      if (fieldNumber <= 0) {
        throw memberPath.buildCodeFrameError(
          'Propane property numbers must be positive integers.'
        );
      }

      if (usedFieldNumbers.has(fieldNumber)) {
        throw memberPath.buildCodeFrameError(
          `Propane property number ${fieldNumber} is already in use.`
        );
      }

      usedFieldNumbers.add(fieldNumber);
    }

    const typeAnnotationPath = memberPath.get('typeAnnotation');
    if (!typeAnnotationPath?.node) {
      throw memberPath.buildCodeFrameError(
        'Propane properties must include a type annotation.'
      );
    }

    const propTypePath = typeAnnotationPath.get('typeAnnotation');
    if (!propTypePath?.node) {
      throw memberPath.buildCodeFrameError(
        'Propane properties must include a type annotation.'
      );
    }

    // Handle implicit message types in Array/Set/Map
    handleImplicitTypes(
      propTypePath,
      name,
      generatedTypes,
      parentName,
      declaredTypeNames,
      declaredMessageTypeNames
    );

    // Validate supported types after implicit type expansion
    assertSupportedType(propTypePath, declaredTypeNames);

    const aliases = state.typeAliases ?? {};
    const aliasTarget = propTypePath.isTSTypeReference()
      ? resolveAliasTargetName(propTypePath, aliases, propTypePath.scope)
      : null;
    const propTypeRef = propTypePath.isTSTypeReference()
      ? propTypePath.node
      : null;

    const mapType = isMapTypeNode(propTypePath.node) || aliasTarget === 'ImmutableMap';
    const mapArgs = mapType
      ? (getMapTypeArguments(propTypePath.node)
        ?? (aliasTarget === 'ImmutableMap'
          ? {
            keyType: propTypeRef?.typeParameters?.params?.[0] ?? t.tsUnknownKeyword(),
            valueType: propTypeRef?.typeParameters?.params?.[1] ?? t.tsUnknownKeyword(),
          }
          : null))
      : null;
    const arrayType = isArrayTypeNode(propTypePath.node) || aliasTarget === 'ImmutableArray';
    const arrayElementType = arrayType
      ? (getArrayElementType(propTypePath.node)
        ?? (aliasTarget === 'ImmutableArray'
          ? propTypeRef?.typeParameters?.params?.[0] ?? null
          : null))
      : null;
    const setType = isSetTypeNode(propTypePath.node) || aliasTarget === 'ImmutableSet';
    const setArg = setType
      ? (getSetTypeArguments(propTypePath.node)
        ?? (aliasTarget === 'ImmutableSet'
          ? propTypeRef?.typeParameters?.params?.[0] ?? t.tsUnknownKeyword()
          : null))
      : null;
    const arrayElementPath = arrayType ? getArrayElementTypePath(propTypePath, aliases) : null;
    const setElementPath = setType ? getSetElementTypePath(propTypePath, aliases) : null;
    const mapArgPaths = mapType ? getMapTypeArgumentPaths(propTypePath, aliases) : null;
    const messageTypeName = getMessageReferenceName(propTypePath);
    const arrayElementMessageTypeName = arrayElementPath
      ? getMessageReferenceName(arrayElementPath)
      : null;
    const setElementMessageTypeName = setElementPath
      ? getMessageReferenceName(setElementPath)
      : null;
    const mapKeyMessageTypeName = mapArgPaths?.keyPath
      ? getMessageReferenceName(mapArgPaths.keyPath)
      : null;
    const mapValueMessageTypeName = mapArgPaths?.valuePath
      ? getMessageReferenceName(mapArgPaths.valuePath)
      : null;
    const resolvedArrayElementMessageTypeName = arrayElementMessageTypeName;
    const resolvedSetElementMessageTypeName = setElementMessageTypeName;
    const resolvedMapKeyMessageTypeName = mapKeyMessageTypeName;
    const resolvedMapValueMessageTypeName = mapValueMessageTypeName;
    const unionMessageTypes = extractUnionMessageTypes(
      propTypePath,
      getMessageReferenceName
    );
    const arrayElementUnionMessageTypes = arrayElementPath
      ? extractUnionMessageTypes(arrayElementPath, getMessageReferenceName)
      : [];
    const setElementUnionMessageTypes = setElementPath
      ? extractUnionMessageTypes(setElementPath, getMessageReferenceName)
      : [];
    const mapKeyUnionMessageTypes = mapArgPaths?.keyPath
      ? extractUnionMessageTypes(mapArgPaths.keyPath, getMessageReferenceName)
      : [];
    const mapValueUnionMessageTypes = mapArgPaths?.valuePath
      ? extractUnionMessageTypes(mapArgPaths.valuePath, getMessageReferenceName)
      : [];
    const unionHasString = extractUnionHasString(propTypePath);
    const unionHasDate = extractUnionHasDate(propTypePath, aliases);
    const unionHasUrl = extractUnionHasUrl(propTypePath, aliases);
    const arrayElementUnionHasString = arrayElementPath
      ? extractUnionHasString(arrayElementPath)
      : false;
    const setElementUnionHasString = setElementPath
      ? extractUnionHasString(setElementPath)
      : false;
    const mapKeyUnionHasString = mapArgPaths?.keyPath
      ? extractUnionHasString(mapArgPaths.keyPath)
      : false;
    const mapValueUnionHasString = mapArgPaths?.valuePath
      ? extractUnionHasString(mapArgPaths.valuePath)
      : false;

    assertUnionTagsUnique(unionMessageTypes, state, memberPath, `"${name}"`);
    if (arrayElementUnionMessageTypes.length > 0) {
      assertUnionTagsUnique(
        arrayElementUnionMessageTypes,
        state,
        memberPath,
        `"${name}" array element`
      );
    }
    if (setElementUnionMessageTypes.length > 0) {
      assertUnionTagsUnique(
        setElementUnionMessageTypes,
        state,
        memberPath,
        `"${name}" set element`
      );
    }
    if (mapKeyUnionMessageTypes.length > 0) {
      assertUnionTagsUnique(
        mapKeyUnionMessageTypes,
        state,
        memberPath,
        `"${name}" map key`
      );
    }
    if (mapValueUnionMessageTypes.length > 0) {
      assertUnionTagsUnique(
        mapValueUnionMessageTypes,
        state,
        memberPath,
        `"${name}" map value`
      );
    }

    // Detect generic type parameters
    const genericParamInfo = getGenericParamInfo(propTypePath, typeParameters);
    const unionGenericParams = extractUnionGenericParams(
      propTypePath,
      typeParameters
    );
    const isGenericParam = genericParamInfo !== null;
    const unionNeedsConstructor = unionGenericParams.some((paramName) =>
      typeParameters.find((param) => param.name === paramName)?.requiresConstructor
    );
    if (genericParamInfo?.requiresConstructor || unionNeedsConstructor) {
      state.usesMessageConstructor = true;
    }

    const typeRefName = propTypePath.isTSTypeReference()
      && t.isIdentifier(propTypePath.node.typeName)
      ? propTypePath.node.typeName.name
      : null;
    const resolvedAliasTarget = aliasTarget
      ?? (typeRefName && getAliasSourcesForTarget(typeRefName, aliases, propTypePath.scope).length > 0
        ? typeRefName
        : null);
    const isDateType = resolvedAliasTarget === 'ImmutableDate';
    const isUrlType = resolvedAliasTarget === 'ImmutableUrl';
    const isArrayBufferType = resolvedAliasTarget === 'ImmutableArrayBuffer';

    // Recursively scan for type usage to ensure imports are generated
    scanTypeForUsage(propTypePath, state);

    if (mapType) {
      state.usesImmutableMap = true;
      state.usesEquals = true;
      // Check if map key or value types need ImmutableDate/ImmutableUrl/ImmutableArray
      if (mapArgs) {
        const resolvedKeyType = resolveAliasTypeNode(
          t.cloneNode(mapArgs.keyType),
          aliases,
          propTypePath.scope
        );
        if (
          isArrayTypeNode(mapArgs.keyType)
          || (t.isTSTypeReference(resolvedKeyType)
            && t.isIdentifier(resolvedKeyType.typeName)
            && resolvedKeyType.typeName.name === 'ImmutableArray')
        ) {
          state.usesImmutableArray = true;
        }
      }
    }
    if (setType) {
      state.usesImmutableSet = true;
    }
    if (arrayType) {
      state.usesImmutableArray = true;
    }
    if (isDateType) {
      state.usesImmutableDate = true;
    }
    if (isUrlType) {
      state.usesImmutableUrl = true;
    }
    if (isArrayBufferType) {
      state.usesImmutableArrayBuffer = true;
    }

    const resolvedTypeNode = resolveAliasTypeNode(
      t.cloneNode(propTypePath.node),
      aliases,
      propTypePath.scope
    );
    const runtimeType = mapType || setType || arrayType
      ? wrapImmutableType(t.cloneNode(resolvedTypeNode), aliases)
      : t.cloneNode(resolvedTypeNode);

    let inputTypeAnnotation: t.TSType = mapType || setType || arrayType
      ? buildInputAcceptingMutable(t.cloneNode(resolvedTypeNode), aliases)
      : t.cloneNode(resolvedTypeNode);

    const originalTypeNode = t.cloneNode(propTypePath.node);
    let displayType: t.TSType = t.cloneNode(originalTypeNode);
    if (mapType && mapArgs) {
      const mapRef = t.tsTypeReference(
        t.identifier('Map'),
        t.tsTypeParameterInstantiation([
          t.cloneNode(mapArgs.keyType),
          t.cloneNode(mapArgs.valueType),
        ])
      );
      const iterableTuple = t.tsTupleType([
        t.cloneNode(mapArgs.keyType),
        t.cloneNode(mapArgs.valueType),
      ]);
      const iterableRef = t.tsTypeReference(
        t.identifier('Iterable'),
        t.tsTypeParameterInstantiation([iterableTuple])
      );
      displayType = t.tsUnionType([mapRef, iterableRef]);
    } else if (setType && setArg) {
      const setRef = t.tsTypeReference(
        t.identifier('Set'),
        t.tsTypeParameterInstantiation([t.cloneNode(setArg)])
      );
      const iterableRef = t.tsTypeReference(
        t.identifier('Iterable'),
        t.tsTypeParameterInstantiation([t.cloneNode(setArg)])
      );
      displayType = t.tsUnionType([setRef, iterableRef]);
    } else if (arrayType && arrayElementType) {
      // Check if element type needs wrapping via alias targets
      // If so, include both mutable and immutable element variants in the union
      // so that internal immutable arrays can be passed to the constructor
      let elementUnionType: t.TSType | null = null;
      const resolvedElementType = resolveAliasTypeNode(
        t.cloneNode(arrayElementType),
        aliases,
        propTypePath.scope
      );
      if (t.isTSTypeReference(resolvedElementType) && t.isIdentifier(resolvedElementType.typeName)) {
        const targetName = resolvedElementType.typeName.name;
        const aliasSources = getAliasSourcesForTarget(
          targetName,
          aliases,
          propTypePath.scope
        );
        if (aliasSources.length > 0) {
          elementUnionType = t.tsUnionType([
            t.tsTypeReference(t.identifier(targetName)),
            ...aliasSources.map((source) =>
              t.tsTypeReference(t.identifier(source))
            ),
          ]);
        }
      }
      // Use the union element type if available, otherwise use the original element type
      const effectiveElementType = elementUnionType ?? t.cloneNode(arrayElementType);
      const arrayRef = t.tsArrayType(t.cloneNode(effectiveElementType));
      const iterableRef = t.tsTypeReference(
        t.identifier('Iterable'),
        t.tsTypeParameterInstantiation([t.cloneNode(effectiveElementType)])
      );
      displayType = t.tsUnionType([arrayRef, iterableRef]);
    } else if (isDateType) {
      const aliasSources = getAliasSourcesForTarget(
        'ImmutableDate',
        aliases,
        propTypePath.scope
      );
      displayType = t.tsUnionType([
        t.tsTypeReference(t.identifier('ImmutableDate')),
        ...aliasSources.map((source) => t.tsTypeReference(t.identifier(source))),
      ]);
      inputTypeAnnotation = t.cloneNode(displayType);
    } else if (isUrlType) {
      const aliasSources = getAliasSourcesForTarget(
        'ImmutableUrl',
        aliases,
        propTypePath.scope
      );
      displayType = t.tsUnionType([
        t.tsTypeReference(t.identifier('ImmutableUrl')),
        ...aliasSources.map((source) => t.tsTypeReference(t.identifier(source))),
      ]);
      inputTypeAnnotation = t.cloneNode(displayType);
    } else if (isArrayBufferType) {
      const aliasSources = getAliasSourcesForTarget(
        'ImmutableArrayBuffer',
        aliases,
        propTypePath.scope
      );
      displayType = t.tsUnionType([
        t.tsTypeReference(t.identifier('ImmutableArrayBuffer')),
        ...aliasSources.map((source) => t.tsTypeReference(t.identifier(source))),
      ]);
      inputTypeAnnotation = t.tsUnionType([
        t.cloneNode(displayType),
        t.tsTypeReference(t.identifier('ArrayBufferView')),
        t.tsTypeReference(
          t.identifier('Iterable'),
          t.tsTypeParameterInstantiation([t.tsNumberKeyword()])
        ),
        t.tsArrayType(t.tsNumberKeyword()),
      ]);
    }

    const unionDateUrlDisplayType = buildUnionDateUrlDisplayType(propTypePath, aliases);
    if (unionDateUrlDisplayType) {
      displayType = unionDateUrlDisplayType;
    }

    if (
      !mapType
      && !setType
      && !arrayType
      && !isDateType
      && !isUrlType
      && !isArrayBufferType
      && !messageTypeName
      && !t.isNodesEquivalent(originalTypeNode, resolvedTypeNode)
      && t.isNodesEquivalent(displayType, originalTypeNode)
    ) {
      const unionType = t.tsUnionType([
        t.cloneNode(originalTypeNode),
        t.cloneNode(resolvedTypeNode),
      ]);
      displayType = unionType;
      inputTypeAnnotation = t.cloneNode(unionType);
    }

    if (messageTypeName && !isDateType && !isUrlType) {
      const typeArgs = t.isTSTypeReference(propTypePath.node)
        && propTypePath.node.typeParameters
        ? t.tsTypeParameterInstantiation(
          propTypePath.node.typeParameters.params.map((param) => t.cloneNode(param))
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

    const resolvedArrayElementType = arrayElementType
      ? resolveAliasTypeNode(t.cloneNode(arrayElementType), aliases, propTypePath.scope)
      : null;
    const resolvedMapKeyType = mapArgs?.keyType
      ? resolveAliasTypeNode(t.cloneNode(mapArgs.keyType), aliases, propTypePath.scope)
      : null;
    const resolvedMapValueType = mapArgs?.valueType
      ? resolveAliasTypeNode(t.cloneNode(mapArgs.valueType), aliases, propTypePath.scope)
      : null;
    const resolvedSetElementType = setArg
      ? resolveAliasTypeNode(t.cloneNode(setArg), aliases, propTypePath.scope)
      : null;

    props.push({
      name,
      fieldNumber,
      optional: Boolean(memberPath.node.optional),
      readonly: Boolean(memberPath.node.readonly),
      isArray: arrayType,
      isSet: setType,
      isMap: mapType,
      isDateType,
      isUrlType,
      isArrayBufferType,
      isMessageType: Boolean(messageTypeName),
      messageTypeName,
      arrayElementMessageTypeName: resolvedArrayElementMessageTypeName,
      setElementMessageTypeName: resolvedSetElementMessageTypeName,
      mapKeyMessageTypeName: resolvedMapKeyMessageTypeName,
      mapValueMessageTypeName: resolvedMapValueMessageTypeName,
      unionMessageTypes,
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
      typeAnnotation: runtimeType,
      inputTypeAnnotation,
      arrayElementType: resolvedArrayElementType,
      mapKeyType: resolvedMapKeyType,
      mapValueType: resolvedMapValueType,
      mapKeyInputType: resolvedMapKeyType
        ? buildInputAcceptingMutable(resolvedMapKeyType, aliases)
        : null,
      mapValueInputType: resolvedMapValueType
        ? buildInputAcceptingMutable(resolvedMapValueType, aliases)
        : null,
      setElementType: resolvedSetElementType,
      setElementInputType: resolvedSetElementType
        ? buildInputAcceptingMutable(resolvedSetElementType, aliases)
        : null,
      displayType,
      // Generic type parameter tracking
      isGenericParam,
      genericParamName: genericParamInfo?.name ?? null,
      genericParamIndex: genericParamInfo?.index ?? null,
      genericParamRequiresConstructor: genericParamInfo?.requiresConstructor ?? false,
      unionGenericParams,
    });
  }

  return props;
}

function handleImplicitTypes(
  propTypePath: NodePath<t.TSType>,
  propName: string,
  generatedTypes: t.TSTypeAliasDeclaration[],
  parentName: string,
  declaredTypeNames: Set<string>,
  declaredMessageTypeNames: Set<string>
): void {
  const namePrefix = `${parentName}_${capitalize(propName)}`;

  const unwrapParenthesized = (path: NodePath<t.TSType>): NodePath<t.TSType> => (
    path.isTSParenthesizedType() ? path.get('typeAnnotation') : path
  );

  const getTypeParamPath = (
    typeRefPath: NodePath<t.TSTypeReference>,
    index: number
  ): NodePath<t.TSType> | null => {
    const typeParamsPath = typeRefPath.get('typeParameters');
    if (!isTSTypeParameterInstantiation(typeParamsPath)) {
      return null;
    }
    const params = getTypeParams(typeParamsPath);
    return params[index] ?? null;
  };

  const liftUnionLiteralMembers = (
    unionPath: NodePath<t.TSUnionType>,
    unionNamePrefix: string
  ): void => {
    let unionIndex = 1;
    for (const memberPath of unionPath.get('types')) {
      const unwrapped = unwrapParenthesized(memberPath);
      if (unwrapped.isTSTypeLiteral()) {
        const newTypeName = `${unionNamePrefix}_Union${unionIndex}`;
        const newTypeAlias = t.tsTypeAliasDeclaration(
          t.identifier(newTypeName),
          null,
          t.cloneNode(unwrapped.node)
        );
        generatedTypes.push(newTypeAlias);
        declaredTypeNames.add(newTypeName);
        declaredMessageTypeNames.add(newTypeName);
        memberPath.replaceWith(t.tsTypeReference(t.identifier(newTypeName)));
        unionIndex += 1;
      }
    }
  };

  if (propTypePath.isTSParenthesizedType()) {
    handleImplicitTypes(
      propTypePath.get('typeAnnotation'),
      propName,
      generatedTypes,
      parentName,
      declaredTypeNames,
      declaredMessageTypeNames
    );
    return;
  }

  if (propTypePath.isTSUnionType()) {
    liftUnionLiteralMembers(propTypePath, namePrefix);
    return;
  }

  if (isArrayTypeNode(propTypePath.node)) {
    const elementPath = propTypePath.isTSArrayType()
      ? propTypePath.get('elementType')
      : propTypePath.isTSTypeReference()
        ? getTypeParamPath(propTypePath, 0)
        : null;
    if (elementPath) {
      const unwrappedElement = unwrapParenthesized(elementPath);
      if (unwrappedElement.isTSTypeLiteral()) {
        const newItemName = `${namePrefix}_Item`;
        const newTypeAlias = t.tsTypeAliasDeclaration(
          t.identifier(newItemName),
          null,
          t.cloneNode(unwrappedElement.node)
        );
        generatedTypes.push(newTypeAlias);
        declaredTypeNames.add(newItemName);
        declaredMessageTypeNames.add(newItemName);
        elementPath.replaceWith(t.tsTypeReference(t.identifier(newItemName)));
      } else if (unwrappedElement.isTSUnionType()) {
        liftUnionLiteralMembers(unwrappedElement, `${namePrefix}_Item`);
      }
    }
    return;
  }

  if (propTypePath.isTSTypeLiteral()) {
    const newTypeName = namePrefix;
    const newTypeAlias = t.tsTypeAliasDeclaration(
      t.identifier(newTypeName),
      null,
      t.cloneNode(propTypePath.node)
    );

    generatedTypes.push(newTypeAlias);
    declaredTypeNames.add(newTypeName);
    declaredMessageTypeNames.add(newTypeName);

    propTypePath.replaceWith(t.tsTypeReference(t.identifier(newTypeName)));
    return;
  }

  if (isSetTypeNode(propTypePath.node)) {
    if (propTypePath.isTSTypeReference()) {
      const elementPath = getTypeParamPath(propTypePath, 0);
      if (elementPath) {
        const unwrappedElement = unwrapParenthesized(elementPath);
        if (unwrappedElement.isTSTypeLiteral()) {
          const newItemName = `${namePrefix}_Item`;
          const newTypeAlias = t.tsTypeAliasDeclaration(
            t.identifier(newItemName),
            null,
            t.cloneNode(unwrappedElement.node)
          );
          generatedTypes.push(newTypeAlias);
          declaredTypeNames.add(newItemName);
          declaredMessageTypeNames.add(newItemName);
          elementPath.replaceWith(t.tsTypeReference(t.identifier(newItemName)));
        } else if (unwrappedElement.isTSUnionType()) {
          liftUnionLiteralMembers(unwrappedElement, `${namePrefix}_Item`);
        }
      }
    }
    return;
  }

  if (isMapTypeNode(propTypePath.node)) {
    if (propTypePath.isTSTypeReference()) {
      const keyPath = getTypeParamPath(propTypePath, 0);
      const valuePath = getTypeParamPath(propTypePath, 1);

      if (keyPath) {
        const unwrappedKey = unwrapParenthesized(keyPath);
        if (unwrappedKey.isTSTypeLiteral()) {
          const newKeyName = `${namePrefix}_Key`;
          const newKeyAlias = t.tsTypeAliasDeclaration(
            t.identifier(newKeyName),
            null,
            t.cloneNode(unwrappedKey.node)
          );
          generatedTypes.push(newKeyAlias);
          declaredTypeNames.add(newKeyName);
          declaredMessageTypeNames.add(newKeyName);
          keyPath.replaceWith(t.tsTypeReference(t.identifier(newKeyName)));
        } else if (unwrappedKey.isTSUnionType()) {
          liftUnionLiteralMembers(unwrappedKey, `${namePrefix}_Key`);
        }
      }

      if (valuePath) {
        const unwrappedValue = unwrapParenthesized(valuePath);
        if (unwrappedValue.isTSTypeLiteral()) {
          const newValueName = `${namePrefix}_Value`;
          const newValueAlias = t.tsTypeAliasDeclaration(
            t.identifier(newValueName),
            null,
            t.cloneNode(unwrappedValue.node)
          );
          generatedTypes.push(newValueAlias);
          declaredTypeNames.add(newValueName);
          declaredMessageTypeNames.add(newValueName);
          valuePath.replaceWith(t.tsTypeReference(t.identifier(newValueName)));
        } else if (unwrappedValue.isTSUnionType()) {
          liftUnionLiteralMembers(unwrappedValue, `${namePrefix}_Value`);
        }
      }
    }
  }
}

export function getDefaultValue(
  prop: {
    optional: boolean;
    isArray: boolean;
    isMap: boolean;
    isSet: boolean;
    isMessageType?: boolean;
    messageTypeName?: string | null;
    typeAnnotation: t.TSType;
  },
  declaredMessageTypeNames?: Set<string>,
  typeAliasDefinitions?: Map<string, t.TSType>,
  aliases?: TypeAliasMap
): t.Expression {
  if (prop.optional) {
    return t.identifier('undefined');
  }

  if (prop.isArray) {
    return t.newExpression(t.identifier('ImmutableArray'), []);
  }

  if (prop.isMap) {
    return t.newExpression(t.identifier('ImmutableMap'), []);
  }

  if (prop.isSet) {
    return t.newExpression(t.identifier('ImmutableSet'), []);
  }

  // If the property is a known message type (including imports), use it
  if (prop.isMessageType && prop.messageTypeName) {
    return t.newExpression(t.identifier(prop.messageTypeName), []);
  }

  return getDefaultValueForType(
    prop.typeAnnotation,
    declaredMessageTypeNames,
    typeAliasDefinitions,
    aliases
  );
}

export function getDefaultValueForType(
  typeNode: t.TSType,
  declaredMessageTypeNames?: Set<string>,
  typeAliasDefinitions?: Map<string, t.TSType>,
  aliases?: TypeAliasMap
): t.Expression {
  if (t.isTSParenthesizedType(typeNode)) {
    return getDefaultValueForType(
      typeNode.typeAnnotation,
      declaredMessageTypeNames,
      typeAliasDefinitions,
      aliases
    );
  }

  if (t.isTSNumberKeyword(typeNode)) {
    return t.numericLiteral(0);
  }

  if (t.isTSStringKeyword(typeNode)) {
    return t.stringLiteral('');
  }

  if (t.isTSBooleanKeyword(typeNode)) {
    return t.booleanLiteral(false);
  }

  if (t.isTSBigIntKeyword(typeNode)) {
    return t.bigIntLiteral('0');
  }

  if (t.isTSNullKeyword(typeNode)) {
    return t.nullLiteral();
  }

  if (t.isTSUndefinedKeyword(typeNode)) {
    return t.identifier('undefined');
  }

  if (t.isTSUnionType(typeNode) && typeNode.types.length > 0) {
    return getDefaultValueForType(
      typeNode.types[0]!,
      declaredMessageTypeNames,
      typeAliasDefinitions,
      aliases
    );
  }

  // Handle literal types (string, number, boolean literals)
  if (t.isTSLiteralType(typeNode)) {
    const literal = typeNode.literal;
    if (t.isStringLiteral(literal)) {
      return t.stringLiteral(literal.value);
    }
    if (t.isNumericLiteral(literal)) {
      return t.numericLiteral(literal.value);
    }
    if (t.isBooleanLiteral(literal)) {
      return t.booleanLiteral(literal.value);
    }
    if (t.isBigIntLiteral(literal)) {
      return t.bigIntLiteral(literal.value);
    }
    if (t.isUnaryExpression(literal) && literal.operator === '-') {
      // Handle negative numbers like -1
      if (t.isNumericLiteral(literal.argument)) {
        return t.unaryExpression('-', t.numericLiteral(literal.argument.value));
      }
    }
  }

  const resolvedTypeNode = aliases
    ? resolveAliasTypeNode(t.cloneNode(typeNode), aliases)
    : typeNode;

  if (t.isTSTypeReference(resolvedTypeNode)) {
    const typeName = resolvedTypeNode.typeName;
    if (t.isIdentifier(typeName)) {
      if (typeName.name === 'ImmutableDate') {
        return t.newExpression(
          t.identifier('ImmutableDate'),
          [t.numericLiteral(0)]
        );
      }
      if (typeName.name === 'ImmutableUrl') {
        return t.newExpression(
          t.identifier('ImmutableUrl'),
          [t.stringLiteral('about:blank')]
        );
      }
      if (typeName.name === 'ImmutableArrayBuffer') {
        return t.newExpression(t.identifier('ImmutableArrayBuffer'), []);
      }
      // Only instantiate if it's a known message type
      // Type aliases (like branded types or string unions) can't be instantiated
      if (declaredMessageTypeNames?.has(typeName.name)) {
        return t.newExpression(t.identifier(typeName.name), []);
      }
      // Try to resolve type alias to get a proper default value
      // This handles cases like `type DistanceUnit = 'm' | 'ft'`
      if (typeAliasDefinitions?.has(typeName.name)) {
        const resolvedType = typeAliasDefinitions.get(typeName.name)!;
        return getDefaultValueForType(
          resolvedType,
          declaredMessageTypeNames,
          typeAliasDefinitions,
          aliases
        );
      }
      // Unknown type reference - fall through to undefined
    }
  }

  // Fallback for unknown types (including type aliases that can't be instantiated)
  return t.identifier('undefined');
}

export function wrapImmutableType(
  node: t.TSType,
  aliases?: TypeAliasMap
): t.TSType;
export function wrapImmutableType(
  node: t.TSType | null,
  aliases?: TypeAliasMap
): t.TSType | null;
export function wrapImmutableType(
  node: t.TSType | null,
  aliases?: TypeAliasMap
): t.TSType | null {
  if (!node) {
    return node;
  }

  const resolvedNode = aliases
    ? resolveAliasTypeNode(t.cloneNode(node), aliases)
    : node;

  if (t.isTSParenthesizedType(resolvedNode)) {
    return t.tsParenthesizedType(
      wrapImmutableType(t.cloneNode(resolvedNode.typeAnnotation), aliases)
    );
  }

  if (t.isTSUnionType(resolvedNode)) {
    const mapped = resolvedNode.types.map((member) => {
      const inner = t.isTSParenthesizedType(member)
        ? member.typeAnnotation
        : member;
      if (
        t.isTSTypeReference(inner)
        && t.isIdentifier(inner.typeName)
      ) {
        return t.cloneNode(inner);
      }
      return t.cloneNode(member);
    });
    return t.tsUnionType(mapped);
  }

  if (t.isTSArrayType(resolvedNode)) {
    return t.tsTypeReference(
      t.identifier('ImmutableArray'),
      t.tsTypeParameterInstantiation([
        wrapImmutableType(t.cloneNode(resolvedNode.elementType), aliases)
      ])
    );
  }

  if (
    t.isTSTypeReference(resolvedNode)
    && t.isIdentifier(resolvedNode.typeName)
  ) {
    const name = resolvedNode.typeName.name;
    if (name === 'Map'
      || name === 'ReadonlyMap'
      || name === 'ImmutableMap') {
      const params = resolvedNode.typeParameters?.params ?? [];
      const [key, value] = [
        wrapImmutableType(
          params[0] ? t.cloneNode(params[0]) : t.tsUnknownKeyword(),
          aliases
        ),
        wrapImmutableType(
          params[1] ? t.cloneNode(params[1]) : t.tsUnknownKeyword(),
          aliases
        ),
      ];
      return t.tsTypeReference(
        t.identifier('ImmutableMap'),
        t.tsTypeParameterInstantiation([key, value])
      );
    }

    if (name === 'Set'
      || name === 'ReadonlySet'
      || name === 'ImmutableSet') {
      const params = resolvedNode.typeParameters?.params ?? [];
      const [elem] = [
        wrapImmutableType(
          params[0] ? t.cloneNode(params[0]) : t.tsUnknownKeyword(),
          aliases
        ),
      ];
      return t.tsTypeReference(
        t.identifier('ImmutableSet'),
        t.tsTypeParameterInstantiation([elem])
      );
    }

    if (name === 'Array'
      || name === 'ReadonlyArray'
      || name === 'ImmutableArray') {
      const params = resolvedNode.typeParameters?.params ?? [];
      const [elem] = [
        wrapImmutableType(
          params[0] ? t.cloneNode(params[0]) : t.tsUnknownKeyword(),
          aliases
        ),
      ];
      return t.tsTypeReference(
        t.identifier('ImmutableArray'),
        t.tsTypeParameterInstantiation([elem])
      );
    }
  }

  return resolvedNode;
}

export function buildInputAcceptingMutable(
  node: t.TSType,
  aliases?: TypeAliasMap
): t.TSType;
export function buildInputAcceptingMutable(
  node: t.TSType | null,
  aliases?: TypeAliasMap
): t.TSType | null;
export function buildInputAcceptingMutable(
  node: t.TSType | null,
  aliases?: TypeAliasMap
): t.TSType | null {
  if (!node) {
    return node;
  }

  const resolvedNode = aliases
    ? resolveAliasTypeNode(t.cloneNode(node), aliases)
    : node;

  if (t.isTSParenthesizedType(resolvedNode)) {
    return t.tsParenthesizedType(
      buildInputAcceptingMutable(t.cloneNode(resolvedNode.typeAnnotation), aliases)
    );
  }

  if (t.isTSArrayType(resolvedNode)) {
    const element = buildInputAcceptingMutable(
      t.cloneNode(resolvedNode.elementType),
      aliases
    );
    return t.tsUnionType([
      t.tsTypeReference(
        t.identifier('ImmutableArray'),
        t.tsTypeParameterInstantiation([element])
      ),
      t.tsTypeReference(
        t.identifier('ReadonlyArray'),
        t.tsTypeParameterInstantiation([element])
      ),
      t.tsTypeReference(
        t.identifier('Iterable'),
        t.tsTypeParameterInstantiation([element])
      ),
    ]);
  }

  if (
    t.isTSTypeReference(resolvedNode)
    && t.isIdentifier(resolvedNode.typeName)
  ) {
    const name = resolvedNode.typeName.name;
    const aliasSources = aliases
      ? getAliasSourcesForTarget(name, aliases)
      : [];
    if (aliasSources.length > 0 && !COLLECTION_ALIAS_TARGETS.has(name)) {
      return t.tsUnionType([
        t.tsTypeReference(t.identifier(name)),
        ...aliasSources.map((source) => t.tsTypeReference(t.identifier(source))),
      ]);
    }

    // Array-style reference (T[], ReadonlyArray<T>, ImmutableArray<T>)
    if (name === 'Array'
      || name === 'ReadonlyArray'
      || name === 'ImmutableArray') {
      const elem = buildInputAcceptingMutable(
        resolvedNode.typeParameters?.params?.[0]
          ? t.cloneNode(resolvedNode.typeParameters.params[0])
          : t.tsUnknownKeyword(),
        aliases
      );
      return t.tsUnionType([
        t.tsTypeReference(
          t.identifier('ImmutableArray'),
          t.tsTypeParameterInstantiation([elem])
        ),
        t.tsTypeReference(
          t.identifier('ReadonlyArray'),
          t.tsTypeParameterInstantiation([elem])
        ),
        t.tsTypeReference(
          t.identifier('Iterable'),
          t.tsTypeParameterInstantiation([elem])
        ),
      ]);
    }

    // Set-style reference
    if (name === 'Set'
      || name === 'ReadonlySet'
      || name === 'ImmutableSet') {
      const elem = buildInputAcceptingMutable(
        resolvedNode.typeParameters?.params?.[0]
          ? t.cloneNode(resolvedNode.typeParameters.params[0])
          : t.tsUnknownKeyword(),
        aliases
      );
      return t.tsUnionType([
        t.tsTypeReference(
          t.identifier('ImmutableSet'),
          t.tsTypeParameterInstantiation([elem])
        ),
        t.tsTypeReference(
          t.identifier('ReadonlySet'),
          t.tsTypeParameterInstantiation([elem])
        ),
        t.tsTypeReference(
          t.identifier('Iterable'),
          t.tsTypeParameterInstantiation([elem])
        ),
      ]);
    }

    // Map-style reference
    if (name === 'Map'
      || name === 'ReadonlyMap'
      || name === 'ImmutableMap') {
      const keyParam = resolvedNode.typeParameters?.params?.[0]
        ? t.cloneNode(resolvedNode.typeParameters.params[0])
        : t.tsUnknownKeyword();
      const valueParam = resolvedNode.typeParameters?.params?.[1]
        ? t.cloneNode(resolvedNode.typeParameters.params[1])
        : t.tsUnknownKeyword();
      const key = buildInputAcceptingMutable(keyParam, aliases);
      const value = buildInputAcceptingMutable(valueParam, aliases);
      const tupleType = t.tsTupleType([key, value]);
      return t.tsUnionType([
        t.tsTypeReference(
          t.identifier('ImmutableMap'),
          t.tsTypeParameterInstantiation([key, value])
        ),
        t.tsTypeReference(
          t.identifier('ReadonlyMap'),
          t.tsTypeParameterInstantiation([key, value])
        ),
        t.tsTypeReference(
          t.identifier('Iterable'),
          t.tsTypeParameterInstantiation([tupleType])
        ),
      ]);
    }
  }

  return resolvedNode;
}

function extractUnionMessageTypes(
  typePath: NodePath<t.TSType>,
  getMessageReferenceName: (path: NodePath<t.TSType>) => string | null
): string[] {
  const unwrapped = unwrapParenthesizedTypePath(typePath);
  if (!unwrapped.isTSUnionType()) {
    return [];
  }

  const messageTypes: string[] = [];
  for (const memberPath of unwrapped.get('types')) {
    const memberUnwrapped = unwrapParenthesizedTypePath(memberPath);
    const messageName = getMessageReferenceName(memberUnwrapped);
    if (messageName) {
      messageTypes.push(messageName);
    }
  }

  return Array.from(new Set(messageTypes));
}

function extractUnionHasString(typePath: NodePath<t.TSType>): boolean {
  const unwrapped = unwrapParenthesizedTypePath(typePath);
  if (!unwrapped.isTSUnionType()) {
    return false;
  }
  return unwrapped.get('types').some((memberPath) =>
    isStringType(memberPath)
  );
}

function extractUnionHasDate(
  typePath: NodePath<t.TSType>,
  aliases: TypeAliasMap
): boolean {
  const unwrapped = unwrapParenthesizedTypePath(typePath);
  if (!unwrapped.isTSUnionType()) {
    return false;
  }
  return unwrapped.get('types').some((memberPath) =>
    resolveAliasTargetForUnionMember(memberPath, aliases) === 'ImmutableDate'
  );
}

function extractUnionHasUrl(
  typePath: NodePath<t.TSType>,
  aliases: TypeAliasMap
): boolean {
  const unwrapped = unwrapParenthesizedTypePath(typePath);
  if (!unwrapped.isTSUnionType()) {
    return false;
  }
  return unwrapped.get('types').some((memberPath) =>
    resolveAliasTargetForUnionMember(memberPath, aliases) === 'ImmutableUrl'
  );
}

function buildUnionDateUrlDisplayType(
  typePath: NodePath<t.TSType>,
  aliases: TypeAliasMap
): t.TSType | null {
  const unwrapped = unwrapParenthesizedTypePath(typePath);
  if (!unwrapped.isTSUnionType()) {
    return null;
  }

  const members = unwrapped.get('types');
  let hasDateOrUrl = false;
  const types: t.TSType[] = [];

  const seen = new Set<string>();
  for (const memberPath of members) {
    const member = unwrapParenthesizedTypePath(memberPath);
    if (member.isTSTypeReference() && t.isIdentifier(member.node.typeName)) {
      const target = resolveAliasTargetForUnionMember(member, aliases);
      if (target === 'ImmutableDate' || target === 'ImmutableUrl') {
        hasDateOrUrl = true;
        const aliasSources = getAliasSourcesForTarget(target, aliases, member.scope);
        for (const name of [target, ...aliasSources]) {
          if (seen.has(name)) continue;
          seen.add(name);
          types.push(t.tsTypeReference(t.identifier(name)));
        }
        continue;
      }
    }
    types.push(t.cloneNode(member.node));
  }

  if (!hasDateOrUrl) {
    return null;
  }

  return t.tsUnionType(types);
}

function resolveAliasTargetForUnionMember(
  memberPath: NodePath<t.TSType>,
  aliases: TypeAliasMap
): string | null {
  const member = unwrapParenthesizedTypePath(memberPath);
  if (!member.isTSTypeReference() || !t.isIdentifier(member.node.typeName)) {
    return null;
  }
  const aliasTarget = resolveAliasTargetName(member, aliases, member.scope);
  if (aliasTarget) {
    return aliasTarget;
  }
  const typeName = member.node.typeName.name;
  const aliasSources = getAliasSourcesForTarget(typeName, aliases, member.scope);
  return aliasSources.length > 0 ? typeName : null;
}

function isStringType(typePath: NodePath<t.TSType>): boolean {
  const unwrapped = unwrapParenthesizedTypePath(typePath);
  if (unwrapped.isTSStringKeyword()) {
    return true;
  }
  if (unwrapped.isTSLiteralType() && t.isStringLiteral(unwrapped.node.literal)) {
    return true;
  }
  if (unwrapped.isTSUnionType()) {
    return unwrapped.get('types').some((memberPath) => isStringType(memberPath));
  }
  return false;
}

function assertUnionTagsUnique(
  unionMessageTypes: string[],
  state: PluginStateFlags,
  memberPath: NodePath<t.TSPropertySignature>,
  label: string
): void {
  if (unionMessageTypes.length < 2) return;
  const tagMap = state.messageTagsByName;
  if (!tagMap) return;
  const seen = new Map<string, string>();
  for (const name of unionMessageTypes) {
    const tag = tagMap.get(name);
    if (!tag) continue;
    const existing = seen.get(tag);
    if (existing && existing !== name) {
      throw memberPath.buildCodeFrameError(
        `Union ${label} has conflicting message tags "${tag}" for ${existing} and ${name}.`
      );
    }
    seen.set(tag, name);
  }
}

function scanTypeForUsage(
  typePath: NodePath<t.TSType>,
  state: PluginStateFlags
): void {
  if (!typePath?.node) return;

  const aliases = state.typeAliases ?? {};

  if (typePath.isTSTypeReference()) {
    const aliasTarget = resolveAliasTargetName(typePath, aliases, typePath.scope);
    const typeName = t.isIdentifier(typePath.node.typeName)
      ? typePath.node.typeName.name
      : null;
    const resolvedTarget = aliasTarget
      ?? (typeName && getAliasSourcesForTarget(typeName, aliases, typePath.scope).length > 0
        ? typeName
        : null);
    if (resolvedTarget && state.aliasTargetsUsed) {
      state.aliasTargetsUsed.add(resolvedTarget);
    }
    if (isDecimalReference(typePath.node)) state.usesDecimalClass = true;
    if (isRationalReference(typePath.node)) state.usesRationalClass = true;
    if (resolvedTarget === 'ImmutableDate') {
      state.usesImmutableDate = true;
    }
    if (resolvedTarget === 'ImmutableUrl') {
      state.usesImmutableUrl = true;
    }
    if (resolvedTarget === 'ImmutableArrayBuffer') {
      state.usesImmutableArrayBuffer = true;
    }
    if (isMapReference(typePath.node) || aliasTarget === 'ImmutableMap') {
      state.usesImmutableMap = true;
      state.usesEquals = true;
    }
    if (isSetReference(typePath.node) || aliasTarget === 'ImmutableSet') {
      state.usesImmutableSet = true;
    }
    const params = typePath.get('typeParameters');
    if (isTSTypeParameterInstantiation(params)) {
      for (const p of getTypeParams(params)) {
        scanTypeForUsage(p, state);
      }
    }
  }

  if (
    isArrayTypeNode(typePath.node)
    || (typePath.isTSTypeReference()
      && resolveAliasTargetName(typePath, aliases, typePath.scope) === 'ImmutableArray')
  ) {
    state.usesImmutableArray = true;
    if (state.aliasTargetsUsed) {
      const arrayAlias = resolveAliasConfigForName('Array', aliases, typePath.scope);
      if (arrayAlias && arrayAlias.kind === 'message') {
        state.aliasTargetsUsed.add(arrayAlias.target);
      }
    }
  }

  if (typePath.isTSArrayType()) {
    scanTypeForUsage(typePath.get('elementType'), state);
  }

  if (typePath.isTSUnionType()) {
    for (const member of typePath.get('types')) {
      scanTypeForUsage(member, state);
    }
  }

  if (typePath.isTSTypeLiteral()) {
     for (const member of typePath.get('members')) {
        if (member.isTSPropertySignature()) {
            const annotation = member.get('typeAnnotation') as unknown as NodePath<t.Node>;
            if (isTSTypeAnnotation(annotation)) {
               scanTypeForUsage(getTypeAnnotation(annotation), state);
            }
        }
     }
  }

  if (typePath.isTSParenthesizedType()) {
      scanTypeForUsage(typePath.get('typeAnnotation'), state);
  }
}
