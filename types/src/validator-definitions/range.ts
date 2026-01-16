/**
 * Range validator definition.
 * Validates that a numeric value is within an inclusive range [min, max].
 */

import type { ValidatorDefinition } from '../registry.js';
import { formatNumericBound } from './numeric-bounds.js';

export const RangeDefinition: ValidatorDefinition = {
  name: 'Range',

  generateJs({ valueExpr, type, params, imports }) {
    const [min, max] = params as [number | bigint | string, number | bigint | string];

    if (type.kind === 'number') {
      if (typeof min === 'string' || typeof min === 'bigint' || typeof max === 'string' || typeof max === 'bigint') {
        throw new Error('Range<number> requires numeric bounds.');
      }
      return { condition: `${valueExpr} >= ${min} && ${valueExpr} <= ${max}` };
    }
    if (type.kind === 'bigint') {
      const minArg = formatNumericBound(min, type, imports, 'Range (min)');
      const maxArg = formatNumericBound(max, type, imports, 'Range (max)');
      return { condition: `${valueExpr} >= ${minArg} && ${valueExpr} <= ${maxArg}` };
    }
    // For decimal or mixed numeric types, use runtime helper
    imports.add('inRange', '@propane/runtime');
    const minArg = formatNumericBound(min, type, imports, 'Range (min)');
    const maxArg = formatNumericBound(max, type, imports, 'Range (max)');
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
