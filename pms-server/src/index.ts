// Re-export core types for convenience
export type {
  RpcRequest,
  ResponseOf,
  MessageClass,
  ProtocolErrorCode,
  ProtocolError,
} from '@propanejs/pms-core';
export { HandlerError, ERROR_STATUS_MAP } from '@propanejs/pms-core';

// Handler types
export type {
  Handler,
  HandlerContext,
  HandlerDescriptor,
} from './handler.js';

// Transport
export type {
  Transport,
  TransportHandler,
  TransportRequest,
  TransportResponse,
} from './transport/transport.js';
export { HttpTransport } from './transport/http-transport.js';
export type { HttpTransportOptions } from './transport/http-transport.js';

// Server
export { PmsServer } from './server.js';
export type { PmsServerOptions } from './server.js';

// Registry (for advanced use cases)
export { HandlerRegistry } from './registry.js';
