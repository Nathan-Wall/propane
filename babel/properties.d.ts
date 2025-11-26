import * as t from '@babel/types';
import type { NodePath } from '@babel/traverse';
export interface PluginStateFlags {
    usesImmutableMap: boolean;
    usesImmutableSet: boolean;
    usesImmutableArray: boolean;
    usesImmutableDate: boolean;
    usesImmutableUrl: boolean;
    usesImmutableArrayBuffer: boolean;
    usesEquals: boolean;
    usesTaggedMessageData: boolean;
}
export interface PropDescriptor {
    name: string;
    fieldNumber: number | null;
    optional: boolean;
    readonly: boolean;
    isArray: boolean;
    isSet: boolean;
    isMap: boolean;
    isDateType: boolean;
    isUrlType: boolean;
    isArrayBufferType: boolean;
    isMessageType: boolean;
    messageTypeName: string | null;
    unionMessageTypes: string[];
    typeAnnotation: t.TSType;
    inputTypeAnnotation: t.TSType;
    arrayElementType: t.TSType | null;
    mapKeyType: t.TSType | null;
    mapValueType: t.TSType | null;
    mapKeyInputType: t.TSType | null;
    mapValueInputType: t.TSType | null;
    setElementType: t.TSType | null;
    setElementInputType: t.TSType | null;
    displayType: t.TSType;
}
export declare function normalizePropertyKey(memberPath: NodePath<t.TSPropertySignature>): {
    name: string;
    fieldNumber: number | null;
};
export declare function assertValidPropertyName(name: string, keyPath: NodePath<t.Identifier | t.StringLiteral>): void;
export declare function extractProperties(memberPaths: NodePath<t.TSPropertySignature>[], generatedTypes: t.TSTypeAliasDeclaration[], parentName: string, state: PluginStateFlags, declaredTypeNames: Set<string>, declaredMessageTypeNames: Set<string>, getMessageReferenceName: (typePath: NodePath<t.TSType>) => string | null, assertSupportedType: (typePath: NodePath<t.TSType>, declaredTypeNames: Set<string>) => void): PropDescriptor[];
export declare function getDefaultValue(prop: {
    optional: boolean;
    isArray: boolean;
    isMap: boolean;
    isSet: boolean;
    typeAnnotation: t.TSType;
}): t.Expression;
export declare function getDefaultValueForType(typeNode: t.TSType): t.Expression;
export declare function wrapImmutableType(node: t.TSType): t.TSType;
export declare function wrapImmutableType(node: t.TSType | null): t.TSType | null;
export declare function buildInputAcceptingMutable(node: t.TSType): t.TSType;
export declare function buildInputAcceptingMutable(node: t.TSType | null): t.TSType | null;
