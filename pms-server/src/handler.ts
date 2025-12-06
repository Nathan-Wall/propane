import type { Message, DataObject } from '@/runtime/index.js';
import type { MessageClass } from '@/pms-core/src/index.js';
import { Response } from './response.pmsg.js';

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
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type HandlerResult<TResponse extends Message<any>> =
  TResponse | Response<TResponse>;

/**
 * Type guard to check if result is a Response wrapper with headers.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function isResponseWithHeaders<T extends Message<any>>(
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
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Handler<TRequest, TResponse extends Message<any>> = (
  request: TRequest,
  context: HandlerContext
) => Promise<HandlerResult<TResponse>> | HandlerResult<TResponse>;

/**
 * Internal descriptor for a registered handler.
 */
export interface HandlerDescriptor<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  In extends Message<any> = Message<DataObject>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Out extends Message<any> = Message<DataObject>,
> {
  readonly typeName: string;
  readonly messageClass: MessageClass;
  readonly handler: Handler<In, Out>;
}
