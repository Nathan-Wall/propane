/**
 * Integration tests for PMS (Propane Message System).
 */
import { describe, it } from 'node:test';
import assert from 'node:assert';
import type { HttpTransport } from '@/pms-server/src/index.js';
import { PmsServer, HandlerError, Response } from '@/pms-server/src/index.js';
import { PmsClient } from '@/pms-client/src/index.js';
import {
  EchoRequest,
  EchoResponse,
  AddRequest,
  AddResponse,
} from './messages.pmsg';

describe('PMS Server', () => {
  it('can be created and started', async () => {
    const server = new PmsServer();
    server.handle(EchoRequest, (req: EchoRequest) => {
      return new EchoResponse({ echo: req.message, timestamp: Date.now() });
    });

    await server.listen({ port: 0 }); // Port 0 = random available port
    const transport = server.getTransport() as HttpTransport;
    assert.ok(transport.port !== undefined, 'Server should have a port');
    await server.close();
  });

  it('handles echo request/response', async () => {
    const server = new PmsServer();
    server.handle(EchoRequest, (req: EchoRequest) => {
      return new EchoResponse({ echo: `Echo: ${req.message}`, timestamp: 12_345 });
    });

    await server.listen({ port: 0 });
    const transport = server.getTransport() as HttpTransport;
    const port = transport.port!;

    const client = new PmsClient({ baseUrl: `http://localhost:${port}` });
    const response = await client.request(
      new EchoRequest({ message: 'Hello, PMS!' }),
      EchoResponse
    );

    assert.strictEqual(response.echo, 'Echo: Hello, PMS!');
    assert.strictEqual(response.timestamp, 12_345);

    await server.close();
  });

  it('handles add request/response', async () => {
    const server = new PmsServer();
    server.handle(AddRequest, (req: AddRequest) => {
      return new AddResponse({ sum: req.a + req.b });
    });

    await server.listen({ port: 0 });
    const transport = server.getTransport() as HttpTransport;
    const port = transport.port!;

    const client = new PmsClient({ baseUrl: `http://localhost:${port}` });
    const response = await client.request(
      new AddRequest({ a: 17, b: 25 }),
      AddResponse
    );

    assert.strictEqual(response.sum, 42);

    await server.close();
  });

  it('supports multiple handlers', async () => {
    const server = new PmsServer();
    server
      .handle(EchoRequest, (req: EchoRequest) => {
        return new EchoResponse({ echo: req.message, timestamp: 1 });
      })
      .handle(AddRequest, (req: AddRequest) => {
        return new AddResponse({ sum: req.a + req.b });
      });

    await server.listen({ port: 0 });
    const transport = server.getTransport() as HttpTransport;
    const port = transport.port!;

    const client = new PmsClient({ baseUrl: `http://localhost:${port}` });

    const echoResponse = await client.request(
      new EchoRequest({ message: 'test' }),
      EchoResponse
    );
    assert.strictEqual(echoResponse.echo, 'test');

    const addResponse = await client.request(
      new AddRequest({ a: 1, b: 2 }),
      AddResponse
    );
    assert.strictEqual(addResponse.sum, 3);

    await server.close();
  });

  it('propagates handler errors', async () => {
    const server = new PmsServer();
    server.handle(EchoRequest, (): EchoResponse => {
      throw new HandlerError('TEST_ERROR', 'This is a test error');
    });

    await server.listen({ port: 0 });
    const transport = server.getTransport() as HttpTransport;
    const port = transport.port!;

    const client = new PmsClient({ baseUrl: `http://localhost:${port}` });

    await assert.rejects(
      async () => {
        await client.request(new EchoRequest({ message: 'fail' }), EchoResponse);
      },
      (error: Error) => {
        return error.message.toLowerCase().includes('test error');
      },
      'Should throw error containing "test error"'
    );

    await server.close();
  });

  it('provides handler context', async () => {
    let receivedContext: { requestId: string; receivedAt: Date } | null = null;

    const server = new PmsServer();
    server.handle(EchoRequest, (req: EchoRequest, context) => {
      receivedContext = context;
      return new EchoResponse({ echo: req.message, timestamp: 0 });
    });

    await server.listen({ port: 0 });
    const transport = server.getTransport() as HttpTransport;
    const port = transport.port!;

    const client = new PmsClient({ baseUrl: `http://localhost:${port}` });
    await client.request(new EchoRequest({ message: 'context test' }), EchoResponse);

    assert.ok(receivedContext !== null, 'Context should be received');
    const ctx = receivedContext as { requestId: string; receivedAt: Date };
    assert.strictEqual(typeof ctx.requestId, 'string');
    assert.ok(ctx.receivedAt instanceof Date);

    await server.close();
  });

  it('supports Response with custom headers', async () => {
    const server = new PmsServer();
    server.handle(EchoRequest, (req: EchoRequest) => {
      const BoundResponse = Response.bind<EchoResponse>(EchoResponse);
      return new BoundResponse({
        body: new EchoResponse({ echo: req.message, timestamp: 42 }),
        headers: new Map([['X-Custom-Header', 'test-value'], ['Set-Cookie', 'session=abc123']])
      });
    });

    await server.listen({ port: 0 });
    const transport = server.getTransport() as HttpTransport;
    const port = transport.port!;

    try {
      // Make a raw HTTP request to capture headers
      const response = await fetch(`http://localhost:${port}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-cereal',
          'X-PMS-Request': '1',
          'Connection': 'close',
        },
        body: ':$EchoRequest{"message":"hello"}',
      });

      const responseHeaders = Object.fromEntries(response.headers.entries());
      assert.strictEqual(responseHeaders['x-custom-header'], 'test-value');
      assert.strictEqual(responseHeaders['set-cookie'], 'session=abc123');

      const body = await response.text();
      assert.ok(body.includes('EchoResponse'));
      assert.ok(body.includes('hello'));
    } finally {
      await server.close();
    }
  });
});
