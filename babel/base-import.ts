import * as t from '@babel/types';

export const MESSAGE_SOURCE = '@propanejs/runtime';

export function ensureBaseImport(programPath: any, state: any) {
  const program = programPath.node;
  const hasImportBinding = (name: string) =>
    program.body.some(
      (stmt: any) =>
        t.isImportDeclaration(stmt)
        && stmt.specifiers.some(
          (spec: any) =>
            t.isImportSpecifier(spec) || t.isImportDefaultSpecifier(spec) || t.isImportNamespaceSpecifier(spec)
              ? spec.local.name === name
              : false
        )
    );
  const existingImport = program.body.find(
    (stmt: any) =>
      t.isImportDeclaration(stmt)
      && stmt.source.value === MESSAGE_SOURCE
  );
  const requiredSpecifiers = ['Message', 'MessagePropDescriptor'];
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

  if (existingImport) {
    const existingSpecifiers = new Set(
      existingImport.specifiers
        .filter((spec: any) => t.isImportSpecifier(spec))
        .map((spec: any) => spec.imported.name)
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
    (stmt: any) => !t.isImportDeclaration(stmt)
  );

  if (insertionIndex === -1) {
    program.body.push(importDecl);
  } else {
    program.body.splice(insertionIndex, 0, importDecl);
  }
}
