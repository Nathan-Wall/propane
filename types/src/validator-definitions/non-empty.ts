/**
 * NonEmpty validator definition.
 * Validates that a string or array has at least one element.
 */

import type { ValidatorDefinition } from '../registry.js';

export const NonEmptyDefinition: ValidatorDefinition = {
  name: 'NonEmpty',

  generateJs({ valueExpr }) {
    // Works for both strings and arrays
    return { condition: `${valueExpr}.length > 0` };
  },

  generateSql({ columnName }) {
    // For strings, check length > 0; for arrays (JSONB), use array length
    return `length(${columnName}) > 0`;
  },

  generateMessage({ customMessage }) {
    return customMessage ?? 'must not be empty';
  },

  generateCode() {
    return 'NON_EMPTY';
  },
};
