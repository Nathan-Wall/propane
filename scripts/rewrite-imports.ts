/**
 * Rewrites internal monorepo imports to published package imports.
 *
 * During development, we use @/ paths for simplicity:
 *   import { TypeRegistry } from '@/types/src/registry.js';
 *
 * At publish time, this script rewrites them to package imports:
 *   import { TypeRegistry } from '@propane/types';
 *
 * This ensures instanceof checks work correctly since all packages
 * import from the same published package.
 *
 * Usage:
 *   npx tsx scripts/rewrite-imports.ts <directory> [options]
 *
 * Options:
 *   --delete-rewritten  Delete source directories that were rewritten to package imports
 *   --dry-run           Show what would be changed without modifying files
 *   --verbose           Show all files processed, not just changed ones
 */
import fs from 'node:fs';
import path from 'node:path';

/**
 * Configuration for rewriting an internal import to a package import.
 */
interface ImportRewrite {
  /** Human-readable name for logging */
  name: string;
  /** RegExp to match import paths (must have 'g' flag) */
  pattern: RegExp;
  /** The package import to use instead */
  replacement: string;
  /** Directory to delete after rewriting (relative to target) */
  deleteDir?: string;
}

/**
 * Import rewrites for Propane packages.
 *
 * After tsc-alias runs, @/ paths become relative paths like:
 *   ../../../types/src/registry.js
 *
 * These patterns match those relative paths and rewrite to package imports.
 */
const IMPORT_REWRITES: ImportRewrite[] = [
  {
    name: '@propane/types',
    pattern: /['"](?:\.\.\/)*types\/src\/[^'"]+['"]/g,
    replacement: "'@propane/types'",
    deleteDir: 'types',
  },
  {
    name: '@propane/runtime',
    pattern: /['"](?:\.\.\/)*runtime\/[^'"]+['"]/g,
    replacement: "'@propane/runtime'",
    deleteDir: 'runtime',
  },
  // Add more packages as they become publishable:
  // {
  //   name: '@propane/parser',
  //   pattern: /['"](?:\.\.\/)*tools\/parser\/[^'"]+['"]/g,
  //   replacement: "'@propane/parser'",
  //   deleteDir: 'tools/parser',
  // },
];

interface Options {
  deleteRewritten: boolean;
  dryRun: boolean;
  verbose: boolean;
}

interface RewriteStats {
  filesProcessed: number;
  filesChanged: number;
  appliedRewrites: Set<ImportRewrite>;
}

/**
 * Check if file content contains imports that need rewriting.
 */
function needsRewriting(content: string): boolean {
  return IMPORT_REWRITES.some(({ pattern }) => {
    pattern.lastIndex = 0;
    return pattern.test(content);
  });
}

/**
 * Rewrite imports in file content, returning new content and applied rewrites.
 */
function rewriteContent(
  content: string,
  appliedRewrites: Set<ImportRewrite>
): { content: string; changed: boolean } {
  let result = content;
  let changed = false;

  for (const rewrite of IMPORT_REWRITES) {
    const { pattern, replacement } = rewrite;
    pattern.lastIndex = 0;

    if (pattern.test(result)) {
      pattern.lastIndex = 0;
      const before = result;
      result = result.replace(pattern, replacement);
      if (before !== result) {
        changed = true;
        appliedRewrites.add(rewrite);
      }
    }
  }

  return { content: result, changed };
}

/**
 * Process a single file.
 */
function processFile(
  filePath: string,
  relativePath: string,
  stats: RewriteStats,
  options: Options
): void {
  const content = fs.readFileSync(filePath, 'utf8');

  if (!needsRewriting(content)) {
    if (options.verbose) {
      console.log(`  [skip] ${relativePath}`);
    }
    return;
  }

  stats.filesProcessed++;
  const {
    content: rewritten,
    changed,
  } = rewriteContent(content, stats.appliedRewrites);

  if (changed) {
    stats.filesChanged++;
    if (options.dryRun) {
      console.log(`  [would rewrite] ${relativePath}`);
    } else {
      fs.writeFileSync(filePath, rewritten);
      console.log(`  [rewritten] ${relativePath}`);
    }
  }
}

/**
 * Recursively process all .js and .d.ts files in a directory.
 */
function processDirectory(
  dir: string,
  baseDir: string,
  stats: RewriteStats,
  options: Options
): void {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const relativePath = path.relative(baseDir, fullPath);

    if (entry.isDirectory()) {
      processDirectory(fullPath, baseDir, stats, options);
    } else if (entry.isFile() && (entry.name.endsWith('.js') || entry.name.endsWith('.d.ts'))) {
      processFile(fullPath, relativePath, stats, options);
    }
  }
}

/**
 * Delete directories that are no longer needed after import rewriting.
 */
function deleteRewrittenDirs(
  targetDir: string,
  appliedRewrites: Set<ImportRewrite>,
  options: Options
): void {
  const dirsToDelete = new Set<string>();

  for (const rewrite of appliedRewrites) {
    if (rewrite.deleteDir) {
      dirsToDelete.add(rewrite.deleteDir);
    }
  }

  for (const dir of dirsToDelete) {
    const dirPath = path.join(targetDir, dir);
    if (fs.existsSync(dirPath)) {
      if (options.dryRun) {
        console.log(`  [would delete] ${dir}/`);
      } else {
        fs.rmSync(dirPath, { recursive: true });
        console.log(`  [deleted] ${dir}/`);
      }
    }
  }
}

/**
 * Print summary of rewrites applied.
 */
function printSummary(stats: RewriteStats, options: Options): void {
  console.log('');
  if (options.dryRun) {
    console.log('Dry run - no files were modified');
  }

  console.log(`Files processed: ${stats.filesProcessed}`);
  console.log(`Files ${options.dryRun ? 'would be ' : ''}changed: ${stats.filesChanged}`);

  if (stats.appliedRewrites.size > 0) {
    console.log('\nRewrites applied:');
    for (const rewrite of stats.appliedRewrites) {
      console.log(`  - ${rewrite.name}`);
    }
  }
}

function parseArgs(args: string[]): { targetDir: string; options: Options } {
  const options: Options = {
    deleteRewritten: false,
    dryRun: false,
    verbose: false,
  };

  const positionalArgs: string[] = [];

  for (const arg of args) {
    switch (arg) {
      case '--delete-rewritten':
        options.deleteRewritten = true;
        break;
      case '--dry-run':
        options.dryRun = true;
        break;
      case '--verbose':
        options.verbose = true;
        break;
      default:
        if (arg.startsWith('--')) {
          console.error(`Unknown option: ${arg}`);
          process.exit(1);
        } else {
          positionalArgs.push(arg);
        }
    }
  }

  if (positionalArgs.length === 0) {
    console.error('Usage: npx tsx scripts/rewrite-imports.ts <directory> [options]');
    console.error('');
    console.error('Options:');
    console.error('  --delete-rewritten  Delete source directories that were rewritten');
    console.error('  --dry-run           Show what would be changed without modifying');
    console.error('  --verbose           Show all files processed');
    process.exit(1);
  }

  return {
    targetDir: path.resolve(positionalArgs[0]!),
    options,
  };
}

function main() {
  const { targetDir, options } = parseArgs(process.argv.slice(2));

  if (!fs.existsSync(targetDir)) {
    console.error(`Directory not found: ${targetDir}`);
    process.exit(1);
  }

  console.log(`Rewriting imports in: ${targetDir}`);
  if (options.dryRun) {
    console.log('(dry run mode)\n');
  } else {
    console.log('');
  }

  const stats: RewriteStats = {
    filesProcessed: 0,
    filesChanged: 0,
    appliedRewrites: new Set(),
  };

  processDirectory(targetDir, targetDir, stats, options);

  if (options.deleteRewritten && stats.appliedRewrites.size > 0) {
    console.log('\nCleaning up source directories...');
    deleteRewrittenDirs(targetDir, stats.appliedRewrites, options);
  }

  printSummary(stats, options);
}

main();
