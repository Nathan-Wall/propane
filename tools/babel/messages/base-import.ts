import * as t from '@babel/types';
import type { NodePath } from '@babel/traverse';
import type { PropaneState } from './plugin.js';

export const DEFAULT_RUNTIME_SOURCE = '@propane/runtime';

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
  const runtimeSource = state.runtimeImportPath;

  // Check if the source already has imports from the default runtime path
  // and rewrite them to use the configured path
  if (runtimeSource !== DEFAULT_RUNTIME_SOURCE) {
    for (const stmt of program.body) {
      if (
        t.isImportDeclaration(stmt)
        && stmt.source.value === DEFAULT_RUNTIME_SOURCE
      ) {
        stmt.source.value = runtimeSource;
      }
    }
  }

  // Find existing VALUE import (not type-only import)
  const existingImport = program.body.find(
    (stmt): stmt is t.ImportDeclaration =>
      t.isImportDeclaration(stmt)
      && stmt.source.value === runtimeSource
      && stmt.importKind !== 'type'
  );
  // Build list of required specifiers, checking if already imported
  const requiredSpecifiers: string[] = [];
  if (!hasImportBinding('Message')) {
    requiredSpecifiers.push('Message');
  }
  // Hybrid approach symbols
  if (!hasImportBinding('WITH_CHILD')) {
    requiredSpecifiers.push('WITH_CHILD');
  }
  if (!hasImportBinding('GET_MESSAGE_CHILDREN')) {
    requiredSpecifiers.push('GET_MESSAGE_CHILDREN');
  }
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
  if (state.usesParseCerealString && !hasImportBinding('parseCerealString')) {
    requiredSpecifiers.push('parseCerealString');
  }
  if (state.usesEnsure && !hasImportBinding('ensure')) {
    requiredSpecifiers.push('ensure');
  }
  if (state.usesSkip && !hasImportBinding('SKIP')) {
    requiredSpecifiers.push('SKIP');
  }
  // Validation-related imports
  if (state.usesValidationError && !hasImportBinding('ValidationError')) {
    requiredSpecifiers.push('ValidationError');
  }
  if (state.usesCharLength && !hasImportBinding('charLength')) {
    requiredSpecifiers.push('charLength');
  }
  if (state.usesIsInt32 && !hasImportBinding('isInt32')) {
    requiredSpecifiers.push('isInt32');
  }
  if (state.usesIsInt53 && !hasImportBinding('isInt53')) {
    requiredSpecifiers.push('isInt53');
  }
  if (state.usesIsDecimal && !hasImportBinding('isDecimal')) {
    requiredSpecifiers.push('isDecimal');
  }
  if (state.usesCanBeDecimal && !hasImportBinding('canBeDecimal')) {
    requiredSpecifiers.push('canBeDecimal');
  }
  if (state.usesIsPositive && !hasImportBinding('isPositive')) {
    requiredSpecifiers.push('isPositive');
  }
  if (state.usesIsNegative && !hasImportBinding('isNegative')) {
    requiredSpecifiers.push('isNegative');
  }
  if (state.usesIsNonNegative && !hasImportBinding('isNonNegative')) {
    requiredSpecifiers.push('isNonNegative');
  }
  if (state.usesIsNonPositive && !hasImportBinding('isNonPositive')) {
    requiredSpecifiers.push('isNonPositive');
  }
  if (state.usesGreaterThan && !hasImportBinding('greaterThan')) {
    requiredSpecifiers.push('greaterThan');
  }
  if (state.usesGreaterThanOrEqual && !hasImportBinding('greaterThanOrEqual')) {
    requiredSpecifiers.push('greaterThanOrEqual');
  }
  if (state.usesLessThan && !hasImportBinding('lessThan')) {
    requiredSpecifiers.push('lessThan');
  }
  if (state.usesLessThanOrEqual && !hasImportBinding('lessThanOrEqual')) {
    requiredSpecifiers.push('lessThanOrEqual');
  }
  if (state.usesInRange && !hasImportBinding('inRange')) {
    requiredSpecifiers.push('inRange');
  }
  // MessageConstructor, MessagePropDescriptor, DataValue, and DataObject are type-only imports
  const typeOnlyImports: string[] = ['MessagePropDescriptor'];
  if (state.usesMessageConstructor && !hasImportBinding('MessageConstructor')) {
    typeOnlyImports.push('MessageConstructor');
  }
  if (state.usesDataValue && !hasImportBinding('DataValue')) {
    typeOnlyImports.push('DataValue');
  }
  if (state.usesMessageValue && !hasImportBinding('MessageValue')) {
    typeOnlyImports.push('MessageValue');
  }
  if (state.usesDataObject && !hasImportBinding('DataObject')) {
    typeOnlyImports.push('DataObject');
  }
  // Add ImmutableArray/Set/Map as type imports when only needed for type annotations
  // (not as values for instantiation)
  if (
    state.needsImmutableArrayType
    && !state.usesImmutableArray
    && !hasImportBinding('ImmutableArray')
  ) {
    typeOnlyImports.push('ImmutableArray');
  }
  if (
    state.needsImmutableSetType
    && !state.usesImmutableSet
    && !hasImportBinding('ImmutableSet')
  ) {
    typeOnlyImports.push('ImmutableSet');
  }
  if (
    state.needsImmutableMapType
    && !state.usesImmutableMap
    && !hasImportBinding('ImmutableMap')
  ) {
    typeOnlyImports.push('ImmutableMap');
  }
  if (state.needsSetUpdatesType && !hasImportBinding('SetUpdates')) {
    typeOnlyImports.push('SetUpdates');
  }
  // AnyDecimal is needed for type-safe decimal bound casts in validation code
  if (state.usesAnyDecimal && !hasImportBinding('AnyDecimal')) {
    typeOnlyImports.push('AnyDecimal');
  }

  if (typeOnlyImports.length > 0) {
    // Check if type import already exists
    const existingTypeImport = program.body.find(
      (stmt): stmt is t.ImportDeclaration =>
        t.isImportDeclaration(stmt)
        && stmt.source.value === runtimeSource
        && stmt.importKind === 'type'
    );

    // Find names already in value imports to avoid duplicate identifier errors
    const valueImportNames = new Set<string>();
    for (const stmt of program.body) {
      if (
        t.isImportDeclaration(stmt)
        && stmt.source.value === runtimeSource
        && stmt.importKind !== 'type'
      ) {
        for (const spec of stmt.specifiers) {
          if (t.isImportSpecifier(spec)) {
            valueImportNames.add(spec.local.name);
          }
        }
      }
    }

    // Filter out names that are already value imports
    const filteredTypeImports = typeOnlyImports.filter(
      (name) => !valueImportNames.has(name)
    );

    if (existingTypeImport && filteredTypeImports.length > 0) {
      // Add to existing type import
      type ImportSpec = t.ImportSpecifier;
      const isImportSpec = (s: t.Node): s is ImportSpec =>
        t.isImportSpecifier(s);
      const existingSpecifiers = new Set(
        existingTypeImport.specifiers
          .filter(isImportSpec)
          .map((spec) =>
            t.isIdentifier(spec.imported)
              ? spec.imported.name
              : spec.imported.value
          )
      );
      for (const name of filteredTypeImports) {
        if (!existingSpecifiers.has(name)) {
          existingTypeImport.specifiers.push(
            t.importSpecifier(t.identifier(name), t.identifier(name))
          );
        }
      }
    } else if (filteredTypeImports.length > 0) {
      // Create new type-only import
      const typeImportDecl = t.importDeclaration(
        filteredTypeImports.map((name) =>
          t.importSpecifier(t.identifier(name), t.identifier(name))
        ),
        t.stringLiteral(runtimeSource)
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
    t.stringLiteral(runtimeSource)
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
