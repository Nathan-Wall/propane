import { parseFile, parseFiles } from '../src/parser.js';
import { generateClient } from '../src/generator.js';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { writeFileSync, mkdirSync, rmSync, readFileSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { execSync } from 'node:child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create a temp directory for test fixtures
const tempDir = path.resolve(tmpdir(), 'pms-compiler-test-' + Date.now());
mkdirSync(tempDir, { recursive: true });

// Test utilities
console.log('Running PMS Client Compiler tests...\n');

let passed = 0;
let failed = 0;

function test(name: string, fn: () => void) {
  try {
    fn();
    console.log(`✓ ${name}`);
    passed++;
  } catch (error) {
    console.error(`✗ ${name}`);
    console.error(`  ${String(error)}`);
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

function assertIncludes(haystack: string, needle: string, message?: string) {
  if (!haystack.includes(needle)) {
    throw new Error(`${message ?? 'String not found'}: expected to find "${needle}"`);
  }
}

function assertNotIncludes(haystack: string, needle: string, message?: string) {
  if (haystack.includes(needle)) {
    throw new Error(`${message ?? 'Unexpected string found'}: did not expect "${needle}"`);
  }
}

// Cleanup function
function cleanup() {
  try {
    rmSync(tempDir, { recursive: true, force: true });
  } catch {
    // Ignore cleanup errors
  }
}

// Helper to create test files
function createTestFile(name: string, content: string): string {
  const filePath = path.resolve(tempDir, name);
  const dir = path.dirname(filePath);
  mkdirSync(dir, { recursive: true });
  writeFileSync(filePath, content);
  return filePath;
}

// ============================================================================
// PARSER TESTS
// ============================================================================

console.log('--- Parser Tests ---\n');

// Standard RPC types fixture
const standardFile = createTestFile('standard.propane', `
import { RpcRequest } from '@propanejs/pms-core';

export type GetUserRequest = {
  '1:id': number;
} & RpcRequest<GetUserResponse>;

export type GetUserResponse = {
  '1:id': number;
  '2:name': string;
};

export type CreateUserRequest = {
  '1:name': string;
} & RpcRequest<CreateUserResponse>;

export type CreateUserResponse = {
  '1:user': GetUserResponse;
};
`);

test('parseFile extracts RPC endpoints', () => {
  const endpoints = parseFile(standardFile);
  assertEqual(endpoints.length, 2, 'Should find 2 RPC endpoints');

  const getUser = endpoints.find((e) => e.requestType === 'GetUserRequest');
  const createUser = endpoints.find((e) => e.requestType === 'CreateUserRequest');

  if (!getUser) throw new Error('GetUserRequest not found');
  if (!createUser) throw new Error('CreateUserRequest not found');

  assertEqual(getUser.responseType, 'GetUserResponse');
  assertEqual(createUser.responseType, 'CreateUserResponse');
  assertEqual(getUser.sourceFile, standardFile);
});

test('parseFile ignores non-RPC types', () => {
  const file = createTestFile('non-rpc.propane', `
import { RpcRequest } from '@propanejs/pms-core';

export type RegularType = {
  '1:value': string;
};

export type AnotherType = {
  '1:id': number;
  '2:name': string;
};

export type ActualRequest = {
  '1:id': number;
} & RpcRequest<ActualResponse>;

export type ActualResponse = {
  '1:result': string;
};
`);

  const endpoints = parseFile(file);
  assertEqual(endpoints.length, 1, 'Should only find 1 RPC endpoint');
  assertEqual(endpoints[0]!.requestType, 'ActualRequest');
});

test('parseFile handles empty file', () => {
  const file = createTestFile('empty.propane', '');
  const endpoints = parseFile(file);
  assertEqual(endpoints.length, 0, 'Empty file should have no endpoints');
});

test('parseFile handles file with no RPC types', () => {
  const file = createTestFile('no-rpc.propane', `
export type User = {
  '1:id': number;
  '2:name': string;
};

export type Config = {
  '1:debug': boolean;
};
`);

  const endpoints = parseFile(file);
  assertEqual(endpoints.length, 0, 'File with no RPC types should have no endpoints');
});

test('parseFile handles types without Request suffix', () => {
  const file = createTestFile('no-suffix.propane', `
import { RpcRequest } from '@propanejs/pms-core';

export type FetchUser = {
  '1:id': number;
} & RpcRequest<UserData>;

export type UserData = {
  '1:name': string;
};
`);

  const endpoints = parseFile(file);
  assertEqual(endpoints.length, 1);
  assertEqual(endpoints[0]!.requestType, 'FetchUser');
  assertEqual(endpoints[0]!.responseType, 'UserData');
});

test('parseFile handles multiple RPC types in one file', () => {
  const file = createTestFile('many-rpcs.propane', `
import { RpcRequest } from '@propanejs/pms-core';

export type Req1 = { '1:a': number } & RpcRequest<Res1>;
export type Res1 = { '1:b': number };

export type Req2 = { '1:c': string } & RpcRequest<Res2>;
export type Res2 = { '1:d': string };

export type Req3 = { '1:e': boolean } & RpcRequest<Res3>;
export type Res3 = { '1:f': boolean };

export type Req4 = { '1:g': number } & RpcRequest<Res4>;
export type Res4 = { '1:h': number };

export type Req5 = { '1:i': string } & RpcRequest<Res5>;
export type Res5 = { '1:j': string };
`);

  const endpoints = parseFile(file);
  assertEqual(endpoints.length, 5, 'Should find all 5 RPC endpoints');
});

test('parseFiles aggregates results from multiple files', () => {
  const file1 = createTestFile('multi/file1.propane', `
import { RpcRequest } from '@propanejs/pms-core';
export type ReqA = { '1:a': number } & RpcRequest<ResA>;
export type ResA = { '1:b': number };
`);

  const file2 = createTestFile('multi/file2.propane', `
import { RpcRequest } from '@propanejs/pms-core';
export type ReqB = { '1:c': string } & RpcRequest<ResB>;
export type ResB = { '1:d': string };
`);

  const result = parseFiles([file1, file2]);

  assertEqual(result.endpoints.length, 2, 'Should find endpoints from both files');
  assertEqual(result.fileEndpoints.size, 2, 'Should have entries for both files');
  assertEqual(result.fileEndpoints.get(file1)?.length, 1);
  assertEqual(result.fileEndpoints.get(file2)?.length, 1);
});

test('parseFiles handles empty file list', () => {
  const result = parseFiles([]);
  assertEqual(result.endpoints.length, 0);
  assertEqual(result.fileEndpoints.size, 0);
});

// ============================================================================
// GENERATOR TESTS
// ============================================================================

console.log('\n--- Generator Tests ---\n');

test('generateClient produces valid class structure', () => {
  const result = parseFiles([standardFile]);
  const code = generateClient(result, {
    outputPath: '/output/client.ts',
    className: 'TestClient',
  });

  assertIncludes(code, "import { PmsClient } from '@propanejs/pms-client'");
  assertIncludes(code, 'export class TestClient');
  assertIncludes(code, 'constructor(private readonly client: PmsClient)');
});

test('generateClient generates correct method signatures', () => {
  const result = parseFiles([standardFile]);
  const code = generateClient(result, {
    outputPath: '/output/client.ts',
    className: 'Api',
  });

  assertIncludes(code, 'async getUser(request: GetUserRequest): Promise<GetUserResponse>');
  assertIncludes(code, 'async createUser(request: CreateUserRequest): Promise<CreateUserResponse>');
});

test('generateClient generates correct method bodies', () => {
  const result = parseFiles([standardFile]);
  const code = generateClient(result, {
    outputPath: '/output/client.ts',
  });

  assertIncludes(code, 'return this.client.request(request, GetUserResponse)');
  assertIncludes(code, 'return this.client.request(request, CreateUserResponse)');
});

test('generateClient with websocket option uses PmwsClient', () => {
  const result = parseFiles([standardFile]);
  const code = generateClient(result, {
    outputPath: '/output/client.ts',
    websocket: true,
  });

  assertIncludes(code, "import { PmwsClient } from '@propanejs/pms-client'");
  assertIncludes(code, 'constructor(private readonly client: PmwsClient)');
  assertNotIncludes(code, 'PmsClient');
});

test('generateClient method names strip Request suffix', () => {
  const result = parseFiles([standardFile]);
  const code = generateClient(result, {
    outputPath: '/output/client.ts',
  });

  assertIncludes(code, 'async getUser(');
  assertIncludes(code, 'async createUser(');
  assertNotIncludes(code, 'async getUserRequest(');
  assertNotIncludes(code, 'async createUserRequest(');
});

test('generateClient method names handle types without Request suffix', () => {
  const file = createTestFile('no-suffix-gen.propane', `
import { RpcRequest } from '@propanejs/pms-core';
export type FetchUser = { '1:id': number } & RpcRequest<UserData>;
export type UserData = { '1:name': string };
`);

  const result = parseFiles([file]);
  const code = generateClient(result, {
    outputPath: '/output/client.ts',
  });

  // FetchUser doesn't end in Request, so method is fetchUser
  assertIncludes(code, 'async fetchUser(');
});

test('generateClient default class name from hyphenated file', () => {
  const result = parseFiles([standardFile]);
  const code = generateClient(result, {
    outputPath: '/output/api-client.ts',
  });

  assertIncludes(code, 'export class ApiClient');
});

test('generateClient default class name from underscored file', () => {
  const result = parseFiles([standardFile]);
  const code = generateClient(result, {
    outputPath: '/output/user_service.ts',
  });

  assertIncludes(code, 'export class UserService');
});

test('generateClient default class name from dotted file', () => {
  const result = parseFiles([standardFile]);
  const code = generateClient(result, {
    outputPath: '/output/my.api.client.ts',
  });

  assertIncludes(code, 'export class MyApiClient');
});

test('generateClient default class name from PascalCase file', () => {
  const result = parseFiles([standardFile]);
  const code = generateClient(result, {
    outputPath: '/output/MyClient.ts',
  });

  assertIncludes(code, 'export class MyClient');
});

test('generateClient default class name from .js file', () => {
  const result = parseFiles([standardFile]);
  const code = generateClient(result, {
    outputPath: '/output/api-client.js',
  });

  assertIncludes(code, 'export class ApiClient');
});

test('generateClient explicit className overrides file name', () => {
  const result = parseFiles([standardFile]);
  const code = generateClient(result, {
    outputPath: '/output/api-client.ts',
    className: 'CustomName',
  });

  assertIncludes(code, 'export class CustomName');
  assertNotIncludes(code, 'export class ApiClient');
});

test('generateClient imports types from source files', () => {
  const result = parseFiles([standardFile]);
  const code = generateClient(result, {
    outputPath: path.resolve(tempDir, 'output/client.ts'),
  });

  // Should import from the relative path to standard.propane
  assertIncludes(code, 'GetUserRequest');
  assertIncludes(code, 'GetUserResponse');
  assertIncludes(code, 'CreateUserRequest');
  assertIncludes(code, 'CreateUserResponse');
  assertIncludes(code, '.propane.js');
});

test('generateClient groups imports by source file', () => {
  const file1 = createTestFile('imports/users.propane', `
import { RpcRequest } from '@propanejs/pms-core';
export type GetUserReq = { '1:id': number } & RpcRequest<GetUserRes>;
export type GetUserRes = { '1:name': string };
`);

  const file2 = createTestFile('imports/orders.propane', `
import { RpcRequest } from '@propanejs/pms-core';
export type GetOrderReq = { '1:id': number } & RpcRequest<GetOrderRes>;
export type GetOrderRes = { '1:total': number };
`);

  const result = parseFiles([file1, file2]);
  const code = generateClient(result, {
    outputPath: path.resolve(tempDir, 'imports/client.ts'),
  });

  // Should have two separate import statements
  assertIncludes(code, "from './users.propane.js'");
  assertIncludes(code, "from './orders.propane.js'");
});

test('generateClient includes JSDoc comments', () => {
  const result = parseFiles([standardFile]);
  const code = generateClient(result, {
    outputPath: '/output/client.ts',
  });

  assertIncludes(code, '* Call GetUserRequest and receive GetUserResponse');
  assertIncludes(code, '* Generated PMS client with typed methods');
});

test('generateClient includes header comment', () => {
  const result = parseFiles([standardFile]);
  const code = generateClient(result, {
    outputPath: '/output/client.ts',
  });

  assertIncludes(code, '// Generated by @propanejs/pms-client-compiler');
  assertIncludes(code, '// Do not edit manually');
});

test('generateClient handles empty endpoints gracefully', () => {
  const result = parseFiles([]);
  const code = generateClient(result, {
    outputPath: '/output/client.ts',
    className: 'EmptyClient',
  });

  assertIncludes(code, 'export class EmptyClient');
  assertIncludes(code, 'constructor(private readonly client: PmsClient)');
});

// ============================================================================
// CLI TESTS
// ============================================================================

console.log('\n--- CLI Tests ---\n');

const cliPath = path.resolve(__dirname, '../src/cli.js');

type CliResult = { stdout: string; stderr: string; exitCode: number };
function runCli(args: string): CliResult {
  try {
    const stdout = execSync(`node ${cliPath} ${args}`, {
      encoding: 'utf8',
      cwd: tempDir,
      stdio: ['pipe', 'pipe', 'pipe'],
    });
    return { stdout, stderr: '', exitCode: 0 };
  } catch (error: unknown) {
    type ExecErr = { stdout?: string; stderr?: string; status?: number };
    const execError = error as ExecErr;
    return {
      stdout: execError.stdout ?? '',
      stderr: execError.stderr ?? '',
      exitCode: execError.status ?? 1,
    };
  }
}

test('CLI shows help with --help', () => {
  const { stdout, exitCode } = runCli('--help');
  assertEqual(exitCode, 0);
  assertIncludes(stdout, 'Usage: pmscc');
  assertIncludes(stdout, '--output');
  assertIncludes(stdout, '--dir');
  assertIncludes(stdout, '--name');
  assertIncludes(stdout, '--websocket');
});

test('CLI shows help with -h', () => {
  const { stdout, exitCode } = runCli('-h');
  assertEqual(exitCode, 0);
  assertIncludes(stdout, 'Usage: pmscc');
});

test('CLI requires output option', () => {
  const { stderr, exitCode } = runCli(`${standardFile}`);
  assertEqual(exitCode, 1);
  assertIncludes(stderr, 'Output file path is required');
});

test('CLI requires input files', () => {
  const outputFile = path.resolve(tempDir, 'cli-output/no-input.ts');
  const { stderr, exitCode } = runCli(`-o ${outputFile}`);
  assertEqual(exitCode, 1);
  assertIncludes(stderr, 'No .propane files specified');
});

test('CLI compiles single file', () => {
  const outputFile = path.resolve(tempDir, 'cli-output/single.ts');
  const { stdout, exitCode } = runCli(`-o ${outputFile} ${standardFile}`);
  assertEqual(exitCode, 0);
  assertIncludes(stdout, 'Found 2 RPC endpoint(s)');
  assertIncludes(stdout, 'Generated:');
});

test('CLI uses custom class name with -n', () => {
  const outputFile = path.resolve(tempDir, 'cli-output/custom-name.ts');
  const { exitCode } = runCli(`-o ${outputFile} -n MyCustomClient ${standardFile}`);
  assertEqual(exitCode, 0);

  const code = readFileSync(outputFile, 'utf8');
  assertIncludes(code, 'export class MyCustomClient');
});

test('CLI generates websocket client with -w', () => {
  const outputFile = path.resolve(tempDir, 'cli-output/ws-client.ts');
  const { exitCode } = runCli(`-o ${outputFile} -w ${standardFile}`);
  assertEqual(exitCode, 0);

  const code = readFileSync(outputFile, 'utf8');
  assertIncludes(code, 'PmwsClient');
});

test('CLI scans directory with -d', () => {
  // Create a subdirectory with propane files
  const subDir = path.resolve(tempDir, 'cli-dir-scan');
  mkdirSync(subDir, { recursive: true });

  createTestFile('cli-dir-scan/a.propane', `
import { RpcRequest } from '@propanejs/pms-core';
export type ReqA = { '1:x': number } & RpcRequest<ResA>;
export type ResA = { '1:y': number };
`);

  createTestFile('cli-dir-scan/b.propane', `
import { RpcRequest } from '@propanejs/pms-core';
export type ReqB = { '1:x': string } & RpcRequest<ResB>;
export type ResB = { '1:y': string };
`);

  const outputFile = path.resolve(tempDir, 'cli-output/from-dir.ts');
  const { stdout, exitCode } = runCli(`-d ${subDir} -o ${outputFile}`);
  assertEqual(exitCode, 0);
  assertIncludes(stdout, 'Found 2 RPC endpoint(s)');
});

test('CLI handles directory with no propane files', () => {
  const emptyDir = path.resolve(tempDir, 'cli-empty-dir');
  mkdirSync(emptyDir, { recursive: true });

  const outputFile = path.resolve(tempDir, 'cli-output/from-empty.ts');
  const { stderr, exitCode } = runCli(`-d ${emptyDir} -o ${outputFile}`);
  assertEqual(exitCode, 1);
  assertIncludes(stderr, 'No .propane files specified');
});

test('CLI handles non-existent directory', () => {
  const outputFile = path.resolve(tempDir, 'cli-output/nonexistent.ts');
  const { stderr, exitCode } = runCli(`-d /nonexistent/path -o ${outputFile}`);
  assertEqual(exitCode, 1);
  assertIncludes(stderr, 'not found');
});

test('CLI handles non-existent file', () => {
  const outputFile = path.resolve(tempDir, 'cli-output/nonexistent.ts');
  const { stderr, exitCode } = runCli(`-o ${outputFile} /nonexistent/file.propane`);
  assertEqual(exitCode, 1);
  assertIncludes(stderr, 'not found');
});

test('CLI handles file with no RPC types', () => {
  const noRpcFile = createTestFile('cli-no-rpc.propane', `
export type NotAnRpc = { '1:value': string };
`);

  const outputFile = path.resolve(tempDir, 'cli-output/no-rpc.ts');
  const { stderr, exitCode } = runCli(`-o ${outputFile} ${noRpcFile}`);
  assertEqual(exitCode, 1);
  assertIncludes(stderr, 'No RPC endpoints found');
});

test('CLI creates output directory if needed', () => {
  const outputFile = path.resolve(tempDir, 'cli-output/deep/nested/dir/client.ts');
  const { exitCode } = runCli(`-o ${outputFile} ${standardFile}`);
  assertEqual(exitCode, 0);

  if (!existsSync(outputFile)) throw new Error('Output file was not created');
});

test('CLI derives class name from output file by default', () => {
  const outputFile = path.resolve(tempDir, 'cli-output/my-api-client.ts');
  const { exitCode } = runCli(`-o ${outputFile} ${standardFile}`);
  assertEqual(exitCode, 0);

  const code = readFileSync(outputFile, 'utf8');
  assertIncludes(code, 'export class MyApiClient');
});

// ============================================================================
// SUMMARY
// ============================================================================

console.log(`\n${passed} passed, ${failed} failed`);

cleanup();

if (failed > 0) {
  process.exit(1);
}
