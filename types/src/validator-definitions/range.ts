/**
 * Range validator definition.
 * Validates that a numeric value is within an inclusive range [min, max].
 */

import type { ValidatorDefinition } from '../registry.js';

export const RangeDefinition: ValidatorDefinition = {
  name: 'Range',

  generateJs({ valueExpr, type, params, imports }) {
    const [min, max] = params as [number | bigint | string, number | bigint | string];

    if (type.kind === 'number') {
      return { condition: `${valueExpr} >= ${min} && ${valueExpr} <= ${max}` };
    }
    if (type.kind === 'bigint') {
      const minLiteral = typeof min === 'bigint' ? `${min}n` : `${min}n`;
      const maxLiteral = typeof max === 'bigint' ? `${max}n` : `${max}n`;
      return { condition: `${valueExpr} >= ${minLiteral} && ${valueExpr} <= ${maxLiteral}` };
    }
    // For decimal or mixed numeric types, use runtime helper
    imports.add('inRange', '@propanejs/runtime');
    const minArg = typeof min === 'string' ? `'${min}'` : String(min);
    const maxArg = typeof max === 'string' ? `'${max}'` : String(max);
    return { condition: `inRange(${valueExpr}, ${minArg}, ${maxArg})` };
  },

  generateSql({ columnName, params }) {
    const [min, max] = params as [number | bigint | string, number | bigint | string];
    return `${columnName} >= ${min} AND ${columnName} <= ${max}`;
  },

  generateMessage({ params, customMessage }) {
    if (customMessage) return customMessage;
    const [min, max] = params as [number | bigint | string, number | bigint | string];
    return `must be between ${min} and ${max}`;
  },

  generateCode() {
    return 'RANGE';
  },
};
