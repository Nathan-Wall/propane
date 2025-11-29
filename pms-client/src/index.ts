// Re-export core types for convenience
export type {
  RpcRequest,
  ResponseOf,
  MessageClass,
} from '@propanejs/pms-core';

// Client
export { PmsClient, PmsProtocolError } from './client.js';
export type { PmsClientOptions } from './client.js';
