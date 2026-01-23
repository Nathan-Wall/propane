/**
 * Decorator Extraction
 *
 * Extracts @extend decorator from comments above type aliases.
 *
 * Note: The @message decorator has been replaced by the Message<T> wrapper type.
 * See runtime/common/types/message-wrapper.ts.
 */

import type * as t from '@babel/types';
import type { PmtDiagnostic, SourceLocation } from './types.js';
import { getSourceLocation } from './type-parser.js';

/**
 * Result of decorator extraction.
 */
export interface DecoratorInfo {
  /** Path from @extend decorator, if present */
  extendPath: string | null;
  /** Override for message type ID from @typeId decorator, if present */
  typeId: string | null;
  /** True if @compact decorator is present */
  compact: boolean;
  /** Optional tiny tag from @compact('X') */
  compactTag: string | null;
}

/**
 * Pattern to match @extend decorator with path argument.
 * Captures the path in single or double quotes.
 */
const EXTEND_PATTERN = /(?:^|\s)@extend\s*\(\s*['"]([^'"]+)['"]\s*\)/;
const TYPE_ID_PATTERN = /(?:^|\s)@typeId\s*\(\s*['"]([^'"]+)['"]\s*\)/;
const COMPACT_PATTERN = /(?:^|\s)@compact(?!\w)/;
const COMPACT_TAG_PATTERN = /(?:^|\s)@compact\s*\(\s*['"]([^'"]+)['"]\s*\)/;

/**
 * Pattern to detect any decorator-like syntax at the start of a line.
 * Only matches decorators that are at the beginning of a comment line
 * (after optional whitespace and asterisk).
 */
const DECORATOR_LINE_PATTERN = /^\s*\*?\s*@(\w+)/;

/**
 * Known decorators for validation.
 * Note: @message is no longer supported - use Message<T> wrapper instead.
 */
const KNOWN_DECORATORS = new Set(['extend', 'typeid', 'compact']);

/**
 * Extract decorator info from leading comments of a node.
 */
export function extractDecorators(
  node: t.Node,
  filePath: string,
  diagnostics: PmtDiagnostic[]
): DecoratorInfo {
  const comments = node.leadingComments ?? [];
  let extendPath: string | null = null;
  let extendCount = 0;
  let typeId: string | null = null;
  let typeIdCount = 0;
  let compact = false;
  let compactCount = 0;
  let compactTag: string | null = null;
  let compactTagLocation: SourceLocation | null = null;

  for (const comment of comments) {
    const lines = comment.type === 'CommentLine'
      ? [comment.value]
      : comment.value.split('\n');

    for (const line of lines) {
      // Strip leading comment markers (* for block comments)
      const cleanLine = line.replace(/^\s*\*?\s*/, '');

      // Check for @extend
      const extendMatch = EXTEND_PATTERN.exec(cleanLine);
      if (extendMatch) {
        extendCount++;
        if (extendCount > 1) {
          diagnostics.push({
            filePath,
            location: getCommentLocation(comment),
            severity: 'error',
            code: 'PMT030',
            message: 'Multiple @extend decorators are not allowed on a single type.',
          });
        } else {
          extendPath = extendMatch[1] ?? null;
        }
      }

      // Check for @typeId
      const typeIdMatch = TYPE_ID_PATTERN.exec(cleanLine);
      if (typeIdMatch) {
        typeIdCount++;
        if (typeIdCount > 1) {
          diagnostics.push({
            filePath,
            location: getCommentLocation(comment),
            severity: 'error',
            code: 'PMT036',
            message: 'Multiple @typeId decorators are not allowed on a single type.',
          });
        } else {
          typeId = typeIdMatch[1] ?? null;
        }
      }

      // Check for @compact
      if (COMPACT_PATTERN.test(cleanLine)) {
        compactCount++;
        if (compactCount > 1) {
          diagnostics.push({
            filePath,
            location: getCommentLocation(comment),
            severity: 'error',
            code: 'PMT039',
            message: 'Multiple @compact decorators are not allowed on a single type.',
          });
        } else {
          compact = true;
          const compactTagMatch = COMPACT_TAG_PATTERN.exec(cleanLine);
          if (compactTagMatch) {
            compactTag = compactTagMatch[1] ?? null;
            compactTagLocation = getCommentLocation(comment);
          }
        }
      }

      // Check for malformed @extend
      if (
        /@extend(?!\s*\()/.test(cleanLine)
        && !EXTEND_PATTERN.test(cleanLine)
      ) {
        // Has @extend but not valid syntax
        const endsWithExtend = /^\s*@extend\s*$/.test(cleanLine)
          || /(?:^|\s)@extend\s*$/.test(cleanLine);
        if (endsWithExtend) {
          diagnostics.push({
            filePath,
            location: getCommentLocation(comment),
            severity: 'error',
            code: 'PMT031',
            message: "@extend decorator requires parentheses with a file path, e.g. @extend('./foo.ext.ts').",
          });
        } else if (/@extend\s*\(\s*\)/.test(cleanLine)) {
          diagnostics.push({
            filePath,
            location: getCommentLocation(comment),
            severity: 'error',
            code: 'PMT032',
            message: '@extend decorator requires a file path argument.',
          });
        }
      }

      if (
        /@typeId(?!\s*\()/.test(cleanLine)
        && !TYPE_ID_PATTERN.test(cleanLine)
      ) {
        const endsWithTypeId = /^\s*@typeId\s*$/.test(cleanLine)
          || /(?:^|\s)@typeId\s*$/.test(cleanLine);
        if (endsWithTypeId) {
          diagnostics.push({
            filePath,
            location: getCommentLocation(comment),
            severity: 'error',
            code: 'PMT037',
            message: "@typeId decorator requires parentheses with a string value, e.g. @typeId('com.example:messages/user').",
          });
        } else if (/@typeId\s*\(\s*\)/.test(cleanLine)) {
          diagnostics.push({
            filePath,
            location: getCommentLocation(comment),
            severity: 'error',
            code: 'PMT038',
            message: '@typeId decorator requires a string argument.',
          });
        }
      }

      if (
        /@compact(?!\s*$)/.test(cleanLine)
        && /@compact\s*\(/.test(cleanLine)
        && !COMPACT_TAG_PATTERN.test(cleanLine)
      ) {
        diagnostics.push({
          filePath,
          location: getCommentLocation(comment),
          severity: 'error',
          code: 'PMT040',
          message: '@compact decorator expects a single tag string, e.g. @compact(\'D\').',
        });
      }

      // Check for unknown decorators (including deprecated @message)
      // Only match decorators at the start of a line, not in prose text
      const decoratorMatch = DECORATOR_LINE_PATTERN.exec(line);
      if (decoratorMatch) {
        const decoratorName = decoratorMatch[1]?.toLowerCase();
        if (decoratorName && !KNOWN_DECORATORS.has(decoratorName)) {
          // Special message for @message which is now deprecated
          if (decoratorName === 'message') {
            diagnostics.push({
              filePath,
              location: getCommentLocation(comment),
              severity: 'error',
              code: 'PMT035',
              message: `The @message decorator has been replaced by the Message<T> wrapper. Change to: export type TypeName = Message<{ ... }>;`,
            });
          } else {
            // Check if it might be a typo of a known decorator
            const suggestion = findClosestDecorator(decoratorName);
            if (suggestion) {
              diagnostics.push({
                filePath,
                location: getCommentLocation(comment),
                severity: 'warning',
                code: 'PMT033',
                message: `Unknown decorator '@${decoratorMatch[1]}'. Did you mean '@${suggestion}'?`,
              });
            }
          }
        }
      }
    }
  }

  if (compactTag && !isValidCompactTag(compactTag)) {
    diagnostics.push({
      filePath,
      location: compactTagLocation ?? getSourceLocation(node),
      severity: 'error',
      code: 'PMT043',
      message: '@compact tag must be a single ASCII letter or "#".',
    });
  }

  return { extendPath, typeId, compact, compactTag };
}

/**
 * Get source location from a comment.
 */
function getCommentLocation(comment: t.Comment): SourceLocation {
  return {
    start: {
      line: comment.loc?.start.line ?? 0,
      column: comment.loc?.start.column ?? 0,
    },
    end: {
      line: comment.loc?.end.line ?? 0,
      column: comment.loc?.end.column ?? 0,
    },
  };
}

/**
 * Find the closest known decorator to an unknown one (for typo suggestions).
 */
function findClosestDecorator(unknown: string): string | null {
  // Simple Levenshtein distance check for common typos
  const maxDistance = 2;

  for (const known of KNOWN_DECORATORS) {
    if (levenshteinDistance(unknown, known) <= maxDistance) {
      return known;
    }
  }

  return null;
}

function isValidCompactTag(tag: string): boolean {
  return (tag.length === 1 && /[A-Za-z]/.test(tag)) || tag === '#';
}

/**
 * Simple Levenshtein distance implementation.
 */
function levenshteinDistance(a: string, b: string): number {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  const matrix: number[][] = [];

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0]![j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      const cost = a[j - 1] === b[i - 1] ? 0 : 1;
      matrix[i]![j] = Math.min(
        matrix[i - 1]![j]! + 1,
        matrix[i]![j - 1]! + 1,
        matrix[i - 1]![j - 1]! + cost
      );
    }
  }

  return matrix[b.length]![a.length]!;
}
