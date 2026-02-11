/**
 * Helper functions for Babel AST traversal.
 *
 * Babel's TypeScript type definitions are incomplete for some operations,
 * requiring `as any` casts. This module centralizes those casts in
 * well-documented functions to improve maintainability.
 */

import type { NodePath } from '@babel/traverse';
import type * as t from '@babel/types';

/**
 * Find the parent TSTypeAliasDeclaration of a node path.
 * Returns null if no such parent exists.
 */
export function findParentTypeAlias(
  nodePath: NodePath<t.Node>
): NodePath<t.TSTypeAliasDeclaration> | null {
  const findParentPath = nodePath as NodePath<t.Node> & {
    findParent(
      callback: (path: NodePath<t.Node>) => boolean
    ): NodePath<t.Node> | null;
  };
  return findParentPath.findParent(
    path => path.isTSTypeAliasDeclaration()
  ) as NodePath<t.TSTypeAliasDeclaration> | null;
}

/**
 * Get the source filename from a node path's hub.
 * Returns empty string if not available.
 */
export function getSourceFilename(nodePath: NodePath<t.Node>): string {
  const hub = nodePath.hub as
    | { file?: { opts?: { filename?: string } } }
    | undefined;
  return hub?.file?.opts?.filename ?? '';
}

/**
 * Check if a node path is a TSTypeParameterInstantiation.
 * Babel's types don't include this method on NodePath.
 */
export function isTSTypeParameterInstantiation(
  path: NodePath<t.Node | null | undefined> | null | undefined
): path is NodePath<t.TSTypeParameterInstantiation> {
  if (!path) return false;
  const candidatePath = path as {
    isTSTypeParameterInstantiation?: () => boolean;
  };
  return candidatePath.isTSTypeParameterInstantiation?.() ?? false;
}

/**
 * Get the params from a TSTypeParameterInstantiation path.
 * Returns an array of NodePath for each type parameter.
 */
export function getTypeParams(
  path: NodePath<t.TSTypeParameterInstantiation>
): NodePath<t.TSType>[] {
  const parameterPath = path as NodePath<t.TSTypeParameterInstantiation> & {
    get(key: 'params'): NodePath<t.TSType>[];
  };
  return parameterPath.get('params');
}

/**
 * Check if a node path is a TSTypeAnnotation.
 * Babel's types don't always include this method.
 */
export function isTSTypeAnnotation(
  path: NodePath<t.Node> | null | undefined
): path is NodePath<t.TSTypeAnnotation> {
  if (!path) return false;
  const candidatePath = path as {
    isTSTypeAnnotation?: () => boolean;
  };
  return candidatePath.isTSTypeAnnotation?.() ?? false;
}

/**
 * Get the typeAnnotation from a TSTypeAnnotation path.
 */
export function getTypeAnnotation(
  path: NodePath<t.TSTypeAnnotation>
): NodePath<t.TSType> {
  const annotationPath = path as NodePath<t.TSTypeAnnotation> & {
    get(key: 'typeAnnotation'): NodePath<t.TSType>;
  };
  return annotationPath.get('typeAnnotation');
}
