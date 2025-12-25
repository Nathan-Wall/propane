/**
 * Range validator definition.
 * Validates that a numeric value is within an inclusive range [min, max].
 */

import type { ValidatorDefinition } from '../registry.js';
import { isValidDecimalString } from '@/common/numbers/decimal.js';

export const RangeDefinition: ValidatorDefinition = {
  name: 'Range',

  generateJs({ valueExpr, type, params, imports }) {
    const [min, max] = params as [number | bigint | string, number | bigint | string];

    // Validate string bounds at build time
    if (typeof min === 'string' && !isValidDecimalString(min)) {
      throw new Error(`Invalid decimal bound in Range validator (min): '${min}'`);
    }
    if (typeof max === 'string' && !isValidDecimalString(max)) {
      throw new Error(`Invalid decimal bound in Range validator (max): '${max}'`);
    }

    if (type.kind === 'number') {
      return { condition: `${valueExpr} >= ${min} && ${valueExpr} <= ${max}` };
    }
    if (type.kind === 'bigint') {
      const minLiteral = typeof min === 'bigint' ? `${min}n` : `${min}n`;
      const maxLiteral = typeof max === 'bigint' ? `${max}n` : `${max}n`;
      return { condition: `${valueExpr} >= ${minLiteral} && ${valueExpr} <= ${maxLiteral}` };
    }
    // For decimal or mixed numeric types, use runtime helper
    imports.add('inRange', '@propane/runtime');
    // String bounds are validated above, cast to AnyDecimal for type safety
    const needsAnyDecimal = typeof min === 'string' || typeof max === 'string';
    const minArg = typeof min === 'string'
      ? `'${min}' as AnyDecimal`
      : String(min);
    const maxArg = typeof max === 'string'
      ? `'${max}' as AnyDecimal`
      : String(max);
    if (needsAnyDecimal) {
      imports.add('AnyDecimal', '@propane/runtime');
    }
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
