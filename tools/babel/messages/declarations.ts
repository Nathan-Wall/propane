import * as t from '@babel/types';
import type { NodePath } from '@babel/traverse';
import { assertSupportedTopLevelType, assertSupportedType } from './validation.js';
import { extractProperties, type TypeParameter } from './properties.js';
import { buildTypeNamespace } from './namespace.js';
import { buildClassFromProperties } from './class-builder.js';
import type { PropaneState } from './plugin.js';

/**
 * Extract and validate type parameters from a TSTypeParameterDeclaration.
 * Returns an array of TypeParameter objects with name and constraint.
 * Throws an error if a type parameter doesn't have an `extends Message` constraint.
 */
function extractTypeParameters(
  typeParams: t.TSTypeParameterDeclaration | null | undefined,
  declaredMessageTypeNames: Set<string>
): TypeParameter[] {
  if (!typeParams) {
    return [];
  }

  return typeParams.params.map((param) => {
    const name = param.name;

    // Validate that the type parameter has a constraint
    if (!param.constraint) {
      throw new Error(
        `Generic type parameter "${name}" must have an "extends Message" constraint. `
        + `Example: ${name} extends Message`
      );
    }

    if (!t.isTSTypeReference(param.constraint)) {
      throw new Error(
        `Generic type parameter "${name}" constraint must be a type reference (extends Message or a message type).`
      );
    }

    let constraint: string;
    if (t.isIdentifier(param.constraint.typeName)) {
      constraint = param.constraint.typeName.name;
    } else if (t.isTSQualifiedName(param.constraint.typeName)) {
      // Handle qualified names like Namespace.Type
      constraint = getQualifiedName(param.constraint.typeName);
    } else {
      throw new Error(
        `Generic type parameter "${name}" has an invalid constraint.`
      );
    }

    // Validate that the constraint is Message or a declared message type
    const baseConstraint = constraint.split('.')[0]!;
    if (baseConstraint !== 'Message' && !declaredMessageTypeNames.has(baseConstraint)) {
      throw new Error(
        `Generic type parameter "${name}" must extend Message or a message type, `
        + `but extends "${constraint}".`
      );
    }

    return { name, constraint };
  });
}

/**
 * Get the full name of a qualified type name.
 */
function getQualifiedName(typeName: t.TSQualifiedName): string {
  if (t.isIdentifier(typeName.left)) {
    return `${typeName.left.name}.${typeName.right.name}`;
  }
  return `${getQualifiedName(typeName.left)}.${typeName.right.name}`;
}

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
  {
    exported,
    state,
    declaredTypeNames,
    declaredMessageTypeNames,
    getMessageReferenceName
  }: BuildDeclarationsOptions
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

  // Extract type parameters (e.g., T, U from Container<T extends Message, U extends Message>)
  const typeParameters = extractTypeParameters(
    typeAlias.typeParameters,
    declaredMessageTypeNames
  );

  // Create a set of type parameter names for validation
  const typeParamNames = new Set(typeParameters.map((p) => p.name));

  // Create a wrapper for assertSupportedType that includes type parameters
  const assertSupportedTypeWithGenerics = (
    typePath: NodePath<t.TSType>,
    declared: Set<string>
  ) => {
    // Check if the type is a generic type parameter
    if (typePath.isTSTypeReference()) {
      const typeName = typePath.node.typeName;
      if (t.isIdentifier(typeName) && typeParamNames.has(typeName.name)) {
        // This is a generic type parameter reference, which is allowed
        return;
      }
    }
    // Fall back to standard validation
    assertSupportedType(typePath, declared);
  };

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
    assertSupportedTypeWithGenerics,
    typeParameters
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
    .map((node) => 
      t.isTSTypeAliasDeclaration(node) && t.isIdentifier(node.id)
        ? node.id.name
        : null
    )
    .filter((name): name is string => name !== null);

  const typeNamespace = buildTypeNamespace(
    typeAlias,
    properties,
    exported,
    generatedTypeNames
  );
  const classDecl = buildClassFromProperties(
    typeAlias.id.name,
    properties,
    declaredMessageTypeNames,
    state,
    typeParameters
  );

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

export function insertPrimitiveTypeAlias(
  typeAliasPath: NodePath<t.TSTypeAliasDeclaration>,
  exported: boolean
) {
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
  (alias as t.TSTypeAliasDeclaration & {
    [GENERATED_ALIAS]?: boolean;
  })[GENERATED_ALIAS] = true;

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
