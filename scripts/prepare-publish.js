import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

const packages = ['runtime', 'babel', 'cli'];

for (const pkgName of packages) {
  console.log(`Preparing ${pkgName} for distribution...`);
  
  const srcDir = path.join(projectRoot, pkgName);
  const distDir = path.join(projectRoot, 'dist', pkgName);
  
  if (!fs.existsSync(distDir)) {
    console.error(`Error: Dist directory not found for ${pkgName}. Did you run build?`);
    continue;
  }

  // Read source package.json
  const pkgJsonPath = path.join(srcDir, 'package.json');
  const pkgJson = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf8'));

  // Transform package.json
  const distPkgJson = { ...pkgJson };
  
  // Fix paths
  if (distPkgJson.main) {
    distPkgJson.main = path.basename(distPkgJson.main);
  }
  if (distPkgJson.types) {
    distPkgJson.types = path.basename(distPkgJson.types);
  }
  if (distPkgJson.bin) {
    if (typeof distPkgJson.bin === 'string') {
      distPkgJson.bin = path.basename(distPkgJson.bin);
    } else {
      for (const key in distPkgJson.bin) {
        distPkgJson.bin[key] = path.basename(distPkgJson.bin[key]);
      }
    }
  }

  // Rewrite dependencies to point to file:../<pkg> for local testing of dist packages
  if (distPkgJson.dependencies) {
    for (const dep in distPkgJson.dependencies) {
      if (dep.startsWith('@propane/')) {
        const depName = dep.split('/')[1];
        distPkgJson.dependencies[dep] = `file:../${depName}`;
      }
    }
  }

  // Remove scripts (optional, but good practice)
  delete distPkgJson.scripts;
  
  // Set files (if not present or cleanup) - usually in dist we just want everything there
  // or specific files. Since we are IN dist, we can probably omit 'files' or set it to include everything.
  distPkgJson.files = ['**/*'];

  // Write to dist
  fs.writeFileSync(
    path.join(distDir, 'package.json'), 
    JSON.stringify(distPkgJson, null, 2)
  );

  // Copy README and LICENSE if they exist
  for (const file of ['README.md', 'LICENSE']) {
    const srcFile = path.join(srcDir, file);
    if (fs.existsSync(srcFile)) {
      fs.copyFileSync(srcFile, path.join(distDir, file));
    } else {
        // check root
        const rootFile = path.join(projectRoot, file);
        if (fs.existsSync(rootFile)) {
             fs.copyFileSync(rootFile, path.join(distDir, file));
        }
    }
  }
}

// Ensure node_modules/@propane/dist symlink exists for local resolution
const nodeModulesScope = path.join(projectRoot, 'node_modules', '@propanejs');
if (fs.existsSync(nodeModulesScope)) {
    const distLink = path.join(nodeModulesScope, 'dist');
    if (!fs.existsSync(distLink)) {
        try {
            // Symlink to ../../dist
            fs.symlinkSync('../../dist', distLink, 'dir');
            console.log('Created symlink node_modules/@propane/dist -> ../../dist');
        } catch (e) {
            console.warn('Failed to create dist symlink in node_modules:', e.message);
        }
    }
}

console.log('Packages ready for distribution in dist/');
