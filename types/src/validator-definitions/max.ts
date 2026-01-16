/**
 * Max validator definition.
 * Validates that a numeric value is less than or equal to a maximum bound.
 */

import type { ValidatorDefinition } from '../registry.js';
import { formatNumericBound } from './numeric-bounds.js';

export const MaxDefinition: ValidatorDefinition = {
  name: 'Max',

  generateJs({ valueExpr, type, params, imports }) {
    const [max] = params as [number | bigint | string];

    if (type.kind === 'number') {
      if (typeof max === 'string' || typeof max === 'bigint') {
        throw new Error('Max<number> requires a numeric bound.');
      }
      return { condition: `${valueExpr} <= ${max}` };
    }
    if (type.kind === 'bigint') {
      return { condition: `${valueExpr} <= ${formatNumericBound(max, type, imports, 'Max')}` };
    }
    // For decimal or mixed numeric types, use runtime helper
    imports.add('lessThanOrEqual', '@propane/runtime');
    const maxArg = formatNumericBound(max, type, imports, 'Max');
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
