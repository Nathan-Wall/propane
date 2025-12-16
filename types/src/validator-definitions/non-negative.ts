/**
 * NonNegative validator definition.
 * Validates that a numeric value is greater than or equal to zero.
 */

import type { ValidatorDefinition } from '../registry.js';

export const NonNegativeDefinition: ValidatorDefinition = {
  name: 'NonNegative',

  generateJs({ valueExpr, type, imports }) {
    if (type.kind === 'number') {
      return { condition: `${valueExpr} >= 0` };
    }
    if (type.kind === 'bigint') {
      return { condition: `${valueExpr} >= 0n` };
    }
    // For decimal or mixed numeric types, use runtime helper
    imports.add('isNonNegative', '@propanejs/runtime');
    return { condition: `isNonNegative(${valueExpr})` };
  },

  generateSql({ columnName }) {
    return `${columnName} >= 0`;
  },

  generateMessage({ customMessage }) {
    return customMessage ?? 'must be non-negative';
  },

  generateCode() {
    return 'NON_NEGATIVE';
  },
};
