/**
 * Max validator definition.
 * Validates that a numeric value is less than or equal to a maximum bound.
 */

import type { ValidatorDefinition } from '../registry.js';
import { isValidDecimalString } from '@/common/numbers/decimal.js';

export const MaxDefinition: ValidatorDefinition = {
  name: 'Max',

  generateJs({ valueExpr, type, params, imports }) {
    const [max] = params as [number | bigint | string];

    // Validate string bounds at build time
    if (typeof max === 'string' && !isValidDecimalString(max)) {
      throw new Error(`Invalid decimal bound in Max validator: '${max}'`);
    }

    if (type.kind === 'number') {
      return { condition: `${valueExpr} <= ${max}` };
    }
    if (type.kind === 'bigint') {
      const bigintLiteral = typeof max === 'bigint' ? `${max}n` : `${max}n`;
      return { condition: `${valueExpr} <= ${bigintLiteral}` };
    }
    // For decimal or mixed numeric types, use runtime helper
    imports.add('lessThanOrEqual', '@propane/runtime');
    // String bounds are validated above, cast to AnyDecimal for type safety
    const maxArg = typeof max === 'string'
      ? `'${max}' as AnyDecimal`
      : String(max);
    if (typeof max === 'string') {
      imports.add('AnyDecimal', '@propane/runtime');
    }
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
