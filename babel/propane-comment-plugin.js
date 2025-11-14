'use strict';

const t = require('@babel/types');

module.exports = function propaneCommentPlugin() {
  return {
    name: 'propane-comment-plugin',
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
        const { declaration } = path.node;
        if (!t.isTSTypeAliasDeclaration(declaration)) {
          return;
        }

        const replacement = buildDeclarations(declaration, { exported: true });

        if (replacement) {
          path.replaceWithMultiple(replacement);
        }
      },
      TSTypeAliasDeclaration(path) {
        if (path.parentPath.isExportNamedDeclaration()) {
          return;
        }

        const replacement = buildDeclarations(path.node, { exported: false });

        if (replacement) {
          path.replaceWithMultiple(replacement);
        }
      },
    },
  };

  function buildDeclarations(typeAlias, { exported }) {
    if (!t.isIdentifier(typeAlias.id)) {
      return null;
    }

    const typeLiteral = typeAlias.typeAnnotation;

    if (!t.isTSTypeLiteral(typeLiteral)) {
      return null;
    }

    const properties = extractProperties(typeLiteral.members);

    if (!properties) {
      return null;
    }

    const typeNamespace = buildTypeNamespace(typeAlias, typeLiteral, exported);
    const classDecl = buildClassFromProperties(typeAlias.id.name, properties);

    if (exported) {
      const classExport = t.exportNamedDeclaration(classDecl, []);
      return [typeNamespace, classExport];
    }

    return [typeNamespace, classDecl];
  }

  function extractProperties(members) {
    const props = [];

    for (const member of members) {
      if (!t.isTSPropertySignature(member)) {
        return null;
      }

      if (!t.isIdentifier(member.key) || member.computed) {
        return null;
      }

      if (!member.typeAnnotation) {
        return null;
      }

      const propType = member.typeAnnotation.typeAnnotation;

      if (!isSupportedType(propType)) {
        return null;
      }

      props.push({
        name: member.key.name,
        typeAnnotation: propType,
      });
    }

    return props;
  }

  function isSupportedType(node) {
    if (!node) {
      return false;
    }

    if (t.isTSStringKeyword(node) || t.isTSNumberKeyword(node)) {
      return true;
    }

    if (t.isTSTypeReference(node)) {
      if (isDateReference(node)) {
        return true;
      }

      if (isBrandReference(node)) {
        return true;
      }

      return t.isIdentifier(node.typeName);
    }

    if (t.isTSParenthesizedType(node)) {
      return isSupportedType(node.typeAnnotation);
    }

    if (t.isTSTypeLiteral(node)) {
      return node.members.every((member) =>
        t.isTSPropertySignature(member) &&
        t.isIdentifier(member.key) &&
        member.typeAnnotation &&
        isSupportedType(member.typeAnnotation.typeAnnotation)
      );
    }

    return false;
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

  function buildTypeNamespace(typeAlias, typeLiteral, exported) {
    const namespaceId = t.identifier(typeAlias.id.name);
    const typeId = t.identifier('Type');
    const literalMembers = typeLiteral.members.map((member) =>
      t.cloneNode(member)
    );
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
