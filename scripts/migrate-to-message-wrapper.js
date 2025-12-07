#!/usr/bin/env node
/**
 * Migration script to convert @message decorator syntax to Message<T> wrapper.
 *
 * This script:
 * 1. Adds `import { Message } from '@propanejs/runtime';` if not present
 * 2. Converts `// @message\nexport type Foo = { ... };` to `export type Foo = Message<{ ... }>;`
 * 3. Removes `// @message` from Endpoint<{...}, R> types (they're already wrappers)
 */

import fs from 'fs';
import path from 'path';

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

  // Check if already has Message import from @propanejs/runtime
  const hasMessageImport = /import\s+\{[^}]*\bMessage\b[^}]*\}\s+from\s+['"]@propanejs\/runtime['"]/.test(content)
    || /import\s+\{[^}]*\bMessage\b[^}]*\}\s+from\s+['"]@\/runtime/.test(content);

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
  const objectLiteralPattern = /\/\/\s*@message\s*\n(\s*)(export\s+type\s+(\w+)(?:<[^>]+>)?\s*=\s*)(\{[\s\S]*?\});/g;

  content = content.replace(objectLiteralPattern, (match, indent, prefix, typeName, objectLiteral) => {
    modified = true;
    needsMessageImport = true;
    return `${indent}${prefix}Message<${objectLiteral}>;`;
  });

  // Pattern 2: // @message @extend('./path') on same line followed by export type
  const extendPattern = /\/\/\s*@message\s+(@extend\([^)]+\))\s*\n(\s*)(export\s+type\s+(\w+)(?:<[^>]+>)?\s*=\s*)(\{[\s\S]*?\});/g;

  content = content.replace(extendPattern, (match, extendDecorator, indent, prefix, typeName, objectLiteral) => {
    modified = true;
    needsMessageImport = true;
    return `// ${extendDecorator}\n${indent}${prefix}Message<${objectLiteral}>;`;
  });

  // Pattern 3: // @message with Endpoint<{...}, R> - just remove @message
  const endpointPattern = /\/\/\s*@message\s*\n(\s*export\s+type\s+\w+(?:<[^>]+>)?\s*=\s*(?:Endpoint|PmsRequest)<)/g;

  content = content.replace(endpointPattern, (match, afterMessage) => {
    modified = true;
    return afterMessage;
  });

  // Pattern 4: // @message @extend on same line with Endpoint
  const endpointExtendPattern = /\/\/\s*@message\s+(@extend\([^)]+\))\s*\n(\s*export\s+type\s+\w+(?:<[^>]+>)?\s*=\s*(?:Endpoint|PmsRequest)<)/g;

  content = content.replace(endpointExtendPattern, (match, extendDecorator, afterMessage) => {
    modified = true;
    return `// ${extendDecorator}\n${afterMessage}`;
  });

  // Add Message import if needed and not already present
  if (needsMessageImport && !hasMessageImport) {
    // Check for existing runtime imports to add Message to
    const runtimeImportPattern = /import\s+\{([^}]+)\}\s+from\s+(['"]@(?:propanejs\/)?runtime[^'"]*['"])/;
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

      if (importMatch) {
        // Add after existing imports
        content = content.replace(
          importPattern,
          `${importMatch[0]}import { Message } from '@propanejs/runtime';\n`
        );
      } else {
        // Add at the very top
        content = `import { Message } from '@propanejs/runtime';\n\n${content}`;
      }
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
