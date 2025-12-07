import path from 'node:path';
import * as t from '@babel/types';
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
const KNOWN_DECORATORS = ['extend'];

/** Maximum edit distance for suggesting a decorator correction */
const MAX_SUGGESTION_DISTANCE = 3;

/**
 * Pattern to match @extend decorator with path argument.
 * Captures the path in single or double quotes.
 */
const EXTEND_PATTERN = /(?:^|\s)@extend\s*\(\s*['"]([^'"]+)['"]\s*\)/;

/**
 * Known message wrapper types and their source packages.
 */
const MESSAGE_WRAPPER_SOURCES: Record<string, Set<string>> = {
  '@propanejs/runtime': new Set(['Message']),
  '@propanejs/postgres': new Set(['Table']),
  '@propanejs/pms-core': new Set(['Endpoint']),
};

/**
 * Internal path patterns that map to package names.
 */
const INTERNAL_PATH_PATTERNS: Record<string, string> = {
  '@/runtime': '@propanejs/runtime',
  '@/postgres': '@propanejs/postgres',
  '@/pms-core': '@propanejs/pms-core',
};

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
 * Result of wrapper detection.
 */
interface WrapperDetectionResult {
  isMessageWrapper: boolean;
  wrapperName: string | null;
  innerType: t.TSTypeLiteral | null;
  secondTypeArg: t.TSType | null;
}

/**
 * Get the type name from a TSEntityName.
 */
function getTypeName(typeName: t.TSEntityName): string {
  if (t.isIdentifier(typeName)) {
    return typeName.name;
  }
  return `${getTypeName(typeName.left)}.${typeName.right.name}`;
}

/**
 * Check if a local name is imported as a message wrapper from a known package.
 */
function isMessageWrapperImport(
  localName: string,
  path: NodePath<t.TSTypeAliasDeclaration>
): boolean {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const program = (path as any).findParent(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (p: any) => p.isProgram()
  ) as NodePath<t.Program> | null;
  if (!program) return false;

  for (const stmt of program.node.body) {
    if (!t.isImportDeclaration(stmt)) continue;

    const source = stmt.source.value;

    // Check direct package imports
    const wrappers = MESSAGE_WRAPPER_SOURCES[source];
    if (wrappers) {
      for (const spec of stmt.specifiers) {
        if (t.isImportSpecifier(spec)) {
          const imported = t.isIdentifier(spec.imported)
            ? spec.imported.name
            : spec.imported.value;
          if (spec.local.name === localName && wrappers.has(imported)) {
            return true;
          }
        }
      }
    }

    // Check internal path patterns
    for (const [pattern, packageName] of Object.entries(INTERNAL_PATH_PATTERNS)) {
      if (source.startsWith(pattern)) {
        const pkgWrappers = MESSAGE_WRAPPER_SOURCES[packageName];
        if (pkgWrappers) {
          for (const spec of stmt.specifiers) {
            if (t.isImportSpecifier(spec)) {
              const imported = t.isIdentifier(spec.imported)
                ? spec.imported.name
                : spec.imported.value;
              if (spec.local.name === localName && pkgWrappers.has(imported)) {
                return true;
              }
            }
          }
        }
      }
    }
  }

  return false;
}

/**
 * Detect if a type alias is a message wrapper (Message<T>, Table<T>, or Endpoint<P, R>).
 */
function detectMessageWrapper(
  typeAliasPath: NodePath<t.TSTypeAliasDeclaration>
): WrapperDetectionResult {
  const result: WrapperDetectionResult = {
    isMessageWrapper: false,
    wrapperName: null,
    innerType: null,
    secondTypeArg: null,
  };

  const typeAnnotation = typeAliasPath.node.typeAnnotation;

  // Must be a type reference
  if (!t.isTSTypeReference(typeAnnotation)) {
    return result;
  }

  // Must have type parameters
  const typeParams = typeAnnotation.typeParameters;
  if (!typeParams || typeParams.params.length === 0) {
    return result;
  }

  const localName = getTypeName(typeAnnotation.typeName);
  const firstArg = typeParams.params[0];

  // Check if first argument is an object literal
  if (!firstArg || !t.isTSTypeLiteral(firstArg)) {
    return result;
  }

  // Check if this is imported as a message wrapper
  if (!isMessageWrapperImport(localName, typeAliasPath)) {
    return result;
  }

  result.isMessageWrapper = true;
  result.wrapperName = localName;
  result.innerType = firstArg;
  result.secondTypeArg = typeParams.params[1] ?? null;

  return result;
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
 * @param isMessageWrapper - Whether this is a Message/Table/Endpoint wrapper
 * @param opts - Plugin options
 */
function extractExtendDecorator(
  typeAliasPath: NodePath<t.TSTypeAliasDeclaration>,
  commentSourcePath: NodePath<t.Node>,
  isMessageWrapper: boolean,
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

      // Check if the line contains @extend
      const hasExtendOnLine = /@extend(?!\w)/.test(cleanLine);

      if (hasExtendOnLine) {
        // Parse the full @extend decorator
        const extendMatch = EXTEND_PATTERN.exec(cleanLine);

        if (!extendMatch) {
          // Check for specific syntax errors
          if (/^\s*@extend\s*$/.test(cleanLine)) {
            throw typeAliasPath.buildCodeFrameError(
              '@extend decorator requires parentheses with a file path.\n\n'
              + 'Add the path to your extension file in parentheses, e.g.:\n'
              + "  // @extend('./foo.ext.ts')"
            );
          }
          if (/@extend\s*\(\s*\)/.test(cleanLine)) {
            throw typeAliasPath.buildCodeFrameError(
              '@extend decorator requires a file path argument.\n\n'
              + 'Provide the path to your extension file, e.g.:\n'
              + "  // @extend('./foo.ext.ts')"
            );
          }
          if (/@extend\s*\([^)]*$/.test(cleanLine)) {
            throw typeAliasPath.buildCodeFrameError(
              '@extend decorator has unclosed parentheses.\n\n'
              + 'Add the closing parenthesis:\n'
              + "  // @extend('./foo.ext.ts')"
            );
          }
          throw typeAliasPath.buildCodeFrameError(
            'Invalid @extend decorator syntax.\n\n'
            + "Expected: // @extend('./path/to/extension.ts')"
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
          if (decoratorName.toLowerCase() === 'extend') {
            continue; // Already handled above
          }
          // Special error for deprecated @message
          if (decoratorName.toLowerCase() === 'message') {
            throw typeAliasPath.buildCodeFrameError(
              `The @message decorator has been replaced by the Message<T> wrapper.\n\n`
              + `Change to: export type ${typeAliasPath.node.id.name} = Message<{ ... }>;`
            );
          }
          // Unknown decorator - check if it might be a typo
          const suggestion = findClosestDecorator(decoratorName);
          const error = suggestion ? typeAliasPath.buildCodeFrameError(
              `Unknown decorator '@${decoratorName}'. Did you mean '@${suggestion}'?\n\n`
              + `Use '@${suggestion}' to extend this type with custom methods:\n`
              + `  // @${suggestion}('./foo.ext.ts')`
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

  // Validate that @extend requires a message wrapper
  if (extendInfos.length > 0 && !isMessageWrapper) {
    throw typeAliasPath.buildCodeFrameError(
      '@extend decorator requires a Message<T> wrapper.\n\n'
      + 'Use a message wrapper type:\n'
      + "  // @extend('./foo.ext.ts')\n"
      + '  export type Foo = Message<{ ... }>;'
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

        // Register the type alias for reference tracking (even if not a message)
        registerTypeAlias(declarationPath.node, declaredTypeNames);

        // Check for Message<T>/Table<T>/Endpoint<P,R> wrapper or implicit message flag
        type ImplicitNode = t.TSTypeAliasDeclaration & {
          [IMPLICIT_MESSAGE]?: boolean;
        };
        const isImplicitMessage =
          (declarationPath.node as ImplicitNode)[IMPLICIT_MESSAGE];
        const wrapperResult = detectMessageWrapper(declarationPath);
        const isMessage = isImplicitMessage || wrapperResult.isMessageWrapper;

        // If not a message wrapper, skip transformation but still validate decorators
        // and apply Brand auto-namespace transformation
        if (!isMessage) {
          // Still extract @extend to validate it's not used without a message wrapper
          extractExtendDecorator(
            declarationPath, path, false, state.opts
          );

          // Apply Brand auto-namespace transformation for non-message types
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

        // Register the type alias for reference tracking (even if not a message)
        registerTypeAlias(path.node, declaredTypeNames);

        // Check for Message<T>/Table<T>/Endpoint<P,R> wrapper or implicit message flag
        const isImplicitMessage = (path.node as t.TSTypeAliasDeclaration & {
          [IMPLICIT_MESSAGE]?: boolean;
        })[IMPLICIT_MESSAGE];
        const wrapperResult = detectMessageWrapper(path);
        const isMessage = isImplicitMessage || wrapperResult.isMessageWrapper;

        // If not a message wrapper, skip transformation but still validate decorators
        // and apply Brand auto-namespace transformation
        if (!isMessage) {
          // Still extract @extend to validate it's not used without a message wrapper
          extractExtendDecorator(path, path, false, state.opts);

          // Apply Brand auto-namespace transformation for non-message types
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
