/**
 * Simple English pluralization for programming identifiers.
 *
 * Handles common cases encountered in code generation:
 * - Regular nouns: User → Users, Post → Posts
 * - Nouns ending in consonant + y: Category → Categories
 * - Nouns ending in vowel + y: Key → Keys, Day → Days
 * - Nouns ending in s, x, z, ch, sh: Status → Statuses, Box → Boxes
 * - Common irregulars: Person → People, Child → Children
 *
 * This is intentionally simple - it's designed for code identifiers,
 * not comprehensive English pluralization.
 */

/**
 * Common irregular plurals encountered in programming.
 */
const IRREGULARS: Record<string, string> = {
  person: 'people',
  child: 'children',
  man: 'men',
  woman: 'women',
  foot: 'feet',
  tooth: 'teeth',
  goose: 'geese',
  mouse: 'mice',
  ox: 'oxen',
  index: 'indices',
  vertex: 'vertices',
  matrix: 'matrices',
  axis: 'axes',
  crisis: 'crises',
  thesis: 'theses',
  analysis: 'analyses',
  diagnosis: 'diagnoses',
  datum: 'data',
  medium: 'media',
  criterion: 'criteria',
  phenomenon: 'phenomena',
};

/**
 * Words that are the same in singular and plural.
 */
const UNCOUNTABLE = new Set([
  'sheep',
  'fish',
  'deer',
  'moose',
  'series',
  'species',
  'aircraft',
  'software',
  'hardware',
  'information',
  'equipment',
  'news',
  'metadata',
  'data', // Often used as uncountable in programming
]);

/**
 * Check if a character is a vowel.
 */
function isVowel(char: string): boolean {
  return 'aeiou'.includes(char.toLowerCase());
}

/**
 * Pluralize an English word.
 *
 * @param word - The singular word to pluralize
 * @returns The plural form
 *
 * @example
 * pluralize('User')      // 'Users'
 * pluralize('Category')  // 'Categories'
 * pluralize('Status')    // 'Statuses'
 * pluralize('Key')       // 'Keys'
 * pluralize('Person')    // 'People'
 */
export function pluralize(word: string): string {
  if (word.length === 0) return word;

  const lower = word.toLowerCase();

  // Check uncountable words
  if (UNCOUNTABLE.has(lower)) {
    return word;
  }

  // Check irregular plurals
  const irregular = IRREGULARS[lower];
  if (irregular) {
    // Preserve original casing style
    if (word[0] === word[0]?.toUpperCase()) {
      return irregular.charAt(0).toUpperCase() + irregular.slice(1);
    }
    return irregular;
  }

  // Get the last character and last two characters
  const lastChar = word.slice(-1);
  const lastTwo = word.slice(-2);

  // Words ending in 's', 'x', 'z', 'ch', 'sh' -> add 'es'
  if (
    lastChar === 's' ||
    lastChar === 'x' ||
    lastChar === 'z' ||
    lastTwo === 'ch' ||
    lastTwo === 'sh'
  ) {
    return word + 'es';
  }

  // Words ending in consonant + 'y' -> change 'y' to 'ies'
  if (lastChar === 'y' && word.length > 1) {
    const secondToLast = word.charAt(word.length - 2);
    if (!isVowel(secondToLast)) {
      return word.slice(0, -1) + 'ies';
    }
  }

  // Words ending in 'f' or 'fe' -> change to 'ves' (common cases)
  if (lastTwo === 'fe') {
    return word.slice(0, -2) + 'ves';
  }
  if (lastChar === 'f' && !lower.endsWith('roof') && !lower.endsWith('proof')) {
    return word.slice(0, -1) + 'ves';
  }

  // Words ending in 'o' preceded by consonant -> add 'es' (common cases)
  if (lastChar === 'o' && word.length > 1) {
    const secondToLast = word.charAt(word.length - 2);
    if (!isVowel(secondToLast)) {
      // Exceptions that just add 's'
      const oExceptions = ['photo', 'piano', 'memo', 'logo', 'zero', 'pro'];
      if (!oExceptions.some((e) => lower.endsWith(e))) {
        return word + 'es';
      }
    }
  }

  // Default: add 's'
  return word + 's';
}

/**
 * Singularize an English word.
 *
 * Note: This is a best-effort implementation. Some words may not
 * singularize correctly due to ambiguity (e.g., "data" could be
 * singular "datum" or already singular).
 *
 * @param word - The plural word to singularize
 * @returns The singular form
 *
 * @example
 * singularize('Users')      // 'User'
 * singularize('Categories') // 'Category'
 * singularize('Statuses')   // 'Status'
 * singularize('People')     // 'Person'
 */
export function singularize(word: string): string {
  if (word.length === 0) return word;

  const lower = word.toLowerCase();

  // Check uncountable words
  if (UNCOUNTABLE.has(lower)) {
    return word;
  }

  // Check irregular plurals (reverse lookup)
  for (const [singular, plural] of Object.entries(IRREGULARS)) {
    if (lower === plural) {
      // Preserve original casing style
      if (word[0] === word[0]?.toUpperCase()) {
        return singular.charAt(0).toUpperCase() + singular.slice(1);
      }
      return singular;
    }
  }

  // Words ending in 'ies' -> change to 'y'
  if (word.endsWith('ies') && word.length > 3) {
    return word.slice(0, -3) + 'y';
  }

  // Words ending in 'ves' -> change to 'f' or 'fe'
  if (word.endsWith('ves') && word.length > 3) {
    const base = word.slice(0, -3);
    // Common 'fe' endings
    if (['li', 'wi', 'kni'].some((e) => base.toLowerCase().endsWith(e))) {
      return base + 'fe';
    }
    return base + 'f';
  }

  // Words ending in 'es' (but not 'ies' or 'ves')
  if (word.endsWith('es') && word.length > 2) {
    const withoutEs = word.slice(0, -2);
    const lastChar = withoutEs.slice(-1);
    const lastTwo = withoutEs.slice(-2);

    // If base ends in s, x, z, ch, sh -> remove 'es'
    if (
      lastChar === 's' ||
      lastChar === 'x' ||
      lastChar === 'z' ||
      lastTwo === 'ch' ||
      lastTwo === 'sh'
    ) {
      return withoutEs;
    }

    // If base ends in consonant + 'o' -> remove 'es'
    if (lastChar === 'o' && withoutEs.length > 1) {
      const secondToLast = withoutEs.charAt(withoutEs.length - 2);
      if (!isVowel(secondToLast)) {
        return withoutEs;
      }
    }
  }

  // Words ending in 's' (but not 'ss', 'us', 'is') -> remove 's'
  if (word.endsWith('s') && word.length > 1) {
    const withoutS = word.slice(0, -1);
    const lastTwo = word.slice(-2);

    // Don't singularize words ending in 'ss', 'us', 'is'
    if (lastTwo !== 'ss' && lastTwo !== 'us' && lastTwo !== 'is') {
      return withoutS;
    }
  }

  // Default: return as-is
  return word;
}
