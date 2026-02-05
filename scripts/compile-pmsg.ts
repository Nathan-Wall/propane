/**
 * Compiles all .pmsg files to .pmsg.base.ts plus a re-export .pmsg.ts file
 * using the Babel plugin.
 * This script must be run AFTER the babel plugin has been built.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { TypeAliasMap } from '@/tools/parser/type-aliases.js';
import { compilePmsgFile as compilePmsgBase } from '@/tools/pmsg/compiler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// When running from build/scripts/, go up two levels to reach project root
const projectRoot = path.resolve(__dirname, '../..');

interface PropaneConfig {
  runtimeImportPath?: string;
  messageTypeIdPrefix?: string;
  messageTypeIdRoot?: string;
  typeAliases?: TypeAliasMap;
}

// Load propane config
function loadPropaneConfig(): PropaneConfig {
  const configPath = path.join(projectRoot, 'propane.config.json');
  if (fs.existsSync(configPath)) {
    try {
      return JSON.parse(fs.readFileSync(configPath, 'utf8')) as PropaneConfig;
    } catch {
      return {};
    }
  }
  return {};
}

const propaneConfig = loadPropaneConfig();

// Directories to scan for .pmsg files (test directories only)
// pms-server/src is excluded because response.pmsg.ts is checked in
const scanDirs = [
  'common/numbers',
  'common/data',
  'common/time',
  'common/web',
  'tests',
  'pms-server/tests',
];

// Suffix for files expected to fail (don't compile these)
const failSuffix = '-fail.pmsg';

function findPmsgFiles(dir: string): string[] {
  const fullDir = path.join(projectRoot, dir);
  if (!fs.existsSync(fullDir)) return [];

  const entries = fs.readdirSync(fullDir, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    if (entry.name.startsWith('.')) continue;
    const fullPath = path.join(fullDir, entry.name);

    if (entry.isDirectory()) {
      // Recursively search subdirectories
      const relSubdir = path.join(dir, entry.name);
      files.push(...findPmsgFiles(relSubdir));
    } else if (entry.isFile() && entry.name.endsWith('.pmsg') && !entry.name.endsWith(failSuffix)) {
      files.push(fullPath);
    }
  }

  return files;
}

function compileFile(filePath: string): void {
  const pluginOptions: Record<string, unknown> = {};
  if (propaneConfig.runtimeImportPath) {
    pluginOptions['runtimeImportPath'] = propaneConfig.runtimeImportPath;
    pluginOptions['runtimeImportBase'] = projectRoot;
  }
  if (propaneConfig.messageTypeIdPrefix) {
    pluginOptions['messageTypeIdPrefix'] = propaneConfig.messageTypeIdPrefix;
  }
  if (propaneConfig.messageTypeIdRoot) {
    pluginOptions['messageTypeIdRoot'] = path.resolve(
      projectRoot,
      propaneConfig.messageTypeIdRoot
    );
  }
  if (propaneConfig.typeAliases) {
    pluginOptions['typeAliases'] = propaneConfig.typeAliases;
  }

  compilePmsgBase(filePath, {
    rootDir: projectRoot,
    runtimeImportPath: pluginOptions['runtimeImportPath'] as string | undefined,
    runtimeImportBase: pluginOptions['runtimeImportBase'] as string | undefined,
    messageTypeIdPrefix: pluginOptions['messageTypeIdPrefix'] as string | undefined,
    messageTypeIdRoot: pluginOptions['messageTypeIdRoot'] as string | undefined,
    typeAliases: pluginOptions['typeAliases'] as TypeAliasMap | undefined,
  });

  console.log(`Compiled: ${path.relative(projectRoot, filePath)}`);
}

// Find and compile all .pmsg files
const allFiles: string[] = [];
for (const dir of scanDirs) {
  allFiles.push(...findPmsgFiles(dir));
}

let errorCount = 0;
for (const file of allFiles) {
  try {
    compileFile(file);
  } catch (err) {
    console.error(`Error compiling ${file}: ${(err as Error).message}`);
    errorCount++;
  }
}

if (errorCount > 0) {
  process.exit(1);
}

console.log(`Compiled ${allFiles.length} .pmsg files`);
