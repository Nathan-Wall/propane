import * as t from '@babel/types';
import { assertSupportedTopLevelType, assertSupportedType, registerTypeAlias } from './validation';
import { extractProperties } from './properties';
import { buildTypeNamespace } from './namespace';
import { buildClassFromProperties } from './class-builder';

export const GENERATED_ALIAS = Symbol('PropaneGeneratedTypeAlias');

type BuildDeclarationsOptions = {
  exported: boolean;
  state: any;
  declaredTypeNames: Set<string>;
  declaredMessageTypeNames: Set<string>;
  getMessageReferenceName: (typePath: any) => string | null;
};

export function buildDeclarations(
  typeAliasPath: any,
  { exported, state, declaredTypeNames, declaredMessageTypeNames, getMessageReferenceName }: BuildDeclarationsOptions
): t.Statement[] | null {
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

  const generatedTypes: t.Statement[] = [];
  const properties = extractProperties(
    typeLiteralPath.get('members'),
    generatedTypes as any,
    typeAlias.id.name,
    state,
    declaredTypeNames,
    declaredMessageTypeNames,
    getMessageReferenceName,
    assertSupportedType
  );
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

  const generatedTypeNames = (generatedTypes as t.Node[] as t.TSTypeAliasDeclaration[])
    .map((node) => (t.isTSTypeAliasDeclaration(node) && t.isIdentifier(node.id) ? node.id.name : null))
    .filter(Boolean) as string[];

  const typeNamespace = buildTypeNamespace(typeAlias, properties, exported, generatedTypeNames);
  const classDecl = buildClassFromProperties(typeAlias.id.name, properties, declaredMessageTypeNames);

  state.usesPropaneBase = true;

  if (exported) {
    const classExport = t.exportNamedDeclaration(classDecl, []);
    return [...generatedTypes, classExport, typeNamespace];
  }

  return [...generatedTypes, classDecl, typeNamespace];
}

export function insertPrimitiveTypeAlias(typeAliasPath: any, exported: boolean) {
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
  (alias as any)[GENERATED_ALIAS] = true;

  const aliasDecl = exported
    ? t.exportNamedDeclaration(alias, [])
    : alias;

  if (exported && aliasDecl) {
    (aliasDecl as any).exportKind = 'type';
  }

  const targetPath = exported ? typeAliasPath.parentPath : typeAliasPath;
  if (targetPath && typeof targetPath.insertAfter === 'function') {
    targetPath.insertAfter(aliasDecl);
  }
}
