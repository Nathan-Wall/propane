// Re-export core types for convenience
export type {
  RpcRequest,
  ResponseOf,
  MessageClass,
} from '@propanejs/pms-core';

// Client
export { PMSClient, PMSProtocolError } from './client.js';
export type { PMSClientOptions } from './client.js';
