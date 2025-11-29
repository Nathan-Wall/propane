import type { Message, DataObject } from '@propanejs/runtime';
import type { RpcRequest, MessageClass } from './types.js';

/**
 * Context passed to every handler.
 */
export interface HandlerContext {
  /** Unique identifier for this request */
  readonly requestId: string;
  /** Time when the request was received */
  readonly receivedAt: Date;
}

/**
 * Handler function type.
 * The response type is inferred from the request's RpcRequest type parameter.
 */
export type Handler<TRequest, TResponse> = (
  request: TRequest,
  context: HandlerContext
) => Promise<TResponse> | TResponse;

/**
 * Internal descriptor for a registered handler.
 */
export interface HandlerDescriptor {
  readonly typeName: string;
  readonly messageClass: MessageClass;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  readonly handler: Handler<any, any>;
}
