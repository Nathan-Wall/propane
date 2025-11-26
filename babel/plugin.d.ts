import type * as t from '@babel/types';
import type { NodePath } from '@babel/traverse';
export interface PropaneState {
    usesPropaneBase: boolean;
    usesImmutableMap: boolean;
    usesImmutableSet: boolean;
    usesImmutableArray: boolean;
    usesEquals: boolean;
    usesImmutableDate: boolean;
    usesImmutableUrl: boolean;
    usesImmutableArrayBuffer: boolean;
    usesTaggedMessageData: boolean;
    file?: {
        opts?: {
            filename?: string | null;
        };
    };
}
export default function propanePlugin(): {
    name: string;
    visitor: {
        Program: {
            enter(path: NodePath<t.Program>, state: PropaneState): void;
            exit(path: NodePath<t.Program>, state: PropaneState): void;
        };
        ExportNamedDeclaration(path: NodePath<t.ExportNamedDeclaration>, state: PropaneState): void;
        TSTypeAliasDeclaration(path: NodePath<t.TSTypeAliasDeclaration>, state: PropaneState): void;
    };
};
