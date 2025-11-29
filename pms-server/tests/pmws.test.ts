/**
 * Integration tests for PMWS (Propane Messages over WebSockets).
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
import { PmsServer, HandlerError, WsTransport } from '@propanejs/pms-server';
import { PmwsClient, PmwsConnectionError } from '@propanejs/pms-client';
import {
  EchoRequest,
  EchoResponse,
  AddRequest,
  AddResponse,
} from './messages.js';

// Test utilities
function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

async function runTests(): Promise<void> {
  console.log('Running PMWS tests...\n');

  let passed = 0;
  let failed = 0;

  async function test(name: string, fn: () => Promise<void>): Promise<void> {
    try {
      await fn();
      console.log(`✓ ${name}`);
      passed++;
    } catch (error) {
      console.log(`✗ ${name}`);
      console.log(`  Error: ${error instanceof Error ? error.message : error}`);
      failed++;
    }
  }

  // Test: Server can be created with WebSocket transport
  await test('Server can be created with WebSocket transport', async () => {
    const transport = new WsTransport({ port: 0 });
    const server = new PmsServer();
    server.handle(EchoRequest as any, async (req: EchoRequest) => {
      return new EchoResponse({ echo: req.message, timestamp: Date.now() });
    });

    await server.listen({ transport });
    assert(transport.port !== undefined, 'Server should have a port');
    await server.close();
  });

  // Test: WebSocket echo request/response
  await test('WebSocket echo request/response works', async () => {
    const transport = new WsTransport({ port: 0 });
    const server = new PmsServer();
    server.handle(EchoRequest as any, async (req: EchoRequest) => {
      return new EchoResponse({ echo: `Echo: ${req.message}`, timestamp: 12345 });
    });

    await server.listen({ transport });
    const port = transport.port!;

    const client = new PmwsClient({ url: `ws://localhost:${port}` });
    await client.connect();

    const response = await client.request(
      new EchoRequest({ message: 'Hello, PMWS!' }) as any,
      EchoResponse as any
    ) as EchoResponse;

    assert(response.echo === 'Echo: Hello, PMWS!', `Expected echo message, got: ${response.echo}`);
    assert(response.timestamp === 12345, `Expected timestamp 12345, got: ${response.timestamp}`);

    await client.close();
    await server.close();
  });

  // Test: Multiple calls on same connection
  await test('Multiple calls on same connection work', async () => {
    const transport = new WsTransport({ port: 0 });
    const server = new PmsServer();
    server.handle(AddRequest as any, async (req: AddRequest) => {
      return new AddResponse({ sum: req.a + req.b });
    });

    await server.listen({ transport });
    const port = transport.port!;

    const client = new PmwsClient({ url: `ws://localhost:${port}` });
    await client.connect();

    // Make multiple calls on same connection
    const response1 = await client.request(
      new AddRequest({ a: 1, b: 2 }) as any,
      AddResponse as any
    ) as AddResponse;
    assert(response1.sum === 3, `Expected sum 3, got: ${response1.sum}`);

    const response2 = await client.request(
      new AddRequest({ a: 10, b: 20 }) as any,
      AddResponse as any
    ) as AddResponse;
    assert(response2.sum === 30, `Expected sum 30, got: ${response2.sum}`);

    const response3 = await client.request(
      new AddRequest({ a: 100, b: 200 }) as any,
      AddResponse as any
    ) as AddResponse;
    assert(response3.sum === 300, `Expected sum 300, got: ${response3.sum}`);

    await client.close();
    await server.close();
  });

  // Test: Concurrent requests
  await test('Concurrent requests work', async () => {
    const transport = new WsTransport({ port: 0 });
    const server = new PmsServer();
    server.handle(AddRequest as any, async (req: AddRequest) => {
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
      client.request(new AddRequest({ a: 1, b: 1 }) as any, AddResponse as any),
      client.request(new AddRequest({ a: 2, b: 2 }) as any, AddResponse as any),
      client.request(new AddRequest({ a: 3, b: 3 }) as any, AddResponse as any),
    ]) as AddResponse[];

    assert(r1.sum === 2, `Expected sum 2, got: ${r1.sum}`);
    assert(r2.sum === 4, `Expected sum 4, got: ${r2.sum}`);
    assert(r3.sum === 6, `Expected sum 6, got: ${r3.sum}`);

    await client.close();
    await server.close();
  });

  // Test: Handler errors are propagated
  await test('Handler errors are propagated', async () => {
    const transport = new WsTransport({ port: 0 });
    const server = new PmsServer();
    server.handle(EchoRequest as any, async (): Promise<EchoResponse> => {
      throw new HandlerError('TEST_ERROR', 'This is a test error');
    });

    await server.listen({ transport });
    const port = transport.port!;

    const client = new PmwsClient({ url: `ws://localhost:${port}` });
    await client.connect();

    try {
      await client.request(new EchoRequest({ message: 'fail' }) as any, EchoResponse as any);
      assert(false, 'Should have thrown an error');
    } catch (error) {
      assert(
        error instanceof Error && error.message.includes('test error'),
        `Expected error message to contain 'test error', got: ${error}`
      );
    }

    await client.close();
    await server.close();
  });

  // Test: Auto-connect on first call
  await test('Auto-connect on first call works', async () => {
    const transport = new WsTransport({ port: 0 });
    const server = new PmsServer();
    server.handle(EchoRequest as any, async (req: EchoRequest) => {
      return new EchoResponse({ echo: req.message, timestamp: 0 });
    });

    await server.listen({ transport });
    const port = transport.port!;

    // Don't call connect() - it should auto-connect on call()
    const client = new PmwsClient({ url: `ws://localhost:${port}` });

    const response = await client.request(
      new EchoRequest({ message: 'auto' }) as any,
      EchoResponse as any
    ) as EchoResponse;

    assert(response.echo === 'auto', `Expected echo 'auto', got: ${response.echo}`);
    assert(client.connected, 'Client should be connected');

    await client.close();
    await server.close();
  });

  // Test: Connection error handling
  await test('Connection error is thrown for invalid server', async () => {
    const client = new PmwsClient({
      url: 'ws://localhost:59999', // Unlikely to be in use
      connectTimeout: 500,
      autoReconnect: false,
    });

    try {
      await client.connect();
      assert(false, 'Should have thrown a connection error');
    } catch (error) {
      assert(
        error instanceof PmwsConnectionError,
        `Expected PmwsConnectionError, got: ${error}`
      );
    }

    await client.close();
  });

  // Test: Client count
  await test('Server tracks connected clients', async () => {
    const transport = new WsTransport({ port: 0 });
    const server = new PmsServer();
    server.handle(EchoRequest as any, async (req: EchoRequest) => {
      return new EchoResponse({ echo: req.message, timestamp: 0 });
    });

    await server.listen({ transport });
    const port = transport.port!;

    assert(transport.clientCount === 0, 'Should start with 0 clients');

    const client1 = new PmwsClient({ url: `ws://localhost:${port}` });
    await client1.connect();

    // Give the server a moment to register the connection
    await new Promise(resolve => setTimeout(resolve, 50));
    assert(transport.clientCount === 1, `Expected 1 client, got: ${transport.clientCount}`);

    const client2 = new PmwsClient({ url: `ws://localhost:${port}` });
    await client2.connect();

    await new Promise(resolve => setTimeout(resolve, 50));
    assert(transport.clientCount === 2, `Expected 2 clients, got: ${transport.clientCount}`);

    await client1.close();
    await new Promise(resolve => setTimeout(resolve, 50));
    assert(transport.clientCount === 1, `Expected 1 client after close, got: ${transport.clientCount}`);

    await client2.close();
    await server.close();
  });

  // Summary
  console.log(`\n${passed} passed, ${failed} failed`);

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((error) => {
  console.error('Test runner error:', error);
  process.exit(1);
});
