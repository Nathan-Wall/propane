import {
  parseCerealString,
  isTaggedMessageData,
} from '@/runtime/index.js';
import { type MessageClass, type EndpointMessage, type AnyMessage, HandlerError } from '@/pms-core/src/index.js';
import { type Handler, type HandlerDescriptor, type HandlerContext, isResponseWithHeaders } from './handler.js';

/**
 * Result from dispatching a request.
 */
export interface DispatchResult {
  /** Serialized response body */
  readonly body: string;
  /** Optional custom headers from handler */
  readonly headers?: Record<string, string>;
}

/**
 * Registry for message handlers.
 * Routes incoming requests to the appropriate handler based on message type.
 */
export class HandlerRegistry {
  private readonly handlers = new Map<string, HandlerDescriptor>();

  /**
   * Register a handler for a message type.
   * The response type is inferred from the request type's EndpointMessage parameter.
   */
  register<
    TRequest extends EndpointMessage<AnyMessage, TResponse>,
    TResponse extends AnyMessage
  >(
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
      // Cast through unknown to store in the generic registry
      // Type safety is maintained by the register() method signature
      handler: handler as unknown as Handler<AnyMessage, AnyMessage>,
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
   * Returns the serialized response and any custom headers.
   */
  async dispatch(
    body: string,
    context: HandlerContext
  ): Promise<DispatchResult> {
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

    let request: AnyMessage;
    if (typeof parsed.$data === 'string') {
      const compactCtor = descriptor.messageClass as unknown as {
        $compact?: boolean;
        fromCompact?: (...args: unknown[]) => AnyMessage;
      };
      if (compactCtor.$compact === true && typeof compactCtor.fromCompact === 'function') {
        request = compactCtor.fromCompact(parsed.$data);
      } else {
        throw new HandlerError(
          'PARSE_ERROR',
          `Invalid compact tagged request for type: ${parsed.$tag}`
        );
      }
    } else {
      // Construct the request message using $fromEntries via prototype access
      const proto = descriptor.messageClass.prototype as {
        $fromEntries: (data: Record<string, unknown>) => unknown;
      };
      const props = proto.$fromEntries(parsed.$data);
      request = new descriptor.messageClass(props);
    }

    // Call the handler
    // Cast request to AnyMessage - type safety is ensured by the register() signature
    const result = await descriptor.handler(
      request,
      context
    );

    // Extract response and optional headers
    let response: AnyMessage;
    let headers: Record<string, string> | undefined;

    if (isResponseWithHeaders(result)) {
      response = result.body;
      if (result.headers) {
        headers = {};
        for (const [key, value] of result.headers) {
          headers[key] = value;
        }
      }
    } else {
      response = result;
    }

    // Serialize response with type tag for RPC responses
    // Cast to access the full serialize signature with options
    const serializedBody = (
      response as { serialize(options?: { includeTag?: boolean }): string }
    ).serialize({ includeTag: true });

    return { body: serializedBody, headers };
  }
}
