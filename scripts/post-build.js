import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const buildDir = path.join(projectRoot, 'build');
const distDir = path.join(projectRoot, 'dist');

const packages = ['runtime', 'babel', 'cli'];

// 1. Copy package.json to build/ and update main
packages.forEach(pkgName => {
  const srcDir = path.join(projectRoot, pkgName);
  const destDir = path.join(buildDir, pkgName);
  
  if (!fs.existsSync(destDir)) {
    console.warn(`Build directory for ${pkgName} not found.`);
    return;
  }

  const pkgJson = JSON.parse(fs.readFileSync(path.join(srcDir, 'package.json'), 'utf8'));
  
  // Point to the built file in the same directory
  pkgJson.main = 'index.js';
  pkgJson.types = 'index.d.ts';
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
  ['README.md', 'LICENSE'].forEach(f => {
    if (fs.existsSync(path.join(srcDir, f))) {
      fs.copyFileSync(path.join(srcDir, f), path.join(destDir, f));
    }
  });
});

// 2. Re-link node_modules to point to build/
// This makes local development usage (e.g. running build/cli/index.js) work
// because it finds dependencies in node_modules which now point to valid packages in build/
const nodeModulesScope = path.join(projectRoot, 'node_modules', '@propanejs');
if (fs.existsSync(nodeModulesScope)) {
  packages.forEach(pkgName => {
    const linkPath = path.join(nodeModulesScope, pkgName);
    const targetPath = path.join('..', '..', 'build', pkgName);
    
    try {
      if (fs.existsSync(linkPath)) {
        fs.unlinkSync(linkPath);
      }
      fs.symlinkSync(targetPath, linkPath, 'dir');
      console.log(`Linked node_modules/@propanejs/${pkgName} -> build/${pkgName}`);
    } catch (e) {
      console.error(`Failed to link ${pkgName}: ${e.message}`);
    }
  });
}

// 3. Create dist/ (Publishable artifacts)
// Simply copy build/ to dist/
if (fs.existsSync(distDir)) {
  fs.rmSync(distDir, { recursive: true, force: true });
}
fs.cpSync(buildDir, distDir, { recursive: true });
console.log('Build artifacts copied to dist/');
