/**
 * Wrapper Type Detection
 *
 * Detects Message<T>, Table<T>, and Endpoint<P, R> wrappers from their respective packages.
 */

import * as t from '@babel/types';
import type { PmtImport } from './types.js';

/**
 * Known message wrapper types and their source packages.
 *
 * These wrapper types are recognized as message type indicators:
 * - Message<T> from @propane/runtime - standard message wrapper
 * - Table<T> from @propane/postgres - database table wrapper (implies Message)
 * - Endpoint<P, R> from @propane/pms-core - RPC endpoint wrapper (implies Message)
 */
const MESSAGE_WRAPPERS: Record<string, Set<string>> = {
  '@propane/runtime': new Set(['Message']),
  '@propane/types': new Set(['Message']),
  '@propane/postgres': new Set(['Table']),
  '@propane/pms-core': new Set(['Endpoint']),
};

/**
 * Value wrapper types (single type arg, not object literal).
 */
const VALUE_WRAPPERS: Record<string, Set<string>> = {
  '@propane/runtime': new Set(['MessageWrapper']),
  '@propane/types': new Set(['MessageWrapper']),
};

/**
 * Table wrapper types and their source packages.
 */
const TABLE_WRAPPERS: Record<string, Set<string>> = {
  '@propane/postgres': new Set(['Table']),
};

/**
 * Endpoint wrapper types for RPC detection.
 */
const ENDPOINT_WRAPPERS: Record<string, Set<string>> = {
  '@propane/pms-core': new Set(['Endpoint']),
};

/**
 * Result of wrapper detection.
 */
export interface WrapperDetectionResult {
  /** True if wrapped with Message<T>, Table<T>, or Endpoint<P, R> */
  isMessageWrapper: boolean;
  /** True if wrapped with Table<T> */
  isTableWrapper: boolean;
  /** True if wrapped with Endpoint<P, R> */
  isEndpointWrapper: boolean;
  /** True if wrapped with MessageWrapper<T> */
  isValueWrapper: boolean;
  /** The local name of the wrapper (e.g., 'Message', 'Table', 'Endpoint') */
  wrapperLocalName: string | null;
  /** The inner object literal type, if present */
  innerType: t.TSTypeLiteral | null;
  /** Second type argument (response type for Endpoint) */
  secondTypeArg: t.TSType | null;
  /** The wrapped value type (for MessageWrapper<T>) */
  valueType: t.TSType | null;
}

/**
 * Check if an import specifier matches a wrapper type.
 */
function isWrapperImport(
  localName: string,
  imports: PmtImport[],
  wrapperSources: Record<string, Set<string>>
): boolean {
  for (const imp of imports) {
    const wrappers = wrapperSources[imp.source];
    if (!wrappers) continue;

    for (const spec of imp.specifiers) {
      if (spec.local === localName && wrappers.has(spec.imported)) {
        return true;
      }
    }
  }
  return false;
}

/**
 * Check if an import matches using an internal path pattern.
 * This handles cases like `import { Endpoint } from '@/pms-core/src/index.js'`
 */
function isWrapperImportInternal(
  localName: string,
  imports: PmtImport[],
  wrapperSources: Record<string, Set<string>>
): boolean {
  // Map internal @/ paths to their package names
  // Note: relative paths are normalized to @propane/* in parse-ast.ts
  const internalPathPatterns: Record<string, string> = {
    '@/runtime': '@propane/runtime',
    '@/types': '@propane/types',
    '@/postgres': '@propane/postgres',
    '@/pms-core': '@propane/pms-core',
  };

  for (const imp of imports) {
    // Check for internal path patterns
    for (const [pattern, packageName] of Object.entries(internalPathPatterns)) {
      if (imp.source.startsWith(pattern)) {
        const wrappers = wrapperSources[packageName];
        if (!wrappers) continue;

        for (const spec of imp.specifiers) {
          if (spec.local === localName && wrappers.has(spec.imported)) {
            return true;
          }
        }
      }
    }
  }
  return false;
}

/**
 * Get the type name from a TSEntityName.
 */
function getTypeName(typeName: t.TSEntityName): string {
  if (t.isIdentifier(typeName)) {
    return typeName.name;
  }
  // Qualified name (e.g., Namespace.Type)
  return `${getTypeName(typeName.left)}.${typeName.right.name}`;
}

/**
 * Detect if a type annotation is a message wrapper.
 *
 * This function checks if the type is:
 * - Message<{...}> from @propane/runtime
 * - Table<{...}> from @propane/postgres
 * - Endpoint<{...}, R> from @propane/pms-core
 */
export function detectWrapper(
  typeAnnotation: t.TSType,
  imports: PmtImport[]
): WrapperDetectionResult {
  const result: WrapperDetectionResult = {
    isMessageWrapper: false,
    isTableWrapper: false,
    isEndpointWrapper: false,
    isValueWrapper: false,
    wrapperLocalName: null,
    innerType: null,
    secondTypeArg: null,
    valueType: null,
  };

  // Must be a type reference
  if (!t.isTSTypeReference(typeAnnotation)) {
    return result;
  }

  // Must have type parameters
  const typeParams = typeAnnotation.typeParameters;
  if (!typeParams || typeParams.params.length === 0) {
    return result;
  }

  const localName = getTypeName(typeAnnotation.typeName);

  // Check for MessageWrapper<T> (value wrapper)
  const isValueWrapper = typeParams.params.length === 1
    && (isWrapperImport(localName, imports, VALUE_WRAPPERS)
      || isWrapperImportInternal(localName, imports, VALUE_WRAPPERS));
  if (isValueWrapper) {
    result.isMessageWrapper = true;
    result.isValueWrapper = true;
    result.wrapperLocalName = localName;
    result.valueType = typeParams.params[0] ?? null;
    return result;
  }

  const firstArg = typeParams.params[0];

  // Check if first argument is an object literal
  if (!firstArg || !t.isTSTypeLiteral(firstArg)) {
    return result;
  }

  // Check for Message wrapper (1 type arg with object literal)
  const isMessage = isWrapperImport(localName, imports, MESSAGE_WRAPPERS)
    || isWrapperImportInternal(localName, imports, MESSAGE_WRAPPERS);

  // Check for Table wrapper
  const isTable = isWrapperImport(localName, imports, TABLE_WRAPPERS)
    || isWrapperImportInternal(localName, imports, TABLE_WRAPPERS);

  // Check for Endpoint wrapper (2+ type args with object literal first)
  const isEndpoint = typeParams.params.length >= 2
    && (isWrapperImport(localName, imports, ENDPOINT_WRAPPERS)
      || isWrapperImportInternal(localName, imports, ENDPOINT_WRAPPERS));

  if (isMessage || isTable || isEndpoint) {
    result.isMessageWrapper = true;
    result.isTableWrapper = isTable;
    result.isEndpointWrapper = isEndpoint;
    result.wrapperLocalName = localName;
    result.innerType = firstArg;
    result.secondTypeArg = typeParams.params[1] ?? null;
  }

  return result;
}

/**
 * Check if a type is a Message wrapper.
 */
export function isMessageWrapperType(
  typeAnnotation: t.TSType,
  imports: PmtImport[]
): boolean {
  return detectWrapper(typeAnnotation, imports).isMessageWrapper;
}

/**
 * Check if a type is a Table wrapper.
 */
export function isTableWrapperType(
  typeAnnotation: t.TSType,
  imports: PmtImport[]
): boolean {
  return detectWrapper(typeAnnotation, imports).isTableWrapper;
}

/**
 * Check if a type is an Endpoint wrapper.
 */
export function isEndpointWrapperType(
  typeAnnotation: t.TSType,
  imports: PmtImport[]
): boolean {
  return detectWrapper(typeAnnotation, imports).isEndpointWrapper;
}
