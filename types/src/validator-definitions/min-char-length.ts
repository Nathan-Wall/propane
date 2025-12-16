/**
 * MinCharLength validator definition.
 * Validates that a string has at least the specified number of Unicode characters.
 * Unlike MinLength, this counts code points, not UTF-16 code units.
 */

import type { ValidatorDefinition } from '../registry.js';

export const MinCharLengthDefinition: ValidatorDefinition = {
  name: 'MinCharLength',

  generateJs({ valueExpr, params, imports }) {
    const [minLen] = params as [number];
    imports.add('charLength', '@propanejs/runtime');
    return { condition: `charLength(${valueExpr}) >= ${minLen}` };
  },

  generateSql({ columnName, params }) {
    const [minLen] = params as [number];
    // PostgreSQL char_length counts characters, not bytes
    return `char_length(${columnName}) >= ${minLen}`;
  },

  generateMessage({ params, customMessage }) {
    if (customMessage) return customMessage;
    const [minLen] = params as [number];
    return `must have at least ${minLen} ${minLen === 1 ? 'character' : 'characters'}`;
  },

  generateCode() {
    return 'MIN_CHAR_LENGTH';
  },
};
