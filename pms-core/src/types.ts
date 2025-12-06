import type { Message } from '@/runtime/index.js';

/**
 * Marker interface for RPC requests.
 * The ResponseType parameter links request to response at the type level.
 *
 * @example
 * ```typescript
 * export type GetUserRequest = {
 *   '1:id': number;
 * } & RpcRequest<GetUserResponse>;
 * ```
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface RpcRequest<TResponse extends Message<any>> {
  /** Phantom type field - exists only at compile time */
  readonly __responseType?: TResponse;
}

/**
 * Wrapper type for RPC endpoints in .pmsg files.
 * Links a request payload to its response type.
 *
 * Used with the @message decorator to define RPC endpoints:
 *
 * @example
 * ```typescript
 * import { Endpoint } from '@propanejs/core';
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
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface Endpoint<TPayload, TResponse extends Message<any>> {
  /** Phantom type field for payload - exists only at compile time */
  readonly __payloadType?: TPayload;
  /** Phantom type field for response - exists only at compile time */
  readonly __responseType?: TResponse;
}

/**
 * Extract the response type from a request type.
 *
 * @example
 * ```typescript
 * type Response = ResponseOf<GetUserRequest>; // GetUserResponse
 * ```
 */
export type ResponseOf<T> = T extends RpcRequest<infer R> ? R : never;

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
