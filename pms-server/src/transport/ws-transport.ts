import { WebSocketServer, type WebSocket } from 'ws';
import { createServer as createHttpServer, type Server as HttpServer } from 'node:http';
import { createServer as createHttpsServer, type Server as HttpsServer } from 'node:https';
import type {
  Transport,
  TransportHandler,
  TransportRequest,
} from './transport.js';
import type { TlsOptions } from './http-transport.js';

export interface WsTransportOptions {
  port?: number;
  host?: string;
  /** TLS configuration for WSS (WebSocket Secure). If provided, server uses WSS. */
  tls?: TlsOptions;
}

/**
 * WebSocket transport for PMWS (Propane Messages over WebSockets).
 *
 * Protocol:
 * - Client sends: `<requestId>\t<body>`
 * - Server responds: `<requestId>\t<body>`
 *
 * The requestId allows clients to correlate responses with requests
 * in the async WebSocket environment.
 */
export class WsTransport implements Transport {
  private httpServer: HttpServer | HttpsServer | null = null;
  private wss: WebSocketServer | null = null;
  private readonly options: WsTransportOptions;
  private readonly clients = new Set<WebSocket>();

  constructor(options: WsTransportOptions = {}) {
    this.options = options;
  }

  async start(handler: TransportHandler): Promise<void> {
    return new Promise((resolve, reject) => {
      // Create HTTP or HTTPS server based on TLS configuration
      if (this.options.tls) {
        this.httpServer = createHttpsServer({
          key: this.options.tls.key,
          cert: this.options.tls.cert,
          ca: this.options.tls.ca,
          requestCert: this.options.tls.requestCert,
          rejectUnauthorized: this.options.tls.rejectUnauthorized,
        });
      } else {
        this.httpServer = createHttpServer();
      }

      this.wss = new WebSocketServer({ server: this.httpServer });

      this.wss.on('connection', (ws: WebSocket) => {
        this.clients.add(ws);

        ws.on('message', async (data: Buffer | string) => {
          const message = data.toString('utf8');

          // Parse request: requestId\tbody
          const tabIndex = message.indexOf('\t');
          if (tabIndex === -1) {
            // Invalid format - send error
            ws.send('error\tInvalid message format');
            return;
          }

          const requestId = message.slice(0, tabIndex);
          const body = message.slice(tabIndex + 1);

          const transportRequest: TransportRequest = { body };

          try {
            const response = await handler(transportRequest);
            // Send response: requestId\tbody
            ws.send(`${requestId}\t${response.body}`);
          } catch {
            ws.send(`${requestId}\t:$PmsError{"code":"INTERNAL_ERROR","message":"Internal server error","requestId":"${requestId}"}`);
          }
        });

        ws.on('close', () => {
          this.clients.delete(ws);
        });

        ws.on('error', () => {
          this.clients.delete(ws);
        });
      });

      const port = this.options.port ?? 3000;
      const host = this.options.host ?? '0.0.0.0';

      this.httpServer.listen(port, host, () => {
        resolve();
      });

      this.httpServer.on('error', reject);
    });
  }

  async stop(): Promise<void> {
    // Close all client connections
    for (const client of this.clients) {
      client.close();
    }
    this.clients.clear();

    // Close WebSocket server
    if (this.wss) {
      await new Promise<void>((resolve) => {
        this.wss!.close(() => resolve());
      });
    }

    // Close HTTP server
    if (this.httpServer) {
      await new Promise<void>((resolve) => {
        this.httpServer!.close(() => resolve());
      });
    }
  }

  get port(): number | undefined {
    const address = this.httpServer?.address();
    if (address && typeof address !== 'string') {
      return address.port;
    }
    return undefined;
  }

  /**
   * Number of currently connected clients.
   */
  get clientCount(): number {
    return this.clients.size;
  }

  /** Whether the server is using WSS (WebSocket Secure) */
  get secure(): boolean {
    return !!this.options.tls;
  }
}
