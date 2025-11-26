import * as t from '@babel/types';
import type { NodePath } from '@babel/traverse';
import type { PropaneState } from './plugin.js';
export declare const MESSAGE_SOURCE = "@propanejs/runtime";
export declare function ensureBaseImport(programPath: NodePath<t.Program>, state: PropaneState): void;
