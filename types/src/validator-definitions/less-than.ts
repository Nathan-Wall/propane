/**
 * LessThan validator definition.
 * Validates that a numeric value is strictly less than a bound.
 */

import type { ValidatorDefinition } from '../registry.js';
import { formatNumericBound } from './numeric-bounds.js';

export const LessThanDefinition: ValidatorDefinition = {
  name: 'LessThan',

  generateJs({ valueExpr, type, params, imports }) {
    const [bound] = params as [number | bigint | string];

    if (type.kind === 'number') {
      if (typeof bound === 'string' || typeof bound === 'bigint') {
        throw new Error('LessThan<number> requires a numeric bound.');
      }
      return { condition: `${valueExpr} < ${bound}` };
    }
    if (type.kind === 'bigint') {
      return { condition: `${valueExpr} < ${formatNumericBound(bound, type, imports, 'LessThan')}` };
    }
    // For decimal or mixed numeric types, use runtime helper
    imports.add('lessThan', '@propane/runtime');
    const boundArg = formatNumericBound(bound, type, imports, 'LessThan');
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
