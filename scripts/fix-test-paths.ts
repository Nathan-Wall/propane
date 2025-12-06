/**
 * Fix relative paths in test files after tsc/tsc-alias compilation.
 *
 * Problems this script fixes:
 * 1. Source files have paths relative to source structure, but build output
 *    has different structure (build/tests vs tests/)
 * 2. tsc-alias can generate incorrect relative paths for nested directories
 * 3. react imports get resolved to @types/react instead of the actual package
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '../..');
const buildDir = path.join(projectRoot, 'build');

interface TestDir {
  path: string;
  depthFromBuild: number;
}

const testDirs: TestDir[] = [
  { path: path.join(buildDir, 'tests'), depthFromBuild: 1 },
  { path: path.join(buildDir, 'pms-server/tests'), depthFromBuild: 2 },
];

function fixPathsInDir(dir: string, depthFromBuild: number): void {
  if (!fs.existsSync(dir)) return;

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      fixPathsInDir(fullPath, depthFromBuild + 1);
    } else if (entry.isFile() && entry.name.endsWith('.js')) {
      fixFile(fullPath, depthFromBuild);
    }
  }
}

function fixFile(filePath: string, depthFromBuild: number): void {
  let content = fs.readFileSync(filePath, 'utf8');
  const original = content;

  // Fix react imports that incorrectly resolve to @types/react
  // Note: Split "react" to prevent tsc-alias from mangling this string literal
  const reactImport = 'from "re' + 'act"';
  content = content.replaceAll(
    /from ['"]\.\.\/.*node_modules\/@types\/react['"]/g,
    reactImport
  );

  // Fix paths based on depth
  if (depthFromBuild === 1) {
    // build/tests/ → files have ../../ paths that need to become ../
    content = content.replaceAll('../../runtime/', '../runtime/');
    content = content.replaceAll('../../common/', '../runtime/common/');
  } else if (depthFromBuild === 2) {
    // build/pms-server/tests/ → files may have incorrect paths from tsc-alias

    // Fix runtime paths (../../../runtime/ should be ../../runtime/)
    content = content.replaceAll('../../../runtime/', '../../runtime/');
    // Also handle ../runtime/ if it exists (should be ../../runtime/)
    // Use negative lookbehind to avoid matching ../../runtime/ which is already correct
    content = content.replaceAll(/(?<!\.\.\/)\.\.\/runtime\//gm, '../../runtime/');

    // Fix pms-server paths (../../../pms-server/ → ../ for same package)
    content = content.replaceAll('../../../pms-server/', '../');

    // Fix pms-client paths (../../../pms-client/ → ../../pms-client/)
    content = content.replaceAll('../../../pms-client/', '../../pms-client/');

    // Fix pms-core paths (../../../pms-core/ → ../../pms-core/)
    content = content.replaceAll('../../../pms-core/', '../../pms-core/');
  }

  // Add .js extension to .pmsg imports that are missing it
  content = content.replaceAll(
    /(from\s+['"])([^'"]+\.pmsg)(['"])/g,
    '$1$2.js$3'
  );

  // Add .js extension to runtime imports that are missing it
  content = content.replaceAll(
    /(from\s+['"])(\.\.\/(?:\.\.\/)*runtime\/[^'"]+)(?<!\.js)(['"])/g,
    '$1$2.js$3'
  );

  // Write only if content changed
  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
  }
}

for (const { path: dir, depthFromBuild } of testDirs) {
  fixPathsInDir(dir, depthFromBuild);
}

console.log('Fixed relative paths in test files');
