/**
 * Helper functions for Babel AST traversal.
 *
 * Babel's TypeScript type definitions are incomplete for some operations,
 * requiring `as any` casts. This module centralizes those casts in
 * well-documented functions to improve maintainability.
 */

import type { NodePath } from '@babel/traverse';
import type * as t from '@babel/types';

/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return */

/**
 * Find the parent TSTypeAliasDeclaration of a node path.
 * Returns null if no such parent exists.
 */
export function findParentTypeAlias(
  nodePath: NodePath<t.Node>
): NodePath<t.TSTypeAliasDeclaration> | null {
  return (nodePath as any).findParent(
    (p: any) => p.isTSTypeAliasDeclaration()
  ) as NodePath<t.TSTypeAliasDeclaration> | null;
}

/**
 * Get the source filename from a node path's hub.
 * Returns empty string if not available.
 */
export function getSourceFilename(nodePath: NodePath<t.Node>): string {
  return ((nodePath.hub as any)?.file?.opts?.filename ?? '') as string;
}

/**
 * Check if a node path is a TSTypeParameterInstantiation.
 * Babel's types don't include this method on NodePath.
 */
export function isTSTypeParameterInstantiation(
  path: NodePath<t.Node | null | undefined> | null | undefined
): path is NodePath<t.TSTypeParameterInstantiation> {
  if (!path) return false;
  return (path as any).isTSTypeParameterInstantiation?.() ?? false;
}

/**
 * Get the params from a TSTypeParameterInstantiation path.
 * Returns an array of NodePath for each type parameter.
 */
export function getTypeParams(
  path: NodePath<t.TSTypeParameterInstantiation>
): NodePath<t.TSType>[] {
  return (path as any).get('params') as NodePath<t.TSType>[];
}

/**
 * Check if a node path is a TSTypeAnnotation.
 * Babel's types don't always include this method.
 */
export function isTSTypeAnnotation(
  path: NodePath | null | undefined
): path is NodePath<t.TSTypeAnnotation> {
  if (!path) return false;
  return (path as any).isTSTypeAnnotation?.() ?? false;
}

/**
 * Get the typeAnnotation from a TSTypeAnnotation path.
 */
export function getTypeAnnotation(
  path: NodePath<t.TSTypeAnnotation>
): NodePath<t.TSType> {
  return (path as any).get('typeAnnotation') as NodePath<t.TSType>;
}

/* eslint-enable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return */
