import {
  type Message,
  parseCerealString,
  isTaggedMessageData,
} from '@propanejs/runtime';
import type { MessageClass, RpcRequest } from '@propanejs/pms-core';

export interface PmsClientOptions {
  /** Base URL of the PMS server */
  baseUrl: string;
  /** Optional timeout in milliseconds (default: 30000) */
  timeout?: number;
}

/**
 * Error thrown when a protocol error is received from the server.
 */
export class PmsProtocolError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly requestId?: string,
    public readonly details?: string
  ) {
    super(message);
    this.name = 'PmsProtocolError';
  }
}

/**
 * Client for making RPC calls to a Propane Message System server.
 *
 * @example
 * ```typescript
 * const client = new PmsClient({ baseUrl: 'http://localhost:8080' });
 * const response = await client.call(new GetUserRequest({ id: 123 }), GetUserResponse);
 * // response is typed as GetUserResponse
 * ```
 */
export class PmsClient {
  private readonly baseUrl: string;
  private readonly timeout: number;

  constructor(options: PmsClientOptions) {
    this.baseUrl = options.baseUrl.replace(/\/$/, ''); // Remove trailing slash
    this.timeout = options.timeout ?? 30_000;
  }

  /**
   * Make an RPC request to the server.
   *
   * @param request - The request message
   * @param responseClass - The message class for the expected response
   * @returns The deserialized response
   * @throws PmsProtocolError if the server returns a protocol error
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async request<TResponse extends Message<any>>(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    request: Message<any> & RpcRequest<TResponse>,
    responseClass: MessageClass<TResponse>
  ): Promise<TResponse> {
    // Serialize request with type tag
    const serialized = request.serialize();
    const body = `:$${request.$typeName}${serialized.slice(1)}`;

    // Make HTTP request
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-propane-cereal',
        },
        body,
        signal: controller.signal,
      });

      const responseBody = await response.text();

      // Check for protocol error
      if (!response.ok) {
        const error = this.parseProtocolError(responseBody);
        throw new PmsProtocolError(
          error.code,
          error.message,
          error.requestId,
          error.details
        );
      }

      // Deserialize response - handle tagged message format
      // The server sends `:$TypeName{...}` but deserialize expects `:{...}`
      // We need to parse the tagged message and reconstruct without the tag
      const parsed = parseCerealString(responseBody);
      if (isTaggedMessageData(parsed)) {
        // Reconstruct the message from the parsed data
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const proto = responseClass.prototype as any;
        const props = proto.$fromEntries(parsed.$data);
        return new responseClass(props) as TResponse;
      }
      // Fallback to standard deserialization for non-tagged responses
      return responseClass.deserialize(responseBody) as TResponse;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  /**
   * Parse a protocol error from the response body.
   */
  private parseProtocolError(body: string): {
    code: string;
    message: string;
    requestId?: string;
    details?: string;
  } {
    try {
      const parsed = parseCerealString(body);
      if (isTaggedMessageData(parsed) && parsed.$tag === 'PmsError') {
        return {
          code: String(parsed.$data['code'] ?? 'UNKNOWN'),
          message: String(parsed.$data['message'] ?? 'Unknown error'),
          requestId: parsed.$data['requestId'] as string | undefined,
          details: parsed.$data['details'] as string | undefined,
        };
      }
    } catch {
      // Fall through to default
    }

    return {
      code: 'UNKNOWN',
      message: body || 'Unknown error',
    };
  }
}
