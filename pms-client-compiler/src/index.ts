// Parser
export { parseFile, parseFiles } from './parser.js';
export type { RpcEndpoint, ParseResult } from './parser.js';

// Generator
export { generateClient, generateIndex, DEFAULT_CLIENT_SOURCE } from './generator.js';
export type { GeneratorOptions } from './generator.js';
