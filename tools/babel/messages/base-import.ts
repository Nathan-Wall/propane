import * as t from '@babel/types';
import type { NodePath } from '@babel/traverse';
import type { PropaneState } from './plugin.js';

export const DEFAULT_RUNTIME_SOURCE = '@propane/runtime';

export function ensureBaseImport(
  programPath: NodePath<t.Program>,
  state: PropaneState
) {
  const program = programPath.node;
  const hasAnyImportBinding = (name: string) =>
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
  const hasValueImportBinding = (name: string) =>
    program.body.some(
      (stmt) =>
        t.isImportDeclaration(stmt)
        && stmt.importKind !== 'type'
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
  if (!hasValueImportBinding('Message')) {
    requiredSpecifiers.push('Message');
  }
  // Hybrid approach symbols
  if (!hasValueImportBinding('WITH_CHILD')) {
    requiredSpecifiers.push('WITH_CHILD');
  }
  if (!hasValueImportBinding('GET_MESSAGE_CHILDREN')) {
    requiredSpecifiers.push('GET_MESSAGE_CHILDREN');
  }
  if (state.usesImmutableMap && !hasValueImportBinding('ImmutableMap')) {
    requiredSpecifiers.push('ImmutableMap');
  }
  if (state.usesImmutableSet && !hasValueImportBinding('ImmutableSet')) {
    requiredSpecifiers.push('ImmutableSet');
  }
  if (state.usesImmutableArray && !hasValueImportBinding('ImmutableArray')) {
    requiredSpecifiers.push('ImmutableArray');
  }
  if (state.usesImmutableDate && !hasValueImportBinding('ImmutableDate')) {
    requiredSpecifiers.push('ImmutableDate');
  }
  if (state.usesImmutableUrl && !hasValueImportBinding('ImmutableUrl')) {
    requiredSpecifiers.push('ImmutableUrl');
  }
  if (state.usesImmutableArrayBuffer && !hasValueImportBinding('ImmutableArrayBuffer')) {
    requiredSpecifiers.push('ImmutableArrayBuffer');
  }
  if (state.usesEquals) {
    requiredSpecifiers.push('equals');
  }
  if (state.usesTaggedMessageData) {
    requiredSpecifiers.push('isTaggedMessageData');
  }
  if (state.usesParseCerealString && !hasValueImportBinding('parseCerealString')) {
    requiredSpecifiers.push('parseCerealString');
  }
  if (state.usesEnsure && !hasValueImportBinding('ensure')) {
    requiredSpecifiers.push('ensure');
  }
  if (state.usesSkip && !hasValueImportBinding('SKIP')) {
    requiredSpecifiers.push('SKIP');
  }
  // Validation-related imports
  if (state.usesValidationError && !hasValueImportBinding('ValidationError')) {
    requiredSpecifiers.push('ValidationError');
  }
  if (state.usesCharLength && !hasValueImportBinding('charLength')) {
    requiredSpecifiers.push('charLength');
  }
  if (state.usesIsInt32 && !hasValueImportBinding('isInt32')) {
    requiredSpecifiers.push('isInt32');
  }
  if (state.usesIsInt53 && !hasValueImportBinding('isInt53')) {
    requiredSpecifiers.push('isInt53');
  }
  if (state.usesIsDecimalOf && !hasValueImportBinding('isDecimalOf')) {
    requiredSpecifiers.push('isDecimalOf');
  }
  if (state.usesIsRational && !hasValueImportBinding('isRational')) {
    requiredSpecifiers.push('isRational');
  }
  if (state.usesDecimalClass && !hasValueImportBinding('Decimal')) {
    requiredSpecifiers.push('Decimal');
  }
  if (state.usesRationalClass && !hasValueImportBinding('Rational')) {
    requiredSpecifiers.push('Rational');
  }
  if (state.usesIsPositive && !hasValueImportBinding('isPositive')) {
    requiredSpecifiers.push('isPositive');
  }
  if (state.usesIsNegative && !hasValueImportBinding('isNegative')) {
    requiredSpecifiers.push('isNegative');
  }
  if (state.usesIsNonNegative && !hasValueImportBinding('isNonNegative')) {
    requiredSpecifiers.push('isNonNegative');
  }
  if (state.usesIsNonPositive && !hasValueImportBinding('isNonPositive')) {
    requiredSpecifiers.push('isNonPositive');
  }
  if (state.usesGreaterThan && !hasValueImportBinding('greaterThan')) {
    requiredSpecifiers.push('greaterThan');
  }
  if (state.usesGreaterThanOrEqual && !hasValueImportBinding('greaterThanOrEqual')) {
    requiredSpecifiers.push('greaterThanOrEqual');
  }
  if (state.usesLessThan && !hasValueImportBinding('lessThan')) {
    requiredSpecifiers.push('lessThan');
  }
  if (state.usesLessThanOrEqual && !hasValueImportBinding('lessThanOrEqual')) {
    requiredSpecifiers.push('lessThanOrEqual');
  }
  if (state.usesInRange && !hasValueImportBinding('inRange')) {
    requiredSpecifiers.push('inRange');
  }

  const removeTypeOnlyBindings = new Set<string>();
  if (state.usesDecimalClass) {
    removeTypeOnlyBindings.add('Decimal');
  }
  if (state.usesRationalClass) {
    removeTypeOnlyBindings.add('Rational');
  }
  if (removeTypeOnlyBindings.size > 0) {
    for (let i = 0; i < program.body.length; i += 1) {
      const stmt = program.body[i];
      if (t.isImportDeclaration(stmt) && stmt.importKind === 'type') {
        const filtered = stmt.specifiers.filter((spec) => {
          if (!t.isImportSpecifier(spec)) return true;
          const localName = spec.local.name;
          return !removeTypeOnlyBindings.has(localName);
        });
        if (filtered.length !== stmt.specifiers.length) {
          if (filtered.length === 0) {
            program.body.splice(i, 1);
            i -= 1;
          } else {
            stmt.specifiers = filtered;
          }
        }
      }
    }
  }
  // MessageConstructor, MessagePropDescriptor, DataValue, and DataObject are type-only imports
  const typeOnlyImports: string[] = ['MessagePropDescriptor'];
  if (state.usesMessageConstructor && !hasAnyImportBinding('MessageConstructor')) {
    typeOnlyImports.push('MessageConstructor');
  }
  if (state.usesDataValue && !hasAnyImportBinding('DataValue')) {
    typeOnlyImports.push('DataValue');
  }
  if (state.usesMessageValue && !hasAnyImportBinding('MessageValue')) {
    typeOnlyImports.push('MessageValue');
  }
  if (state.usesDataObject && !hasAnyImportBinding('DataObject')) {
    typeOnlyImports.push('DataObject');
  }
  // Add ImmutableArray/Set/Map as type imports when only needed for type annotations
  // (not as values for instantiation)
  if (
    state.needsImmutableArrayType
    && !state.usesImmutableArray
    && !hasAnyImportBinding('ImmutableArray')
  ) {
    typeOnlyImports.push('ImmutableArray');
  }
  if (
    state.needsImmutableSetType
    && !state.usesImmutableSet
    && !hasAnyImportBinding('ImmutableSet')
  ) {
    typeOnlyImports.push('ImmutableSet');
  }
  if (
    state.needsImmutableMapType
    && !state.usesImmutableMap
    && !hasAnyImportBinding('ImmutableMap')
  ) {
    typeOnlyImports.push('ImmutableMap');
  }
  if (state.needsSetUpdatesType && !hasAnyImportBinding('SetUpdates')) {
    typeOnlyImports.push('SetUpdates');
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
