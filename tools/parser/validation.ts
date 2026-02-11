/**
 * Validation Rules
 *
 * Validates .pmsg file structure and reports diagnostics.
 */

import * as t from '@babel/types';
import type { PmtDiagnostic } from './types.js';
import { getSourceLocation } from './type-parser.js';

/**
 * Validation context.
 */
export interface ValidationContext {
  filePath: string;
  diagnostics: PmtDiagnostic[];
}

/**
 * Validate that the file does not contain interfaces.
 * PMT010: interfaces are not allowed in .pmsg.
 */
export function validateNoInterfaces(
  body: t.Statement[],
  ctx: ValidationContext
): void {
  for (const stmt of body) {
    if (t.isTSInterfaceDeclaration(stmt)) {
      ctx.diagnostics.push({
        filePath: ctx.filePath,
        location: getSourceLocation(stmt),
        severity: 'error',
        code: 'PMT010',
        message: `Interfaces are not allowed in .pmsg files. Use 'type ${stmt.id.name} = Message<{ ... }>' instead.`,
      });
    }

    // Check for interface in export declaration
    if (
      t.isExportNamedDeclaration(stmt)
      && t.isTSInterfaceDeclaration(stmt.declaration)
    ) {
      ctx.diagnostics.push({
        filePath: ctx.filePath,
        location: getSourceLocation(stmt.declaration),
        severity: 'error',
        code: 'PMT010',
        message: `Interfaces are not allowed in .pmsg files. Use 'type ${stmt.declaration.id.name} = Message<{ ... }>' instead.`,
      });
    }
  }
}

/**
 * Check if a type node contains any intersection types.
 * Recursively checks nested types.
 */
export function containsIntersection(node: t.TSType): boolean {
  if (t.isTSIntersectionType(node)) {
    return true;
  }

  // Check union types
  if (t.isTSUnionType(node)) {
    return node.types.some(containsIntersection);
  }

  // Check parenthesized types
  if (t.isTSParenthesizedType(node)) {
    return containsIntersection(node.typeAnnotation);
  }

  // Check type references with type parameters
  if (t.isTSTypeReference(node) && node.typeParameters) {
    return node.typeParameters.params.some(containsIntersection);
  }

  // Check array types
  if (t.isTSArrayType(node)) {
    return containsIntersection(node.elementType);
  }

  // Check tuple types
  if (t.isTSTupleType(node)) {
    return node.elementTypes.some(elem => {
      if (t.isTSNamedTupleMember(elem)) {
        return containsIntersection(elem.elementType);
      }
      return containsIntersection(elem);
    });
  }

  // Check mapped types
  if (t.isTSMappedType(node) && node.typeAnnotation) {
    return containsIntersection(node.typeAnnotation);
  }

  // Check indexed access types
  if (t.isTSIndexedAccessType(node)) {
    return containsIntersection(node.objectType)
      || containsIntersection(node.indexType);
  }

  // Check conditional types
  if (t.isTSConditionalType(node)) {
    return (
      containsIntersection(node.checkType)
      || containsIntersection(node.extendsType)
      || containsIntersection(node.trueType)
      || containsIntersection(node.falseType)
    );
  }

  // Check function types
  if (t.isTSFunctionType(node) || t.isTSConstructorType(node)) {
    const hasIntersectionInParams = node.parameters.some(param => {
      if (
        t.isIdentifier(param)
        && param.typeAnnotation
        && t.isTSTypeAnnotation(param.typeAnnotation)
      ) {
        return containsIntersection(param.typeAnnotation.typeAnnotation);
      }
      return false;
    });
    if (hasIntersectionInParams) return true;
    if (node.typeAnnotation && t.isTSTypeAnnotation(node.typeAnnotation)) {
      return containsIntersection(node.typeAnnotation.typeAnnotation);
    }
  }

  // Check object literal types
  if (t.isTSTypeLiteral(node)) {
    return node.members.some(member => {
      if (
        t.isTSPropertySignature(member)
        && member.typeAnnotation
        && t.isTSTypeAnnotation(member.typeAnnotation)
      ) {
        return containsIntersection(member.typeAnnotation.typeAnnotation);
      }
      return false;
    });
  }

  return false;
}

/**
 * Validate that a type does not contain intersections.
 * PMT013: intersections are not allowed in .pmsg.
 */
export function validateNoIntersections(
  node: t.TSType,
  ctx: ValidationContext
): void {
  if (t.isTSIntersectionType(node)) {
    ctx.diagnostics.push({
      filePath: ctx.filePath,
      location: getSourceLocation(node),
      severity: 'error',
      code: 'PMT013',
      message: 'Intersection types (&) are not allowed in .pmsg files.',
    });
    return;
  }

  // Recursively check for nested intersections
  if (containsIntersection(node)) {
    ctx.diagnostics.push({
      filePath: ctx.filePath,
      location: getSourceLocation(node),
      severity: 'error',
      code: 'PMT013',
      message: 'Intersection types (&) are not allowed in .pmsg files (found in nested type).',
    });
  }
}

/**
 * Validate that object literal types must use Message<{...}> wrapper.
 * PMT012: Object literal types must be wrapped with Message<{...}>.
 */
export function validateObjectLiteralRequiresWrapper(
  node: t.TSType,
  isMessageWrapper: boolean,
  typeName: string,
  ctx: ValidationContext
): void {
  if (isMessageWrapper) {
    // Type is properly wrapped - valid
    return;
  }

  // Object literal types without Message<{...}> wrapper are not allowed
  if (t.isTSTypeLiteral(node)) {
    ctx.diagnostics.push({
      filePath: ctx.filePath,
      location: getSourceLocation(node),
      severity: 'error',
      code: 'PMT012',
      message: `Object literal types must use Message<{...}> wrapper in .pmsg files. Change type '${typeName}' to: export type ${typeName} = Message<{ ... }>;`,
    });
  }
}

/**
 * Check for common file-level issues.
 */
export function validateFileLevel(
  ast: t.File,
  ctx: ValidationContext
): void {
  // Check for class declarations (not allowed)
  for (const stmt of ast.program.body) {
    if (t.isClassDeclaration(stmt)) {
      ctx.diagnostics.push({
        filePath: ctx.filePath,
        location: getSourceLocation(stmt),
        severity: 'error',
        code: 'PMT015',
        message: `Class declarations are not allowed in .pmsg files.`,
      });
    }

    if (
      t.isExportNamedDeclaration(stmt)
      && stmt.declaration
      && t.isClassDeclaration(stmt.declaration)
    ) {
      ctx.diagnostics.push({
        filePath: ctx.filePath,
        location: getSourceLocation(stmt.declaration),
        severity: 'error',
        code: 'PMT015',
        message: `Class declarations are not allowed in .pmsg files.`,
      });
    }

    // Check for function declarations (allowed but warn if significant)
    // This is a soft validation - functions are allowed for utilities
  }
}
