/**
 * Property Parsing
 *
 * Parses properties from object literal types in .pmsg files.
 */

import * as t from '@babel/types';
import type { PmtProperty } from './types.js';
import { parseType, getSourceLocation, type TypeParserContext } from './type-parser.js';

/**
 * Pattern for numbered field names: "N:name"
 * N is a positive integer (1-based)
 * name is the logical property name
 */
const NUMBERED_FIELD_PATTERN = /^(\d+):(.+)$/;

/**
 * Reserved property names that cannot be used.
 */
const RESERVED_NAMES = new Set([
  'constructor',
  'prototype',
  '__proto__',
  'data',
  'toJSON',
  'serialize',
  'deserialize',
  'equals',
  'hashCode',
]);

/**
 * Parse properties from a TSTypeLiteral node.
 */
export function parseProperties(
  typeLiteral: t.TSTypeLiteral,
  ctx: TypeParserContext
): PmtProperty[] {
  const properties: PmtProperty[] = [];
  const fieldNumbers = new Map<number, string>(); // field number -> property name
  const propertyNames = new Map<string, t.TSPropertySignature>(); // name -> node (for duplicates)

  for (const member of typeLiteral.members) {
    // Only process property signatures
    if (!t.isTSPropertySignature(member)) {
      // Index signatures, method signatures, etc. are not allowed
      ctx.diagnostics.push({
        filePath: ctx.filePath,
        location: getSourceLocation(member),
        severity: 'error',
        code: 'PMT040',
        message: 'Only property signatures are allowed in message types.',
      });
      continue;
    }

    const property = parsePropertySignature(
      member, ctx, fieldNumbers, propertyNames
    );
    if (property) {
      properties.push(property);
    }
  }

  return properties;
}

/**
 * Parse a single property signature.
 */
function parsePropertySignature(
  member: t.TSPropertySignature,
  ctx: TypeParserContext,
  fieldNumbers: Map<number, string>,
  propertyNames: Map<string, t.TSPropertySignature>
): PmtProperty | null {
  const location = getSourceLocation(member);

  // Get property key
  let rawKey: string;
  if (t.isIdentifier(member.key)) {
    rawKey = member.key.name;
  } else if (t.isStringLiteral(member.key)) {
    rawKey = member.key.value;
  } else {
    ctx.diagnostics.push({
      filePath: ctx.filePath,
      location,
      severity: 'error',
      code: 'PMT041',
      message: 'Property keys must be identifiers or string literals.',
    });
    return null;
  }

  // Parse field number and name
  let fieldNumber: number | null = null;
  let name: string;

  const numberedMatch = NUMBERED_FIELD_PATTERN.exec(rawKey);
  if (numberedMatch) {
    fieldNumber = Number.parseInt(numberedMatch[1]!, 10);
    name = numberedMatch[2]!;

    // Validate field number
    if (fieldNumber < 1) {
      ctx.diagnostics.push({
        filePath: ctx.filePath,
        location,
        severity: 'error',
        code: 'PMT042',
        message: `Field number must be a positive integer (1 or greater), got ${fieldNumber}.`,
      });
    }

    // Check for duplicate field numbers
    const existingName = fieldNumbers.get(fieldNumber);
    if (existingName === undefined) {
      fieldNumbers.set(fieldNumber, name);
    } else {
      ctx.diagnostics.push({
        filePath: ctx.filePath,
        location,
        severity: 'error',
        code: 'PMT043',
        message: `Duplicate field number ${fieldNumber}. Already used by property '${existingName}'.`,
      });
    }
  } else {
    // Unnumbered field - use the key as the name
    name = rawKey;
  }

  // Validate property name
  if (!isValidPropertyName(name)) {
    ctx.diagnostics.push({
      filePath: ctx.filePath,
      location,
      severity: 'error',
      code: 'PMT044',
      message: `Invalid property name '${name}'. Property names must be valid JavaScript identifiers.`,
    });
  }

  // Check for reserved names
  if (RESERVED_NAMES.has(name)) {
    ctx.diagnostics.push({
      filePath: ctx.filePath,
      location,
      severity: 'error',
      code: 'PMT045',
      message: `Property name '${name}' is reserved and cannot be used.`,
    });
  }

  // Check for duplicate property names
  const existingNode = propertyNames.get(name);
  if (existingNode === undefined) {
    propertyNames.set(name, member);
  } else {
    ctx.diagnostics.push({
      filePath: ctx.filePath,
      location,
      severity: 'error',
      code: 'PMT046',
      message: `Duplicate property name '${name}'.`,
    });
  }

  // Get type annotation
  if (!member.typeAnnotation || !t.isTSTypeAnnotation(member.typeAnnotation)) {
    ctx.diagnostics.push({
      filePath: ctx.filePath,
      location,
      severity: 'error',
      code: 'PMT047',
      message: `Property '${name}' must have a type annotation.`,
    });
    return null;
  }

  const type = parseType(member.typeAnnotation.typeAnnotation, ctx);

  return {
    name,
    fieldNumber,
    optional: member.optional ?? false,
    readonly: member.readonly ?? false,
    type,
    location,
  };
}

/**
 * Check if a property name is a valid JavaScript identifier.
 */
function isValidPropertyName(name: string): boolean {
  if (name.length === 0) {
    return false;
  }

  // Must start with letter, underscore, or $
  const firstChar = name[0]!;
  if (!/[a-zA-Z_$]/.test(firstChar)) {
    return false;
  }

  // Rest must be alphanumeric, underscore, or $
  for (let i = 1; i < name.length; i++) {
    if (!/[a-zA-Z0-9_$]/.test(name[i]!)) {
      return false;
    }
  }

  return true;
}
