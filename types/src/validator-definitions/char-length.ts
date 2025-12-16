/**
 * CharLength validator definition.
 * Validates that a string has Unicode character length within the specified range.
 * Unlike Length, this counts code points, not UTF-16 code units.
 */

import type { ValidatorDefinition } from '../registry.js';

export const CharLengthDefinition: ValidatorDefinition = {
  name: 'CharLength',

  generateJs({ valueExpr, params, imports }) {
    const [minLen, maxLen] = params as [number, number];
    imports.add('charLength', '@propanejs/runtime');
    return { condition: `charLength(${valueExpr}) >= ${minLen} && charLength(${valueExpr}) <= ${maxLen}` };
  },

  generateSql({ columnName, params }) {
    const [minLen, maxLen] = params as [number, number];
    // PostgreSQL char_length counts characters, not bytes
    return `char_length(${columnName}) >= ${minLen} AND char_length(${columnName}) <= ${maxLen}`;
  },

  generateMessage({ params, customMessage }) {
    if (customMessage) return customMessage;
    const [minLen, maxLen] = params as [number, number];
    return `must have character length between ${minLen} and ${maxLen}`;
  },

  generateCode() {
    return 'CHAR_LENGTH';
  },
};
