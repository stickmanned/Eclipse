import { describe, expect, it } from 'vitest';
import { memoryArea, type StorageArea } from '@/storage/area';
import {
  INTERACTION_LOG_LIMIT,
  hasInteraction,
  loadProfile,
  rememberInteraction,
  resetProfile,
  saveProfile,
} from '@/storage/profile-store';
import { INTERACTIONS_KEY, PROFILE_KEY } from '@/storage/keys';
import {
  MAX_CONCEPT_RECORDS,
  PROFILE_SCHEMA_VERSION,
  RECENT_OUTCOMES_LIMIT,
  createEmptyProfile,
  emptyMastery,
  pruneMastery,
  summarizeMastery,
  vocabularyItems,
  type ConceptMastery,
  type LearnerProfile,
} from '@/domain/profile';
import { recordAnswer as recordAnswerRaw, type RecordAnswerInput } from '@/domain/mastery';
import { BIBLIOTHEQUE_NFC, ECOLE_CURLY } from '../fixtures/french';

const NOW = new Date('2026-03-01T12:00:00.000Z');

function masteryRecord(overrides: Partial<ConceptMastery> = {}): ConceptMastery {
  return {
    ...emptyMastery(NOW),
    attempts: 1,
    correct: 1,
    ...overrides,
  };
}

function recordAnswer(
  input: Omit<RecordAnswerInput, 'assisted' | 'mode'> &
    Partial<Pick<RecordAnswerInput, 'assisted' | 'mode'>>,
) {
  return recordAnswerRaw({ assisted: true, mode: 'context-choice', ...input });
}

/** A storage area whose writes always fail, for the recoverable-error path. */
function failingArea(): StorageArea {
  return {
    async get() {
      return undefined;
    },
    async set() {
      throw new Error('quota exceeded');
    },
    async remove() {
      throw new Error('quota exceeded');
    },
  };
}

describe('loading', () => {
  it('returns a fresh profile when nothing is stored', async () => {
    const result = await loadProfile(memoryArea());
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.created).toBe(true);
      expect(result.data.profile.schemaVersion).toBe(PROFILE_SCHEMA_VERSION);
      expect(result.data.profile.targetLocale).toBe('fr-FR');
      expect(result.data.profile.calibrationCompleted).toBe(false);
      expect(result.data.profile.globalAbility).toBe(0);
    }
  });

  it('reports PROFILE_INCOMPATIBLE for a newer schema and leaves the bytes alone', async () => {
    const stored = { ...createEmptyProfile(), schemaVersion: PROFILE_SCHEMA_VERSION + 1 };
    const area = memoryArea({ [PROFILE_KEY]: stored });

    const result = await loadProfile(area);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.code).toBe('PROFILE_INCOMPATIBLE');

    // Nothing was overwritten.
    expect(await area.get(PROFILE_KEY)).toMatchObject({
      schemaVersion: PROFILE_SCHEMA_VERSION + 1,
    });
  });

  it('reports PROFILE_INCOMPATIBLE for corrupt data rather than discarding it', async () => {
    const area = memoryArea({ [PROFILE_KEY]: { schemaVersion: 1, globalAbility: 'lots' } });
    const result = await loadProfile(area);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.code).toBe('PROFILE_INCOMPATIBLE');
    expect(await area.get(PROFILE_KEY)).toEqual({ schemaVersion: 1, globalAbility: 'lots' });
  });

  it('rejects an out-of-range ability', async () => {
    const area = memoryArea({ [PROFILE_KEY]: { ...createEmptyProfile(), globalAbility: 5 } });
    const result = await loadProfile(area);
    expect(result.ok).toBe(false);
  });

  it('migrates v1 New Moon attempts to Crescent and repairs first-answer scheduling', async () => {
    const legacy = {
      schemaVersion: 1,
      sourceLocale: 'en',
      targetLocale: 'fr-FR',
      calibrationCompleted: true,
      delfLevel: 'B1',
      globalAbility: 0.2,
      mastery: {
        'fr:attendre:wait': {
          score: 0.3,
          phase: 'new_moon',
          attempts: 1,
          correct: 1,
          due: { kind: 'none' },
          updatedAt: NOW.toISOString(),
          display: { targetSurface: 'attendre', englishMeaning: 'wait', kind: 'word' },
        },
      },
      recentOutcomes: [
        {
          interactionId: 'legacy_1',
          conceptId: 'fr:attendre:wait',
          correct: true,
          at: NOW.toISOString(),
        },
      ],
    };
    const area = memoryArea({ [PROFILE_KEY]: legacy });

    const result = await loadProfile(area);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const migrated = result.data.profile.mastery['fr:attendre:wait'];
    expect(result.data.migrated).toBe(true);
    expect(migrated?.phase).toBe('crescent');
    expect(migrated?.unassistedCorrect).toBe(0);
    expect(migrated?.due).toEqual({
      kind: 'timestamp',
      at: new Date(NOW.getTime() + 86_400_000).toISOString(),
    });
    expect(migrated?.display?.targetSurface).toBe('attendre');
    expect((await area.get(PROFILE_KEY)) as LearnerProfile).toMatchObject({
      schemaVersion: PROFILE_SCHEMA_VERSION,
    });
  });

  it('seeds a legacy Full label with the matching three-practice count', async () => {
    const area = memoryArea({
      [PROFILE_KEY]: {
        schemaVersion: 1,
        sourceLocale: 'en',
        targetLocale: 'fr-FR',
        calibrationCompleted: true,
        delfLevel: 'B2',
        globalAbility: 0.8,
        mastery: {
          'fr:enjeu:stake': {
            score: 1.8,
            phase: 'full',
            attempts: 7,
            correct: 6,
            due: { kind: 'timestamp', at: '2026-03-10T12:00:00.000Z' },
            updatedAt: NOW.toISOString(),
          },
        },
        recentOutcomes: [],
      },
    });

    const result = await loadProfile(area);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.profile.mastery['fr:enjeu:stake']).toMatchObject({
        phase: 'full',
        unassistedCorrect: 3,
        attempts: 7,
        correct: 6,
      });
      expect(result.data.profile.mastery['fr:enjeu:stake']?.legacyPhase).toBeUndefined();
    }
  });

  it('repairs a v2 legacy label written by an earlier migration', async () => {
    const profile = createEmptyProfile();
    const area = memoryArea({
      [PROFILE_KEY]: {
        ...profile,
        mastery: {
          'fr:enjeu:stake': masteryRecord({
            phase: 'full',
            unassistedCorrect: 0,
            legacyPhase: true,
          }),
        },
      },
    });

    const result = await loadProfile(area);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data.migrated).toBe(true);
    expect(result.data.profile.mastery['fr:enjeu:stake']).toMatchObject({
      phase: 'full',
      unassistedCorrect: 3,
    });
    expect(result.data.profile.mastery['fr:enjeu:stake']?.legacyPhase).toBeUndefined();
  });
});

describe('saving', () => {
  it('round-trips accents and apostrophes untouched', async () => {
    const area = memoryArea();
    const profile: LearnerProfile = {
      ...createEmptyProfile(),
      mastery: {
        'fr:bibliotheque:library': masteryRecord(),
        'fr:ecole:school': masteryRecord(),
      },
      recentOutcomes: [
        {
          interactionId: 'int_1',
          conceptId: 'fr:ecole:school',
          correct: true,
          at: NOW.toISOString(),
        },
      ],
    };

    expect((await saveProfile(area, profile)).ok).toBe(true);
    const reloaded = await loadProfile(area);
    expect(reloaded.ok).toBe(true);
    if (reloaded.ok) {
      expect(Object.keys(reloaded.data.profile.mastery)).toEqual([
        'fr:bibliotheque:library',
        'fr:ecole:school',
      ]);
    }

    // The French text itself lives in the catalog, not the profile — but prove
    // the storage layer is transparent to it either way.
    await area.set('probe', { surface: BIBLIOTHEQUE_NFC, article: ECOLE_CURLY });
    expect(await area.get('probe')).toEqual({
      surface: BIBLIOTHEQUE_NFC,
      article: ECOLE_CURLY,
    });
  });

  it('refuses to persist an invalid profile', async () => {
    const area = memoryArea();
    const broken = { ...createEmptyProfile(), globalAbility: 99 } as LearnerProfile;
    const result = await saveProfile(area, broken);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.code).toBe('STORAGE_ERROR');
  });

  it('reports STORAGE_ERROR when the area throws', async () => {
    const result = await saveProfile(failingArea(), createEmptyProfile());
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe('STORAGE_ERROR');
      expect(result.error.recoverable).toBe(true);
    }
  });
});

describe('reset', () => {
  it('clears the profile and the interaction log', async () => {
    const area = memoryArea();
    await saveProfile(area, { ...createEmptyProfile(), calibrationCompleted: true });
    await rememberInteraction(area, 'int_1');

    expect((await resetProfile(area)).ok).toBe(true);
    expect(await area.get(PROFILE_KEY)).toBeUndefined();
    expect(await area.get(INTERACTIONS_KEY)).toBeUndefined();
    const reloaded = await loadProfile(area);
    expect(reloaded.ok).toBe(true);
    if (reloaded.ok) expect(reloaded.data.profile.calibrationCompleted).toBe(false);
    expect(await hasInteraction(area, 'int_1')).toBe(false);
  });
});

describe('interaction log', () => {
  it('remembers and reports ids', async () => {
    const area = memoryArea();
    expect(await hasInteraction(area, 'int_1')).toBe(false);
    await rememberInteraction(area, 'int_1');
    expect(await hasInteraction(area, 'int_1')).toBe(true);
  });

  it('is bounded', async () => {
    const area = memoryArea();
    for (let i = 0; i < INTERACTION_LOG_LIMIT + 20; i += 1) {
      await rememberInteraction(area, `int_${i}`);
    }
    expect(await hasInteraction(area, 'int_0')).toBe(false);
    expect(await hasInteraction(area, `int_${INTERACTION_LOG_LIMIT + 19}`)).toBe(true);
  });
});

describe('mastery map bounds', () => {
  it('keeps at most 500 concepts, dropping the least recently updated', () => {
    const mastery: Record<string, ConceptMastery> = {};
    for (let i = 0; i < MAX_CONCEPT_RECORDS + 10; i += 1) {
      mastery[`fr:concept${i}:sense`] = masteryRecord({
        updatedAt: new Date(NOW.getTime() + i * 1000).toISOString(),
      });
    }
    const pruned = pruneMastery(mastery);
    expect(Object.keys(pruned)).toHaveLength(MAX_CONCEPT_RECORDS);
    expect(pruned['fr:concept0:sense']).toBeUndefined();
    expect(pruned[`fr:concept${MAX_CONCEPT_RECORDS + 9}:sense`]).toBeDefined();
  });

  it('is a no-op below the limit', () => {
    const mastery = { 'fr:a:b': masteryRecord() };
    expect(pruneMastery(mastery)).toBe(mastery);
  });
});

describe('recordAnswer idempotency', () => {
  it('applies an interaction exactly once', () => {
    const base = createEmptyProfile();
    const first = recordAnswer({
      profile: base,
      interactionId: 'int_dup',
      conceptId: 'fr:attendre:wait',
      difficulty: 0.35,
      correct: false,
      now: NOW,
    });
    expect(first.applied).toBe(true);
    expect(first.profile.mastery['fr:attendre:wait']?.attempts).toBe(1);

    const replay = recordAnswer({
      profile: first.profile,
      interactionId: 'int_dup',
      conceptId: 'fr:attendre:wait',
      difficulty: 0.35,
      correct: false,
      now: NOW,
    });
    expect(replay.applied).toBe(false);
    expect(replay.profile).toBe(first.profile);
    expect(replay.profile.mastery['fr:attendre:wait']?.attempts).toBe(1);
  });

  it('marks an incorrect answer due at the next occurrence', () => {
    const result = recordAnswer({
      profile: createEmptyProfile(),
      interactionId: 'int_1',
      conceptId: 'fr:attendre:wait',
      difficulty: 0.35,
      correct: false,
      now: NOW,
    });
    expect(result.mastery.due).toEqual({ kind: 'next_occurrence' });
    expect(result.mastery.score).toBeLessThan(0);
  });

  it('starts both correct and incorrect contextual answers at Crescent with a review owed', () => {
    const correct = recordAnswer({
      profile: createEmptyProfile(),
      interactionId: 'first_correct',
      conceptId: 'fr:attendre:wait',
      difficulty: 0.35,
      correct: true,
      now: NOW,
      contextFingerprint: 'ctx_a',
    });
    const incorrect = recordAnswer({
      profile: createEmptyProfile(),
      interactionId: 'first_wrong',
      conceptId: 'fr:appel:appeal',
      difficulty: 0.35,
      correct: false,
      now: NOW,
      contextFingerprint: 'ctx_b',
    });

    expect(correct.mastery.phase).toBe('crescent');
    expect(correct.mastery.due.kind).toBe('timestamp');
    expect(correct.mastery.unassistedCorrect).toBe(0);
    expect(incorrect.mastery.phase).toBe('crescent');
    expect(incorrect.mastery.due).toEqual({ kind: 'next_occurrence' });
    expect(incorrect.mastery.reviewEvents[0]).toMatchObject({
      correct: false,
      assisted: true,
      mode: 'context-choice',
      contextFingerprint: 'ctx_b',
    });
    expect(incorrect.mastery.contextFingerprints).toEqual(['ctx_b']);
  });

  it('cannot promote through repeated assisted answers', () => {
    let profile = createEmptyProfile();
    for (let index = 0; index < 8; index += 1) {
      profile = recordAnswer({
        profile,
        interactionId: `choice_${index}`,
        conceptId: 'fr:attendre:wait',
        difficulty: 0.35,
        correct: true,
        now: new Date(NOW.getTime() + index * 86_400_000),
      }).profile;
    }
    expect(profile.mastery['fr:attendre:wait']).toMatchObject({
      phase: 'crescent',
      unassistedCorrect: 0,
      attempts: 8,
    });
  });

  it('reaches Half on the first correct typed practice and Full on the third', () => {
    let profile = createEmptyProfile();
    const phases: string[] = [];

    profile = recordAnswer({
      profile,
      interactionId: 'context_intro',
      conceptId: 'fr:attendre:wait',
      difficulty: 0.5,
      correct: false,
      now: NOW,
    }).profile;

    for (let index = 0; index < 3; index += 1) {
      const result = recordAnswer({
        profile,
        interactionId: `typed_${index}`,
        conceptId: 'fr:attendre:wait',
        difficulty: 0.5,
        correct: true,
        assisted: false,
        mode: 'typed-meaning',
        now: new Date(NOW.getTime() + (index + 1) * 60_000),
      });
      profile = result.profile;
      phases.push(result.mastery.phase);
    }

    expect(phases).toEqual(['half', 'half', 'full']);
    expect(profile.mastery['fr:attendre:wait']).toMatchObject({
      phase: 'full',
      unassistedCorrect: 3,
    });
  });

  it('does not erase earned Full Moon mastery after a later miss', () => {
    const history = [
      {
        interactionId: 'old_review',
        reviewedAt: '2026-02-20T12:00:00.000Z',
        correct: true,
        assisted: false,
        mode: 'typed-meaning' as const,
        scheduled: true,
        schedulerRating: 'good' as const,
      },
    ];
    const profile: LearnerProfile = {
      ...createEmptyProfile(),
      mastery: {
        'fr:enjeu:stake': masteryRecord({
          phase: 'full',
          attempts: 6,
          correct: 6,
          unassistedCorrect: 4,
          successfulReviewDays: ['2026-02-10', '2026-02-15', '2026-02-20'],
          reviewEvents: history,
          due: { kind: 'next_occurrence' },
        }),
      },
    };

    const lapsed = recordAnswer({
      profile,
      interactionId: 'full_lapse',
      conceptId: 'fr:enjeu:stake',
      difficulty: 0.5,
      correct: false,
      assisted: false,
      mode: 'typed-meaning',
      now: NOW,
    });
    expect(lapsed.mastery.phase).toBe('full');
    expect(lapsed.mastery.successfulReviewDays).toEqual(['2026-02-10', '2026-02-15', '2026-02-20']);
    expect(lapsed.mastery.reviewEvents).toHaveLength(2);
    expect(lapsed.mastery.lapses).toBeGreaterThan(0);
    expect(lapsed.mastery.due).toEqual({ kind: 'next_occurrence' });

    const corrected = recordAnswer({
      profile: lapsed.profile,
      interactionId: 'full_correction',
      conceptId: 'fr:enjeu:stake',
      difficulty: 0.5,
      correct: true,
      assisted: false,
      mode: 'typed-meaning',
      now: new Date(NOW.getTime() + 60_000),
    });
    expect(corrected.mastery.phase).toBe('full');
    expect(corrected.mastery.unassistedCorrect).toBe(5);
  });

  it('keeps only the last five outcomes', () => {
    let profile = createEmptyProfile();
    for (let i = 0; i < 8; i += 1) {
      profile = recordAnswer({
        profile,
        interactionId: `int_${i}`,
        conceptId: 'fr:attendre:wait',
        difficulty: 0.35,
        correct: true,
        now: new Date(NOW.getTime() + i * 1000),
      }).profile;
    }
    expect(profile.recentOutcomes).toHaveLength(RECENT_OUTCOMES_LIMIT);
    expect(profile.recentOutcomes[0]?.interactionId).toBe('int_3');
    expect(profile.mastery['fr:attendre:wait']?.attempts).toBe(8);
  });

  it('schedules a later review on a correct answer while due', () => {
    let profile = createEmptyProfile();
    profile = recordAnswer({
      profile,
      interactionId: 'a',
      conceptId: 'fr:attendre:wait',
      difficulty: 0.35,
      correct: false,
      now: NOW,
    }).profile;
    expect(profile.mastery['fr:attendre:wait']?.due).toEqual({ kind: 'next_occurrence' });

    const later = new Date(NOW.getTime() + 60_000);
    profile = recordAnswer({
      profile,
      interactionId: 'b',
      conceptId: 'fr:attendre:wait',
      difficulty: 0.35,
      correct: true,
      now: later,
    }).profile;

    const due = profile.mastery['fr:attendre:wait']?.due;
    expect(due?.kind).toBe('timestamp');
    if (due?.kind === 'timestamp') {
      expect(Date.parse(due.at) - later.getTime()).toBeGreaterThanOrEqual(86_400_000);
    }
  });
});

describe('mastery summary', () => {
  it('counts tracked concepts, attempts and due items', () => {
    const profile: LearnerProfile = {
      ...createEmptyProfile(),
      mastery: {
        'fr:attendre:wait': masteryRecord({
          phase: 'full',
          attempts: 4,
          correct: 3,
          due: { kind: 'timestamp', at: new Date(NOW.getTime() - 1000).toISOString() },
        }),
        'fr:appel:appeal': masteryRecord({
          phase: 'crescent',
          attempts: 1,
          correct: 0,
          due: { kind: 'next_occurrence' },
        }),
        'fr:journee:day': masteryRecord({ phase: 'half', attempts: 2, correct: 2 }),
      },
    };

    const summary = summarizeMastery(profile, NOW);
    expect(summary.tracked).toBe(3);
    expect(summary.attempts).toBe(7);
    expect(summary.correct).toBe(5);
    expect(summary.due).toBe(1);
    expect(summary.byPhase.full).toBe(1);
    expect(summary.byPhase.half).toBe(1);
    expect(summary.byPhase.crescent).toBe(1);
  });

  it('reports new_moon for an empty profile', () => {
    expect(summarizeMastery(createEmptyProfile(), NOW).overallPhase).toBe('new_moon');
  });
});

describe('vocabulary deck rows', () => {
  it('keeps validated display copy with the mastery record', () => {
    const answered = recordAnswer({
      profile: createEmptyProfile(),
      interactionId: 'int_display',
      conceptId: 'fr:attendre:wait',
      difficulty: 0.35,
      correct: true,
      now: NOW,
      display: {
        targetSurface: 'attendre',
        englishMeaning: 'wait',
        kind: 'word',
      },
    });

    expect(vocabularyItems(answered.profile)).toMatchObject([
      {
        conceptId: 'fr:attendre:wait',
        targetSurface: 'attendre',
        englishMeaning: 'wait',
        kind: 'word',
        attempts: 1,
        correct: 1,
      },
    ]);
  });

  it('gives older mastery records a readable concept-id fallback', () => {
    const profile = {
      ...createEmptyProfile(),
      mastery: { 'fr:mettre-en-place:set-up': masteryRecord() },
    };

    expect(vocabularyItems(profile)[0]).toMatchObject({
      targetSurface: 'mettre en place',
      englishMeaning: 'set up',
    });
  });

  it('keeps Full Moon terminal even when its old scheduler date is overdue', () => {
    const profile: LearnerProfile = {
      ...createEmptyProfile(),
      mastery: {
        'fr:enjeu:stake': masteryRecord({
          phase: 'full',
          intervalDays: 14,
          due: { kind: 'timestamp', at: '2026-01-15T12:00:00.000Z' },
          fsrsCard: {
            ...emptyMastery(NOW).fsrsCard,
            due: '2026-01-15T12:00:00.000Z',
            stability: 14,
            difficulty: 5,
            scheduledDays: 14,
            reps: 4,
            state: 2,
            lastReview: '2026-01-01T12:00:00.000Z',
          },
        }),
      },
    };

    expect(vocabularyItems(profile, NOW)[0]).toMatchObject({
      phase: 'full',
      memoryDimmed: false,
    });
    expect(profile.mastery['fr:enjeu:stake']?.phase).toBe('full');
    expect(summarizeMastery(profile, NOW).byPhase).toEqual({
      crescent: 0,
      half: 0,
      full: 1,
    });
  });
});
