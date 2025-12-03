/**
 * Calculate the Levenshtein distance between two strings.
 * Returns the minimum number of single-character edits (insertions,
 * deletions, or substitutions) required to change one string into the other.
 */
export function levenshteinDistance(a: string, b: string): number {
  const m = a.length;
  const n = b.length;

  // Create a matrix of distances and initialize base cases
  const dp: number[][] = [];
  for (let i = 0; i <= m; i++) {
    const r: number[] = [];
    for (let j = 0; j <= n; j++) {
      r.push(i === 0 ? j : j === 0 ? i : 0);
    }
    dp.push(r);
  }

  // Fill in the rest of the matrix
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1] === b[j - 1]) {
        dp[i]![j] = dp[i - 1]![j - 1]!;
      } else {
        dp[i]![j] = 1 + Math.min(
          dp[i - 1]![j]!,     // deletion
          dp[i]![j - 1]!,     // insertion
          dp[i - 1]![j - 1]!  // substitution
        );
      }
    }
  }

  return dp[m]![n]!;
}
