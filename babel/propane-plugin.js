import * as t from '@babel/types';
import { capitalize, pathTransform } from './propane-utils.js';
import {
  analyzePropaneModule,
  getFilename,
  getImportedName,
  resolveImportPath,
} from './propane-imports.js';
import {
  getArrayElementType,
  getMapTypeArguments,
  getSetTypeArguments,
  getTypeName,
  isArrayTypeNode,
  isMapTypeNode,
  isSetTypeNode,
  isArrayBufferReference,
  isBrandReference,
  isDateReference,
  isImmutableArrayBufferReference,
  isImmutableDateReference,
  isImmutableUrlReference,
  isMapReference,
  isPrimitiveKeyword,
  isPrimitiveLikeType,
  isPrimitiveLiteral,
  isSetReference,
  isUrlReference,
  resolveQualifiedRoot,
} from './propane-type-guards.js';

const MESSAGE_SOURCE = '@propanejs/runtime';
const GENERATED_ALIAS = Symbol('PropaneGeneratedTypeAlias');

export default function propanePlugin() {
  const declaredTypeNames = new Set();
  const declaredMessageTypeNames = new Set();
  const messageModuleCache = new Map();

  return {
    name: 'propane-plugin',
    visitor: {
      Program: {
        enter(path, state) {
          state.usesPropaneBase = false;
          state.usesImmutableMap = false;
          state.usesImmutableSet = false;
          state.usesImmutableArray = false;
          state.usesEquals = false;
          state.usesImmutableDate = false;
          state.usesImmutableUrl = false;
          state.usesImmutableArrayBuffer = false;

          const fileOpts = (state.file && state.file.opts) || {};
          const filename = fileOpts.filename || '';
          const relative = filename
            ? pathTransform(filename)
            : 'unknown';
          const commentText = `Generated from ${relative}`;

          const existing = (path.node.leadingComments || []).some(
            (comment) => comment.value.trim() === commentText
          );

          if (!existing) {
            path.addComment('leading', ` ${commentText}`, true);
            path.addComment('leading', ' eslint-disable @typescript-eslint/no-namespace', false);
          }
        },
        exit(path, state) {
          if (state.usesPropaneBase) {
            ensureBaseImport(path, state);
          }
        },
      },
      ExportNamedDeclaration(path, state) {
        if (!path.parentPath.isProgram()) {
          return;
        }
        const declarationPath = path.get('declaration');
        if (!declarationPath.isTSTypeAliasDeclaration()) {
          return;
        }

        if (declarationPath.node && declarationPath.node[GENERATED_ALIAS]) {
          return;
        }

        registerTypeAlias(declarationPath.node, declaredTypeNames);

        const replacement = buildDeclarations(declarationPath, { exported: true, state });

        if (replacement) {
          path.replaceWithMultiple(replacement);
        }
      },
      TSTypeAliasDeclaration(path, state) {
        if (path.parentPath.isExportNamedDeclaration()) {
          return;
        }

        if (path.node && path.node[GENERATED_ALIAS]) {
          return;
        }

        registerTypeAlias(path.node, declaredTypeNames);

        const replacement = buildDeclarations(path, { exported: false, state });

        if (replacement) {
          path.replaceWithMultiple(replacement);
        }
      },
    },
  };





  function buildDeclarations(typeAliasPath, { exported, state }) {
    const typeAlias = typeAliasPath.node;

    if (!t.isIdentifier(typeAlias.id)) {
      throw typeAliasPath.buildCodeFrameError(
        'Propane type aliases must have identifier names.'
      );
    }

    const typeLiteralPath = typeAliasPath.get('typeAnnotation');

    if (!typeLiteralPath.isTSTypeLiteral()) {
      assertSupportedTopLevelType(typeLiteralPath);
      insertPrimitiveTypeAlias(typeAliasPath, exported);
      return null;
    }

    const generatedTypes = [];
    const properties = extractProperties(typeLiteralPath.get('members'), generatedTypes, typeAlias.id.name, state);
    if (properties.some((prop) => prop.isMap)) {
      state.usesImmutableMap = true;
      state.usesEquals = true;
    }
    if (properties.some((prop) => prop.isSet)) {
      state.usesImmutableSet = true;
    }
    if (properties.some((prop) => prop.isArray)) {
      state.usesImmutableArray = true;
    }
    declaredMessageTypeNames.add(typeAlias.id.name);

    const generatedTypeNames = generatedTypes
      .map((node) => (t.isTSTypeAliasDeclaration(node) && t.isIdentifier(node.id) ? node.id.name : null))
      .filter(Boolean);

    const typeNamespace = buildTypeNamespace(typeAlias, properties, exported, generatedTypeNames);
    const classDecl = buildClassFromProperties(typeAlias.id.name, properties, declaredMessageTypeNames);

    state.usesPropaneBase = true;

    if (exported) {
      const classExport = t.exportNamedDeclaration(classDecl, []);
      return [...generatedTypes, classExport, typeNamespace];
    }

    return [...generatedTypes, classDecl, typeNamespace];
  }

  function extractProperties(memberPaths, generatedTypes, parentName, state) {
    const props = [];
    const usedFieldNumbers = new Set();
    const usedNames = new Set();

    for (const memberPath of memberPaths) {
      if (!memberPath.isTSPropertySignature()) {
        throw memberPath.buildCodeFrameError(
          'Propane object types can only contain property signatures.'
        );
      }

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
      if (!typeAnnotationPath || !typeAnnotationPath.node) {
        throw memberPath.buildCodeFrameError(
          'Propane properties must include a type annotation.'
        );
      }

      const propTypePath = typeAnnotationPath.get('typeAnnotation');
      if (!propTypePath || !propTypePath.node) {
        throw memberPath.buildCodeFrameError(
          'Propane properties must include a type annotation.'
        );
      }

      // Handle implicit message types in Array/Set/Map
      if (generatedTypes && parentName) {
        handleImplicitTypes(propTypePath, name, generatedTypes, parentName, declaredTypeNames, declaredMessageTypeNames);
      }

      assertSupportedType(propTypePath, declaredTypeNames);

      const mapType = isMapTypeNode(propTypePath.node);
      const mapArgs = mapType ? getMapTypeArguments(propTypePath.node) : null;
      const arrayType = isArrayTypeNode(propTypePath.node);
      const arrayElementType = arrayType ? getArrayElementType(propTypePath.node) : null;
      const setType = isSetTypeNode(propTypePath.node);
      const setArg = setType ? getSetTypeArguments(propTypePath.node) : null;
      const messageTypeName = getMessageReferenceName(propTypePath);
      const isDateType = propTypePath.isTSTypeReference() && isDateReference(propTypePath.node);
      const isUrlType = propTypePath.isTSTypeReference() && isUrlReference(propTypePath.node);
      const isArrayBufferType = propTypePath.isTSTypeReference()
        && (isArrayBufferReference(propTypePath.node) || isImmutableArrayBufferReference(propTypePath.node));
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

      let inputTypeAnnotation = mapType || setType || arrayType
        ? buildInputAcceptingMutable(t.cloneNode(propTypePath.node))
        : t.cloneNode(propTypePath.node);

      let displayType = t.cloneNode(propTypePath.node);
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
        typeAnnotation: runtimeType,
        inputTypeAnnotation,
        arrayElementType,
        mapKeyType: mapArgs ? mapArgs.keyType : null,
        mapValueType: mapArgs ? mapArgs.valueType : null,
        mapKeyInputType: mapArgs ? buildInputAcceptingMutable(mapArgs.keyType) : null,
        mapValueInputType: mapArgs ? buildInputAcceptingMutable(mapArgs.valueType) : null,
        setElementType: setArg,
        setElementInputType: setArg ? buildInputAcceptingMutable(setArg) : null,
        displayType,
      });
    }

    return props;
  }








  function getMessageReferenceName(typePath) {
    if (!typePath || !typePath.isTSTypeReference()) {
      return null;
    }

    const typeName = typePath.node.typeName;
    if (!t.isIdentifier(typeName)) {
      return null;
    }

    const name = typeName.name;

    if (declaredMessageTypeNames.has(name)) {
      return name;
    }

    const binding = typePath.scope.getBinding(name);

    if (
      binding
      && (
        binding.path.isImportSpecifier()
        || binding.path.isImportDefaultSpecifier()
      )
      && binding.path.parentPath
      && binding.path.parentPath.isImportDeclaration()
    ) {
      const importSource = binding.path.parentPath.node.source.value;
      const filename = getFilename(typePath);
      const resolved = resolveImportPath(importSource, filename);

      if (!resolved) {
        return null;
      }

      if (!messageModuleCache.has(resolved)) {
        messageModuleCache.set(resolved, analyzePropaneModule(resolved));
      }

      const exportNames = messageModuleCache.get(resolved);
      const importedName = getImportedName(binding.path);

      if (importedName && exportNames.has(importedName)) {
        return binding.identifier.name;
      }
    }

    return null;
  }
}

function insertPrimitiveTypeAlias(typeAliasPath, exported) {
  if (!t.isIdentifier(typeAliasPath.node.id)) {
    return;
  }

  const aliasId = t.identifier(`${typeAliasPath.node.id.name}Type`);
  const alias = t.tsTypeAliasDeclaration(
    aliasId,
    typeAliasPath.node.typeParameters
      ? t.cloneNode(typeAliasPath.node.typeParameters)
      : null,
    t.tsTypeReference(t.identifier(typeAliasPath.node.id.name))
  );
  alias[GENERATED_ALIAS] = true;

  const aliasDecl = exported
    ? t.exportNamedDeclaration(alias, [])
    : alias;

  if (exported && aliasDecl) {
    aliasDecl.exportKind = 'type';
  }

  const targetPath = exported ? typeAliasPath.parentPath : typeAliasPath;
  if (targetPath && typeof targetPath.insertAfter === 'function') {
    targetPath.insertAfter(aliasDecl);
  }
}

function getDefaultValue(prop) {
  if (prop.optional) {
    return t.identifier('undefined');
  }

  if (prop.isArray) {
    return t.callExpression(
      t.memberExpression(t.identifier('Object'), t.identifier('freeze')),
      [t.arrayExpression([])]
    );
  }

  if (prop.isMap) {
    return t.newExpression(t.identifier('Map'), []);
  }

  if (prop.isSet) {
    return t.newExpression(t.identifier('Set'), []);
  }

  return getDefaultValueForType(prop.typeAnnotation);
}

function getDefaultValueForType(typeNode) {
  if (t.isTSTypeAnnotation(typeNode)) {
    return getDefaultValueForType(typeNode.typeAnnotation);
  }

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
    return getDefaultValueForType(typeNode.types[0]);
  }

  if (t.isTSTypeReference(typeNode)) {
    const typeName = typeNode.typeName;
    if (t.isIdentifier(typeName)) {
      if (typeName.name === 'Date' || typeName.name === 'ImmutableDate') {
        return t.newExpression(t.identifier('ImmutableDate'), [t.numericLiteral(0)]);
      }
      if (typeName.name === 'URL' || typeName.name === 'ImmutableUrl') {
        return t.newExpression(t.identifier('ImmutableUrl'), [t.stringLiteral('about:blank')]);
      }
      if (typeName.name === 'ArrayBuffer' || typeName.name === 'ImmutableArrayBuffer') {
        return t.newExpression(t.identifier('ImmutableArrayBuffer'), []);
      }
      // Assume it's a message type
      return t.newExpression(t.identifier(typeName.name), []);
    }
  }

  // Fallback for unknown types, though validation should catch most
  return t.identifier('undefined');
}

function assertSupportedMapType(typePath, declaredTypeNames) {
  const typeParametersPath = typePath.get('typeParameters');
  if (
    !typeParametersPath
    || !typeParametersPath.node
    || typeParametersPath.node.params.length !== 2
  ) {
    throw typePath.buildCodeFrameError(
      'Propane Map types must specify both key and value types.'
    );
  }

  const [keyTypePath, valueTypePath] = typeParametersPath.get('params');
  assertSupportedMapKeyType(keyTypePath);
  assertSupportedType(valueTypePath, declaredTypeNames);
}

function assertSupportedSetType(typePath, declaredTypeNames) {
  const typeNode = typePath.node;

  if (!t.isTSTypeReference(typeNode)) {
    throw typePath.buildCodeFrameError('Invalid Set type.');
  }

  const typeParams = typeNode.typeParameters;
  if (!typeParams || typeParams.params.length !== 1) {
    throw typePath.buildCodeFrameError(
      'Propane Set types must specify a single element type, e.g. Set<string>.'
    );
  }

  assertSupportedType(typePath.get('typeParameters').get('params')[0], declaredTypeNames);
}

function assertSupportedMapKeyType(typePath) {
  if (!typePath || !typePath.node) {
    throw typePath.buildCodeFrameError('Missing Map key type.');
  }

  if (typePath.isTSParenthesizedType()) {
    assertSupportedMapKeyType(typePath.get('typeAnnotation'));
    return;
  }

  if (typePath.isTSUnionType()) {
    for (const memberPath of typePath.get('types')) {
      assertSupportedMapKeyType(memberPath);
    }
    return;
  }

  if (typePath.isTSTypeLiteral()) {
    throw typePath.buildCodeFrameError(
      'Propane map keys cannot be objects.'
    );
  }

  if (typePath.isTSArrayType()) {
    throw typePath.buildCodeFrameError(
      'Propane map keys cannot be arrays.'
    );
  }

  if (typePath.isTSTypeReference() && isDateReference(typePath.node)) {
    throw typePath.buildCodeFrameError(
      'Propane map keys cannot be Date objects.'
    );
  }

  if (typePath.isTSTypeReference() && isUrlReference(typePath.node)) {
    throw typePath.buildCodeFrameError(
      'Propane map keys cannot be URL objects.'
    );
  }

  assertSupportedType(typePath);
}

function normalizePropertyKey(memberPath) {
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
        'Numbered propane properties must follow the "<positive-integer>:<identifier>" format, e.g. \'1:name\'.'
      );
    }

    const [, numberPart, identifierPart] = match;
    const fieldNumber = Number(numberPart);

    if (!Number.isSafeInteger(fieldNumber)) {
      throw keyPath.buildCodeFrameError(
        'Propane property numbers must be integers.'
      );
    }

    assertValidPropertyName(identifierPart, keyPath);
    return { name: identifierPart, fieldNumber };
  }

  throw memberPath.buildCodeFrameError(
    'Propane properties must use identifier names or numbered keys like \'1:name\'.'
  );
}

function assertValidPropertyName(name, keyPath) {
  if (name.includes('$')) {
    throw keyPath.buildCodeFrameError(
      'Propane property names cannot contain "$".'
    );
  }
}



  function buildTypeNamespace(typeAlias, properties, exported, generatedTypeNames = []) {
  const namespaceId = t.identifier(typeAlias.id.name);
  const typeId = t.identifier('Data');

  const literalMembers = properties.map((prop) => {
    const key = t.identifier(prop.name);
    let typeAnnotation = prop.displayType ? t.cloneNode(prop.displayType) : t.cloneNode(prop.inputTypeAnnotation);
    if (prop.optional) {
      if (t.isTSUnionType(typeAnnotation)) {
        typeAnnotation.types.push(t.tsUndefinedKeyword());
      } else {
        typeAnnotation = t.tsUnionType([typeAnnotation, t.tsUndefinedKeyword()]);
      }
    }
    const propSignature = t.tsPropertySignature(
      key,
      t.tsTypeAnnotation(typeAnnotation)
    );
    propSignature.optional = prop.optional;
    propSignature.readonly = prop.readonly;
    return propSignature;
  });

  const literalClone = t.tsTypeLiteral(literalMembers);

  const typeDecl = t.tsInterfaceDeclaration(
    typeId,
    typeAlias.typeParameters ? t.cloneNode(typeAlias.typeParameters) : null,
    null,
    t.tsInterfaceBody(literalClone.members)
  );

  const exportedTypeDecl = t.exportNamedDeclaration(typeDecl, []);
  exportedTypeDecl.exportKind = 'type';

  const typeUnionDecl = t.tsTypeAliasDeclaration(
    t.identifier('Value'),
    null,
    t.tsUnionType([
      t.tsTypeReference(t.identifier(typeAlias.id.name)),
      t.tsTypeReference(
        t.tsQualifiedName(t.identifier(typeAlias.id.name), t.identifier('Data'))
      ),
    ])
  );
  const exportedUnionDecl = t.exportNamedDeclaration(typeUnionDecl, []);
  exportedUnionDecl.exportKind = 'type';

  const aliasDecls = generatedTypeNames
    .filter((name) => typeof name === 'string' && name.startsWith(`${typeAlias.id.name}_`))
    .map((name) => {
      const aliasName = name.slice(typeAlias.id.name.length + 1);
      const importEquals = t.tsImportEqualsDeclaration(
        t.identifier(aliasName),
        t.identifier(name)
      );
      importEquals.isExport = true;
      return importEquals;
    });

  const moduleBlock = t.tsModuleBlock([exportedTypeDecl, exportedUnionDecl, ...aliasDecls]);
  const namespaceDecl = t.tsModuleDeclaration(namespaceId, moduleBlock);
  namespaceDecl.declare = typeAlias.declare;
  namespaceDecl.kind = 'namespace';

  if (exported) {
    return t.exportNamedDeclaration(namespaceDecl, []);
  }

  return namespaceDecl;
}

function buildClassFromProperties(typeName, properties, declaredMessageTypeNames) {
  const backingFields = [];
  const getters = [];
  const propDescriptors = properties.map((prop) => ({
    ...prop,
    privateName: t.privateName(t.identifier(prop.name)),
  }));
  const propsTypeRef = t.tsTypeReference(
    t.tsQualifiedName(t.identifier(typeName), t.identifier('Data'))
  );
  const valueTypeRef = t.tsTypeReference(
    t.tsQualifiedName(t.identifier(typeName), t.identifier('Value'))
  );

  for (const prop of propDescriptors) {
    let baseType = wrapImmutableType(t.cloneNode(prop.typeAnnotation));

    const needsOptionalUnion = prop.optional && (prop.isArray || prop.isMap || prop.isSet || prop.isArrayBufferType);
    const fieldTypeAnnotation = needsOptionalUnion
      ? t.tsUnionType([baseType, t.tsUndefinedKeyword()])
      : baseType;

    const field = t.classPrivateProperty(t.cloneNode(prop.privateName));
    field.typeAnnotation = t.tsTypeAnnotation(fieldTypeAnnotation);
    backingFields.push(field);

    const getter = t.classMethod(
      'get',
      t.identifier(prop.name),
      [],
      t.blockStatement([
        t.returnStatement(
          t.memberExpression(t.thisExpression(), t.cloneNode(prop.privateName))
        ),
      ])
    );

    const getterReturnType = needsOptionalUnion
      ? t.tsUnionType([baseType, t.tsUndefinedKeyword()])
      : baseType;

    getter.returnType = t.tsTypeAnnotation(getterReturnType);
    getters.push(getter);
  }

  const className = typeName; // Assuming typeName is the class name

  if (propDescriptors.length === 0) {
    // No properties, nothing to initialize.
    return t.classMethod(
      'constructor',
      t.identifier('constructor'),
      [],
      t.blockStatement([
        t.expressionStatement(
          t.callExpression(t.super(), [
            t.memberExpression(
              t.identifier(className),
              t.identifier('TYPE_TAG')
            ),
          ])
        ),
      ])
    );
  }

  const constructorParam = t.identifier('props');
  constructorParam.typeAnnotation = t.tsTypeAnnotation(
    t.cloneNode(valueTypeRef)
  );
  constructorParam.optional = true;

  const constructorAssignments = propDescriptors.map((prop) => {
    const propsAccess = t.memberExpression(
      t.identifier('props'),
      t.identifier(prop.name)
    );

    let valueExpr = t.cloneNode(propsAccess);

    if (prop.isArray) {
      const elementTypeName = getTypeName(prop.arrayElementType);
      valueExpr = elementTypeName && declaredMessageTypeNames.has(elementTypeName)
        ? buildImmutableArrayOfMessagesExpression(propsAccess, elementTypeName)
        : buildImmutableArrayExpression(propsAccess);
    } else if (prop.isMap) {
      const valueTypeName = getTypeName(prop.mapValueType);
      valueExpr = valueTypeName && declaredMessageTypeNames.has(valueTypeName)
        ? buildImmutableMapOfMessagesExpression(propsAccess, valueTypeName)
        : buildImmutableMapExpression(propsAccess);
    } else if (prop.isSet) {
      const elementTypeName = getTypeName(prop.setElementType);
      valueExpr = elementTypeName && declaredMessageTypeNames.has(elementTypeName)
        ? buildImmutableSetOfMessagesExpression(propsAccess, elementTypeName)
        : buildImmutableSetExpression(propsAccess);
    } else if (prop.isDateType) {
      valueExpr = buildImmutableDateNormalizationExpression(
        valueExpr,
        {
          allowUndefined: Boolean(prop.optional),
          allowNull: typeAllowsNull(prop.typeAnnotation),
        }
      );
    } else if (prop.isUrlType) {
      valueExpr = buildImmutableUrlNormalizationExpression(
        valueExpr,
        {
          allowUndefined: Boolean(prop.optional),
          allowNull: typeAllowsNull(prop.typeAnnotation),
        }
      );
    } else if (prop.isArrayBufferType) {
      valueExpr = buildImmutableArrayBufferNormalizationExpression(
        valueExpr,
        {
          allowUndefined: Boolean(prop.optional),
          allowNull: typeAllowsNull(prop.typeAnnotation),
        }
      );
    }

    if (prop.isMessageType && prop.messageTypeName) {
      valueExpr = buildMessageNormalizationExpression(
        valueExpr,
        prop.messageTypeName,
        {
          allowUndefined: Boolean(prop.optional),
          allowNull: typeAllowsNull(prop.typeAnnotation),
        }
      );
    }

    // Default value logic
    const defaultValue = getDefaultValue(prop);
    const assignment = t.assignmentExpression(
      '=',
      t.memberExpression(
        t.thisExpression(),
        t.cloneNode(prop.privateName)
      ),
      t.conditionalExpression(
        t.identifier('props'),
        valueExpr,
        defaultValue
      )
    );

    return t.expressionStatement(assignment);
  });

  // Memoization logic
  const memoizationCheck = t.ifStatement(
    t.logicalExpression(
      '&&',
      t.unaryExpression('!', t.identifier('props')),
      t.memberExpression(t.identifier(className), t.identifier('EMPTY'))
    ),
    t.returnStatement(
      t.memberExpression(t.identifier(className), t.identifier('EMPTY'))
    )
  );

  const memoizationSet = t.ifStatement(
    t.unaryExpression('!', t.identifier('props')),
    t.expressionStatement(
      t.assignmentExpression(
        '=',
        t.memberExpression(t.identifier(className), t.identifier('EMPTY')),
        t.thisExpression()
      )
    )
  );

  const constructor = t.classMethod(
    'constructor',
    t.identifier('constructor'),
    [constructorParam],
    t.blockStatement([
      memoizationCheck,
      t.expressionStatement(
        t.callExpression(t.super(), [
          t.memberExpression(
            t.identifier(className),
            t.identifier('TYPE_TAG')
          ),
        ])
      ),
      ...constructorAssignments,
      memoizationSet,
    ])
  );

  const staticFields = [
    t.classProperty(
      t.identifier('TYPE_TAG'),
      t.callExpression(t.identifier('Symbol'), [t.stringLiteral(className)]),
      null,
      null,
      false,
      true
    ),
    t.classProperty(
      t.identifier('EMPTY'),
      null,
      t.tsTypeAnnotation(
        t.tsTypeReference(t.identifier(className))
      ),
      null,
      false,
      true
    ),
  ];

  const fromEntriesMethod = buildFromEntriesMethod(propDescriptors, propsTypeRef);

  const descriptorMethod = buildDescriptorMethod(propDescriptors, propsTypeRef);

  const setterMethods = propDescriptors.map((prop) =>
    buildSetterMethod(typeName, propDescriptors, prop)
  );
  const deleteMethods = propDescriptors
    .filter((prop) => prop.optional)
    .map((prop) => buildDeleteMethod(typeName, propDescriptors, prop));
  const arrayMethods = buildArrayMutatorMethods(
    typeName,
    propDescriptors
  );
  const mapMethods = buildMapMutatorMethods(
    typeName,
    propDescriptors
  );
  const setMethods = buildSetMutatorMethods(
    typeName,
    propDescriptors
  );

  const classBody = t.classBody([
    ...staticFields,
    ...backingFields,
    constructor,
    descriptorMethod,
    fromEntriesMethod,
    ...getters,
    ...[
      ...setterMethods,
      ...deleteMethods,
      ...arrayMethods,
      ...mapMethods,
      ...setMethods,
    ].toSorted((a, b) => {
      const nameA = a.key.name;
      const nameB = b.key.name;
      if (nameA < nameB) return -1;
      if (nameA > nameB) return 1;
      return 0;
    }),
  ]);

  const classDecl = t.classDeclaration(
    t.identifier(typeName),
    t.identifier('Message'),
    classBody,
    []
  );

  classDecl.superTypeParameters = t.tsTypeParameterInstantiation([
    t.cloneNode(propsTypeRef),
  ]);

  return classDecl;
}

function buildDescriptorMethod(propDescriptors, propsTypeRef) {
  const descriptorEntries = propDescriptors.map((prop) =>
    t.objectExpression([
      t.objectProperty(t.identifier('name'), t.stringLiteral(prop.name)),
      t.objectProperty(
        t.identifier('fieldNumber'),
        prop.fieldNumber === null
          ? t.nullLiteral()
          : t.numericLiteral(prop.fieldNumber)
      ),
      t.objectProperty(
        t.identifier('getValue'),
        t.arrowFunctionExpression(
          [],
          t.memberExpression(t.thisExpression(), t.cloneNode(prop.privateName))
        )
      ),
    ])
  );

  const body = t.blockStatement([
    t.returnStatement(t.arrayExpression(descriptorEntries)),
  ]);

  const method = t.classMethod(
    'method',
    t.identifier('$getPropDescriptors'),
    [],
    body
  );

  method.accessibility = 'protected';

  method.returnType = t.tsTypeAnnotation(
    t.tsArrayType(
      t.tsTypeReference(
        t.identifier('MessagePropDescriptor'),
        t.tsTypeParameterInstantiation([t.cloneNode(propsTypeRef)])
      )
    )
  );

  return method;
}

function buildFromEntriesMethod(propDescriptors, propsTypeRef) {
  const argsId = t.identifier('entries');
  argsId.typeAnnotation = t.tsTypeAnnotation(
    t.tsTypeReference(
      t.identifier('Record'),
      t.tsTypeParameterInstantiation([t.tsStringKeyword(), t.tsUnknownKeyword()])
    )
  );
  const propsId = t.identifier('props');

  const statements = [
    t.variableDeclaration('const', [
      t.variableDeclarator(
        propsId,
        t.tsAsExpression(
          t.objectExpression([]),
          t.tsTypeReference(
            t.identifier('Partial'),
            t.tsTypeParameterInstantiation([t.cloneNode(propsTypeRef)])
          )
        )
      ),
    ]),
  ];

  for (const prop of propDescriptors) {
    const valueId = t.identifier(`${prop.name}Value`);
    const valueExpr = buildEntryAccessExpression(prop, argsId);
    statements.push(
      t.variableDeclaration('const', [
        t.variableDeclarator(valueId, valueExpr),
      ])
    );

    const undefinedCheck = t.binaryExpression(
      '===',
      valueId,
      t.identifier('undefined')
    );

    if (!prop.optional) {
      statements.push(
        t.ifStatement(
          undefinedCheck,
          buildErrorThrow(`Missing required property "${prop.name}".`)
        )
      );
    }

    const allowsNull = typeAllowsNull(prop.typeAnnotation);
    const normalizedValueId =
      prop.optional && !allowsNull
        ? t.identifier(`${prop.name}Normalized`)
        : valueId;

    if (prop.optional && !allowsNull) {
      statements.push(
        t.variableDeclaration('const', [
          t.variableDeclarator(
            normalizedValueId,
            t.conditionalExpression(
              t.binaryExpression(
                '===',
                valueId,
                t.nullLiteral()
              ),
              t.identifier('undefined'),
              valueId
            )
          ),
        ])
      );
    }

    let checkedValueId = normalizedValueId;

    if (prop.isMap) {
      const mapValueId = t.identifier(`${prop.name}MapValue`);
      statements.push(
        t.variableDeclaration('const', [
          t.variableDeclarator(
            mapValueId,
            buildImmutableMapExpression(checkedValueId)
          ),
        ])
      );
      checkedValueId = mapValueId;
    } else if (prop.isSet) {
      const setValueId = t.identifier(`${prop.name}SetValue`);
      statements.push(
        t.variableDeclaration('const', [
          t.variableDeclarator(
            setValueId,
            buildImmutableSetExpression(checkedValueId)
          ),
        ])
      );
      checkedValueId = setValueId;
    } else if (prop.isArray) {
      const arrayValueId = t.identifier(`${prop.name}ArrayValue`);
      statements.push(
        t.variableDeclaration('const', [
          t.variableDeclarator(
            arrayValueId,
            buildImmutableArrayExpression(checkedValueId)
          ),
        ])
      );
      checkedValueId = arrayValueId;
    } else if (prop.isArrayBufferType) {
      const abValueId = t.identifier(`${prop.name}ArrayBufferValue`);
      statements.push(
        t.variableDeclaration('const', [
          t.variableDeclarator(
            abValueId,
            buildImmutableArrayBufferNormalizationExpression(
              checkedValueId,
              {
                allowUndefined: Boolean(prop.optional),
                allowNull: allowsNull,
              }
            )
          ),
        ])
      );
      checkedValueId = abValueId;
    } else if (prop.isMessageType && prop.messageTypeName) {
      const messageValueId = t.identifier(`${prop.name}MessageValue`);
      statements.push(
        t.variableDeclaration('const', [
          t.variableDeclarator(
            messageValueId,
            buildMessageNormalizationExpression(
              checkedValueId,
              prop.messageTypeName,
              {
                allowUndefined: Boolean(prop.optional),
                allowNull: allowsNull,
              }
            )
          ),
        ])
      );
      checkedValueId = messageValueId;
    }

    const typeCheckExpr = buildRuntimeTypeCheckExpression(
      prop.typeAnnotation,
      checkedValueId
    );

    if (typeCheckExpr && !t.isBooleanLiteral(typeCheckExpr, { value: true })) {
      const shouldValidate = prop.optional
        ? t.logicalExpression(
          '&&',
          t.binaryExpression(
            '!==',
            checkedValueId,
            t.identifier('undefined')
          ),
          t.unaryExpression('!', typeCheckExpr)
        )
        : t.unaryExpression('!', typeCheckExpr);

      statements.push(
        t.ifStatement(
          shouldValidate,
          buildErrorThrow(`Invalid value for property "${prop.name}".`)
        )
      );
    }

    statements.push(
      t.expressionStatement(
        t.assignmentExpression(
          '=',
          t.memberExpression(propsId, t.identifier(prop.name)),
          checkedValueId
        )
      )
    );
  }

  statements.push(
    t.returnStatement(
      t.tsAsExpression(
        propsId,
        t.cloneNode(propsTypeRef)
      )
    )
  );

  const body = t.blockStatement(statements);

  const method = t.classMethod(
    'method',
    t.identifier('$fromEntries'),
    [argsId],
    body
  );

  method.accessibility = 'protected';
  method.returnType = t.tsTypeAnnotation(t.cloneNode(propsTypeRef));

  return method;
}

function ensureBaseImport(programPath, state) {
  const program = programPath.node;
  const hasImportBinding = (name) =>
    program.body.some(
      (stmt) =>
        t.isImportDeclaration(stmt)
        && stmt.specifiers.some(
          (spec) =>
            t.isImportSpecifier(spec) || t.isImportDefaultSpecifier(spec) || t.isImportNamespaceSpecifier(spec)
              ? spec.local.name === name
              : false
        )
    );
  const existingImport = program.body.find(
    (stmt) =>
      t.isImportDeclaration(stmt)
      && stmt.source.value === MESSAGE_SOURCE
  );
  const requiredSpecifiers = ['Message', 'MessagePropDescriptor'];
  if (state.usesImmutableMap && !hasImportBinding('ImmutableMap')) {
    requiredSpecifiers.push('ImmutableMap');
  }
  if (state.usesImmutableSet && !hasImportBinding('ImmutableSet')) {
    requiredSpecifiers.push('ImmutableSet');
  }
  if (state.usesImmutableArray && !hasImportBinding('ImmutableArray')) {
    requiredSpecifiers.push('ImmutableArray');
  }
  if (state.usesImmutableDate && !hasImportBinding('ImmutableDate')) {
    requiredSpecifiers.push('ImmutableDate');
  }
  if (state.usesImmutableUrl && !hasImportBinding('ImmutableUrl')) {
    requiredSpecifiers.push('ImmutableUrl');
  }
  if (state.usesImmutableArrayBuffer && !hasImportBinding('ImmutableArrayBuffer')) {
    requiredSpecifiers.push('ImmutableArrayBuffer');
  }
  if (state.usesEquals) {
    requiredSpecifiers.push('equals');
  }

  if (existingImport) {
    const existingSpecifiers = new Set(
      existingImport.specifiers
        .filter((spec) => t.isImportSpecifier(spec))
        .map((spec) => spec.imported.name)
    );
    for (const name of requiredSpecifiers) {
      if (!existingSpecifiers.has(name)) {
        existingImport.specifiers.push(
          t.importSpecifier(t.identifier(name), t.identifier(name))
        );
      }
    }
    return;
  }

  const importDecl = t.importDeclaration(
    requiredSpecifiers.map((name) =>
      t.importSpecifier(t.identifier(name), t.identifier(name))
    ),
    t.stringLiteral(MESSAGE_SOURCE)
  );

  const insertionIndex = program.body.findIndex(
    (stmt) => !t.isImportDeclaration(stmt)
  );

  if (insertionIndex === -1) {
    program.body.push(importDecl);
  } else {
    program.body.splice(insertionIndex, 0, importDecl);
  }
}

function wrapImmutableType(node) {
  if (!node) {
    return node;
  }

  if (t.isTSParenthesizedType(node)) {
    return t.tsParenthesizedType(wrapImmutableType(t.cloneNode(node.typeAnnotation)));
  }

  if (t.isTSArrayType(node)) {
    return t.tsTypeReference(
      t.identifier('ImmutableArray'),
      t.tsTypeParameterInstantiation([wrapImmutableType(t.cloneNode(node.elementType))])
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
    if (name === 'Map' || name === 'ReadonlyMap' || name === 'ImmutableMap') {
      const params = node.typeParameters?.params ?? [];
      const [key, value] = [
        wrapImmutableType(params[0] ? t.cloneNode(params[0]) : t.tsAnyKeyword()),
        wrapImmutableType(params[1] ? t.cloneNode(params[1]) : t.tsAnyKeyword()),
      ];
      return t.tsTypeReference(
        t.identifier('ImmutableMap'),
        t.tsTypeParameterInstantiation([key, value])
      );
    }

    if (name === 'Set' || name === 'ReadonlySet' || name === 'ImmutableSet') {
      const params = node.typeParameters?.params ?? [];
      const [elem] = [
        wrapImmutableType(params[0] ? t.cloneNode(params[0]) : t.tsAnyKeyword()),
      ];
      return t.tsTypeReference(
        t.identifier('ImmutableSet'),
        t.tsTypeParameterInstantiation([elem])
      );
    }

    if (name === 'Array' || name === 'ReadonlyArray' || name === 'ImmutableArray') {
      const params = node.typeParameters?.params ?? [];
      const [elem] = [
        wrapImmutableType(params[0] ? t.cloneNode(params[0]) : t.tsAnyKeyword()),
      ];
      return t.tsTypeReference(
        t.identifier('ImmutableArray'),
        t.tsTypeParameterInstantiation([elem])
      );
    }
  }

  return node;
}

function buildInputAcceptingMutable(node) {
  if (!node) {
    return node;
  }

  if (t.isTSParenthesizedType(node)) {
    return t.tsParenthesizedType(buildInputAcceptingMutable(t.cloneNode(node.typeAnnotation)));
  }

  if (t.isTSArrayType(node)) {
    const element = buildInputAcceptingMutable(t.cloneNode(node.elementType));
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
    if (name === 'Array' || name === 'ReadonlyArray' || name === 'ImmutableArray') {
      const elem = buildInputAcceptingMutable(node.typeParameters?.params?.[0]
        ? t.cloneNode(node.typeParameters.params[0])
        : t.tsAnyKeyword());
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
    if (name === 'Set' || name === 'ReadonlySet' || name === 'ImmutableSet') {
      const elem = buildInputAcceptingMutable(node.typeParameters?.params?.[0]
        ? t.cloneNode(node.typeParameters.params[0])
        : t.tsAnyKeyword());
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
    if (name === 'Map' || name === 'ReadonlyMap' || name === 'ImmutableMap') {
      const keyParam = node.typeParameters?.params?.[0]
        ? t.cloneNode(node.typeParameters.params[0])
        : t.tsAnyKeyword();
      const valueParam = node.typeParameters?.params?.[1]
        ? t.cloneNode(node.typeParameters.params[1])
        : t.tsAnyKeyword();
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

function buildMapTagComparison(valueExpr, tag) {
  return t.binaryExpression(
    '===',
    buildObjectToStringCall(valueExpr),
    t.stringLiteral(tag)
  );
}

function buildSetTagComparison(valueExpr, tag) {
  return t.binaryExpression(
    '===',
    buildObjectToStringCall(valueExpr),
    t.stringLiteral(tag)
  );
}

function buildObjectToStringCall(valueExpr) {
  return t.callExpression(
    t.memberExpression(
      t.memberExpression(
        t.memberExpression(t.identifier('Object'), t.identifier('prototype')),
        t.identifier('toString')
      ),
      t.identifier('call')
    ),
    [t.cloneNode(valueExpr)]
  );
}

function buildEntryAccessExpression(prop, entriesId) {
  const namedAccess = t.memberExpression(
    entriesId,
    t.stringLiteral(prop.name),
    true
  );

  if (prop.fieldNumber === null) {
    return namedAccess;
  }

  const numberedAccess = t.memberExpression(
    entriesId,
    t.stringLiteral(String(prop.fieldNumber)),
    true
  );

  return t.conditionalExpression(
    t.binaryExpression(
      '===',
      numberedAccess,
      t.identifier('undefined')
    ),
    namedAccess,
    numberedAccess
  );
}

function buildImmutableMapExpression(valueExpr) {
  const nilCheck = t.logicalExpression(
    '||',
    t.binaryExpression('===', t.cloneNode(valueExpr), t.identifier('undefined')),
    t.binaryExpression('===', t.cloneNode(valueExpr), t.nullLiteral())
  );

  const immutableCheck = t.logicalExpression(
    '||',
    t.binaryExpression('instanceof', t.cloneNode(valueExpr), t.identifier('ImmutableMap')),
    buildMapTagComparison(valueExpr, '[object ImmutableMap]')
  );

  const buildNewImmutableMap = () =>
    t.newExpression(t.identifier('ImmutableMap'), [t.cloneNode(valueExpr)]);

  return t.conditionalExpression(
    nilCheck,
    t.cloneNode(valueExpr),
    t.conditionalExpression(
      immutableCheck,
      t.cloneNode(valueExpr),
      buildNewImmutableMap()
    )
  );
}

function buildImmutableArrayExpression(valueExpr) {
  const nilCheck = t.logicalExpression(
    '||',
    t.binaryExpression('===', t.cloneNode(valueExpr), t.identifier('undefined')),
    t.binaryExpression('===', t.cloneNode(valueExpr), t.nullLiteral())
  );

  const immutableCheck = t.binaryExpression(
    'instanceof',
    t.cloneNode(valueExpr),
    t.identifier('ImmutableArray')
  );

  const toImmutable = () =>
    t.newExpression(t.identifier('ImmutableArray'), [t.cloneNode(valueExpr)]);

  return t.conditionalExpression(
    nilCheck,
    t.cloneNode(valueExpr),
    t.conditionalExpression(
      immutableCheck,
      t.cloneNode(valueExpr),
      toImmutable()
    )
  );
}

function buildImmutableSetExpression(valueExpr) {
  const nilCheck = t.logicalExpression(
    '||',
    t.binaryExpression('===', t.cloneNode(valueExpr), t.identifier('undefined')),
    t.binaryExpression('===', t.cloneNode(valueExpr), t.nullLiteral())
  );

  const immutableCheck = t.logicalExpression(
    '||',
    t.binaryExpression('instanceof', t.cloneNode(valueExpr), t.identifier('ImmutableSet')),
    buildSetTagComparison(valueExpr, '[object ImmutableSet]')
  );

  const buildNewImmutableSet = () =>
    t.newExpression(t.identifier('ImmutableSet'), [t.cloneNode(valueExpr)]);

  return t.conditionalExpression(
    nilCheck,
    t.cloneNode(valueExpr),
    t.conditionalExpression(
      immutableCheck,
      t.cloneNode(valueExpr),
      buildNewImmutableSet()
    )
  );
}

function buildImmutableDateNormalizationExpression(
  valueExpr,
  { allowUndefined = false, allowNull = false } = {}
) {
  const instanceCheck = t.binaryExpression(
    'instanceof',
    t.cloneNode(valueExpr),
    t.identifier('ImmutableDate')
  );
  const newInstance = t.newExpression(t.identifier('ImmutableDate'), [
    t.cloneNode(valueExpr),
  ]);

  let normalized = t.conditionalExpression(
    instanceCheck,
    t.cloneNode(valueExpr),
    newInstance
  );

  if (allowNull) {
    normalized = t.conditionalExpression(
      t.binaryExpression('===', t.cloneNode(valueExpr), t.nullLiteral()),
      t.cloneNode(valueExpr),
      normalized
    );
  }

  if (allowUndefined) {
    normalized = t.conditionalExpression(
      t.binaryExpression('===', t.cloneNode(valueExpr), t.identifier('undefined')),
      t.identifier('undefined'),
      normalized
    );
  }

  return normalized;
}

function buildImmutableUrlNormalizationExpression(
  valueExpr,
  { allowUndefined = false, allowNull = false } = {}
) {
  const instanceCheck = t.binaryExpression(
    'instanceof',
    t.cloneNode(valueExpr),
    t.identifier('ImmutableUrl')
  );
  const newInstance = t.newExpression(t.identifier('ImmutableUrl'), [
    t.cloneNode(valueExpr),
  ]);

  let normalized = t.conditionalExpression(
    instanceCheck,
    t.cloneNode(valueExpr),
    newInstance
  );

  if (allowNull) {
    normalized = t.conditionalExpression(
      t.binaryExpression('===', t.cloneNode(valueExpr), t.nullLiteral()),
      t.cloneNode(valueExpr),
      normalized
    );
  }

  if (allowUndefined) {
    normalized = t.conditionalExpression(
      t.binaryExpression('===', t.cloneNode(valueExpr), t.identifier('undefined')),
      t.identifier('undefined'),
      normalized
    );
  }

  return normalized;
}

function buildImmutableArrayBufferNormalizationExpression(
  valueExpr,
  { allowUndefined = false, allowNull = false } = {}
) {
  const instanceCheck = t.binaryExpression(
    'instanceof',
    t.cloneNode(valueExpr),
    t.identifier('ImmutableArrayBuffer')
  );
  const isArrayBufferView = t.callExpression(
    t.memberExpression(t.identifier('ArrayBuffer'), t.identifier('isView')),
    [t.cloneNode(valueExpr)]
  );
  const newFromView = t.newExpression(
    t.identifier('ImmutableArrayBuffer'),
    [t.cloneNode(valueExpr)]
  );
  const newInstance = t.newExpression(t.identifier('ImmutableArrayBuffer'), [
    t.cloneNode(valueExpr),
  ]);

  let normalized = t.conditionalExpression(
    instanceCheck,
    t.cloneNode(valueExpr),
    t.conditionalExpression(isArrayBufferView, newFromView, newInstance)
  );

  if (allowNull) {
    normalized = t.conditionalExpression(
      t.binaryExpression('===', t.cloneNode(valueExpr), t.nullLiteral()),
      t.cloneNode(valueExpr),
      normalized
    );
  }

  if (allowUndefined) {
    normalized = t.conditionalExpression(
      t.binaryExpression('===', t.cloneNode(valueExpr), t.identifier('undefined')),
      t.identifier('undefined'),
      normalized
    );
  }

  return normalized;
}

function buildMessageNormalizationExpression(
  valueExpr,
  className,
  { allowUndefined = false, allowNull = false } = {}
) {
  const instanceCheck = t.binaryExpression(
    'instanceof',
    t.cloneNode(valueExpr),
    t.identifier(className)
  );
  const newInstance = t.newExpression(t.identifier(className), [
    t.cloneNode(valueExpr),
  ]);

  let normalized = t.conditionalExpression(
    instanceCheck,
    t.cloneNode(valueExpr),
    newInstance
  );

  if (allowNull) {
    normalized = t.conditionalExpression(
      t.binaryExpression(
        '===',
        t.cloneNode(valueExpr),
        t.nullLiteral()
      ),
      t.cloneNode(valueExpr),
      normalized
    );
  }

  if (allowUndefined) {
    normalized = t.conditionalExpression(
      t.binaryExpression(
        '===',
        t.cloneNode(valueExpr),
        t.identifier('undefined')
      ),
      t.cloneNode(valueExpr),
      normalized
    );
  }

  return normalized;
}

function buildPropsObjectExpression(
  propDescriptors,
  targetProp,
  valueExpr,
  { omitTarget = false } = {}
) {
  return t.objectExpression(
    propDescriptors
      .filter((prop) => !(omitTarget && prop === targetProp))
      .map((prop) =>
        t.objectProperty(
          t.identifier(prop.name),
          prop === targetProp
            ? t.cloneNode(valueExpr)
            : t.memberExpression(
              t.thisExpression(),
              t.cloneNode(prop.privateName)
            )
        )
      )
  );
}

function buildSetterMethod(typeName, propDescriptors, targetProp) {
  const valueId = t.identifier('value');
  valueId.typeAnnotation = t.tsTypeAnnotation(
    t.cloneNode(targetProp.displayType || targetProp.inputTypeAnnotation)
  );

  let setterValueExpr = t.cloneNode(valueId);

  if (targetProp.isMap) {
    setterValueExpr = buildImmutableMapExpression(setterValueExpr);
  } else if (targetProp.isSet) {
    setterValueExpr = buildImmutableSetExpression(setterValueExpr);
  }

  if (targetProp.isMessageType && targetProp.messageTypeName) {
    setterValueExpr = buildMessageNormalizationExpression(
      setterValueExpr,
      targetProp.messageTypeName,
      {
        allowUndefined: Boolean(targetProp.optional),
        allowNull: typeAllowsNull(targetProp.typeAnnotation),
      }
    );
  }

  const propsObject = buildPropsObjectExpression(
    propDescriptors,
    targetProp,
    setterValueExpr
  );

  const body = t.blockStatement([
    t.returnStatement(
      t.newExpression(t.identifier(typeName), [propsObject])
    ),
  ]);

  const methodName = `set${capitalize(targetProp.name)}`;
  const method = t.classMethod('method', t.identifier(methodName), [valueId], body);
  method.returnType = t.tsTypeAnnotation(
    t.tsTypeReference(t.identifier(typeName))
  );
  return method;
}

function buildDeleteMethod(typeName, propDescriptors, targetProp) {
  const propsObject = buildPropsObjectExpression(
    propDescriptors,
    targetProp,
    t.identifier('undefined'),
    { omitTarget: true }
  );

  const body = t.blockStatement([
    t.returnStatement(
      t.newExpression(t.identifier(typeName), [propsObject])
    ),
  ]);

  const methodName = `delete${capitalize(targetProp.name)}`;
  const method = t.classMethod('method', t.identifier(methodName), [], body);
  method.returnType = t.tsTypeAnnotation(
    t.tsTypeReference(t.identifier(typeName))
  );
  return method;
}

function buildArrayMutatorMethods(typeName, propDescriptors) {
  const methods = [];

  for (const prop of propDescriptors) {
    if (!prop.isArray || !prop.arrayElementType) {
      continue;
    }

    methods.push(
      buildArrayMutationMethod(
        typeName,
        propDescriptors,
        prop,
        `push${capitalize(prop.name)}`,
        [buildArrayValuesRestParam(prop)],
        () => [],
        {
          append: [t.spreadElement(t.identifier('values'))],
        }
      )
      ,
      buildArrayMutationMethod(
        typeName,
        propDescriptors,
        prop,
        `pop${capitalize(prop.name)}`,
        [],
        (nextRef) => [
          t.expressionStatement(
            t.callExpression(
              t.memberExpression(nextRef(), t.identifier('pop')),
              []
            )
          ),
        ]
      )
      ,
      buildArrayMutationMethod(
        typeName,
        propDescriptors,
        prop,
        `shift${capitalize(prop.name)}`,
        [],
        (nextRef) => [
          t.expressionStatement(
            t.callExpression(
              t.memberExpression(nextRef(), t.identifier('shift')),
              []
            )
          ),
        ]
      )
      ,
      buildArrayMutationMethod(
        typeName,
        propDescriptors,
        prop,
        `unshift${capitalize(prop.name)}`,
        [buildArrayValuesRestParam(prop)],
        () => [],
        {
          prepend: [t.spreadElement(t.identifier('values'))],
        }
      )
      ,
      buildSpliceMethod(typeName, propDescriptors, prop)
      ,
      buildArrayMutationMethod(
        typeName,
        propDescriptors,
        prop,
        `reverse${capitalize(prop.name)}`,
        [],
        (nextRef) => [
          t.expressionStatement(
            t.callExpression(
              t.memberExpression(nextRef(), t.identifier('reverse')),
              []
            )
          ),
        ]
      )
      ,
      buildSortMethod(typeName, propDescriptors, prop)
      ,
      buildArrayMutationMethod(
        typeName,
        propDescriptors,
        prop,
        `fill${capitalize(prop.name)}`,
        buildFillParams(prop),
        (nextRef) => [
          t.expressionStatement(
            t.callExpression(
              t.memberExpression(nextRef(), t.identifier('fill')),
              [
                t.identifier('value'),
                t.identifier('start'),
                t.identifier('end'),
              ]
            )
          ),
        ]
      )
      ,
      buildArrayMutationMethod(
        typeName,
        propDescriptors,
        prop,
        `copyWithin${capitalize(prop.name)}`,
        buildCopyWithinParams(),
        (nextRef) => [
          t.expressionStatement(
            t.callExpression(
              t.memberExpression(nextRef(), t.identifier('copyWithin')),
              [
                t.identifier('target'),
                t.identifier('start'),
                t.identifier('end'),
              ]
            )
          ),
        ]
      )
    );
  }

  return methods;
}

function buildArrayValuesRestParam(prop) {
  const valuesId = t.identifier('values');
  valuesId.typeAnnotation = t.tsTypeAnnotation(
    t.tsArrayType(t.cloneNode(prop.arrayElementType))
  );
  return t.restElement(valuesId);
}

function buildFillParams(prop) {
  const valueId = t.identifier('value');
  valueId.typeAnnotation = t.tsTypeAnnotation(
    t.cloneNode(prop.arrayElementType)
  );
  const startId = t.identifier('start');
  startId.typeAnnotation = t.tsTypeAnnotation(t.tsNumberKeyword());
  startId.optional = true;
  const endId = t.identifier('end');
  endId.typeAnnotation = t.tsTypeAnnotation(t.tsNumberKeyword());
  endId.optional = true;
  return [valueId, startId, endId];
}

function buildCopyWithinParams() {
  const targetId = t.identifier('target');
  targetId.typeAnnotation = t.tsTypeAnnotation(t.tsNumberKeyword());
  const startId = t.identifier('start');
  startId.typeAnnotation = t.tsTypeAnnotation(t.tsNumberKeyword());
  const endId = t.identifier('end');
  endId.typeAnnotation = t.tsTypeAnnotation(t.tsNumberKeyword());
  endId.optional = true;
  return [targetId, startId, endId];
}

function buildSortMethod(typeName, propDescriptors, prop) {
  const compareId = t.identifier('compareFn');
  const firstParam = t.identifier('a');
  firstParam.typeAnnotation = t.tsTypeAnnotation(
    t.cloneNode(prop.arrayElementType)
  );
  const secondParam = t.identifier('b');
  secondParam.typeAnnotation = t.tsTypeAnnotation(
    t.cloneNode(prop.arrayElementType)
  );
  const compareType = t.tsFunctionType(
    null,
    [firstParam, secondParam],
    t.tsTypeAnnotation(t.tsNumberKeyword())
  );
  compareId.typeAnnotation = t.tsTypeAnnotation(compareType);
  compareId.optional = true;

  return buildArrayMutationMethod(
    typeName,
    propDescriptors,
    prop,
    `sort${capitalize(prop.name)}`,
    [compareId],
    (nextRef) => [
      t.expressionStatement(
        t.callExpression(
          t.memberExpression(nextRef(), t.identifier('sort')),
          [t.identifier('compareFn')]
        )
      ),
    ]
  );
}

function buildSpliceMethod(typeName, propDescriptors, prop) {
  const startId = t.identifier('start');
  startId.typeAnnotation = t.tsTypeAnnotation(t.tsNumberKeyword());
  const deleteCountId = t.identifier('deleteCount');
  deleteCountId.typeAnnotation = t.tsTypeAnnotation(t.tsNumberKeyword());
  deleteCountId.optional = true;
  const itemsId = t.identifier('items');
  itemsId.typeAnnotation = t.tsTypeAnnotation(
    t.tsArrayType(t.cloneNode(prop.arrayElementType))
  );
  const itemsParam = t.restElement(itemsId);

  return buildArrayMutationMethod(
    typeName,
    propDescriptors,
    prop,
    `splice${capitalize(prop.name)}`,
    [startId, deleteCountId, itemsParam],
    (nextRef) => {
      const argsId = t.identifier('args');
      return [
        t.variableDeclaration('const', [
          t.variableDeclarator(
            argsId,
            t.arrayExpression([t.identifier('start')])
          ),
        ]),
        t.ifStatement(
          t.binaryExpression(
            '!==',
            t.identifier('deleteCount'),
            t.identifier('undefined')
          ),
          t.expressionStatement(
            t.callExpression(
              t.memberExpression(argsId, t.identifier('push')),
              [t.identifier('deleteCount')]
            )
          )
        ),
        t.expressionStatement(
          t.callExpression(
            t.memberExpression(argsId, t.identifier('push')),
            [t.spreadElement(t.identifier('items'))]
          )
        ),
        t.expressionStatement(
          t.callExpression(
            t.memberExpression(nextRef(), t.identifier('splice')),
            [t.spreadElement(argsId)]
          )
        ),
      ];
    }
  );
}

function buildArrayMutationMethod(
  typeName,
  propDescriptors,
  prop,
  methodName,
  params,
  buildMutations,
  cloneOptions = {}
) {
  const { statements, nextName } = buildArrayCloneSetup(prop, cloneOptions);
  const nextRef = () => t.identifier(nextName);
  const mutations = buildMutations(nextRef);
  const currentExpr = t.memberExpression(
    t.thisExpression(),
    t.identifier(prop.name)
  );

  const preludeStatements = [];

  // Fast no-op checks to avoid unnecessary cloning/equality work.
  if (methodName.startsWith('push') || methodName.startsWith('unshift')) {
    const valuesParam = params[0];
    const valuesId =
      t.isIdentifier(valuesParam) ? valuesParam
        : t.isRestElement(valuesParam) && t.isIdentifier(valuesParam.argument)
          ? valuesParam.argument
          : null;
    if (valuesId) {
      preludeStatements.push(
        t.ifStatement(
          t.binaryExpression('===', t.memberExpression(t.cloneNode(valuesId), t.identifier('length')), t.numericLiteral(0)),
          t.returnStatement(t.thisExpression())
        )
      );
    }
  }

  if (methodName.startsWith('pop') || methodName.startsWith('shift')) {
    const lengthAccess = t.memberExpression(
      t.logicalExpression('??', currentExpr, t.arrayExpression([])),
      t.identifier('length')
    );
    preludeStatements.push(
      t.ifStatement(
        t.binaryExpression('===', lengthAccess, t.numericLiteral(0)),
        t.returnStatement(t.thisExpression())
      )
    );
  }

  const bodyStatements = [
    ...preludeStatements,
    ...statements,
    ...mutations,
    t.returnStatement(
      t.newExpression(t.identifier(typeName), [
        buildPropsObjectExpression(
          propDescriptors,
          prop,
          nextRef()
        ),
      ])
    ),
  ];

  const method = t.classMethod(
    'method',
    t.identifier(methodName),
    params,
    t.blockStatement(bodyStatements)
  );
  method.returnType = t.tsTypeAnnotation(
    t.tsTypeReference(t.identifier(typeName))
  );
  return method;
}

function buildArrayCloneSetup(prop, { prepend = [], append = [] } = {}) {
  const sourceName = `${prop.name}Array`;
  const nextName = `${prop.name}Next`;

  const fieldExpr = () =>
    t.memberExpression(
      t.thisExpression(),
      t.cloneNode(prop.privateName)
    );

  const sourceInit = prop.optional
    ? t.conditionalExpression(
      t.binaryExpression(
        '===',
        fieldExpr(),
        t.identifier('undefined')
      ),
      t.arrayExpression([]),
      fieldExpr()
    )
    : fieldExpr();

  const statements = [
    t.variableDeclaration('const', [
      t.variableDeclarator(t.identifier(sourceName), sourceInit),
    ]),
    t.variableDeclaration('const', [
      t.variableDeclarator(
        t.identifier(nextName),
        t.arrayExpression([
          ...prepend,
          t.spreadElement(t.identifier(sourceName)),
          ...append,
        ])
      ),
    ]),
  ];

  return { statements, nextName };
}

function buildMapMutatorMethods(typeName, propDescriptors) {
  const methods = [];

  for (const prop of propDescriptors) {
    if (!prop.isMap) {
      continue;
    }

    methods.push(
      buildMapMutationMethod(
        typeName,
        propDescriptors,
        prop,
        `set${capitalize(prop.name)}Entry`,
        buildMapSetParams(prop),
        (mapRef) => [
          t.expressionStatement(
            t.callExpression(
              t.memberExpression(mapRef(), t.identifier('set')),
              [t.identifier('key'), t.identifier('value')]
            )
          ),
        ],
        buildSetEntryOptions(prop)
      )
      ,
      buildMapMutationMethod(
        typeName,
        propDescriptors,
        prop,
        `delete${capitalize(prop.name)}Entry`,
        buildMapDeleteParams(prop),
        (mapRef) => [
          t.expressionStatement(
            t.callExpression(
              t.memberExpression(mapRef(), t.identifier('delete')),
              [t.identifier('key')]
            )
          ),
        ],
        buildDeleteEntryOptions(prop)
      )
      ,
      buildMapMutationMethod(
        typeName,
        propDescriptors,
        prop,
        `clear${capitalize(prop.name)}`,
        [],
        (mapRef) => [
          t.expressionStatement(
            t.callExpression(
              t.memberExpression(mapRef(), t.identifier('clear')),
              []
            )
          ),
        ],
        buildClearMapOptions(prop)
      )
      ,
      buildMapMutationMethod(
        typeName,
        propDescriptors,
        prop,
        `merge${capitalize(prop.name)}Entries`,
        buildMapMergeParams(prop),
        (mapRef) => {
          const mergeKeyId = t.identifier('mergeKey');
          const mergeValueId = t.identifier('mergeValue');
          return [
            t.forOfStatement(
              t.variableDeclaration('const', [
                t.variableDeclarator(t.arrayPattern([mergeKeyId, mergeValueId])),
              ]),
              t.identifier('entries'),
              t.blockStatement([
                t.expressionStatement(
                  t.callExpression(
                    t.memberExpression(mapRef(), t.identifier('set')),
                    [mergeKeyId, mergeValueId]
                  )
                ),
              ])
            ),
          ];
        }
      )
      ,
      buildMapMutationMethod(
        typeName,
        propDescriptors,
        prop,
        `update${capitalize(prop.name)}Entry`,
        buildMapUpdateParams(prop),
        (mapRef) => {
          const currentId = t.identifier('currentValue');
          const updatedId = t.identifier('updatedValue');
          return [
            t.variableDeclaration('const', [
              t.variableDeclarator(
                currentId,
                t.callExpression(
                  t.memberExpression(mapRef(), t.identifier('get')),
                  [t.identifier('key')]
                )
              ),
            ]),
            t.variableDeclaration('const', [
              t.variableDeclarator(
                updatedId,
                t.callExpression(t.identifier('updater'), [currentId])
              ),
            ]),
            t.expressionStatement(
              t.callExpression(
                t.memberExpression(mapRef(), t.identifier('set')),
                [t.identifier('key'), updatedId]
              )
            ),
          ];
        }
      )
      ,
      buildMapMutationMethod(
        typeName,
        propDescriptors,
        prop,
        `map${capitalize(prop.name)}Entries`,
        buildMapMapperParams(prop),
        (mapRef) => {
          const mappedEntriesId = t.identifier(`${prop.name}MappedEntries`);
          const keyId = t.identifier('entryKey');
          const valueId = t.identifier('entryValue');
          const mappedId = t.identifier('mappedEntry');
          const newKeyId = t.identifier('newKey');
          const newValueId = t.identifier('newValue');
          return [
            t.variableDeclaration('const', [
              t.variableDeclarator(mappedEntriesId, t.arrayExpression([])),
            ]),
            t.forOfStatement(
              t.variableDeclaration('const', [
                t.variableDeclarator(t.arrayPattern([keyId, valueId])),
              ]),
              mapRef(),
              t.blockStatement([
                t.variableDeclaration('const', [
                  t.variableDeclarator(
                    mappedId,
                    t.callExpression(t.identifier('mapper'), [valueId, keyId])
                  ),
                ]),
                t.expressionStatement(
                  t.callExpression(
                    t.memberExpression(mappedEntriesId, t.identifier('push')),
                    [mappedId]
                  )
                ),
              ])
            ),
            t.expressionStatement(
              t.callExpression(
                t.memberExpression(mapRef(), t.identifier('clear')),
                []
              )
            ),
            t.forOfStatement(
              t.variableDeclaration('const', [
                t.variableDeclarator(
                  t.arrayPattern([newKeyId, newValueId]),
                  null
                ),
              ]),
              mappedEntriesId,
              t.blockStatement([
                t.expressionStatement(
                  t.callExpression(
                    t.memberExpression(mapRef(), t.identifier('set')),
                    [newKeyId, newValueId]
                  )
                ),
              ])
            ),
          ];
        }
      )
      ,
      buildMapMutationMethod(
        typeName,
        propDescriptors,
        prop,
        `filter${capitalize(prop.name)}Entries`,
        buildMapPredicateParams(prop),
        (mapRef) => {
          const keyId = t.identifier('entryKey');
          const valueId = t.identifier('entryValue');
          return [
            t.forOfStatement(
              t.variableDeclaration('const', [
                t.variableDeclarator(t.arrayPattern([keyId, valueId])),
              ]),
              mapRef(),
              t.blockStatement([
                t.ifStatement(
                  t.unaryExpression(
                    '!',
                    t.callExpression(t.identifier('predicate'), [valueId, keyId])
                  ),
                  t.expressionStatement(
                    t.callExpression(
                      t.memberExpression(mapRef(), t.identifier('delete')),
                      [keyId]
                    )
                  )
                ),
              ])
            ),
          ];
        }
      )
    );
  }

  return methods;
}

function buildSetMutatorMethods(typeName, propDescriptors) {
  const methods = [];

  for (const prop of propDescriptors) {
    if (!prop.isSet || !prop.setElementType) {
      continue;
    }

    methods.push(
      buildSetMutationMethod(
        typeName,
        propDescriptors,
        prop,
        `add${capitalize(prop.name)}`,
        buildSetAddParams(prop),
        (setRef) => [
          t.expressionStatement(
            t.callExpression(
              t.memberExpression(setRef(), t.identifier('add')),
              [t.identifier('value')]
            )
          ),
        ]
      )
      ,
      buildSetMutationMethod(
        typeName,
        propDescriptors,
        prop,
        `addAll${capitalize(prop.name)}`,
        buildSetAddAllParams(prop),
        (setRef) => {
          const toAddId = t.identifier('toAdd');
          return [
            t.forOfStatement(
              t.variableDeclaration('const', [
                t.variableDeclarator(toAddId),
              ]),
              t.identifier('values'),
              t.blockStatement([
                t.expressionStatement(
                  t.callExpression(
                    t.memberExpression(setRef(), t.identifier('add')),
                    [toAddId]
                  )
                ),
              ])
            ),
          ];
        }
      )
      ,
      buildSetMutationMethod(
        typeName,
        propDescriptors,
        prop,
        `delete${capitalize(prop.name)}`,
        buildSetDeleteParams(prop),
        (setRef) => [
          t.expressionStatement(
            t.callExpression(
              t.memberExpression(setRef(), t.identifier('delete')),
              [t.identifier('value')]
            )
          ),
        ]
      )
      ,
      buildSetMutationMethod(
        typeName,
        propDescriptors,
        prop,
        `deleteAll${capitalize(prop.name)}`,
        buildSetDeleteAllParams(prop),
        (setRef) => {
          const delId = t.identifier('del');
          return [
            t.forOfStatement(
              t.variableDeclaration('const', [
                t.variableDeclarator(delId),
              ]),
              t.identifier('values'),
              t.blockStatement([
                t.expressionStatement(
                  t.callExpression(
                    t.memberExpression(setRef(), t.identifier('delete')),
                    [delId]
                  )
                ),
              ])
            ),
          ];
        }
      )
      ,
      buildSetMutationMethod(
        typeName,
        propDescriptors,
        prop,
        `clear${capitalize(prop.name)}`,
        [],
        (setRef) => [
          t.expressionStatement(
            t.callExpression(
              t.memberExpression(setRef(), t.identifier('clear')),
              []
            )
          ),
        ]
      )
      ,
      buildSetMutationMethod(
        typeName,
        propDescriptors,
        prop,
        `filter${capitalize(prop.name)}`,
        buildSetFilterParams(prop),
        (setRef) => {
          const filteredId = t.identifier(`${prop.name}Filtered`);
          const valueId = t.identifier('value');
          return [
            t.variableDeclaration('const', [
              t.variableDeclarator(filteredId, t.arrayExpression([])),
            ]),
            t.forOfStatement(
              t.variableDeclaration('const', [
                t.variableDeclarator(valueId),
              ]),
              setRef(),
              t.blockStatement([
                t.ifStatement(
                  t.callExpression(t.identifier('predicate'), [valueId]),
                  t.expressionStatement(
                    t.callExpression(
                      t.memberExpression(filteredId, t.identifier('push')),
                      [valueId]
                    )
                  )
                ),
              ])
            ),
            t.expressionStatement(
              t.callExpression(
                t.memberExpression(setRef(), t.identifier('clear')),
                []
              )
            ),
            t.forOfStatement(
              t.variableDeclaration('const', [
                t.variableDeclarator(valueId),
              ]),
              filteredId,
              t.blockStatement([
                t.expressionStatement(
                  t.callExpression(
                    t.memberExpression(setRef(), t.identifier('add')),
                    [valueId]
                  )
                ),
              ])
            ),
          ];
        }
      )
      ,
      buildSetMutationMethod(
        typeName,
        propDescriptors,
        prop,
        `map${capitalize(prop.name)}`,
        buildSetMapParams(prop),
        (setRef) => {
          const mappedId = t.identifier(`${prop.name}Mapped`);
          const valueId = t.identifier('value');
          const mappedValueId = t.identifier('mappedValue');
          return [
            t.variableDeclaration('const', [
              t.variableDeclarator(mappedId, t.arrayExpression([])),
            ]),
            t.forOfStatement(
              t.variableDeclaration('const', [
                t.variableDeclarator(valueId),
              ]),
              setRef(),
              t.blockStatement([
                t.variableDeclaration('const', [
                  t.variableDeclarator(
                    mappedValueId,
                    t.callExpression(t.identifier('mapper'), [valueId])
                  ),
                ]),
                t.expressionStatement(
                  t.callExpression(
                    t.memberExpression(mappedId, t.identifier('push')),
                    [mappedValueId]
                  )
                ),
              ])
            ),
            t.expressionStatement(
              t.callExpression(
                t.memberExpression(setRef(), t.identifier('clear')),
                []
              )
            ),
            t.forOfStatement(
              t.variableDeclaration('const', [
                t.variableDeclarator(valueId),
              ]),
              mappedId,
              t.blockStatement([
                t.expressionStatement(
                  t.callExpression(
                    t.memberExpression(setRef(), t.identifier('add')),
                    [valueId]
                  )
                ),
              ])
            ),
          ];
        }
      )
      ,
      buildSetMutationMethod(
        typeName,
        propDescriptors,
        prop,
        `update${capitalize(prop.name)}`,
        buildSetUpdateParams(prop),
        (setRef) => {
          const updatedId = t.identifier('updated');
          return [
            t.variableDeclaration('const', [
              t.variableDeclarator(
                updatedId,
                t.callExpression(t.identifier('updater'), [setRef()])
              ),
            ]),
            t.expressionStatement(
              t.callExpression(
                t.memberExpression(setRef(), t.identifier('clear')),
                []
              )
            ),
            t.forOfStatement(
              t.variableDeclaration('const', [
                t.variableDeclarator(t.identifier('updatedItem'), null),
              ]),
              updatedId,
              t.blockStatement([
                t.expressionStatement(
                  t.callExpression(
                    t.memberExpression(setRef(), t.identifier('add')),
                    [t.identifier('updatedItem')]
                  )
                ),
              ])
            ),
          ];
        }
      )
    );
  }

  return methods;
}

function buildMapMutationMethod(
  typeName,
  propDescriptors,
  prop,
  methodName,
  params,
  buildMutations,
  options = {}
) {
  const { prelude = [], skipNoopGuard = false } = options;
  const { statements, nextName } = buildMapCloneSetup(prop);
  const nextRef = () => t.identifier(nextName);
  const mutations = buildMutations(nextRef);
  const currentExpr = t.memberExpression(
    t.thisExpression(),
    t.identifier(prop.name)
  );
  const bodyStatements = [
    ...prelude,
    ...statements,
    ...mutations,
    ...(skipNoopGuard ? [] : [buildNoopGuard(currentExpr, nextRef())]),
    t.returnStatement(
      t.newExpression(t.identifier(typeName), [
        buildPropsObjectExpression(propDescriptors, prop, nextRef()),
      ])
    ),
  ];

  const method = t.classMethod(
    'method',
    t.identifier(methodName),
    params,
    t.blockStatement(bodyStatements)
  );
  method.returnType = t.tsTypeAnnotation(
    t.tsTypeReference(t.identifier(typeName))
  );
  return method;
}

function buildMapCloneSetup(prop) {
  const sourceName = `${prop.name}MapSource`;
  const entriesName = `${prop.name}MapEntries`;
  const nextName = `${prop.name}MapNext`;

  const fieldExpr = () =>
    t.memberExpression(
      t.thisExpression(),
      t.cloneNode(prop.privateName)
    );

  const sourceDecl = t.variableDeclaration('const', [
    t.variableDeclarator(t.identifier(sourceName), fieldExpr()),
  ]);

  const entriesExpr = prop.optional
    ? t.conditionalExpression(
      t.binaryExpression(
        '===',
        t.identifier(sourceName),
        t.identifier('undefined')
      ),
      t.arrayExpression([]),
      t.arrayExpression([
        t.spreadElement(
          t.callExpression(
            t.memberExpression(t.identifier(sourceName), t.identifier('entries')),
            []
          )
        )
      ])
    )
    : t.arrayExpression([
      t.spreadElement(
        t.callExpression(
          t.memberExpression(t.identifier(sourceName), t.identifier('entries')),
          []
        )
      )
    ]);

  const entriesDecl = t.variableDeclaration('const', [
    t.variableDeclarator(t.identifier(entriesName), entriesExpr),
  ]);

  const mapDecl = t.variableDeclaration('const', [
    t.variableDeclarator(
      t.identifier(nextName),
      t.newExpression(t.identifier('Map'), [t.identifier(entriesName)])
    ),
  ]);

  return { statements: [sourceDecl, entriesDecl, mapDecl], nextName };
}

function buildSetMutationMethod(
  typeName,
  propDescriptors,
  prop,
  methodName,
  params,
  buildMutations
) {
  const { statements, nextName } = buildSetCloneSetup(prop);
  const nextRef = () => t.identifier(nextName);
  const mutations = buildMutations(nextRef);
  const currentExpr = t.memberExpression(
    t.thisExpression(),
    t.identifier(prop.name)
  );
  const bodyStatements = [
    ...statements,
    ...mutations,
    buildNoopGuard(currentExpr, nextRef()),
    t.returnStatement(
      t.newExpression(t.identifier(typeName), [
        buildPropsObjectExpression(
          propDescriptors,
          prop,
          nextRef()
        ),
      ])
    ),
  ];

  const method = t.classMethod(
    'method',
    t.identifier(methodName),
    params,
    t.blockStatement(bodyStatements)
  );
  method.returnType = t.tsTypeAnnotation(
    t.tsTypeReference(t.identifier(typeName))
  );
  return method;
}

function buildSetCloneSetup(prop) {
  const sourceName = `${prop.name}SetSource`;
  const entriesName = `${prop.name}SetEntries`;
  const nextName = `${prop.name}SetNext`;

  const fieldExpr = () =>
    t.memberExpression(
      t.thisExpression(),
      t.identifier(prop.name)
    );

  const statements = [
    t.variableDeclaration('const', [
      t.variableDeclarator(
        t.identifier(sourceName),
        t.logicalExpression(
          '??',
          fieldExpr(),
          t.arrayExpression([])
        )
      ),
    ]),
    t.variableDeclaration('const', [
      t.variableDeclarator(
        t.identifier(entriesName),
        t.arrayExpression([
          t.spreadElement(t.identifier(sourceName)),
        ])
      ),
    ]),
    t.variableDeclaration('const', [
      t.variableDeclarator(
        t.identifier(nextName),
        t.newExpression(
          t.identifier('Set'),
          [t.identifier(entriesName)]
        )
      ),
    ]),
  ];

  return { statements, nextName, entriesName };
}

function buildNoopGuard(currentExpr, nextExpr) {
  const sameRef = t.binaryExpression('===', t.cloneNode(currentExpr), t.cloneNode(nextExpr));
  const equalsCall = t.logicalExpression(
    '&&',
    t.binaryExpression('!==', t.cloneNode(currentExpr), t.identifier('undefined')),
    t.callExpression(
      t.memberExpression(t.cloneNode(currentExpr), t.identifier('equals')),
      [t.cloneNode(nextExpr)]
    )
  );
  return t.ifStatement(
    t.logicalExpression('||', sameRef, equalsCall),
    t.returnStatement(t.thisExpression())
  );
}

function buildSetEntryOptions(prop) {
  const currentId = t.identifier(`${prop.name}Current`);
  const existingId = t.identifier('existing');
  const valueId = t.identifier('value');
  const hasKey = t.callExpression(
    t.memberExpression(currentId, t.identifier('has')),
    [t.identifier('key')]
  );
  const getExisting = t.callExpression(
    t.memberExpression(currentId, t.identifier('get')),
    [t.identifier('key')]
  );
  const equalsCall = t.callExpression(t.identifier('equals'), [existingId, valueId]);

  const prelude = [
    t.variableDeclaration('const', [
      t.variableDeclarator(currentId, t.memberExpression(t.thisExpression(), t.identifier(prop.name))),
    ]),
    t.ifStatement(
      t.logicalExpression(
        '&&',
        currentId,
        hasKey
      ),
      t.blockStatement([
        t.variableDeclaration('const', [
          t.variableDeclarator(existingId, getExisting),
        ]),
        t.ifStatement(equalsCall, t.returnStatement(t.thisExpression())),
      ])
    ),
  ];

  return { prelude, skipNoopGuard: true };
}

function buildDeleteEntryOptions(prop) {
  const currentId = t.identifier(`${prop.name}Current`);
  const hasKey = t.callExpression(
    t.memberExpression(currentId, t.identifier('has')),
    [t.identifier('key')]
  );
  const prelude = [
    t.variableDeclaration('const', [
      t.variableDeclarator(currentId, t.memberExpression(t.thisExpression(), t.identifier(prop.name))),
    ]),
    t.ifStatement(
      t.logicalExpression(
        '||',
        t.binaryExpression('===', currentId, t.identifier('undefined')),
        t.unaryExpression('!', hasKey)
      ),
      t.returnStatement(t.thisExpression())
    ),
  ];
  return { prelude, skipNoopGuard: true };
}

function buildClearMapOptions(prop) {
  const currentId = t.identifier(`${prop.name}Current`);
  const sizeAccess = t.memberExpression(currentId, t.identifier('size'));
  const prelude = [
    t.variableDeclaration('const', [
      t.variableDeclarator(currentId, t.memberExpression(t.thisExpression(), t.identifier(prop.name))),
    ]),
    t.ifStatement(
      t.logicalExpression(
        '||',
        t.binaryExpression('===', currentId, t.identifier('undefined')),
        t.binaryExpression('===', sizeAccess, t.numericLiteral(0))
      ),
      t.returnStatement(t.thisExpression())
    ),
  ];
  return { prelude, skipNoopGuard: true };
}

function cloneMapKeyType(prop) {
  if (prop.mapKeyInputType) {
    return t.cloneNode(prop.mapKeyInputType);
  }
  return prop.mapKeyType ? wrapImmutableType(t.cloneNode(prop.mapKeyType)) : t.tsAnyKeyword();
}

function cloneMapValueType(prop) {
  if (prop.mapValueInputType) {
    return t.cloneNode(prop.mapValueInputType);
  }
  return prop.mapValueType ? wrapImmutableType(t.cloneNode(prop.mapValueType)) : t.tsAnyKeyword();
}

function cloneSetElementType(prop) {
  if (prop.setElementInputType) {
    return t.cloneNode(prop.setElementInputType);
  }
  return prop.setElementType ? wrapImmutableType(t.cloneNode(prop.setElementType)) : t.tsAnyKeyword();
}

function buildMapSetParams(prop) {
  const keyId = t.identifier('key');
  keyId.typeAnnotation = t.tsTypeAnnotation(cloneMapKeyType(prop));
  const valueId = t.identifier('value');
  valueId.typeAnnotation = t.tsTypeAnnotation(cloneMapValueType(prop));
  return [keyId, valueId];
}

function buildMapDeleteParams(prop) {
  const keyId = t.identifier('key');
  keyId.typeAnnotation = t.tsTypeAnnotation(cloneMapKeyType(prop));
  return [keyId];
}

function buildMapMergeParams(prop) {
  const entriesId = t.identifier('entries');
  const keyType = cloneMapKeyType(prop);
  const valueType = cloneMapValueType(prop);
  const tupleType = t.tsTupleType([keyType, valueType]);
  const iterableType = t.tsTypeReference(
    t.identifier('Iterable'),
    t.tsTypeParameterInstantiation([tupleType])
  );
  const mapInputUnion = buildInputAcceptingMutable(
    t.tsTypeReference(
      t.identifier('ImmutableMap'),
      t.tsTypeParameterInstantiation([keyType, valueType])
    )
  );
  entriesId.typeAnnotation = t.tsTypeAnnotation(
    t.tsUnionType([
      iterableType,
      mapInputUnion,
    ])
  );
  return [entriesId];
}

function buildMapUpdateParams(prop) {
  const keyId = t.identifier('key');
  keyId.typeAnnotation = t.tsTypeAnnotation(cloneMapKeyType(prop));
  const updaterId = t.identifier('updater');
  const valueType = cloneMapValueType(prop);
  const updaterParam = t.identifier('currentValue');
  updaterParam.typeAnnotation = t.tsTypeAnnotation(
    t.tsUnionType([t.cloneNode(valueType), t.tsUndefinedKeyword()])
  );
  updaterId.typeAnnotation = t.tsTypeAnnotation(
    t.tsFunctionType(
      null,
      [updaterParam],
      t.tsTypeAnnotation(t.cloneNode(valueType))
    )
  );
  return [keyId, updaterId];
}

function buildSetAddParams(prop) {
  const valueId = t.identifier('value');
  valueId.typeAnnotation = t.tsTypeAnnotation(cloneSetElementType(prop));
  return [valueId];
}

function buildSetAddAllParams(prop) {
  const valuesId = t.identifier('values');
  valuesId.typeAnnotation = t.tsTypeAnnotation(
    t.tsTypeReference(
      t.identifier('Iterable'),
      t.tsTypeParameterInstantiation([cloneSetElementType(prop)])
    )
  );
  return [valuesId];
}

function buildSetDeleteParams(prop) {
  const valueId = t.identifier('value');
  valueId.typeAnnotation = t.tsTypeAnnotation(cloneSetElementType(prop));
  return [valueId];
}

function buildSetDeleteAllParams(prop) {
  const valuesId = t.identifier('values');
  valuesId.typeAnnotation = t.tsTypeAnnotation(
    t.tsTypeReference(
      t.identifier('Iterable'),
      t.tsTypeParameterInstantiation([cloneSetElementType(prop)])
    )
  );
  return [valuesId];
}

function buildSetFilterParams(unused_prop) {
  const predicateId = t.identifier('predicate');
  const valueId = t.identifier('value');
  predicateId.typeAnnotation = t.tsTypeAnnotation(
    t.tsFunctionType(
      null,
      [t.identifier(valueId.name)],
      t.tsTypeAnnotation(t.tsTypeReference(t.identifier('boolean')))
    )
  );
  return [predicateId];
}

function buildSetMapParams(prop) {
  const mapperId = t.identifier('mapper');
  const valueId = t.identifier('value');
  mapperId.typeAnnotation = t.tsTypeAnnotation(
    t.tsFunctionType(
      null,
      [t.identifier(valueId.name)],
      t.tsTypeAnnotation(t.cloneNode(prop.setElementType))
    )
  );
  return [mapperId];
}

function buildSetUpdateParams(prop) {
  const updaterId = t.identifier('updater');
  const currentId = t.identifier('current');
  currentId.typeAnnotation = t.tsTypeAnnotation(
    t.tsTypeReference(
      t.identifier('ImmutableSet'),
      t.tsTypeParameterInstantiation([cloneSetElementType(prop)])
    )
  );
  updaterId.typeAnnotation = t.tsTypeAnnotation(
    t.tsFunctionType(
      null,
      [currentId],
      t.tsTypeAnnotation(
        t.tsTypeReference(
          t.identifier('Iterable'),
          t.tsTypeParameterInstantiation([cloneSetElementType(prop)])
        )
      )
    )
  );
  return [updaterId];
}

function buildMapMapperParams(prop) {
  const mapperId = t.identifier('mapper');
  const valueType = cloneMapValueType(prop);
  const keyType = cloneMapKeyType(prop);
  const valueParam = t.identifier('value');
  valueParam.typeAnnotation = t.tsTypeAnnotation(t.cloneNode(valueType));
  const keyParam = t.identifier('key');
  keyParam.typeAnnotation = t.tsTypeAnnotation(t.cloneNode(keyType));
  mapperId.typeAnnotation = t.tsTypeAnnotation(
    t.tsFunctionType(
      null,
      [valueParam, keyParam],
      t.tsTypeAnnotation(
        t.tsTupleType([t.cloneNode(keyType), t.cloneNode(valueType)])
      )
    )
  );
  return [mapperId];
}

function buildMapPredicateParams(prop) {
  const predicateId = t.identifier('predicate');
  const valueType = cloneMapValueType(prop);
  const keyType = cloneMapKeyType(prop);
  const valueParam = t.identifier('value');
  valueParam.typeAnnotation = t.tsTypeAnnotation(t.cloneNode(valueType));
  const keyParam = t.identifier('key');
  keyParam.typeAnnotation = t.tsTypeAnnotation(t.cloneNode(keyType));
  predicateId.typeAnnotation = t.tsTypeAnnotation(
    t.tsFunctionType(
      null,
      [valueParam, keyParam],
      t.tsTypeAnnotation(t.tsBooleanKeyword())
    )
  );
  return [predicateId];
}

function buildRuntimeTypeCheckExpression(typeNode, valueId) {
  if (!typeNode) {
    return null;
  }

  if (t.isTSParenthesizedType(typeNode)) {
    return buildRuntimeTypeCheckExpression(
      typeNode.typeAnnotation,
      valueId
    );
  }

  if (t.isTSStringKeyword(typeNode)) {
    return typeofCheck(valueId, 'string');
  }

  if (t.isTSNumberKeyword(typeNode)) {
    return typeofCheck(valueId, 'number');
  }

  if (t.isTSBooleanKeyword(typeNode)) {
    return typeofCheck(valueId, 'boolean');
  }

  if (t.isTSBigIntKeyword(typeNode)) {
    return typeofCheck(valueId, 'bigint');
  }

  if (t.isTSNullKeyword(typeNode)) {
    return t.binaryExpression('===', valueId, t.nullLiteral());
  }

  if (t.isTSUndefinedKeyword(typeNode)) {
    return t.binaryExpression('===', valueId, t.identifier('undefined'));
  }

  if (t.isTSLiteralType(typeNode)) {
    return buildLiteralTypeCheck(typeNode, valueId);
  }

  if (t.isTSUnionType(typeNode)) {
    const checks = typeNode.types
      .map((subType) => buildRuntimeTypeCheckExpression(subType, valueId))
      .filter(Boolean);

    if (!checks.length) {
      return null;
    }

    return checks.reduce((acc, expr) =>
      acc ? t.logicalExpression('||', acc, expr) : expr
    );
  }

  if (t.isTSArrayType(typeNode)) {
    return buildArrayTypeCheckExpression(typeNode, valueId);
  }

  if (t.isTSTypeReference(typeNode)) {
    if (isDateReference(typeNode) || isImmutableDateReference(typeNode)) {
      return buildDateCheckExpression(valueId);
    }

    if (isUrlReference(typeNode) || isImmutableUrlReference(typeNode)) {
      return buildUrlCheckExpression(valueId);
    }

    if (isArrayBufferReference(typeNode) || isImmutableArrayBufferReference(typeNode)) {
      return buildArrayBufferCheckExpression(valueId);
    }

    if (isBrandReference(typeNode)) {
      return typeofCheck(valueId, 'string');
    }

    if (isMapReference(typeNode)) {
      return buildMapTypeCheckExpression(typeNode, valueId);
    }

    if (isSetReference(typeNode)) {
      return buildSetTypeCheckExpression(typeNode, valueId);
    }

    if (
      t.isIdentifier(typeNode.typeName)
      && (
        typeNode.typeName.name === 'Array'
        || typeNode.typeName.name === 'ReadonlyArray'
        || typeNode.typeName.name === 'ImmutableArray'
      )
    ) {
      const elementParam = typeNode.typeParameters?.params?.[0];
      const syntheticArray = t.tsArrayType(
        wrapImmutableType(elementParam ? t.cloneNode(elementParam) : t.tsAnyKeyword())
      );
      return buildArrayTypeCheckExpression(syntheticArray, valueId);
    }

    return null;
  }

  if (t.isTSTypeLiteral(typeNode)) {
    return buildTypeLiteralCheckExpression(typeNode, valueId);
  }

  return null;
}

function typeofCheck(valueId, type) {
  return t.binaryExpression(
    '===',
    t.unaryExpression('typeof', valueId),
    t.stringLiteral(type)
  );
}

function buildDateCheckExpression(valueId) {
  const instanceOfDate = t.binaryExpression(
    'instanceof',
    valueId,
    t.identifier('Date')
  );
  const instanceOfImmutableDate = t.binaryExpression(
    'instanceof',
    valueId,
    t.identifier('ImmutableDate')
  );

  const objectToStringCall = t.callExpression(
    t.memberExpression(
      t.memberExpression(
        t.memberExpression(t.identifier('Object'), t.identifier('prototype')),
        t.identifier('toString')
      ),
      t.identifier('call')
    ),
    [valueId]
  );

  const tagEqualsDate = t.binaryExpression(
    '===',
    objectToStringCall,
    t.stringLiteral('[object Date]')
  );

  const tagEqualsImmutableDate = t.binaryExpression(
    '===',
    objectToStringCall,
    t.stringLiteral('[object ImmutableDate]')
  );

  return t.logicalExpression(
    '||',
    t.logicalExpression('||', instanceOfDate, instanceOfImmutableDate),
    t.logicalExpression('||', tagEqualsDate, tagEqualsImmutableDate)
  );
}

function buildUrlCheckExpression(valueId) {
  const instanceOfUrl = t.binaryExpression(
    'instanceof',
    valueId,
    t.identifier('URL')
  );
  const instanceOfImmutableUrl = t.binaryExpression(
    'instanceof',
    valueId,
    t.identifier('ImmutableUrl')
  );

  const objectToStringCall = t.callExpression(
    t.memberExpression(
      t.memberExpression(
        t.memberExpression(t.identifier('Object'), t.identifier('prototype')),
        t.identifier('toString')
      ),
      t.identifier('call')
    ),
    [valueId]
  );

  const tagEqualsUrl = t.binaryExpression(
    '===',
    objectToStringCall,
    t.stringLiteral('[object URL]')
  );

  const tagEqualsImmutableUrl = t.binaryExpression(
    '===',
    objectToStringCall,
    t.stringLiteral('[object ImmutableUrl]')
  );

  return t.logicalExpression(
    '||',
    t.logicalExpression('||', instanceOfUrl, instanceOfImmutableUrl),
    t.logicalExpression('||', tagEqualsUrl, tagEqualsImmutableUrl)
  );
}

function buildArrayBufferCheckExpression(valueId) {
  const instanceOfArrayBuffer = t.binaryExpression(
    'instanceof',
    valueId,
    t.identifier('ArrayBuffer')
  );
  const instanceOfImmutableArrayBuffer = t.binaryExpression(
    'instanceof',
    valueId,
    t.identifier('ImmutableArrayBuffer')
  );

  const tagEqualsArrayBuffer = t.binaryExpression(
    '===',
    buildObjectToStringCall(valueId),
    t.stringLiteral('[object ArrayBuffer]')
  );
  const tagEqualsImmutableArrayBuffer = t.binaryExpression(
    '===',
    buildObjectToStringCall(valueId),
    t.stringLiteral('[object ImmutableArrayBuffer]')
  );

  return t.logicalExpression(
    '||',
    t.logicalExpression('||', instanceOfArrayBuffer, instanceOfImmutableArrayBuffer),
    t.logicalExpression('||', tagEqualsArrayBuffer, tagEqualsImmutableArrayBuffer)
  );
}

function buildLiteralTypeCheck(typeNode, valueId) {
  const literal = typeNode.literal;

  if (t.isStringLiteral(literal)) {
    return t.binaryExpression('===', valueId, t.stringLiteral(literal.value));
  }

  if (t.isNumericLiteral(literal)) {
    return t.binaryExpression('===', valueId, t.numericLiteral(literal.value));
  }

  if (t.isBooleanLiteral(literal)) {
    return t.binaryExpression('===', valueId, t.booleanLiteral(literal.value));
  }

  if (t.isBigIntLiteral(literal)) {
    return t.binaryExpression(
      '===',
      valueId,
      t.bigIntLiteral(literal.value)
    );
  }

  return null;
}

function buildMapTypeCheckExpression(typeNode, valueId) {
  const immutableInstanceCheck = t.binaryExpression(
    'instanceof',
    valueId,
    t.identifier('ImmutableMap')
  );
  const immutableTagCheck = buildMapTagComparison(
    valueId,
    '[object ImmutableMap]'
  );
  const immutableCheck = t.logicalExpression(
    '||',
    immutableInstanceCheck,
    immutableTagCheck
  );
  const mapInstanceCheck = t.binaryExpression(
    'instanceof',
    valueId,
    t.identifier('Map')
  );
  const mapTagCheck = buildMapTagComparison(valueId, '[object Map]');
  const mapCheck = t.logicalExpression('||', mapInstanceCheck, mapTagCheck);
  const baseCheck = t.logicalExpression('||', immutableCheck, mapCheck);

  const mapArgs = getMapTypeArguments(typeNode);

  if (!mapArgs) {
    return baseCheck;
  }

  const keyId = t.identifier('mapKey');
  const valueElementId = t.identifier('mapValue');

  const keyCheck = buildRuntimeTypeCheckExpression(mapArgs.keyType, keyId);
  const valueCheck = buildRuntimeTypeCheckExpression(
    mapArgs.valueType,
    valueElementId
  );

  let predicate = null;

  if (keyCheck) {
    predicate = keyCheck;
  }

  if (valueCheck) {
    predicate = predicate
      ? t.logicalExpression('&&', predicate, valueCheck)
      : valueCheck;
  }

  if (!predicate) {
    return baseCheck;
  }

  const entriesArray = t.arrayExpression([
    t.spreadElement(
      t.callExpression(
        t.memberExpression(valueId, t.identifier('entries')),
        []
      )
    ),
  ]);

  const everyCall = t.callExpression(
    t.memberExpression(entriesArray, t.identifier('every')),
    [
      t.arrowFunctionExpression(
        [t.arrayPattern([keyId, valueElementId])],
        predicate
      ),
    ]
  );

  return t.logicalExpression('&&', baseCheck, everyCall);
}

function buildSetTypeCheckExpression(typeNode, valueId) {
  const immutableInstanceCheck = t.binaryExpression(
    'instanceof',
    valueId,
    t.identifier('ImmutableSet')
  );
  const immutableTagCheck = buildSetTagComparison(
    valueId,
    '[object ImmutableSet]'
  );
  const immutableCheck = t.logicalExpression(
    '||',
    immutableInstanceCheck,
    immutableTagCheck
  );
  const setInstanceCheck = t.binaryExpression(
    'instanceof',
    valueId,
    t.identifier('Set')
  );
  const setTagCheck = buildSetTagComparison(valueId, '[object Set]');
  const setCheck = t.logicalExpression('||', setInstanceCheck, setTagCheck);
  const baseCheck = t.logicalExpression('||', immutableCheck, setCheck);

  const elementType = getSetTypeArguments(typeNode);
  if (!elementType) {
    return baseCheck;
  }

  const elementId = t.identifier('setValue');
  const elementCheck = buildRuntimeTypeCheckExpression(elementType, elementId);
  if (!elementCheck || t.isBooleanLiteral(elementCheck, { value: true })) {
    return baseCheck;
  }

  const valuesArray = t.arrayExpression([t.spreadElement(valueId)]);

  return t.logicalExpression(
    '&&',
    baseCheck,
    t.callExpression(
      t.memberExpression(valuesArray, t.identifier('every')),
      [t.arrowFunctionExpression([elementId], elementCheck)]
    )
  );
}

function buildArrayTypeCheckExpression(typeNode, valueId) {
  const immutableInstanceCheck = t.binaryExpression(
    'instanceof',
    valueId,
    t.identifier('ImmutableArray')
  );
  const immutableTagCheck = buildSetTagComparison(
    valueId,
    '[object ImmutableArray]'
  );
  const arrayInstanceCheck = t.callExpression(
    t.memberExpression(t.identifier('Array'), t.identifier('isArray')),
    [valueId]
  );
  const baseCheck = t.logicalExpression(
    '||',
    immutableInstanceCheck,
    t.logicalExpression('||', immutableTagCheck, arrayInstanceCheck)
  );

  const elementId = t.identifier('element');
  const elementCheck = buildRuntimeTypeCheckExpression(
    getArrayElementType(typeNode),
    elementId
  );

  if (!elementCheck || t.isBooleanLiteral(elementCheck, { value: true })) {
    return baseCheck;
  }

  return t.logicalExpression(
    '&&',
    baseCheck,
    t.callExpression(
      t.memberExpression(
        t.arrayExpression([t.spreadElement(valueId)]),
        t.identifier('every')
      ),
      [t.arrowFunctionExpression([elementId], elementCheck)]
    )
  );
}

function typeAllowsNull(typeNode) {
  if (!typeNode) {
    return false;
  }

  if (t.isTSParenthesizedType(typeNode)) {
    return typeAllowsNull(typeNode.typeAnnotation);
  }

  if (t.isTSNullKeyword(typeNode)) {
    return true;
  }

  if (t.isTSUnionType(typeNode)) {
    return typeNode.types.some((subType) => typeAllowsNull(subType));
  }

  return false;
}

function buildNonNullObjectCheck(valueId) {
  return t.logicalExpression(
    '&&',
    typeofCheck(valueId, 'object'),
    t.binaryExpression('!==', valueId, t.nullLiteral())
  );
}

function buildTypeLiteralCheckExpression(typeLiteral, valueId) {
  const baseCheck = buildNonNullObjectCheck(valueId);

  const propertyChecks = typeLiteral.members.map((member) => {
    if (
      !t.isTSPropertySignature(member)
      || !member.typeAnnotation
      || !t.isTSType(member.typeAnnotation.typeAnnotation)
    ) {
      return null;
    }

    if (!t.isIdentifier(member.key)) {
      return null;
    }

    const propertyValue = t.memberExpression(
      valueId,
      t.identifier(member.key.name)
    );

    const typeCheck = buildRuntimeTypeCheckExpression(
      member.typeAnnotation.typeAnnotation,
      propertyValue
    );

    if (member.optional) {
      if (!typeCheck) {
        return null;
      }

      return t.logicalExpression(
        '||',
        t.binaryExpression(
          '===',
          propertyValue,
          t.identifier('undefined')
        ),
        typeCheck
      );
    }

    const definedCheck = t.binaryExpression(
      '!==',
      propertyValue,
      t.identifier('undefined')
    );

    if (!typeCheck) {
      return definedCheck;
    }

    return t.logicalExpression('&&', definedCheck, typeCheck);
  }).filter(Boolean);

  if (!propertyChecks.length) {
    return baseCheck;
  }

  const combinedChecks = propertyChecks.reduce((acc, expr) =>
    t.logicalExpression('&&', acc, expr)
  );

  return t.logicalExpression('&&', baseCheck, combinedChecks);
}

function buildErrorThrow(message) {
  return t.throwStatement(
    t.newExpression(t.identifier('Error'), [t.stringLiteral(message)])
  );
}


function buildImmutableArrayOfMessagesExpression(valueExpr, messageTypeName) {
  const nilCheck = t.logicalExpression('||',
    t.binaryExpression('===', t.cloneNode(valueExpr), t.identifier('undefined')),
    t.binaryExpression('===', t.cloneNode(valueExpr), t.nullLiteral())
  );

  const arrayFrom = t.callExpression(t.memberExpression(t.identifier('Array'), t.identifier('from')), [t.cloneNode(valueExpr)]);
  const mapCall = t.callExpression(
    t.memberExpression(arrayFrom, t.identifier('map')),
    [
      t.arrowFunctionExpression(
        [t.identifier('v')],
        t.conditionalExpression(
          t.binaryExpression('instanceof', t.identifier('v'), t.identifier(messageTypeName)),
          t.identifier('v'),
          t.newExpression(t.identifier(messageTypeName), [t.identifier('v')])
        )
      )
    ]
  );

  const newImmutable = t.newExpression(t.identifier('ImmutableArray'), [mapCall]);

  return t.conditionalExpression(nilCheck, t.cloneNode(valueExpr), newImmutable);
}

function buildImmutableSetOfMessagesExpression(valueExpr, messageTypeName) {
  const nilCheck = t.logicalExpression('||',
    t.binaryExpression('===', t.cloneNode(valueExpr), t.identifier('undefined')),
    t.binaryExpression('===', t.cloneNode(valueExpr), t.nullLiteral())
  );

  const arrayFrom = t.callExpression(t.memberExpression(t.identifier('Array'), t.identifier('from')), [t.cloneNode(valueExpr)]);
  const mapCall = t.callExpression(
    t.memberExpression(arrayFrom, t.identifier('map')),
    [
      t.arrowFunctionExpression(
        [t.identifier('v')],
        t.conditionalExpression(
          t.binaryExpression('instanceof', t.identifier('v'), t.identifier(messageTypeName)),
          t.identifier('v'),
          t.newExpression(t.identifier(messageTypeName), [t.identifier('v')])
        )
      )
    ]
  );

  const newImmutable = t.newExpression(t.identifier('ImmutableSet'), [mapCall]);

  return t.conditionalExpression(nilCheck, t.cloneNode(valueExpr), newImmutable);
}

function buildImmutableMapOfMessagesExpression(valueExpr, messageTypeName) {
  const nilCheck = t.logicalExpression('||',
    t.binaryExpression('===', t.cloneNode(valueExpr), t.identifier('undefined')),
    t.binaryExpression('===', t.cloneNode(valueExpr), t.nullLiteral())
  );

  const arrayFrom = t.callExpression(t.memberExpression(t.identifier('Array'), t.identifier('from')), [t.cloneNode(valueExpr)]);
  const mapCall = t.callExpression(
    t.memberExpression(arrayFrom, t.identifier('map')),
    [
      t.arrowFunctionExpression(
        [t.arrayPattern([t.identifier('k'), t.identifier('v')])],
        t.arrayExpression([
          t.identifier('k'),
          t.conditionalExpression(
            t.binaryExpression('instanceof', t.identifier('v'), t.identifier(messageTypeName)),
            t.identifier('v'),
            t.newExpression(t.identifier(messageTypeName), [t.identifier('v')])
          )
        ])
      )
    ]
  );

  const newImmutable = t.newExpression(t.identifier('ImmutableMap'), [mapCall]);

  return t.conditionalExpression(nilCheck, t.cloneNode(valueExpr), newImmutable);
}

function handleImplicitTypes(propTypePath, propName, generatedTypes, parentName, declaredTypeNames, declaredMessageTypeNames) {
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
          propTypePath.node.typeName,
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
        propTypePath.node.typeName,
        t.tsTypeParameterInstantiation([newRef])
      ));
    }
    return;
  }

  if (isMapTypeNode(propTypePath.node)) {
    const { keyType, valueType } = getMapTypeArguments(propTypePath.node);
    if (t.isTSTypeLiteral(valueType)) {
      const newItemName = `${parentName}_${capitalize(propName)}_Value`;
      const newTypeAlias = t.tsTypeAliasDeclaration(
        t.identifier(newItemName),
        null,
        t.cloneNode(valueType)
      );
      generatedTypes.push(newTypeAlias);
      declaredTypeNames.add(newItemName);
      declaredMessageTypeNames.add(newItemName);

      const newRef = t.tsTypeReference(t.identifier(newItemName));
      propTypePath.replaceWith(t.tsTypeReference(
        propTypePath.node.typeName,
        t.tsTypeParameterInstantiation([t.cloneNode(keyType), newRef])
      ));
    }
    return;
  }
}

function assertSupportedTopLevelType(typePath) {
  if (isPrimitiveLikeType(typePath)) {
    return;
  }

  throw typePath.buildCodeFrameError(
    'Propane files must export an object type or a primitive-like alias (string, number, boolean, bigint, null, undefined, Date, URL, ArrayBuffer, Brand).'
  );
}

function assertSupportedType(typePath, declaredTypeNames) {
  if (!typePath || !typePath.node) {
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
    if (isDateReference(typePath.node) || isImmutableDateReference(typePath.node)) {
      return;
    }

    if (isUrlReference(typePath.node) || isImmutableUrlReference(typePath.node)) {
      return;
    }

    if (isBrandReference(typePath.node)) {
      return;
    }

    if (isArrayBufferReference(typePath.node) || isImmutableArrayBufferReference(typePath.node)) {
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
      'Propane property references must refer to imported or locally declared identifiers.'
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
          'Propane nested object types can only contain property signatures.'
        );
      }

      const keyPath = memberPath.get('key');
      if (!keyPath.isIdentifier() || memberPath.node.computed) {
        throw memberPath.buildCodeFrameError(
          'Propane nested object properties must use simple identifier names.'
        );
      }

      const nestedTypeAnnotation = memberPath.get('typeAnnotation');
      if (!nestedTypeAnnotation || !nestedTypeAnnotation.node) {
        throw memberPath.buildCodeFrameError(
          'Propane nested object properties must include type annotations.'
        );
      }

      assertSupportedType(nestedTypeAnnotation.get('typeAnnotation'), declaredTypeNames);
    }
    return;
  }

  throw typePath.buildCodeFrameError(
    'Unsupported type in propane file. Only primitives, identifiers, Date, Brand, or object literals are allowed.'
  );
}

function isAllowedTypeReference(typePath, declaredTypeNames) {
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

function registerTypeAlias(typeAlias, declaredTypeNames) {
  if (t.isIdentifier(typeAlias.id)) {
    declaredTypeNames.add(typeAlias.id.name);
  }
}
