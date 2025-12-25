/**
 * Min validator definition.
 * Validates that a numeric value is greater than or equal to a minimum bound.
 */

import type { ValidatorDefinition } from '../registry.js';
import { isValidDecimalString } from '@/common/numbers/decimal.js';

export const MinDefinition: ValidatorDefinition = {
  name: 'Min',

  generateJs({ valueExpr, type, params, imports }) {
    const [min] = params as [number | bigint | string];

    // Validate string bounds at build time
    if (typeof min === 'string' && !isValidDecimalString(min)) {
      throw new Error(`Invalid decimal bound in Min validator: '${min}'`);
    }

    if (type.kind === 'number') {
      return { condition: `${valueExpr} >= ${min}` };
    }
    if (type.kind === 'bigint') {
      const bigintLiteral = typeof min === 'bigint' ? `${min}n` : `${min}n`;
      return { condition: `${valueExpr} >= ${bigintLiteral}` };
    }
    // For decimal or mixed numeric types, use runtime helper
    imports.add('greaterThanOrEqual', '@propane/runtime');
    // String bounds are validated above, cast to AnyDecimal for type safety
    const minArg = typeof min === 'string'
      ? `'${min}' as AnyDecimal`
      : String(min);
    if (typeof min === 'string') {
      imports.add('AnyDecimal', '@propane/runtime');
    }
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
