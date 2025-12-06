/**
 * Babel Parser Configuration for .pmsg files
 *
 * This module provides the single source of truth for how .pmsg files
 * are parsed by Babel. All tools should use getBabelParserOptions()
 * to ensure consistent parsing behavior.
 */

import type { ParserOptions } from '@babel/parser';

/**
 * The canonical Babel parser options for .pmsg files.
 *
 * Changes to these options are semantically significant and should
 * be versioned accordingly.
 */
const BABEL_PARSER_OPTIONS: ParserOptions = {
  sourceType: 'module',
  plugins: [
    'typescript',
    // Support for decorators (legacy syntax for compatibility)
    'decorators-legacy',
    // Class features
    'classProperties',
    'classPrivateProperties',
    'classPrivateMethods',
    // Import attributes (import ... with { type: 'json' })
    'importAttributes',
    // Allow top-level await
    'topLevelAwait',
    // Export default from
    'exportDefaultFrom',
  ],
};

/**
 * Returns the Babel parser options used for .pmsg files.
 *
 * This is the single source of truth for parsing configuration.
 * External tools and tests should use this function to parse .pmsg
 * files in a compatible way.
 *
 * @returns A shallow copy of the parser options to prevent accidental mutation.
 */
export function getBabelParserOptions(): ParserOptions {
  return {
    ...BABEL_PARSER_OPTIONS,
    plugins: [...BABEL_PARSER_OPTIONS.plugins ?? []],
  };
}
