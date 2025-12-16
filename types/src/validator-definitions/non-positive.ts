/**
 * NonPositive validator definition.
 * Validates that a numeric value is less than or equal to zero.
 */

import type { ValidatorDefinition } from '../registry.js';

export const NonPositiveDefinition: ValidatorDefinition = {
  name: 'NonPositive',

  generateJs({ valueExpr, type, imports }) {
    if (type.kind === 'number') {
      return { condition: `${valueExpr} <= 0` };
    }
    if (type.kind === 'bigint') {
      return { condition: `${valueExpr} <= 0n` };
    }
    // For decimal or mixed numeric types, use runtime helper
    imports.add('isNonPositive', '@propanejs/runtime');
    return { condition: `isNonPositive(${valueExpr})` };
  },

  generateSql({ columnName }) {
    return `${columnName} <= 0`;
  },

  generateMessage({ customMessage }) {
    return customMessage ?? 'must be non-positive';
  },

  generateCode() {
    return 'NON_POSITIVE';
  },
};
