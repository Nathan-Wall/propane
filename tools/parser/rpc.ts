/**
 * RPC / Endpoint Detection
 *
 * Helpers for detecting and extracting endpoint information from PMT.
 */

import type { PmtFile, PmtMessage, PmtEndpointInfo, PmtType } from './types.js';

/**
 * The canonical module where Endpoint is exported.
 */
const PROPANE_CORE_MODULE = '@propanejs/pms-core';

/**
 * The canonical name of the Endpoint type.
 */
const ENDPOINT_TYPE_NAME = 'Endpoint';

/**
 * Check if a message is transformable.
 *
 * A message is transformable if it is a message type (Message<T>, Table<T>, or Endpoint<P, R>)
 * and has no error-level diagnostics attached to the file
 * that would prevent transformation.
 *
 * @param message - The message to check
 * @param file - The file containing the message
 * @returns true if the message can be transformed
 */
export function isTransformableMessage(
  message: PmtMessage, file: PmtFile
): boolean {
  if (!message.isMessageType) {
    return false;
  }

  // Check if there are any error diagnostics for this message
  const messageErrors = file.diagnostics.filter(
    (d) =>
      d.severity === 'error'
      && d.location.start.line >= message.location.start.line
      && d.location.end.line <= message.location.end.line
  );

  return messageErrors.length === 0;
}

/**
 * Get endpoint info for a message.
 *
 * Checks if the message is a wrapper type whose wrapper name
 * resolves to `Endpoint` imported from `@propanejs/pms-core`.
 *
 * @param file - The file containing the message
 * @param message - The message to check
 * @returns Endpoint info if this is a valid endpoint, null otherwise
 */
export function getEndpointInfo(
  file: PmtFile, message: PmtMessage
): PmtEndpointInfo | null {
  // Must be a message type
  if (!message.isMessageType) {
    return null;
  }

  // Must have a wrapper
  if (!message.wrapper) {
    return null;
  }

  // Must have a response type
  if (!message.wrapper.responseType) {
    return null;
  }

  // Check if the wrapper's local name resolves to Endpoint from @propanejs/pms-core
  const localName = message.wrapper.localName;

  // Find an import that maps this local name to Endpoint from @propanejs/pms-core
  // Also support internal paths like @/pms-core/src/index.js
  const isEndpoint = file.imports.some((imp) => {
    if (imp.source !== PROPANE_CORE_MODULE && !imp.source.startsWith('@/pms-core')) {
      return false;
    }
    return imp.specifiers.some(
      (spec) => spec.imported === ENDPOINT_TYPE_NAME && spec.local === localName
    );
  });

  if (!isEndpoint) {
    return null;
  }

  return {
    requestTypeName: message.name,
    responseType: message.wrapper.responseType,
    message,
    file,
  };
}

/**
 * Find all endpoints in a file.
 *
 * @param file - The PMT file to search
 * @returns Array of endpoint info objects
 */
export function findEndpoints(file: PmtFile): PmtEndpointInfo[] {
  const endpoints: PmtEndpointInfo[] = [];

  for (const message of file.messages) {
    const endpointInfo = getEndpointInfo(file, message);
    if (endpointInfo) {
      endpoints.push(endpointInfo);
    }
  }

  return endpoints;
}

/**
 * Find all endpoints across multiple files.
 *
 * @param files - The PMT files to search
 * @returns Array of endpoint info objects from all files
 */
export function findAllEndpoints(files: PmtFile[]): PmtEndpointInfo[] {
  return files.flatMap(findEndpoints);
}

/**
 * Get the response type name as a string.
 *
 * For simple reference types, returns the type name.
 * For complex types, returns a descriptive string.
 *
 * @param responseType - The response type
 * @returns A string representation of the type
 */
export function getResponseTypeName(responseType: PmtType): string {
  if (responseType.kind === 'reference') {
    return responseType.name;
  }

  // For other types, return a simplified representation
  switch (responseType.kind) {
    case 'primitive':
      return responseType.primitive;
    case 'array':
      return `Array<${getResponseTypeName(responseType.elementType)}>`;
    case 'union':
      return responseType.types.map(getResponseTypeName).join(' | ');
    case 'map':
      return `Map<${getResponseTypeName(responseType.keyType)}, ${getResponseTypeName(responseType.valueType)}>`;
    case 'set':
      return `Set<${getResponseTypeName(responseType.elementType)}>`;
    case 'date':
      return 'Date';
    case 'url':
      return 'URL';
    case 'arraybuffer':
      return 'ArrayBuffer';
    case 'literal':
      return typeof responseType.value === 'string'
        ? `'${responseType.value}'`
        : String(responseType.value);
    default:
      return 'unknown';
  }
}
