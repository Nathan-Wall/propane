/**
 * Validator Import Tracker
 *
 * Tracks validator imports during Babel plugin traversal to enable
 * recognition of validator types during type extraction.
 */

import * as t from '@babel/types';
import type {
  TypeRegistry,
  ValidatorRegistration,
  BrandRegistration,
} from '@/types/src/registry.js';

/**
 * Information about a tracked validator import.
 */
export interface ValidatorImportInfo {
  /** Package the validator was imported from */
  package: string;
  /** Original export name (may differ from local name due to aliasing) */
  name: string;
}

/**
 * Information about a tracked brand import.
 */
export interface BrandImportInfo {
  /** Package the brand was imported from */
  package: string;
  /** Original export name (may differ from local name due to aliasing) */
  name: string;
}

/**
 * Tracker for validator and brand imports in a file.
 */
export interface ValidatorImportTracker {
  /** Maps local name → validator info for named/aliased imports */
  validators: Map<string, ValidatorImportInfo>;
  /** Maps local name → brand info for named/aliased imports */
  brands: Map<string, BrandImportInfo>;
  /** Maps namespace name → package for namespace imports */
  namespaceImports: Map<string, string>;
}

/**
 * Create a new validator import tracker.
 */
export function createValidatorImportTracker(): ValidatorImportTracker {
  return {
    validators: new Map(),
    brands: new Map(),
    namespaceImports: new Map(),
  };
}

/**
 * Track validator and brand imports from an ImportDeclaration.
 *
 * @param importDecl - The import declaration node
 * @param tracker - The import tracker to update
 * @param registry - The type registry for looking up registrations
 */
export function trackValidatorImport(
  importDecl: t.ImportDeclaration,
  tracker: ValidatorImportTracker,
  registry: TypeRegistry | undefined
): void {
  // If no registry is available, we can't track validators
  if (!registry) {
    return;
  }

  const source = importDecl.source.value;

  for (const specifier of importDecl.specifiers) {
    if (t.isImportSpecifier(specifier)) {
      // Named import: import { Positive } or import { Positive as Pos }
      const importedName = t.isIdentifier(specifier.imported)
        ? specifier.imported.name
        : specifier.imported.value;
      const localName = specifier.local.name;

      const reg = registry.get(source, importedName);
      if (reg) {
        if (reg.category === 'validator') {
          tracker.validators.set(localName, {
            package: source,
            name: importedName,
          });
        } else if (reg.category === 'brand') {
          tracker.brands.set(localName, {
            package: source,
            name: importedName,
          });
        }
      }
    } else if (t.isImportNamespaceSpecifier(specifier)) {
      // Namespace import: import * as Types from '@propanejs/types'
      // Check if this package has any validators or brands
      const validators = registry.getByCategory('validator');
      const brands = registry.getByCategory('brand');
      const hasValidatorsOrBrands =
        validators.some((r) => r.package === source) ||
        brands.some((r) => r.package === source);

      if (hasValidatorsOrBrands) {
        tracker.namespaceImports.set(specifier.local.name, source);
      }
    }
  }
}

/**
 * Resolve a type reference to a validator registration.
 *
 * @param typeName - The type name node (identifier or qualified name)
 * @param tracker - The import tracker
 * @param registry - The type registry
 * @returns The validator registration, or null if not found
 */
export function resolveValidatorReference(
  typeName: t.Identifier | t.TSQualifiedName,
  tracker: ValidatorImportTracker,
  registry: TypeRegistry | undefined
): ValidatorRegistration | null {
  if (!registry) {
    return null;
  }

  if (t.isIdentifier(typeName)) {
    // Direct reference: Positive<number> or aliased Pos<number>
    const info = tracker.validators.get(typeName.name);
    if (info) {
      const reg = registry.get(info.package, info.name);
      if (reg?.category === 'validator') {
        return reg as ValidatorRegistration;
      }
    }
  } else if (t.isTSQualifiedName(typeName)) {
    // Namespace reference: Types.Positive<number>
    const left = typeName.left;
    if (t.isIdentifier(left)) {
      const pkg = tracker.namespaceImports.get(left.name);
      if (pkg) {
        const validatorName = typeName.right.name;
        const reg = registry.get(pkg, validatorName);
        if (reg?.category === 'validator') {
          return reg as ValidatorRegistration;
        }
      }
    }
  }

  return null;
}

/**
 * Resolve a type reference to a brand registration.
 *
 * @param typeName - The type name node (identifier or qualified name)
 * @param tracker - The import tracker
 * @param registry - The type registry
 * @returns The brand registration, or null if not found
 */
export function resolveBrandReference(
  typeName: t.Identifier | t.TSQualifiedName,
  tracker: ValidatorImportTracker,
  registry: TypeRegistry | undefined
): BrandRegistration | null {
  if (!registry) {
    return null;
  }

  if (t.isIdentifier(typeName)) {
    // Direct reference: int32 or aliased MyInt<number>
    const info = tracker.brands.get(typeName.name);
    if (info) {
      const reg = registry.get(info.package, info.name);
      if (reg?.category === 'brand') {
        return reg as BrandRegistration;
      }
    }
  } else if (t.isTSQualifiedName(typeName)) {
    // Namespace reference: Types.int32
    const left = typeName.left;
    if (t.isIdentifier(left)) {
      const pkg = tracker.namespaceImports.get(left.name);
      if (pkg) {
        const brandName = typeName.right.name;
        const reg = registry.get(pkg, brandName);
        if (reg?.category === 'brand') {
          return reg as BrandRegistration;
        }
      }
    }
  }

  return null;
}

/**
 * Check if a type reference is a known validator.
 */
export function isValidatorReference(
  typeRef: t.TSTypeReference,
  tracker: ValidatorImportTracker,
  registry: TypeRegistry | undefined
): boolean {
  return resolveValidatorReference(typeRef.typeName, tracker, registry) !== null;
}

/**
 * Check if a type reference is a known brand.
 */
export function isBrandReference(
  typeRef: t.TSTypeReference,
  tracker: ValidatorImportTracker,
  registry: TypeRegistry | undefined
): boolean {
  return resolveBrandReference(typeRef.typeName, tracker, registry) !== null;
}
