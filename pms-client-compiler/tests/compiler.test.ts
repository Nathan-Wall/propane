import { describe, it, before, after } from 'node:test';
import assert from 'node:assert';
import { parseFile, parseFiles } from '../src/parser.js';
import { generateClient } from '../src/generator.js';
import path from 'node:path';
import { writeFileSync, mkdirSync, rmSync, readFileSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { execSync } from 'node:child_process';

// Create a temp directory for test fixtures
const tempDir = path.resolve(tmpdir(), 'pms-compiler-test-' + Date.now());

// Helper to create test files
function createTestFile(name: string, content: string): string {
  const filePath = path.resolve(tempDir, name);
  const dir = path.dirname(filePath);
  mkdirSync(dir, { recursive: true });
  writeFileSync(filePath, content);
  return filePath;
}

// Standard RPC types fixture - created once for reuse
let standardFile: string;

describe('PMS Client Compiler', () => {
  before(() => {
    mkdirSync(tempDir, { recursive: true });
    standardFile = createTestFile('standard.pmsg', `
import { Message } from '@propanejs/runtime';
import { Endpoint } from '@propanejs/pms-core';

export type GetUserRequest = Endpoint<{
  '1:id': number;
}, GetUserResponse>;

export type GetUserResponse = Message<{
  '1:id': number;
  '2:name': string;
}>;

export type CreateUserRequest = Endpoint<{
  '1:name': string;
}, CreateUserResponse>;

export type CreateUserResponse = Message<{
  '1:user': GetUserResponse;
}>;
`);
  });

  after(() => {
    try {
      rmSync(tempDir, { recursive: true, force: true });
    } catch {
      // Ignore cleanup errors
    }
  });

  describe('Parser', () => {
    it('extracts RPC endpoints from file', () => {
      const endpoints = parseFile(standardFile);
      assert.strictEqual(endpoints.length, 2, 'Should find 2 RPC endpoints');

      const getUser = endpoints.find((e) => e.requestType === 'GetUserRequest');
      const createUser = endpoints.find((e) => e.requestType === 'CreateUserRequest');

      assert.ok(getUser, 'GetUserRequest should be found');
      assert.ok(createUser, 'CreateUserRequest should be found');
      assert.strictEqual(getUser.responseType, 'GetUserResponse');
      assert.strictEqual(createUser.responseType, 'CreateUserResponse');
      assert.strictEqual(getUser.sourceFile, standardFile);
    });

    it('ignores non-endpoint message types', () => {
      const file = createTestFile('non-endpoint.pmsg', `
import { Message } from '@propanejs/runtime';
import { Endpoint } from '@propanejs/pms-core';

export type RegularType = Message<{
  '1:value': string;
}>;

export type ActualRequest = Endpoint<{
  '1:id': number;
}, ActualResponse>;

export type ActualResponse = Message<{
  '1:result': string;
}>;
`);

      const endpoints = parseFile(file);
      assert.strictEqual(endpoints.length, 1, 'Should only find 1 RPC endpoint');
      assert.strictEqual(endpoints[0]!.requestType, 'ActualRequest');
    });

    it('handles empty file', () => {
      const file = createTestFile('empty.pmsg', '');
      const endpoints = parseFile(file);
      assert.strictEqual(endpoints.length, 0);
    });

    it('handles file with no endpoints', () => {
      const file = createTestFile('no-endpoints.pmsg', `
import { Message } from '@propanejs/runtime';

export type User = Message<{
  '1:id': number;
  '2:name': string;
}>;
`);
      const endpoints = parseFile(file);
      assert.strictEqual(endpoints.length, 0);
    });

    it('handles types without Request suffix', () => {
      const file = createTestFile('no-suffix.pmsg', `
import { Message } from '@propanejs/runtime';
import { Endpoint } from '@propanejs/pms-core';

export type FetchUser = Endpoint<{
  '1:id': number;
}, UserData>;

export type UserData = Message<{
  '1:name': string;
}>;
`);

      const endpoints = parseFile(file);
      assert.strictEqual(endpoints.length, 1);
      assert.strictEqual(endpoints[0]!.requestType, 'FetchUser');
      assert.strictEqual(endpoints[0]!.responseType, 'UserData');
    });

    it('handles multiple endpoints in one file', () => {
      const file = createTestFile('many-endpoints.pmsg', `
import { Message } from '@propanejs/runtime';
import { Endpoint } from '@propanejs/pms-core';

export type Req1 = Endpoint<{ '1:a': number }, Res1>;
export type Res1 = Message<{ '1:b': number }>;

export type Req2 = Endpoint<{ '1:c': string }, Res2>;
export type Res2 = Message<{ '1:d': string }>;

export type Req3 = Endpoint<{ '1:e': boolean }, Res3>;
export type Res3 = Message<{ '1:f': boolean }>;
`);

      const endpoints = parseFile(file);
      assert.strictEqual(endpoints.length, 3);
    });

    it('aggregates results from multiple files', () => {
      const file1 = createTestFile('multi/file1.pmsg', `
import { Message } from '@propanejs/runtime';
import { Endpoint } from '@propanejs/pms-core';
export type ReqA = Endpoint<{ '1:a': number }, ResA>;
export type ResA = Message<{ '1:b': number }>;
`);

      const file2 = createTestFile('multi/file2.pmsg', `
import { Message } from '@propanejs/runtime';
import { Endpoint } from '@propanejs/pms-core';
export type ReqB = Endpoint<{ '1:c': string }, ResB>;
export type ResB = Message<{ '1:d': string }>;
`);

      const result = parseFiles([file1, file2]);
      assert.strictEqual(result.endpoints.length, 2);
      assert.strictEqual(result.fileEndpoints.size, 2);
    });

    it('handles empty file list', () => {
      const result = parseFiles([]);
      assert.strictEqual(result.endpoints.length, 0);
      assert.strictEqual(result.fileEndpoints.size, 0);
    });
  });

  describe('Generator', () => {
    it('produces valid class structure', () => {
      const result = parseFiles([standardFile]);
      const code = generateClient(result, {
        outputPath: '/output/client.ts',
        className: 'TestClient',
      });

      assert.ok(code.includes("import { PmsClient"), 'Should import PmsClient');
      assert.ok(code.includes('export class TestClient'), 'Should export TestClient class');
      assert.ok(code.includes('private readonly client: PmsClient'), 'Should have client field');
    });

    it('generates correct method signatures', () => {
      const result = parseFiles([standardFile]);
      const code = generateClient(result, {
        outputPath: '/output/client.ts',
        className: 'Api',
      });

      assert.ok(code.includes('async getUser'), 'Should have getUser method');
      assert.ok(code.includes('async createUser'), 'Should have createUser method');
      assert.ok(code.includes('GetUserRequest.Value'), 'Should use .Value type for request');
      assert.ok(code.includes('Promise<GetUserResponse>'), 'Should return Promise of response');
    });

    it('generates correct method bodies', () => {
      const result = parseFiles([standardFile]);
      const code = generateClient(result, {
        outputPath: '/output/client.ts',
      });

      assert.ok(code.includes('this.client.request('), 'Should call client.request');
      assert.ok(code.includes('GetUserResponse)'), 'Should pass response type');
    });

    it('with websocket option uses PmwsClient', () => {
      const result = parseFiles([standardFile]);
      const code = generateClient(result, {
        outputPath: '/output/client.ts',
        websocket: true,
      });

      assert.ok(code.includes('PmwsClient'), 'Should use PmwsClient');
      assert.ok(!code.includes('PmsClient'), 'Should not use PmsClient');
    });

    it('method names are camelCase from request type', () => {
      const result = parseFiles([standardFile]);
      const code = generateClient(result, {
        outputPath: '/output/client.ts',
      });

      assert.ok(code.includes('async getUser'), 'Should have getUser method');
      assert.ok(code.includes('async createUser'), 'Should have createUser method');
    });

    it('derives class name from hyphenated file', () => {
      const result = parseFiles([standardFile]);
      const code = generateClient(result, {
        outputPath: '/output/api-client.ts',
      });

      assert.ok(code.includes('export class ApiClient'));
    });

    it('derives class name from underscored file', () => {
      const result = parseFiles([standardFile]);
      const code = generateClient(result, {
        outputPath: '/output/user_service.ts',
      });

      assert.ok(code.includes('export class UserService'));
    });

    it('explicit className overrides file name', () => {
      const result = parseFiles([standardFile]);
      const code = generateClient(result, {
        outputPath: '/output/api-client.ts',
        className: 'CustomName',
      });

      assert.ok(code.includes('export class CustomName'));
      assert.ok(!code.includes('export class ApiClient'));
    });

    it('imports types from source files', () => {
      const result = parseFiles([standardFile]);
      const code = generateClient(result, {
        outputPath: path.resolve(tempDir, 'output/client.ts'),
      });

      assert.ok(code.includes('GetUserRequest'), 'Should import GetUserRequest');
      assert.ok(code.includes('GetUserResponse'), 'Should import GetUserResponse');
      assert.ok(code.includes('.pmsg.js'), 'Should use .pmsg.js extension');
    });

    it('groups imports by source file', () => {
      const file1 = createTestFile('imports/users.pmsg', `
import { Message } from '@propanejs/runtime';
import { Endpoint } from '@propanejs/pms-core';
export type GetUserReq = Endpoint<{ '1:id': number }, GetUserRes>;
export type GetUserRes = Message<{ '1:name': string }>;
`);

      const file2 = createTestFile('imports/orders.pmsg', `
import { Message } from '@propanejs/runtime';
import { Endpoint } from '@propanejs/pms-core';
export type GetOrderReq = Endpoint<{ '1:id': number }, GetOrderRes>;
export type GetOrderRes = Message<{ '1:total': number }>;
`);

      const result = parseFiles([file1, file2]);
      const code = generateClient(result, {
        outputPath: path.resolve(tempDir, 'imports/client.ts'),
      });

      assert.ok(code.includes("from './users.pmsg.js'"));
      assert.ok(code.includes("from './orders.pmsg.js'"));
    });

    it('includes JSDoc comments', () => {
      const result = parseFiles([standardFile]);
      const code = generateClient(result, {
        outputPath: '/output/client.ts',
      });

      assert.ok(code.includes('* Call GetUserRequest'), 'Should have method JSDoc');
      assert.ok(code.includes('* Generated PMS client'), 'Should have class JSDoc');
    });

    it('includes header comment', () => {
      const result = parseFiles([standardFile]);
      const code = generateClient(result, {
        outputPath: '/output/client.ts',
      });

      assert.ok(code.includes('// Generated by @propanejs/pms-client-compiler'));
      assert.ok(code.includes('// Do not edit manually'));
    });

    it('handles empty endpoints gracefully', () => {
      const result = parseFiles([]);
      const code = generateClient(result, {
        outputPath: '/output/client.ts',
        className: 'EmptyClient',
      });

      assert.ok(code.includes('export class EmptyClient'));
    });
  });

  describe('CLI', () => {
    const cliPath = path.resolve(import.meta.dirname, '../src/cli.js');

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

    it('shows help with --help', () => {
      const { stdout, exitCode } = runCli('--help');
      assert.strictEqual(exitCode, 0);
      assert.ok(stdout.includes('Usage: pmscc'));
      assert.ok(stdout.includes('--output'));
    });

    it('shows help with -h', () => {
      const { stdout, exitCode } = runCli('-h');
      assert.strictEqual(exitCode, 0);
      assert.ok(stdout.includes('Usage: pmscc'));
    });

    it('requires output option', () => {
      const { stderr, exitCode } = runCli(`${standardFile}`);
      assert.strictEqual(exitCode, 1);
      assert.ok(stderr.includes('Output file path is required'));
    });

    it('requires input files', () => {
      const outputFile = path.resolve(tempDir, 'cli-output/no-input.ts');
      const { stderr, exitCode } = runCli(`-o ${outputFile}`);
      assert.strictEqual(exitCode, 1);
      assert.ok(stderr.includes('No .pmsg files specified'));
    });

    it('compiles single file', () => {
      const outputFile = path.resolve(tempDir, 'cli-output/single.ts');
      const { stdout, exitCode } = runCli(`-o ${outputFile} ${standardFile}`);
      assert.strictEqual(exitCode, 0);
      assert.ok(stdout.includes('Found 2 RPC endpoint(s)'));
      assert.ok(stdout.includes('Generated:'));
    });

    it('uses custom class name with -n', () => {
      const outputFile = path.resolve(tempDir, 'cli-output/custom-name.ts');
      const { exitCode } = runCli(`-o ${outputFile} -n MyCustomClient ${standardFile}`);
      assert.strictEqual(exitCode, 0);

      const code = readFileSync(outputFile, 'utf8');
      assert.ok(code.includes('export class MyCustomClient'));
    });

    it('generates websocket client with -w', () => {
      const outputFile = path.resolve(tempDir, 'cli-output/ws-client.ts');
      const { exitCode } = runCli(`-o ${outputFile} -w ${standardFile}`);
      assert.strictEqual(exitCode, 0);

      const code = readFileSync(outputFile, 'utf8');
      assert.ok(code.includes('PmwsClient'));
    });

    it('scans directory with -d', () => {
      const subDir = path.resolve(tempDir, 'cli-dir-scan');
      mkdirSync(subDir, { recursive: true });

      createTestFile('cli-dir-scan/a.pmsg', `
import { Message } from '@propanejs/runtime';
import { Endpoint } from '@propanejs/pms-core';
export type ReqA = Endpoint<{ '1:x': number }, ResA>;
export type ResA = Message<{ '1:y': number }>;
`);

      createTestFile('cli-dir-scan/b.pmsg', `
import { Message } from '@propanejs/runtime';
import { Endpoint } from '@propanejs/pms-core';
export type ReqB = Endpoint<{ '1:x': string }, ResB>;
export type ResB = Message<{ '1:y': string }>;
`);

      const outputFile = path.resolve(tempDir, 'cli-output/from-dir.ts');
      const { stdout, exitCode } = runCli(`-d ${subDir} -o ${outputFile}`);
      assert.strictEqual(exitCode, 0);
      assert.ok(stdout.includes('Found 2 RPC endpoint(s)'));
    });

    it('handles directory with no propane files', () => {
      const emptyDir = path.resolve(tempDir, 'cli-empty-dir');
      mkdirSync(emptyDir, { recursive: true });

      const outputFile = path.resolve(tempDir, 'cli-output/from-empty.ts');
      const { stderr, exitCode } = runCli(`-d ${emptyDir} -o ${outputFile}`);
      assert.strictEqual(exitCode, 1);
      assert.ok(stderr.includes('No .pmsg files specified'));
    });

    it('handles non-existent directory', () => {
      const outputFile = path.resolve(tempDir, 'cli-output/nonexistent.ts');
      const { stderr, exitCode } = runCli(`-d /nonexistent/path -o ${outputFile}`);
      assert.strictEqual(exitCode, 1);
      assert.ok(stderr.includes('not found'));
    });

    it('handles non-existent file', () => {
      const outputFile = path.resolve(tempDir, 'cli-output/nonexistent.ts');
      const { stderr, exitCode } = runCli(`-o ${outputFile} /nonexistent/file.pmsg`);
      assert.strictEqual(exitCode, 1);
      assert.ok(stderr.includes('not found'));
    });

    it('handles file with no endpoints', () => {
      const noEndpointFile = createTestFile('cli-no-endpoint.pmsg', `
import { Message } from '@propanejs/runtime';
export type NotAnEndpoint = Message<{ '1:value': string }>;
`);

      const outputFile = path.resolve(tempDir, 'cli-output/no-endpoint.ts');
      const { stderr, exitCode } = runCli(`-o ${outputFile} ${noEndpointFile}`);
      assert.strictEqual(exitCode, 1);
      assert.ok(stderr.includes('No RPC endpoints found'));
    });

    it('creates output directory if needed', () => {
      const outputFile = path.resolve(tempDir, 'cli-output/deep/nested/dir/client.ts');
      const { exitCode } = runCli(`-o ${outputFile} ${standardFile}`);
      assert.strictEqual(exitCode, 0);
      assert.ok(existsSync(outputFile), 'Output file should exist');
    });

    it('derives class name from output file by default', () => {
      const outputFile = path.resolve(tempDir, 'cli-output/my-api-client.ts');
      const { exitCode } = runCli(`-o ${outputFile} ${standardFile}`);
      assert.strictEqual(exitCode, 0);

      const code = readFileSync(outputFile, 'utf8');
      assert.ok(code.includes('export class MyApiClient'));
    });
  });
});
