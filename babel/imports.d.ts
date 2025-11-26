import * as t from '@babel/types';
import type { NodePath } from '@babel/traverse';
export declare function resolveImportPath(importSource: unknown, filename: string | null): string | null;
export declare function analyzePropaneModule(filename: string): Set<string>;
export declare function getImportedName(importPath: NodePath<t.ImportSpecifier | t.ImportDefaultSpecifier | t.ImportNamespaceSpecifier>): string | null;
export declare function getFilename(nodePath: NodePath<t.Node>): string | null;
