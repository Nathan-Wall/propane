import type { Message, DataObject } from '@/runtime/index.js';

/**
 * Endpoint type for .pmsg source files.
 * Links a payload shape to a response message type.
 *
 * Used with the @message decorator to define RPC endpoints:
 *
 * @example
 * ```typescript
 * import { Endpoint } from '@propanejs/pms-core';
 *
 * // @message
 * export type GetUser = Endpoint<{
 *   '1:id': number;
 * }, GetUserResponse>;
 *
 * // @message
 * export type GetUserResponse = {
 *   '1:id': number;
 *   '2:name': string;
 * };
 * ```
 */
export type Endpoint<
  Payload extends DataObject,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Response extends Message<any>,
> = Message<Payload> & { readonly __responseType?: Response };

/**
 * Endpoint message type for runtime API signatures.
 * Represents a message instance that has a linked response type.
 *
 * Used internally for self-documenting API signatures in pms-client and pms-server.
 *
 * @example
 * ```typescript
 * async request<Payload extends Message<any>, Response extends Message<any>>(
 *   request: EndpointMessage<Payload, Response>,
 *   responseClass: MessageClass<Response>
 * ): Promise<Response>
 * ```
 */
export type EndpointMessage<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Payload extends Message<any>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Response extends Message<any>,
> = Payload & { readonly __responseType?: Response };

/**
 * Extract the response type from an endpoint message.
 *
 * @example
 * ```typescript
 * type Response = ResponseOf<GetUser>; // GetUserResponse
 * ```
 */
export type ResponseOf<T> =
  T extends { readonly __responseType?: infer R } ? R : never;

/**
 * Constraint for message classes that can be used in the RPC system.
 * Uses 'any' for internal types to avoid variance issues with Set<Listener<T>>.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface MessageClass<T = any> {
  readonly TYPE_TAG: symbol;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  new (props?: T): Message<any> & { readonly $typeName: string };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  deserialize(message: string): Message<any>;
}
