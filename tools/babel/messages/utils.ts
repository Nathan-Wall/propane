import path from 'node:path';

export function capitalize(name: string): string {
  if (!name) {
    return '';
  }
  return name.charAt(0).toUpperCase() + name.slice(1);
}

export function pathTransform(filename: string): string {
  const relative = path.relative(process.cwd(), filename);
  const normalized = relative && !relative.startsWith('..')
    ? relative
    : filename;
  return normalized.split(path.sep).join('/');
}

/**
 * Compute a relative path from a source file to a target file.
 * Ensures the result starts with './' or '../'.
 */
export function computeRelativePath(fromFile: string, toFile: string): string {
  const fromDir = path.dirname(fromFile);
  let relativePath = path.relative(fromDir, toFile);

  // Ensure path starts with ./ or ../
  if (!relativePath.startsWith('.')) {
    relativePath = './' + relativePath;
  }

  // Normalize to forward slashes
  return relativePath.replaceAll('\\', '/');
}
