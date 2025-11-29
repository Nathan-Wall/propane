// Types
export type {
  RpcRequest,
  ResponseOf,
  MessageClass,
} from './types.js';

// Handler types
export type {
  Handler,
  HandlerContext,
  HandlerDescriptor,
} from './handler.js';

// Errors
export { HandlerError, ERROR_STATUS_MAP } from './errors.js';
export type { ProtocolErrorCode, ProtocolError } from './errors.js';

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
export { PMServer } from './server.js';
export type { PMServerOptions } from './server.js';

// Client
export { PMSClient, PMSProtocolError } from './client.js';
export type { PMSClientOptions } from './client.js';

// Registry (for advanced use cases)
export { HandlerRegistry } from './registry.js';
