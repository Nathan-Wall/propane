import * as t from '@babel/types';
import type { NodePath } from '@babel/traverse';
import type { PropaneState } from './plugin.js';
export declare const GENERATED_ALIAS: unique symbol;
interface BuildDeclarationsOptions {
    exported: boolean;
    state: PropaneState;
    declaredTypeNames: Set<string>;
    declaredMessageTypeNames: Set<string>;
    getMessageReferenceName: (typePath: NodePath<t.TSType>) => string | null;
}
export declare function buildDeclarations(typeAliasPath: NodePath<t.TSTypeAliasDeclaration>, { exported, state, declaredTypeNames, declaredMessageTypeNames, getMessageReferenceName }: BuildDeclarationsOptions): t.Statement[] | null;
export declare function insertPrimitiveTypeAlias(typeAliasPath: NodePath<t.TSTypeAliasDeclaration>, exported: boolean): void;
export {};
