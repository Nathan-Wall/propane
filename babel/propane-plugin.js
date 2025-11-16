import fs from 'fs';
import path from 'path';
import { parse } from '@babel/parser';
import * as t from '@babel/types';

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

        registerTypeAlias(declarationPath.node);

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

        registerTypeAlias(path.node);

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

    const properties = extractProperties(typeLiteralPath.get('members'));
    if (properties.some((prop) => prop.isMap)) {
      state.usesImmutableMap = true;
    }
    declaredMessageTypeNames.add(typeAlias.id.name);

    const typeNamespace = buildTypeNamespace(typeAlias, properties, exported);
    const classDecl = buildClassFromProperties(typeAlias.id.name, properties);

    state.usesPropaneBase = true;

    if (exported) {
      const classExport = t.exportNamedDeclaration(classDecl, []);
      return [typeNamespace, classExport];
    }

    return [typeNamespace, classDecl];
  }

  function extractProperties(memberPaths) {
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

      assertSupportedType(propTypePath);

      const mapType = isMapTypeNode(propTypePath.node);
      const mapArgs = mapType ? getMapTypeArguments(propTypePath.node) : null;
      const arrayType = isArrayTypeNode(propTypePath.node);
      const messageTypeName = getMessageReferenceName(propTypePath);
      const runtimeType = mapType
        ? wrapReadonlyMapType(t.cloneNode(propTypePath.node))
        : t.cloneNode(propTypePath.node);

      let inputTypeAnnotation = runtimeType;

      if (messageTypeName) {
        inputTypeAnnotation = t.tsTypeReference(
          t.tsQualifiedName(
            t.identifier(messageTypeName),
            t.identifier('Value')
          )
        );
      }

      props.push({
        name,
        fieldNumber,
        optional: Boolean(memberPath.node.optional),
        readonly: Boolean(memberPath.node.readonly),
        isArray: arrayType,
        isMap: mapType,
        isMessageType: Boolean(messageTypeName),
        messageTypeName,
        typeAnnotation: runtimeType,
        inputTypeAnnotation,
        arrayElementType: arrayType
          ? getArrayElementType(propTypePath.node)
          : null,
        mapKeyType: mapArgs ? mapArgs.keyType : null,
        mapValueType: mapArgs ? mapArgs.valueType : null,
      });
    }

    return props;
  }

  function assertSupportedTopLevelType(typePath) {
    if (isPrimitiveLikeType(typePath)) {
      return;
    }

    throw typePath.buildCodeFrameError(
      'Propane files must export an object type or a primitive-like alias (string, number, boolean, bigint, null, undefined, Date, Brand).'
    );
  }

  function isPrimitiveLikeType(typePath) {
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
      return isDateReference(typePath.node) || isBrandReference(typePath.node);
    }

    return false;
  }

  function assertSupportedType(typePath) {
    if (!typePath || !typePath.node) {
      throw new Error('Missing type information for propane property.');
    }

    if (isPrimitiveKeyword(typePath) || isPrimitiveLiteral(typePath)) {
      return;
    }

    if (typePath.isTSUnionType()) {
      for (const memberPath of typePath.get('types')) {
        assertSupportedType(memberPath);
      }
      return;
    }

    if (typePath.isTSArrayType()) {
      assertSupportedType(typePath.get('elementType'));
      return;
    }

    if (typePath.isTSTypeReference()) {
      if (isDateReference(typePath.node)) {
        return;
      }

      if (isBrandReference(typePath.node)) {
        return;
      }

      if (isMapReference(typePath.node)) {
        assertSupportedMapType(typePath);
        return;
      }

      if (isAllowedTypeReference(typePath)) {
        return;
      }

      throw typePath.buildCodeFrameError(
        'Propane property references must refer to imported or locally declared identifiers.'
      );
    }

    if (typePath.isTSParenthesizedType()) {
      assertSupportedType(typePath.get('typeAnnotation'));
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

        assertSupportedType(nestedTypeAnnotation.get('typeAnnotation'));
      }
      return;
    }

    throw typePath.buildCodeFrameError(
      'Unsupported type in propane file. Only primitives, identifiers, Date, Brand, or object literals are allowed.'
    );
  }

  function isDateReference(node) {
    return t.isIdentifier(node.typeName) && node.typeName.name === 'Date';
  }

  function isMapReference(node) {
    return (
      t.isIdentifier(node.typeName) &&
      (node.typeName.name === 'Map' || node.typeName.name === 'ReadonlyMap')
    );
  }

  function isBrandReference(node) {
    if (!t.isIdentifier(node.typeName) || node.typeName.name !== 'Brand') {
      return false;
    }

    if (!node.typeParameters || node.typeParameters.params.length === 0) {
      return false;
    }

    const [first] = node.typeParameters.params;
    return t.isTSStringKeyword(first);
  }

  function assertSupportedMapType(typePath) {
    const typeParametersPath = typePath.get('typeParameters');
    if (
      !typeParametersPath ||
      !typeParametersPath.node ||
      typeParametersPath.node.params.length !== 2
    ) {
      throw typePath.buildCodeFrameError(
        'Propane Map types must specify both key and value types.'
      );
    }

    const [keyTypePath, valueTypePath] = typeParametersPath.get('params');
    assertSupportedMapKeyType(keyTypePath);
    assertSupportedType(valueTypePath);
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

    if (typePath.isTSTypeReference()) {
      if (isMapReference(typePath.node)) {
        throw typePath.buildCodeFrameError(
          'Propane map keys cannot be maps.'
        );
      }

      if (isDateReference(typePath.node)) {
        throw typePath.buildCodeFrameError(
          'Propane map keys cannot be Date objects.'
        );
      }
    }

    assertSupportedType(typePath);
  }

  function isPrimitiveKeyword(typePath) {
    if (
      !typePath ||
      typeof typePath.isTSStringKeyword !== 'function'
    ) {
      return false;
    }

    return (
      typePath.isTSStringKeyword() ||
      typePath.isTSNumberKeyword() ||
      typePath.isTSBooleanKeyword() ||
      typePath.isTSBigIntKeyword() ||
      typePath.isTSNullKeyword() ||
      typePath.isTSUndefinedKeyword()
    );
  }

  function isPrimitiveLiteral(typePath) {
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
      literal.type === 'StringLiteral' ||
      literal.type === 'NumericLiteral' ||
      literal.type === 'BooleanLiteral' ||
      literal.type === 'BigIntLiteral'
    );
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

  function isAllowedTypeReference(typePath) {
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

  function resolveQualifiedRoot(qualifiedName) {
    if (t.isIdentifier(qualifiedName.left)) {
      return qualifiedName.left;
    }

    if (t.isTSQualifiedName(qualifiedName.left)) {
      return resolveQualifiedRoot(qualifiedName.left);
    }

    return null;
  }

  function registerTypeAlias(typeAlias) {
    if (t.isIdentifier(typeAlias.id)) {
      declaredTypeNames.add(typeAlias.id.name);
    }
  }

  function buildTypeNamespace(typeAlias, properties, exported) {
    const namespaceId = t.identifier(typeAlias.id.name);
    const typeId = t.identifier('Data');

    const literalMembers = properties.map((prop) => {
      const key = t.identifier(prop.name);
      const propSignature = t.tsPropertySignature(
        key,
        t.tsTypeAnnotation(t.cloneNode(prop.inputTypeAnnotation))
      );
      propSignature.optional = prop.optional;
      propSignature.readonly = prop.readonly;
      return propSignature;
    });

    const literalClone = t.tsTypeLiteral(literalMembers);

    const typeDecl = t.tsTypeAliasDeclaration(
      typeId,
      typeAlias.typeParameters ? t.cloneNode(typeAlias.typeParameters) : null,
      literalClone
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

    const moduleBlock = t.tsModuleBlock([exportedTypeDecl, exportedUnionDecl]);
    const namespaceDecl = t.tsModuleDeclaration(namespaceId, moduleBlock);
    namespaceDecl.declare = typeAlias.declare;
    namespaceDecl.kind = 'namespace';

    if (exported) {
      return t.exportNamedDeclaration(namespaceDecl, []);
    }

    return namespaceDecl;
  }

  function buildClassFromProperties(typeName, properties) {
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
      let baseType = t.cloneNode(prop.typeAnnotation);
      if (prop.isArray) {
        baseType = wrapReadonlyArrayType(baseType);
      }
      if (prop.isMap) {
        baseType = wrapReadonlyMapType(baseType);
      }

      const needsOptionalUnion = prop.optional && (prop.isArray || prop.isMap);
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

    const constructorParam = t.identifier('props');
    constructorParam.typeAnnotation = t.tsTypeAnnotation(
      t.cloneNode(valueTypeRef)
    );

    const constructorAssignments = propDescriptors.map((prop) => {
      const propsAccess = t.memberExpression(
        t.identifier('props'),
        t.identifier(prop.name)
      );

      let valueExpr = t.cloneNode(propsAccess);

      if (prop.isArray) {
        valueExpr = t.conditionalExpression(
          t.callExpression(
            t.memberExpression(t.identifier('Array'), t.identifier('isArray')),
            [t.cloneNode(propsAccess)]
          ),
          t.callExpression(
            t.memberExpression(t.identifier('Object'), t.identifier('freeze')),
            [
              t.arrayExpression([
                t.spreadElement(t.cloneNode(propsAccess)),
              ]),
            ]
          ),
          t.cloneNode(propsAccess)
        );
      } else if (prop.isMap) {
        valueExpr = buildImmutableMapExpression(propsAccess);
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

      return t.expressionStatement(
        t.assignmentExpression(
          '=',
          t.memberExpression(
            t.thisExpression(),
            t.cloneNode(prop.privateName)
          ),
          valueExpr
        )
      );
    });

    const constructorBody = [
      t.expressionStatement(t.callExpression(t.super(), [])),
      ...constructorAssignments,
    ];

    const constructor = t.classMethod(
      'constructor',
      t.identifier('constructor'),
      [constructorParam],
      t.blockStatement(constructorBody)
    );

    const fromEntriesMethod = buildFromEntriesMethod(propDescriptors, propsTypeRef);

    const descriptorMethod = buildDescriptorMethod(propDescriptors, propsTypeRef);

    const setterMethods = propDescriptors.map((prop) =>
      buildSetterMethod(typeName, propDescriptors, prop)
    );
    const arrayMethods = buildArrayMutatorMethods(
      typeName,
      propDescriptors
    );
    const mapMethods = buildMapMutatorMethods(
      typeName,
      propDescriptors
    );

    const classBody = t.classBody([
      ...backingFields,
      constructor,
      ...getters,
      ...setterMethods,
      ...arrayMethods,
      ...mapMethods,
      descriptorMethod,
      fromEntriesMethod,
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
    const existingImport = program.body.find(
      (stmt) =>
        t.isImportDeclaration(stmt) &&
        stmt.source.value === MESSAGE_SOURCE
    );
    const requiredSpecifiers = ['Message', 'MessagePropDescriptor'];
    if (state.usesImmutableMap) {
      requiredSpecifiers.push('ImmutableMap');
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

  function pathTransform(filename) {
    const relative = path.relative(process.cwd(), filename);
    const normalized = relative && !relative.startsWith('..')
      ? relative
      : filename;
    return normalized.split(path.sep).join('/');
  }

  function wrapReadonlyArrayType(node) {
    if (t.isTSArrayType(node)) {
      return t.tsTypeOperator(
        t.tsArrayType(
          wrapReadonlyArrayType(t.cloneNode(node.elementType))
        ),
        'readonly'
      );
    }

    return node;
  }

  function wrapReadonlyMapType(node) {
    if (t.isTSParenthesizedType(node)) {
      return t.tsParenthesizedType(
        wrapReadonlyMapType(t.cloneNode(node.typeAnnotation))
      );
    }

    if (
      t.isTSTypeReference(node) &&
      t.isIdentifier(node.typeName) &&
      node.typeName.name === 'Map'
    ) {
      return t.tsTypeReference(
        t.identifier('ReadonlyMap'),
        node.typeParameters ? t.cloneNode(node.typeParameters) : null
      );
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
    const arrayCheck = t.callExpression(
      t.memberExpression(t.identifier('Array'), t.identifier('isArray')),
      [t.cloneNode(valueExpr)]
    );

    const immutableInstanceCheck = t.binaryExpression(
      'instanceof',
      t.cloneNode(valueExpr),
      t.identifier('ImmutableMap')
    );
    const immutableTagCheck = buildMapTagComparison(
      valueExpr,
      '[object ImmutableMap]'
    );
    const immutableCheck = t.logicalExpression(
      '||',
      immutableInstanceCheck,
      immutableTagCheck
    );

    const mapInstanceCheck = t.binaryExpression(
      'instanceof',
      t.cloneNode(valueExpr),
      t.identifier('Map')
    );
    const mapTagCheck = buildMapTagComparison(
      valueExpr,
      '[object Map]'
    );
    const mapCheck = t.logicalExpression('||', mapInstanceCheck, mapTagCheck);

    const buildNewImmutableMap = () =>
      t.newExpression(t.identifier('ImmutableMap'), [t.cloneNode(valueExpr)]);

    return t.conditionalExpression(
      arrayCheck,
      buildNewImmutableMap(),
      t.conditionalExpression(
        immutableCheck,
        t.cloneNode(valueExpr),
        t.conditionalExpression(
          mapCheck,
          buildNewImmutableMap(),
          t.cloneNode(valueExpr)
        )
      )
    );
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

  function buildPropsObjectExpression(propDescriptors, targetProp, valueExpr) {
    return t.objectExpression(
      propDescriptors.map((prop) =>
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
      t.cloneNode(targetProp.inputTypeAnnotation)
    );

    const setterValueExpr = targetProp.isMessageType && targetProp.messageTypeName
      ? buildMessageNormalizationExpression(
          valueId,
          targetProp.messageTypeName,
          {
            allowUndefined: Boolean(targetProp.optional),
            allowNull: typeAllowsNull(targetProp.typeAnnotation),
          }
        )
      : t.cloneNode(valueId);

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
          (nextRef) => [
            t.expressionStatement(
              t.callExpression(
                t.memberExpression(nextRef(), t.identifier('push')),
                [t.spreadElement(t.identifier('values'))]
              )
            ),
          ]
        )
      );

      methods.push(
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
      );

      methods.push(
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
      );

      methods.push(
        buildArrayMutationMethod(
          typeName,
          propDescriptors,
          prop,
          `unshift${capitalize(prop.name)}`,
          [buildArrayValuesRestParam(prop)],
          (nextRef) => [
            t.expressionStatement(
              t.callExpression(
                t.memberExpression(nextRef(), t.identifier('unshift')),
                [t.spreadElement(t.identifier('values'))]
              )
            ),
          ]
        )
      );

      methods.push(
        buildSpliceMethod(typeName, propDescriptors, prop)
      );

      methods.push(
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
      );

      methods.push(
        buildSortMethod(typeName, propDescriptors, prop)
      );

      methods.push(
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
      );

      methods.push(
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
    buildMutations
  ) {
    const { statements, nextName } = buildArrayCloneSetup(prop);
    const nextRef = () => t.identifier(nextName);
    const mutations = buildMutations(nextRef);
    const bodyStatements = [
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

  function buildArrayCloneSetup(prop) {
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
          t.arrayExpression([t.spreadElement(t.identifier(sourceName))])
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
          ]
        )
      );

      methods.push(
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
          ]
        )
      );

      methods.push(
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
          ]
        )
      );

      methods.push(
        buildMapMutationMethod(
          typeName,
          propDescriptors,
          prop,
          `merge${capitalize(prop.name)}Entries`,
          buildMapMergeParams(prop),
          (mapRef) => {
            const entryId = t.identifier('entry');
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
      );

      methods.push(
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
      );

      methods.push(
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
      );

      methods.push(
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

  function buildMapMutationMethod(
    typeName,
    propDescriptors,
    prop,
    methodName,
    params,
    buildMutations
  ) {
    const { statements, nextName } = buildMapCloneSetup(prop);
    const nextRef = () => t.identifier(nextName);
    const mutations = buildMutations(nextRef);
    const bodyStatements = [
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
          t.callExpression(t.identifier('Array.from'), [
            t.callExpression(
              t.memberExpression(t.identifier(sourceName), t.identifier('entries')),
              []
            ),
          ])
        )
      : t.callExpression(t.identifier('Array.from'), [
          t.callExpression(
            t.memberExpression(t.identifier(sourceName), t.identifier('entries')),
            []
          ),
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

  function cloneMapKeyType(prop) {
    return prop.mapKeyType ? t.cloneNode(prop.mapKeyType) : t.tsAnyKeyword();
  }

  function cloneMapValueType(prop) {
    return prop.mapValueType ? t.cloneNode(prop.mapValueType) : t.tsAnyKeyword();
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
    const mapType = t.tsTypeReference(
      t.identifier('Map'),
      t.tsTypeParameterInstantiation([t.cloneNode(keyType), t.cloneNode(valueType)])
    );
    const readonlyMapType = t.tsTypeReference(
      t.identifier('ReadonlyMap'),
      t.tsTypeParameterInstantiation([keyType, valueType])
    );
    entriesId.typeAnnotation = t.tsTypeAnnotation(
      t.tsUnionType([iterableType, mapType, readonlyMapType])
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
      const elementId = t.identifier('element');
      const elementCheck = buildRuntimeTypeCheckExpression(
        typeNode.elementType,
        elementId
      );
      const arrayCheck = t.callExpression(
        t.memberExpression(t.identifier('Array'), t.identifier('isArray')),
        [valueId]
      );

      if (!elementCheck || t.isBooleanLiteral(elementCheck, { value: true })) {
        return arrayCheck;
      }

      return t.logicalExpression(
        '&&',
        arrayCheck,
        t.callExpression(
          t.memberExpression(valueId, t.identifier('every')),
          [t.arrowFunctionExpression([elementId], elementCheck)]
        )
      );
    }

    if (t.isTSTypeReference(typeNode)) {
      if (isDateReference(typeNode)) {
        return t.binaryExpression(
          'instanceof',
          valueId,
          t.identifier('Date')
        );
      }

      if (isBrandReference(typeNode)) {
        return typeofCheck(valueId, 'string');
      }

      if (isMapReference(typeNode)) {
        return buildMapTypeCheckExpression(typeNode, valueId);
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
        !t.isTSPropertySignature(member) ||
        !member.typeAnnotation ||
        !t.isTSType(member.typeAnnotation.typeAnnotation)
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

  function isArrayTypeNode(node) {
    if (!node) {
      return false;
    }

    if (t.isTSParenthesizedType(node)) {
      return isArrayTypeNode(node.typeAnnotation);
    }

    return t.isTSArrayType(node);
  }

  function isMapTypeNode(node) {
    if (!node) {
      return false;
    }

    if (t.isTSParenthesizedType(node)) {
      return isMapTypeNode(node.typeAnnotation);
    }

    return (
      t.isTSTypeReference(node) &&
      t.isIdentifier(node.typeName) &&
      (node.typeName.name === 'Map' || node.typeName.name === 'ReadonlyMap')
    );
  }

  function getMapTypeArguments(node) {
    if (!node) {
      return null;
    }

    if (t.isTSParenthesizedType(node)) {
      return getMapTypeArguments(node.typeAnnotation);
    }

    if (
      t.isTSTypeReference(node) &&
      t.isIdentifier(node.typeName) &&
      (node.typeName.name === 'Map' || node.typeName.name === 'ReadonlyMap') &&
      node.typeParameters &&
      node.typeParameters.params.length === 2
    ) {
      const [keyType, valueType] = node.typeParameters.params;
      return { keyType, valueType };
    }

    return null;
  }

  function getArrayElementType(node) {
    if (!node) {
      return null;
    }

    if (t.isTSParenthesizedType(node)) {
      return getArrayElementType(node.typeAnnotation);
    }

    if (t.isTSArrayType(node)) {
      return node.elementType;
    }

    return null;
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
      binding &&
      (binding.path.isImportSpecifier() || binding.path.isImportDefaultSpecifier()) &&
      binding.path.parentPath &&
      binding.path.parentPath.isImportDeclaration()
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

  function resolveImportPath(importSource, filename) {
    if (!filename || typeof importSource !== 'string' || !importSource.startsWith('.')) {
      return null;
    }

    const dir = path.dirname(filename);
    const basePath = path.resolve(dir, importSource);

    const candidates = [
      basePath,
      `${basePath}.propane`,
    ];

    for (const candidate of candidates) {
      if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) {
        return candidate;
      }
    }

    return null;
  }

  function analyzePropaneModule(filename) {
    try {
      const source = fs.readFileSync(filename, 'utf8');
      const ast = parse(source, {
        sourceType: 'module',
        plugins: ['typescript'],
      });

      const names = new Set();

      for (const node of ast.program.body) {
        if (
          node.type === 'ExportNamedDeclaration' &&
          node.declaration &&
          node.declaration.type === 'TSTypeAliasDeclaration' &&
          node.declaration.id &&
          node.declaration.id.type === 'Identifier' &&
          node.declaration.typeAnnotation &&
          node.declaration.typeAnnotation.type === 'TSTypeLiteral'
        ) {
          names.add(node.declaration.id.name);
        }
      }

      return names;
    } catch {
      return new Set();
    }
  }

  function getImportedName(importPath) {
    if (importPath.isImportSpecifier()) {
      const imported = importPath.node.imported;
      if (t.isIdentifier(imported)) {
        return imported.name;
      }
      if (t.isStringLiteral(imported)) {
        return imported.value;
      }
      return null;
    }

    if (importPath.isImportDefaultSpecifier()) {
      return 'default';
    }

    return null;
  }

  function getFilename(typePath) {
    const file = typePath.hub && typePath.hub.file;
    const opts = file && file.opts;
    return (opts && opts.filename) || null;
  }

  function capitalize(name) {
    if (!name) {
      return '';
    }
    return name.charAt(0).toUpperCase() + name.slice(1);
  }
}
