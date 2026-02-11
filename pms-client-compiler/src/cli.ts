#!/usr/bin/env node

import { parseArgs } from 'node:util';
import path from 'node:path';
import { writeFileSync, existsSync, mkdirSync, readdirSync, statSync, readFileSync } from 'node:fs';
import chokidar from 'chokidar';
import { parseFiles } from './parser.js';
import type { TypeAliasMap } from '@/tools/parser/type-aliases.js';
import { generateClient } from './generator.js';

interface CliOptions {
  files: string[];
  positionalFiles: string[];
  dir?: string;
  output: string;
  className?: string;
  websocket: boolean;
  watch: boolean;
  typeAliases?: TypeAliasMap;
}

interface PmsConfig {
  inputDir?: string;
  output?: string;
  className?: string;
  websocket?: boolean;
  watch?: boolean;
}

interface PropaneConfig {
  pms?: PmsConfig;
  typeAliases?: TypeAliasMap;
}

function loadConfig(): PropaneConfig | null {
  const configPath = path.resolve(process.cwd(), 'propane.config.json');
  if (existsSync(configPath)) {
    try {
      const content = readFileSync(configPath, 'utf8');
      const config = JSON.parse(content) as PropaneConfig;
      return config;
    } catch (e) {
      console.warn(`Warning: Failed to parse propane.config.json: ${e instanceof Error ? e.message : String(e)}`);
    }
  }
  return null;
}

function printUsage(): void {
  console.log(`
Usage: pmscc [options] [files...]

Generate a typed PMS client from .pmsg files.

Options:
  -d, --dir <path>      Directory to search for .pmsg files
  -o, --output <path>   Output file path (required)
  -n, --name <name>     Generated class name (default: derived from output file)
  -w, --websocket       Generate WebSocket client instead of HTTP
  -W, --watch           Watch for changes and regenerate
  -h, --help            Show this help message

Configuration:
  Reads propane.config.json (pms section):
  {
    "pms": {
      "inputDir": "src/messages",
      "output": "src/client.ts",
      "websocket": false
    }
  }

Examples:
  # Compile to api-client.ts -> generates class ApiClient
  pmscc -o src/generated/api-client.ts src/messages/*.pmsg

  # Compile all .pmsg files in a directory
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
      const fullPath = path.join(currentDir, entry);
      const stat = statSync(fullPath);

      if (stat.isDirectory()) {
        scan(fullPath);
      } else if (entry.endsWith('.pmsg')) {
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

    const config = loadConfig();
    const pmsConfig = config?.pms;

    let output: string | undefined;
    if (values.output) {
      output = path.resolve(values.output);
    } else if (pmsConfig?.output) {
      output = path.resolve(pmsConfig.output);
    }

    if (!output) {
      console.error('Error: Output file path is required (-o, --output) or in propane.config.json');
      printUsage();
      return null;
    }

    const positionalFiles: string[] = positionals.map(f => path.resolve(f));
    let files: string[] = [...positionalFiles];
    const dir = values.dir || pmsConfig?.inputDir;

    if (dir) {
      const dirPath = path.resolve(dir);
      if (!existsSync(dirPath)) {
        console.error(`Error: Directory not found: ${dirPath}`);
        return null;
      }
      files = [...files, ...findPropaneFiles(dirPath)];
    }

    if (files.length === 0) {
      console.error('Error: No .pmsg files specified');
      console.error('Use -d to specify a directory or provide file paths as arguments');
      return null;
    }

    return {
      files,
      positionalFiles,
      dir,
      output,
      className: values.name || pmsConfig?.className,
      websocket: values.websocket || pmsConfig?.websocket || false,
      watch: values.watch || pmsConfig?.watch || false,
      typeAliases: config?.typeAliases,
    };
  } catch (error) {
    if (error instanceof Error) {
      console.error(`Error: ${error.message}`);
    }
    return null;
  }
}

/**
 * Compile .pmsg files and generate the client.
 * Returns true on success, false on error.
 */
function compile(options: CliOptions, verbose = true): boolean {
  // Verify all files exist
  for (const file of options.files) {
    if (!existsSync(file)) {
      console.error(`Error: File not found: ${file}`);
      return false;
    }
  }

  if (verbose) {
    console.log(`Parsing ${options.files.length} .pmsg file(s)...`);
  }

  // Parse files
  const parseResult = parseFiles(options.files, {
    typeAliases: options.typeAliases,
  });

  if (parseResult.endpoints.length === 0) {
    console.error('Error: No RPC endpoints found');
    console.error('Make sure your types use Endpoint<Payload, Response> with Message<{...}> response types');
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
  const outputDir = path.resolve(options.output, '..');
  if (!existsSync(outputDir)) {
    mkdirSync(outputDir, { recursive: true });
  }

  // Write output
  writeFileSync(options.output, clientCode, 'utf8');

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
        const dirPath = path.resolve(options.dir);
        const dirFiles = findPropaneFiles(dirPath);
        options.files = [...options.positionalFiles, ...dirFiles];
      }

      const success = compile(options, false);
      if (success) {
        console.log(`[${timestamp}] Regenerated: ${options.output}`);
      }
    }, debounceMs);
  };

  const pathsToWatch: string[] = [];
  if (options.dir) {
    pathsToWatch.push(path.resolve(options.dir));
  }
  // Also watch the specific files in the list (chokidar handles redundancies)
  pathsToWatch.push(...options.files);

  const watcher = chokidar
    .watch(pathsToWatch, {
      ignored: /(^|[/\\])\../, // ignore dotfiles
      persistent: true,
      ignoreInitial: true,
    })
    .on('all', (event, filePath) => {
      if (filePath.endsWith('.pmsg')) {
        triggerRecompile(filePath);
      }
    });

  const shutdown = () => {
    void watcher.close();
    process.exit(0);
  };
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
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
