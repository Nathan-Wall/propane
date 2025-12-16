/**
 * Negative validator definition.
 * Validates that a numeric value is less than zero.
 */

import type { ValidatorDefinition } from '../registry.js';

export const NegativeDefinition: ValidatorDefinition = {
  name: 'Negative',

  generateJs({ valueExpr, type, imports }) {
    if (type.kind === 'number') {
      return { condition: `${valueExpr} < 0` };
    }
    if (type.kind === 'bigint') {
      return { condition: `${valueExpr} < 0n` };
    }
    // For decimal or mixed numeric types, use runtime helper
    imports.add('isNegative', '@propanejs/runtime');
    return { condition: `isNegative(${valueExpr})` };
  },

  generateSql({ columnName }) {
    return `${columnName} < 0`;
  },

  generateMessage({ customMessage }) {
    return customMessage ?? 'must be negative';
  },

  generateCode() {
    return 'NEGATIVE';
  },
};
