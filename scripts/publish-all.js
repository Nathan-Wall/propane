import { execSync } from 'node:child_process';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const distDir = path.join(projectRoot, 'dist');

const packages = [
  'runtime',
  'pms-core',
  'pms-server',
  'pms-client',
  'pms-client-compiler',
  'tools/babel/messages',
  'cli',
  'react',
];

// Get args
const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const version = args.find(arg => /^\d+\.\d+\.\d+/.test(arg));

if (!version) {
  let currentVersion = null;
  try {
    currentVersion = execSync(
      'npm view @propane/runtime version',
      { encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] }
    ).trim();
  } catch {
    // Package not published yet
  }

  console.error('Error: Please provide a version number argument.');
  if (currentVersion) {
    console.error(`Current published version: ${currentVersion}`);
  }
  console.error('Example: npm run publish 1.0.0');
  process.exit(1);
}

if (!/^\d+\.\d+\.\d+$/.test(version)) {
  console.error('Error: Invalid version format. Expected semver (e.g. 1.0.0)');
  process.exit(1);
}

// Sanity check: Natural progression
try {
  console.log('Checking previous version on NPM...');
  // Use runtime as the reference package
  const currentVersion = execSync(
    'npm view @propane/runtime version',
    { encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] }
  ).trim();
  console.log(`Current published version: ${currentVersion}`);

  const [cMajor, cMinor, cPatch] = currentVersion.split('.').map(Number);
  const [nMajor, nMinor, nPatch] = version.split('.').map(Number);

  let isValid = false;
  // Patch increment: 1.2.3 -> 1.2.4
  if (nMajor === cMajor && nMinor === cMinor && nPatch === cPatch + 1) {
    isValid = true;
  } else if (
    nMajor === cMajor
    && nMinor === cMinor + 1
    && nPatch === 0
  ) {
    // Minor increment: 1.2.3 -> 1.3.0
    isValid = true;
  } else if (nMajor === cMajor + 1 && nMinor === 0 && nPatch === 0) {
    // Major increment: 1.2.3 -> 2.0.0
    isValid = true;
  }

  if (!isValid) {
    console.error(
      `Error: Version ${version} is not a natural progression from ${currentVersion}.`
    );
    console.error(
      `Expected one of: ${cMajor}.${cMinor}.${cPatch + 1}, `
      + `${cMajor}.${cMinor + 1}.0, or ${cMajor + 1}.0.0`
    );
    process.exit(1);
  }
} catch {
  console.warn(
    'Could not fetch current version from NPM (or package not published). '
    + 'Skipping progression check.'
  );
}

if (dryRun) {
  console.log('DRY RUN MODE: No packages will be published.');
}

function updatePackageJson(pkgName, version) {
  const pkgPath = path.join(distDir, pkgName, 'package.json');
  if (!fs.existsSync(pkgPath)) return false;

  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
  pkg.version = version;

  // Update dependencies
  if (pkg.dependencies) {
    for (const dep in pkg.dependencies) {
      if (dep.startsWith('@propane/')) {
        pkg.dependencies[dep] = version; // Strict version match for monorepo
      }
    }
  }
  
  // Update peerDependencies
  if (pkg.peerDependencies) {
    for (const dep in pkg.peerDependencies) {
      if (dep.startsWith('@propane/')) {
        pkg.peerDependencies[dep] = version;
      }
    }
  }

  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));
  console.log(`Updated ${pkg.name} package.json version to ${version}`);
  return pkg.name;
}

async function publishPackage(pkgDir) {
  const pkgDistPath = path.join(distDir, pkgDir);
  
  if (!fs.existsSync(pkgDistPath)) {
    console.error(`Error: Distribution directory not found for ${pkgDir} at ${pkgDistPath}`);
    return false;
  }

  const currentDir = process.cwd();
  process.chdir(pkgDistPath);

  // Read name from package.json for logging
  const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const pkgName = pkg.name;

  try {
    const cmd = `npm publish --access public${dryRun ? ' --dry-run' : ''}`;
    console.log(`\nPublishing ${pkgName} from ${pkgDistPath}...`);
    console.log(`> ${cmd}`);
    execSync(cmd, { stdio: 'inherit' });
    console.log(`Successfully published ${pkgName}.`);
    return true;
  } catch (error) {
    console.error(`Failed to publish ${pkgName}: ${error.message}`);
    return false;
  } finally {
    process.chdir(currentDir); // Change back to original directory
  }
}


console.log('Starting NPM publish for all packages...');

let success = true;
for (const pkgDir of packages) {
  // Update version in dist
  const realPkgName = updatePackageJson(pkgDir, version);
  if (!realPkgName) {
    console.error(`Failed to update version for ${pkgDir}`);
    process.exit(1);
  }

  // Publish in order (order matters for dependencies)
  if (!await publishPackage(pkgDir)) {
    success = false;
  }
}

if (success) {
  console.log('\nAll packages published successfully!');
} else {
  console.error('\nSome packages failed to publish.');
  process.exit(1);
}

