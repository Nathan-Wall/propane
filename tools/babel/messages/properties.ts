/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument */
import * as t from '@babel/types';
import type { NodePath } from '@babel/traverse';
import {
  getArrayElementType,
  getMapTypeArguments,
  getSetTypeArguments,
  isArrayBufferReference,
  isArrayTypeNode,
  isDecimalReference,
  isDateReference,
  isImmutableDateReference,
  isImmutableArrayBufferReference,
  isMapReference,
  isMapTypeNode,
  isRationalReference,
  isSetReference,
  isSetTypeNode,
  isUrlReference,
  isImmutableUrlReference,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getTypeName,
} from './type-guards.js';
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
  typePath: NodePath<t.TSType>
): NodePath<t.TSType> | null {
  const unwrapped = unwrapParenthesizedTypePath(typePath);
  if (unwrapped.isTSArrayType()) {
    return unwrapped.get('elementType');
  }
  if (unwrapped.isTSTypeReference()) {
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
  typePath: NodePath<t.TSType>
): NodePath<t.TSType> | null {
  const unwrapped = unwrapParenthesizedTypePath(typePath);
  if (unwrapped.isTSTypeReference()) {
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
  typePath: NodePath<t.TSType>
): { keyPath: NodePath<t.TSType> | null; valuePath: NodePath<t.TSType> | null } | null {
  const unwrapped = unwrapParenthesizedTypePath(typePath);
  if (!unwrapped.isTSTypeReference()) {
    return null;
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

    const mapType = isMapTypeNode(propTypePath.node);
    const mapArgs = mapType ? getMapTypeArguments(propTypePath.node) : null;
    const arrayType = isArrayTypeNode(propTypePath.node);
    const arrayElementType = arrayType
      ? getArrayElementType(propTypePath.node)
      : null;
    const setType = isSetTypeNode(propTypePath.node);
    const setArg = setType ? getSetTypeArguments(propTypePath.node) : null;
    const arrayElementPath = arrayType ? getArrayElementTypePath(propTypePath) : null;
    const setElementPath = setType ? getSetElementTypePath(propTypePath) : null;
    const mapArgPaths = mapType ? getMapTypeArgumentPaths(propTypePath) : null;
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
    const unionHasDate = extractUnionHasDate(propTypePath);
    const unionHasUrl = extractUnionHasUrl(propTypePath);
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

    const isDateType = propTypePath.isTSTypeReference()
      && isDateReference(propTypePath.node);
    const isUrlType = propTypePath.isTSTypeReference()
      && isUrlReference(propTypePath.node);
    const isArrayBufferType = propTypePath.isTSTypeReference()
      && (isArrayBufferReference(propTypePath.node)
        || isImmutableArrayBufferReference(propTypePath.node))
      && !messageTypeName;

    // Recursively scan for type usage to ensure imports are generated
    scanTypeForUsage(propTypePath, state);

    if (mapType) {
      state.usesImmutableMap = true;
      state.usesEquals = true;
      // Check if map key or value types need ImmutableDate/ImmutableUrl/ImmutableArray
      if (mapArgs) {
        if (isArrayTypeNode(mapArgs.keyType)) {
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

    const runtimeType = mapType || setType || arrayType
      ? wrapImmutableType(t.cloneNode(propTypePath.node))
      : t.cloneNode(propTypePath.node);

    let inputTypeAnnotation: t.TSType = mapType || setType || arrayType
      ? buildInputAcceptingMutable(t.cloneNode(propTypePath.node))
      : t.cloneNode(propTypePath.node);

    let displayType: t.TSType = t.cloneNode(propTypePath.node);
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
      // Check if element type needs wrapping (ArrayBuffer, Date, URL)
      // If so, include both mutable and immutable element variants in the union
      // so that internal immutable arrays can be passed to the constructor
      let elementUnionType: t.TSType | null = null;
      if (t.isTSTypeReference(arrayElementType)) {
        if (isArrayBufferReference(arrayElementType)) {
          elementUnionType = t.tsUnionType([
            t.tsTypeReference(t.identifier('ArrayBuffer')),
            t.tsTypeReference(t.identifier('ImmutableArrayBuffer')),
          ]);
        } else if (isDateReference(arrayElementType)) {
          elementUnionType = t.tsUnionType([
            t.tsTypeReference(t.identifier('Date')),
            t.tsTypeReference(t.identifier('ImmutableDate')),
          ]);
        } else if (isUrlReference(arrayElementType)) {
          elementUnionType = t.tsUnionType([
            t.tsTypeReference(t.identifier('URL')),
            t.tsTypeReference(t.identifier('ImmutableUrl')),
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
      displayType = t.tsUnionType([
        t.tsTypeReference(t.identifier('ImmutableDate')),
        t.tsTypeReference(t.identifier('Date')),
      ]);
      inputTypeAnnotation = displayType;
    } else if (isUrlType) {
      displayType = t.tsUnionType([
        t.tsTypeReference(t.identifier('ImmutableUrl')),
        t.tsTypeReference(t.identifier('URL')),
      ]);
      inputTypeAnnotation = displayType;
    } else if (isArrayBufferType) {
      displayType = t.tsUnionType([
        t.tsTypeReference(t.identifier('ImmutableArrayBuffer')),
        t.tsTypeReference(t.identifier('ArrayBuffer')),
      ]);
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

    const unionDateUrlDisplayType = buildUnionDateUrlDisplayType(propTypePath);
    if (unionDateUrlDisplayType) {
      displayType = unionDateUrlDisplayType;
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
      arrayElementType,
      mapKeyType: mapArgs ? mapArgs.keyType : null,
      mapValueType: mapArgs ? mapArgs.valueType : null,
      mapKeyInputType: mapArgs
        ? buildInputAcceptingMutable(mapArgs.keyType)
        : null,
      mapValueInputType: mapArgs
        ? buildInputAcceptingMutable(mapArgs.valueType)
        : null,
      setElementType: setArg,
      setElementInputType: setArg ? buildInputAcceptingMutable(setArg) : null,
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
  typeAliasDefinitions?: Map<string, t.TSType>
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

  return getDefaultValueForType(prop.typeAnnotation, declaredMessageTypeNames, typeAliasDefinitions);
}

export function getDefaultValueForType(
  typeNode: t.TSType,
  declaredMessageTypeNames?: Set<string>,
  typeAliasDefinitions?: Map<string, t.TSType>
): t.Expression {
  if (t.isTSParenthesizedType(typeNode)) {
    return getDefaultValueForType(typeNode.typeAnnotation, declaredMessageTypeNames, typeAliasDefinitions);
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
    return getDefaultValueForType(typeNode.types[0]!, declaredMessageTypeNames, typeAliasDefinitions);
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

  if (t.isTSTypeReference(typeNode)) {
    const typeName = typeNode.typeName;
    if (t.isIdentifier(typeName)) {
      if (typeName.name === 'Date' || typeName.name === 'ImmutableDate') {
        return t.newExpression(
          t.identifier('ImmutableDate'),
          [t.numericLiteral(0)]
        );
      }
      if (typeName.name === 'URL' || typeName.name === 'ImmutableUrl') {
        return t.newExpression(
          t.identifier('ImmutableUrl'),
          [t.stringLiteral('about:blank')]
        );
      }
      if (typeName.name === 'ArrayBuffer'
        || typeName.name === 'ImmutableArrayBuffer') {
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
        return getDefaultValueForType(resolvedType, declaredMessageTypeNames, typeAliasDefinitions);
      }
      // Unknown type reference - fall through to undefined
    }
  }

  // Fallback for unknown types (including type aliases that can't be instantiated)
  return t.identifier('undefined');
}

export function wrapImmutableType(
  node: t.TSType
): t.TSType;
export function wrapImmutableType(
  node: t.TSType | null
): t.TSType | null;
export function wrapImmutableType(
  node: t.TSType | null
): t.TSType | null {
  if (!node) {
    return node;
  }

  if (t.isTSParenthesizedType(node)) {
    return t.tsParenthesizedType(
      wrapImmutableType(t.cloneNode(node.typeAnnotation))
    );
  }

  if (t.isTSUnionType(node)) {
    const mapped = node.types.map((member) => {
      const inner = t.isTSParenthesizedType(member)
        ? member.typeAnnotation
        : member;
      if (
        t.isTSTypeReference(inner)
        && t.isIdentifier(inner.typeName)
      ) {
        if (inner.typeName.name === 'Date') {
          return t.tsTypeReference(t.identifier('ImmutableDate'));
        }
        if (inner.typeName.name === 'URL') {
          return t.tsTypeReference(t.identifier('ImmutableUrl'));
        }
      }
      return t.cloneNode(member);
    });
    return t.tsUnionType(mapped);
  }

  if (t.isTSArrayType(node)) {
    return t.tsTypeReference(
      t.identifier('ImmutableArray'),
      t.tsTypeParameterInstantiation([
        wrapImmutableType(t.cloneNode(node.elementType))
      ])
    );
  }

  if (
    t.isTSTypeReference(node)
    && t.isIdentifier(node.typeName)
  ) {
    const name = node.typeName.name;
    if (name === 'Date') {
      return t.tsTypeReference(t.identifier('ImmutableDate'));
    }
    if (name === 'URL') {
      return t.tsTypeReference(t.identifier('ImmutableUrl'));
    }
    if (name === 'ArrayBuffer' || name === 'ImmutableArrayBuffer') {
      return t.tsTypeReference(t.identifier('ImmutableArrayBuffer'));
    }
    if (name === 'Map'
      || name === 'ReadonlyMap'
      || name === 'ImmutableMap') {
      const params = node.typeParameters?.params ?? [];
      const [key, value] = [
        wrapImmutableType(
          params[0] ? t.cloneNode(params[0]) : t.tsUnknownKeyword()
        ),
        wrapImmutableType(
          params[1] ? t.cloneNode(params[1]) : t.tsUnknownKeyword()
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
      const params = node.typeParameters?.params ?? [];
      const [elem] = [
        wrapImmutableType(
          params[0] ? t.cloneNode(params[0]) : t.tsUnknownKeyword()
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
      const params = node.typeParameters?.params ?? [];
      const [elem] = [
        wrapImmutableType(
          params[0] ? t.cloneNode(params[0]) : t.tsUnknownKeyword()
        ),
      ];
      return t.tsTypeReference(
        t.identifier('ImmutableArray'),
        t.tsTypeParameterInstantiation([elem])
      );
    }
  }

  return node;
}

export function buildInputAcceptingMutable(
  node: t.TSType
): t.TSType;
export function buildInputAcceptingMutable(
  node: t.TSType | null
): t.TSType | null;
export function buildInputAcceptingMutable(
  node: t.TSType | null
): t.TSType | null {
  if (!node) {
    return node;
  }

  if (t.isTSParenthesizedType(node)) {
    return t.tsParenthesizedType(
      buildInputAcceptingMutable(t.cloneNode(node.typeAnnotation))
    );
  }

  if (t.isTSArrayType(node)) {
    const element = buildInputAcceptingMutable(
      t.cloneNode(node.elementType)
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
    t.isTSTypeReference(node)
    && t.isIdentifier(node.typeName)
  ) {
    const name = node.typeName.name;

    if (name === 'Date' || name === 'ImmutableDate') {
      return t.tsUnionType([
        t.tsTypeReference(t.identifier('ImmutableDate')),
        t.tsTypeReference(t.identifier('Date')),
      ]);
    }

    if (name === 'URL' || name === 'ImmutableUrl') {
      return t.tsUnionType([
        t.tsTypeReference(t.identifier('ImmutableUrl')),
        t.tsTypeReference(t.identifier('URL')),
      ]);
    }

    if (name === 'ArrayBuffer' || name === 'ImmutableArrayBuffer') {
      return t.tsUnionType([
        t.tsTypeReference(t.identifier('ImmutableArrayBuffer')),
        t.tsTypeReference(t.identifier('ArrayBuffer')),
      ]);
    }

    // Array-style reference (T[], ReadonlyArray<T>, ImmutableArray<T>)
    if (name === 'Array'
      || name === 'ReadonlyArray'
      || name === 'ImmutableArray') {
      const elem = buildInputAcceptingMutable(
        node.typeParameters?.params?.[0]
          ? t.cloneNode(node.typeParameters.params[0])
          : t.tsUnknownKeyword()
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
        node.typeParameters?.params?.[0]
          ? t.cloneNode(node.typeParameters.params[0])
          : t.tsUnknownKeyword()
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
      const keyParam = node.typeParameters?.params?.[0]
        ? t.cloneNode(node.typeParameters.params[0])
        : t.tsUnknownKeyword();
      const valueParam = node.typeParameters?.params?.[1]
        ? t.cloneNode(node.typeParameters.params[1])
        : t.tsUnknownKeyword();
      const key = buildInputAcceptingMutable(keyParam);
      const value = buildInputAcceptingMutable(valueParam);
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

  return node;
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

function extractUnionHasDate(typePath: NodePath<t.TSType>): boolean {
  const unwrapped = unwrapParenthesizedTypePath(typePath);
  if (!unwrapped.isTSUnionType()) {
    return false;
  }
  return unwrapped.get('types').some((memberPath) => {
    const member = unwrapParenthesizedTypePath(memberPath);
    return member.isTSTypeReference()
      && (isDateReference(member.node) || isImmutableDateReference(member.node));
  });
}

function extractUnionHasUrl(typePath: NodePath<t.TSType>): boolean {
  const unwrapped = unwrapParenthesizedTypePath(typePath);
  if (!unwrapped.isTSUnionType()) {
    return false;
  }
  return unwrapped.get('types').some((memberPath) => {
    const member = unwrapParenthesizedTypePath(memberPath);
    return member.isTSTypeReference()
      && (isUrlReference(member.node) || isImmutableUrlReference(member.node));
  });
}

function buildUnionDateUrlDisplayType(
  typePath: NodePath<t.TSType>
): t.TSType | null {
  const unwrapped = unwrapParenthesizedTypePath(typePath);
  if (!unwrapped.isTSUnionType()) {
    return null;
  }

  const members = unwrapped.get('types');
  let hasDateOrUrl = false;
  const types: t.TSType[] = [];

  for (const memberPath of members) {
    const member = unwrapParenthesizedTypePath(memberPath);
    if (member.isTSTypeReference() && isDateReference(member.node)) {
      hasDateOrUrl = true;
      types.push(t.cloneNode(member.node));
      types.push(t.tsTypeReference(t.identifier('ImmutableDate')));
      continue;
    }
    if (member.isTSTypeReference() && isUrlReference(member.node)) {
      hasDateOrUrl = true;
      types.push(t.cloneNode(member.node));
      types.push(t.tsTypeReference(t.identifier('ImmutableUrl')));
      continue;
    }
    types.push(t.cloneNode(member.node));
  }

  if (!hasDateOrUrl) {
    return null;
  }

  return t.tsUnionType(types);
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

  if (typePath.isTSTypeReference()) {
    if (isDecimalReference(typePath.node)) state.usesDecimalClass = true;
    if (isRationalReference(typePath.node)) state.usesRationalClass = true;
    if (isDateReference(typePath.node) || isImmutableDateReference(typePath.node)) {
      state.usesImmutableDate = true;
    }
    if (isUrlReference(typePath.node) || isImmutableUrlReference(typePath.node)) {
      state.usesImmutableUrl = true;
    }
    if (
      isArrayBufferReference(typePath.node)
      || isImmutableArrayBufferReference(typePath.node)
    ) {
      state.usesImmutableArrayBuffer = true;
    }
    if (isMapReference(typePath.node)) {
      state.usesImmutableMap = true;
      state.usesEquals = true;
      const params = typePath.get('typeParameters');
      if (isTSTypeParameterInstantiation(params)) {
        for (const p of getTypeParams(params)) {
          scanTypeForUsage(p, state);
        }
      }
    }
    if (isSetReference(typePath.node)) {
      state.usesImmutableSet = true;
      const params = typePath.get('typeParameters');
      if (isTSTypeParameterInstantiation(params)) {
        for (const p of getTypeParams(params)) {
          scanTypeForUsage(p, state);
        }
      }
    }
  }

  if (isArrayTypeNode(typePath.node)) {
    state.usesImmutableArray = true;
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
