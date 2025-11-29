#!/usr/bin/env node

import { parseArgs } from 'node:util';
import { resolve, join, dirname } from 'node:path';
import { writeFileSync, existsSync, mkdirSync, readdirSync, statSync, watch } from 'node:fs';
import { parseFiles } from './parser.js';
import { generateClient } from './generator.js';

interface CliOptions {
  files: string[];
  dir?: string;
  output: string;
  className?: string;
  websocket: boolean;
  watch: boolean;
}

function printUsage(): void {
  console.log(`
Usage: pmscc [options] [files...]

Generate a typed PMS client from .propane files.

Options:
  -d, --dir <path>      Directory to search for .propane files
  -o, --output <path>   Output file path (required)
  -n, --name <name>     Generated class name (default: derived from output file)
  -w, --websocket       Generate WebSocket client instead of HTTP
  -W, --watch           Watch for changes and regenerate
  -h, --help            Show this help message

Examples:
  # Compile to api-client.ts -> generates class ApiClient
  pmscc -o src/generated/api-client.ts src/messages/*.propane

  # Compile all .propane files in a directory
  pmscc -d src/messages -o src/generated/api-client.ts

  # Watch mode - regenerate on changes
  pmscc -d src/messages -o src/generated/api-client.ts -W

  # Generate WebSocket client with custom name
  pmscc -d src/api -o src/client.ts -n MyClient -w
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
        name: { type: 'string', short: 'n' },
        websocket: { type: 'boolean', short: 'w', default: false },
        watch: { type: 'boolean', short: 'W', default: false },
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
      className: values.name,
      websocket: values.websocket ?? false,
      watch: values.watch ?? false,
    };
  } catch (error) {
    if (error instanceof Error) {
      console.error(`Error: ${error.message}`);
    }
    return null;
  }
}

/**
 * Compile .propane files and generate the client.
 * Returns true on success, false on error.
 */
function compile(options: CliOptions, verbose: boolean = true): boolean {
  // Verify all files exist
  for (const file of options.files) {
    if (!existsSync(file)) {
      console.error(`Error: File not found: ${file}`);
      return false;
    }
  }

  if (verbose) {
    console.log(`Parsing ${options.files.length} .propane file(s)...`);
  }

  // Parse files
  const parseResult = parseFiles(options.files);

  if (parseResult.endpoints.length === 0) {
    console.error('Error: No RPC endpoints found');
    console.error('Make sure your types extend RpcRequest<TResponse>');
    return false;
  }

  if (verbose) {
    console.log(`Found ${parseResult.endpoints.length} RPC endpoint(s):`);
    for (const endpoint of parseResult.endpoints) {
      console.log(`  - ${endpoint.requestType} -> ${endpoint.responseType}`);
    }
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

  if (verbose) {
    console.log(`\nGenerated: ${options.output}`);
  }

  return true;
}

/**
 * Watch files and directories for changes, recompiling on change.
 */
function watchFiles(options: CliOptions): void {
  console.log('\nWatching for changes... (press Ctrl+C to stop)\n');

  // Debounce timer to avoid multiple rapid recompiles
  let debounceTimer: ReturnType<typeof setTimeout> | null = null;
  const debounceMs = 100;

  const triggerRecompile = (changedFile: string) => {
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    debounceTimer = setTimeout(() => {
      const timestamp = new Date().toLocaleTimeString();
      console.log(`\n[${timestamp}] Change detected: ${changedFile}`);

      // Re-scan directory if using -d option to pick up new files
      if (options.dir) {
        const dirPath = resolve(options.dir);
        options.files = findPropaneFiles(dirPath);
      }

      const success = compile(options, false);
      if (success) {
        console.log(`[${timestamp}] Regenerated: ${options.output}`);
      }
    }, debounceMs);
  };

  // Watch individual files
  const watchedPaths = new Set<string>();

  for (const file of options.files) {
    if (!watchedPaths.has(file)) {
      watchedPaths.add(file);
      try {
        watch(file, (eventType) => {
          if (eventType === 'change') {
            triggerRecompile(file);
          }
        });
      } catch {
        console.warn(`Warning: Could not watch file: ${file}`);
      }
    }
  }

  // Watch directory if -d was specified (to detect new files)
  if (options.dir) {
    const dirPath = resolve(options.dir);
    try {
      watch(dirPath, { recursive: true }, (eventType, filename) => {
        if (filename && filename.endsWith('.propane')) {
          triggerRecompile(join(dirPath, filename));
        }
      });
    } catch {
      // Fallback: watch individual directories if recursive not supported
      const watchDir = (dir: string) => {
        try {
          watch(dir, (eventType, filename) => {
            if (filename && filename.endsWith('.propane')) {
              triggerRecompile(join(dir, filename));
            }
          });

          // Watch subdirectories
          const entries = readdirSync(dir);
          for (const entry of entries) {
            const fullPath = join(dir, entry);
            if (statSync(fullPath).isDirectory()) {
              watchDir(fullPath);
            }
          }
        } catch {
          console.warn(`Warning: Could not watch directory: ${dir}`);
        }
      };

      watchDir(dirPath);
    }
  }
}

function main(): void {
  const options = parseCliArgs();
  if (!options) {
    process.exit(1);
  }

  // Initial compile
  const success = compile(options);
  if (!success) {
    process.exit(1);
  }

  // Start watch mode if requested
  if (options.watch) {
    watchFiles(options);
  }
}

main();
