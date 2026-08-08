import { describe, expect, it } from 'vitest';
import {
  CALIBRATION_QUESTION_COUNT,
  CONCEPT_SCORE_MAX,
  CONCEPT_SCORE_MIN,
  GLOBAL_ABILITY_MAX,
  GLOBAL_ABILITY_MIN,
  applyAnswer,
  calibrationAbility,
  clamp,
  difficultyLogit,
  phaseFor,
  predictCorrect,
  sigmoid,
} from '@/domain/scoring';
import { CALIBRATION_QUESTIONS, scoreCalibration, skippedCalibration } from '@/domain/calibration';

describe('calibration formula', () => {
  it('maps every possible score across the full range', () => {
    // clamp((correct - 1.5) / 1.5, -1, 1)
    expect(calibrationAbility(0)).toBeCloseTo(-1, 10);
    expect(calibrationAbility(1)).toBeCloseTo(-1 / 3, 10);
    expect(calibrationAbility(2)).toBeCloseTo(1 / 3, 10);
    expect(calibrationAbility(3)).toBeCloseTo(1, 10);
  });

  it('clamps inputs outside the question count', () => {
    expect(calibrationAbility(-5)).toBe(GLOBAL_ABILITY_MIN);
    expect(calibrationAbility(99)).toBe(GLOBAL_ABILITY_MAX);
  });

  it('asks exactly three questions, in ascending difficulty', () => {
    expect(CALIBRATION_QUESTIONS).toHaveLength(CALIBRATION_QUESTION_COUNT);
    expect(CALIBRATION_QUESTIONS.map((question) => question.targetSurface)).toEqual([
      'bonjour',
      'bibliothèque',
      'avoir le cafard',
    ]);
  });

  it('offers the required distractors', () => {
    const library = CALIBRATION_QUESTIONS[1];
    expect(library?.choices).toContain('a bookstore');
    const cafard = CALIBRATION_QUESTIONS[2];
    expect(cafard?.choices).toContain('he saw a cockroach');
  });

  it('scores a completed run', () => {
    const perfect = scoreCalibration(CALIBRATION_QUESTIONS.map((q) => q.acceptedChoice));
    expect(perfect.correctAnswers).toBe(3);
    expect(perfect.globalAbility).toBeCloseTo(1, 10);

    const none = scoreCalibration(['x', 'y', 'z']);
    expect(none.correctAnswers).toBe(0);
    expect(none.globalAbility).toBeCloseTo(-1, 10);
  });

  it('lands a skipped calibration at neutral ability', () => {
    const skipped = skippedCalibration();
    expect(skipped.globalAbility).toBe(0);
    expect(skipped.completed).toBe(true);
  });
});

describe('prediction', () => {
  it('is a sigmoid of ability plus concept score minus difficulty', () => {
    expect(sigmoid(0)).toBeCloseTo(0.5, 10);
    expect(difficultyLogit(0.5)).toBe(0);
    expect(difficultyLogit(1)).toBe(1);
    expect(difficultyLogit(0)).toBe(-1);
    expect(predictCorrect(0, 0, 0.5)).toBeCloseTo(0.5, 10);
  });

  it('rises with ability and falls with difficulty', () => {
    expect(predictCorrect(1, 0, 0.5)).toBeGreaterThan(predictCorrect(0, 0, 0.5));
    expect(predictCorrect(0, 0, 0.9)).toBeLessThan(predictCorrect(0, 0, 0.1));
  });
});

describe('mastery update', () => {
  it('moves the concept score by 0.6 * delta and ability by 0.1 * delta', () => {
    const result = applyAnswer({
      globalAbility: 0,
      conceptScore: 0,
      difficulty: 0.5,
      correct: true,
    });
    expect(result.predictedCorrect).toBeCloseTo(0.5, 10);
    expect(result.delta).toBeCloseTo(0.5, 10);
    expect(result.conceptScore).toBeCloseTo(0.3, 10);
    expect(result.globalAbility).toBeCloseTo(0.05, 10);
  });

  it('moves down on an incorrect answer', () => {
    const result = applyAnswer({
      globalAbility: 0,
      conceptScore: 0,
      difficulty: 0.5,
      correct: false,
    });
    expect(result.delta).toBeCloseTo(-0.5, 10);
    expect(result.conceptScore).toBeCloseTo(-0.3, 10);
    expect(result.globalAbility).toBeCloseTo(-0.05, 10);
  });

  it('clamps the concept score to -2..2', () => {
    const high = applyAnswer({
      globalAbility: 1,
      conceptScore: CONCEPT_SCORE_MAX,
      difficulty: 0,
      correct: true,
    });
    expect(high.conceptScore).toBeLessThanOrEqual(CONCEPT_SCORE_MAX);

    const low = applyAnswer({
      globalAbility: -1,
      conceptScore: CONCEPT_SCORE_MIN,
      difficulty: 1,
      correct: false,
    });
    expect(low.conceptScore).toBeGreaterThanOrEqual(CONCEPT_SCORE_MIN);
  });

  it('clamps global ability to -1..1', () => {
    let ability = 0;
    for (let i = 0; i < 200; i += 1) {
      ability = applyAnswer({
        globalAbility: ability,
        conceptScore: 0,
        difficulty: 0.5,
        correct: true,
      }).globalAbility;
    }
    expect(ability).toBeLessThanOrEqual(GLOBAL_ABILITY_MAX);

    for (let i = 0; i < 400; i += 1) {
      ability = applyAnswer({
        globalAbility: ability,
        conceptScore: 0,
        difficulty: 0.5,
        correct: false,
      }).globalAbility;
    }
    expect(ability).toBeGreaterThanOrEqual(GLOBAL_ABILITY_MIN);
  });

  it('gives a bigger correction for a surprising outcome', () => {
    const surprising = applyAnswer({
      globalAbility: 1,
      conceptScore: 2,
      difficulty: 0,
      correct: false,
    });
    const expected = applyAnswer({
      globalAbility: 0,
      conceptScore: 0,
      difficulty: 0.5,
      correct: false,
    });
    expect(Math.abs(surprising.delta)).toBeGreaterThan(Math.abs(expected.delta));
  });
});

describe('moon phase thresholds', () => {
  it('reports new_moon with no attempts, whatever the score', () => {
    expect(phaseFor(0, 0, 0)).toBe('new_moon');
    expect(phaseFor(2, 0, 0)).toBe('new_moon');
  });

  it('reports new_moon below -0.5', () => {
    expect(phaseFor(-0.51, 3, 0)).toBe('new_moon');
    expect(phaseFor(-2, 5, 1)).toBe('new_moon');
  });

  it('reports crescent from -0.5 up to 0.5', () => {
    expect(phaseFor(-0.5, 1, 0)).toBe('crescent');
    expect(phaseFor(0, 1, 0)).toBe('crescent');
    expect(phaseFor(0.49, 1, 0)).toBe('crescent');
  });

  it('reports half from 0.5 up to 1.25', () => {
    expect(phaseFor(0.5, 1, 1)).toBe('half');
    expect(phaseFor(1.24, 2, 2)).toBe('half');
  });

  it('reports full at 1.25 with at least three attempts and two correct', () => {
    expect(phaseFor(1.25, 3, 2)).toBe('full');
    expect(phaseFor(2, 10, 9)).toBe('full');
  });

  it('holds a high score at half without the evidence behind it', () => {
    // One lucky guess must never fill the moon.
    expect(phaseFor(1.5, 1, 1)).toBe('half');
    expect(phaseFor(1.5, 3, 1)).toBe('half');
    expect(phaseFor(1.5, 2, 2)).toBe('half');
  });
});

describe('clamp', () => {
  it('bounds values and handles NaN', () => {
    expect(clamp(5, 0, 1)).toBe(1);
    expect(clamp(-5, 0, 1)).toBe(0);
    expect(clamp(0.5, 0, 1)).toBe(0.5);
    expect(clamp(Number.NaN, 0, 1)).toBe(0);
  });
});
