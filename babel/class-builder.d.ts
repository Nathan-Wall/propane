import * as t from '@babel/types';
import type { PropDescriptor, PluginStateFlags } from './properties.js';
export declare function buildClassFromProperties(typeName: string, properties: PropDescriptor[], declaredMessageTypeNames: Set<string>, state: PluginStateFlags): t.ClassDeclaration;
