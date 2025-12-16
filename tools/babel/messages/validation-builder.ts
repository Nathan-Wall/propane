/**
 * Validation Builder
 *
 * Builds validation methods for message classes.
 */

import * as t from '@babel/types';
import type { PluginStateFlags, PropDescriptor } from './properties.js';
import type { TypeRegistry } from '@/types/src/registry.js';
import type { ValidatorImportTracker } from './validator-import-tracker.js';
import {
  extractFieldValidation,
  type FieldValidation,
} from './validator-extraction.js';

/**
 * Context for building validation methods.
 */
export interface ValidationBuildContext {
  /** Plugin state flags (for tracking required imports) */
  state: PluginStateFlags;
  /** Type registry for validator definitions */
  registry: TypeRegistry | undefined;
  /** Import tracker for resolving validator references */
  tracker: ValidatorImportTracker;
}

/**
 * Extract validation information for all properties.
 */
export function extractPropertyValidations(
  properties: PropDescriptor[],
  ctx: ValidationBuildContext
): Map<string, FieldValidation> {
  const validations = new Map<string, FieldValidation>();

  for (const prop of properties) {
    const validation = extractFieldValidation(
      prop.typeAnnotation,
      ctx.tracker,
      ctx.registry
    );

    // Only store if there's actual validation to do
    if (
      validation.validators.length > 0 ||
      validation.brand !== null ||
      validation.unionBranches.length > 0
    ) {
      validations.set(prop.name, validation);
    }
  }

  return validations;
}

/**
 * Check if any property has validators.
 */
export function hasAnyValidation(validations: Map<string, FieldValidation>): boolean {
  return validations.size > 0;
}

/**
 * Build the private #validate() method for a message class.
 *
 * Generates a method that validates all fields with validators/brands.
 * Returns null if no validation is needed.
 */
export function buildValidateMethod(
  validations: Map<string, FieldValidation>,
  ctx: ValidationBuildContext
): t.ClassPrivateMethod | null {
  if (!hasAnyValidation(validations)) {
    return null;
  }

  const body: t.Statement[] = [];

  // Generate validation for each property with validators
  for (const [propName, validation] of validations) {
    const propStatements = buildPropertyValidation(propName, validation, ctx);
    body.push(...propStatements);
  }

  // Mark that we need ValidationError import
  ctx.state.usesValidationError = true;

  return t.classPrivateMethod(
    'method',
    t.privateName(t.identifier('validate')),
    [],
    t.blockStatement(body)
  );
}

/**
 * Build validation statements for a single property.
 */
function buildPropertyValidation(
  propName: string,
  validation: FieldValidation,
  ctx: ValidationBuildContext
): t.Statement[] {
  const statements: t.Statement[] = [];
  const valueExpr = `this.#${propName}`;

  // Handle nullable fields - wrap validation in null check
  if (validation.nullable) {
    const innerStatements = buildNonNullableValidation(
      propName,
      validation,
      valueExpr,
      ctx
    );

    if (innerStatements.length > 0) {
      // if (this.#prop != null) { ... validation ... }
      statements.push(
        t.ifStatement(
          t.binaryExpression(
            '!=',
            t.memberExpression(
              t.thisExpression(),
              t.privateName(t.identifier(propName))
            ),
            t.nullLiteral()
          ),
          t.blockStatement(innerStatements)
        )
      );
    }
  } else {
    statements.push(
      ...buildNonNullableValidation(propName, validation, valueExpr, ctx)
    );
  }

  return statements;
}

/**
 * Build validation statements assuming the value is not null/undefined.
 */
function buildNonNullableValidation(
  propName: string,
  validation: FieldValidation,
  valueExpr: string,
  ctx: ValidationBuildContext
): t.Statement[] {
  const statements: t.Statement[] = [];

  // Handle simple validators
  for (const validator of validation.validators) {
    const definition = validator.registration.definition;

    // Generate the condition using the validator definition
    const result = definition.generateJs({
      valueExpr,
      type: validator.innerType,
      params: validator.params,
      imports: {
        add: (name: string, _from: string) => {
          // Track required imports via state flags
          trackValidationImport(name, ctx.state);
        },
      },
    });

    if (result) {
      const message = definition.generateMessage({
        params: validator.params,
        customMessage: undefined,
      });
      const code = definition.generateCode?.() ?? definition.name.toUpperCase();

      statements.push(
        buildValidationCheck(propName, result.condition, message, code, valueExpr)
      );
    }
  }

  // Handle brand validation
  if (validation.brand) {
    const brandDef = validation.brand.registration.definition;
    if (brandDef.generateJs) {
      const result = brandDef.generateJs({
        valueExpr,
        params: validation.brand.params,
        imports: {
          add: (name: string, _from: string) => {
            trackValidationImport(name, ctx.state);
          },
        },
      });

      if (result) {
        const message = brandDef.generateMessage?.({ params: validation.brand.params })
          ?? 'invalid brand value';

        statements.push(
          buildValidationCheck(propName, result.condition, message, 'BRAND', valueExpr)
        );
      }
    }
  }

  return statements;
}

/**
 * Build a single validation check statement.
 */
function buildValidationCheck(
  propName: string,
  condition: string,
  message: string,
  code: string,
  valueExpr: string
): t.Statement {
  // Parse the condition string into AST
  // For simple conditions, we can construct them directly
  const conditionAst = parseSimpleCondition(condition);

  // if (!(condition)) throw new ValidationError(propName, message, value, code)
  return t.ifStatement(
    t.unaryExpression('!', t.parenthesizedExpression(conditionAst)),
    t.blockStatement([
      t.throwStatement(
        t.newExpression(t.identifier('ValidationError'), [
          t.stringLiteral(propName),
          t.stringLiteral(message),
          parseSimpleCondition(valueExpr),
          t.stringLiteral(code),
        ])
      ),
    ])
  );
}

/**
 * Parse a simple condition string into AST.
 * Handles common patterns from validators.
 */
function parseSimpleCondition(expr: string): t.Expression {
  // Handle member expressions like "this.#foo"
  if (expr.startsWith('this.#')) {
    const propName = expr.slice(6); // Remove "this.#"
    return t.memberExpression(
      t.thisExpression(),
      t.privateName(t.identifier(propName))
    );
  }

  // Handle simple function calls like "isPositive(this.#foo)"
  const funcCallMatch = expr.match(/^(\w+)\((.*)\)$/);
  if (funcCallMatch) {
    const [, funcName, args] = funcCallMatch;
    const argExprs = args!.split(',').map((arg) => parseSimpleCondition(arg.trim()));
    return t.callExpression(t.identifier(funcName!), argExprs);
  }

  // Handle binary comparisons
  const binaryMatch = expr.match(/^(.+?)\s*(>=|<=|>|<|===|!==|==|!=)\s*(.+)$/);
  if (binaryMatch) {
    const [, left, op, right] = binaryMatch;
    return t.binaryExpression(
      op as t.BinaryExpression['operator'],
      parseSimpleCondition(left!.trim()),
      parseSimpleCondition(right!.trim())
    );
  }

  // Handle logical AND
  if (expr.includes(' && ')) {
    const parts = expr.split(' && ');
    return parts.slice(1).reduce<t.Expression>(
      (acc, part) => t.logicalExpression('&&', acc, parseSimpleCondition(part.trim())),
      parseSimpleCondition(parts[0]!.trim())
    );
  }

  // Handle .length
  if (expr.endsWith('.length')) {
    const base = expr.slice(0, -7);
    return t.memberExpression(parseSimpleCondition(base), t.identifier('length'));
  }

  // Handle numeric literals
  if (/^-?\d+(\.\d+)?$/.test(expr)) {
    return t.numericLiteral(Number(expr));
  }

  // Handle bigint literals
  if (/^-?\d+n$/.test(expr)) {
    return t.bigIntLiteral(expr.slice(0, -1));
  }

  // Handle string literals
  if (/^'.*'$/.test(expr) || /^".*"$/.test(expr)) {
    return t.stringLiteral(expr.slice(1, -1));
  }

  // Fallback: treat as identifier
  return t.identifier(expr);
}

/**
 * Track validation imports via state flags.
 */
function trackValidationImport(name: string, state: PluginStateFlags): void {
  switch (name) {
    case 'ValidationError':
      state.usesValidationError = true;
      break;
    case 'charLength':
      state.usesCharLength = true;
      break;
    case 'isInt32':
      state.usesIsInt32 = true;
      break;
    case 'isInt53':
      state.usesIsInt53 = true;
      break;
    case 'isDecimal':
      state.usesIsDecimal = true;
      break;
    case 'isPositive':
      state.usesIsPositive = true;
      break;
    case 'isNegative':
      state.usesIsNegative = true;
      break;
    case 'isNonNegative':
      state.usesIsNonNegative = true;
      break;
    case 'isNonPositive':
      state.usesIsNonPositive = true;
      break;
    case 'greaterThan':
      state.usesGreaterThan = true;
      break;
    case 'greaterThanOrEqual':
      state.usesGreaterThanOrEqual = true;
      break;
    case 'lessThan':
      state.usesLessThan = true;
      break;
    case 'lessThanOrEqual':
      state.usesLessThanOrEqual = true;
      break;
    case 'inRange':
      state.usesInRange = true;
      break;
  }
}

/**
 * Build the call to #validate() in the constructor.
 */
export function buildValidateCall(): t.ExpressionStatement {
  return t.expressionStatement(
    t.callExpression(
      t.memberExpression(
        t.thisExpression(),
        t.privateName(t.identifier('validate'))
      ),
      []
    )
  );
}

/**
 * Build the static validateAll() method for a message class.
 *
 * Generates a static method that validates all fields and collects errors.
 * Returns null if no validation is needed.
 *
 * Generated signature:
 *   static validateAll(data: T.Data): ValidationError[]
 */
export function buildValidateAllMethod(
  typeName: string,
  validations: Map<string, FieldValidation>,
  ctx: ValidationBuildContext
): t.ClassMethod | null {
  if (!hasAnyValidation(validations)) {
    return null;
  }

  const body: t.Statement[] = [];

  // const errors: ValidationError[] = [];
  body.push(
    t.variableDeclaration('const', [
      t.variableDeclarator(
        t.identifier('errors'),
        t.tsAsExpression(
          t.arrayExpression([]),
          t.tsArrayType(t.tsTypeReference(t.identifier('ValidationError')))
        )
      ),
    ])
  );

  // Generate try-catch block for each property with validators
  for (const [propName, validation] of validations) {
    const propStatements = buildPropertyValidationForData(
      propName,
      validation,
      ctx
    );
    // Wrap in try-catch
    const tryCatch = t.tryStatement(
      t.blockStatement(propStatements),
      t.catchClause(
        t.identifier('e'),
        t.blockStatement([
          // if (e instanceof ValidationError) errors.push(e); else throw e;
          t.ifStatement(
            t.binaryExpression(
              'instanceof',
              t.identifier('e'),
              t.identifier('ValidationError')
            ),
            t.expressionStatement(
              t.callExpression(
                t.memberExpression(
                  t.identifier('errors'),
                  t.identifier('push')
                ),
                [t.identifier('e')]
              )
            ),
            t.throwStatement(t.identifier('e'))
          ),
        ])
      )
    );
    body.push(tryCatch);
  }

  // return errors;
  body.push(t.returnStatement(t.identifier('errors')));

  // Mark that we need ValidationError import
  ctx.state.usesValidationError = true;

  // Build method with data parameter: (data: T.Data)
  const dataParam = t.identifier('data');
  dataParam.typeAnnotation = t.tsTypeAnnotation(
    t.tsTypeReference(
      t.tsQualifiedName(t.identifier(typeName), t.identifier('Data'))
    )
  );

  const method = t.classMethod(
    'method',
    t.identifier('validateAll'),
    [dataParam],
    t.blockStatement(body),
    false, // computed
    true   // static
  );

  // Add return type annotation: ValidationError[]
  method.returnType = t.tsTypeAnnotation(
    t.tsArrayType(t.tsTypeReference(t.identifier('ValidationError')))
  );

  return method;
}

/**
 * Build validation statements for a single property accessing data.propName.
 * Similar to buildPropertyValidation but uses data.propName instead of this.#propName.
 */
function buildPropertyValidationForData(
  propName: string,
  validation: FieldValidation,
  ctx: ValidationBuildContext
): t.Statement[] {
  const statements: t.Statement[] = [];
  const valueExpr = `data.${propName}`;

  // Handle nullable fields - wrap validation in null check
  if (validation.nullable) {
    const innerStatements = buildNonNullableValidationForData(
      propName,
      validation,
      valueExpr,
      ctx
    );

    if (innerStatements.length > 0) {
      // if (data.prop != null) { ... validation ... }
      statements.push(
        t.ifStatement(
          t.binaryExpression(
            '!=',
            t.memberExpression(
              t.identifier('data'),
              t.identifier(propName)
            ),
            t.nullLiteral()
          ),
          t.blockStatement(innerStatements)
        )
      );
    }
  } else {
    statements.push(
      ...buildNonNullableValidationForData(propName, validation, valueExpr, ctx)
    );
  }

  return statements;
}

/**
 * Build validation statements for data-based access.
 */
function buildNonNullableValidationForData(
  propName: string,
  validation: FieldValidation,
  valueExpr: string,
  ctx: ValidationBuildContext
): t.Statement[] {
  const statements: t.Statement[] = [];

  // Handle simple validators
  for (const validator of validation.validators) {
    const definition = validator.registration.definition;

    // Generate the condition using the validator definition
    const result = definition.generateJs({
      valueExpr,
      type: validator.innerType,
      params: validator.params,
      imports: {
        add: (name: string, _from: string) => {
          trackValidationImport(name, ctx.state);
        },
      },
    });

    if (result) {
      const message = definition.generateMessage({
        params: validator.params,
        customMessage: undefined,
      });
      const code = definition.generateCode?.() ?? definition.name.toUpperCase();

      statements.push(
        buildValidationCheckForData(propName, result.condition, message, code, valueExpr)
      );
    }
  }

  // Handle brand validation
  if (validation.brand) {
    const brandDef = validation.brand.registration.definition;
    if (brandDef.generateJs) {
      const result = brandDef.generateJs({
        valueExpr,
        params: validation.brand.params,
        imports: {
          add: (name: string, _from: string) => {
            trackValidationImport(name, ctx.state);
          },
        },
      });

      if (result) {
        const message = brandDef.generateMessage?.({ params: validation.brand.params })
          ?? 'invalid brand value';

        statements.push(
          buildValidationCheckForData(propName, result.condition, message, 'BRAND', valueExpr)
        );
      }
    }
  }

  return statements;
}

/**
 * Build a single validation check statement for data-based access.
 */
function buildValidationCheckForData(
  propName: string,
  condition: string,
  message: string,
  code: string,
  valueExpr: string
): t.Statement {
  // Parse the condition string into AST
  const conditionAst = parseDataCondition(condition);

  // if (!(condition)) throw new ValidationError(propName, message, value, code)
  return t.ifStatement(
    t.unaryExpression('!', t.parenthesizedExpression(conditionAst)),
    t.blockStatement([
      t.throwStatement(
        t.newExpression(t.identifier('ValidationError'), [
          t.stringLiteral(propName),
          t.stringLiteral(message),
          parseDataCondition(valueExpr),
          t.stringLiteral(code),
        ])
      ),
    ])
  );
}

/**
 * Parse a condition string into AST, handling data.propName patterns.
 */
function parseDataCondition(expr: string): t.Expression {
  // Handle member expressions like "data.foo"
  if (expr.startsWith('data.')) {
    const propName = expr.slice(5); // Remove "data."
    return t.memberExpression(
      t.identifier('data'),
      t.identifier(propName)
    );
  }

  // Handle simple function calls like "isPositive(data.foo)"
  const funcCallMatch = expr.match(/^(\w+)\((.*)\)$/);
  if (funcCallMatch) {
    const [, funcName, args] = funcCallMatch;
    const argExprs = args!.split(',').map((arg) => parseDataCondition(arg.trim()));
    return t.callExpression(t.identifier(funcName!), argExprs);
  }

  // Handle binary comparisons
  const binaryMatch = expr.match(/^(.+?)\s*(>=|<=|>|<|===|!==|==|!=)\s*(.+)$/);
  if (binaryMatch) {
    const [, left, op, right] = binaryMatch;
    return t.binaryExpression(
      op as t.BinaryExpression['operator'],
      parseDataCondition(left!.trim()),
      parseDataCondition(right!.trim())
    );
  }

  // Handle logical AND
  if (expr.includes(' && ')) {
    const parts = expr.split(' && ');
    return parts.slice(1).reduce<t.Expression>(
      (acc, part) => t.logicalExpression('&&', acc, parseDataCondition(part.trim())),
      parseDataCondition(parts[0]!.trim())
    );
  }

  // Handle .length
  if (expr.endsWith('.length')) {
    const base = expr.slice(0, -7);
    return t.memberExpression(parseDataCondition(base), t.identifier('length'));
  }

  // Handle numeric literals
  if (/^-?\d+(\.\d+)?$/.test(expr)) {
    return t.numericLiteral(Number(expr));
  }

  // Handle bigint literals
  if (/^-?\d+n$/.test(expr)) {
    return t.bigIntLiteral(expr.slice(0, -1));
  }

  // Handle string literals
  if (/^'.*'$/.test(expr) || /^".*"$/.test(expr)) {
    return t.stringLiteral(expr.slice(1, -1));
  }

  // Fallback: treat as identifier
  return t.identifier(expr);
}
