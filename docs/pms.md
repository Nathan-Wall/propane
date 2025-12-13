# PMS: Propane Message System

PMS is an RPC framework for building type-safe client-server communication using
Propane messages. It provides automatic serialization, request routing, and
compile-time type safety between requests and responses.

## Features

- **Type-Safe RPC** - Request types are linked to response types at compile time
- **Automatic Routing** - Handlers are dispatched based on message type
- **Efficient Serialization** - Uses Propane's built-in serialization
- **Multiple Transports** - HTTP and WebSocket support
- **Client Code Generation** - Generate typed client methods from .pmsg files
- **Isomorphic Client** - Works in both browser and Node.js (18+)
- **Minimal Dependencies** - Server uses raw Node.js (no Express/Fastify)

## Installation

```bash
# Server
npm i @propanejs/pms-server

# Client
npm i @propanejs/pms-client

# Client Code Generator (optional)
npm i -D @propanejs/pms-client-compiler
```

## Defining Messages

Define request/response pairs in `.pmsg` files. Use `Message<{...}>` for response
types and `Endpoint<Payload, Response>` for RPC endpoints:

```typescript
// messages.pmsg
import { Message } from '@propanejs/runtime';
import { Endpoint } from '@propanejs/pms-core';

export type GetUser = Endpoint<{
  '1:id': number;
}, GetUserResponse>;

export type GetUserResponse = Message<{
  '1:id': number;
  '2:name': string;
  '3:email': string;
}>;

export type CreateUser = Endpoint<{
  '1:name': string;
  '2:email': string;
}, CreateUserResponse>;

export type CreateUserResponse = Message<{
  '1:user': GetUserResponse;
}>;
```

## Server

Create a server and register handlers for each request type:

```typescript
import { PmsServer, HandlerError } from '@propanejs/pms-server';
import {
  GetUser,
  GetUserResponse,
  CreateUser,
  CreateUserResponse,
} from './messages.pmsg.js';

const server = new PmsServer();

// Register handlers - response type is inferred from request
server
  .handle(GetUser, async (req) => {
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
  .handle(CreateUser, async (req) => {
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

### Returning Custom Headers

Handlers can return custom HTTP headers (e.g., for cookies) by wrapping the
response in a `Response` object. The Response constructor takes the response
class as the first argument:

```typescript
import { Response } from '@propanejs/pms-server';

server.handle(Login, async (req) => {
  const session = await createSession(req.username, req.password);

  // Return response with Set-Cookie header
  return new Response(LoginResponse, {
    body: new LoginResponse({ success: true, userId: session.userId }),
    headers: new Map([
      ['Set-Cookie', `session=${session.token}; HttpOnly; Secure; SameSite=Strict; Path=/`],
    ]),
  });
});

// Simple responses (no headers) still work
server.handle(GetUser, async (req) => {
  return new GetUserResponse({ id: req.id, name: 'Alice' });
});
```

## Client

The client provides type-safe RPC calls:

```typescript
import { PmsClient } from '@propanejs/pms-client';
import {
  GetUser,
  GetUserResponse,
  CreateUser,
  CreateUserResponse,
} from './messages.pmsg.js';

const client = new PmsClient({ baseUrl: 'http://localhost:8080' });

// Type-safe calls - response type is inferred
const user = await client.request(
  new GetUser({ id: 123 }),
  GetUserResponse
);
console.log(user.name); // Typed as string

const created = await client.request(
  new CreateUser({ name: 'Alice', email: 'alice@example.com' }),
  CreateUserResponse
);
console.log(created.user.id); // Typed as number
```

## Generated Clients

Instead of manually calling `client.request()` with request and response types,
you can generate a typed client with methods for each RPC endpoint.

### Using the Compiler

Install the compiler as a dev dependency:

```bash
npm i -D @propanejs/pms-client-compiler
```

Generate a client from your `.pmsg` files:

```bash
# From specific files
npx pmscc -o src/generated/api-client.ts src/messages/*.pmsg

# From a directory (recursive)
npx pmscc -d src/messages -o src/generated/api-client.ts

# With custom class name
npx pmscc -d src/api -o src/client.ts -n ApiClient

# Generate WebSocket client
npx pmscc -d src/api -o src/client.ts -w

# Watch mode - regenerate on file changes
npx pmscc -d src/messages -o src/generated/api-client.ts -W
```

### Configuration File (`propane.config.json`)

The `pmscc` compiler can also be configured using a `propane.config.json` file in your project's root directory. `pmscc` will look for its settings under the `pms` key within this file.

**Example `propane.config.json` (for `pmscc`):**
```json
{
  "pms": {
    "inputDir": "src/messages",
    "output": "src/generated/pms-client.ts",
    "className": "PmsApiClient",
    "websocket": true,
    "watch": false
  }
}
```

When `pmscc` is run without arguments, it will automatically load these settings. Command-line arguments always take precedence over values in the configuration file.

### Configuration Options (under the `pms` key):

*   **`inputDir`**: A string specifying a directory to search for `.pmsg` files. Equivalent to `-d, --dir`.
*   **`output`**: A string specifying the output file path for the generated client. Equivalent to `-o, --output`.
*   **`className`**: A string for the generated client class name. Equivalent to `-n, --name`.
*   **`websocket`**: A boolean. If `true`, generates a WebSocket client. Equivalent to `-w, --websocket`.
*   **`watch`**: A boolean. If `true`, runs `pmscc` in watch mode. Equivalent to `-W, --watch`.

### Generated Output

Given these message definitions:

```typescript
// messages.pmsg
import { Message } from '@propanejs/runtime';
import { Endpoint } from '@propanejs/pms-core';

export type GetUser = Endpoint<{
  '1:id': number;
}, GetUserResponse>;

export type GetUserResponse = Message<{
  '1:id': number;
  '2:name': string;
}>;
```

The compiler generates a client class with a `getUser` method.

### Using the Generated Client

```typescript
import { ApiClient } from './generated/api-client.js';
import { GetUser } from './messages.pmsg.js';

// Pass PmsClient options directly to the generated client
const api = new ApiClient({ baseUrl: 'http://localhost:8080' });

// Pass data directly - message is constructed automatically
const user = await api.getUser({ id: 123 });
console.log(user.name);

// Or pass a message instance
const user2 = await api.getUser(new GetUser({ id: 456 }));
```

### CLI Options

| Option | Description |
|--------|-------------|
| `-o, --output <path>` | Output file path (required) |
| `-d, --dir <path>` | Directory to search for .pmsg files |
| `-n, --name <name>` | Generated class name (default: derived from output file) |
| `-w, --websocket` | Generate WebSocket client (PmwsClient) instead of HTTP |
| `-W, --watch` | Watch for changes and regenerate automatically |
| `-h, --help` | Show help |

The default class name is derived from the output file name:
- `api-client.ts` → `ApiClient`
- `user_service.ts` → `UserService`
- `MyClient.ts` → `MyClient`

### Watch Mode

Use `-W` or `--watch` to continuously monitor `.pmsg` files for changes and
automatically regenerate the client. This is useful during development:

```bash
npx pmscc -d src/messages -o src/generated/api-client.ts -W
# Watching for changes... (press Ctrl+C to stop)
```

When files change, the compiler re-scans the directory (if using `-d`) to pick
up any new files, then regenerates the output.

## Error Handling

### Server-Side Errors

Throw `HandlerError` to return structured errors to clients:

```typescript
import { HandlerError } from '@propanejs/pms-server';

server.handle(GetUser, async (req) => {
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
  const user = await client.request(new GetUser({ id: -1 }), GetUserResponse);
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
server.handle(GetUser, async (req, context) => {
  console.log(`Request ${context.requestId} received at ${context.receivedAt}`);

  // Log for debugging
  logger.info({
    requestId: context.requestId,
    type: 'GetUser',
    userId: req.id,
  });

  // ...
});
```

Context properties:
- `requestId` - Unique identifier for the request
- `receivedAt` - `Date` when the request was received
- `headers` - Request headers (read-only)

### Reading Cookies

Access cookies via the `headers` property:

```typescript
server.handle(GetUser, async (req, context) => {
  // Get the raw Cookie header
  const cookieHeader = context.headers['cookie'];

  // Parse cookies (simple example)
  const cookies = parseCookies(cookieHeader);
  const sessionId = cookies['session'];

  if (!sessionId) {
    throw new HandlerError('UNAUTHORIZED', 'No session cookie');
  }

  const user = await validateSession(sessionId);
  return new GetUserResponse({ id: user.id, name: user.name });
});

// Simple cookie parser
function parseCookies(cookieHeader?: string): Record<string, string> {
  if (!cookieHeader) return {};
  return Object.fromEntries(
    cookieHeader.split(';').map(cookie => {
      const [name, ...rest] = cookie.trim().split('=');
      return [name, rest.join('=')];
    })
  );
}
```

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

### CSRF Protection

CSRF protection is **enabled by default**. It requires requests to include an
`X-PMS-Request` header, which prevents form-based CSRF attacks since HTML forms
cannot set custom headers.

The `PmsClient` automatically includes this header, so no configuration is
needed for standard usage.

```typescript
// CSRF is enabled by default - no configuration needed
const transport = new HttpTransport({ port: 8080 });

// Disable CSRF protection (not recommended)
const transport = new HttpTransport({
  port: 8080,
  csrf: false,
});

// Custom CSRF configuration
const transport = new HttpTransport({
  port: 8080,
  csrf: {
    allowedOrigins: ['https://example.com'],  // Restrict origins
    requireHeader: true,                       // Require X-PMS-Request header
    headerName: 'X-PMS-Request',              // Custom header name
  },
});
```

CSRF options:

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `allowedOrigins` | `string[]` | - | Restrict to specific origins (uses CORS origins if not set) |
| `requireHeader` | `boolean` | `true` | Require `X-PMS-Request` header |
| `headerName` | `string` | `'X-PMS-Request'` | Name of required header |

### TLS/HTTPS

Enable HTTPS by providing TLS options:

```typescript
import { readFileSync } from 'node:fs';
import { HttpTransport } from '@propanejs/pms-server';

const transport = new HttpTransport({
  port: 8443,
  tls: {
    key: readFileSync('/path/to/private-key.pem'),
    cert: readFileSync('/path/to/certificate.pem'),
  },
});

await server.listen({ transport });

// Check if server is using HTTPS
console.log(`Secure: ${transport.secure}`); // true
```

TLS options:

| Option | Type | Description |
|--------|------|-------------|
| `key` | `string \| Buffer` | PEM-encoded private key (required) |
| `cert` | `string \| Buffer` | PEM-encoded certificate (required) |
| `ca` | `string \| Buffer \| Array` | CA certificate(s) for client verification |
| `requestCert` | `boolean` | Request client certificate (default: false) |
| `rejectUnauthorized` | `boolean` | Reject unauthorized client certs |

For mutual TLS (mTLS), enable client certificate verification:

```typescript
const transport = new HttpTransport({
  port: 8443,
  tls: {
    key: readFileSync('/path/to/server-key.pem'),
    cert: readFileSync('/path/to/server-cert.pem'),
    ca: readFileSync('/path/to/ca-cert.pem'),
    requestCert: true,
    rejectUnauthorized: true,
  },
});
```

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
  .handle(GetUser, handleGetUser)
  .handle(CreateUser, handleCreateUser)
  .handle(DeleteUser, handleDeleteUser);

await server.listen({ port: 8080 });
```

### Duplicate Handler Detection

Registering two handlers for the same message type throws an error:

```typescript
server.handle(GetUser, handler1);
server.handle(GetUser, handler2); // Error: Handler already registered for type: GetUser
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
server.handle(GetUser, async (req) => {
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
  new GetUser({ id: 123 }),
  GetUserResponse
);

// Connection is reused for subsequent calls
const user2 = await client.request(
  new GetUser({ id: 456 }),
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

## WSS (WebSocket Secure)

Enable encrypted WebSocket connections by providing TLS options:

```typescript
import { readFileSync } from 'node:fs';
import { PmsServer, WsTransport } from '@propanejs/pms-server';

const transport = new WsTransport({
  port: 8443,
  tls: {
    key: readFileSync('/path/to/private-key.pem'),
    cert: readFileSync('/path/to/certificate.pem'),
  },
});

await server.listen({ transport });

// Check if server is using WSS
console.log(`Secure: ${transport.secure}`); // true
```

Clients connect using `wss://` instead of `ws://`:

```typescript
const client = new PmwsClient({ url: 'wss://localhost:8443' });
```

The TLS options are the same as for HTTP - see the [TLS/HTTPS](#tlshttps) section
for the full list of options including mutual TLS (mTLS) configuration.

## Choosing HTTP vs WebSocket

| Use Case | Recommended |
|----------|-------------|
| Occasional requests | HTTP (`PmsClient`) |
| Frequent requests | WebSocket (`PmwsClient`) |
| Stateless/serverless | HTTP |
| Long-running connections | WebSocket |
| Browser environment | Both supported |
| Load balancing | HTTP (simpler) |
