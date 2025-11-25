import { pathTransform } from './utils';
import { registerTypeAlias } from './validation';
import { ensureBaseImport } from './base-import';
import { createMessageReferenceResolver, type MessageReferenceResolver } from './message-lookup';
import { buildDeclarations, GENERATED_ALIAS } from './declarations';

export type PropaneState = {
  usesPropaneBase: boolean;
  usesImmutableMap: boolean;
  usesImmutableSet: boolean;
  usesImmutableArray: boolean;
  usesEquals: boolean;
  usesImmutableDate: boolean;
  usesImmutableUrl: boolean;
  usesImmutableArrayBuffer: boolean;
  file?: { opts?: { filename?: string | null } };
};

export default function propanePlugin() {
  const declaredTypeNames = new Set<string>();
  const declaredMessageTypeNames = new Set<string>();
  const getMessageReferenceName: MessageReferenceResolver = createMessageReferenceResolver(declaredMessageTypeNames);

  return {
    name: 'propane-plugin',
    visitor: {
      Program: {
        enter(path: any, state: PropaneState) {
          state.usesPropaneBase = false;
          state.usesImmutableMap = false;
          state.usesImmutableSet = false;
          state.usesImmutableArray = false;
          state.usesEquals = false;
          state.usesImmutableDate = false;
          state.usesImmutableUrl = false;
          state.usesImmutableArrayBuffer = false;

          const fileOpts = (state.file && state.file.opts) || {};
          const filename = fileOpts.filename || '';
          const relative = filename
            ? pathTransform(filename)
            : 'unknown';
          const commentText = `Generated from ${relative}`;

          const existing = (path.node.leadingComments || []).some(
            (comment: any) => comment.value.trim() === commentText
          );

          if (!existing) {
            path.addComment('leading', ` ${commentText}`, true);
            path.addComment('leading', ' eslint-disable @typescript-eslint/no-namespace', false);
          }
        },
        exit(path: any, state: PropaneState) {
          if (state.usesPropaneBase) {
            ensureBaseImport(path, state);
          }
        },
      },
      ExportNamedDeclaration(path: any, state: PropaneState) {
        if (!path.parentPath.isProgram()) {
          return;
        }
        const declarationPath = path.get('declaration');
        if (!declarationPath.isTSTypeAliasDeclaration()) {
          return;
        }

        if (declarationPath.node && declarationPath.node[GENERATED_ALIAS]) {
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
      TSTypeAliasDeclaration(path: any, state: PropaneState) {
        if (path.parentPath.isExportNamedDeclaration()) {
          return;
        }

        if (path.node && path.node[GENERATED_ALIAS]) {
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
