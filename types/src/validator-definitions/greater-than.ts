/**
 * GreaterThan validator definition.
 * Validates that a numeric value is strictly greater than a bound.
 */

import type { ValidatorDefinition } from '../registry.js';

export const GreaterThanDefinition: ValidatorDefinition = {
  name: 'GreaterThan',

  generateJs({ valueExpr, type, params, imports }) {
    const [bound] = params as [number | bigint | string];

    if (type.kind === 'number') {
      return { condition: `${valueExpr} > ${bound}` };
    }
    if (type.kind === 'bigint') {
      const bigintLiteral = typeof bound === 'bigint' ? `${bound}n` : `${bound}n`;
      return { condition: `${valueExpr} > ${bigintLiteral}` };
    }
    // For decimal or mixed numeric types, use runtime helper
    imports.add('greaterThan', '@propanejs/runtime');
    const boundArg = typeof bound === 'string' ? `'${bound}'` : String(bound);
    return { condition: `greaterThan(${valueExpr}, ${boundArg})` };
  },

  generateSql({ columnName, params }) {
    const [bound] = params as [number | bigint | string];
    return `${columnName} > ${bound}`;
  },

  generateMessage({ params, customMessage }) {
    if (customMessage) return customMessage;
    const [bound] = params as [number | bigint | string];
    return `must be greater than ${bound}`;
  },

  generateCode() {
    return 'GREATER_THAN';
  },
};
