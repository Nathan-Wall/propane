import path from 'path';
import * as t from '@babel/types';

const MESSAGE_SOURCE = '@propanejs/runtime';

export default function propanePlugin() {
  const declaredTypeNames = new Set();

  return {
    name: 'propane-plugin',
    visitor: {
      Program: {
        enter(path, state) {
          state.usesPropaneBase = false;

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
            ensureBaseImport(path);
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
      return null;
    }

    const properties = extractProperties(typeLiteralPath.get('members'));

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

      props.push({
        name,
        fieldNumber,
        optional: Boolean(memberPath.node.optional),
        readonly: Boolean(memberPath.node.readonly),
        isArray: isArrayTypeNode(propTypePath.node),
        typeAnnotation: t.cloneNode(propTypePath.node),
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
        t.tsTypeAnnotation(t.cloneNode(prop.typeAnnotation))
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

    const moduleBlock = t.tsModuleBlock([exportedTypeDecl]);
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

    for (const prop of propDescriptors) {
      let baseType = t.cloneNode(prop.typeAnnotation);
      if (prop.isArray) {
        baseType = wrapReadonlyArrayType(baseType);
      }

      const fieldTypeAnnotation = prop.optional && prop.isArray
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

      const getterReturnType = prop.optional && prop.isArray
        ? t.tsUnionType([baseType, t.tsUndefinedKeyword()])
        : baseType;

      getter.returnType = t.tsTypeAnnotation(getterReturnType);
      getters.push(getter);
    }

    const constructorParam = t.identifier('props');
    constructorParam.typeAnnotation = t.tsTypeAnnotation(
      t.cloneNode(propsTypeRef)
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

    const classBody = t.classBody([
      ...backingFields,
      constructor,
      ...getters,
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

      const typeCheckExpr = buildRuntimeTypeCheckExpression(
        prop.typeAnnotation,
        normalizedValueId
      );

      if (typeCheckExpr && !t.isBooleanLiteral(typeCheckExpr, { value: true })) {
        const shouldValidate = prop.optional
          ? t.logicalExpression(
              '&&',
              t.binaryExpression(
                '!==',
                normalizedValueId,
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
            normalizedValueId
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

  function ensureBaseImport(programPath) {
    const program = programPath.node;
    const existingImport = program.body.find(
      (stmt) =>
        t.isImportDeclaration(stmt) &&
        stmt.source.value === MESSAGE_SOURCE
    );

    if (existingImport) {
      const existingSpecifiers = new Set(
        existingImport.specifiers
          .filter((spec) => t.isImportSpecifier(spec))
          .map((spec) => spec.imported.name)
      );
      for (const name of ['Message', 'MessagePropDescriptor']) {
        if (!existingSpecifiers.has(name)) {
          existingImport.specifiers.push(
            t.importSpecifier(t.identifier(name), t.identifier(name))
          );
        }
      }
      return;
    }

    const importDecl = t.importDeclaration(
      [
        t.importSpecifier(t.identifier('Message'), t.identifier('Message')),
        t.importSpecifier(
          t.identifier('MessagePropDescriptor'),
          t.identifier('MessagePropDescriptor')
        ),
      ],
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
}
