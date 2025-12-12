import * as t from '@babel/types';
import type { NodePath } from '@babel/traverse';
import { assertSupportedTopLevelType, assertSupportedType } from './validation.js';
import { extractProperties, type TypeParameter } from './properties.js';
import { buildTypeNamespace } from './namespace.js';
import { buildClassFromProperties, type WrapperInfo } from './class-builder.js';
import type { PropaneState, ExtendInfo } from './plugin.js';
import {
  type BrandImportTracker,
  findBrandUsages,
  createSymbolDeclaration,
  transformBrandToThreeParam,
} from './brand-transform.js';
import type { PmtMessage } from '@/tools/parser/types.js';
import { pmtTypeParametersToTypeParameters } from './pmt-adapter.js';

/**
 * Known message wrapper types.
 * Message and Table have 1 type arg (payload).
 * Endpoint has 2 type args (payload + response).
 */
const MESSAGE_WRAPPERS = new Set(['Message', 'Table', 'Endpoint']);

/**
 * Extract wrapper info from a type reference if it's a message wrapper type.
 *
 * Detects patterns like:
 *   Message<{ '1:id': number }>
 *   Table<{ '1:id': number }>
 *   Endpoint<{ '1:id': number }, GetUserResponse>
 *
 * @param typePath - The path to the type annotation
 * @returns WrapperInfo if this is a message wrapper, null otherwise
 */
function extractWrapperInfo(
  typePath: NodePath<t.TSType>
): WrapperInfo | null {
  if (!typePath.isTSTypeReference()) return null;

  const typeName = typePath.node.typeName;
  if (!t.isIdentifier(typeName)) return null;
  if (!MESSAGE_WRAPPERS.has(typeName.name)) return null;

  const wrapperName = typeName.name;
  const typeArgs = typePath.node.typeParameters?.params;

  // Must have at least one type argument
  if (!typeArgs || typeArgs.length === 0) return null;

  // First arg must be a type literal (the payload)
  const payloadType = typeArgs[0];
  if (!t.isTSTypeLiteral(payloadType)) return null;

  // For Endpoint, extract response type
  if (wrapperName === 'Endpoint') {
    if (typeArgs.length !== 2) return null;
    const responseType = typeArgs[1];
    if (!t.isTSTypeReference(responseType)) return null;
    if (!t.isIdentifier(responseType.typeName)) return null;

    return {
      wrapperName: 'Endpoint',
      responseTypeName: responseType.typeName.name,
    };
  }

  // For Message and Table, no response type
  return {
    wrapperName,
    responseTypeName: undefined,
  };
}

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
export const IMPLICIT_MESSAGE = Symbol('PropaneImplicitMessage');

interface BuildDeclarationsOptions {
  exported: boolean;
  state: PropaneState;
  declaredTypeNames: Set<string>;
  declaredMessageTypeNames: Set<string>;
  getMessageReferenceName: (typePath: NodePath<t.TSType>) => string | null;
  /** Extension info if this type has an @extend decorator */
  extendInfo?: ExtendInfo;
  /** Brand import tracker for auto-namespace transformation */
  brandTracker?: BrandImportTracker;
  /** PMT message data from shared parser (if available) */
  pmtMessage?: PmtMessage;
}

export function buildDeclarations(
  typeAliasPath: NodePath<t.TSTypeAliasDeclaration>,
  {
    exported,
    state,
    declaredTypeNames,
    declaredMessageTypeNames,
    getMessageReferenceName,
    extendInfo,
    brandTracker,
    pmtMessage,
  }: BuildDeclarationsOptions
): t.Statement[] | null {
  const typeAlias = typeAliasPath.node;

  if (!t.isIdentifier(typeAlias.id)) {
    throw typeAliasPath.buildCodeFrameError(
      'Propane type aliases must have identifier names.'
    );
  }

  const typeLiteralPath = typeAliasPath.get('typeAnnotation');

  // Check for Message/Table/Endpoint wrapper using PMT data
  let wrapperInfo: WrapperInfo | undefined;
  let actualTypeLiteralPath: NodePath<t.TSType> = typeLiteralPath;

  // Use PMT wrapper info if available, otherwise fall back to AST-based detection
  if (pmtMessage?.wrapper) {
    wrapperInfo = {
      wrapperName: pmtMessage.wrapper.localName,
      responseTypeName: pmtMessage.wrapper.responseType?.kind === 'reference'
        ? pmtMessage.wrapper.responseType.name
        : undefined,
    };
  } else if (typeLiteralPath.isTSTypeReference()) {
    // Fallback to AST-based detection (for non-PMT paths)
    wrapperInfo = extractWrapperInfo(typeLiteralPath) ?? undefined;
  }

  // If there's a wrapper, extract the payload type literal from the first type argument
  if (wrapperInfo && typeLiteralPath.isTSTypeReference()) {
    const typeParamsPath = typeLiteralPath.get('typeParameters');
    if (!Array.isArray(typeParamsPath) && typeParamsPath.node) {
      const paramsPath = typeParamsPath.get('params');
      if (Array.isArray(paramsPath) && paramsPath.length > 0) {
        actualTypeLiteralPath = paramsPath[0]!;
      }
    }
  }

  if (!actualTypeLiteralPath.isTSTypeLiteral()) {
    assertSupportedTopLevelType(typeLiteralPath);
    insertPrimitiveTypeAlias(typeAliasPath, exported);
    return null;
  }

  // Transform Brand usages in property types (auto-namespace transformation)
  const brandSymbolDeclarations: t.VariableDeclaration[] = [];
  const hasBrandImports = brandTracker
    && (brandTracker.localNames.size > 0
      || brandTracker.namespaceImports.size > 0);
  if (hasBrandImports) {
    const typeName = typeAlias.id.name;
    const members = actualTypeLiteralPath.node.members;
    let brandIndex = 0;

    for (const member of members) {
      if (!t.isTSPropertySignature(member) || !member.typeAnnotation) {
        continue;
      }

      const propType = member.typeAnnotation.typeAnnotation;
      const usages = findBrandUsages(propType, brandTracker);

      for (const usage of usages) {
        if (usage.paramCount === 3) {
          throw typeAliasPath.buildCodeFrameError(
            'Brand with 3 type parameters is not allowed in .pmsg files.\n\n'
            + 'Use the 2-parameter form and the plugin will generate a unique '
            + 'namespace.'
          );
        }

        if (usage.paramCount !== 2) {
          throw typeAliasPath.buildCodeFrameError(
            `Brand requires exactly 2 type parameters, got ${usage.paramCount}.`
          );
        }

        // Extract property name for symbol naming
        let propName: string;
        if (t.isIdentifier(member.key)) {
          propName = member.key.name;
        } else if (t.isStringLiteral(member.key)) {
          // Handle '1:id' style property names - extract the name part
          const match = /^\d+:(.+)$/.exec(member.key.value);
          propName = match ? match[1]! : member.key.value;
        } else {
          propName = `prop${brandIndex}`;
        }

        // Generate unique symbol name
        const symbolName = `_${typeName}_${propName}_brand${usages.length > 1 ? `_${brandIndex}` : ''}`;
        brandIndex++;

        // Create symbol declaration and transform Brand
        brandSymbolDeclarations.push(createSymbolDeclaration(symbolName));
        transformBrandToThreeParam(usage.node, symbolName);
      }
    }
  }

  // Extract type parameters (e.g., T, U from Container<T extends Message, U extends Message>)
  let typeParameters: TypeParameter[];
  if (pmtMessage) {
    // Use PMT type parameters
    typeParameters = pmtTypeParametersToTypeParameters(pmtMessage.typeParameters);

    // Validate constraints (keep existing validation logic)
    for (const param of typeParameters) {
      const baseConstraint = param.constraint.split('.')[0]!;
      if (baseConstraint !== 'Message' && !declaredMessageTypeNames.has(baseConstraint)) {
        throw typeAliasPath.buildCodeFrameError(
          `Generic type parameter "${param.name}" must extend Message or a message type, `
          + `but extends "${param.constraint}".`
        );
      }
    }
  } else {
    // Fallback to AST-based extraction (for non-PMT paths)
    typeParameters = extractTypeParameters(
      typeAlias.typeParameters,
      declaredMessageTypeNames
    );
  }

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
  const memberPaths = actualTypeLiteralPath.get('members').filter(
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
  const isExtended = extendInfo !== undefined;
  const classDecl = buildClassFromProperties(
    typeAlias.id.name,
    properties,
    declaredMessageTypeNames,
    state,
    typeParameters,
    isExtended,
    wrapperInfo
  );

  state.usesPropaneBase = true;

  const generatedStatements: t.Statement[] = generatedTypes.map((alias) => {
    // Mark as implicit message so the visitor bypasses @message check
    (alias as t.TSTypeAliasDeclaration & {
      [IMPLICIT_MESSAGE]?: boolean;
    })[IMPLICIT_MESSAGE] = true;
    const exportedAlias = t.exportNamedDeclaration(alias, []);
    (exportedAlias as t.ExportNamedDeclaration & { exportKind?: string }).exportKind = 'type';
    return exported ? exportedAlias : alias;
  });

  if (exported) {
    const classExport = t.exportNamedDeclaration(classDecl, []);
    return [
      ...brandSymbolDeclarations,
      ...generatedStatements,
      classExport,
      typeNamespace,
    ];
  }

  return [
    ...brandSymbolDeclarations,
    ...generatedStatements,
    classDecl,
    typeNamespace,
  ];
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
