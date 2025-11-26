import * as t from '@babel/types';
import type { PropDescriptor } from './properties.js';
export declare function buildTypeNamespace(typeAlias: t.TSTypeAliasDeclaration, properties: PropDescriptor[], exported: boolean, generatedTypeNames?: string[]): t.ExportNamedDeclaration | t.TSModuleDeclaration;
