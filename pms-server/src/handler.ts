import type { Message, DataObject } from '@propanejs/runtime';
import type { MessageClass } from '@propanejs/pms-core';
import { Response } from './response.propane.js';

/**
 * Context passed to every handler.
 */
export interface HandlerContext {
  /** Unique identifier for this request */
  readonly requestId: string;
  /** Time when the request was received */
  readonly receivedAt: Date;
  /** Request headers (includes Cookie header) */
  readonly headers: Readonly<Record<string, string>>;
}

/**
 * Handler result - either a simple response message or a Response wrapper with headers.
 */
export type HandlerResult<TResponse extends Message<DataObject>> =
  TResponse | Response<TResponse>;

/**
 * Type guard to check if result is a Response wrapper with headers.
 */
export function isResponseWithHeaders<T extends Message<DataObject>>(
  result: HandlerResult<T>
): result is Response<T> {
  return result instanceof Response;
}

/**
 * Handler function type.
 * The response type is inferred from the request's RpcRequest type parameter.
 *
 * Handlers can return either:
 * - A response message directly
 * - A Response wrapper with custom HTTP headers
 */
export type Handler<TRequest, TResponse extends Message<DataObject>> = (
  request: TRequest,
  context: HandlerContext
) => Promise<HandlerResult<TResponse>> | HandlerResult<TResponse>;

/**
 * Internal descriptor for a registered handler.
 */
export interface HandlerDescriptor<
  In extends Message<DataObject> = Message<DataObject>,
  Out extends Message<DataObject> = Message<DataObject>,
> {
  readonly typeName: string;
  readonly messageClass: MessageClass;
  readonly handler: Handler<In, Out>;
}
