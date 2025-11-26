import * as t from '@babel/types';
import type { NodePath } from '@babel/traverse';
export declare function assertSupportedMapType(typePath: NodePath<t.TSTypeReference>, declaredTypeNames: Set<string>): void;
export declare function assertSupportedSetType(typePath: NodePath<t.TSTypeReference>, declaredTypeNames: Set<string>): void;
export declare function assertSupportedMapKeyType(typePath: NodePath<t.TSType>, declaredTypeNames: Set<string>): void;
export declare function assertSupportedTopLevelType(typePath: NodePath<t.TSType>): void;
export declare function assertSupportedType(typePath: NodePath<t.TSType>, declaredTypeNames: Set<string>): void;
export declare function isAllowedTypeReference(typePath: NodePath<t.TSTypeReference>, declaredTypeNames: Set<string>): boolean;
export declare function registerTypeAlias(typeAlias: t.TSTypeAliasDeclaration, declaredTypeNames: Set<string>): void;
