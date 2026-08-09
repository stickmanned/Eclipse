/**
 * Core #1 — adaptive complexity.
 *
 * The centrepiece is `the four rounds from the brief`, which walks the exact
 * sequence the specification describes and asserts the behaviour it asks for:
 * ambition rises after each success, and backs off the moment the learner is
 * caught out. If the tuning constants are ever changed, that test is the one
 * that says whether the product still behaves as promised.
 */

import { describe, expect, it } from 'vitest';
import {
  BAND_HALF_WIDTH,
  DEFAULT_BAND,
  REACH_LIMIT,
  REACH_STEP,
  applyAnswer,
  applyManualRequest,
  bandWindow,
  describeBand,
  describeDirection,
  emptyRegisterStats,
  predictRecall,
  registerStrength,
  seedBandForDelf,
  targetComplexity,
  weakestRegisters,
  type ComplexityBand,
} from '@/domain/complexity';

describe('seeding', () => {
  it('starts each DELF lens somewhere different', () => {
    const centers = (['A1', 'A2', 'B1', 'B2'] as const).map(
      (level) => seedBandForDelf(level).center,
    );
    expect(centers).toEqual([...centers].sort((a, b) => a - b));
    expect(new Set(centers).size).toBe(4);
  });

  it('starts with no ambition either way', () => {
    expect(seedBandForDelf('B1').reach).toBe(0);
  });
});

describe('prediction', () => {
  it('is a coin flip when the item sits exactly at the learner level', () => {
    expect(predictRecall({ center: 0.6, reach: 0 }, 0.6)).toBeCloseTo(0.5, 6);
  });

  it('falls as the item gets harder than the learner', () => {
    const band = { center: 0.6, reach: 0 };
    expect(predictRecall(band, 0.8)).toBeLessThan(predictRecall(band, 0.6));
    expect(predictRecall(band, 0.4)).toBeGreaterThan(predictRecall(band, 0.6));
  });
});

describe('the four rounds from the brief', () => {
  it('reaches higher after each success and steps back after a miss', () => {
    // Round 1 — "postérieurement à" at the learner's level, answered correctly.
    let band: ComplexityBand = { center: 0.55, reach: 0 };
    const startTarget = targetComplexity(band);

    const round1 = applyAnswer(band, 0.55, true);
    band = round1.band;
    expect(round1.direction).toBe('raised');
    expect(band.center).toBeGreaterThan(0.55);
    expect(band.reach).toBeCloseTo(REACH_STEP, 6);
    const round1Target = targetComplexity(band);
    expect(round1Target).toBeGreaterThan(startTarget);

    // Round 2 — Eclipse aims higher; the learner recovers "faciliter" too.
    const round2 = applyAnswer(band, round1Target, true);
    band = round2.band;
    expect(round2.direction).toBe('raised');
    expect(band.reach).toBeCloseTo(REACH_STEP * 2, 6);
    const round2Target = targetComplexity(band);
    expect(round2Target).toBeGreaterThan(round1Target);

    // Round 3 — Eclipse reaches for "ambigu" and the learner picks "ambitieux".
    const round3 = applyAnswer(band, round2Target, false);
    band = round3.band;
    expect(round3.direction).toBe('lowered');
    expect(band.center).toBeLessThan(round2.band.center);
    // Ambition does not merely stop: it goes negative, so the next item is
    // easier than the learner's own level rather than equal to it.
    expect(band.reach).toBeLessThan(0);
    expect(targetComplexity(band)).toBeLessThan(round2Target);

    // Round 4 — a success from the consolidating position climbs again.
    const round4 = applyAnswer(band, targetComplexity(band), true);
    expect(round4.direction).toBe('raised');
    expect(round4.band.reach).toBeGreaterThan(band.reach);
  });
});

describe('oscillation', () => {
  it('never lets ambition run away, however long the streak', () => {
    let band = DEFAULT_BAND;
    for (let index = 0; index < 30; index += 1) {
      band = applyAnswer(band, targetComplexity(band), true).band;
    }
    expect(band.reach).toBeLessThanOrEqual(REACH_LIMIT);
    expect(band.center).toBeLessThanOrEqual(1);
  });

  it('never drives a struggling learner below the floor', () => {
    let band = DEFAULT_BAND;
    for (let index = 0; index < 30; index += 1) {
      band = applyAnswer(band, targetComplexity(band), false).band;
    }
    expect(band.reach).toBeGreaterThanOrEqual(-REACH_LIMIT);
    expect(band.center).toBeGreaterThanOrEqual(0);
  });

  it('backs off faster than it pushes', () => {
    const band = { center: 0.5, reach: 0 };
    const up = applyAnswer(band, 0.5, true).band.center - 0.5;
    const down = 0.5 - applyAnswer(band, 0.5, false).band.center;
    expect(down).toBeGreaterThan(up);
  });

  it('moves the centre more for a hard win than an easy one', () => {
    const band = { center: 0.6, reach: 0 };
    const easy = applyAnswer(band, 0.3, true).band.center - 0.6;
    const hard = applyAnswer(band, 0.85, true).band.center - 0.6;
    expect(hard).toBeGreaterThan(easy);
  });
});

describe('the window handed to the model', () => {
  it('is centred on the target and clamped to the unit range', () => {
    const [low, high] = bandWindow({ center: 0.5, reach: 0 });
    expect(low).toBeCloseTo(0.5 - BAND_HALF_WIDTH, 6);
    expect(high).toBeCloseTo(0.5 + BAND_HALF_WIDTH, 6);

    const [clampedLow, clampedHigh] = bandWindow({ center: 1, reach: REACH_LIMIT });
    expect(clampedLow).toBeGreaterThanOrEqual(0);
    expect(clampedHigh).toBeLessThanOrEqual(1);
  });
});

describe('manual requests', () => {
  it('nudge the band down without punishing ambition', () => {
    const band = { center: 0.6, reach: REACH_STEP };
    const update = applyManualRequest(band, 0.75);
    expect(update.band.center).toBeLessThan(0.6);
    // Ambition retires to neutral rather than going negative: asking a question
    // is not the same as getting one wrong.
    expect(update.band.reach).toBe(0);
  });

  it('weigh less than an outright miss', () => {
    const band = { center: 0.6, reach: 0 };
    const asked = 0.6 - applyManualRequest(band, 0.75).band.center;
    const missed = 0.6 - applyAnswer(band, 0.75, false).band.center;
    expect(asked).toBeGreaterThan(0);
    expect(asked).toBeLessThan(missed);
  });
});

describe('Core #2 — register ranking', () => {
  it('places an unseen register at the midpoint, not at zero', () => {
    expect(registerStrength({ attempts: 0, correct: 0 })).toBeCloseTo(0.5, 6);
  });

  it('does not let one wrong answer condemn a whole category', () => {
    const oneMiss = registerStrength({ attempts: 1, correct: 0 });
    expect(oneMiss).toBeGreaterThan(0);
    expect(oneMiss).toBeLessThan(0.5);
  });

  it('ranks the categories the learner actually struggles with first', () => {
    const stats = emptyRegisterStats();
    stats.idiom = { attempts: 6, correct: 0 };
    stats.academic = { attempts: 6, correct: 2 };
    stats.everyday = { attempts: 6, correct: 6 };

    const weakest = weakestRegisters(stats, 2);
    expect(weakest[0]).toBe('idiom');
    expect(weakest[1]).toBe('academic');
    expect(weakest).not.toContain('everyday');
  });

  it('is deterministic when categories tie', () => {
    const stats = emptyRegisterStats();
    expect(weakestRegisters(stats, 6)).toEqual(weakestRegisters(stats, 6));
    expect(weakestRegisters(stats, 2)).toEqual(['academic', 'everyday']);
  });
});

describe('copy', () => {
  it('describes each band region in French', () => {
    const seen = new Set(
      [0.1, 0.45, 0.6, 0.9].map((target) => describeBand({ center: target, reach: 0 })),
    );
    expect(seen.size).toBe(4);
    for (const line of seen) expect(line.startsWith('Eclipse')).toBe(true);
  });

  it('has a distinct line for each direction', () => {
    const lines = (['raised', 'lowered', 'held'] as const).map(describeDirection);
    expect(new Set(lines).size).toBe(3);
  });
});
