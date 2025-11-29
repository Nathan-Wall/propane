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

export interface HttpTransportOptions {
  port?: number;
  host?: string;
}

/**
 * HTTP transport using raw Node.js HTTP server.
 */
export class HttpTransport implements Transport {
  private server: Server | null = null;
  private readonly options: HttpTransportOptions;

  constructor(options: HttpTransportOptions = {}) {
    this.options = options;
  }

  async start(handler: TransportHandler): Promise<void> {
    return new Promise((resolve, reject) => {
      this.server = createServer(
        async (req: IncomingMessage, res: ServerResponse) => {
          // Only accept POST requests
          if (req.method !== 'POST') {
            res.writeHead(405, { 'Content-Type': 'text/plain' });
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
              ...response.headers,
            });
            res.end(response.body);
          } catch {
            res.writeHead(500, { 'Content-Type': 'text/plain' });
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
