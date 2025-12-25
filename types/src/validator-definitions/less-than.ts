/**
 * LessThan validator definition.
 * Validates that a numeric value is strictly less than a bound.
 */

import type { ValidatorDefinition } from '../registry.js';
import { isValidDecimalString } from '@/common/numbers/decimal.js';

export const LessThanDefinition: ValidatorDefinition = {
  name: 'LessThan',

  generateJs({ valueExpr, type, params, imports }) {
    const [bound] = params as [number | bigint | string];

    // Validate string bounds at build time
    if (typeof bound === 'string' && !isValidDecimalString(bound)) {
      throw new Error(`Invalid decimal bound in LessThan validator: '${bound}'`);
    }

    if (type.kind === 'number') {
      return { condition: `${valueExpr} < ${bound}` };
    }
    if (type.kind === 'bigint') {
      const bigintLiteral = typeof bound === 'bigint' ? `${bound}n` : `${bound}n`;
      return { condition: `${valueExpr} < ${bigintLiteral}` };
    }
    // For decimal or mixed numeric types, use runtime helper
    imports.add('lessThan', '@propane/runtime');
    // String bounds are validated above, cast to AnyDecimal for type safety
    const boundArg = typeof bound === 'string'
      ? `'${bound}' as AnyDecimal`
      : String(bound);
    if (typeof bound === 'string') {
      imports.add('AnyDecimal', '@propane/runtime');
    }
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
