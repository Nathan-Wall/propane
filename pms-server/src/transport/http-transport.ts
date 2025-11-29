import {
  createServer,
  type IncomingMessage,
  type ServerResponse,
  type Server,
} from 'node:http';
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

export interface HttpTransportOptions {
  port?: number;
  host?: string;
  /** CORS configuration. Set to true for permissive defaults, or provide options. */
  cors?: boolean | CorsOptions;
}

/**
 * HTTP transport using raw Node.js HTTP server.
 */
export class HttpTransport implements Transport {
  private server: Server | null = null;
  private readonly options: HttpTransportOptions;
  private readonly corsConfig: CorsOptions | null;

  constructor(options: HttpTransportOptions = {}) {
    this.options = options;
    this.corsConfig = this.normalizeCorsOptions(options.cors);
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
      this.server = createServer(
        async (req: IncomingMessage, res: ServerResponse) => {
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
        }
      );

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
}
