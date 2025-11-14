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

    const interfaceBody = t.tsInterfaceBody(
      typeLiteral.members.map((member) => t.cloneNode(member))
    );

    const interfaceDecl = t.tsInterfaceDeclaration(
      t.identifier(typeAlias.id.name),
      typeAlias.typeParameters,
      [],
      interfaceBody
    );

    interfaceDecl.declare = typeAlias.declare;

    const classDecl = buildClassFromProperties(typeAlias.id.name, properties);

    if (exported) {
      const interfaceExport = t.exportNamedDeclaration(interfaceDecl, []);
      const classExport = t.exportNamedDeclaration(classDecl, []);
      return [interfaceExport, classExport];
    }

    return [interfaceDecl, classDecl];
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

  function buildClassFromProperties(typeName, properties) {
    const backingFields = [];
    const getters = [];

    properties.forEach((prop) => {
      const backingId = t.identifier(`_${prop.name}`);
      const typeAnnotation = t.tsTypeAnnotation(t.cloneNode(prop.typeAnnotation));
      const field = t.classProperty(backingId, null, typeAnnotation, null);
      field.accessibility = 'private';
      field.readonly = true;
      backingFields.push(field);

      const getter = t.classMethod(
        'get',
        t.identifier(prop.name),
        [],
        t.blockStatement([
          t.returnStatement(
            t.memberExpression(t.thisExpression(), backingId)
          ),
        ])
      );

      getter.returnType = t.tsTypeAnnotation(t.cloneNode(prop.typeAnnotation));
      getters.push(getter);
    });

    const constructorParam = t.identifier('props');
    constructorParam.typeAnnotation = t.tsTypeAnnotation(
      t.tsTypeReference(t.identifier(typeName))
    );

    const constructorBody = properties.map((prop) =>
      t.expressionStatement(
        t.assignmentExpression(
          '=',
          t.memberExpression(t.thisExpression(), t.identifier(`_${prop.name}`)),
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
