import * as t from '@babel/types';
import type { PropDescriptor, PluginStateFlags } from './properties.js';

/**
 * Fixes type parameters to ensure Message constraints have the required type argument.
 * Transforms `T extends Message` to `T extends Message<any>`.
 */
function fixTypeParameterConstraints(
  typeParams: t.TSTypeParameterDeclaration | null | undefined
): t.TSTypeParameterDeclaration | null {
  if (!typeParams) return null;

  const fixedParams = typeParams.params.map((param) => {
    const clonedParam = t.cloneNode(param);
    // Check if constraint is just 'Message' (without type arguments)
    if (
      clonedParam.constraint
      && t.isTSTypeReference(clonedParam.constraint)
      && t.isIdentifier(clonedParam.constraint.typeName)
      && clonedParam.constraint.typeName.name === 'Message'
      && !clonedParam.constraint.typeParameters
    ) {
      // Add <any> type argument
      clonedParam.constraint.typeParameters = t.tsTypeParameterInstantiation([
        t.tsAnyKeyword()
      ]);
    }
    return clonedParam;
  });

  return t.tsTypeParameterDeclaration(fixedParams);
}

export function buildTypeNamespace(
  typeAlias: t.TSTypeAliasDeclaration,
  properties: PropDescriptor[],
  exported: boolean,
  state: PluginStateFlags,
  generatedTypeNames: string[] = [],
  className?: string  // For @extend, this is TypeName$Base; otherwise same as typeAlias.id.name
): t.ExportNamedDeclaration | t.TSModuleDeclaration {
  const namespaceId = t.identifier(typeAlias.id.name);
  // Use className for class references in Value type (defaults to typeName)
  const classRef = className ?? typeAlias.id.name;
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
  const typeDecl = t.tsTypeAliasDeclaration(
    typeId,
    fixTypeParameterConstraints(typeAlias.typeParameters),
    literalClone
  );

  const exportedTypeDecl = t.exportNamedDeclaration(typeDecl, []);
  exportedTypeDecl.exportKind = 'type';

  // Build type arguments from type parameters (e.g., <T> becomes <T>)
  const typeArgs = typeAlias.typeParameters
    ? t.tsTypeParameterInstantiation(
        typeAlias.typeParameters.params.map((param) =>
          t.tsTypeReference(t.identifier(param.name))
        )
      )
    : null;

  const typeUnionDecl = t.tsTypeAliasDeclaration(
    t.identifier('Value'),
    fixTypeParameterConstraints(typeAlias.typeParameters),
    t.tsUnionType([
      // Use classRef for the class type (TypeName or TypeName$Base when extended)
      t.tsTypeReference(t.identifier(classRef), typeArgs),
      // Keep using typeAlias.id.name for the namespace (always TypeName.Data)
      t.tsTypeReference(
        t.tsQualifiedName(t.identifier(typeAlias.id.name), t.identifier('Data')),
        typeArgs ? t.cloneNode(typeArgs) : null
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
