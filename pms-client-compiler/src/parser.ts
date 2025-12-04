import ts from 'typescript';
import { readFileSync } from 'node:fs';

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
 * Parse a .pmsg file and extract RPC request/response pairs.
 *
 * Looks for type aliases that intersect with RpcRequest<TResponse>:
 * ```
 * export type GetUser = {
 *   '1:id': number;
 * } & RpcRequest<GetUserResponse>;
 * ```
 */
export function parseFile(filePath: string): RpcEndpoint[] {
  const content = readFileSync(filePath, 'utf8');
  const sourceFile = ts.createSourceFile(
    filePath,
    content,
    ts.ScriptTarget.Latest,
    true
  );

  const endpoints: RpcEndpoint[] = [];

  function visit(node: ts.Node) {
    if (ts.isTypeAliasDeclaration(node)) {
      const endpoint = extractRpcEndpoint(node, filePath);
      if (endpoint) {
        endpoints.push(endpoint);
      }
    }
    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
  return endpoints;
}

/**
 * Extract RPC endpoint info from a type alias declaration.
 */
function extractRpcEndpoint(
  node: ts.TypeAliasDeclaration,
  filePath: string
): RpcEndpoint | null {
  const typeName = node.name.text;

  // Look for intersection types that include RpcRequest<T>
  if (!ts.isIntersectionTypeNode(node.type)) {
    return null;
  }

  for (const member of node.type.types) {
    if (ts.isTypeReferenceNode(member)) {
      const refName = getTypeName(member.typeName);
      if (refName === 'RpcRequest' && member.typeArguments?.length === 1) {
        const responseTypeArg = member.typeArguments[0]!;
        if (ts.isTypeReferenceNode(responseTypeArg)) {
          const responseType = getTypeName(responseTypeArg.typeName);
          return {
            requestType: typeName,
            responseType,
            sourceFile: filePath,
          };
        }
      }
    }
  }

  return null;
}

/**
 * Get the string name from a TypeScript entity name.
 */
function getTypeName(name: ts.EntityName): string {
  if (ts.isIdentifier(name)) {
    return name.text;
  }
  // Qualified name (e.g., Namespace.Type)
  return `${getTypeName(name.left)}.${name.right.text}`;
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
