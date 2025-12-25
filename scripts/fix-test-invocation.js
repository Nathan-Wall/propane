#!/usr/bin/env node
/**
 * Fix test files that export a function but never invoke it.
 * Adds a node:test wrapper to call the exported function.
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { globSync } from 'node:fs';

const testFiles = globSync('tests/*.test.ts').filter(f => {
  const content = readFileSync(f, 'utf8');
  return content.includes('export default function') && !content.includes("from 'node:test'");
});

console.log(`Found ${testFiles.length} test files to fix:\n`);

for (const file of testFiles) {
  const content = readFileSync(file, 'utf8');

  // Extract the function name from "export default function runXTests()"
  const match = content.match(/export default function (\w+)\(/);
  if (!match) {
    console.log(`  SKIP: ${file} - couldn't find function name`);
    continue;
  }

  const funcName = match[1];

  // Check if already has the wrapper
  if (content.includes(`test('${funcName}'`)) {
    console.log(`  SKIP: ${file} - already has wrapper`);
    continue;
  }

  // Add import at the top (after other imports)
  let newContent = content;

  // Find the last import statement
  const importRegex = /^import .+;$/gm;
  let lastImportEnd = 0;
  let importMatch;
  while ((importMatch = importRegex.exec(content)) !== null) {
    lastImportEnd = importMatch.index + importMatch[0].length;
  }

  if (lastImportEnd > 0) {
    // Insert after last import
    newContent = content.slice(0, lastImportEnd) +
      "\nimport { test } from 'node:test';" +
      content.slice(lastImportEnd);
  } else {
    // No imports, add at top
    newContent = "import { test } from 'node:test';\n" + content;
  }

  // Add test wrapper at the end
  newContent = newContent.trimEnd() + `\n\ntest('${funcName}', () => {\n  ${funcName}();\n});\n`;

  writeFileSync(file, newContent);
  console.log(`  FIXED: ${file} - added wrapper for ${funcName}()`);
}

console.log('\nDone!');
