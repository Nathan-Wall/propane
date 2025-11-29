import { parseFile, parseFiles } from '../src/parser.js';
import { generateClient } from '../src/generator.js';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { writeFileSync, mkdirSync, rmSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Create a temp directory for test fixtures
const tempDir = resolve(tmpdir(), 'pms-compiler-test-' + Date.now());
mkdirSync(tempDir, { recursive: true });

// Write test fixture
const messagesFile = resolve(tempDir, 'messages.propane');
writeFileSync(messagesFile, `
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

// This type does NOT extend RpcRequest - should be ignored
export type NonRpcType = {
  '1:value': string;
};
`);

// Cleanup function (called at end of tests)
function cleanup() {
  try {
    rmSync(tempDir, { recursive: true, force: true });
  } catch {
    // Ignore cleanup errors
  }
}

console.log('Running PMS Compiler tests...\n');

let passed = 0;
let failed = 0;

function test(name: string, fn: () => void) {
  try {
    fn();
    console.log(`✓ ${name}`);
    passed++;
  } catch (error) {
    console.error(`✗ ${name}`);
    console.error(`  ${error}`);
    failed++;
  }
}

function assertEqual<T>(actual: T, expected: T, message?: string) {
  if (actual !== expected) {
    throw new Error(
      `${message ?? 'Assertion failed'}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`
    );
  }
}

// Test: parseFile extracts RPC endpoints
test('parseFile extracts RPC endpoints', () => {
  const endpoints = parseFile(messagesFile);

  assertEqual(endpoints.length, 2, 'Should find 2 RPC endpoints');

  const getUser = endpoints.find((e) => e.requestType === 'GetUserRequest');
  const createUser = endpoints.find((e) => e.requestType === 'CreateUserRequest');

  if (!getUser) throw new Error('GetUserRequest not found');
  if (!createUser) throw new Error('CreateUserRequest not found');

  assertEqual(getUser.responseType, 'GetUserResponse');
  assertEqual(createUser.responseType, 'CreateUserResponse');
});

// Test: parseFile ignores non-RPC types
test('parseFile ignores non-RPC types', () => {
  const endpoints = parseFile(messagesFile);
  const nonRpc = endpoints.find((e) => e.requestType === 'NonRpcType');
  assertEqual(nonRpc, undefined, 'NonRpcType should not be included');
});

// Test: parseFiles aggregates results
test('parseFiles aggregates results from multiple files', () => {
  const result = parseFiles([messagesFile]);

  assertEqual(result.endpoints.length, 2);
  assertEqual(result.fileEndpoints.size, 1);
  assertEqual(result.fileEndpoints.get(messagesFile)?.length, 2);
});

// Test: generateClient produces valid code structure
test('generateClient produces valid code', () => {
  const result = parseFiles([messagesFile]);
  const code = generateClient(result, {
    outputPath: '/output/client.ts',
    className: 'TestClient',
  });

  // Check imports
  if (!code.includes("import { PmsClient } from '@propanejs/pms-client'")) {
    throw new Error('Missing PmsClient import');
  }

  // Check class declaration
  if (!code.includes('export class TestClient')) {
    throw new Error('Missing class declaration');
  }

  // Check method generation
  if (!code.includes('async getUser(request: GetUserRequest): Promise<GetUserResponse>')) {
    throw new Error('Missing getUser method');
  }
  if (!code.includes('async createUser(request: CreateUserRequest): Promise<CreateUserResponse>')) {
    throw new Error('Missing createUser method');
  }

  // Check method body
  if (!code.includes('return this.client.request(request, GetUserResponse)')) {
    throw new Error('Missing request call in getUser');
  }
});

// Test: generateClient with websocket option
test('generateClient with websocket option', () => {
  const result = parseFiles([messagesFile]);
  const code = generateClient(result, {
    outputPath: '/output/client.ts',
    websocket: true,
  });

  if (!code.includes("import { PmwsClient } from '@propanejs/pms-client'")) {
    throw new Error('Missing PmwsClient import for websocket mode');
  }

  if (!code.includes('constructor(private readonly client: PmwsClient)')) {
    throw new Error('Missing PmwsClient in constructor');
  }
});

// Test: method names are properly generated
test('method names strip Request suffix and camelCase', () => {
  const result = parseFiles([messagesFile]);
  const code = generateClient(result, {
    outputPath: '/output/client.ts',
  });

  // GetUserRequest -> getUser (not getUserRequest)
  if (!code.includes('async getUser(')) {
    throw new Error('Method name should be getUser');
  }
  if (code.includes('async getUserRequest(')) {
    throw new Error('Method name should not include Request suffix');
  }
});

console.log(`\n${passed} passed, ${failed} failed`);

cleanup();

if (failed > 0) {
  process.exit(1);
}
