/**
 * Integration tests for PMS (Propane Message System).
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
import type { HttpTransport} from '@propanejs/pms-server';
import { PmsServer, HandlerError, Response } from '@propanejs/pms-server';
import { PmsClient } from '@propanejs/pms-client';
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
  console.log('Running PMS tests...\n');

  let passed = 0;
  let failed = 0;

  async function test(name: string, fn: () => Promise<void>): Promise<void> {
    try {
      await fn();
      console.log(`✓ ${name}`);
      passed++;
    } catch (error) {
      console.log(`✗ ${name}`);
      console.log(`  Error: ${error instanceof Error ? error.message : String(error)}`);
      failed++;
    }
  }

  // Test: Server can be created and started
  await test('Server can be created and started', async () => {
    const server = new PmsServer();
    server.handle(EchoRequest, (req: EchoRequest) => {
      return new EchoResponse({ echo: req.message, timestamp: Date.now() });
    });

    await server.listen({ port: 0 }); // Port 0 = random available port
    const transport = server.getTransport() as HttpTransport;
    assert(transport.port !== undefined, 'Server should have a port');
    await server.close();
  });

  // Test: Echo request/response
  await test('Echo request/response works', async () => {
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

    assert(response.echo === 'Echo: Hello, PMS!', `Expected echo message, got: ${response.echo}`);
    assert(response.timestamp === 12_345, `Expected timestamp 12345, got: ${response.timestamp}`);

    await server.close();
  });

  // Test: Add request/response
  await test('Add request/response works', async () => {
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

    assert(response.sum === 42, `Expected sum 42, got: ${response.sum}`);

    await server.close();
  });

  // Test: Multiple handlers
  await test('Multiple handlers work', async () => {
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
    assert(echoResponse.echo === 'test', 'Echo should work');

    const addResponse = await client.request(
      new AddRequest({ a: 1, b: 2 }),
      AddResponse
    );
    assert(addResponse.sum === 3, 'Add should work');

    await server.close();
  });

  // Test: Handler error
  await test('Handler errors are propagated', async () => {
    const server = new PmsServer();
    server.handle(EchoRequest, (): EchoResponse => {
      throw new HandlerError('TEST_ERROR', 'This is a test error');
    });

    await server.listen({ port: 0 });
    const transport = server.getTransport() as HttpTransport;
    const port = transport.port!;

    const client = new PmsClient({ baseUrl: `http://localhost:${port}` });

    try {
      await client.request(new EchoRequest({ message: 'fail' }), EchoResponse);
      assert(false, 'Should have thrown an error');
    } catch (error) {
      assert(
        error instanceof Error && error.message.includes('test error'),
        `Expected error message to contain 'test error', got: ${String(error)}`
      );
    }

    await server.close();
  });

  // Test: Handler context
  await test('Handler receives context', async () => {
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

    assert(receivedContext !== null, 'Context should be received');
    assert(typeof receivedContext!.requestId === 'string', 'requestId should be a string');
    assert(receivedContext!.receivedAt instanceof Date, 'receivedAt should be a Date');

    await server.close();
  });

  // Test: Response with headers
  await test('new Response returns response with custom headers', async () => {
    const server = new PmsServer();
    // Use explicit type assertion for test - the Response wrapper returns headers with the message body
    (server as any).handle(EchoRequest, (req: EchoRequest) => {
      return new Response(EchoResponse as any, {
        body: new EchoResponse({ echo: req.message, timestamp: 42 }),
        headers: new Map([['X-Custom-Header', 'test-value'], ['Set-Cookie', 'session=abc123']])
    });
    });

    await server.listen({ port: 0 });
    const transport = server.getTransport() as HttpTransport;
    const port = transport.port!;

    // Make a raw HTTP request to capture headers
    const response = await fetch(`http://localhost:${port}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-cereal',
        'X-PMS-Request': '1',
      },
      body: ':$EchoRequest{"1":"hello"}',
    });

    const responseHeaders = Object.fromEntries(response.headers.entries());
    assert(responseHeaders['x-custom-header'] === 'test-value', 'Custom header should be present');
    assert(responseHeaders['set-cookie'] === 'session=abc123', 'Set-Cookie header should be present');

    const body = await response.text();
    assert(body.includes('EchoResponse'), 'Response should contain EchoResponse');
    assert(body.includes('hello'), 'Response should contain the echoed message');

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
