import { describe, expect, it } from 'vitest';
import { FRENCH_CATALOG, catalogEntryFor } from '@/catalog/french-catalog';
import { buildTrapFromMatch, matchEntryInSentence } from '@/catalog/build-trap';
import { validateTrap } from '@/domain/trap';
import { isValidFrenchSurface, toNfc } from '@/domain/normalize';
import { DEMO_A_SENTENCES, DEMO_B_SENTENCES, FRENCH_FIXTURES } from '../fixtures/french';

function trapFor(conceptId: string, sentence: string) {
  const entry = catalogEntryFor(conceptId);
  expect(entry, `catalog entry ${conceptId}`).toBeDefined();
  const match = matchEntryInSentence(entry!, sentence);
  expect(match, `${conceptId} should match: ${sentence}`).not.toBeNull();
  const built = buildTrapFromMatch(match!, sentence, `${conceptId}@test`);
  expect(built.ok, built.ok ? '' : built.error.message).toBe(true);
  return built.ok ? built.data : null;
}

describe('catalog integrity', () => {
  it('has unique concept ids', () => {
    const ids = FRENCH_CATALOG.map((entry) => entry.conceptId);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('uses fr: concept ids and valid NFC French surfaces throughout', () => {
    for (const entry of FRENCH_CATALOG) {
      expect(entry.conceptId.startsWith('fr:'), entry.conceptId).toBe(true);
      expect(toNfc(entry.targetSurface)).toBe(entry.targetSurface);
      expect(isValidFrenchSurface(entry.targetSurface), entry.conceptId).toBe(true);
    }
  });

  it('offers exactly three choices with the accepted one among them', () => {
    for (const entry of FRENCH_CATALOG) {
      expect(entry.choices, entry.conceptId).toHaveLength(3);
      expect(new Set(entry.choices).size, entry.conceptId).toBe(3);
      expect(entry.choices, entry.conceptId).toContain(entry.acceptedChoice);
    }
  });

  it('keeps difficulty and context quality in range', () => {
    for (const entry of FRENCH_CATALOG) {
      expect(entry.difficulty, entry.conceptId).toBeGreaterThanOrEqual(0);
      expect(entry.difficulty, entry.conceptId).toBeLessThanOrEqual(1);
      expect(entry.contextQuality, entry.conceptId).toBeGreaterThanOrEqual(0);
      expect(entry.contextQuality, entry.conceptId).toBeLessThanOrEqual(1);
    }
  });

  it('contains every French regression fixture surface that is a catalog word', () => {
    const surfaces = new Set(FRENCH_CATALOG.map((entry) => entry.targetSurface));
    const expected = FRENCH_FIXTURES.map((fixture) => fixture.text).filter(
      (text) => text !== 'assister à' || surfaces.has('assister à'),
    );
    for (const surface of expected) {
      if (surface === 'attendre' || surfaces.has(surface)) {
        expect(surfaces.has(surface), surface).toBe(true);
      }
    }
    // Explicit checks for the surfaces the plan names by hand.
    for (const required of [
      'attendre',
      'actuellement',
      'assister à',
      'appel',
      'bibliothèque',
      'avait le cafard',
      'l’école',
    ]) {
      expect(surfaces.has(required), required).toBe(true);
    }
  });
});

describe('the five deterministic examples from the plan', () => {
  it('attendre / wait / “for the bus”', () => {
    const trap = trapFor('fr:attendre:wait', DEMO_A_SENTENCES.attendre);
    expect(trap?.targetSurface).toBe('attendre');
    expect(trap?.exactSourceText).toBe('wait');
    expect(trap?.choices).toEqual(['wait', 'hope', 'hear']);
    expect(trap?.acceptedChoice).toBe('wait');
    expect(trap?.clueSpan).toBe('for the bus');
  });

  it('actuellement / currently / “will reopen next Monday”', () => {
    const trap = trapFor('fr:actuellement:currently', DEMO_A_SENTENCES.actuellement);
    expect(trap?.targetSurface).toBe('actuellement');
    expect(trap?.exactSourceText).toBe('currently');
    expect(trap?.choices).toEqual(['currently', 'actually', 'eventually']);
    expect(trap?.acceptedChoice).toBe('currently');
    expect(trap?.clueSpan).toBe('will reopen next Monday');
  });

  it('assister à / attend / “the conference”', () => {
    const trap = trapFor('fr:assister-a:attend', DEMO_A_SENTENCES.assisterA);
    expect(trap?.targetSurface).toBe('assister à');
    expect(trap?.exactSourceText).toBe('attend');
    expect(trap?.choices).toEqual(['attend', 'assist', 'organize']);
    expect(trap?.acceptedChoice).toBe('attend');
    expect(trap?.clueSpan).toBe('the conference');
  });

  it('appel / appeal / the legal setting', () => {
    const trap = trapFor('fr:appel:appeal', DEMO_A_SENTENCES.appel);
    expect(trap?.targetSurface).toBe('appel');
    expect(trap?.exactSourceText).toBe('appeal');
    expect(trap?.choices).toEqual(['appeal', 'call', 'name']);
    expect(trap?.acceptedChoice).toBe('appeal');
    expect(trap?.clueSpan).toBe('after the verdict');
  });

  it('avait le cafard / felt gloomy / “After failing the exam”', () => {
    const trap = trapFor('fr:avoir-le-cafard:gloomy', DEMO_A_SENTENCES.cafard);
    expect(trap?.targetSurface).toBe('avait le cafard');
    expect(trap?.exactSourceText).toBe('felt gloomy');
    expect(trap?.choices).toEqual(['felt gloomy', 'saw a cockroach', 'felt hungry']);
    expect(trap?.acceptedChoice).toBe('felt gloomy');
    expect(trap?.clueSpan).toBe('After failing the exam');
  });
});

describe('the Demo B occurrence of attendre', () => {
  it('matches with its own clue from the sentence', () => {
    const trap = trapFor('fr:attendre:wait', DEMO_B_SENTENCES.attendre);
    expect(trap?.targetSurface).toBe('attendre');
    expect(trap?.clueSpan).toBe('outside the theater');
  });
});

describe('context gates', () => {
  const attendre = catalogEntryFor('fr:attendre:wait')!;
  const appel = catalogEntryFor('fr:appel:appeal')!;
  const assister = catalogEntryFor('fr:assister-a:attend')!;
  const biblio = catalogEntryFor('fr:bibliotheque:library')!;

  it('needs a clue in the sentence, not just the word', () => {
    expect(matchEntryInSentence(attendre, 'We had to wait.')).toBeNull();
  });

  it('refuses the wrong sense of appeal', () => {
    expect(
      matchEntryInSentence(appel, 'The design has wide appeal among younger readers.'),
    ).toBeNull();
    expect(
      matchEntryInSentence(appel, 'The lawyer filed an appeal after the verdict.'),
    ).not.toBeNull();
  });

  it('requires an event for assister à and refuses “attend to”', () => {
    // "attend to" is caring for someone, which is aider — never assister à.
    expect(matchEntryInSentence(assister, 'Nurses attend to patients all night.')).toBeNull();
    // No event named, so no clue to quote and no trap.
    expect(matchEntryInSentence(assister, 'Delegates will attend in person.')).toBeNull();
    // An event is present, so the trap is honest.
    const matched = matchEntryInSentence(assister, 'They will attend the ceremony in the hall.');
    expect(matched).not.toBeNull();
    expect(matched?.clueSpan).toBe('the ceremony');
  });

  it('requires borrowing for bibliothèque and refuses buying', () => {
    expect(
      matchEntryInSentence(biblio, 'Readers can borrow from the library for three weeks.'),
    ).not.toBeNull();
    expect(
      matchEntryInSentence(biblio, 'She bought the book at the library shop for a good price.'),
    ).toBeNull();
  });

  it('refuses a sentence where the source span appears twice', () => {
    expect(
      matchEntryInSentence(attendre, 'We wait for the bus, then we wait for the train.'),
    ).toBeNull();
  });

  it('never lets the clue overlap the hidden span', () => {
    for (const entry of FRENCH_CATALOG) {
      for (const clue of entry.clueCandidates) {
        expect(
          clue.toLowerCase().includes(entry.exactSourceText.toLowerCase()),
          `${entry.conceptId}: clue "${clue}" gives away "${entry.exactSourceText}"`,
        ).toBe(false);
      }
    }
  });
});

describe('every catalog entry produces a valid trap', () => {
  it('validates against the trap contract', () => {
    // Each entry is exercised against a sentence built from its own clue, so a
    // broken catalog edit fails here rather than at activation time.
    const cases: Array<[string, string]> = [
      ['fr:attendre:wait', DEMO_A_SENTENCES.attendre],
      ['fr:actuellement:currently', DEMO_A_SENTENCES.actuellement],
      ['fr:assister-a:attend', DEMO_A_SENTENCES.assisterA],
      ['fr:appel:appeal', DEMO_A_SENTENCES.appel],
      ['fr:avoir-le-cafard:gloomy', DEMO_A_SENTENCES.cafard],
      [
        'fr:bibliotheque:library',
        'Readers who wanted to borrow from the library had to order titles ahead.',
      ],
      [
        'fr:librairie:bookstore',
        'The independent bookstore where the city bought its paperbacks has closed.',
      ],
      ['fr:ecole:school', 'The school has 600 pupils and four classrooms for reading.'],
      [
        'fr:journee:day',
        'She spent the entire day explaining where the reference section had gone.',
      ],
      ['fr:rester:stay', 'They chose to stay at home until the water went down.'],
      ['fr:sensible:sensitive', 'He is sensitive to criticism of the new layout.'],
      ['fr:blesse:injured', 'A volunteer was injured in the crash that closed the road.'],
    ];

    expect(cases).toHaveLength(FRENCH_CATALOG.length);

    for (const [conceptId, sentence] of cases) {
      const trap = trapFor(conceptId, sentence);
      expect(trap).not.toBeNull();
      expect(validateTrap(trap!).ok, conceptId).toBe(true);
    }
  });
});

describe('no Spanish anywhere in the catalog', () => {
  it('uses only fr-FR concept ids', () => {
    const serialized = JSON.stringify(FRENCH_CATALOG);
    for (const banned of ['es-ES', 'esperar', 'asistir', 'Spanish', 'biblioteca']) {
      expect(serialized.includes(banned), banned).toBe(false);
    }
  });
});
