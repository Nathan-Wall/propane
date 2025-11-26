import * as t from '@babel/types';
import type { NodePath } from '@babel/traverse';
export type MessageReferenceResolver = (typePath: NodePath<t.TSType>) => string | null;
export declare function createMessageReferenceResolver(declaredMessageTypeNames: Set<string>): MessageReferenceResolver;
