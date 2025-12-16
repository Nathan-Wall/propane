/**
 * Length validator definition.
 * Validates that a string or array has length within the specified range.
 */

import type { ValidatorDefinition } from '../registry.js';

export const LengthDefinition: ValidatorDefinition = {
  name: 'Length',

  generateJs({ valueExpr, params }) {
    const [minLen, maxLen] = params as [number, number];
    return { condition: `${valueExpr}.length >= ${minLen} && ${valueExpr}.length <= ${maxLen}` };
  },

  generateSql({ columnName, params }) {
    const [minLen, maxLen] = params as [number, number];
    return `length(${columnName}) >= ${minLen} AND length(${columnName}) <= ${maxLen}`;
  },

  generateMessage({ params, customMessage }) {
    if (customMessage) return customMessage;
    const [minLen, maxLen] = params as [number, number];
    return `must have length between ${minLen} and ${maxLen}`;
  },

  generateCode() {
    return 'LENGTH';
  },
};
