#!/usr/bin/env node

/**
 * ppg - Propane PostgreSQL CLI
 *
 * Commands:
 *   generate              Generate schema from .pmsg files
 *   diff                  Show diff between database and schema
 *   migrate:create <desc> Create a new migration
 *   migrate:up            Apply pending migrations
 *   migrate:down          Rollback last migration
 *   branch:create <name>  Create a branch schema
 *   branch:clone <s> <t>  Clone schema from source to target branch
 *   branch:drop <name>    Drop a branch schema
 *   branch:list           List all branch schemas
 */

import {
  loadConfig,
  generateCommand,
  diffCommand,
  migrateCreateCommand,
  migrateUpCommand,
  migrateDownCommand,
  branchCreateCommand,
  branchCloneCommand,
  branchDropCommand,
  branchListCommand,
  type GenerateCommandOptions,
} from './commands.js';

const HELP = `
ppg - Propane PostgreSQL CLI

Usage: ppg <command> [options]

Commands:
  generate                  Generate schema from .pmsg files
  diff                      Show diff between database and schema
  migrate:create <desc>     Create a new migration
  migrate:up                Apply pending migrations
  migrate:down              Rollback last migration
  branch:create <name>      Create a branch schema
  branch:clone <src> <dst>  Clone schema from source to target branch
  branch:drop <name>        Drop a branch schema
  branch:list               List all branch schemas

Options:
  --config <path>           Path to config file
  --help, -h                Show this help message

Generate Options:
  --repositories            Generate repository classes
  --output-dir <path>       Output directory for generated files

Environment Variables:
  DB_HOST                   Database host (default: localhost)
  DB_PORT                   Database port (default: 5432)
  DB_NAME                   Database name (default: postgres)
  DB_USER                   Database user (default: postgres)
  DB_PASSWORD               Database password

Examples:
  ppg generate
  ppg generate --repositories --output-dir ./src/generated
  ppg migrate:create "add user email"
  ppg migrate:up
  ppg branch:create feature/new-auth
  ppg branch:clone main feature/new-auth
`;

async function main(): Promise<void> {
  const args = process.argv.slice(2);

  // Handle help
  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    console.log(HELP);
    process.exit(0);
  }

  // Parse config option
  let configPath: string | undefined;
  const configIndex = args.indexOf('--config');
  if (configIndex !== -1 && args[configIndex + 1]) {
    configPath = args[configIndex + 1];
    args.splice(configIndex, 2);
  }

  const command = args[0];
  const commandArgs = args.slice(1);

  try {
    const config = await loadConfig(configPath);

    switch (command) {
      case 'generate': {
        const generateOptions: GenerateCommandOptions = {};

        // Parse --repositories flag
        if (commandArgs.includes('--repositories')) {
          generateOptions.repositories = true;
          const idx = commandArgs.indexOf('--repositories');
          commandArgs.splice(idx, 1);
        }

        // Parse --output-dir flag
        const outputDirIdx = commandArgs.indexOf('--output-dir');
        if (outputDirIdx !== -1 && commandArgs[outputDirIdx + 1]) {
          generateOptions.outputDir = commandArgs[outputDirIdx + 1];
          commandArgs.splice(outputDirIdx, 2);
        }

        generateCommand(config, generateOptions);
        break;
      }

      case 'diff':
        await diffCommand(config);
        break;

      case 'migrate:create':
        if (!commandArgs[0]) {
          console.error('Error: Migration description required');
          console.error('Usage: ppg migrate:create <description>');
          process.exit(1);
        }
        await migrateCreateCommand(config, commandArgs.join(' '));
        break;

      case 'migrate:up':
        await migrateUpCommand(config);
        break;

      case 'migrate:down':
        await migrateDownCommand(config);
        break;

      case 'branch:create':
        if (!commandArgs[0]) {
          console.error('Error: Branch name required');
          console.error('Usage: ppg branch:create <name>');
          process.exit(1);
        }
        await branchCreateCommand(config, commandArgs[0]);
        break;

      case 'branch:clone':
        if (!commandArgs[0] || !commandArgs[1]) {
          console.error('Error: Source and target branch names required');
          console.error('Usage: ppg branch:clone <source> <target>');
          process.exit(1);
        }
        await branchCloneCommand(config, commandArgs[0], commandArgs[1]);
        break;

      case 'branch:drop':
        if (!commandArgs[0]) {
          console.error('Error: Branch name required');
          console.error('Usage: ppg branch:drop <name>');
          process.exit(1);
        }
        await branchDropCommand(config, commandArgs[0]);
        break;

      case 'branch:list':
        await branchListCommand(config);
        break;

      default:
        console.error(`Unknown command: ${command}`);
        console.log('Run "ppg --help" for usage information.');
        process.exit(1);
    }
  } catch (error) {
    console.error('Error:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

await main();
