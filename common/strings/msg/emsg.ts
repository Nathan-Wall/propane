import {truncate} from '../truncate.js';

import {msg} from './implementation.js';

const MAX_VAR_LENGTH = 128;

// Supports easy error message formatting. Arguments will be converted into
// strings intelligently based on type using `stringify`.
export function emsg(
  strings: TemplateStringsArray,
  ...args: unknown[]
): () => string {
  // By returning a function, we allow skipping running `stringify` when the
  // error message won't be needed.
  return () => tmsg(strings, ...args);
}

// Supports an 'immediate call' case for emsg, first use was for tests thus 't'
export function tmsg(
  strings: TemplateStringsArray,
  ...args: unknown[]
): string {
  return msg(strings, ...args.map(u => stringify(u)));
}

export function stringify(value: unknown): string {
  if (value === null) {
    return '(null)';
  }
  switch (typeof value) {
    case 'boolean':
    case 'number':
      return String(value);
    case 'string':
      return smartString(value);
    case 'object': {
      const name =  value.constructor?.name;
      return (name ? stringify(name) + ' ' : '')
        + stringifyObject( value);
    }
    case 'undefined':
      return '(undefined)';
    case 'bigint':
      return `${stringify(String(value))}n`;
    case 'function':
      return special('function', value.name);
    case 'symbol':
      return special('symbol', value.description);
  }
  return special('unknown');
}

function stringifyObject(value: object): string {
  if (value instanceof RegExp) {
    return String(value);
  }
  if (value instanceof Error) {
    if (value.message) {
      return stringify('Error: ' + value.message);
    }
    return '[Unknown Error]';
  }
  try {
    return JSON.stringify(value);
  } catch {
    // Circular objects can't be stringified with `JSON.stringify`.
    return '[Object <circular>]';
  }
}

// Similar to JSON.stringify but drops surrounding quotes when possible.
function smartString(value: string): string {
  const s = truncate(value, MAX_VAR_LENGTH);
  if (s !== value) {
    return truncateQuotedString(JSON.stringify(s));
  }
  const stringified = JSON.stringify(value);
  if (value !== '' && stringified === `"${value}"` && !/\s/.test(value)) {
    return value;
  }
  return truncateQuotedString(stringified);
}

function truncateQuotedString(s: string) {
  // Intetionally avoiding using `assert` here to prevent a circular dependency.
  if (!s.startsWith('"') || !s.endsWith('"')) {
    throw new Error('Invalid quoted string: ' + JSON.stringify(s));
  }
  return '"' + truncate(s.slice(1, - 1), MAX_VAR_LENGTH - 2) + '"';
}

function special(type: string, name?: string): string {
  if (name) {
    return `<${type} ${stringify(name)}>`;
  }
  return `<${type}>`;
}
