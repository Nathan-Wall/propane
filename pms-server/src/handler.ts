import type { MessageClass, AnyMessage } from '@/pms-core/src/index.js';
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
export type HandlerResult<TResponse extends AnyMessage> =
  TResponse | Response<TResponse>;

/**
 * Type guard to check if result is a Response wrapper with headers.
 */
export function isResponseWithHeaders<T extends AnyMessage>(
  result: HandlerResult<T>
): result is Response<T> {
  return result instanceof Response;
}

/**
 * Handler function type.
 * The response type is inferred from the request's EndpointMessage type parameter.
 *
 * Handlers can return either:
 * - A response message directly
 * - A Response wrapper with custom HTTP headers
 */
export type Handler<TRequest, TResponse extends AnyMessage> = (
  request: TRequest,
  context: HandlerContext
) => Promise<HandlerResult<TResponse>> | HandlerResult<TResponse>;

/**
 * Internal descriptor for a registered handler.
 */
export interface HandlerDescriptor<
  In extends AnyMessage = AnyMessage,
  Out extends AnyMessage = AnyMessage,
> {
  readonly typeName: string;
  readonly messageClass: MessageClass;
  readonly handler: Handler<In, Out>;
}
