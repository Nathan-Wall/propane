/**
 * Request received by a transport.
 */
export interface TransportRequest {
  /** Raw cereal-serialized request body */
  readonly body: string;
  /** Optional headers (for HTTP transports) */
  readonly headers?: Record<string, string>;
}

/**
 * Response to send via a transport.
 */
export interface TransportResponse {
  /** HTTP status code */
  readonly status: number;
  /** Cereal-serialized response body */
  readonly body: string;
  /** Optional headers */
  readonly headers?: Record<string, string>;
}

/**
 * Handler function that processes incoming requests.
 */
export type TransportHandler = (
  request: TransportRequest
) => Promise<TransportResponse>;

/**
 * Interface for transport implementations (HTTP, WebSocket, etc.)
 */
export interface Transport {
  /**
   * Start accepting requests.
   * @param handler - Function to handle incoming requests
   */
  start(handler: TransportHandler): Promise<void>;

  /**
   * Gracefully stop the transport.
   */
  stop(): Promise<void>;
}
