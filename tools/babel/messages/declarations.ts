import path from 'node:path';
import * as t from '@babel/types';
import type { NodePath } from '@babel/traverse';
import { assertSupportedTopLevelType, assertSupportedType } from './validation.js';
import { extractProperties, type TypeParameter } from './properties.js';
import { buildTypeNamespace } from './namespace.js';
import { buildClassFromProperties, type WrapperInfo, type ClassValidationContext } from './class-builder.js';
import type { PropaneState, ExtendInfo, PropanePluginOptions } from './plugin.js';
import {
  type BrandImportTracker,
  findBrandUsages,
  createSymbolDeclaration,
  transformBrandToThreeParam,
} from './brand-transform.js';
import type { PmtMessage, PmtMessageWrapper } from '@/tools/parser/types.js';
import { computeMessageTypeHash } from '@/tools/parser/type-hash.js';
import { parseProperties } from '@/tools/parser/properties.js';
import { parseType, parseTypeParameters, type TypeParserContext } from '@/tools/parser/type-parser.js';
import { pmtTypeParametersToTypeParameters } from './pmt-adapter.js';
import { getSourceFilename } from './babel-helpers.js';

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
        `Generic type parameter "${name}" must have an "extends" constraint. `
        + `Example: ${name} extends Message`
      );
    }

    const constraintType = t.cloneNode(param.constraint);
    let requiresConstructor = false;
    if (t.isTSTypeReference(param.constraint)) {
      let constraintName: string | null = null;
      if (t.isIdentifier(param.constraint.typeName)) {
        constraintName = param.constraint.typeName.name;
      } else if (t.isTSQualifiedName(param.constraint.typeName)) {
        constraintName = getQualifiedName(param.constraint.typeName);
      }
      if (constraintName) {
        const baseConstraint = constraintName.split('.')[0]!;
        if (baseConstraint === 'Message' || declaredMessageTypeNames.has(baseConstraint)) {
          requiresConstructor = true;
        }
      }
    }

    return {
      name,
      constraint: constraintType,
      requiresConstructor,
    };
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
  /** Map of type alias name -> type annotation for resolving defaults */
  typeAliasDefinitions?: Map<string, t.TSType>;
  getMessageReferenceName: (typePath: NodePath<t.TSType>) => string | null;
  /** Extension info if this type has an @extend decorator */
  extendInfo?: ExtendInfo;
  /** Brand import tracker for auto-namespace transformation */
  brandTracker?: BrandImportTracker;
  /** PMT message data from shared parser (if available) */
  pmtMessage?: PmtMessage;
  /** Optional @typeId override from decorator parsing */
  typeId?: string | null;
  /** True if @compact decorator is present */
  compact?: boolean;
}

function normalizePath(value: string): string {
  return value.replaceAll('\\', '/');
}

function computeTypeId(
  typeName: string,
  typeAliasPath: NodePath<t.TSTypeAliasDeclaration>,
  opts?: PropanePluginOptions,
  override?: string | null
): string {
  if (override) {
    return override;
  }

  const filename = getSourceFilename(typeAliasPath);
  const root = opts?.messageTypeIdRoot ?? opts?.runtimeImportBase ?? process.cwd();
  let pathPart = filename;

  if (filename && root) {
    const relative = path.relative(root, filename);
    if (relative && !relative.startsWith('..') && !path.isAbsolute(relative)) {
      pathPart = relative;
    }
  }

  const normalizedPath = normalizePath(pathPart || typeName);
  const prefix = opts?.messageTypeIdPrefix?.trim();
  const base = prefix ? `${prefix}:${normalizedPath}` : normalizedPath;
  return `${base}#${typeName}`;
}

function computeImplicitTypeHash(
  typeAlias: t.TSTypeAliasDeclaration,
  typeAliasPath: NodePath<t.TSTypeAliasDeclaration>,
  actualTypeLiteralPath: NodePath<t.TSType>,
  typeLiteralPath: NodePath<t.TSType>,
  wrapperInfo: WrapperInfo | undefined,
  compact: boolean
): string | undefined {
  if (!actualTypeLiteralPath.isTSTypeLiteral()) {
    return undefined;
  }

  const filePath = getSourceFilename(typeAliasPath) ?? 'unknown';
  const ctx: TypeParserContext = { filePath, diagnostics: [] };

  const properties = parseProperties(actualTypeLiteralPath.node, ctx);
  const typeParameters = parseTypeParameters(typeAlias.typeParameters, ctx);

  let wrapper: PmtMessageWrapper | null = null;
  if (wrapperInfo) {
    let responseType = null;
    if (wrapperInfo.wrapperName === 'Endpoint' && typeLiteralPath.isTSTypeReference()) {
      const params = typeLiteralPath.node.typeParameters?.params;
      if (params && params[1]) {
        responseType = parseType(params[1], ctx);
      }
    }

    wrapper = {
      localName: wrapperInfo.wrapperName,
      responseType,
    };
  }

  const implicitMessage: PmtMessage = {
    name: t.isIdentifier(typeAlias.id) ? typeAlias.id.name : 'Unknown',
    isMessageType: true,
    isTableType: wrapperInfo?.wrapperName === 'Table',
    extendPath: null,
    typeId: null,
    compact,
    properties,
    typeParameters,
    wrapper,
    location: {
      start: { line: 0, column: 0 },
      end: { line: 0, column: 0 },
    },
  };

  return computeMessageTypeHash(implicitMessage);
}

export function buildDeclarations(
  typeAliasPath: NodePath<t.TSTypeAliasDeclaration>,
  {
    exported,
    state,
    declaredTypeNames,
    declaredMessageTypeNames,
    typeAliasDefinitions,
    getMessageReferenceName,
    extendInfo,
    brandTracker,
    pmtMessage,
    typeId,
    compact = false,
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
    typeParameters = pmtTypeParametersToTypeParameters(
      pmtMessage.typeParameters,
      declaredMessageTypeNames
    );
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
    assertSupportedType(typePath, declared, typeParamNames);
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

  const isExtended = extendInfo !== undefined;
  // When extended, the class is TypeName$Base, otherwise TypeName
  const className = isExtended ? `${typeAlias.id.name}$Base` : typeAlias.id.name;
  const computedTypeId = computeTypeId(
    typeAlias.id.name,
    typeAliasPath,
    state.opts,
    pmtMessage?.typeId ?? typeId
  );
  const computedTypeHash = pmtMessage
    ? computeMessageTypeHash(pmtMessage)
    : computeImplicitTypeHash(
      typeAlias,
      typeAliasPath,
      actualTypeLiteralPath,
      typeLiteralPath,
      wrapperInfo,
      compact
    );
  const typeNamespace = buildTypeNamespace(
    typeAlias,
    properties,
    exported,
    state,
    generatedTypeNames,
    className
  );
  const classDecl = buildClassFromProperties(
    typeAlias.id.name,
    properties,
    declaredMessageTypeNames,
    state,
    typeParameters,
    isExtended,
    wrapperInfo,
    state.validatorTracker
      ? { registry: state.typeRegistry, tracker: state.validatorTracker }
      : undefined,
    typeAliasDefinitions,
    t.identifier(`TYPE_TAG_${className}`),
    computedTypeId,
    computedTypeHash,
    compact
  );

  const typeTagDeclaration = t.variableDeclaration(
    'const',
    [
      t.variableDeclarator(
        t.identifier(`TYPE_TAG_${className}`),
        t.callExpression(t.identifier('Symbol'), [t.stringLiteral(typeAlias.id.name)])
      ),
    ]
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
      typeTagDeclaration,
      classExport,
      typeNamespace,
    ];
  }

  return [
    ...brandSymbolDeclarations,
    ...generatedStatements,
    typeTagDeclaration,
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
