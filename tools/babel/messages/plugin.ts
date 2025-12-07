import path from 'node:path';
import type * as t from '@babel/types';
import type { NodePath } from '@babel/traverse';
import { pathTransform, computeRelativePath } from './utils.js';
import { registerTypeAlias } from './validation.js';
import { ensureBaseImport, DEFAULT_RUNTIME_SOURCE } from './base-import.js';
import { createMessageReferenceResolver, type MessageReferenceResolver } from './message-lookup.js';
import { buildDeclarations, GENERATED_ALIAS, IMPLICIT_MESSAGE } from './declarations.js';
import { levenshteinDistance } from '../../../common/strings/levenshtein.js';
import {
  type BrandImportTracker,
  createBrandImportTracker,
  trackBrandImport,
  transformBrandInTypeAlias,
} from './brand-transform.js';

export interface PropanePluginOptions {
  /** Custom import path for @propanejs/runtime. Defaults to '@propanejs/runtime'. */
  runtimeImportPath?: string;
  /** Base directory for resolving runtimeImportPath (typically the config file directory). */
  runtimeImportBase?: string;
  /** Path aliases for resolving @extend paths (mirrors tsconfig paths). */
  paths?: Record<string, string[]>;
  /** Base directory for resolving paths (typically the project root). */
  baseUrl?: string;
}

export interface ExtendInfo {
  /** The path to the extension file, e.g., './messages.ext.ts' */
  path: string;
}

export interface PropaneState {
  usesPropaneBase: boolean;
  usesImmutableMap: boolean;
  usesImmutableSet: boolean;
  usesImmutableArray: boolean;
  usesEquals: boolean;
  usesImmutableDate: boolean;
  usesImmutableUrl: boolean;
  usesImmutableArrayBuffer: boolean;
  usesTaggedMessageData: boolean;
  usesListeners: boolean;
  usesMessageConstructor: boolean;
  usesDataValue: boolean;
  usesParseCerealString: boolean;
  usesDataObject: boolean;
  hasGenericTypes: boolean;
  // Type-only import flags for GET_MESSAGE_CHILDREN yield type
  needsImmutableArrayType: boolean;
  needsImmutableSetType: boolean;
  needsImmutableMapType: boolean;
  runtimeImportPath: string;
  file?: { opts?: { filename?: string | null } };
  opts?: PropanePluginOptions;
  /** Map of type name to extension info for types with @extend decorator */
  extendedTypes: Map<string, ExtendInfo>;
  /** Tracks Brand imports for auto-namespace transformation */
  brandTracker: BrandImportTracker;
}

/**
 * Computes the runtime import path for the current file.
 * If runtimeImportBase is provided, computes the relative path from
 * the file being compiled to the runtime target.
 */
function computeRuntimeImportPath(state: PropaneState): string {
  const configuredPath = state.opts?.runtimeImportPath;
  const basePath = state.opts?.runtimeImportBase;
  const filename = state.file?.opts?.filename;

  // If no custom path configured, use default
  if (!configuredPath) {
    return DEFAULT_RUNTIME_SOURCE;
  }

  // If it's a package name (doesn't start with . or /), use as-is
  if (!configuredPath.startsWith('.') && !configuredPath.startsWith('/')) {
    return configuredPath;
  }

  // If no base path or filename, can't compute relative - use as-is
  if (!basePath || !filename) {
    return configuredPath;
  }

  // Compute absolute path to the runtime from the base directory
  const absoluteRuntimePath = path.resolve(basePath, configuredPath);

  // Compute relative path from the file's directory to the runtime
  const fileDir = path.dirname(filename);
  let relativePath = path.relative(fileDir, absoluteRuntimePath);

  // Ensure the path starts with ./ or ../
  if (!relativePath.startsWith('.')) {
    relativePath = './' + relativePath;
  }

  // Normalize to forward slashes for consistency
  return relativePath.replaceAll('\\', '/');
}

/** Known decorators for suggestion matching */
const KNOWN_DECORATORS = ['extend', 'message'];

/** Maximum edit distance for suggesting a decorator correction */
const MAX_SUGGESTION_DISTANCE = 3;

/**
 * Pattern to match @extend decorator with path argument.
 * Captures the path in single or double quotes.
 * Allows @message before @extend on the same line.
 */
const EXTEND_PATTERN =
  /^(?:@message\s+)?@extend\s*\(\s*['"]([^'"]+)['"]\s*\)\s*$/;

/**
 * Pattern to match @message decorator.
 * Matches @message at start of content, optionally followed by whitespace and more decorators.
 * Must not be followed by word characters (to avoid matching @messageOther).
 */
const MESSAGE_PATTERN = /(?:^|\s)@message(?:\s|$)/;

/**
 * Check if a comment line starts with a decorator (@ at line start).
 */
function isDecoratorLine(line: string): boolean {
  return /^\s*\*?\s*@\w/.test(line);
}

/**
 * Find the closest known decorator to an unknown one.
 */
function findClosestDecorator(unknown: string): string | null {
  let closest: string | null = null;
  let minDistance = Infinity;

  for (const known of KNOWN_DECORATORS) {
    const distance = levenshteinDistance(
      unknown.toLowerCase(), known.toLowerCase()
    );
    if (distance <= MAX_SUGGESTION_DISTANCE && distance < minDistance) {
      minDistance = distance;
      closest = known;
    }
  }

  return closest;
}

/**
 * Check if comments contain the @message decorator.
 * @message can appear alone or on the same line as @extend.
 */
function hasMessageDecorator(
  commentSourcePath: NodePath<t.Node>
): boolean {
  const comments = commentSourcePath.node.leadingComments ?? [];

  for (const comment of comments) {
    const lines = comment.type === 'CommentLine'
      ? [comment.value]
      : comment.value.split('\n');

    for (const line of lines) {
      // Strip leading comment markers (* for block comments)
      const cleanLine = line.replace(/^\s*\*?\s*/, '');

      // Check if @message appears in this line
      if (MESSAGE_PATTERN.test(cleanLine)) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Resolve an extension path, handling path aliases if configured.
 */
function resolveExtensionPath(
  extPath: string,
  sourceFilename: string,
  opts?: PropanePluginOptions
): string {
  let resolvedPath = extPath;

  // Handle path aliases (e.g., '@/' -> './src/')
  if (opts?.paths && opts?.baseUrl) {
    for (const [alias, targets] of Object.entries(opts.paths)) {
      const aliasPattern = alias.replace('*', '');
      if (extPath.startsWith(aliasPattern) && targets[0]) {
        const target = targets[0].replace('*', '');
        const remainder = extPath.slice(aliasPattern.length);
        // Compute relative path from source file to resolved target
        resolvedPath = computeRelativePath(
          sourceFilename,
          path.join(opts.baseUrl, target, remainder)
        );
        break;
      }
    }
  }

  // Convert .ts/.tsx to .js for the import
  return resolvedPath.replace(/\.tsx?$/, '.js');
}

/**
 * Extract @extend decorator info from leading comments of a type alias.
 * Throws descriptive errors for malformed or unknown decorators.
 *
 * @param typeAliasPath - The path to the TSTypeAliasDeclaration
 * @param commentSourcePath - The path to get comments from (may be parent export)
 * @param hasMessage - Whether the @message decorator is present
 * @param opts - Plugin options
 */
function extractExtendDecorator(
  typeAliasPath: NodePath<t.TSTypeAliasDeclaration>,
  commentSourcePath: NodePath<t.Node>,
  hasMessage: boolean,
  opts?: PropanePluginOptions
): ExtendInfo | null {
  const comments = commentSourcePath.node.leadingComments ?? [];
  const extendInfos: { comment: t.Comment; path: string }[] = [];
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  const sourceFilename = (typeAliasPath.hub?.file?.opts?.filename ?? '') as string;

  for (const comment of comments) {
    const lines = comment.type === 'CommentLine'
      ? [comment.value]
      : comment.value.split('\n');

    for (const line of lines) {
      // Check if this line starts with a decorator
      if (!isDecoratorLine(line)) {
        continue;
      }

      const cleanLine = line.replace(/^\s*\*?\s*/, '');

      // Check if the line contains @extend (possibly after @message on same line)
      const hasExtendOnLine = /@extend(?!\w)/.test(cleanLine);

      if (hasExtendOnLine) {
        // Parse the full @extend decorator
        const extendMatch = EXTEND_PATTERN.exec(cleanLine);

        if (!extendMatch) {
          // Check for specific syntax errors
          if (/^(?:@message\s+)?@extend\s*$/.test(cleanLine)) {
            throw typeAliasPath.buildCodeFrameError(
              '@extend decorator requires parentheses with a file path.\n\n'
              + 'Add the path to your extension file in parentheses, e.g.:\n'
              + "  // @message @extend('./foo.ext.ts')"
            );
          }
          if (/^(?:@message\s+)?@extend\s*\(\s*\)\s*$/.test(cleanLine)) {
            throw typeAliasPath.buildCodeFrameError(
              '@extend decorator requires a file path argument.\n\n'
              + 'Provide the path to your extension file, e.g.:\n'
              + "  // @message @extend('./foo.ext.ts')"
            );
          }
          if (/^(?:@message\s+)?@extend\s*\([^)]*$/.test(cleanLine)) {
            throw typeAliasPath.buildCodeFrameError(
              '@extend decorator has unclosed parentheses.\n\n'
              + 'Add the closing parenthesis:\n'
              + "  // @message @extend('./foo.ext.ts')"
            );
          }
          if (/^(?:@message\s+)?@extend\s*\([^)]+\)\s*\S/.test(cleanLine)) {
            throw typeAliasPath.buildCodeFrameError(
              'Unexpected content after @extend decorator.\n\n'
              + 'Remove the extra content after the closing parenthesis, '
              + 'or move it to a separate comment.'
            );
          }
          throw typeAliasPath.buildCodeFrameError(
            'Invalid @extend decorator syntax.\n\n'
            + "Expected: // @message @extend('./path/to/extension.ts')"
          );
        }

        const extPath = extendMatch[1]!;
        const resolvedPath = resolveExtensionPath(
          extPath, sourceFilename, opts
        );
        extendInfos.push({ comment, path: resolvedPath });
      } else {
        // No @extend on this line - check for unknown decorators
        // Find all decorator names on this line
        const decoratorMatches = cleanLine.matchAll(/@(\w+)/g);
        for (const match of decoratorMatches) {
          const decoratorName = match[1]!;
          // Skip known decorators
          if (decoratorName.toLowerCase() === 'message') {
            continue;
          }
          if (decoratorName.toLowerCase() === 'extend') {
            continue; // Already handled above
          }
          // Unknown decorator - check if it might be a typo
          const suggestion = findClosestDecorator(decoratorName);
          const error = suggestion ? typeAliasPath.buildCodeFrameError(
              `Unknown decorator '@${decoratorName}'. Did you mean '@${suggestion}'?\n\n`
              + `Use '@${suggestion}' to extend this type with custom methods:\n`
              + `  // @message @${suggestion}('./foo.ext.ts')`
            ) : typeAliasPath.buildCodeFrameError(
              `Unknown decorator '@${decoratorName}'.`
            );
          throw error;
        }
      }
    }
  }

  // Check for multiple @extend decorators
  if (extendInfos.length > 1) {
    throw typeAliasPath.buildCodeFrameError(
      'Multiple @extend decorators are not allowed on a single type.\n\n'
      + 'Each type can only be extended by one file. Remove one of the @extend decorators,\n'
      + 'or combine your extensions into a single file.'
    );
  }

  // Validate that @extend requires @message
  if (extendInfos.length > 0 && !hasMessage) {
    throw typeAliasPath.buildCodeFrameError(
      '@extend decorator requires @message decorator.\n\n'
      + 'Add @message to the type definition:\n'
      + "  // @message @extend('./foo.ext.ts')\n"
      + '  export type Foo = { ... };\n\n'
      + 'Or on separate lines:\n'
      + '  // @message\n'
      + "  // @extend('./foo.ext.ts')\n"
      + '  export type Foo = { ... };'
    );
  }

  return extendInfos.length > 0 ? { path: extendInfos[0]!.path } : null;
}

export default function propanePlugin() {
  const declaredTypeNames = new Set<string>();
  const declaredMessageTypeNames = new Set<string>();
  const getMessageReferenceName: MessageReferenceResolver =
    createMessageReferenceResolver(declaredMessageTypeNames);

  return {
    name: 'propane-plugin',
    visitor: {
      Program: {
        enter(path: NodePath<t.Program>, state: PropaneState) {
          state.usesPropaneBase = false;
          state.usesImmutableMap = false;
          state.usesImmutableSet = false;
          state.usesImmutableArray = false;
          state.usesEquals = false;
          state.usesImmutableDate = false;
          state.usesImmutableUrl = false;
          state.usesImmutableArrayBuffer = false;
          state.usesTaggedMessageData = false;
          state.usesListeners = false;
          state.usesMessageConstructor = false;
          state.usesDataValue = false;
          state.usesParseCerealString = false;
          state.usesDataObject = false;
          state.hasGenericTypes = false;
          state.needsImmutableArrayType = false;
          state.needsImmutableSetType = false;
          state.needsImmutableMapType = false;
          state.runtimeImportPath = computeRuntimeImportPath(state);
          state.extendedTypes = new Map();
          state.brandTracker = createBrandImportTracker();

          const fileOpts = state.file?.opts ?? {};
          const filename = fileOpts.filename ?? '';
          const relative = filename
            ? pathTransform(filename)
            : 'unknown';
          const commentText = `Generated from ${relative}`;

          const existing = (path.node.leadingComments ?? []).some(
            (comment) => comment.value.trim() === commentText
          );

          if (!existing) {
            path.addComment('leading', ` ${commentText}`, true);
          }
        },
        exit(path: NodePath<t.Program>, state: PropaneState) {
          if (state.usesPropaneBase) {
            ensureBaseImport(path, state);
          }

          // Note: We don't generate re-exports for extended types because it causes
          // circular dependency issues with ES modules. Users should import the
          // extended class directly from the extension file instead.
          // Example: import { Person } from './person.ext.ts'

          // Add eslint-disable comment based on what was encountered
          // Generic types need no-explicit-any for Message<any> constraints
          const eslintDisables = ['@typescript-eslint/no-namespace'];
          if (state.hasGenericTypes) {
            eslintDisables.push('@typescript-eslint/no-explicit-any');
          }

          const eslintComment = ` eslint-disable ${eslintDisables.join(',')}`;
          const hasEslintComment = (path.node.leadingComments ?? []).some(
            (comment) => comment.value.includes('eslint-disable')
          );

          if (!hasEslintComment) {
            path.addComment('leading', eslintComment, false);
          }
        },
      },
      ImportDeclaration(
        path: NodePath<t.ImportDeclaration>,
        state: PropaneState
      ) {
        // Track Brand imports for auto-namespace transformation
        trackBrandImport(path.node, state.brandTracker);
      },
      ExportNamedDeclaration(
        path: NodePath<t.ExportNamedDeclaration>,
        state: PropaneState
      ) {
        if (!path.parentPath?.isProgram()) {
          return;
        }
        const declarationPath = path.get('declaration');
        if (
          Array.isArray(declarationPath)
          || !declarationPath.isTSTypeAliasDeclaration()
        ) {
          return;
        }

        if (
          declarationPath.node
          && (declarationPath.node as t.TSTypeAliasDeclaration & {
            [GENERATED_ALIAS]?: boolean;
          })[GENERATED_ALIAS]
        ) {
          return;
        }

        // Register the type alias for reference tracking (even if not @message)
        registerTypeAlias(declarationPath.node, declaredTypeNames);

        // Check for @message decorator or implicit message flag
        // For exported types, comments are on the export declaration
        type ImplicitNode = t.TSTypeAliasDeclaration & {
          [IMPLICIT_MESSAGE]?: boolean;
        };
        const isImplicitMessage =
          (declarationPath.node as ImplicitNode)[IMPLICIT_MESSAGE];
        const hasMessage = isImplicitMessage || hasMessageDecorator(path);

        // If no @message decorator, skip transformation but still validate decorators
        // and apply Brand auto-namespace transformation
        if (!hasMessage) {
          // Still extract @extend to validate it's not used without @message
          extractExtendDecorator(
            declarationPath, path, false, state.opts
          );

          // Apply Brand auto-namespace transformation for non-@message types
          const brandResult = transformBrandInTypeAlias(
            declarationPath, state.brandTracker
          );

          if (brandResult.transformed) {
            // Insert symbol declarations before the export
            // Use replaceWithMultiple to prepend declarations to the original export
            const replacement: t.Statement[] = [
              ...brandResult.symbolDeclarations,
              path.node,
            ];
            path.replaceWithMultiple(replacement);
          }

          return;
        }

        // Extract @extend decorator if present
        const extendInfo = extractExtendDecorator(
          declarationPath, path, true, state.opts
        );
        const typeName = declarationPath.node.id.name;

        // Track extended types for re-export generation
        if (extendInfo) {
          state.extendedTypes.set(typeName, extendInfo);
        }

        const replacement = buildDeclarations(declarationPath, {
          exported: true,
          state,
          declaredTypeNames,
          declaredMessageTypeNames,
          getMessageReferenceName,
          extendInfo: extendInfo ?? undefined,
          brandTracker: state.brandTracker,
        });

        if (replacement) {
          path.replaceWithMultiple(replacement);
        }
      },
      TSTypeAliasDeclaration(
        path: NodePath<t.TSTypeAliasDeclaration>,
        state: PropaneState
      ) {
        if (path.parentPath?.isExportNamedDeclaration()) {
          return;
        }

        if (
          path.node
          && (path.node as t.TSTypeAliasDeclaration & {
            [GENERATED_ALIAS]?: boolean;
          })[GENERATED_ALIAS]
        ) {
          return;
        }

        // Register the type alias for reference tracking (even if not @message)
        registerTypeAlias(path.node, declaredTypeNames);

        // Check for @message decorator or implicit message flag (for generated inline types)
        // For non-exported types, comments are directly on the type alias
        const isImplicitMessage = (path.node as t.TSTypeAliasDeclaration & {
          [IMPLICIT_MESSAGE]?: boolean;
        })[IMPLICIT_MESSAGE];
        const hasMessage = isImplicitMessage || hasMessageDecorator(path);

        // If no @message decorator, skip transformation but still validate decorators
        // and apply Brand auto-namespace transformation
        if (!hasMessage) {
          // Still extract @extend to validate it's not used without @message
          extractExtendDecorator(path, path, false, state.opts);

          // Apply Brand auto-namespace transformation for non-@message types
          const brandResult = transformBrandInTypeAlias(
            path, state.brandTracker
          );

          if (brandResult.transformed) {
            // Insert symbol declarations before the type alias
            // Use replaceWithMultiple to prepend declarations to the original type alias
            const replacement: t.Statement[] = [
              ...brandResult.symbolDeclarations,
              path.node,
            ];
            path.replaceWithMultiple(replacement);
          }

          return;
        }

        // Extract @extend decorator if present
        const extendInfo = extractExtendDecorator(path, path, true, state.opts);
        const typeName = path.node.id.name;

        // Track extended types for re-export generation
        if (extendInfo) {
          state.extendedTypes.set(typeName, extendInfo);
        }

        const replacement = buildDeclarations(path, {
          exported: false,
          state,
          declaredTypeNames,
          declaredMessageTypeNames,
          getMessageReferenceName,
          extendInfo: extendInfo ?? undefined,
          brandTracker: state.brandTracker,
        });

        if (replacement) {
          path.replaceWithMultiple(replacement);
        }
      },
    },
  };
}
