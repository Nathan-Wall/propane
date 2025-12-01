import * as t from '@babel/types';
import type { NodePath } from '@babel/traverse';
import type { PropaneState } from './plugin.js';

export const MESSAGE_SOURCE = '@propanejs/runtime';

export function ensureBaseImport(
  programPath: NodePath<t.Program>,
  state: PropaneState
) {
  const program = programPath.node;
  const hasImportBinding = (name: string) =>
    program.body.some(
      (stmt) =>
        t.isImportDeclaration(stmt)
        && stmt.specifiers.some(
          (spec) =>
            t.isImportSpecifier(spec)
            || t.isImportDefaultSpecifier(spec)
            || t.isImportNamespaceSpecifier(spec)
              ? spec.local.name === name
              : false
        )
    );
  const existingImport = program.body.find(
    (stmt): stmt is t.ImportDeclaration =>
      t.isImportDeclaration(stmt)
      && stmt.source.value === MESSAGE_SOURCE
  );
  const requiredSpecifiers = [
    'Message',
    'MessagePropDescriptor',
    // Hybrid approach symbols
    'WITH_CHILD',
    'GET_MESSAGE_CHILDREN',
  ];
  if (state.usesImmutableMap && !hasImportBinding('ImmutableMap')) {
    requiredSpecifiers.push('ImmutableMap');
  }
  if (state.usesImmutableSet && !hasImportBinding('ImmutableSet')) {
    requiredSpecifiers.push('ImmutableSet');
  }
  if (state.usesImmutableArray && !hasImportBinding('ImmutableArray')) {
    requiredSpecifiers.push('ImmutableArray');
  }
  if (state.usesImmutableDate && !hasImportBinding('ImmutableDate')) {
    requiredSpecifiers.push('ImmutableDate');
  }
  if (state.usesImmutableUrl && !hasImportBinding('ImmutableUrl')) {
    requiredSpecifiers.push('ImmutableUrl');
  }
  if (state.usesImmutableArrayBuffer && !hasImportBinding('ImmutableArrayBuffer')) {
    requiredSpecifiers.push('ImmutableArrayBuffer');
  }
  if (state.usesEquals) {
    requiredSpecifiers.push('equals');
  }
  if (state.usesTaggedMessageData) {
    requiredSpecifiers.push('isTaggedMessageData');
  }
  // MessageConstructor is a type-only import - add a separate type import if needed
  if (state.usesMessageConstructor && !hasImportBinding('MessageConstructor')) {
    // Check if type import already exists
    const existingTypeImport = program.body.find(
      (stmt): stmt is t.ImportDeclaration =>
        t.isImportDeclaration(stmt)
        && stmt.source.value === MESSAGE_SOURCE
        && stmt.importKind === 'type'
    );

    if (existingTypeImport) {
      // Add to existing type import
      const existingSpecifiers = new Set(
        existingTypeImport.specifiers
          .filter((spec): spec is t.ImportSpecifier => t.isImportSpecifier(spec))
          .map((spec) =>
            t.isIdentifier(spec.imported)
              ? spec.imported.name
              : spec.imported.value
          )
      );
      if (!existingSpecifiers.has('MessageConstructor')) {
        existingTypeImport.specifiers.push(
          t.importSpecifier(t.identifier('MessageConstructor'), t.identifier('MessageConstructor'))
        );
      }
    } else {
      // Create new type-only import
      const typeImportDecl = t.importDeclaration(
        [t.importSpecifier(t.identifier('MessageConstructor'), t.identifier('MessageConstructor'))],
        t.stringLiteral(MESSAGE_SOURCE)
      );
      typeImportDecl.importKind = 'type';

      // Insert at the beginning with other imports
      const insertionIndex = program.body.findIndex(
        (stmt) => !t.isImportDeclaration(stmt)
      );
      if (insertionIndex === -1) {
        program.body.push(typeImportDecl);
      } else {
        program.body.splice(insertionIndex, 0, typeImportDecl);
      }
    }
  }

  if (existingImport) {
    const existingSpecifiers = new Set(
      existingImport.specifiers
        .filter((spec): spec is t.ImportSpecifier => t.isImportSpecifier(spec))
        .map((spec) =>
          t.isIdentifier(spec.imported)
            ? spec.imported.name
            : spec.imported.value
        )
    );
    for (const name of requiredSpecifiers) {
      if (!existingSpecifiers.has(name)) {
        existingImport.specifiers.push(
          t.importSpecifier(t.identifier(name), t.identifier(name))
        );
      }
    }
    return;
  }

  const importDecl = t.importDeclaration(
    requiredSpecifiers.map((name) =>
      t.importSpecifier(t.identifier(name), t.identifier(name))
    ),
    t.stringLiteral(MESSAGE_SOURCE)
  );

  const insertionIndex = program.body.findIndex(
    (stmt) => !t.isImportDeclaration(stmt)
  );

  if (insertionIndex === -1) {
    program.body.push(importDecl);
  } else {
    program.body.splice(insertionIndex, 0, importDecl);
  }
}
