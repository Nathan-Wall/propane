import path from 'node:path';
import type * as t from '@babel/types';
import type { NodePath } from '@babel/traverse';
import { pathTransform } from './utils.js';
import { registerTypeAlias } from './validation.js';
import { ensureBaseImport, DEFAULT_RUNTIME_SOURCE } from './base-import.js';
import { createMessageReferenceResolver, type MessageReferenceResolver } from './message-lookup.js';
import { buildDeclarations, GENERATED_ALIAS } from './declarations.js';

export interface PropanePluginOptions {
  /** Custom import path for @propanejs/runtime. Defaults to '@propanejs/runtime'. */
  runtimeImportPath?: string;
  /** Base directory for resolving runtimeImportPath (typically the config file directory). */
  runtimeImportBase?: string;
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

        registerTypeAlias(declarationPath.node, declaredTypeNames);

        const replacement = buildDeclarations(declarationPath, {
          exported: true,
          state,
          declaredTypeNames,
          declaredMessageTypeNames,
          getMessageReferenceName,
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

        registerTypeAlias(path.node, declaredTypeNames);

        const replacement = buildDeclarations(path, {
          exported: false,
          state,
          declaredTypeNames,
          declaredMessageTypeNames,
          getMessageReferenceName,
        });

        if (replacement) {
          path.replaceWithMultiple(replacement);
        }
      },
    },
  };
}
