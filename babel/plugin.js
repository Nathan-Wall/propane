import { pathTransform } from './utils.js';
import { registerTypeAlias } from './validation.js';
import { ensureBaseImport } from './base-import.js';
import { createMessageReferenceResolver } from './message-lookup.js';
import { buildDeclarations, GENERATED_ALIAS } from './declarations.js';
export default function propanePlugin() {
    const declaredTypeNames = new Set();
    const declaredMessageTypeNames = new Set();
    const getMessageReferenceName = createMessageReferenceResolver(declaredMessageTypeNames);
    return {
        name: 'propane-plugin',
        visitor: {
            Program: {
                enter(path, state) {
                    state.usesPropaneBase = false;
                    state.usesImmutableMap = false;
                    state.usesImmutableSet = false;
                    state.usesImmutableArray = false;
                    state.usesEquals = false;
                    state.usesImmutableDate = false;
                    state.usesImmutableUrl = false;
                    state.usesImmutableArrayBuffer = false;
                    state.usesTaggedMessageData = false;
                    const fileOpts = state.file?.opts ?? {};
                    const filename = fileOpts.filename ?? '';
                    const relative = filename
                        ? pathTransform(filename)
                        : 'unknown';
                    const commentText = `Generated from ${relative}`;
                    const existing = (path.node.leadingComments ?? []).some((comment) => comment.value.trim() === commentText);
                    if (!existing) {
                        path.addComment('leading', ` ${commentText}`, true);
                        path.addComment('leading', ' eslint-disable @typescript-eslint/no-namespace', false);
                    }
                },
                exit(path, state) {
                    if (state.usesPropaneBase) {
                        ensureBaseImport(path, state);
                    }
                },
            },
            ExportNamedDeclaration(path, state) {
                if (!path.parentPath?.isProgram()) {
                    return;
                }
                const declarationPath = path.get('declaration');
                if (Array.isArray(declarationPath)
                    || !declarationPath.isTSTypeAliasDeclaration()) {
                    return;
                }
                if (declarationPath.node
                    && declarationPath.node[GENERATED_ALIAS]) {
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
            TSTypeAliasDeclaration(path, state) {
                if (path.parentPath?.isExportNamedDeclaration()) {
                    return;
                }
                if (path.node
                    && path.node[GENERATED_ALIAS]) {
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
