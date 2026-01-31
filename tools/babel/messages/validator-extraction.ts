/**
 * Validator Extraction
 *
 * Extracts validator information from field type annotations for code generation.
 */

import * as t from '@babel/types';
import type {
  TypeRegistry,
  ValidatorRegistration,
  BrandRegistration,
  TypeInfo,
} from '@/types/src/registry.js';
import {
  type ValidatorImportTracker,
  resolveValidatorReference,
  resolveBrandReference,
} from './validator-import-tracker.js';

/**
 * An extracted validator with all information needed for code generation.
 */
export interface ExtractedValidator {
  /** Validator registration from the registry */
  registration: ValidatorRegistration;
  /** Type parameters passed to the validator (e.g., [0, 100] for Range<number, 0, 100>) */
  params: unknown[];
  /** The inner type being validated (e.g., 'number' in Positive<number>) */
  innerType: TypeInfo;
}

/**
 * An extracted brand with all information needed for code generation.
 */
export interface ExtractedBrand {
  /** Brand registration from the registry */
  registration: BrandRegistration;
  /** Type parameters passed to the brand (e.g., [10, 2]) */
  params: unknown[];
}

/**
 * Extraction result for a field type.
 */
export interface FieldValidation {
  /** Validators applied to this field (may be empty) */
  validators: ExtractedValidator[];
  /** Brand applied to this field (if any) */
  brand: ExtractedBrand | null;
  /** Whether the field type is nullable (T | null or T | undefined) */
  nullable: boolean;
  /** Whether the field type is a union that needs runtime discrimination */
  isDiscriminatedUnion: boolean;
  /** Union branches with their validators (for discriminated unions) */
  unionBranches: UnionBranch[];
}

/**
 * A branch of a validated union type.
 */
export interface UnionBranch {
  /** Type guard key for runtime discrimination (e.g., 'number', 'string') */
  guardKey: string;
  /** Type guard expression (e.g., "typeof value === 'number'") */
  typeGuard: string;
  /** Validators for this branch */
  validators: ExtractedValidator[];
}

/**
 * Extract validators and brands from a field type annotation.
 *
 * @param typeNode - The type annotation node
 * @param tracker - Import tracker for resolving type references
 * @param registry - Type registry for validator definitions
 * @returns Extraction result with validators and metadata
 */
export function extractFieldValidation(
  typeNode: t.TSType,
  tracker: ValidatorImportTracker,
  registry: TypeRegistry | undefined
): FieldValidation {
  const result: FieldValidation = {
    validators: [],
    brand: null,
    nullable: false,
    isDiscriminatedUnion: false,
    unionBranches: [],
  };

  // Handle union types first
  if (t.isTSUnionType(typeNode)) {
    return extractUnionValidation(typeNode, tracker, registry);
  }

  // Handle non-union types
  extractSingleTypeValidation(typeNode, tracker, registry, result);

  return result;
}

/**
 * Extract validation from a single (non-union) type.
 */
function extractSingleTypeValidation(
  typeNode: t.TSType,
  tracker: ValidatorImportTracker,
  registry: TypeRegistry | undefined,
  result: FieldValidation
): void {
  // Check for validator wrapper (e.g., Positive<number>)
  if (t.isTSTypeReference(typeNode)) {
    const validatorReg = resolveValidatorReference(
      typeNode.typeName,
      tracker,
      registry
    );

    if (validatorReg) {
      // Check for unsupported Check validator
      if (validatorReg.name === 'Check') {
        throw new Error(
          'Check<T, fn> custom validators are not yet supported. ' +
          'Custom validation will be available in Phase 2.'
        );
      }

      const extracted = extractValidatorFromTypeRef(typeNode, validatorReg);
      if (extracted) {
        result.validators.push(extracted);

        // Check if the inner type is also a validator (nested)
        const innerType = typeNode.typeParameters?.params[0];
        if (innerType && t.isTSTypeReference(innerType)) {
          // Check for nested validator - this is an error
          const nestedValidatorReg = resolveValidatorReference(
            innerType.typeName,
            tracker,
            registry
          );
          if (nestedValidatorReg) {
            const validatorName = getTypeName(typeNode.typeName);
            const nestedName = getTypeName(innerType.typeName);
            throw new Error(
              `Validators cannot be nested. Found: ${validatorName}<${nestedName}<...>>. ` +
              `Use a single validator wrapper, e.g., ${validatorName}<number>.`
            );
          }

          // Not a validator - extract from inner type
          extractSingleTypeValidation(innerType, tracker, registry, result);
        } else if (innerType) {
          // Non-reference inner type (e.g., number, string)
          extractSingleTypeValidation(innerType, tracker, registry, result);
        }
      }
      return;
    }

    // Check for brand type (e.g., int32, int53)
    const brandReg = resolveBrandReference(typeNode.typeName, tracker, registry);
    if (brandReg) {
      result.brand = extractBrandFromTypeRef(typeNode, brandReg);
      return;
    }
  }
}

/**
 * Get the name of a type reference.
 */
function getTypeName(typeName: t.Identifier | t.TSQualifiedName): string {
  if (t.isIdentifier(typeName)) {
    return typeName.name;
  }
  // TSQualifiedName (e.g., Namespace.Type)
  if (t.isIdentifier(typeName.right)) {
    return typeName.right.name;
  }
  return 'unknown';
}

/**
 * Extract validation from a union type.
 */
function extractUnionValidation(
  unionNode: t.TSUnionType,
  tracker: ValidatorImportTracker,
  registry: TypeRegistry | undefined
): FieldValidation {
  const result: FieldValidation = {
    validators: [],
    brand: null,
    nullable: false,
    isDiscriminatedUnion: false,
    unionBranches: [],
  };

  // Separate nullable types from actual union members
  const members: t.TSType[] = [];
  for (const member of unionNode.types) {
    if (t.isTSNullKeyword(member) || t.isTSUndefinedKeyword(member)) {
      result.nullable = true;
    } else {
      members.push(member);
    }
  }

  // If only one non-null member, extract it directly
  if (members.length === 1) {
    extractSingleTypeValidation(members[0]!, tracker, registry, result);
    return result;
  }

  // Multiple non-null members - this is a discriminated union
  result.isDiscriminatedUnion = true;

  // Extract validators for each branch
  for (const member of members) {
    const branch = extractUnionBranch(member, tracker, registry);
    if (branch) {
      result.unionBranches.push(branch);
    }
  }

  // Check for validators on union branches - not yet supported
  const branchesWithValidators = result.unionBranches.filter(b => b.validators.length > 0);
  if (branchesWithValidators.length > 0) {
    throw new Error(
      'Validators on union types are not yet supported. ' +
      'This feature will be available in Phase 1B. ' +
      'Consider using separate validated types or validating after type narrowing.'
    );
  }

  return result;
}

/**
 * Extract a union branch with its validators and type guard.
 */
function extractUnionBranch(
  typeNode: t.TSType,
  tracker: ValidatorImportTracker,
  registry: TypeRegistry | undefined
): UnionBranch | null {
  const branchResult: FieldValidation = {
    validators: [],
    brand: null,
    nullable: false,
    isDiscriminatedUnion: false,
    unionBranches: [],
  };

  // Unwrap validators to find the base type
  let baseType = typeNode;
  while (t.isTSTypeReference(baseType)) {
    const validatorReg = resolveValidatorReference(
      baseType.typeName,
      tracker,
      registry
    );

    if (validatorReg) {
      const extracted = extractValidatorFromTypeRef(baseType, validatorReg);
      if (extracted) {
        branchResult.validators.push(extracted);
      }
      // Move to inner type
      baseType = baseType.typeParameters?.params[0] ?? baseType;
    } else {
      break;
    }
  }

  // Determine guard key and type guard from base type
  const { guardKey, typeGuard } = generateTypeGuard(baseType);

  return {
    guardKey,
    typeGuard,
    validators: branchResult.validators,
  };
}

/**
 * Extract validator info from a type reference.
 */
function extractValidatorFromTypeRef(
  typeRef: t.TSTypeReference,
  registration: ValidatorRegistration
): ExtractedValidator | null {
  const params = extractTypeParams(typeRef);
  const innerType = extractInnerType(typeRef);

  // Compile-time validation for type compatibility
  validateValidatorTypeCompatibility(registration.name, innerType);

  // Compile-time validation for bounds
  validateValidatorParams(registration.name, params);

  // Normalize Decimal bounds if applicable
  const normalizedParams = normalizeDecimalBounds(registration.name, params, innerType);

  return {
    registration,
    params: normalizedParams,
    innerType,
  };
}

/**
 * Validate that a validator is compatible with its inner type.
 * Throws descriptive errors for type mismatches.
 */
function validateValidatorTypeCompatibility(validatorName: string, innerType: TypeInfo): void {
  // Numeric validators: Positive, Negative, NonNegative, NonPositive, Min, Max, GreaterThan, LessThan, Range
  const numericValidators = [
    'Positive', 'Negative', 'NonNegative', 'NonPositive',
    'Min', 'Max', 'GreaterThan', 'LessThan', 'Range'
  ];

  // String validators: NonEmpty, Matches, MinLength, MaxLength, Length, MinCharLength, MaxCharLength, CharLength
  const stringValidators = [
    'NonEmpty', 'Matches', 'MinLength', 'MaxLength', 'Length',
    'MinCharLength', 'MaxCharLength', 'CharLength'
  ];

  // Array validators: NonEmpty (also applies), MinLength, MaxLength, Length (also apply)
  const arrayValidators = ['MinLength', 'MaxLength', 'Length'];

  // Skip check for unknown types - TypeScript will catch type errors at usage sites
  if (innerType.kind === 'unknown') {
    return;
  }

  if (numericValidators.includes(validatorName)) {
    const validNumericTypes = ['number', 'bigint', 'Decimal', 'Rational'];
    if (!validNumericTypes.includes(innerType.kind)) {
      throw new Error(
        `Type mismatch: ${validatorName}<T> requires a numeric type (number, bigint, Decimal, or Rational). ` +
        `Found: ${validatorName}<${innerType.kind}>.`
      );
    }
  }

  if (stringValidators.includes(validatorName) && !arrayValidators.includes(validatorName)) {
    // Pure string validators (NonEmpty for strings, Matches, CharLength variants)
    if (validatorName === 'Matches' || validatorName.includes('Char')) {
      if (innerType.kind !== 'string') {
        throw new Error(
          `Type mismatch: ${validatorName}<T> requires a string type. ` +
          `Found: ${validatorName}<${innerType.kind}>.`
        );
      }
    }
  }

  // NonEmpty works with both string and array
  if (validatorName === 'NonEmpty') {
    if (innerType.kind !== 'string' && innerType.kind !== 'array') {
      throw new Error(
        `Type mismatch: NonEmpty<T> requires a string or array type. ` +
        `Found: NonEmpty<${innerType.kind}>.`
      );
    }
  }

  // Length validators work with both string and array
  if (['MinLength', 'MaxLength', 'Length'].includes(validatorName)) {
    if (innerType.kind !== 'string' && innerType.kind !== 'array') {
      throw new Error(
        `Type mismatch: ${validatorName}<T> requires a string or array type. ` +
        `Found: ${validatorName}<${innerType.kind}>.`
      );
    }
  }
}

/**
 * Validate validator parameters at compile time.
 * Throws descriptive errors for invalid configurations.
 */
function validateValidatorParams(validatorName: string, params: unknown[]): void {
  switch (validatorName) {
    case 'Range':
      // Range<T, min, max> - check min <= max
      if (params.length >= 2) {
        const min = params[0];
        const max = params[1];
        if (typeof min === 'number' && typeof max === 'number') {
          if (min > max) {
            throw new Error(
              `Invalid Range bounds: min (${min}) must be <= max (${max}). ` +
              `Use Range<T, ${max}, ${min}> to swap the order.`
            );
          }
        } else if (typeof min === 'bigint' && typeof max === 'bigint') {
          if (min > max) {
            throw new Error(
              `Invalid Range bounds: min (${min}n) must be <= max (${max}n).`
            );
          }
        }
      }
      break;

    case 'Length':
      // Length<T, min, max> - check min >= 0 and min <= max
      if (params.length >= 2) {
        const min = params[0];
        const max = params[1];
        if (typeof min === 'number' && typeof max === 'number') {
          if (min < 0) {
            throw new Error(
              `Invalid Length bounds: min (${min}) must be >= 0.`
            );
          }
          if (min > max) {
            throw new Error(
              `Invalid Length bounds: min (${min}) must be <= max (${max}).`
            );
          }
        }
      }
      break;

    case 'MinLength':
    case 'MinCharLength':
      // MinLength<T, n> - check n >= 0
      if (params.length >= 1) {
        const n = params[0];
        if (typeof n === 'number' && n < 0) {
          throw new Error(
            `Invalid ${validatorName} bound: ${n} must be >= 0.`
          );
        }
      }
      break;

    case 'CharLength':
      // CharLength<T, min, max> - check min >= 0 and min <= max
      if (params.length >= 2) {
        const min = params[0];
        const max = params[1];
        if (typeof min === 'number' && typeof max === 'number') {
          if (min < 0) {
            throw new Error(
              `Invalid CharLength bounds: min (${min}) must be >= 0.`
            );
          }
          if (min > max) {
            throw new Error(
              `Invalid CharLength bounds: min (${min}) must be <= max (${max}).`
            );
          }
        }
      }
      break;
  }
}

/**
 * Normalize Decimal bounds at compile time.
 *
 * For validators on Decimal types (Min, Max, Range, etc.), this normalizes
 * string bounds to match the Decimal's scale. For example, "100" becomes
 * "100.00" for Decimal<10,2>.
 *
 * @param validatorName - The validator name (e.g., 'Min', 'Max', 'Range')
 * @param params - The validator parameters (bounds)
 * @param innerType - The inner type info (includes precision/scale for Decimal)
 * @returns The params array with normalized Decimal bounds
 */
function parseStrictDecimal(
  raw: string,
  context: string
): { sign: -1 | 1; digits: string; scale: number } {
  if (/\s/.test(raw)) {
    throw new SyntaxError(`Invalid ${context} format: whitespace not allowed`);
  }
  if (raw.length === 0) {
    throw new SyntaxError(`Invalid ${context} format: empty string`);
  }

  let input = raw;
  let sign: -1 | 1 = 1;
  if (input[0] === '+' || input[0] === '-') {
    if (input[0] === '-') sign = -1;
    input = input.slice(1);
  }

  if (input.length === 0) {
    throw new SyntaxError(`Invalid ${context} format: missing digits`);
  }

  const dotIndex = input.indexOf('.');
  let intPart = input;
  let fracPart = '';
  if (dotIndex !== -1) {
    intPart = input.slice(0, dotIndex);
    fracPart = input.slice(dotIndex + 1);
    if (intPart.length === 0 || fracPart.length === 0) {
      throw new SyntaxError(`Invalid ${context} format: invalid decimal point`);
    }
  }

  if (!/^\d+$/.test(intPart) || (fracPart && !/^\d+$/.test(fracPart))) {
    throw new SyntaxError(`Invalid ${context} digits: ${raw}`);
  }

  const rawDigits = `${intPart}${fracPart}`;
  const digits = rawDigits.replace(/^0+(?=\d)/, '');
  return {
    sign,
    digits: digits.length === 0 ? '0' : digits,
    scale: fracPart.length,
  };
}

function normalizeDecimalBoundString(
  precision: number,
  scale: number,
  value: string
): string {
  const parsed = parseStrictDecimal(value, 'decimal bound');
  let digits = parsed.digits;
  const scaleDiff = parsed.scale - scale;

  if (scaleDiff > 0) {
    const cutIndex = digits.length - scaleDiff;
    const dropped = cutIndex > 0 ? digits.slice(cutIndex) : digits;
    if (/[1-9]/.test(dropped)) {
      throw new RangeError(
        `Value is not exactly representable at scale ${scale}`
      );
    }
    digits = cutIndex > 0 ? digits.slice(0, cutIndex) : '0';
  } else if (scaleDiff < 0) {
    digits = `${digits}${'0'.repeat(-scaleDiff)}`;
  }

  const normalizedDigits = digits.replace(/^0+(?=\d)/, '');
  if (normalizedDigits.length > precision) {
    throw new RangeError(
      `Value has ${normalizedDigits.length} digits, exceeds precision ${precision}`
    );
  }

  const signPrefix = parsed.sign < 0 && normalizedDigits !== '0' ? '-' : '';

  if (scale <= 0) {
    return `${signPrefix}${normalizedDigits}${'0'.repeat(-scale)}`;
  }

  const padded = normalizedDigits.padStart(scale + 1, '0');
  const intPart = padded.slice(0, -scale) || '0';
  const fracPart = padded.slice(-scale);
  return `${signPrefix}${intPart}.${fracPart}`;
}

function normalizeDecimalBounds(
  validatorName: string,
  params: unknown[],
  innerType: TypeInfo
): unknown[] {
  // Only apply to Decimal types with known precision and scale
  if (innerType.kind !== 'Decimal' || innerType.scale === undefined) {
    return params;
  }

  const { precision, scale } = innerType;

  // Validators that have numeric bounds
  const boundValidators = ['Min', 'Max', 'GreaterThan', 'LessThan', 'Range'];
  if (!boundValidators.includes(validatorName)) {
    return params;
  }

  // Normalize each string bound in params
  return params.map((param, index) => {
    if (typeof param !== 'string') {
      return param; // Only normalize string bounds
    }

    if (precision === undefined || scale === undefined) {
      throw new Error(
        `Decimal bounds require precision and scale for ${validatorName}.`
      );
    }

    try {
      return normalizeDecimalBoundString(precision, scale, param);
    } catch (err) {
      const suffix = err instanceof Error ? ` (${err.message})` : '';
      throw new Error(
        `Invalid decimal bound '${param}' in ${validatorName} at index ${index}.${suffix}`
      );
    }
  });
}

/**
 * Extract brand info from a type reference.
 */
function extractBrandFromTypeRef(
  typeRef: t.TSTypeReference,
  registration: BrandRegistration
): ExtractedBrand {
  // Brands use ALL type parameters as data (unlike validators which skip the first)
  const params = extractBrandTypeParams(typeRef);
  return { registration, params };
}

/**
 * Extract ALL type parameters from a brand type reference.
 * Unlike validators, brands use all params as data.
 */
function extractBrandTypeParams(typeRef: t.TSTypeReference): unknown[] {
  if (!typeRef.typeParameters?.params) {
    return [];
  }

  const params: unknown[] = [];
  for (const param of typeRef.typeParameters.params) {
    params.push(extractLiteralValue(param));
  }
  return params;
}

/**
 * Extract type parameters from a type reference.
 * Converts TypeScript literal nodes to JavaScript values.
 */
function extractTypeParams(typeRef: t.TSTypeReference): unknown[] {
  if (!typeRef.typeParameters?.params) {
    return [];
  }

  // Skip the first parameter (the inner type) for validators
  // e.g., Range<number, 0, 100> → skip 'number', return [0, 100]
  const params: unknown[] = [];
  const allParams = typeRef.typeParameters.params;

  for (let i = 1; i < allParams.length; i++) {
    const param = allParams[i]!;
    params.push(extractLiteralValue(param));
  }

  return params;
}

/**
 * Extract a literal value from a type node.
 */
function extractLiteralValue(node: t.TSType): unknown {
  if (t.isTSLiteralType(node)) {
    const literal = node.literal;
    if (t.isNumericLiteral(literal)) {
      return literal.value;
    }
    if (t.isStringLiteral(literal)) {
      return literal.value;
    }
    if (t.isBigIntLiteral(literal)) {
      return BigInt(literal.value);
    }
    if (t.isBooleanLiteral(literal)) {
      return literal.value;
    }
    if (t.isUnaryExpression(literal) && literal.operator === '-') {
      if (t.isNumericLiteral(literal.argument)) {
        return -literal.argument.value;
      }
      if (t.isBigIntLiteral(literal.argument)) {
        return -BigInt(literal.argument.value);
      }
    }
  }

  // For non-literal types, return a placeholder
  return undefined;
}

/**
 * Extract the inner type from a validator type reference.
 */
function extractInnerType(typeRef: t.TSTypeReference): TypeInfo {
  const innerTypeNode = typeRef.typeParameters?.params[0];
  if (!innerTypeNode) {
    return { kind: 'unknown' };
  }

  return inferTypeInfo(innerTypeNode);
}

/**
 * Infer TypeInfo from a type node.
 */
function inferTypeInfo(node: t.TSType): TypeInfo {
  if (t.isTSNumberKeyword(node)) {
    return { kind: 'number' };
  }
  if (t.isTSBigIntKeyword(node)) {
    return { kind: 'bigint' };
  }
  if (t.isTSStringKeyword(node)) {
    return { kind: 'string' };
  }
  if (t.isTSArrayType(node) || t.isTupleTypeAnnotation(node)) {
    return { kind: 'array' };
  }
  if (t.isTSTypeReference(node)) {
    // Check for known types
    if (t.isIdentifier(node.typeName)) {
      const name = node.typeName.name;
      if (name === 'Decimal') {
        // Extract precision and scale from Decimal<P, S>
        const typeParams = node.typeParameters?.params;
        let precision: number | undefined;
        let scale: number | undefined;
        if (typeParams && typeParams.length >= 2) {
          const precisionNode = typeParams[0];
          const scaleNode = typeParams[1];
          if (t.isTSLiteralType(precisionNode) && t.isNumericLiteral(precisionNode.literal)) {
            precision = precisionNode.literal.value;
          }
          if (t.isTSLiteralType(scaleNode) && t.isNumericLiteral(scaleNode.literal)) {
            scale = scaleNode.literal.value;
          }
        }
        return { kind: 'Decimal', precision, scale };
      }
      if (name === 'Rational') {
        return { kind: 'Rational' };
      }
      if (name.toLowerCase() === 'array') {
        return { kind: 'array' };
      }
    }
  }
  if (t.isTSUnionType(node)) {
    // For unions, check if all members are the same kind
    const memberKinds = new Set(node.types.map((t) => inferTypeInfo(t).kind));
    // Remove null/undefined from consideration
    memberKinds.delete('unknown');
    if (memberKinds.size === 1) {
      return { kind: [...memberKinds][0]! };
    }
  }

  return { kind: 'unknown' };
}

/**
 * Generate type guard information for a type.
 */
function generateTypeGuard(node: t.TSType): { guardKey: string; typeGuard: string } {
  if (t.isTSNumberKeyword(node)) {
    return {
      guardKey: 'number',
      typeGuard: "typeof value === 'number'",
    };
  }
  if (t.isTSBigIntKeyword(node)) {
    return {
      guardKey: 'bigint',
      typeGuard: "typeof value === 'bigint'",
    };
  }
  if (t.isTSStringKeyword(node)) {
    return {
      guardKey: 'string',
      typeGuard: "typeof value === 'string'",
    };
  }
  if (t.isTSBooleanKeyword(node)) {
    return {
      guardKey: 'boolean',
      typeGuard: "typeof value === 'boolean'",
    };
  }
  if (t.isTSArrayType(node) || t.isTupleTypeAnnotation(node)) {
    return {
      guardKey: 'array',
      typeGuard: 'Array.isArray(value)',
    };
  }
  if (t.isTSTypeReference(node)) {
    // For type references, check if it's a known class or branded type
    if (t.isIdentifier(node.typeName)) {
      const name = node.typeName.name;
      if (name === 'Decimal') {
        const typeParams = node.typeParameters?.params;
        let precision: number | undefined;
        let scale: number | undefined;
        if (typeParams && typeParams.length >= 2) {
          const precisionNode = typeParams[0];
          const scaleNode = typeParams[1];
          if (t.isTSLiteralType(precisionNode) && t.isNumericLiteral(precisionNode.literal)) {
            precision = precisionNode.literal.value;
          }
          if (t.isTSLiteralType(scaleNode) && t.isNumericLiteral(scaleNode.literal)) {
            scale = scaleNode.literal.value;
          }
        }
        const baseGuard = 'Decimal.isInstance(value)';
        if (precision !== undefined && scale !== undefined) {
          return {
            guardKey: 'Decimal',
            typeGuard: `${baseGuard} && value.precision === ${precision} && value.scale === ${scale}`,
          };
        }
        return { guardKey: 'Decimal', typeGuard: baseGuard };
      }
      if (name === 'Rational') {
        return { guardKey: 'Rational', typeGuard: 'Rational.isInstance(value)' };
      }
    }
    // Default for class types: instanceof check
    return {
      guardKey: 'object',
      typeGuard: "typeof value === 'object' && value !== null",
    };
  }
  if (t.isTSLiteralType(node)) {
    // For literal types, use typeof of the underlying type
    const literal = node.literal;
    if (t.isNumericLiteral(literal)) {
      return {
        guardKey: 'number',
        typeGuard: "typeof value === 'number'",
      };
    }
    if (t.isStringLiteral(literal)) {
      return {
        guardKey: 'string',
        typeGuard: "typeof value === 'string'",
      };
    }
    if (t.isBooleanLiteral(literal)) {
      return {
        guardKey: 'boolean',
        typeGuard: "typeof value === 'boolean'",
      };
    }
    if (t.isBigIntLiteral(literal)) {
      return {
        guardKey: 'bigint',
        typeGuard: "typeof value === 'bigint'",
      };
    }
  }

  return {
    guardKey: 'unknown',
    typeGuard: 'true /* unknown type */',
  };
}

/**
 * Detect conflicts in union branch validators.
 * Returns an error message if conflicts are found, null otherwise.
 */
export function detectUnionConflicts(
  branches: UnionBranch[]
): string | null {
  // Group branches by guard key
  const byGuardKey = new Map<string, UnionBranch[]>();
  for (const branch of branches) {
    const existing = byGuardKey.get(branch.guardKey) ?? [];
    existing.push(branch);
    byGuardKey.set(branch.guardKey, existing);
  }

  // Check each group for conflicts
  for (const [guardKey, group] of byGuardKey) {
    if (group.length <= 1) continue;

    // Multiple branches with the same guard key
    const hasValidated = group.some((b) => b.validators.length > 0);
    const hasUnvalidated = group.some((b) => b.validators.length === 0);

    // Check for validator + unvalidated conflict
    if (hasValidated && hasUnvalidated) {
      return (
        `Cannot mix validated and unvalidated '${guardKey}' types in the same union.\n` +
        `Either apply validators to all '${guardKey}' branches or none.`
      );
    }

    // Check for multiple validators with same guard key
    if (hasValidated && group.length > 1) {
      // Get validator signatures for comparison
      const signatures = group.map((b) => {
        return b.validators
          .map((v) => `${v.registration.package}:${v.registration.name}(${JSON.stringify(v.params)})`)
          .join(',');
      });

      // Check if any signatures differ
      const uniqueSignatures = new Set(signatures);
      if (uniqueSignatures.size > 1) {
        return (
          `Multiple different validators for '${guardKey}' type in union.\n` +
          `Each runtime-discriminable type can have at most one validator.`
        );
      }
    }
  }

  return null;
}
