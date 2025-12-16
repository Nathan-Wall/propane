/**
 * MaxCharLength validator definition.
 * Validates that a string has at most the specified number of Unicode characters.
 * Unlike MaxLength, this counts code points, not UTF-16 code units.
 */

import type { ValidatorDefinition } from '../registry.js';

export const MaxCharLengthDefinition: ValidatorDefinition = {
  name: 'MaxCharLength',

  generateJs({ valueExpr, params, imports }) {
    const [maxLen] = params as [number];
    imports.add('charLength', '@propanejs/runtime');
    return { condition: `charLength(${valueExpr}) <= ${maxLen}` };
  },

  generateSql({ columnName, params }) {
    const [maxLen] = params as [number];
    // PostgreSQL char_length counts characters, not bytes
    return `char_length(${columnName}) <= ${maxLen}`;
  },

  generateMessage({ params, customMessage }) {
    if (customMessage) return customMessage;
    const [maxLen] = params as [number];
    return `must have at most ${maxLen} ${maxLen === 1 ? 'character' : 'characters'}`;
  },

  generateCode() {
    return 'MAX_CHAR_LENGTH';
  },
};
