/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument */
import * as t from '@babel/types';
import type { NodePath } from '@babel/traverse';
import {
  getArrayElementType,
  getMapTypeArguments,
  getSetTypeArguments,
  isArrayBufferReference,
  isArrayTypeNode,
  isDateReference,
  isImmutableArrayBufferReference,
  isMapReference,
  isMapTypeNode,
  isSetReference,
  isSetTypeNode,
  isUrlReference,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getTypeName,
} from './type-guards.js';
import { capitalize } from './utils.js';

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
  usesParseCerealString: boolean;
  usesDataObject: boolean;
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
  usesIsDecimal: boolean;
  usesIsPositive: boolean;
  usesIsNegative: boolean;
  usesIsNonNegative: boolean;
  usesIsNonPositive: boolean;
  usesGreaterThan: boolean;
  usesGreaterThanOrEqual: boolean;
  usesLessThan: boolean;
  usesLessThanOrEqual: boolean;
  usesInRange: boolean;
}

/**
 * Represents a generic type parameter like T in `Container<T extends Message>`.
 */
export interface TypeParameter {
  name: string;           // e.g., 'T'
  constraint: string;     // e.g., 'Message' or specific type like 'User'
}

export interface PropDescriptor {
  name: string;
  fieldNumber: number | null;
  optional: boolean;
  readonly: boolean;
  isArray: boolean;
  isSet: boolean;
  isMap: boolean;
  isDateType: boolean;
  isUrlType: boolean;
  isArrayBufferType: boolean;
  isMessageType: boolean;
  messageTypeName: string | null;
  unionMessageTypes: string[];
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

    const [, numberPart, identifierPart] =
      match as unknown as [string, string, string];
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
): { name: string; index: number } | null {
  if (!typePath.isTSTypeReference()) {
    return null;
  }
  const typeName = typePath.node.typeName;
  if (!t.isIdentifier(typeName)) {
    return null;
  }
  const paramIndex = typeParameters.findIndex((p) => p.name === typeName.name);
  if (paramIndex !== -1) {
    return { name: typeName.name, index: paramIndex };
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
    const messageTypeName = getMessageReferenceName(propTypePath);
    const unionMessageTypes = extractUnionMessageTypes(
      propTypePath,
      getMessageReferenceName
    );

    // Detect generic type parameters
    const genericParamInfo = getGenericParamInfo(propTypePath, typeParameters);
    const unionGenericParams = extractUnionGenericParams(
      propTypePath,
      typeParameters
    );
    const isGenericParam = genericParamInfo !== null;
    if (isGenericParam || unionGenericParams.length > 0) {
      state.usesMessageConstructor = true;
    }

    const isDateType = propTypePath.isTSTypeReference()
      && isDateReference(propTypePath.node);
    const isUrlType = propTypePath.isTSTypeReference()
      && isUrlReference(propTypePath.node);
    const isArrayBufferType = propTypePath.isTSTypeReference()
      && (isArrayBufferReference(propTypePath.node)
        || isImmutableArrayBufferReference(propTypePath.node));

    // Recursively scan for type usage to ensure imports are generated
    scanTypeForUsage(propTypePath, state);

    if (mapType) {
      state.usesImmutableMap = true;
      state.usesEquals = true;
      // Check if map key or value types need ImmutableDate/ImmutableUrl/ImmutableArray
      if (mapArgs) {
        if (t.isTSTypeReference(mapArgs.keyType)
          && isDateReference(mapArgs.keyType)) {
          state.usesImmutableDate = true;
        }
        if (t.isTSTypeReference(mapArgs.keyType)
          && isUrlReference(mapArgs.keyType)) {
          state.usesImmutableUrl = true;
        }
        if (isArrayTypeNode(mapArgs.keyType)) {
          state.usesImmutableArray = true;
        }
        if (t.isTSTypeReference(mapArgs.valueType)
          && isDateReference(mapArgs.valueType)) {
          state.usesImmutableDate = true;
        }
        if (t.isTSTypeReference(mapArgs.valueType)
          && isUrlReference(mapArgs.valueType)) {
          state.usesImmutableUrl = true;
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
      const arrayRef = t.tsArrayType(t.cloneNode(arrayElementType));
      const iterableRef = t.tsTypeReference(
        t.identifier('Iterable'),
        t.tsTypeParameterInstantiation([t.cloneNode(arrayElementType)])
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

    if (messageTypeName) {
      inputTypeAnnotation = t.tsTypeReference(
        t.tsQualifiedName(
          t.identifier(messageTypeName),
          t.identifier('Value')
        )
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
      unionMessageTypes,
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
  if (isArrayTypeNode(propTypePath.node)) {
    const elementType = getArrayElementType(propTypePath.node);
    if (t.isTSTypeLiteral(elementType)) {
      const newItemName = `${parentName}_${capitalize(propName)}_Item`;
      const newTypeAlias = t.tsTypeAliasDeclaration(
        t.identifier(newItemName),
        null,
        t.cloneNode(elementType)
      );
      generatedTypes.push(newTypeAlias);
      declaredTypeNames.add(newItemName);
      declaredMessageTypeNames.add(newItemName);

      const newRef = t.tsTypeReference(t.identifier(newItemName));

      if (t.isTSArrayType(propTypePath.node)) {
        propTypePath.replaceWith(t.tsArrayType(newRef));
      } else {
        propTypePath.replaceWith(t.tsTypeReference(
          (propTypePath.node as t.TSTypeReference).typeName,
          t.tsTypeParameterInstantiation([newRef])
        ));
      }
    }
    return;
  }

  if (propTypePath.isTSTypeLiteral()) {
    const newTypeName = `${parentName}_${capitalize(propName)}`;
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
    const elementType = getSetTypeArguments(propTypePath.node);
    if (t.isTSTypeLiteral(elementType)) {
      const newItemName = `${parentName}_${capitalize(propName)}_Item`;
      const newTypeAlias = t.tsTypeAliasDeclaration(
        t.identifier(newItemName),
        null,
        t.cloneNode(elementType)
      );
      generatedTypes.push(newTypeAlias);
      declaredTypeNames.add(newItemName);
      declaredMessageTypeNames.add(newItemName);

      const newRef = t.tsTypeReference(t.identifier(newItemName));
      propTypePath.replaceWith(t.tsTypeReference(
        (propTypePath.node as t.TSTypeReference).typeName,
        t.tsTypeParameterInstantiation([newRef])
      ));
    }
    return;
  }

  if (isMapTypeNode(propTypePath.node)) {
    const mapArgs = getMapTypeArguments(propTypePath.node);
    if (mapArgs) {
      let keyType = mapArgs.keyType;
      let valueType = mapArgs.valueType;
      let needsReplacement = false;

      // Handle inline object key type
      if (t.isTSTypeLiteral(keyType)) {
        const newKeyName = `${parentName}_${capitalize(propName)}_Key`;
        const newKeyAlias = t.tsTypeAliasDeclaration(
          t.identifier(newKeyName),
          null,
          t.cloneNode(keyType)
        );
        generatedTypes.push(newKeyAlias);
        declaredTypeNames.add(newKeyName);
        declaredMessageTypeNames.add(newKeyName);
        keyType = t.tsTypeReference(t.identifier(newKeyName));
        needsReplacement = true;
      }

      // Handle inline object value type
      if (t.isTSTypeLiteral(valueType)) {
        const newValueName = `${parentName}_${capitalize(propName)}_Value`;
        const newValueAlias = t.tsTypeAliasDeclaration(
          t.identifier(newValueName),
          null,
          t.cloneNode(valueType)
        );
        generatedTypes.push(newValueAlias);
        declaredTypeNames.add(newValueName);
        declaredMessageTypeNames.add(newValueName);
        valueType = t.tsTypeReference(t.identifier(newValueName));
        needsReplacement = true;
      }

      if (needsReplacement) {
        propTypePath.replaceWith(t.tsTypeReference(
          (propTypePath.node as t.TSTypeReference).typeName,
          t.tsTypeParameterInstantiation([keyType, valueType])
        ));
      }
    }
  }
}

export function getDefaultValue(prop: {
  optional: boolean;
  isArray: boolean;
  isMap: boolean;
  isSet: boolean;
  typeAnnotation: t.TSType;
}): t.Expression {
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

  return getDefaultValueForType(prop.typeAnnotation);
}

export function getDefaultValueForType(typeNode: t.TSType): t.Expression {
  if (t.isTSParenthesizedType(typeNode)) {
    return getDefaultValueForType(typeNode.typeAnnotation);
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
    return getDefaultValueForType(typeNode.types[0]!);
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
      // Assume it's a message type
      return t.newExpression(t.identifier(typeName.name), []);
    }
  }

  // Fallback for unknown types, though validation should catch most
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
  if (!typePath.isTSUnionType()) {
    return [];
  }

  const messageTypes: string[] = [];
  for (const memberPath of typePath.get('types')) {
    const messageName = getMessageReferenceName(memberPath);
    if (messageName) {
      messageTypes.push(messageName);
    }
  }

  return messageTypes;
}

function scanTypeForUsage(
  typePath: NodePath<t.TSType>,
  state: PluginStateFlags
): void {
  if (!typePath?.node) return;

  if (typePath.isTSTypeReference()) {
    if (isDateReference(typePath.node)) state.usesImmutableDate = true;
    if (isUrlReference(typePath.node)) state.usesImmutableUrl = true;
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
      if (params && (params as any).isTSTypeParameterInstantiation()) {
        for (const p of (params as any).get('params')) {
          scanTypeForUsage(p, state);
        }
      }
    }
    if (isSetReference(typePath.node)) {
      state.usesImmutableSet = true;
      const params = typePath.get('typeParameters');
      if (params && (params as any).isTSTypeParameterInstantiation()) {
        for (const p of (params as any).get('params')) {
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
             const annotation = member.get('typeAnnotation');
             if (annotation && (annotation as any).isTSTypeAnnotation()) {
                scanTypeForUsage((annotation as any).get('typeAnnotation'), state);
             }
         }
     }
  }

  if (typePath.isTSParenthesizedType()) {
      scanTypeForUsage(typePath.get('typeAnnotation'), state);
  }
}
