/**
 * LessThan validator definition.
 * Validates that a numeric value is strictly less than a bound.
 */

import type { ValidatorDefinition } from '../registry.js';

export const LessThanDefinition: ValidatorDefinition = {
  name: 'LessThan',

  generateJs({ valueExpr, type, params, imports }) {
    const [bound] = params as [number | bigint | string];

    if (type.kind === 'number') {
      return { condition: `${valueExpr} < ${bound}` };
    }
    if (type.kind === 'bigint') {
      const bigintLiteral = typeof bound === 'bigint' ? `${bound}n` : `${bound}n`;
      return { condition: `${valueExpr} < ${bigintLiteral}` };
    }
    // For decimal or mixed numeric types, use runtime helper
    imports.add('lessThan', '@propane/runtime');
    const boundArg = typeof bound === 'string' ? `'${bound}'` : String(bound);
    return { condition: `lessThan(${valueExpr}, ${boundArg})` };
  },

  generateSql({ columnName, params }) {
    const [bound] = params as [number | bigint | string];
    return `${columnName} < ${bound}`;
  },

  generateMessage({ params, customMessage }) {
    if (customMessage) return customMessage;
    const [bound] = params as [number | bigint | string];
    return `must be less than ${bound}`;
  },

  generateCode() {
    return 'LESS_THAN';
  },
};
