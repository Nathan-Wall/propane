/**
 * RPC Endpoint Parser
 *
 * Parses .pmsg files to extract RPC endpoint definitions using @propane/parser.
 * Looks for types using Endpoint<Payload, Response> wrapper.
 */

import {
  parseFile as pmtParseFile,
  findEndpoints,
  getResponseTypeName,
  type ParseOptions,
} from '@/tools/parser/index.js';
import type { PmtDiagnostic, PmtEndpointInfo } from '@/tools/parser/types.js';

/**
 * Error thrown when parsing a .pmsg file fails.
 */
export class ParseError extends Error {
  constructor(
    public readonly filePath: string,
    public readonly diagnostics: PmtDiagnostic[],
  ) {
    const messages = diagnostics
      .map(
        d => `[${d.code}] ${d.message}`
          + ` (${d.location.start.line}:${d.location.start.column})`
      )
      .join('\n');
    super(`Failed to parse ${filePath}:\n${messages}`);
    this.name = 'ParseError';
  }
}

/**
 * Represents an RPC endpoint extracted from a .pmsg file.
 */
export interface RpcEndpoint {
  /** The request type name (e.g., "GetUser") */
  requestType: string;
  /** The response type name (e.g., "GetUserResponse") */
  responseType: string;
  /** The source file path */
  sourceFile: string;
}

/**
 * Result of parsing .pmsg files.
 */
export interface ParseResult {
  /** All RPC endpoints found */
  endpoints: RpcEndpoint[];
  /** Map of source file to its endpoints */
  fileEndpoints: Map<string, RpcEndpoint[]>;
}

/**
 * Parse a .pmsg file and extract RPC endpoints.
 *
 * Looks for types using Endpoint<Payload, Response> wrapper:
 * ```typescript
 * import { Message } from '@propane/runtime';
 * import { Endpoint } from '@propane/pms-core';
 *
 * export type GetUser = Endpoint<{
 *   '1:id': number;
 * }, GetUserResponse>;
 *
 * export type GetUserResponse = Message<{
 *   '1:id': number;
 *   '2:name': string;
 * }>;
 * ```
 *
 * @throws {ParseError} If the file contains syntax or validation errors
 */
export function parseFile(
  filePath: string,
  options?: ParseOptions
): RpcEndpoint[] {
  const { file, diagnostics } = pmtParseFile(filePath, options);

  // Check for errors
  const errors = diagnostics.filter(d => d.severity === 'error');
  if (errors.length > 0) {
    throw new ParseError(filePath, errors);
  }

  const pmtEndpoints = findEndpoints(file);

  return pmtEndpoints.map(toRpcEndpoint);
}

/**
 * Parse multiple .pmsg files and aggregate results.
 */
export function parseFiles(
  filePaths: string[],
  options?: ParseOptions
): ParseResult {
  const endpoints: RpcEndpoint[] = [];
  const fileEndpoints = new Map<string, RpcEndpoint[]>();

  for (const filePath of filePaths) {
    const fileResults = parseFile(filePath, options);
    endpoints.push(...fileResults);
    fileEndpoints.set(filePath, fileResults);
  }

  return { endpoints, fileEndpoints };
}

/**
 * Convert PMT endpoint info to RpcEndpoint.
 */
function toRpcEndpoint(info: PmtEndpointInfo): RpcEndpoint {
  return {
    requestType: info.requestTypeName,
    responseType: getResponseTypeName(info.responseType),
    sourceFile: info.file.path,
  };
}
