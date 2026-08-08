/**
 * French regression fixtures.
 *
 * Every surface the plan names is written twice: once as an ordinary literal,
 * the way a catalog author types it, and once assembled from raw code points.
 * If an editor, a formatter or a bad merge ever de-accents a source file or
 * swaps a curly apostrophe for a straight one, the two spellings stop matching
 * and this suite fails instead of the product shipping wrong.
 *
 * The code-point side is deliberately built with `String.fromCodePoint` rather
 * than escape sequences, because escapes in source are exactly the thing that
 * gets rewritten.
 */

const cp = (...points: number[]): string => String.fromCodePoint(...points);

const A_GRAVE = 0x00e0;
const C_CEDILLA = 0x00e7;
const E_ACUTE = 0x00e9;
const E_GRAVE = 0x00e8;
const OE_LIGATURE = 0x0153;
const RIGHT_SINGLE_QUOTE = 0x2019;
const COMBINING_GRAVE = 0x0300;

const build = (...parts: (string | number)[]): string =>
  parts.map((part) => (typeof part === 'number' ? cp(part) : part)).join('');

export interface FrenchFixture {
  readonly name: string;
  /** Written as a literal, the way catalog authors type it. */
  readonly text: string;
  /** The same string assembled from code points. */
  readonly canonical: string;
}

export const FRENCH_FIXTURES: readonly FrenchFixture[] = [
  { name: 'attendre', text: 'attendre', canonical: build('attendre') },
  { name: 'actuellement', text: 'actuellement', canonical: build('actuellement') },
  { name: 'assister a-grave', text: 'assister à', canonical: build('assister ', A_GRAVE) },
  { name: 'appel', text: 'appel', canonical: build('appel') },
  { name: 'bibliotheque', text: 'bibliothèque', canonical: build('biblioth', E_GRAVE, 'que') },
  { name: 'avait le cafard', text: 'avait le cafard', canonical: build('avait le cafard') },
  {
    name: 'l-ecole',
    text: 'l’école',
    canonical: build('l', RIGHT_SINGLE_QUOTE, E_ACUTE, 'cole'),
  },
  { name: 'journee', text: 'journée', canonical: build('journ', E_ACUTE, 'e') },
  { name: 'blesse', text: 'blessé', canonical: build('bless', E_ACUTE) },
  { name: 'librairie', text: 'librairie', canonical: build('librairie') },
];

/** Characters the plan requires survive storage, rendering and reload. */
export const FRENCH_DIACRITICS = ['é', 'è', 'à', 'ç', 'œ'] as const;
export const FRENCH_DIACRITICS_CANONICAL = [
  cp(E_ACUTE),
  cp(E_GRAVE),
  cp(A_GRAVE),
  cp(C_CEDILLA),
  cp(OE_LIGATURE),
] as const;

/** The same word decomposed (NFD) and composed (NFC). */
export const BIBLIOTHEQUE_NFD = build('biblioth', 0x0065, COMBINING_GRAVE, 'que');
export const BIBLIOTHEQUE_NFC = build('biblioth', E_GRAVE, 'que');

/** Space-like code points that must all collapse to a single ASCII space. */
export const NBSP = cp(0x00a0);
export const NARROW_NBSP = cp(0x202f);
export const THIN_SPACE = cp(0x2009);

/** Curly vs straight apostrophe. Equal when matching, distinct when stored. */
export const ECOLE_CURLY = build('l', RIGHT_SINGLE_QUOTE, E_ACUTE, 'cole');
export const ECOLE_STRAIGHT = build('l', 0x0027, E_ACUTE, 'cole');

/** Sentences the demo pages and the catalog tests both rely on. */
export const DEMO_A_SENTENCES = {
  attendre: 'We had to wait for the bus for nearly an hour.',
  actuellement: 'The museum is currently closed and will reopen next Monday.',
  assisterA: 'More than 500 people will attend the conference in Paris.',
  appel: 'The lawyer filed an appeal after the verdict.',
  cafard: 'After failing the exam, he felt gloomy all weekend.',
} as const;

export const DEMO_B_SENTENCES = {
  attendre: 'Please wait outside the theater until the doors open.',
} as const;
