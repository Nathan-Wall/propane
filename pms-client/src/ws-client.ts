import {
  type Message,
  parseCerealString,
  isTaggedMessageData,
} from '@propanejs/runtime';
import type { MessageClass, RpcRequest } from '@propanejs/pms-core';
import { WebSocket } from 'ws';

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

  private ws: WebSocket | null = null;
  private requestId = 0;
  private pendingRequests = new Map<string, PendingRequest>();
  private reconnectAttempts = 0;
  private isClosing = false;
  private connectionPromise: Promise<void> | null = null;

  constructor(options: PmwsClientOptions) {
    this.url = options.url;
    this.timeout = options.timeout ?? 30_000;
    this.connectTimeout = options.connectTimeout ?? 5_000;
    this.autoReconnect = options.autoReconnect ?? true;
    this.reconnectDelay = options.reconnectDelay ?? 1_000;
    this.maxReconnectAttempts = options.maxReconnectAttempts ?? 10;
  }

  /**
   * Connect to the WebSocket server.
   * This is called automatically on first call() if not already connected.
   */
  async connect(): Promise<void> {
    if (this.ws?.readyState === WebSocket.OPEN) {
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

  private doConnect(): Promise<void> {
    return new Promise((resolve, reject) => {
      const ws = new WebSocket(this.url);
      let connected = false;

      const connectTimer = setTimeout(() => {
        if (!connected) {
          ws.close();
          reject(new PmwsConnectionError('Connection timeout'));
        }
      }, this.connectTimeout);

      ws.on('open', () => {
        connected = true;
        clearTimeout(connectTimer);
        this.reconnectAttempts = 0;
        resolve();
      });

      ws.on('message', (data: Buffer | string) => {
        this.handleMessage(data.toString('utf8'));
      });

      ws.on('close', () => {
        this.handleDisconnect();
      });

      ws.on('error', (error: Error) => {
        if (!connected) {
          clearTimeout(connectTimer);
          reject(new PmwsConnectionError(error.message));
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
  async close(): Promise<void> {
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
    return this.ws?.readyState === WebSocket.OPEN;
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async request<TResponse extends Message<any>>(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    request: Message<any> & RpcRequest<TResponse>,
    responseClass: MessageClass<TResponse>
  ): Promise<TResponse> {
    // Ensure connected
    await this.connect();

    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
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
        throw new PmwsProtocolError(
          String(parsed.$data['code'] ?? 'UNKNOWN'),
          String(parsed.$data['message'] ?? 'Unknown error'),
          parsed.$data['requestId'] as string | undefined,
          parsed.$data['details'] as string | undefined
        );
      }

      // Reconstruct the message from the parsed data
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const proto = responseClass.prototype as any;
      const props = proto.$fromEntries(parsed.$data);
      return new responseClass(props) as TResponse;
    }

    // Fallback to standard deserialization for non-tagged responses
    return responseClass.deserialize(responseBody) as TResponse;
  }
}
