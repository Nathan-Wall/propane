import {
  parseCerealString,
  isTaggedMessageData,
} from '@/runtime/index.js';
import type { MessageClass, EndpointMessage, AnyMessage } from '@/pms-core/src/index.js';

// WebSocket implementation - use native browser WebSocket or ws package for Node.js
interface WebSocketLike {
  readyState: number;
  send(data: string): void;
  close(): void;
  addEventListener(event: string, listener: (event: unknown) => void): void;
  onopen: ((event: unknown) => void) | null;
  onmessage: ((event: { data: unknown }) => void) | null;
  onclose: ((event: unknown) => void) | null;
  onerror: ((event: unknown) => void) | null;
}

// WebSocket ready states
const WS_OPEN = 1;

// Get WebSocket constructor - browser native or ws package
let WebSocketImpl: new (url: string) => WebSocketLike;

// eslint-disable-next-line unicorn/prefer-ternary -- comments explain logic
if (typeof WebSocket === 'undefined') {
  // Node.js environment - will be set on first use
  WebSocketImpl = null as unknown as new (url: string) => WebSocketLike;
} else {
  // Browser environment - use native WebSocket
  WebSocketImpl = WebSocket as unknown as new (url: string) => WebSocketLike;
}

async function getWebSocketImpl(): Promise<new (url: string) => WebSocketLike> {
  if (WebSocketImpl) {
    return WebSocketImpl;
  }
  // Dynamic import for Node.js
  const ws = await import('ws');
  WebSocketImpl = ws.WebSocket as unknown as new (url: string) => WebSocketLike;
  return WebSocketImpl;
}

export interface PmwsClientOptions {
  /** WebSocket URL of the PMWS server (e.g., 'ws://localhost:8080') */
  url: string;
  /** Optional timeout for individual requests in milliseconds (default: 30000) */
  timeout?: number;
  /** Optional timeout for connection in milliseconds (default: 5000) */
  connectTimeout?: number;
  /** Whether to automatically reconnect on disconnect (default: true) */
  autoReconnect?: boolean;
  /** Delay between reconnection attempts in milliseconds (default: 1000) */
  reconnectDelay?: number;
  /** Maximum number of reconnection attempts (default: 10) */
  maxReconnectAttempts?: number;
}

/**
 * Error thrown when a protocol error is received from the server.
 */
export class PmwsProtocolError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly requestId?: string,
    public readonly details?: string
  ) {
    super(message);
    this.name = 'PmwsProtocolError';
  }
}

/**
 * Error thrown when connection fails.
 */
export class PmwsConnectionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PmwsConnectionError';
  }
}

interface PendingRequest {
  resolve: (body: string) => void;
  reject: (error: Error) => void;
  timer: ReturnType<typeof setTimeout>;
}

/**
 * WebSocket client for PMWS (Propane Messages over WebSockets).
 *
 * Maintains a persistent connection for efficient RPC calls.
 *
 * @example
 * ```typescript
 * const client = new PmwsClient({ url: 'ws://localhost:8080' });
 * await client.connect();
 *
 * const response = await client.call(new GetUserRequest({ id: 123 }), GetUserResponse);
 * console.log(response.name);
 *
 * await client.close();
 * ```
 */
export class PmwsClient {
  private readonly url: string;
  private readonly timeout: number;
  private readonly connectTimeout: number;
  private readonly autoReconnect: boolean;
  private readonly reconnectDelay: number;
  private readonly maxReconnectAttempts: number;

  private ws: WebSocketLike | null = null;
  private requestId = 0;
  private pendingRequests = new Map<string, PendingRequest>();
  private reconnectAttempts = 0;
  private isClosing = false;
  private connectionPromise: Promise<void> | null = null;

  constructor(options: PmwsClientOptions) {
    this.url = options.url;
    this.timeout = options.timeout ?? 30_000;
    this.connectTimeout = options.connectTimeout ?? 5000;
    this.autoReconnect = options.autoReconnect ?? true;
    this.reconnectDelay = options.reconnectDelay ?? 1000;
    this.maxReconnectAttempts = options.maxReconnectAttempts ?? 10;
  }

  /**
   * Connect to the WebSocket server.
   * This is called automatically on first call() if not already connected.
   */
  async connect(): Promise<void> {
    if (this.ws?.readyState === WS_OPEN) {
      return;
    }

    if (this.connectionPromise) {
      return this.connectionPromise;
    }

    this.connectionPromise = this.doConnect();
    try {
      await this.connectionPromise;
    } finally {
      this.connectionPromise = null;
    }
  }

  private async doConnect(): Promise<void> {
    const WS = await getWebSocketImpl();

    return new Promise((resolve, reject) => {
      const ws = new WS(this.url);
      let connected = false;

      const connectTimer = setTimeout(() => {
        if (!connected) {
          ws.close();
          reject(new PmwsConnectionError('Connection timeout'));
        }
      }, this.connectTimeout);

      ws.addEventListener('open', () => {
        connected = true;
        clearTimeout(connectTimer);
        this.reconnectAttempts = 0;
        resolve();
      });

      ws.addEventListener('message', event => {
        // Handle both browser (event.data is string) and Node.js (event.data is Buffer)
        const data = (event as MessageEvent<unknown>).data;
        const message = typeof data === 'string' ? data : String(data);
        this.handleMessage(message);
      });

      ws.addEventListener('close', () => {
        this.handleDisconnect();
      });

      ws.addEventListener('error', event => {
        if (!connected) {
          clearTimeout(connectTimer);
          const message = event && typeof event === 'object' && 'message' in event
            ? String((event as { message: unknown }).message)
            : 'Connection failed';
          reject(new PmwsConnectionError(message));
        }
      });

      this.ws = ws;
    });
  }

  private handleMessage(message: string): void {
    // Parse response: requestId\tbody
    const tabIndex = message.indexOf('\t');
    if (tabIndex === -1) {
      return; // Invalid format, ignore
    }

    const requestId = message.slice(0, tabIndex);
    const body = message.slice(tabIndex + 1);

    const pending = this.pendingRequests.get(requestId);
    if (pending) {
      clearTimeout(pending.timer);
      this.pendingRequests.delete(requestId);
      pending.resolve(body);
    }
  }

  private handleDisconnect(): void {
    // Reject all pending requests
    for (const [, pending] of this.pendingRequests) {
      clearTimeout(pending.timer);
      pending.reject(new PmwsConnectionError('Connection closed'));
    }
    this.pendingRequests.clear();

    // Attempt reconnection if enabled
    if (this.autoReconnect && !this.isClosing) {
      this.attemptReconnect();
    }
  }

  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      return;
    }

    this.reconnectAttempts++;
    setTimeout(() => {
      if (!this.isClosing) {
        this.connect().catch(() => {
          // Reconnection failed, will retry if attempts remain
        });
      }
    }, this.reconnectDelay);
  }

  /**
   * Close the WebSocket connection.
   */
  close(): void {
    this.isClosing = true;

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }

    // Reject all pending requests
    for (const [, pending] of this.pendingRequests) {
      clearTimeout(pending.timer);
      pending.reject(new PmwsConnectionError('Client closed'));
    }
    this.pendingRequests.clear();
  }

  /**
   * Check if the client is connected.
   */
  get connected(): boolean {
    return this.ws?.readyState === WS_OPEN;
  }

  /**
   * Make an RPC request to the server.
   *
   * @param request - The request message
   * @param responseClass - The message class for the expected response
   * @returns The deserialized response
   * @throws PmwsProtocolError if the server returns a protocol error
   * @throws PmwsConnectionError if the connection fails
   */
  async request<TResponse extends AnyMessage>(
    request: EndpointMessage<AnyMessage, TResponse>,
    responseClass: MessageClass<TResponse>
  ): Promise<TResponse> {
    // Ensure connected
    await this.connect();

    if (this.ws?.readyState !== WS_OPEN) {
      throw new PmwsConnectionError('Not connected');
    }

    // Serialize request with type tag
    const serialized = request.serialize();
    const body = `:$${request.$typeName}${serialized.slice(1)}`;

    // Generate request ID
    const requestId = String(++this.requestId);

    // Send request and wait for response
    const responseBody = await new Promise<string>((resolve, reject) => {
      const timer = setTimeout(() => {
        this.pendingRequests.delete(requestId);
        reject(new PmwsConnectionError('Request timeout'));
      }, this.timeout);

      this.pendingRequests.set(requestId, { resolve, reject, timer });

      // Send: requestId\tbody
      this.ws!.send(`${requestId}\t${body}`);
    });

    // Check for protocol error
    const parsed = parseCerealString(responseBody);
    if (isTaggedMessageData(parsed)) {
      if (parsed.$tag === 'PmsError') {
        const data = parsed.$data as Record<string, string | undefined>;
        throw new PmwsProtocolError(
          data['code'] ?? 'UNKNOWN',
          data['message'] ?? 'Unknown error',
          data['requestId'],
          data['details']
        );
      }

      if (typeof parsed.$data === 'string') {
        const compactCtor = responseClass as unknown as {
          $compact?: boolean;
          fromCompact?: (...args: unknown[]) => TResponse;
        };
        if (compactCtor.$compact === true && typeof compactCtor.fromCompact === 'function') {
          return compactCtor.fromCompact(parsed.$data);
        }
        throw new Error('Invalid compact tagged response payload.');
      }
      // Reconstruct the message from the parsed data
      // Use type assertion for prototype access to $fromEntries
      type FromEntriesProto = {
        $fromEntries(entries: Record<string, unknown>): unknown;
      };
      const proto = responseClass.prototype as FromEntriesProto;
      const props = proto.$fromEntries(parsed.$data);
      return new responseClass(props as TResponse) as TResponse;
    }

    // Fallback to standard deserialization for non-tagged responses
    return responseClass.deserialize(responseBody) as TResponse;
  }
}
