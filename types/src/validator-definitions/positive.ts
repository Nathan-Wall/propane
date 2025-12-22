/**
 * Positive validator definition.
 * Validates that a numeric value is greater than zero.
 */

import type { ValidatorDefinition } from '../registry.js';

export const PositiveDefinition: ValidatorDefinition = {
  name: 'Positive',

  generateJs({ valueExpr, type, imports }) {
    if (type.kind === 'number') {
      return { condition: `${valueExpr} > 0` };
    }
    if (type.kind === 'bigint') {
      return { condition: `${valueExpr} > 0n` };
    }
    // For decimal or mixed numeric types, use runtime helper
    imports.add('isPositive', '@propane/runtime');
    return { condition: `isPositive(${valueExpr})` };
  },

  generateSql({ columnName }) {
    return `${columnName} > 0`;
  },

  generateMessage({ customMessage }) {
    return customMessage ?? 'must be positive';
  },

  generateCode() {
    return 'POSITIVE';
  },
};
