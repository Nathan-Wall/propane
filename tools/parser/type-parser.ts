/**
 * Type Parser
 *
 * Converts Babel TypeScript type nodes into PMT types.
 */

import * as t from '@babel/types';
import type { PmtType, PmtTypeParameter, SourceLocation, PmtDiagnostic } from './types.js';

/**
 * Context passed through type parsing for diagnostics collection.
 */
export interface TypeParserContext {
  filePath: string;
  diagnostics: PmtDiagnostic[];
}

/**
 * Extract source location from a Babel node.
 */
export function getSourceLocation(node: t.Node): SourceLocation {
  return {
    start: {
      line: node.loc?.start.line ?? 0,
      column: node.loc?.start.column ?? 0,
    },
    end: {
      line: node.loc?.end.line ?? 0,
      column: node.loc?.end.column ?? 0,
    },
  };
}

/**
 * Get the identifier name from a type reference.
 */
function getTypeName(typeName: t.TSEntityName): string {
  if (t.isIdentifier(typeName)) {
    return typeName.name;
  }
  // Qualified name (e.g., Namespace.Type)
  return `${getTypeName(typeName.left)}.${typeName.right.name}`;
}

/**
 * Parse a Babel type node into a PmtType.
 */
export function parseType(node: t.TSType, ctx: TypeParserContext): PmtType {
  // Primitives
  if (t.isTSStringKeyword(node)) {
    return { kind: 'primitive', primitive: 'string' };
  }
  if (t.isTSNumberKeyword(node)) {
    return { kind: 'primitive', primitive: 'number' };
  }
  if (t.isTSBooleanKeyword(node)) {
    return { kind: 'primitive', primitive: 'boolean' };
  }
  if (t.isTSBigIntKeyword(node)) {
    return { kind: 'primitive', primitive: 'bigint' };
  }
  if (t.isTSNullKeyword(node)) {
    return { kind: 'primitive', primitive: 'null' };
  }
  if (t.isTSUndefinedKeyword(node)) {
    return { kind: 'primitive', primitive: 'undefined' };
  }
  if (t.isTSVoidKeyword(node)) {
    // Treat void as undefined for simplicity
    return { kind: 'primitive', primitive: 'undefined' };
  }

  // Literal types
  if (t.isTSLiteralType(node)) {
    const literal = node.literal;
    if (t.isStringLiteral(literal)) {
      return { kind: 'literal', value: literal.value };
    }
    if (t.isNumericLiteral(literal)) {
      return { kind: 'literal', value: literal.value };
    }
    if (t.isBooleanLiteral(literal)) {
      return { kind: 'literal', value: literal.value };
    }
    if (t.isUnaryExpression(literal) && literal.operator === '-' && t.isNumericLiteral(literal.argument)) {
        return { kind: 'literal', value: -literal.argument.value };
      }
    // Fallback for other literals
    return { kind: 'primitive', primitive: 'string' };
  }

  // Array types (T[] syntax)
  if (t.isTSArrayType(node)) {
    return {
      kind: 'array',
      elementType: parseType(node.elementType, ctx),
    };
  }

  // Union types
  if (t.isTSUnionType(node)) {
    return {
      kind: 'union',
      types: node.types.map((member) => parseType(member, ctx)),
    };
  }

  // Parenthesized types
  if (t.isTSParenthesizedType(node)) {
    return parseType(node.typeAnnotation, ctx);
  }

  // Type references (Array<T>, Map<K,V>, Set<T>, Date, URL, etc.)
  if (t.isTSTypeReference(node)) {
    const name = getTypeName(node.typeName);
    const typeArgs = node.typeParameters?.params ?? [];

    // Handle built-in collection types
    if (name === 'Array' || name === 'ReadonlyArray' || name === 'ImmutableArray') {
      const elementType: PmtType = typeArgs[0]
        ? parseType(typeArgs[0], ctx)
        : { kind: 'primitive', primitive: 'string' };
      return { kind: 'array', elementType };
    }

    if (name === 'Map' || name === 'ReadonlyMap' || name === 'ImmutableMap') {
      return {
        kind: 'map',
        keyType: typeArgs[0] ? parseType(typeArgs[0], ctx) : { kind: 'primitive', primitive: 'string' },
        valueType: typeArgs[1] ? parseType(typeArgs[1], ctx) : { kind: 'primitive', primitive: 'string' },
      };
    }

    if (name === 'Set' || name === 'ReadonlySet' || name === 'ImmutableSet') {
      return {
        kind: 'set',
        elementType: typeArgs[0] ? parseType(typeArgs[0], ctx) : { kind: 'primitive', primitive: 'string' },
      };
    }

    // Handle built-in special types (Date/URL map to immutable message types)
    if (name === 'Date' || name === 'ImmutableDate') {
      return { kind: 'reference', name: 'ImmutableDate', typeArguments: [] };
    }
    if (name === 'URL' || name === 'ImmutableUrl') {
      return { kind: 'reference', name: 'ImmutableUrl', typeArguments: [] };
    }
    if (name === 'ArrayBuffer' || name === 'ImmutableArrayBuffer') {
      return { kind: 'arraybuffer' };
    }

    // Generic type reference
    return {
      kind: 'reference',
      name,
      typeArguments: typeArgs.map((arg) => parseType(arg, ctx)),
    };
  }

  // Tuple types - treat as array for simplicity
  if (t.isTSTupleType(node)) {
    // Use union of element types
    const elementTypes = node.elementTypes.map((elem) => {
      if (t.isTSNamedTupleMember(elem)) {
        return parseType(elem.elementType, ctx);
      }
      return parseType(elem, ctx);
    });
    if (elementTypes.length === 0) {
      return { kind: 'array', elementType: { kind: 'primitive', primitive: 'undefined' } };
    }
    if (elementTypes.length === 1) {
      return { kind: 'array', elementType: elementTypes[0]! };
    }
    return { kind: 'array', elementType: { kind: 'union', types: elementTypes } };
  }

  // Type query (typeof X) - treat as unknown reference
  if (t.isTSTypeQuery(node)) {
    const name = t.isIdentifier(node.exprName)
      ? node.exprName.name
      : 'unknown';
    return { kind: 'reference', name, typeArguments: [] };
  }

  // Indexed access type (T[K]) - treat as reference
  if (t.isTSIndexedAccessType(node)) {
    return { kind: 'reference', name: 'unknown', typeArguments: [] };
  }

  // Conditional types - not supported, return reference
  if (t.isTSConditionalType(node)) {
    return { kind: 'reference', name: 'unknown', typeArguments: [] };
  }

  // Mapped types - not supported, return reference
  if (t.isTSMappedType(node)) {
    return { kind: 'reference', name: 'unknown', typeArguments: [] };
  }

  // Function types - not supported in .pmsg
  if (t.isTSFunctionType(node) || t.isTSConstructorType(node)) {
    ctx.diagnostics.push({
      filePath: ctx.filePath,
      location: getSourceLocation(node),
      severity: 'error',
      code: 'PMT020',
      message: 'Function types are not allowed in .pmsg files.',
    });
    return { kind: 'reference', name: 'unknown', typeArguments: [] };
  }

  // Intersection types - not allowed
  if (t.isTSIntersectionType(node)) {
    ctx.diagnostics.push({
      filePath: ctx.filePath,
      location: getSourceLocation(node),
      severity: 'error',
      code: 'PMT013',
      message: 'Intersection types (&) are not allowed in .pmsg files.',
    });
    return { kind: 'reference', name: 'unknown', typeArguments: [] };
  }

  // Object literal types - should be handled at message level
  if (t.isTSTypeLiteral(node)) {
    // This is valid in nested positions, return as reference
    return { kind: 'reference', name: 'object', typeArguments: [] };
  }

  // Fallback for unknown types
  return { kind: 'reference', name: 'unknown', typeArguments: [] };
}

/**
 * Parse type parameters from a TSTypeParameterDeclaration.
 */
export function parseTypeParameters(
  params: t.TSTypeParameterDeclaration | null | undefined,
  ctx: TypeParserContext
): PmtTypeParameter[] {
  if (!params) {
    return [];
  }

  return params.params.map((param) => ({
    name: param.name,
    constraint: param.constraint ? parseType(param.constraint, ctx) : null,
  }));
}

/**
 * Check if a type node is an object literal (TSTypeLiteral).
 */
export function isObjectLiteralType(node: t.TSType): node is t.TSTypeLiteral {
  return t.isTSTypeLiteral(node);
}

/**
 * Check if a type node is a wrapper type pattern: F<Payload, Response, ...>
 * where Payload is an object literal.
 */
export function isWrapperType(
  node: t.TSType
): node is t.TSTypeReference & {
  typeParameters: t.TSTypeParameterInstantiation
} {
  if (!t.isTSTypeReference(node)) {
    return false;
  }
  if (!node.typeParameters || node.typeParameters.params.length < 2) {
    return false;
  }
  const firstArg = node.typeParameters.params[0];
  return firstArg !== undefined && t.isTSTypeLiteral(firstArg);
}

/**
 * Extract wrapper info from a wrapper type.
 */
interface WrapperInfo {
  localName: string;
  payload: t.TSTypeLiteral;
  responseType: PmtType | null;
}

export function extractWrapperInfo(
  node: t.TSTypeReference,
  ctx: TypeParserContext
): WrapperInfo | null {
  if (!node.typeParameters || node.typeParameters.params.length < 2) {
    return null;
  }

  const firstArg = node.typeParameters.params[0];
  if (!firstArg || !t.isTSTypeLiteral(firstArg)) {
    return null;
  }

  const localName = t.isIdentifier(node.typeName)
    ? node.typeName.name
    : getTypeName(node.typeName);

  const secondArg = node.typeParameters.params[1];
  const responseType = secondArg ? parseType(secondArg, ctx) : null;

  return {
    localName,
    payload: firstArg,
    responseType,
  };
}
