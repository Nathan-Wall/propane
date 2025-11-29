#!/usr/bin/env node

import { parseArgs } from 'node:util';
import { resolve, join } from 'node:path';
import { writeFileSync, existsSync, mkdirSync, readdirSync, statSync } from 'node:fs';
import { parseFiles } from './parser.js';
import { generateClient } from './generator.js';

interface CliOptions {
  files: string[];
  dir?: string;
  output: string;
  className: string;
  websocket: boolean;
}

function printUsage(): void {
  console.log(`
Usage: pmscc [options] [files...]

Generate a typed PMS client from .propane files.

Options:
  -d, --dir <path>      Directory to search for .propane files
  -o, --output <path>   Output file path (required)
  -n, --name <name>     Generated class name (default: GeneratedPmsClient)
  -w, --websocket       Generate WebSocket client instead of HTTP
  -h, --help            Show this help message

Examples:
  # Compile specific files
  pmscc -o src/generated/client.ts src/messages/*.propane

  # Compile all .propane files in a directory
  pmscc -d src/messages -o src/generated/client.ts

  # Generate WebSocket client with custom name
  pmscc -d src/api -o src/client.ts -n ApiClient -w
`);
}

function findPropaneFiles(dir: string): string[] {
  const files: string[] = [];

  function scan(currentDir: string) {
    const entries = readdirSync(currentDir);
    for (const entry of entries) {
      const fullPath = join(currentDir, entry);
      const stat = statSync(fullPath);

      if (stat.isDirectory()) {
        scan(fullPath);
      } else if (entry.endsWith('.propane')) {
        files.push(fullPath);
      }
    }
  }

  scan(dir);
  return files;
}

function parseCliArgs(): CliOptions | null {
  try {
    const { values, positionals } = parseArgs({
      options: {
        dir: { type: 'string', short: 'd' },
        output: { type: 'string', short: 'o' },
        name: { type: 'string', short: 'n', default: 'GeneratedPmsClient' },
        websocket: { type: 'boolean', short: 'w', default: false },
        help: { type: 'boolean', short: 'h', default: false },
      },
      allowPositionals: true,
    });

    if (values.help) {
      printUsage();
      process.exit(0);
    }

    if (!values.output) {
      console.error('Error: Output file path is required (-o, --output)');
      printUsage();
      return null;
    }

    let files: string[] = positionals.map((f) => resolve(f));

    if (values.dir) {
      const dirPath = resolve(values.dir);
      if (!existsSync(dirPath)) {
        console.error(`Error: Directory not found: ${dirPath}`);
        return null;
      }
      files = [...files, ...findPropaneFiles(dirPath)];
    }

    if (files.length === 0) {
      console.error('Error: No .propane files specified');
      console.error('Use -d to specify a directory or provide file paths as arguments');
      return null;
    }

    return {
      files,
      dir: values.dir,
      output: resolve(values.output),
      className: values.name ?? 'GeneratedPmsClient',
      websocket: values.websocket ?? false,
    };
  } catch (error) {
    if (error instanceof Error) {
      console.error(`Error: ${error.message}`);
    }
    return null;
  }
}

function main(): void {
  const options = parseCliArgs();
  if (!options) {
    process.exit(1);
  }

  // Verify all files exist
  for (const file of options.files) {
    if (!existsSync(file)) {
      console.error(`Error: File not found: ${file}`);
      process.exit(1);
    }
  }

  console.log(`Parsing ${options.files.length} .propane file(s)...`);

  // Parse files
  const parseResult = parseFiles(options.files);

  if (parseResult.endpoints.length === 0) {
    console.error('Error: No RPC endpoints found');
    console.error('Make sure your types extend RpcRequest<TResponse>');
    process.exit(1);
  }

  console.log(`Found ${parseResult.endpoints.length} RPC endpoint(s):`);
  for (const endpoint of parseResult.endpoints) {
    console.log(`  - ${endpoint.requestType} -> ${endpoint.responseType}`);
  }

  // Generate client code
  const clientCode = generateClient(parseResult, {
    outputPath: options.output,
    className: options.className,
    websocket: options.websocket,
  });

  // Ensure output directory exists
  const outputDir = resolve(options.output, '..');
  if (!existsSync(outputDir)) {
    mkdirSync(outputDir, { recursive: true });
  }

  // Write output
  writeFileSync(options.output, clientCode, 'utf-8');
  console.log(`\nGenerated: ${options.output}`);
}

main();
