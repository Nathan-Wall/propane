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
  HandlerResult,
} from './handler.js';
export { isResponseWithHeaders } from './handler.js';

// Response wrapper
export { Response } from './response.propane.js';

// Transport
export type {
  Transport,
  TransportHandler,
  TransportRequest,
  TransportResponse,
} from './transport/transport.js';
export { HttpTransport } from './transport/http-transport.js';
export type { HttpTransportOptions, CorsOptions, CsrfOptions, TlsOptions } from './transport/http-transport.js';
export { WsTransport } from './transport/ws-transport.js';
export type { WsTransportOptions } from './transport/ws-transport.js';

// Server
export { PmsServer } from './server.js';
export type { PmsServerOptions } from './server.js';

// Registry (for advanced use cases)
export { HandlerRegistry } from './registry.js';
