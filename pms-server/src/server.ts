import type { Message } from '@/runtime/index.js';
import {
  type MessageClass,
  type EndpointMessage,
  HandlerError,
  ERROR_STATUS_MAP,
  type ProtocolError,
} from '@/pms-core/src/index.js';
import { HandlerRegistry } from './registry.js';
import { HttpTransport } from './transport/http-transport.js';
import type { Transport, TransportResponse } from './transport/transport.js';
import type { Handler, HandlerContext } from './handler.js';

export interface PmsServerOptions {
  port?: number;
  host?: string;
  transport?: Transport;
}

/**
 * Propane Message System - RPC server for propane messages.
 *
 * @example
 * ```typescript
 * const server = new PmsServer();
 * server.handle(GetUserRequest, async (req) => {
 *   const user = await db.getUser(req.id);
 *   return new GetUserResponse({ user });
 * });
 * await server.listen({ port: 8080 });
 * ```
 */
export class PmsServer {
  private readonly registry = new HandlerRegistry();
  private transport: Transport | null = null;

  /**
   * Register a handler for a request type.
   * The response type is inferred from the request type's EndpointMessage parameter.
   *
   * @param requestType - The message class for the request
   * @param handler - Function that handles the request and returns a response
   * @returns this - for method chaining
   */
  handle<
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    TRequest extends EndpointMessage<Message<any>, TResponse>,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    TResponse extends Message<any>
  >(
    requestType: MessageClass,
    handler: Handler<TRequest, TResponse>
  ): this {
    this.registry.register(requestType, handler);
    return this;
  }

  /**
   * Start the server.
   *
   * @param options - Server configuration options
   */
  async listen(options: PmsServerOptions = {}): Promise<void> {
    this.transport =
      options.transport
      ?? new HttpTransport({
        port: options.port ?? 3000,
        host: options.host ?? '0.0.0.0',
      });

    await this.transport.start(async (request) => {
      const requestId = generateRequestId();
      const context: HandlerContext = {
        requestId,
        receivedAt: new Date(),
        headers: request.headers ?? {},
      };

      try {
        const result = await this.registry.dispatch(request.body, context);
        return { status: 200, body: result.body, headers: result.headers };
      } catch (error) {
        return this.handleError(error, requestId);
      }
    });
  }

  /**
   * Stop the server.
   */
  async close(): Promise<void> {
    if (this.transport) {
      await this.transport.stop();
      this.transport = null;
    }
  }

  /**
   * Get the underlying transport (useful for getting the port after listen).
   */
  getTransport(): Transport | null {
    return this.transport;
  }

  private handleError(error: unknown, requestId: string): TransportResponse {
    if (error instanceof HandlerError) {
      const status = ERROR_STATUS_MAP[error.code] ?? 500;
      const protocolError: ProtocolError = {
        code: error.code as ProtocolError['code'],
        message: error.message,
        details: error.details,
      };
      return {
        status,
        body: serializeProtocolError(protocolError, requestId),
      };
    }

    // Unexpected error
    const protocolError: ProtocolError = {
      code: 'INTERNAL_ERROR',
      message:
        error instanceof Error ? error.message : 'An unexpected error occurred',
    };
    return {
      status: 500,
      body: serializeProtocolError(protocolError, requestId),
    };
  }
}

/**
 * Serialize a protocol error to cereal format.
 */
function serializeProtocolError(
  error: ProtocolError,
  requestId: string
): string {
  // Create a simple tagged object for the error
  const details = error.details ? `,"details":${JSON.stringify(error.details)}` : '';
  return `:$PmsError{"code":${JSON.stringify(error.code)},"message":${JSON.stringify(error.message)},"requestId":${JSON.stringify(requestId)}${details}}`;
}

/**
 * Generate a simple request ID.
 */
function generateRequestId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}
