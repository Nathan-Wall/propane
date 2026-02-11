/**
 * Min validator definition.
 * Validates that a numeric value is greater than or equal to a minimum bound.
 */

import type { ValidatorDefinition } from '../registry.js';
import { formatNumericBound } from './numeric-bounds.js';

export const MinDefinition: ValidatorDefinition = {
  name: 'Min',

  generateJs({ valueExpr, type, params, imports }) {
    const [min] = params as [number | bigint | string];

    if (type.kind === 'number') {
      if (typeof min === 'string' || typeof min === 'bigint') {
        throw new TypeError('Min<number> requires a numeric bound.');
      }
      return { condition: `${valueExpr} >= ${min}` };
    }
    if (type.kind === 'bigint') {
      return { condition: `${valueExpr} >= ${formatNumericBound(min, type, imports, 'Min')}` };
    }
    // For decimal or mixed numeric types, use runtime helper
    imports.add('greaterThanOrEqual', '@propane/runtime');
    const minArg = formatNumericBound(min, type, imports, 'Min');
    return { condition: `greaterThanOrEqual(${valueExpr}, ${minArg})` };
  },

  generateSql({ columnName, params }) {
    const [min] = params as [number | bigint | string];
    return `${columnName} >= ${min}`;
  },

  generateMessage({ params, customMessage }) {
    if (customMessage) return customMessage;
    const [min] = params as [number | bigint | string];
    return `must be at least ${min}`;
  },

  generateCode() {
    return 'MIN';
  },
};
