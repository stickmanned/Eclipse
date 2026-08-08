/**
 * First-run calibration: three fixed French questions of ascending difficulty.
 *
 * The point is not to measure French ability precisely — it is to avoid opening
 * with a trap that is hopeless or trivial. Skipping is always allowed and
 * lands the learner at `globalAbility = 0`.
 */

import { calibrationAbility } from './scoring';

export interface CalibrationQuestion {
  readonly id: string;
  readonly targetSurface: string;
  readonly prompt: string;
  readonly choices: readonly [string, string, string];
  readonly acceptedChoice: string;
  /** Why the tempting wrong answer is wrong. Shown after the answer. */
  readonly note: string;
}

export const CALIBRATION_QUESTIONS: readonly CalibrationQuestion[] = [
  {
    id: 'cal-1-bonjour',
    targetSurface: 'bonjour',
    prompt: 'What does bonjour mean?',
    choices: ['hello', 'goodbye', 'please'],
    acceptedChoice: 'hello',
    note: 'bonjour is the everyday greeting. Leaving, you would say au revoir.',
  },
  {
    id: 'cal-2-bibliotheque',
    targetSurface: 'bibliothèque',
    prompt: 'A French student says they are going to the bibliothèque. Where are they going?',
    choices: ['a library', 'a bookstore', 'a newsstand'],
    acceptedChoice: 'a library',
    note: 'bibliothèque is a library — you borrow there. A bookstore, where you buy, is a librairie.',
  },
  {
    id: 'cal-3-cafard',
    targetSurface: 'avoir le cafard',
    prompt: 'Someone says il a le cafard. What is happening?',
    choices: ['he feels gloomy', 'he saw a cockroach', 'he is hungry'],
    acceptedChoice: 'he feels gloomy',
    note: 'cafard does mean cockroach, but avoir le cafard is fixed: to feel down. The literal reading is the trap.',
  },
] as const;

export interface CalibrationResult {
  /** Number answered correctly, 0..3. */
  readonly correctAnswers: number;
  /** Resulting `globalAbility`, -1..1. */
  readonly globalAbility: number;
  readonly completed: boolean;
}

/** Score a completed run. */
export function scoreCalibration(answers: readonly string[]): CalibrationResult {
  let correctAnswers = 0;
  CALIBRATION_QUESTIONS.forEach((question, index) => {
    if (answers[index] === question.acceptedChoice) correctAnswers += 1;
  });

  return {
    correctAnswers,
    globalAbility: calibrationAbility(correctAnswers),
    completed: true,
  };
}

/** The result of pressing Skip. Calibration is marked done at neutral ability. */
export function skippedCalibration(): CalibrationResult {
  return { correctAnswers: 0, globalAbility: 0, completed: true };
}
