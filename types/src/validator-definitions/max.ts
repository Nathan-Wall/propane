/**
 * Max validator definition.
 * Validates that a numeric value is less than or equal to a maximum bound.
 */

import type { ValidatorDefinition } from '../registry.js';

export const MaxDefinition: ValidatorDefinition = {
  name: 'Max',

  generateJs({ valueExpr, type, params, imports }) {
    const [max] = params as [number | bigint | string];

    if (type.kind === 'number') {
      return { condition: `${valueExpr} <= ${max}` };
    }
    if (type.kind === 'bigint') {
      const bigintLiteral = typeof max === 'bigint' ? `${max}n` : `${max}n`;
      return { condition: `${valueExpr} <= ${bigintLiteral}` };
    }
    // For decimal or mixed numeric types, use runtime helper
    imports.add('lessThanOrEqual', '@propanejs/runtime');
    const maxArg = typeof max === 'string' ? `'${max}'` : String(max);
    return { condition: `lessThanOrEqual(${valueExpr}, ${maxArg})` };
  },

  generateSql({ columnName, params }) {
    const [max] = params as [number | bigint | string];
    return `${columnName} <= ${max}`;
  },

  generateMessage({ params, customMessage }) {
    if (customMessage) return customMessage;
    const [max] = params as [number | bigint | string];
    return `must be at most ${max}`;
  },

  generateCode() {
    return 'MAX';
  },
};
