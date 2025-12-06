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
