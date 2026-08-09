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
import {
  CALIBRATION_QUESTIONS,
  knownLevelCalibration,
  scoreCalibration,
} from '@/domain/calibration';

describe('calibration formula', () => {
  it('maps every possible score across the full range', () => {
    expect(calibrationAbility(0)).toBeCloseTo(-1, 10);
    expect(calibrationAbility(2)).toBeCloseTo(-0.5, 10);
    expect(calibrationAbility(4)).toBeCloseTo(0, 10);
    expect(calibrationAbility(6)).toBeCloseTo(0.5, 10);
    expect(calibrationAbility(8)).toBeCloseTo(1, 10);
  });

  it('clamps inputs outside the question count', () => {
    expect(calibrationAbility(-5)).toBe(GLOBAL_ABILITY_MIN);
    expect(calibrationAbility(99)).toBe(GLOBAL_ABILITY_MAX);
  });

  it('asks eight questions spanning A1 through B2', () => {
    expect(CALIBRATION_QUESTIONS).toHaveLength(CALIBRATION_QUESTION_COUNT);
    expect(CALIBRATION_QUESTIONS.map((question) => question.level)).toEqual([
      'A1',
      'A1',
      'A2',
      'A2',
      'B1',
      'B1',
      'B2',
      'B2',
    ]);
  });

  it('samples vocabulary, details, inference, and structure', () => {
    expect(new Set(CALIBRATION_QUESTIONS.map((question) => question.skill))).toEqual(
      new Set(['vocabulary', 'detail', 'inference', 'structure']),
    );
  });

  it('scores a completed run', () => {
    const perfect = scoreCalibration(CALIBRATION_QUESTIONS.map((q) => q.acceptedChoice));
    expect(perfect.correctAnswers).toBe(8);
    expect(perfect.delfLevel).toBe('B2');

    const none = scoreCalibration(Array.from({ length: 8 }, () => 'x'));
    expect(none.correctAnswers).toBe(0);
    expect(none.delfLevel).toBe('A1');
  });

  it('maps a known level directly without claiming diagnostic answers', () => {
    const selected = knownLevelCalibration('B1');
    expect(selected.delfLevel).toBe('B1');
    expect(selected.correctAnswers).toBe(0);
    expect(selected.completed).toBe(true);
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
  it('uses one successful typed practice for Half and three for Full', () => {
    expect(phaseFor(0)).toBe('crescent');
    expect(phaseFor(1)).toBe('half');
    expect(phaseFor(2)).toBe('half');
    expect(phaseFor(3)).toBe('full');
    expect(phaseFor(20)).toBe('full');
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
