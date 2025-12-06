/**
 * Integration tests for PMWS (Propane Messages over WebSockets).
 */
import { describe, it } from 'node:test';
import assert from 'node:assert';
import { PmsServer, HandlerError, WsTransport } from '@/pms-server/src/index.js';
import { PmwsClient, PmwsConnectionError } from '@/pms-client/src/index.js';
import {
  EchoRequest,
  EchoResponse,
  AddRequest,
  AddResponse,
} from './messages.pmsg';

describe('PMWS Server', () => {
  it('can be created with WebSocket transport', async () => {
    const transport = new WsTransport({ port: 0 });
    const server = new PmsServer();
    server.handle(EchoRequest, (req: EchoRequest) => {
      return new EchoResponse({ echo: req.message, timestamp: Date.now() });
    });

    await server.listen({ transport });
    assert.ok(transport.port !== undefined, 'Server should have a port');
    await server.close();
  });

  it('handles WebSocket echo request/response', async () => {
    const transport = new WsTransport({ port: 0 });
    const server = new PmsServer();
    server.handle(EchoRequest, (req: EchoRequest) => {
      return new EchoResponse({ echo: `Echo: ${req.message}`, timestamp: 12_345 });
    });

    await server.listen({ transport });
    const port = transport.port!;

    const client = new PmwsClient({ url: `ws://localhost:${port}` });
    await client.connect();

    const response = await client.request(
      new EchoRequest({ message: 'Hello, PMWS!' }),
      EchoResponse
    );

    assert.strictEqual(response.echo, 'Echo: Hello, PMWS!');
    assert.strictEqual(response.timestamp, 12_345);

    client.close();
    await server.close();
  });

  it('supports multiple calls on same connection', async () => {
    const transport = new WsTransport({ port: 0 });
    const server = new PmsServer();
    server.handle(AddRequest, (req: AddRequest) => {
      return new AddResponse({ sum: req.a + req.b });
    });

    await server.listen({ transport });
    const port = transport.port!;

    const client = new PmwsClient({ url: `ws://localhost:${port}` });
    await client.connect();

    const response1 = await client.request(
      new AddRequest({ a: 1, b: 2 }),
      AddResponse
    );
    assert.strictEqual(response1.sum, 3);

    const response2 = await client.request(
      new AddRequest({ a: 10, b: 20 }),
      AddResponse
    );
    assert.strictEqual(response2.sum, 30);

    const response3 = await client.request(
      new AddRequest({ a: 100, b: 200 }),
      AddResponse
    );
    assert.strictEqual(response3.sum, 300);

    client.close();
    await server.close();
  });

  it('handles concurrent requests', async () => {
    const transport = new WsTransport({ port: 0 });
    const server = new PmsServer();
    server.handle(AddRequest, async (req: AddRequest) => {
      // Add a small delay to ensure requests are truly concurrent
      await new Promise(resolve => setTimeout(resolve, 10));
      return new AddResponse({ sum: req.a + req.b });
    });

    await server.listen({ transport });
    const port = transport.port!;

    const client = new PmwsClient({ url: `ws://localhost:${port}` });
    await client.connect();

    // Fire off multiple requests concurrently
    const [r1, r2, r3] = await Promise.all([
      client.request(new AddRequest({ a: 1, b: 1 }), AddResponse),
      client.request(new AddRequest({ a: 2, b: 2 }), AddResponse),
      client.request(new AddRequest({ a: 3, b: 3 }), AddResponse),
    ]);

    assert.strictEqual(r1.sum, 2);
    assert.strictEqual(r2.sum, 4);
    assert.strictEqual(r3.sum, 6);

    client.close();
    await server.close();
  });

  it('propagates handler errors', async () => {
    const transport = new WsTransport({ port: 0 });
    const server = new PmsServer();
    server.handle(EchoRequest, (): EchoResponse => {
      throw new HandlerError('TEST_ERROR', 'This is a test error');
    });

    await server.listen({ transport });
    const port = transport.port!;

    const client = new PmwsClient({ url: `ws://localhost:${port}` });
    await client.connect();

    await assert.rejects(
      async () => {
        await client.request(new EchoRequest({ message: 'fail' }), EchoResponse);
      },
      (error: Error) => {
        return error.message.toLowerCase().includes('test error');
      },
      'Should throw error containing "test error"'
    );

    client.close();
    await server.close();
  });

  it('auto-connects on first call', async () => {
    const transport = new WsTransport({ port: 0 });
    const server = new PmsServer();
    server.handle(EchoRequest, (req: EchoRequest) => {
      return new EchoResponse({ echo: req.message, timestamp: 0 });
    });

    await server.listen({ transport });
    const port = transport.port!;

    // Don't call connect() - it should auto-connect on call()
    const client = new PmwsClient({ url: `ws://localhost:${port}` });

    const response = await client.request(
      new EchoRequest({ message: 'auto' }),
      EchoResponse
    );

    assert.strictEqual(response.echo, 'auto');
    assert.ok(client.connected, 'Client should be connected');

    client.close();
    await server.close();
  });

  it('throws connection error for invalid server', async () => {
    const client = new PmwsClient({
      url: 'ws://localhost:59999', // Unlikely to be in use
      connectTimeout: 500,
      autoReconnect: false,
    });

    await assert.rejects(
      async () => {
        await client.connect();
      },
      PmwsConnectionError,
      'Expected PmwsConnectionError'
    );

    client.close();
  });

  it('tracks connected clients', async () => {
    const transport = new WsTransport({ port: 0 });
    const server = new PmsServer();
    server.handle(EchoRequest, (req: EchoRequest) => {
      return new EchoResponse({ echo: req.message, timestamp: 0 });
    });

    await server.listen({ transport });
    const port = transport.port!;

    assert.strictEqual(transport.clientCount, 0, 'Should start with 0 clients');

    const client1 = new PmwsClient({ url: `ws://localhost:${port}` });
    await client1.connect();

    // Give the server a moment to register the connection
    await new Promise(resolve => setTimeout(resolve, 50));
    assert.strictEqual(transport.clientCount, 1, 'Expected 1 client');

    const client2 = new PmwsClient({ url: `ws://localhost:${port}` });
    await client2.connect();

    await new Promise(resolve => setTimeout(resolve, 50));
    assert.strictEqual(transport.clientCount, 2, 'Expected 2 clients');

    client1.close();
    await new Promise(resolve => setTimeout(resolve, 50));
    assert.strictEqual(transport.clientCount, 1, 'Expected 1 client after close');

    client2.close();
    await server.close();
  });
});
