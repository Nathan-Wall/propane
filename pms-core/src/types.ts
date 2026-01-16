import type { Message, DataObject, AnyMessage } from '@/runtime/index.js';

// Re-export AnyMessage from runtime for consumers
export type { AnyMessage };

/**
 * Endpoint type for .pmsg source files.
 * Links a payload shape to a response message type.
 *
 * Used with Message<{...}> wrapper to define RPC endpoints:
 *
 * @example
 * ```typescript
 * import { Message } from '@propane/runtime';
 * import { Endpoint } from '@propane/pms-core';
 *
 * export type GetUser = Endpoint<{
 *   '1:id': number;
 * }, GetUserResponse>;
 *
 * export type GetUserResponse = Message<{
 *   '1:id': number;
 *   '2:name': string;
 * }>;
 * ```
 */
export type Endpoint<
  Payload extends DataObject,
  Response extends AnyMessage,
> = Message<Payload> & { readonly __responseType?: Response };

/**
 * Endpoint message type for runtime API signatures.
 * Represents a message instance that has a linked response type.
 *
 * Used internally for self-documenting API signatures in pms-client and pms-server.
 *
 * @example
 * ```typescript
 * async request<Payload extends AnyMessage, Response extends AnyMessage>(
 *   request: EndpointMessage<Payload, Response>,
 *   responseClass: MessageClass<Response>
 * ): Promise<Response>
 * ```
 */

export type EndpointMessage<
  Payload extends AnyMessage,
  Response extends AnyMessage,
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
 * Uses structural AnyMessage type instead of Message<any> to avoid
 * TypeScript's strict private field compatibility checks.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface MessageClass<T = any> {
  new (props?: T, options?: { skipValidation?: boolean }): AnyMessage;
  deserialize(message: string, options?: { skipValidation?: boolean }): AnyMessage;
}
