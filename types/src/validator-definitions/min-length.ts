/**
 * MinLength validator definition.
 * Validates that a string or array has at least the specified number of elements.
 */

import type { ValidatorDefinition } from '../registry.js';

export const MinLengthDefinition: ValidatorDefinition = {
  name: 'MinLength',

  generateJs({ valueExpr, params }) {
    const [minLen] = params as [number];
    return { condition: `${valueExpr}.length >= ${minLen}` };
  },

  generateSql({ columnName, params }) {
    const [minLen] = params as [number];
    return `length(${columnName}) >= ${minLen}`;
  },

  generateMessage({ params, customMessage }) {
    if (customMessage) return customMessage;
    const [minLen] = params as [number];
    return `must have at least ${minLen} ${minLen === 1 ? 'element' : 'elements'}`;
  },

  generateCode() {
    return 'MIN_LENGTH';
  },
};
