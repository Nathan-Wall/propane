// Re-export core types for convenience
export type {
  RpcRequest,
  ResponseOf,
  MessageClass,
} from '@/pms-core/src/index.js';

// HTTP Client
export { PmsClient, PmsProtocolError } from './client.js';
export type { PmsClientOptions } from './client.js';

// WebSocket Client (PMWS)
export { PmwsClient, PmwsProtocolError, PmwsConnectionError } from './ws-client.js';
export type { PmwsClientOptions } from './ws-client.js';
