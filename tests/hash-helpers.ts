// Simple deterministic string hash (Java-style) that operates on UTF-16 code units.
export function computeExpectedHashCode(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    // eslint-disable-next-line unicorn/prefer-code-point
    hash = (hash * 31 + value.charCodeAt(i)) | 0;
  }
  return hash;
}
