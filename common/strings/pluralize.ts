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
  // Germanic irregulars
  person: 'people',
  child: 'children',
  man: 'men',
  woman: 'women',
  foot: 'feet',
  tooth: 'teeth',
  goose: 'geese',
  mouse: 'mice',
  ox: 'oxen',
  die: 'dice',
  // Latin -ex/-ix → -ices
  index: 'indices',
  vertex: 'vertices',
  matrix: 'matrices',
  appendix: 'appendices',
  apex: 'apices',
  helix: 'helices',
  vortex: 'vortices',
  codex: 'codices',
  cortex: 'cortices',
  // Latin -is → -es
  axis: 'axes',
  crisis: 'crises',
  thesis: 'theses',
  analysis: 'analyses',
  diagnosis: 'diagnoses',
  basis: 'bases',
  hypothesis: 'hypotheses',
  parenthesis: 'parentheses',
  synopsis: 'synopses',
  // Latin -us → -i
  focus: 'foci',
  radius: 'radii',
  cactus: 'cacti',
  nucleus: 'nuclei',
  fungus: 'fungi',
  stimulus: 'stimuli',
  alumnus: 'alumni',
  syllabus: 'syllabi',
  // Latin -um → -a
  datum: 'data',
  medium: 'media',
  criterion: 'criteria',
  phenomenon: 'phenomena',
  curriculum: 'curricula',
  memorandum: 'memoranda',
  // Latin -a → -ae
  antenna: 'antennae',
  formula: 'formulae',
  larva: 'larvae',
  // Greek -on → -a
  automaton: 'automata',
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
 * Words ending in 's' that are already singular (not plurals).
 * These should not have the 's' stripped by singularize().
 */
const SINGULAR_S_WORDS = new Set([
  // Words ending in -as
  'alias',
  'atlas',
  'bias',
  'canvas',
  'gas',
  'texas',
  // Words ending in -os
  'chaos',
  'cosmos',
  'ethos',
  'pathos',
  'logos',
  'rhinoceros',
  // Words ending in -is (not covered by -is rule since they're singular)
  'cannabis',
  'tennis',
  // Words ending in -us (already protected but listing for clarity)
  // 'bus', 'plus', 'thus', 'campus' - protected by 'us' rule
  // Other singular words ending in s
  'lens',
  'corps',
  'chassis',
  'debris',
  'apropos',
  'biceps',
  'triceps',
  'herpes',
  'rabies',
  'series', // also in uncountable
  'species', // also in uncountable
  // Tech acronyms ending in S (singular)
  'gps',
  'sms',
  'mms',
  'sos',
  'aws',
  'gcs', // Google Cloud Storage
  'dns',
  'nfs',
  'os',
  'ios',
  'macos',
  'https',
  'sass', // CSS preprocessor
  'less', // CSS preprocessor
  // "as a Service" acronyms
  'saas',
  'paas',
  'iaas',
  'baas',
  'daas',
  'faas',
  'xaas',
  // Fields of study / disciplines (singular despite -ics ending)
  'mathematics',
  'physics',
  'economics',
  'statistics',
  'genetics',
  'logistics',
  'analytics',
  'dynamics',
  'graphics',
  'linguistics',
  'electronics',
  'mechanics',
  'politics',
  'ethics',
  'athletics',
  'aeronautics',
  'astronautics',
  'informatics',
  'robotics',
  'semantics',
  'pragmatics',
  'phonetics',
  'kinetics',
  'thermodynamics',
  'electrodynamics',
  'hydrodynamics',
  'aerodynamics',
  'bioinformatics',
  'geopolitics',
]);

/**
 * Check if a character is a vowel.
 */
function isVowel(char: string): boolean {
  return 'aeiou'.includes(char.toLowerCase());
}

function startsWithUppercase(word: string): boolean {
  const firstChar = word.at(0);
  return firstChar !== undefined
    && firstChar === firstChar.toUpperCase();
}

/**
 * Check if a word ends with a suffix at a PascalCase/camelCase boundary.
 * Returns the prefix if matched, or null if no match.
 *
 * Examples:
 * - matchCompoundSuffix('UserChild', 'child') => 'User'
 * - matchCompoundSuffix('nodeChildren', 'children') => 'node'
 * - matchCompoundSuffix('Child', 'child') => null (no prefix, use exact match)
 * - matchCompoundSuffix('Alice', 'ice') => null (no uppercase boundary)
 */
function matchCompoundSuffix(word: string, suffix: string): string | null {
  const lower = word.toLowerCase();
  if (!lower.endsWith(suffix) || word.length <= suffix.length) {
    return null;
  }
  const suffixStartIndex = word.length - suffix.length;
  const suffixStart = word.charAt(suffixStartIndex);
  // Only match if the suffix starts with uppercase (PascalCase/camelCase boundary)
  if (suffixStart !== suffixStart.toUpperCase()) {
    return null;
  }
  return word.slice(0, suffixStartIndex);
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

  // Check uncountable words (exact match)
  if (UNCOUNTABLE.has(lower)) {
    return word;
  }

  // Check uncountable compound words (suffix match)
  for (const uncountable of UNCOUNTABLE) {
    if (matchCompoundSuffix(word, uncountable) !== null) {
      return word;
    }
  }

  // Check irregular plurals (exact match)
  const irregular = IRREGULARS[lower];
  if (irregular) {
    // Preserve original casing style
    if (startsWithUppercase(word)) {
      return irregular.charAt(0).toUpperCase() + irregular.slice(1);
    }
    return irregular;
  }

  // Check irregular compound words (suffix match)
  for (const [singular, plural] of Object.entries(IRREGULARS)) {
    const prefix = matchCompoundSuffix(word, singular);
    if (prefix !== null) {
      return prefix + plural.charAt(0).toUpperCase() + plural.slice(1);
    }
  }

  // Get the last character and last two characters
  const lastChar = word.slice(-1);
  const lastTwo = word.slice(-2);

  // Words ending in 's', 'x', 'z', 'ch', 'sh' -> add 'es'
  if (
    lastChar === 's'
    || lastChar === 'x'
    || lastChar === 'z'
    || lastTwo === 'ch'
    || lastTwo === 'sh'
  ) {
    return word + 'es';
  }

  // Words ending in consonant + 'y' -> change 'y' to 'ies'
  if (lastChar === 'y' && word.length > 1) {
    const secondToLast = word.at(-2) ?? '';
    if (!isVowel(secondToLast)) {
      return word.slice(0, -1) + 'ies';
    }
  }

  // Words ending in 'f' or 'fe' -> change to 'ves' (common cases)
  // But many words just add 's'
  const fExceptions = [
    // -f words that just add 's'
    'chief', 'chef', 'belief', 'brief', 'grief', 'reef', 'fief',
    'clef', 'serf', 'turf', 'surf', 'scarf', // scarf can be scarves or scarfs
    'gulf', 'dwarf', // dwarf can be dwarves or dwarfs
    'roof', 'proof', 'hoof', // hoof can be hooves or hoofs
    // -fe words that just add 's'
    'safe', 'cafe', 'giraffe', 'gaffe', 'carafe', 'strafe',
  ];
  if ((lastTwo === 'fe' || lastChar === 'f') && !fExceptions.some(e => lower.endsWith(e))) {
      if (lastTwo === 'fe') {
        return word.slice(0, -2) + 'ves';
      }
      return word.slice(0, -1) + 'ves';
    }

  // Words ending in 'o' preceded by consonant -> add 'es' (common cases)
  // But many modern/borrowed words just add 's'
  if (lastChar === 'o' && word.length > 1) {
    const secondToLast = word.at(-2) ?? '';
    if (!isVowel(secondToLast)) {
      // Exceptions that just add 's' (modern words, borrowings, shortened forms)
      const oExceptions = [
        'photo', 'piano', 'memo', 'logo', 'zero', 'pro',
        // Shortened/informal words
        'typo', 'repo', 'demo', 'info', 'disco', 'limo', 'promo',
        'combo', 'turbo', 'dynamo', 'rhino', 'hippo', 'deco',
        'retro', 'intro', 'outro', 'techno', 'electro',
        // Place/gaming terms
        'casino', 'fiasco', 'fresco', 'lotto', 'ghetto',
        // Music
        'soprano', 'alto', 'basso', 'maestro', 'tempo', 'solo',
        // Other borrowings that typically use -s
        'kimono', 'espresso', 'cappuccino', 'stiletto', 'manifesto',
        'commando', 'grotto', 'motto', 'loco', 'taco', 'burrito',
        'avocado', 'armadillo', 'silo', 'halo',
      ];
      if (!oExceptions.some(e => lower.endsWith(e))) {
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

  // Check uncountable words (exact match)
  if (UNCOUNTABLE.has(lower)) {
    return word;
  }

  // Check uncountable compound words (suffix match)
  for (const uncountable of UNCOUNTABLE) {
    if (matchCompoundSuffix(word, uncountable) !== null) {
      return word;
    }
  }

  // Check singular words ending in 's' (exact match)
  if (SINGULAR_S_WORDS.has(lower)) {
    return word;
  }

  // Check singular-s compound words (suffix match)
  for (const singularS of SINGULAR_S_WORDS) {
    if (matchCompoundSuffix(word, singularS) !== null) {
      return word;
    }
  }

  // Check irregular plurals (exact match, reverse lookup)
  for (const [singular, plural] of Object.entries(IRREGULARS)) {
    if (lower === plural) {
      // Preserve original casing style
      if (startsWithUppercase(word)) {
        return singular.charAt(0).toUpperCase() + singular.slice(1);
      }
      return singular;
    }
  }

  // Check irregular compound words (suffix match)
  for (const [singular, plural] of Object.entries(IRREGULARS)) {
    const prefix = matchCompoundSuffix(word, plural);
    if (prefix !== null) {
      return prefix + singular.charAt(0).toUpperCase() + singular.slice(1);
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
    if (['li', 'wi', 'kni'].some(e => base.toLowerCase().endsWith(e))) {
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
      lastChar === 's'
      || lastChar === 'x'
      || lastChar === 'z'
      || lastTwo === 'ch'
      || lastTwo === 'sh'
    ) {
      return withoutEs;
    }

    // If base ends in consonant + 'o' -> remove 'es'
    if (lastChar === 'o' && withoutEs.length > 1) {
      const secondToLast = withoutEs.at(-2) ?? '';
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
