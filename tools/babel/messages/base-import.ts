import * as t from '@babel/types';
import type { NodePath } from '@babel/traverse';
import type { PropaneState } from './plugin.js';
import { getAliasImportFrom } from './alias-utils.js';

export const DEFAULT_RUNTIME_SOURCE = '@propane/runtime';

export function ensureBaseImport(
  programPath: NodePath<t.Program>,
  state: PropaneState
) {
  const program = programPath.node;
  const hasAnyImportBinding = (name: string) =>
    program.body.some(
      stmt =>
        t.isImportDeclaration(stmt)
        && stmt.specifiers.some(
          spec =>
            t.isImportSpecifier(spec)
            || t.isImportDefaultSpecifier(spec)
            || t.isImportNamespaceSpecifier(spec)
              ? spec.local.name === name
              : false
        )
    );
  const hasValueImportBinding = (name: string) =>
    program.body.some(
      stmt =>
        t.isImportDeclaration(stmt)
        && stmt.importKind !== 'type'
        && stmt.specifiers.some(
          spec =>
            t.isImportSpecifier(spec)
            || t.isImportDefaultSpecifier(spec)
            || t.isImportNamespaceSpecifier(spec)
              ? spec.local.name === name
              : false
        )
    );
  const runtimeSource = state.runtimeImportPath;
  const resolveAliasImportSource = (target: string): string | null => {
    const configured = getAliasImportFrom(target, state.typeAliases);
    if (!configured) return null;
    return configured === DEFAULT_RUNTIME_SOURCE ? runtimeSource : configured;
  };
  const aliasImportsBySource = new Map<string, Set<string>>();

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

  if (state.aliasTargetsUsed && state.aliasTargetsUsed.size > 0) {
    for (const target of state.aliasTargetsUsed) {
      if (hasValueImportBinding(target)) {
        continue;
      }
      const source = resolveAliasImportSource(target);
      if (!source) {
        continue;
      }
      if (source === runtimeSource) {
        if (!requiredSpecifiers.includes(target)) {
          requiredSpecifiers.push(target);
        }
      } else {
        let specifiers = aliasImportsBySource.get(source);
        if (!specifiers) {
          specifiers = new Set<string>();
          aliasImportsBySource.set(source, specifiers);
        }
        specifiers.add(target);
      }
    }
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
        const filtered = stmt.specifiers.filter(spec => {
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
  const typeOnlyImportsBySource = new Map<string, Set<string>>();
  const addTypeOnlyImport = (name: string, source: string) => {
    if (hasAnyImportBinding(name)) {
      return;
    }
    let specifiers = typeOnlyImportsBySource.get(source);
    if (!specifiers) {
      specifiers = new Set<string>();
      typeOnlyImportsBySource.set(source, specifiers);
    }
    specifiers.add(name);
  };

  addTypeOnlyImport('MessagePropDescriptor', runtimeSource);
  if (state.usesMessageConstructor) {
    addTypeOnlyImport('MessageConstructor', runtimeSource);
  }
  if (state.usesDataValue) {
    addTypeOnlyImport('DataValue', runtimeSource);
  }
  if (state.usesMessageValue) {
    addTypeOnlyImport('MessageValue', runtimeSource);
  }
  if (state.usesDataObject) {
    addTypeOnlyImport('DataObject', runtimeSource);
  }
  // Add ImmutableArray/Set/Map as type imports when only needed for type annotations
  // (not as values for instantiation)
  if (state.needsImmutableArrayType && !state.usesImmutableArray) {
    const source = resolveAliasImportSource('ImmutableArray') ?? runtimeSource;
    addTypeOnlyImport('ImmutableArray', source);
  }
  if (state.needsImmutableSetType && !state.usesImmutableSet) {
    addTypeOnlyImport('ImmutableSet', runtimeSource);
  }
  if (state.needsImmutableMapType && !state.usesImmutableMap) {
    addTypeOnlyImport('ImmutableMap', runtimeSource);
  }
  if (state.needsSetUpdatesType) {
    addTypeOnlyImport('SetUpdates', runtimeSource);
  }

  if (typeOnlyImportsBySource.size > 0) {
    for (const [source, specifiers] of typeOnlyImportsBySource.entries()) {
      if (specifiers.size === 0) continue;
      const existingTypeImport = program.body.find(
        (stmt): stmt is t.ImportDeclaration =>
          t.isImportDeclaration(stmt)
          && stmt.source.value === source
          && stmt.importKind === 'type'
      );

      if (existingTypeImport) {
        type ImportSpec = t.ImportSpecifier;
        const isImportSpec = (s: t.Node): s is ImportSpec =>
          t.isImportSpecifier(s);
        const existingSpecifiers = new Set(
          existingTypeImport.specifiers
            .filter(isImportSpec)
            .map(spec =>
              t.isIdentifier(spec.imported)
                ? spec.imported.name
                : spec.imported.value
            )
        );
        for (const name of specifiers) {
          if (!existingSpecifiers.has(name)) {
            existingTypeImport.specifiers.push(
              t.importSpecifier(t.identifier(name), t.identifier(name))
            );
          }
        }
      } else {
        const typeImportDecl = t.importDeclaration(
          Array.from(specifiers).map(name =>
            t.importSpecifier(t.identifier(name), t.identifier(name))
          ),
          t.stringLiteral(source)
        );
        typeImportDecl.importKind = 'type';

        const insertionIndex = program.body.findIndex(
          stmt => !t.isImportDeclaration(stmt)
        );
        if (insertionIndex === -1) {
          program.body.push(typeImportDecl);
        } else {
          program.body.splice(insertionIndex, 0, typeImportDecl);
        }
      }
    }
  }

  if (existingImport) {
    const existingSpecifiers = new Set(
      existingImport.specifiers
        .filter((spec): spec is t.ImportSpecifier => t.isImportSpecifier(spec))
        .map(spec =>
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
  } else if (requiredSpecifiers.length > 0) {
    const importDecl = t.importDeclaration(
      requiredSpecifiers.map(name =>
        t.importSpecifier(t.identifier(name), t.identifier(name))
      ),
      t.stringLiteral(runtimeSource)
    );

    const insertionIndex = program.body.findIndex(
      stmt => !t.isImportDeclaration(stmt)
    );

    if (insertionIndex === -1) {
      program.body.push(importDecl);
    } else {
      program.body.splice(insertionIndex, 0, importDecl);
    }
  }

  if (aliasImportsBySource.size > 0) {
    for (const [source, specifiers] of aliasImportsBySource.entries()) {
      if (specifiers.size === 0) continue;
      const existingAliasImport = program.body.find(
        (stmt): stmt is t.ImportDeclaration =>
          t.isImportDeclaration(stmt)
          && stmt.source.value === source
          && stmt.importKind !== 'type'
      );
      if (existingAliasImport) {
        const existingSpecifiers = new Set(
          existingAliasImport.specifiers
            .filter(
              (spec): spec is t.ImportSpecifier => t.isImportSpecifier(spec)
            )
            .map(spec =>
              t.isIdentifier(spec.imported)
                ? spec.imported.name
                : spec.imported.value
            )
        );
        for (const name of specifiers) {
          if (!existingSpecifiers.has(name)) {
            existingAliasImport.specifiers.push(
              t.importSpecifier(t.identifier(name), t.identifier(name))
            );
          }
        }
      } else {
        const importDecl = t.importDeclaration(
          Array.from(specifiers).map(name =>
            t.importSpecifier(t.identifier(name), t.identifier(name))
          ),
          t.stringLiteral(source)
        );
        const insertionIndex = program.body.findIndex(
          stmt => !t.isImportDeclaration(stmt)
        );
        if (insertionIndex === -1) {
          program.body.push(importDecl);
        } else {
          program.body.splice(insertionIndex, 0, importDecl);
        }
      }
    }
  }
}
