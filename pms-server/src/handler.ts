import type { Message } from '@propanejs/runtime';
import type { MessageClass } from '@propanejs/pms-core';

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
 * Extended response with custom headers.
 */
export interface HandlerResponseWithHeaders<TResponse> {
  /** The response message */
  readonly response: TResponse;
  /** Custom headers to include in the HTTP response */
  readonly headers: Record<string, string>;
}

/**
 * Handler result - either a simple response or a response with headers.
 */
export type HandlerResult<TResponse> = TResponse | HandlerResponseWithHeaders<TResponse>;

/**
 * Type guard to check if result includes headers.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function isResponseWithHeaders<T extends Message<any>>(
  result: HandlerResult<T>
): result is HandlerResponseWithHeaders<T> {
  return (
    result !== null &&
    typeof result === 'object' &&
    'response' in result &&
    'headers' in result
  );
}

/**
 * Handler function type.
 * The response type is inferred from the request's RpcRequest type parameter.
 *
 * Handlers can return either:
 * - A response message directly
 * - An object with `response` and `headers` for custom HTTP headers
 */
export type Handler<TRequest, TResponse> = (
  request: TRequest,
  context: HandlerContext
) => Promise<HandlerResult<TResponse>> | HandlerResult<TResponse>;

/**
 * Internal descriptor for a registered handler.
 */
export interface HandlerDescriptor {
  readonly typeName: string;
  readonly messageClass: MessageClass;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  readonly handler: Handler<any, any>;
}
