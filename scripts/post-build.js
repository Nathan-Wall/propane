import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const buildDir = path.join(projectRoot, 'build');
const distDir = path.join(projectRoot, 'dist');

const packages = ['runtime', 'pms-core', 'pms-server', 'pms-client', 'tools/babel/messages', 'cli', 'react'];

// Packages with src/ subdirectory have different output structure
const packagesWithSrc = new Set(['pms-core', 'pms-server', 'pms-client']);

// 1. Copy package.json to build/ and update main
for (const pkgDir of packages) {
  const srcDir = path.join(projectRoot, pkgDir);
  const destDir = path.join(buildDir, pkgDir);
  
  if (!fs.existsSync(destDir)) {
    console.warn(`Build directory for ${pkgDir} not found.`);
    continue;
  }

  const pkgJson = JSON.parse(fs.readFileSync(path.join(srcDir, 'package.json'), 'utf8'));
  
  // Point to the built file in the same directory
  if (packagesWithSrc.has(pkgDir)) {
    pkgJson.main = 'src/index.js';
    pkgJson.types = 'src/index.d.ts';
  } else {
    pkgJson.main = 'index.js';
    pkgJson.types = 'index.d.ts';
  }
  if (pkgJson.bin) {
    if (typeof pkgJson.bin === 'string') {
      pkgJson.bin = 'index.js';
    } else {
      for (const k in pkgJson.bin) {
        pkgJson.bin[k] = 'index.js';
      }
    }
  }
  
  // Remove dev scripts/config
  delete pkgJson.scripts;
  delete pkgJson.devDependencies;
  delete pkgJson.private; // Ensure built packages are public

  fs.writeFileSync(path.join(destDir, 'package.json'), JSON.stringify(pkgJson, null, 2));
  
  // Copy meta files
  for (const f of ['README.md', 'LICENSE']) {
    if (fs.existsSync(path.join(srcDir, f))) {
      fs.copyFileSync(path.join(srcDir, f), path.join(destDir, f));
    }
  }
}

// 2. Re-link node_modules to point to build/
const nodeModulesScope = path.join(projectRoot, 'node_modules', '@propanejs');
if (fs.existsSync(nodeModulesScope)) {
  for (const pkgDir of packages) {
    const srcDir = path.join(projectRoot, pkgDir);
    const pkgJson = JSON.parse(fs.readFileSync(path.join(srcDir, 'package.json'), 'utf8'));
    const pkgName = pkgJson.name.split('/')[1]; // e.g. babel-messages

    const linkPath = path.join(nodeModulesScope, pkgName);
    // Link: node_modules/@propanejs/babel-messages
    // Target: build/tools/babel/messages
    // Path: ../../build/tools/babel/messages
    // This assumes scope dir is one level deep in node_modules.
    const targetPath = path.join('..', '..', 'build', pkgDir);
    
    try {
      // Force remove existing link/file to ensure clean state
      try {
        if (
          fs.existsSync(linkPath)
          || fs.lstatSync(linkPath).isSymbolicLink()
        ) {
           // Try unlink first (for file/symlink)
           try {
             fs.unlinkSync(linkPath);
           } catch {
             // If unlink fails (e.g. directory), try rmSync
             fs.rmSync(linkPath, { recursive: true, force: true });
           }
        }
      } catch {
        // Ignore errors during cleanup
      }
      
      fs.symlinkSync(targetPath, linkPath, 'dir');
      console.log(`Linked node_modules/@propanejs/${pkgName} -> build/${pkgDir}`);
    } catch (e) {
      console.error(`Failed to link ${pkgName}: ${e.message}`);
    }
  }
}

// 3. Create dist/ (Publishable artifacts)
// Simply copy build/ to dist/
if (fs.existsSync(distDir)) {
  fs.rmSync(distDir, { recursive: true, force: true });
}
fs.cpSync(buildDir, distDir, { recursive: true });
console.log('Build artifacts copied to dist/');
