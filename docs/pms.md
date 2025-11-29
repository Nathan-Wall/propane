# PMS: Propane Message System

PMS is an RPC framework for building type-safe client-server communication using
Propane messages. It provides automatic serialization, request routing, and
compile-time type safety between requests and responses.

## Features

- **Type-Safe RPC** - Request types are linked to response types at compile time
- **Automatic Routing** - Handlers are dispatched based on message type
- **Efficient Serialization** - Uses Propane's built-in serialization
- **Multiple Transports** - HTTP and WebSocket support
- **Minimal Dependencies** - Server uses raw Node.js (no Express/Fastify)

## Installation

```bash
# Server
npm i @propanejs/pms-server

# Client
npm i @propanejs/pms-client
```

## Defining Messages

Define request/response pairs in `.propane` files. Requests implement
`RpcRequest<TResponse>` to link them to their response type:

```typescript
// messages.propane
import { RpcRequest } from '@propanejs/pms-core';

export type GetUserRequest = {
  '1:id': number;
} & RpcRequest<GetUserResponse>;

export type GetUserResponse = {
  '1:id': number;
  '2:name': string;
  '3:email': string;
};

export type CreateUserRequest = {
  '1:name': string;
  '2:email': string;
} & RpcRequest<CreateUserResponse>;

export type CreateUserResponse = {
  '1:user': GetUserResponse;
};
```

## Server

Create a server and register handlers for each request type:

```typescript
import { PmsServer, HandlerError } from '@propanejs/pms-server';
import {
  GetUserRequest,
  GetUserResponse,
  CreateUserRequest,
  CreateUserResponse,
} from './messages.propane.js';

const server = new PmsServer();

// Register handlers - response type is inferred from request
server
  .handle(GetUserRequest, async (req) => {
    const user = await db.findUser(req.id);
    if (!user) {
      throw new HandlerError('NOT_FOUND', 'User not found');
    }
    return new GetUserResponse({
      id: user.id,
      name: user.name,
      email: user.email,
    });
  })
  .handle(CreateUserRequest, async (req) => {
    const user = await db.createUser({ name: req.name, email: req.email });
    return new CreateUserResponse({
      user: new GetUserResponse(user),
    });
  });

// Start server
await server.listen({ port: 8080 });
console.log('Server running on port 8080');

// Graceful shutdown
process.on('SIGTERM', () => server.close());
```

## Client

The client provides type-safe RPC calls:

```typescript
import { PmsClient } from '@propanejs/pms-client';
import {
  GetUserRequest,
  GetUserResponse,
  CreateUserRequest,
  CreateUserResponse,
} from './messages.propane.js';

const client = new PmsClient({ baseUrl: 'http://localhost:8080' });

// Type-safe calls - response type is inferred
const user = await client.request(
  new GetUserRequest({ id: 123 }),
  GetUserResponse
);
console.log(user.name); // Typed as string

const created = await client.request(
  new CreateUserRequest({ name: 'Alice', email: 'alice@example.com' }),
  CreateUserResponse
);
console.log(created.user.id); // Typed as number
```

## Error Handling

### Server-Side Errors

Throw `HandlerError` to return structured errors to clients:

```typescript
import { HandlerError } from '@propanejs/pms-server';

server.handle(GetUserRequest, async (req) => {
  if (req.id <= 0) {
    throw new HandlerError('INVALID_ID', 'ID must be positive', `Got: ${req.id}`);
  }
  // ...
});
```

The `HandlerError` constructor takes:
- `code` - A string error code for programmatic handling
- `message` - Human-readable error message
- `details` (optional) - Additional context

### Client-Side Errors

Catch `PmsProtocolError` to handle server errors:

```typescript
import { PmsClient, PmsProtocolError } from '@propanejs/pms-client';

try {
  const user = await client.request(new GetUserRequest({ id: -1 }), GetUserResponse);
} catch (error) {
  if (error instanceof PmsProtocolError) {
    console.error(`Error ${error.code}: ${error.message}`);
    console.error(`Request ID: ${error.requestId}`);
    if (error.details) {
      console.error(`Details: ${error.details}`);
    }
  }
}
```

### Protocol Error Codes

The server returns these error codes for infrastructure failures:

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `PARSE_ERROR` | 400 | Invalid message format |
| `UNKNOWN_TYPE` | 404 | No handler registered for message type |
| `HANDLER_ERROR` | 500 | Handler threw an error |
| `INTERNAL_ERROR` | 500 | Unexpected server error |

## Handler Context

Handlers receive a context object with request metadata:

```typescript
server.handle(GetUserRequest, async (req, context) => {
  console.log(`Request ${context.requestId} received at ${context.receivedAt}`);

  // Log for debugging
  logger.info({
    requestId: context.requestId,
    type: 'GetUserRequest',
    userId: req.id,
  });

  // ...
});
```

Context properties:
- `requestId` - Unique identifier for the request
- `receivedAt` - `Date` when the request was received

## Configuration

### Server Options

```typescript
await server.listen({
  port: 8080,           // Default: 3000
  host: '0.0.0.0',      // Default: '0.0.0.0'
});
```

### CORS

Enable CORS for browser clients:

```typescript
import { HttpTransport } from '@propanejs/pms-server';

// Simple: allow all origins
const transport = new HttpTransport({
  port: 8080,
  cors: true,
});

// Custom: specific origins and options
const transport = new HttpTransport({
  port: 8080,
  cors: {
    origin: ['https://example.com', 'https://app.example.com'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['X-Request-Id'],
    maxAge: 86400,
  },
});

await server.listen({ transport });
```

CORS options:

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `origin` | `string \| string[]` | `'*'` | Allowed origins |
| `methods` | `string[]` | `['POST', 'OPTIONS']` | Allowed methods |
| `allowedHeaders` | `string[]` | `['Content-Type']` | Allowed request headers |
| `exposedHeaders` | `string[]` | - | Headers exposed to client |
| `credentials` | `boolean` | `false` | Allow credentials |
| `maxAge` | `number` | `86400` | Preflight cache duration (seconds) |

### Client Options

```typescript
const client = new PmsClient({
  baseUrl: 'http://localhost:8080',
  timeout: 5000,        // Default: 30000ms
});
```

## Advanced Usage

### Accessing the Transport

Get the underlying transport for advanced configuration:

```typescript
await server.listen({ port: 0 }); // Random available port

const transport = server.getTransport();
if (transport) {
  console.log(`Server listening on port ${transport.port}`);
}
```

### Handler Chaining

Handlers can be chained fluently:

```typescript
const server = new PmsServer()
  .handle(GetUserRequest, handleGetUser)
  .handle(CreateUserRequest, handleCreateUser)
  .handle(DeleteUserRequest, handleDeleteUser);

await server.listen({ port: 8080 });
```

### Duplicate Handler Detection

Registering two handlers for the same message type throws an error:

```typescript
server.handle(GetUserRequest, handler1);
server.handle(GetUserRequest, handler2); // Error: Handler already registered for type: GetUserRequest
```

---

# PMWS: Propane Messages over WebSockets

PMWS provides WebSocket transport for persistent, bidirectional communication.
Use PMWS when you need:

- **Persistent connections** - Avoid connection overhead for frequent requests
- **Lower latency** - No HTTP handshake per request
- **Server push** - Future support for server-initiated messages

## Server with WebSocket

Use `WsTransport` instead of the default `HttpTransport`:

```typescript
import { PmsServer, WsTransport } from '@propanejs/pms-server';

const server = new PmsServer();

// Register handlers (same as HTTP)
server.handle(GetUserRequest, async (req) => {
  const user = await db.findUser(req.id);
  return new GetUserResponse(user);
});

// Use WebSocket transport
const transport = new WsTransport({ port: 8080 });
await server.listen({ transport });

console.log('WebSocket server running on port 8080');
```

## WebSocket Client

Use `PmwsClient` for WebSocket connections:

```typescript
import { PmwsClient } from '@propanejs/pms-client';

const client = new PmwsClient({ url: 'ws://localhost:8080' });

// Connect (optional - auto-connects on first call)
await client.connect();

// Make calls (same API as PmsClient)
const user = await client.request(
  new GetUserRequest({ id: 123 }),
  GetUserResponse
);

// Connection is reused for subsequent calls
const user2 = await client.request(
  new GetUserRequest({ id: 456 }),
  GetUserResponse
);

// Close when done
await client.close();
```

## Auto-Reconnection

The WebSocket client automatically reconnects on connection loss:

```typescript
const client = new PmwsClient({
  url: 'ws://localhost:8080',
  autoReconnect: true,        // Default: true
  reconnectDelay: 1000,       // Default: 1000ms
  maxReconnectAttempts: 10,   // Default: 10
});
```

To disable auto-reconnection:

```typescript
const client = new PmwsClient({
  url: 'ws://localhost:8080',
  autoReconnect: false,
});
```

## Connection Status

Check if the client is connected:

```typescript
if (client.connected) {
  console.log('Connected to server');
}
```

## Error Handling

WebSocket-specific errors use `PmwsConnectionError`:

```typescript
import { PmwsClient, PmwsProtocolError, PmwsConnectionError } from '@propanejs/pms-client';

try {
  await client.request(request, ResponseClass);
} catch (error) {
  if (error instanceof PmwsProtocolError) {
    // Server returned an error (same as PmsProtocolError)
    console.error(`Server error: ${error.code}`);
  } else if (error instanceof PmwsConnectionError) {
    // Connection failed or was lost
    console.error(`Connection error: ${error.message}`);
  }
}
```

## Client Options

```typescript
const client = new PmwsClient({
  url: 'ws://localhost:8080',   // WebSocket URL (required)
  timeout: 30000,               // Request timeout (default: 30000ms)
  connectTimeout: 5000,         // Connection timeout (default: 5000ms)
  autoReconnect: true,          // Auto-reconnect on disconnect (default: true)
  reconnectDelay: 1000,         // Delay between reconnect attempts (default: 1000ms)
  maxReconnectAttempts: 10,     // Max reconnection attempts (default: 10)
});
```

## Server Monitoring

The WebSocket transport provides connection metrics:

```typescript
const transport = new WsTransport({ port: 8080 });
await server.listen({ transport });

// Check number of connected clients
console.log(`Connected clients: ${transport.clientCount}`);
```

## Choosing HTTP vs WebSocket

| Use Case | Recommended |
|----------|-------------|
| Occasional requests | HTTP (`PmsClient`) |
| Frequent requests | WebSocket (`PmwsClient`) |
| Stateless/serverless | HTTP |
| Long-running connections | WebSocket |
| Browser environment | Both supported |
| Load balancing | HTTP (simpler) |
