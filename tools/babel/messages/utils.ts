import path from 'node:path';
import { singularize, pluralize } from '@/common/strings/pluralize.js';

export { singularize, pluralize };

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

/**
 * Get singular and plural forms of a property name.
 *
 * For plural names (e.g., "tags"), returns { singular: "tag", plural: "tags" }.
 * For singular names (e.g., "tag"), returns { singular: "tag", plural: "tags" }.
 */
export function getSingularPlural(name: string): { singular: string; plural: string } {
  const singular = singularize(name);
  if (singular !== name) {
    // Name is already plural (e.g., "tags" → singular "tag")
    return { singular, plural: name };
  }
  // Name is singular (e.g., "tag" → plural "tags")
  return { singular: name, plural: pluralize(name) };
}
