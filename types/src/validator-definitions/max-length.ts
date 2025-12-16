/**
 * MaxLength validator definition.
 * Validates that a string or array has at most the specified number of elements.
 */

import type { ValidatorDefinition } from '../registry.js';

export const MaxLengthDefinition: ValidatorDefinition = {
  name: 'MaxLength',

  generateJs({ valueExpr, params }) {
    const [maxLen] = params as [number];
    return { condition: `${valueExpr}.length <= ${maxLen}` };
  },

  generateSql({ columnName, params }) {
    const [maxLen] = params as [number];
    return `length(${columnName}) <= ${maxLen}`;
  },

  generateMessage({ params, customMessage }) {
    if (customMessage) return customMessage;
    const [maxLen] = params as [number];
    return `must have at most ${maxLen} ${maxLen === 1 ? 'element' : 'elements'}`;
  },

  generateCode() {
    return 'MAX_LENGTH';
  },
};
