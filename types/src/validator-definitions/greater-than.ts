/**
 * GreaterThan validator definition.
 * Validates that a numeric value is strictly greater than a bound.
 */

import type { ValidatorDefinition } from '../registry.js';
import { formatNumericBound } from './numeric-bounds.js';

export const GreaterThanDefinition: ValidatorDefinition = {
  name: 'GreaterThan',

  generateJs({ valueExpr, type, params, imports }) {
    const [bound] = params as [number | bigint | string];

    if (type.kind === 'number') {
      if (typeof bound === 'string' || typeof bound === 'bigint') {
        throw new TypeError('GreaterThan<number> requires a numeric bound.');
      }
      return { condition: `${valueExpr} > ${bound}` };
    }
    if (type.kind === 'bigint') {
      return { condition: `${valueExpr} > ${formatNumericBound(bound, type, imports, 'GreaterThan')}` };
    }
    // For decimal or mixed numeric types, use runtime helper
    imports.add('greaterThan', '@propane/runtime');
    const boundArg = formatNumericBound(bound, type, imports, 'GreaterThan');
    return { condition: `greaterThan(${valueExpr}, ${boundArg})` };
  },

  generateSql({ columnName, params }) {
    const [bound] = params as [number | bigint | string];
    return `${columnName} > ${bound}`;
  },

  generateMessage({ params, customMessage }) {
    if (customMessage) return customMessage;
    const [bound] = params as [number | bigint | string];
    return `must be greater than ${bound}`;
  },

  generateCode() {
    return 'GREATER_THAN';
  },
};
