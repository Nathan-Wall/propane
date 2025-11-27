import * as t from '@babel/types';
import type { PropDescriptor } from './properties.js';

export function buildTypeNamespace(
  typeAlias: t.TSTypeAliasDeclaration,
  properties: PropDescriptor[],
  exported: boolean,
  generatedTypeNames: string[] = []
): t.ExportNamedDeclaration | t.TSModuleDeclaration {
  const namespaceId = t.identifier(typeAlias.id.name);
  const typeId = t.identifier('Data');

  const literalMembers = properties.map((prop) => {
    const key = t.identifier(prop.name);
    let typeAnnotation = prop.displayType
      ? t.cloneNode(prop.displayType)
      : t.cloneNode(prop.inputTypeAnnotation);
    if (prop.optional) {
      if (t.isTSUnionType(typeAnnotation)) {
        typeAnnotation.types.push(t.tsUndefinedKeyword());
      } else {
        typeAnnotation = t.tsUnionType([
          typeAnnotation,
          t.tsUndefinedKeyword(),
        ]);
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

  const moduleBlock = t.tsModuleBlock([
    exportedTypeDecl,
    exportedUnionDecl,
    ...aliasDecls,
  ]);
  const namespaceDecl = t.tsModuleDeclaration(namespaceId, moduleBlock);
  namespaceDecl.declare = typeAlias.declare ?? null;
  namespaceDecl.kind = 'namespace';

  if (exported) {
    return t.exportNamedDeclaration(namespaceDecl, []);
  }

  return namespaceDecl;
}
