import { describe, expect, it } from 'vitest';
import {
  collapseWhitespace,
  containsFolded,
  countWordMatches,
  findWordMatches,
  foldForComparison,
  isValidFrenchSurface,
  looseEquals,
  normalizeApostrophes,
  normalizedVisibleText,
  toNfc,
} from '@/domain/normalize';
import {
  BIBLIOTHEQUE_NFC,
  BIBLIOTHEQUE_NFD,
  ECOLE_CURLY,
  ECOLE_STRAIGHT,
  FRENCH_DIACRITICS,
  FRENCH_DIACRITICS_CANONICAL,
  FRENCH_FIXTURES,
  NARROW_NBSP,
  NBSP,
  THIN_SPACE,
} from '../fixtures/french';

describe('Unicode NFC normalization', () => {
  it('composes decomposed French text', () => {
    expect(BIBLIOTHEQUE_NFD).not.toBe(BIBLIOTHEQUE_NFC);
    expect(toNfc(BIBLIOTHEQUE_NFD)).toBe(BIBLIOTHEQUE_NFC);
  });

  it('leaves already-composed text untouched', () => {
    for (const fixture of FRENCH_FIXTURES) {
      expect(toNfc(fixture.text)).toBe(fixture.text);
    }
  });

  it('keeps every fixture byte-identical to its escaped spelling', () => {
    // Guards against an editor silently rewriting accents in the source file.
    for (const fixture of FRENCH_FIXTURES) {
      expect(fixture.text).toBe(fixture.canonical);
    }
  });
});

describe('French diacritics survive', () => {
  it('preserves é, è, à, ç and œ', () => {
    FRENCH_DIACRITICS.forEach((char, index) => {
      expect(char).toBe(FRENCH_DIACRITICS_CANONICAL[index]);
      expect(toNfc(char)).toBe(char);
      // Folding lowercases but must never strip the accent.
      expect(foldForComparison(char)).toBe(char.toLowerCase());
    });
  });

  it('never simplifies bibliothèque to bibliotheque', () => {
    expect(foldForComparison(BIBLIOTHEQUE_NFC)).toBe('bibliothèque');
    expect(foldForComparison(BIBLIOTHEQUE_NFC)).not.toBe('bibliotheque');
  });

  it('treats accented and unaccented words as different', () => {
    expect(looseEquals('ou', 'où')).toBe(false);
    expect(looseEquals('a', 'à')).toBe(false);
  });
});

describe('apostrophe handling', () => {
  it('accepts straight and curly apostrophes as equivalent when matching', () => {
    expect(looseEquals(ECOLE_CURLY, ECOLE_STRAIGHT)).toBe(true);
    expect(normalizeApostrophes(ECOLE_CURLY)).toBe(ECOLE_STRAIGHT);
  });

  it('does not rewrite the stored form', () => {
    // Matching is permissive; storage is not.
    expect(toNfc(ECOLE_CURLY)).toBe(ECOLE_CURLY);
    expect(ECOLE_CURLY.includes('’')).toBe(true);
  });

  it('matches a curly-apostrophe needle against straight-apostrophe text', () => {
    expect(containsFolded(`We visited ${ECOLE_STRAIGHT} today.`, ECOLE_CURLY)).toBe(true);
    expect(containsFolded(`We visited ${ECOLE_CURLY} today.`, ECOLE_STRAIGHT)).toBe(true);
  });
});

describe('whitespace', () => {
  it('collapses runs and trims', () => {
    expect(collapseWhitespace('  a \n\t b  ')).toBe('a b');
  });

  it('collapses non-breaking, narrow and thin spaces', () => {
    expect(collapseWhitespace(`a${NBSP}b`)).toBe('a b');
    expect(collapseWhitespace(`a${NARROW_NBSP}b`)).toBe('a b');
    expect(collapseWhitespace(`a${THIN_SPACE}b`)).toBe('a b');
  });

  it('normalizes visible text for restoration comparison', () => {
    expect(normalizedVisibleText({ textContent: ' Hello \n world ' })).toBe('Hello world');
    expect(normalizedVisibleText({ textContent: null })).toBe('');
  });
});

describe('findWordMatches', () => {
  it('respects word boundaries', () => {
    expect(countWordMatches('We had to wait for the bus.', 'wait')).toBe(1);
    expect(countWordMatches('The waiter brought water.', 'wait')).toBe(0);
    expect(countWordMatches('dumbwaiter', 'wait')).toBe(0);
  });

  it('is case insensitive but reports the original casing', () => {
    const [match] = findWordMatches('Wait here please.', 'wait');
    expect(match?.text).toBe('Wait');
    expect(match?.start).toBe(0);
    expect(match?.end).toBe(4);
  });

  it('returns offsets into the original string', () => {
    const sentence = 'Please wait outside the theater until the doors open.';
    const [match] = findWordMatches(sentence, 'wait');
    expect(match).toBeDefined();
    expect(sentence.slice(match!.start, match!.end)).toBe('wait');
  });

  it('matches a multiword phrase across a line break', () => {
    const sentence = 'he felt\n   gloomy all weekend';
    const [match] = findWordMatches(sentence, 'felt gloomy');
    expect(match?.text).toBe('felt\n   gloomy');
  });

  it('finds every occurrence', () => {
    expect(countWordMatches('wait, and wait, and wait', 'wait')).toBe(3);
  });

  it('does not rewrite the haystack, so offsets stay usable', () => {
    // A decomposed haystack must not be re-composed behind the caller's back.
    const haystack = `${BIBLIOTHEQUE_NFD} and wait`;
    const [match] = findWordMatches(haystack, 'wait');
    expect(haystack.slice(match!.start, match!.end)).toBe('wait');
  });
});

describe('isValidFrenchSurface', () => {
  it('accepts every catalog-shaped surface', () => {
    for (const fixture of FRENCH_FIXTURES) {
      expect(isValidFrenchSurface(fixture.text), fixture.name).toBe(true);
    }
  });

  it('accepts hyphens and internal spaces', () => {
    expect(isValidFrenchSurface('avait le cafard')).toBe(true);
    expect(isValidFrenchSurface('vis-à-vis')).toBe(true);
  });

  it('rejects markup, digits, punctuation and stray whitespace', () => {
    expect(isValidFrenchSurface('<b>appel</b>')).toBe(false);
    expect(isValidFrenchSurface('appel2')).toBe(false);
    expect(isValidFrenchSurface('appel!')).toBe(false);
    expect(isValidFrenchSurface(' appel')).toBe(false);
    expect(isValidFrenchSurface('appel ')).toBe(false);
    expect(isValidFrenchSurface('appel  fort')).toBe(false);
    expect(isValidFrenchSurface('')).toBe(false);
  });

  it('rejects text that is not already NFC', () => {
    expect(isValidFrenchSurface(BIBLIOTHEQUE_NFD)).toBe(false);
    expect(isValidFrenchSurface(BIBLIOTHEQUE_NFC)).toBe(true);
  });
});
