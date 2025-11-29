import {
  type Message,
  parseCerealString,
  isTaggedMessageData,
} from '@propanejs/runtime';
import { type MessageClass, type RpcRequest, HandlerError } from '@propanejs/pms-core';
import type { Handler, HandlerDescriptor, HandlerContext } from './handler.js';

/**
 * Registry for message handlers.
 * Routes incoming requests to the appropriate handler based on message type.
 */
export class HandlerRegistry {
  private readonly handlers = new Map<string, HandlerDescriptor>();

  /**
   * Register a handler for a message type.
   * The response type is inferred from the request type's RpcRequest parameter.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  register<TRequest extends Message<any> & RpcRequest<TResponse>, TResponse extends Message<any>>(
    messageClass: MessageClass,
    handler: Handler<TRequest, TResponse>
  ): this {
    // Create a dummy instance to get the type name
    // (The $typeName getter reads from a private field, so we need an instance)
    const dummyInstance = new messageClass();
    const typeName = dummyInstance.$typeName;

    if (this.handlers.has(typeName)) {
      throw new Error(`Handler already registered for type: ${typeName}`);
    }

    this.handlers.set(typeName, {
      typeName,
      messageClass,
      handler,
    });

    return this;
  }

  /**
   * Get a handler by type name.
   */
  getHandler(typeName: string): HandlerDescriptor | undefined {
    return this.handlers.get(typeName);
  }

  /**
   * Check if a handler exists for a type name.
   */
  hasHandler(typeName: string): boolean {
    return this.handlers.has(typeName);
  }

  /**
   * Dispatch a serialized request to the appropriate handler.
   * Returns the serialized response.
   */
  async dispatch(body: string, context: HandlerContext): Promise<string> {
    // Parse the cereal string
    const parsed = parseCerealString(body);

    // Check if it's a tagged message
    if (!isTaggedMessageData(parsed)) {
      throw new HandlerError(
        'PARSE_ERROR',
        'Request must be a tagged message ($TypeName{...})'
      );
    }

    // Look up handler by type tag
    const descriptor = this.getHandler(parsed.$tag);
    if (!descriptor) {
      throw new HandlerError(
        'UNKNOWN_TYPE',
        `No handler registered for type: ${parsed.$tag}`
      );
    }

    // Construct the request message using $fromEntries via prototype access
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const proto = descriptor.messageClass.prototype as any;
    const props = proto.$fromEntries(parsed.$data);
    const request = new descriptor.messageClass(props);

    // Call the handler
    const response = await descriptor.handler(request, context);

    // Serialize response with type tag
    // The serialize() method returns `:{ ... }`, so we insert the type tag after `:`
    const serialized = response.serialize();
    return `:$${response.$typeName}${serialized.slice(1)}`;
  }
}
