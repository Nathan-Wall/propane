/**
 * String Character Length Helper
 *
 * Provides Unicode-aware character length counting for validation.
 */

/**
 * Count the number of Unicode characters (code points) in a string.
 *
 * Unlike `string.length` which counts UTF-16 code units, this function
 * correctly handles surrogate pairs and emoji sequences.
 *
 * @param value - The string to measure
 * @returns The number of Unicode code points
 *
 * @example
 * ```typescript
 * charLength('hello');     // 5
 * charLength('👋');         // 1 (string.length would be 2)
 * charLength('🏳️‍🌈');        // 4 (flag emoji - multiple code points)
 * charLength('café');      // 4
 * ```
 */
export function charLength(value: string): number {
  return [...value].length;
}
