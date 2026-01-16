/**
 * Validation Code Generation
 *
 * Generates JavaScript validation code from extracted validators.
 */

import * as t from '@babel/types';
import type { ValidatorDefinition, ImportCollector } from '@/types/src/registry.js';
import type {
  FieldValidation,
  ExtractedValidator,
  ExtractedBrand,
  UnionBranch,
} from './validator-extraction.js';

/**
 * Generated validation code for a field.
 */
export interface FieldValidationCode {
  /** The validation statements to execute */
  statements: t.Statement[];
  /** Required imports for the validation code */
  imports: Map<string, Set<string>>; // package → set of import names
}

/**
 * Context for generating validation code.
 */
export interface ValidationCodegenContext {
  /** Name of the field being validated */
  fieldName: string;
  /** Expression to access the value (e.g., "data.foo", "value") */
  valueExpr: string;
  /** Whether to generate dev-only unexpected type checks */
  devMode?: boolean;
}

/**
 * Import collector implementation for validation code generation.
 */
class ValidationImportCollector implements ImportCollector {
  readonly imports = new Map<string, Set<string>>();

  add(name: string, from: string): void {
    if (!this.imports.has(from)) {
      this.imports.set(from, new Set());
    }
    this.imports.get(from)!.add(name);
  }
}

/**
 * Generate validation code for a field.
 *
 * @param validation - The extracted validation information
 * @param ctx - Code generation context
 * @returns Generated validation code and required imports
 */
export function generateFieldValidation(
  validation: FieldValidation,
  ctx: ValidationCodegenContext
): FieldValidationCode {
  const imports = new ValidationImportCollector();
  const statements: t.Statement[] = [];

  // Skip validation if field has no validators or brands
  if (
    validation.validators.length === 0 &&
    !validation.brand &&
    validation.unionBranches.length === 0
  ) {
    return { statements, imports: imports.imports };
  }

  // Handle nullable fields - wrap validation in null check
  if (validation.nullable) {
    const innerStatements = generateNonNullableValidation(
      validation,
      ctx,
      imports
    );

    if (innerStatements.length > 0) {
      // if (value != null) { ... validation ... }
      statements.push(
        t.ifStatement(
          t.binaryExpression(
            '!=',
            t.identifier(ctx.valueExpr),
            t.nullLiteral()
          ),
          t.blockStatement(innerStatements)
        )
      );
    }
  } else {
    statements.push(
      ...generateNonNullableValidation(validation, ctx, imports)
    );
  }

  return { statements, imports: imports.imports };
}

/**
 * Generate validation code assuming the value is not null/undefined.
 */
function generateNonNullableValidation(
  validation: FieldValidation,
  ctx: ValidationCodegenContext,
  imports: ValidationImportCollector
): t.Statement[] {
  const statements: t.Statement[] = [];

  // Handle discriminated unions
  if (validation.isDiscriminatedUnion && validation.unionBranches.length > 0) {
    statements.push(
      ...generateUnionValidation(validation.unionBranches, ctx, imports)
    );
    return statements;
  }

  // Handle simple validators
  for (const validator of validation.validators) {
    const validatorStatements = generateValidatorCheck(
      validator,
      ctx.fieldName,
      ctx.valueExpr,
      imports
    );
    statements.push(...validatorStatements);
  }

  // Handle brand validation
  if (validation.brand) {
    const brandStatements = generateBrandCheck(
      validation.brand,
      ctx.fieldName,
      ctx.valueExpr,
      imports
    );
    statements.push(...brandStatements);
  }

  return statements;
}

/**
 * Generate validation code for a discriminated union.
 */
function generateUnionValidation(
  branches: UnionBranch[],
  ctx: ValidationCodegenContext,
  imports: ValidationImportCollector
): t.Statement[] {
  const statements: t.Statement[] = [];

  // Build if-else chain for type guards
  let currentIf: t.IfStatement | null = null;
  let firstIf: t.IfStatement | null = null;

  for (const branch of branches) {
    if (branch.typeGuard.includes('Decimal.')) {
      imports.add('Decimal', '@propane/runtime');
    }
    if (branch.typeGuard.includes('Rational.')) {
      imports.add('Rational', '@propane/runtime');
    }
    // Build condition from type guard
    const condition = parseTypeGuard(branch.typeGuard, ctx.valueExpr);

    // Build branch body with validators
    const branchBody: t.Statement[] = [];
    for (const validator of branch.validators) {
      const validatorStatements = generateValidatorCheck(
        validator,
        ctx.fieldName,
        ctx.valueExpr,
        imports
      );
      branchBody.push(...validatorStatements);
    }

    // If branch has no validators, add a comment-only pass-through
    if (branchBody.length === 0) {
      branchBody.push(
        t.expressionStatement(
          t.identifier('/* pass-through: no validation */')
        )
      );
    }

    const ifStmt = t.ifStatement(condition, t.blockStatement(branchBody));

    if (!firstIf) {
      firstIf = ifStmt;
      currentIf = ifStmt;
    } else if (currentIf) {
      currentIf.alternate = ifStmt;
      currentIf = ifStmt;
    }
  }

  // Add dev-only unexpected type check
  if (ctx.devMode && currentIf) {
    imports.add('ValidationError', '@propane/runtime');
    currentIf.alternate = t.ifStatement(
      // typeof process !== 'undefined' && process.env?.NODE_ENV !== 'production'
      t.logicalExpression(
        '&&',
        t.binaryExpression(
          '!==',
          t.unaryExpression('typeof', t.identifier('process')),
          t.stringLiteral('undefined')
        ),
        t.binaryExpression(
          '!==',
          t.optionalMemberExpression(
            t.memberExpression(t.identifier('process'), t.identifier('env')),
            t.identifier('NODE_ENV'),
            false,
            true
          ),
          t.stringLiteral('production')
        )
      ),
      t.blockStatement([
        t.throwStatement(
          t.newExpression(t.identifier('ValidationError'), [
            t.stringLiteral(ctx.fieldName),
            t.stringLiteral('unexpected type'),
            t.identifier(ctx.valueExpr),
            t.stringLiteral('UNEXPECTED_TYPE'),
          ])
        ),
      ])
    );
  }

  if (firstIf) {
    statements.push(firstIf);
  }

  return statements;
}

/**
 * Generate a single validator check.
 */
function generateValidatorCheck(
  validator: ExtractedValidator,
  fieldName: string,
  valueExpr: string,
  imports: ValidationImportCollector
): t.Statement[] {
  const definition = validator.registration.definition;

  // Generate the condition
  const result = definition.generateJs({
    valueExpr,
    type: validator.innerType,
    params: validator.params,
    imports,
  });

  // If validator returns null, no validation needed
  if (!result) {
    return [];
  }

  // Generate error message
  const message = definition.generateMessage({
    params: validator.params,
    customMessage: undefined,
  });

  // Generate error code
  const code = definition.generateCode?.() ?? definition.name.toUpperCase();

  // Import ValidationError
  imports.add('ValidationError', '@propane/runtime');

  // Generate: if (!(condition)) throw new ValidationError(...)
  return [
    t.ifStatement(
      t.unaryExpression('!', t.parenthesizedExpression(parseCondition(result.condition))),
      t.blockStatement([
        t.throwStatement(
          t.newExpression(t.identifier('ValidationError'), [
            t.stringLiteral(fieldName),
            t.stringLiteral(message),
            t.identifier(valueExpr),
            t.stringLiteral(code),
          ])
        ),
      ])
    ),
  ];
}

/**
 * Generate brand validation check.
 */
function generateBrandCheck(
  brand: ExtractedBrand,
  fieldName: string,
  valueExpr: string,
  imports: ValidationImportCollector
): t.Statement[] {
  const definition = brand.registration.definition;

  // Check if brand has validation
  if (!definition.generateJs) {
    return [];
  }

  // Generate the condition
  const result = definition.generateJs({
    valueExpr,
    params: brand.params,
    imports,
  });

  // If brand returns null, no validation needed
  if (!result) {
    return [];
  }

  // Generate error message
  const message = definition.generateMessage?.({ params: brand.params }) ?? 'invalid brand value';

  // Generate error code (use brand-specific code or default to uppercased brand name)
  const code = definition.generateCode?.() ?? brand.registration.name.toUpperCase();

  // Import ValidationError
  imports.add('ValidationError', '@propane/runtime');

  // Generate: if (!(condition)) throw new ValidationError(...)
  return [
    t.ifStatement(
      t.unaryExpression('!', t.parenthesizedExpression(parseCondition(result.condition))),
      t.blockStatement([
        t.throwStatement(
          t.newExpression(t.identifier('ValidationError'), [
            t.stringLiteral(fieldName),
            t.stringLiteral(message),
            t.identifier(valueExpr),
            t.stringLiteral(code),
          ])
        ),
      ])
    ),
  ];
}

/**
 * Parse a condition string into an AST expression.
 * This is a simplified parser for the condition expressions generated by validators.
 */
function parseCondition(condition: string): t.Expression {
  // For now, use the condition as a raw identifier
  // In production, this should properly parse the expression
  // or validators should return AST nodes directly
  return t.identifier(condition);
}

/**
 * Parse a type guard string into an AST expression.
 */
function parseTypeGuard(guard: string, valueExpr: string): t.Expression {
  // Replace 'value' with the actual value expression
  const adjustedGuard = guard.replace(/\bvalue\b/g, valueExpr);

  if (adjustedGuard.includes('&&')) {
    const parts = adjustedGuard.split('&&').map((part) => part.trim()).filter(Boolean);
    if (parts.length > 0) {
      let expr = parseTypeGuard(parts[0]!, valueExpr);
      for (let i = 1; i < parts.length; i += 1) {
        expr = t.logicalExpression('&&', expr, parseTypeGuard(parts[i]!, valueExpr));
      }
      return expr;
    }
  }

  // Parse common patterns
  if (adjustedGuard.startsWith("typeof ")) {
    const match = adjustedGuard.match(/typeof (\w+) === '(\w+)'/);
    if (match) {
      return t.binaryExpression(
        '===',
        t.unaryExpression('typeof', t.identifier(match[1]!)),
        t.stringLiteral(match[2]!)
      );
    }
  }

  if (adjustedGuard.startsWith('Array.isArray(')) {
    const match = adjustedGuard.match(/Array\.isArray\((\w+)\)/);
    if (match) {
      return t.callExpression(
        t.memberExpression(t.identifier('Array'), t.identifier('isArray')),
        [t.identifier(match[1]!)]
      );
    }
  }

  if (adjustedGuard.includes(' instanceof ')) {
    const match = adjustedGuard.match(/(\w+) instanceof (\w+)/);
    if (match) {
      return t.binaryExpression(
        'instanceof',
        t.identifier(match[1]!),
        t.identifier(match[2]!)
      );
    }
  }

  const callMatch = adjustedGuard.match(/^(\w+)\.(\w+)\((\w+)\)$/);
  if (callMatch) {
    return t.callExpression(
      t.memberExpression(t.identifier(callMatch[1]!), t.identifier(callMatch[2]!)),
      [t.identifier(callMatch[3]!)]
    );
  }

  const eqMatch = adjustedGuard.match(/^(\w+)\.(\w+)\s*===\s*(-?\d+)$/);
  if (eqMatch) {
    return t.binaryExpression(
      '===',
      t.memberExpression(t.identifier(eqMatch[1]!), t.identifier(eqMatch[2]!)),
      t.numericLiteral(Number(eqMatch[3]!))
    );
  }

  // Fallback: use as identifier (this will cause syntax issues if not valid)
  return t.identifier(adjustedGuard);
}

/**
 * Generate the ValidationError import if needed.
 */
export function generateValidationErrorImport(
  imports: Map<string, Set<string>>,
  runtimePath: string
): t.ImportDeclaration | null {
  const runtimeImports = imports.get('@propane/runtime');
  if (!runtimeImports?.has('ValidationError')) {
    return null;
  }

  return t.importDeclaration(
    [t.importSpecifier(t.identifier('ValidationError'), t.identifier('ValidationError'))],
    t.stringLiteral(runtimePath)
  );
}
