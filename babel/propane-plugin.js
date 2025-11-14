'use strict';

const t = require('@babel/types');

module.exports = function propanePlugin() {
  const declaredTypeNames = new Set();

  return {
    name: 'propane-plugin',
    visitor: {
      Program(path) {
        const existing = (path.node.leadingComments || []).some(
          (comment) => comment.value.trim() === 'transpiled'
        );

        if (!existing) {
          path.addComment('leading', ' transpiled', true);
        }
      },
      ExportNamedDeclaration(path) {
        if (!path.parentPath.isProgram()) {
          return;
        }
        const declarationPath = path.get('declaration');
        if (!declarationPath.isTSTypeAliasDeclaration()) {
          return;
        }

        registerTypeAlias(declarationPath.node);

        const replacement = buildDeclarations(declarationPath, { exported: true });

        if (replacement) {
          path.replaceWithMultiple(replacement);
        }
      },
      TSTypeAliasDeclaration(path) {
        if (path.parentPath.isExportNamedDeclaration()) {
          return;
        }

        registerTypeAlias(path.node);

        const replacement = buildDeclarations(path, { exported: false });

        if (replacement) {
          path.replaceWithMultiple(replacement);
        }
      },
    },
  };

  function buildDeclarations(typeAliasPath, { exported }) {
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
      typePath.get('types').forEach((memberPath) => {
        assertSupportedType(memberPath);
      });
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
      typePath.get('members').forEach((memberPath) => {
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
      });
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
      return { name: keyPath.node.name, fieldNumber: null };
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

      return { name: identifierPart, fieldNumber };
    }

    throw memberPath.buildCodeFrameError(
      'Propane properties must use identifier names or numbered keys like \'1:name\'.'
    );
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
    const typeId = t.identifier('Type');

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

    propDescriptors.forEach((prop) => {
      const typeAnnotation = t.tsTypeAnnotation(t.cloneNode(prop.typeAnnotation));
      const field = t.classPrivateProperty(t.cloneNode(prop.privateName));
      field.typeAnnotation = typeAnnotation;
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

      getter.returnType = t.tsTypeAnnotation(t.cloneNode(prop.typeAnnotation));
      getters.push(getter);
    });

    const constructorParam = t.identifier('props');
    constructorParam.typeAnnotation = t.tsTypeAnnotation(
      t.tsTypeReference(
        t.tsQualifiedName(t.identifier(typeName), t.identifier('Type'))
      )
    );

    const constructorBody = propDescriptors.map((prop) =>
      t.expressionStatement(
        t.assignmentExpression(
          '=',
          t.memberExpression(
            t.thisExpression(),
            t.cloneNode(prop.privateName)
          ),
          t.memberExpression(t.identifier('props'), t.identifier(prop.name))
        )
      )
    );

    const constructor = t.classMethod(
      'constructor',
      t.identifier('constructor'),
      [constructorParam],
      t.blockStatement(constructorBody)
    );

    const classBody = t.classBody([
      ...backingFields,
      constructor,
      ...getters,
    ]);

    return t.classDeclaration(t.identifier(typeName), null, classBody, []);
  }
};
