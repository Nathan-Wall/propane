import * as t from '@babel/types';
import type { NodePath } from '@babel/traverse';

/**
 * Tracks Brand import information for the current file.
 */
export interface BrandImportTracker {
  /** Local names that refer to Brand (e.g., 'Brand', 'B' if aliased) */
  localNames: Set<string>;
  /** Namespace imports that contain Brand (e.g., 'Runtime' for `import * as Runtime`) */
  namespaceImports: Set<string>;
}

/**
 * Creates a new Brand import tracker.
 */
export function createBrandImportTracker(): BrandImportTracker {
  return {
    localNames: new Set(),
    namespaceImports: new Set(),
  };
}

/**
 * Process an import declaration to track Brand imports.
 * Handles:
 * - `import { Brand } from '...'`
 * - `import { Brand as B } from '...'`
 * - `import type { Brand } from '...'`
 * - `import * as Runtime from '...'`
 */
export function trackBrandImport(
  importDecl: t.ImportDeclaration,
  tracker: BrandImportTracker
): void {
  for (const specifier of importDecl.specifiers) {
    if (t.isImportSpecifier(specifier)) {
      // Named import: `import { Brand }` or `import { Brand as B }`
      const importedName = t.isIdentifier(specifier.imported)
        ? specifier.imported.name
        : specifier.imported.value;

      if (importedName === 'Brand') {
        tracker.localNames.add(specifier.local.name);
      }
    } else if (t.isImportNamespaceSpecifier(specifier)) {
      // Namespace import: `import * as Runtime from '...'`
      // We'll need to check for Runtime.Brand usage
      tracker.namespaceImports.add(specifier.local.name);
    }
  }
}

/**
 * Check if a type reference refers to Brand.
 * Handles:
 * - `Brand<T, B>` (direct reference)
 * - `B<T, B>` (aliased import)
 * - `Runtime.Brand<T, B>` (namespace import)
 */
export function isBrandTypeReference(
  node: t.TSTypeReference,
  tracker: BrandImportTracker
): boolean {
  const typeName = node.typeName;

  if (t.isIdentifier(typeName)) {
    // Direct reference: Brand<T, B> or aliased B<T, B>
    return tracker.localNames.has(typeName.name);
  }

  if (
    t.isTSQualifiedName(typeName)
    && t.isIdentifier(typeName.left)
    && t.isIdentifier(typeName.right)
  ) {
    // Qualified name: Runtime.Brand<T, B>
    return (
      tracker.namespaceImports.has(typeName.left.name)
      && typeName.right.name === 'Brand'
    );
  }

  return false;
}

/**
 * Result of analyzing a Brand usage.
 */
export interface BrandUsageInfo {
  /** The TSTypeReference node for the Brand type */
  node: t.TSTypeReference;
  /** Number of type parameters (2 or 3) */
  paramCount: number;
}

/**
 * Find Brand usages in a type node (recursive).
 * Returns all Brand<T, B> or Brand<T, B, NS> usages found.
 */
export function findBrandUsages(
  typeNode: t.TSType,
  tracker: BrandImportTracker
): BrandUsageInfo[] {
  const usages: BrandUsageInfo[] = [];

  function visit(node: t.TSType): void {
    if (t.isTSTypeReference(node) && isBrandTypeReference(node, tracker)) {
      const paramCount = node.typeParameters?.params.length ?? 0;
      usages.push({ node, paramCount });
    }

    // Recursively check nested types
    if (t.isTSUnionType(node) || t.isTSIntersectionType(node)) {
      for (const type of node.types) {
        visit(type);
      }
    } else if (t.isTSArrayType(node)) {
      visit(node.elementType);
    } else if (t.isTSTypeReference(node) && node.typeParameters) {
      // Check type parameters of other generic types
      for (const param of node.typeParameters.params) {
        visit(param);
      }
    } else if (t.isTSParenthesizedType(node)) {
      visit(node.typeAnnotation);
    } else if (t.isTSTypeLiteral(node)) {
      for (const member of node.members) {
        if (t.isTSPropertySignature(member) && member.typeAnnotation) {
          visit(member.typeAnnotation.typeAnnotation);
        }
      }
    } else if (t.isTSMappedType(node) && node.typeAnnotation) {
      visit(node.typeAnnotation);
    } else if (t.isTSConditionalType(node)) {
      visit(node.checkType);
      visit(node.extendsType);
      visit(node.trueType);
      visit(node.falseType);
    } else if (t.isTSIndexedAccessType(node)) {
      visit(node.objectType);
      visit(node.indexType);
    }
  }

  visit(typeNode);
  return usages;
}

/**
 * Generate a unique symbol name for a Brand type.
 * @param typeName - The name of the type alias (e.g., 'UserId')
 * @param propertyName - Optional property name for nested Brand in @message
 */
export function generateBrandSymbolName(
  typeName: string,
  propertyName?: string
): string {
  if (propertyName) {
    return `_${typeName}_${propertyName}_brand`;
  }
  return `_${typeName}_brand`;
}

/**
 * Create a `declare const _name_brand: unique symbol;` declaration.
 */
export function createSymbolDeclaration(
  symbolName: string
): t.VariableDeclaration {
  // Create the `unique symbol` type annotation
  const uniqueSymbolType = t.tsTypeOperator(t.tsSymbolKeyword());
  uniqueSymbolType.operator = 'unique';

  // Create identifier with type annotation
  const identifier = t.identifier(symbolName);
  identifier.typeAnnotation = t.tsTypeAnnotation(uniqueSymbolType);

  const declaration = t.variableDeclaration('const', [
    t.variableDeclarator(identifier, null),
  ]);

  // Mark as declare
  declaration.declare = true;

  return declaration;
}

/**
 * Transform a 2-param Brand<T, B> into Brand<T, B, typeof symbolName>.
 * Mutates the node in place.
 */
export function transformBrandToThreeParam(
  brandNode: t.TSTypeReference,
  symbolName: string
): void {
  if (!brandNode.typeParameters) {
    return;
  }

  // Create `typeof symbolName` type
  const typeofType = t.tsTypeQuery(t.identifier(symbolName));

  // Add as third type parameter
  brandNode.typeParameters.params.push(typeofType);
}

/**
 * Result of transforming Brand usages in a type alias.
 */
export interface BrandTransformResult {
  /** Symbol declarations to insert before the type alias */
  symbolDeclarations: t.VariableDeclaration[];
  /** Whether any transformations were made */
  transformed: boolean;
}

/**
 * Transform all 2-param Brand usages in a type alias.
 * Returns symbol declarations to be inserted before the type alias.
 * Throws an error if 3-param Brand is used (not allowed in .pmsg files).
 */
export function transformBrandInTypeAlias(
  path: NodePath<t.TSTypeAliasDeclaration>,
  tracker: BrandImportTracker
): BrandTransformResult {
  const result: BrandTransformResult = {
    symbolDeclarations: [],
    transformed: false,
  };

  // Skip if no Brand imports in this file
  if (tracker.localNames.size === 0 && tracker.namespaceImports.size === 0) {
    return result;
  }

  const typeName = path.node.id.name;
  const typeAnnotation = path.node.typeAnnotation;

  // Skip generic type aliases (e.g., `type Id<T> = Brand<T, 'id'>`)
  if (path.node.typeParameters && path.node.typeParameters.params.length > 0) {
    return result;
  }

  // Find all Brand usages
  const usages = findBrandUsages(typeAnnotation, tracker);

  if (usages.length === 0) {
    return result;
  }

  // Check for 3-param Brand (error in .pmsg files)
  for (const usage of usages) {
    if (usage.paramCount === 3) {
      throw path.buildCodeFrameError(
        'Brand with 3 type parameters is not allowed in .pmsg files.\n\n'
        + 'Use the 2-parameter form and the plugin will generate a unique '
        + 'namespace:\n'
        + "  type UserId = Brand<number, 'id'>;\n\n"
        + 'If you need explicit namespace control, define the type in a '
        + '.ts file instead.'
      );
    }

    if (usage.paramCount !== 2) {
      throw path.buildCodeFrameError(
        `Brand requires exactly 2 type parameters, got ${usage.paramCount}.\n\n`
        + "Expected: Brand<BaseType, 'tag'>\n"
        + "Example: type UserId = Brand<number, 'userId'>;"
      );
    }
  }

  // Generate unique symbols for each Brand usage
  // For simple type alias with single Brand, use _TypeName_brand
  // For multiple Brands or nested, use index suffix
  const symbolNames = new Set<string>();

  for (let i = 0; i < usages.length; i++) {
    const usage = usages[i]!;

    // Generate symbol name
    let symbolName = usages.length === 1
      ? generateBrandSymbolName(typeName)
      : `_${typeName}_brand_${i}`;

    // Ensure uniqueness
    while (symbolNames.has(symbolName)) {
      symbolName = `${symbolName}_`;
    }
    symbolNames.add(symbolName);

    // Create symbol declaration
    result.symbolDeclarations.push(createSymbolDeclaration(symbolName));

    // Transform the Brand node to 3-param
    transformBrandToThreeParam(usage.node, symbolName);
  }

  result.transformed = true;
  return result;
}

/**
 * Transform Brand usages in @message property types.
 * For nested Brand in properties like `'1:id': Brand<number, 'userId'>`.
 */
export function transformBrandInMessageProperty(
  propTypeNode: t.TSType,
  typeName: string,
  propertyName: string,
  tracker: BrandImportTracker
): BrandTransformResult {
  const result: BrandTransformResult = {
    symbolDeclarations: [],
    transformed: false,
  };

  // Skip if no Brand imports in this file
  if (tracker.localNames.size === 0 && tracker.namespaceImports.size === 0) {
    return result;
  }

  // Find all Brand usages in this property type
  const usages = findBrandUsages(propTypeNode, tracker);

  if (usages.length === 0) {
    return result;
  }

  const symbolNames = new Set<string>();

  for (let i = 0; i < usages.length; i++) {
    const usage = usages[i]!;

    // Check for 3-param Brand
    if (usage.paramCount === 3) {
      // Can't use buildCodeFrameError here since we don't have a path
      throw new Error(
        `Brand with 3 type parameters is not allowed in .pmsg files `
        + `(found in property '${propertyName}' of type '${typeName}').`
      );
    }

    if (usage.paramCount !== 2) {
      throw new Error(
        `Brand requires exactly 2 type parameters, got ${usage.paramCount} `
        + `(in property '${propertyName}' of type '${typeName}').`
      );
    }

    // Generate symbol name with property context
    let symbolName = usages.length === 1
      ? generateBrandSymbolName(typeName, propertyName)
      : `_${typeName}_${propertyName}_brand_${i}`;

    // Ensure uniqueness
    while (symbolNames.has(symbolName)) {
      symbolName = `${symbolName}_`;
    }
    symbolNames.add(symbolName);

    // Create symbol declaration
    result.symbolDeclarations.push(createSymbolDeclaration(symbolName));

    // Transform the Brand node
    transformBrandToThreeParam(usage.node, symbolName);
  }

  result.transformed = true;
  return result;
}
