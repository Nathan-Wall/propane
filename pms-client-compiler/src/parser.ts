/**
 * RPC Endpoint Parser
 *
 * Parses .pmsg files to extract RPC endpoint definitions using @propanejs/parser.
 * Looks for types decorated with @message that use Endpoint<Payload, Response>.
 */

import { parseFile as pmtParseFile, findEndpoints, getResponseTypeName } from '@/tools/parser/index.js';
import type { PmtEndpointInfo } from '@/tools/parser/types.js';

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
 * Looks for types decorated with @message that use Endpoint<Payload, Response>:
 * ```typescript
 * import { Endpoint } from '@propanejs/pms-core';
 *
 * // @message
 * export type GetUser = Endpoint<{
 *   '1:id': number;
 * }, GetUserResponse>;
 * ```
 */
export function parseFile(filePath: string): RpcEndpoint[] {
  const { file } = pmtParseFile(filePath);
  const pmtEndpoints = findEndpoints(file);

  return pmtEndpoints.map(toRpcEndpoint);
}

/**
 * Parse multiple .pmsg files and aggregate results.
 */
export function parseFiles(filePaths: string[]): ParseResult {
  const endpoints: RpcEndpoint[] = [];
  const fileEndpoints = new Map<string, RpcEndpoint[]>();

  for (const filePath of filePaths) {
    const fileResults = parseFile(filePath);
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
