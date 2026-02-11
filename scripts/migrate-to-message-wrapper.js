#!/usr/bin/env node
/**
 * Migration script to convert @message decorator syntax to Message<T> wrapper.
 *
 * This script:
 * 1. Adds `import { Message } from '@propane/runtime';` if not present
 * 2. Converts `// @message\nexport type Foo = { ... };` to `export type Foo = Message<{ ... }>;`
 * 3. Removes `// @message` from Endpoint<{...}, R> types (they're already wrappers)
 */

import fs from 'node:fs';
import path from 'node:path';

// Find all .pmsg files
function findPmsgFiles(dir, files = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!entry.name.includes('node_modules') && !entry.name.includes('build')) {
        findPmsgFiles(fullPath, files);
      }
    } else if (entry.name.endsWith('.pmsg')) {
      files.push(fullPath);
    }
  }
  return files;
}

function migrateFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  // Check if already has Message import from @propane/runtime
  const hasPropaneRuntimeImport =
    /import\s+\{[^}]*\bMessage\b[^}]*\}\s+from\s+['"]@propanejs\/runtime['"]/
      .test(content);
  const hasInternalRuntimeImport =
    /import\s+\{[^}]*\bMessage\b[^}]*\}\s+from\s+['"]@\/runtime/
      .test(content);
  const hasMessageImport = hasPropaneRuntimeImport || hasInternalRuntimeImport;

  // Check if file uses @message decorator
  const hasMessageDecorator = /\/\/\s*@message/.test(content);

  if (!hasMessageDecorator) {
    console.log(`Skipping ${filePath} - no @message decorator found`);
    return false;
  }

  // Track if we need to add Message import
  let needsMessageImport = false;

  // Pattern 1: // @message on its own line followed by export type Foo = { ... };
  // Convert to: export type Foo = Message<{ ... }>;
  const objectLiteralPattern = new RegExp(
    String.raw`\/\/\s*@message\s*\n`
      + String.raw`(\s*)`
      + String.raw`(export\s+type\s+(\w+)(?:<[^>]+>)?\s*=\s*)`
      + String.raw`(\{[\s\S]*?\});`,
    'g',
  );

  content = content.replaceAll(
    objectLiteralPattern,
    (unused_match, indent, prefix, unused_typeName, objectLiteral) => {
      modified = true;
      needsMessageImport = true;
      return `${indent}${prefix}Message<${objectLiteral}>;`;
    },
  );

  // Pattern 2: // @message @extend('./path') on same line followed by export type
  const extendPattern = new RegExp(
    String.raw`\/\/\s*@message\s+(@extend\([^)]+\))\s*\n`
      + String.raw`(\s*)`
      + String.raw`(export\s+type\s+(\w+)(?:<[^>]+>)?\s*=\s*)`
      + String.raw`(\{[\s\S]*?\});`,
    'g',
  );

  content = content.replaceAll(
    extendPattern,
    (
      unused_match,
      extendDecorator,
      indent,
      prefix,
      unused_typeName,
      objectLiteral,
    ) => {
      modified = true;
      needsMessageImport = true;
      return `// ${extendDecorator}\n${indent}${prefix}Message<${objectLiteral}>;`;
    },
  );

  // Pattern 3: // @message with Endpoint<{...}, R> - just remove @message
  const endpointPattern = new RegExp(
    String.raw`\/\/\s*@message\s*\n`
      + String.raw`(\s*export\s+type\s+\w+(?:<[^>]+>)?\s*=\s*`
      + String.raw`(?:Endpoint|PmsRequest)<)`,
    'g',
  );

  content = content.replaceAll(
    endpointPattern,
    (unused_match, afterMessage) => {
      modified = true;
      return afterMessage;
    },
  );

  // Pattern 4: // @message @extend on same line with Endpoint
  const endpointExtendPattern = new RegExp(
    String.raw`\/\/\s*@message\s+(@extend\([^)]+\))\s*\n`
      + String.raw`(\s*export\s+type\s+\w+(?:<[^>]+>)?\s*=\s*`
      + String.raw`(?:Endpoint|PmsRequest)<)`,
    'g',
  );

  content = content.replaceAll(
    endpointExtendPattern,
    (unused_match, extendDecorator, afterMessage) => {
      modified = true;
      return `// ${extendDecorator}\n${afterMessage}`;
    },
  );

  // Add Message import if needed and not already present
  if (needsMessageImport && !hasMessageImport) {
    // Check for existing runtime imports to add Message to
    const runtimeImportPattern = new RegExp(
      String.raw`import\s+\{([^}]+)\}\s+from\s+`
        + String.raw`(['"]@(?:propanejs\/)?runtime[^'"]*['"])`,
    );
    const runtimeMatch = content.match(runtimeImportPattern);

    if (runtimeMatch) {
      // Add Message to existing runtime import
      const existingImports = runtimeMatch[1];
      if (!existingImports.includes('Message')) {
        content = content.replace(
          runtimeImportPattern,
          `import { Message, ${existingImports.trim()} } from ${runtimeMatch[2]}`
        );
      }
    } else {
      // Add new import at the top after any existing imports
      const importPattern = /^(import\s+.+\n)+/m;
      const importMatch = content.match(importPattern);

      // Add after existing imports, or at top when no imports exist.
      content = importMatch
        ? content.replace(
          importPattern,
          `${importMatch[0]}import { Message } from '@propane/runtime';\n`,
        )
        : `import { Message } from '@propane/runtime';\n\n${content}`;
    }
    modified = true;
  }

  if (modified) {
    fs.writeFileSync(filePath, content);
    console.log(`Migrated: ${filePath}`);
    return true;
  }

  console.log(`No changes needed: ${filePath}`);
  return false;
}

// Main
const rootDir = process.argv[2] || path.resolve(import.meta.dirname, '..');
console.log(`Scanning for .pmsg files in: ${rootDir}\n`);

const files = findPmsgFiles(rootDir);
console.log(`Found ${files.length} .pmsg files\n`);

let migratedCount = 0;
for (const file of files) {
  if (migrateFile(file)) {
    migratedCount++;
  }
}

console.log(`\nMigration complete: ${migratedCount} files updated`);
