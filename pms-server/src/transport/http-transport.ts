import {
  createServer as createHttpServer,
  type IncomingMessage,
  type ServerResponse,
  type Server,
} from 'node:http';
import { createServer as createHttpsServer } from 'node:https';
import type {
  Transport,
  TransportHandler,
  TransportRequest,
  TransportResponse,
} from './transport.js';

export interface CorsOptions {
  /** Allowed origins. Use '*' for all origins, or specify an array of allowed origins. */
  origin?: string | string[];
  /** Allowed HTTP methods. Default: ['POST', 'OPTIONS'] */
  methods?: string[];
  /** Allowed headers. Default: ['Content-Type'] */
  allowedHeaders?: string[];
  /** Headers exposed to the client. */
  exposedHeaders?: string[];
  /** Whether to allow credentials. Default: false */
  credentials?: boolean;
  /** Max age for preflight cache in seconds. Default: 86400 (24 hours) */
  maxAge?: number;
}

export interface CsrfOptions {
  /**
   * Allowed origins for CSRF validation. Requests with an Origin header
   * not in this list will be rejected. If not specified, uses the CORS
   * origin list. For same-origin only, use an empty array.
   */
  allowedOrigins?: string[];
  /**
   * Require a custom header to be present. This prevents simple form
   * submissions since forms cannot set custom headers.
   * Default: true
   */
  requireHeader?: boolean;
  /**
   * Name of the required header. Default: 'X-PMS-Request'
   */
  headerName?: string;
}

export interface TlsOptions {
  /** PEM-encoded private key */
  key: string | Buffer;
  /** PEM-encoded certificate */
  cert: string | Buffer;
  /** Optional PEM-encoded CA certificate(s) for client verification */
  ca?: string | Buffer | Array<string | Buffer>;
  /** Request client certificate. Default: false */
  requestCert?: boolean;
  /** Reject unauthorized client certificates. Default: true when requestCert is true */
  rejectUnauthorized?: boolean;
}

export interface HttpTransportOptions {
  port?: number;
  host?: string;
  /** CORS configuration. Set to true for permissive defaults, or provide options. */
  cors?: boolean | CorsOptions;
  /** CSRF protection. Set to true for defaults, or provide options. Default: true */
  csrf?: boolean | CsrfOptions;
  /** TLS configuration for HTTPS. If provided, server uses HTTPS. */
  tls?: TlsOptions;
}

interface NormalizedCsrfConfig {
  allowedOrigins: string[] | null; // null means use CORS origins or allow all
  requireHeader: boolean;
  headerName: string;
}

/**
 * HTTP transport using raw Node.js HTTP server.
 */
export class HttpTransport implements Transport {
  private server: Server | null = null;
  private readonly options: HttpTransportOptions;
  private readonly corsConfig: CorsOptions | null;
  private readonly csrfConfig: NormalizedCsrfConfig;

  constructor(options: HttpTransportOptions = {}) {
    this.options = options;
    this.corsConfig = this.normalizeCorsOptions(options.cors);
    this.csrfConfig = this.normalizeCsrfOptions(options.csrf);

    // If CSRF requires a header, add it to CORS allowed headers
    if (this.corsConfig && this.csrfConfig.requireHeader) {
      const headerName = this.csrfConfig.headerName;
      if (!this.corsConfig.allowedHeaders?.includes(headerName)) {
        this.corsConfig.allowedHeaders = [
          ...(this.corsConfig.allowedHeaders ?? []),
          headerName,
        ];
      }
    }
  }

  private normalizeCsrfOptions(csrf?: boolean | CsrfOptions): NormalizedCsrfConfig {
    // Default to enabled
    if (csrf === undefined || csrf === true) {
      return {
        allowedOrigins: null,
        requireHeader: true,
        headerName: 'X-PMS-Request',
      };
    }
    if (csrf === false) {
      return {
        allowedOrigins: null,
        requireHeader: false,
        headerName: 'X-PMS-Request',
      };
    }
    return {
      allowedOrigins: csrf.allowedOrigins ?? null,
      requireHeader: csrf.requireHeader ?? true,
      headerName: csrf.headerName ?? 'X-PMS-Request',
    };
  }

  private normalizeCorsOptions(cors?: boolean | CorsOptions): CorsOptions | null {
    if (!cors) return null;
    if (cors === true) {
      return {
        origin: '*',
        methods: ['POST', 'OPTIONS'],
        allowedHeaders: ['Content-Type'],
        maxAge: 86400,
      };
    }
    return {
      origin: cors.origin ?? '*',
      methods: cors.methods ?? ['POST', 'OPTIONS'],
      allowedHeaders: cors.allowedHeaders ?? ['Content-Type'],
      exposedHeaders: cors.exposedHeaders,
      credentials: cors.credentials ?? false,
      maxAge: cors.maxAge ?? 86400,
    };
  }

  /**
   * Validate CSRF protection.
   * Returns null if valid, or an error message if invalid.
   */
  private validateCsrf(req: IncomingMessage): string | null {
    // Check required header
    if (this.csrfConfig.requireHeader) {
      const headerName = this.csrfConfig.headerName.toLowerCase();
      if (!req.headers[headerName]) {
        return `Missing required header: ${this.csrfConfig.headerName}`;
      }
    }

    // Check origin if present
    const origin = req.headers.origin;
    if (origin) {
      // Determine allowed origins
      let allowedOrigins: string[] | null = this.csrfConfig.allowedOrigins;

      // Fall back to CORS origins if not explicitly set
      if (allowedOrigins === null && this.corsConfig) {
        const corsOrigin = this.corsConfig.origin;
        if (corsOrigin === '*') {
          allowedOrigins = null; // Allow all
        } else if (Array.isArray(corsOrigin)) {
          allowedOrigins = corsOrigin;
        } else if (typeof corsOrigin === 'string') {
          allowedOrigins = [corsOrigin];
        }
      }

      // Validate origin if we have a restricted list
      if (allowedOrigins !== null && !allowedOrigins.includes(origin)) {
        return `Origin not allowed: ${origin}`;
      }
    }

    return null;
  }

  private getCorsHeaders(requestOrigin?: string): Record<string, string> {
    if (!this.corsConfig) return {};

    const headers: Record<string, string> = {};

    // Determine allowed origin
    const { origin } = this.corsConfig;
    if (origin === '*') {
      headers['Access-Control-Allow-Origin'] = '*';
    } else if (Array.isArray(origin)) {
      if (requestOrigin && origin.includes(requestOrigin)) {
        headers['Access-Control-Allow-Origin'] = requestOrigin;
        headers['Vary'] = 'Origin';
      }
    } else if (typeof origin === 'string') {
      headers['Access-Control-Allow-Origin'] = origin;
    }

    if (this.corsConfig.credentials) {
      headers['Access-Control-Allow-Credentials'] = 'true';
    }

    if (this.corsConfig.exposedHeaders?.length) {
      headers['Access-Control-Expose-Headers'] = this.corsConfig.exposedHeaders.join(', ');
    }

    return headers;
  }

  private getPreflightHeaders(requestOrigin?: string): Record<string, string> {
    if (!this.corsConfig) return {};

    const headers = this.getCorsHeaders(requestOrigin);

    if (this.corsConfig.methods?.length) {
      headers['Access-Control-Allow-Methods'] = this.corsConfig.methods.join(', ');
    }

    if (this.corsConfig.allowedHeaders?.length) {
      headers['Access-Control-Allow-Headers'] = this.corsConfig.allowedHeaders.join(', ');
    }

    if (this.corsConfig.maxAge !== undefined) {
      headers['Access-Control-Max-Age'] = String(this.corsConfig.maxAge);
    }

    return headers;
  }

  async start(handler: TransportHandler): Promise<void> {
    return new Promise((resolve, reject) => {
      const requestHandler = async (req: IncomingMessage, res: ServerResponse) => {
        const requestOrigin = req.headers.origin;

        // Handle CORS preflight
        if (req.method === 'OPTIONS' && this.corsConfig) {
          const preflightHeaders = this.getPreflightHeaders(requestOrigin);
          res.writeHead(204, preflightHeaders);
          res.end();
          return;
        }

        // Only accept POST requests
        if (req.method !== 'POST') {
          res.writeHead(405, {
            'Content-Type': 'text/plain',
            ...this.getCorsHeaders(requestOrigin),
          });
          res.end('Method Not Allowed');
          return;
        }

        // Validate CSRF protection
        const csrfError = this.validateCsrf(req);
        if (csrfError) {
          res.writeHead(403, {
            'Content-Type': 'text/plain',
            ...this.getCorsHeaders(requestOrigin),
          });
          res.end(`Forbidden: ${csrfError}`);
          return;
        }

        // Read the request body
        const chunks: Buffer[] = [];
        for await (const chunk of req) {
          chunks.push(chunk as Buffer);
        }
        const body = Buffer.concat(chunks).toString('utf8');

        // Build headers object
        const headers: Record<string, string> = {};
        for (const [key, value] of Object.entries(req.headers)) {
          if (typeof value === 'string') {
            headers[key] = value;
          } else if (Array.isArray(value)) {
            headers[key] = value.join(', ');
          }
        }

        const transportRequest: TransportRequest = { body, headers };

        try {
          const response: TransportResponse = await handler(transportRequest);
          res.writeHead(response.status, {
            'Content-Type': 'application/x-propane-cereal',
            ...this.getCorsHeaders(requestOrigin),
            ...response.headers,
          });
          res.end(response.body);
        } catch {
          res.writeHead(500, {
            'Content-Type': 'text/plain',
            ...this.getCorsHeaders(requestOrigin),
          });
          res.end('Internal Server Error');
        }
      };

      // Create HTTP or HTTPS server based on TLS configuration
      if (this.options.tls) {
        this.server = createHttpsServer(
          {
            key: this.options.tls.key,
            cert: this.options.tls.cert,
            ca: this.options.tls.ca,
            requestCert: this.options.tls.requestCert,
            rejectUnauthorized: this.options.tls.rejectUnauthorized,
          },
          requestHandler
        );
      } else {
        this.server = createHttpServer(requestHandler);
      }

      const port = this.options.port ?? 3000;
      const host = this.options.host ?? '0.0.0.0';

      this.server.listen(port, host, () => {
        resolve();
      });

      this.server.on('error', reject);
    });
  }

  async stop(): Promise<void> {
    return new Promise((resolve) => {
      if (this.server) {
        this.server.close(() => resolve());
      } else {
        resolve();
      }
    });
  }

  get port(): number | undefined {
    const address = this.server?.address();
    if (address && typeof address !== 'string') {
      return address.port;
    }
    return undefined;
  }

  /** Whether the server is using HTTPS */
  get secure(): boolean {
    return !!this.options.tls;
  }
}
