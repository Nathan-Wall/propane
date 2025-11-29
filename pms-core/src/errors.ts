/**
 * Error thrown by handlers to indicate a known error condition.
 * These errors will be serialized and sent back to the client.
 */
export class HandlerError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly details?: string
  ) {
    super(message);
    this.name = 'HandlerError';
  }
}

/**
 * Protocol error codes for RPC infrastructure failures.
 */
export type ProtocolErrorCode =
  | 'PARSE_ERROR'
  | 'UNKNOWN_TYPE'
  | 'HANDLER_ERROR'
  | 'INTERNAL_ERROR';

/**
 * Protocol error response structure.
 */
export interface ProtocolError {
  readonly code: ProtocolErrorCode;
  readonly message: string;
  readonly details?: string;
}

/**
 * Map error codes to HTTP status codes.
 */
export const ERROR_STATUS_MAP: Record<string, number> = {
  PARSE_ERROR: 400,
  UNKNOWN_TYPE: 404,
  HANDLER_ERROR: 500,
  INTERNAL_ERROR: 500,
};
