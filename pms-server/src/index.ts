// Re-export core types for convenience
export type {
  Endpoint,
  EndpointMessage,
  ResponseOf,
  MessageClass,
  ProtocolErrorCode,
  ProtocolError,
} from '@/pms-core/src/index.js';
export { HandlerError, ERROR_STATUS_MAP } from '@/pms-core/src/index.js';

// Handler types
export type {
  Handler,
  HandlerContext,
  HandlerDescriptor,
  HandlerResult,
} from './handler.js';
export { isResponseWithHeaders } from './handler.js';

// Response wrapper
export { Response } from './response.pmsg.js';

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
