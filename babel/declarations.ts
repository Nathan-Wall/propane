import * as t from '@babel/types';
import type { NodePath } from '@babel/traverse';
import { assertSupportedTopLevelType, assertSupportedType } from './validation';
import { extractProperties } from './properties';
import { buildTypeNamespace } from './namespace';
import { buildClassFromProperties } from './class-builder';
import type { PropaneState } from './plugin';

export const GENERATED_ALIAS = Symbol('PropaneGeneratedTypeAlias');

interface BuildDeclarationsOptions {
  exported: boolean;
  state: PropaneState;
  declaredTypeNames: Set<string>;
  declaredMessageTypeNames: Set<string>;
  getMessageReferenceName: (typePath: NodePath<t.TSType>) => string | null;
}

export function buildDeclarations(
  typeAliasPath: NodePath<t.TSTypeAliasDeclaration>,
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

  const generatedTypes: t.TSTypeAliasDeclaration[] = [];
  const memberPaths = typeLiteralPath.get('members').filter(
    (m): m is NodePath<t.TSPropertySignature> => m.isTSPropertySignature()
  );
  const properties = extractProperties(
    memberPaths,
    generatedTypes,
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

  const generatedTypeNames = generatedTypes
    .map((node) => (t.isTSTypeAliasDeclaration(node) && t.isIdentifier(node.id) ? node.id.name : null))
    .filter((name): name is string => name !== null);

  const typeNamespace = buildTypeNamespace(typeAlias, properties, exported, generatedTypeNames);
  const classDecl = buildClassFromProperties(typeAlias.id.name, properties, declaredMessageTypeNames);

  state.usesPropaneBase = true;

  const generatedStatements: t.Statement[] = generatedTypes.map((alias) => {
    const exportedAlias = t.exportNamedDeclaration(alias, []);
    (exportedAlias as t.ExportNamedDeclaration & { exportKind?: string }).exportKind = 'type';
    return exported ? exportedAlias : alias;
  });

  if (exported) {
    const classExport = t.exportNamedDeclaration(classDecl, []);
    return [...generatedStatements, classExport, typeNamespace];
  }

  return [...generatedStatements, classDecl, typeNamespace];
}

export function insertPrimitiveTypeAlias(typeAliasPath: NodePath<t.TSTypeAliasDeclaration>, exported: boolean) {
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
  (alias as t.TSTypeAliasDeclaration & { [GENERATED_ALIAS]?: boolean })[GENERATED_ALIAS] = true;

  const aliasDecl = exported
    ? t.exportNamedDeclaration(alias, [])
    : alias;

  if (exported && t.isExportNamedDeclaration(aliasDecl)) {
    (aliasDecl as t.ExportNamedDeclaration & { exportKind?: string }).exportKind = 'type';
  }

  const targetPath = exported ? typeAliasPath.parentPath : typeAliasPath;
  if (targetPath && typeof targetPath.insertAfter === 'function') {
    targetPath.insertAfter(aliasDecl);
  }
}
