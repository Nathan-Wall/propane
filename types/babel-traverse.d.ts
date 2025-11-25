declare module '@babel/traverse' {
  import type * as t from '@babel/types';

  export interface Binding {
    identifier: t.Identifier;
    path: NodePath;
  }

  export interface Scope {
    getBinding(name: string): Binding | undefined;
  }

  export interface HubFile {
    opts?: {
      filename?: string | null;
    };
  }

  export interface Hub {
    file?: HubFile | null;
  }

  export interface NodePath<T = t.Node> {
    node: T;
    parent: t.Node | null;
    parentPath: NodePath | null;
    hub: Hub | null;
    scope: Scope;

    get(key: 'typeAnnotation'): NodePath<t.TSType>;
    get(key: 'typeParameters'): NodePath<t.TSTypeParameterInstantiation | null>;
    get(key: 'params'): NodePath<t.TSType>[];
    get(key: 'types'): NodePath<t.TSType>[];
    get(key: 'members'): NodePath<t.TSTypeElement>[];
    get(key: 'elementType'): NodePath<t.TSType>;
    get(key: 'key'): NodePath<t.Identifier | t.StringLiteral>;
    get(key: 'declaration'): NodePath<t.Node>;
    get(key: string): NodePath<t.Node> | NodePath<t.Node>[];

    isIdentifier(): this is NodePath<t.Identifier>;
    isStringLiteral(): this is NodePath<t.StringLiteral>;
    isTSPropertySignature(): this is NodePath<t.TSPropertySignature>;
    isTSTypeLiteral(): this is NodePath<t.TSTypeLiteral>;
    isTSArrayType(): this is NodePath<t.TSArrayType>;
    isTSTypeReference(): this is NodePath<t.TSTypeReference>;
    isTSUnionType(): this is NodePath<t.TSUnionType>;
    isTSParenthesizedType(): this is NodePath<t.TSParenthesizedType>;
    isTSLiteralType(): this is NodePath<t.TSLiteralType>;
    isTSStringKeyword(): this is NodePath<t.TSStringKeyword>;
    isTSNumberKeyword(): this is NodePath<t.TSNumberKeyword>;
    isTSBooleanKeyword(): this is NodePath<t.TSBooleanKeyword>;
    isTSBigIntKeyword(): this is NodePath<t.TSBigIntKeyword>;
    isTSNullKeyword(): this is NodePath<t.TSNullKeyword>;
    isTSUndefinedKeyword(): this is NodePath<t.TSUndefinedKeyword>;
    isTSTypeAliasDeclaration(): this is NodePath<t.TSTypeAliasDeclaration>;
    isImportSpecifier(): this is NodePath<t.ImportSpecifier>;
    isImportDefaultSpecifier(): this is NodePath<t.ImportDefaultSpecifier>;
    isImportNamespaceSpecifier(): this is NodePath<t.ImportNamespaceSpecifier>;
    isImportDeclaration(): this is NodePath<t.ImportDeclaration>;
    isExportNamedDeclaration(): this is NodePath<t.ExportNamedDeclaration>;
    isProgram(): this is NodePath<t.Program>;

    buildCodeFrameError(message: string): Error;
    replaceWith(replacement: t.Node): void;
    replaceWithMultiple(nodes: t.Node[]): void;
    insertAfter(nodes: t.Node | t.Node[]): void;
    addComment(type: 'leading' | 'trailing' | 'inner', content: string, line?: boolean): void;
  }

  export interface TraverseOptions<T = t.Node> {
    enter?(path: NodePath<T>): void;
    exit?(path: NodePath<T>): void;
  }

  export default function traverse(node: t.Node, opts?: TraverseOptions): void;
}
