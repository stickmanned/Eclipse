/**
 * First-run DELF reading diagnostic.
 *
 * Eight questions span A1 through B2 and sample four comprehension skills.
 * The result is a practical article-reading lens, not an official DELF score.
 */

import { abilityForDelfLevel, type DelfLevel } from './delf';

export const DIAGNOSTIC_SKILLS = ['vocabulary', 'detail', 'inference', 'structure'] as const;
export type DiagnosticSkill = (typeof DIAGNOSTIC_SKILLS)[number];

export const DIAGNOSTIC_SKILL_LABEL: Readonly<Record<DiagnosticSkill, string>> = {
  vocabulary: 'Vocabulary in context',
  detail: 'Key details',
  inference: 'Inference',
  structure: 'Sentence structure',
};

export interface CalibrationQuestion {
  readonly id: string;
  readonly level: DelfLevel;
  readonly skill: DiagnosticSkill;
  readonly passage: string;
  readonly prompt: string;
  readonly choices: readonly [string, string, string];
  readonly acceptedChoice: string;
  /** Explanation shown after the learner commits an answer. */
  readonly note: string;
}

export const CALIBRATION_QUESTIONS: readonly CalibrationQuestion[] = [
  {
    id: 'diagnostic-a1-market',
    level: 'A1',
    skill: 'detail',
    passage: 'Paul va au marché. Il achète du pain et deux pommes.',
    prompt: 'What does Paul buy?',
    choices: ['Bread and two apples', 'Milk and two pears', 'A newspaper'],
    acceptedChoice: 'Bread and two apples',
    note: '“du pain et deux pommes” directly names bread and two apples.',
  },
  {
    id: 'diagnostic-a1-departure',
    level: 'A1',
    skill: 'vocabulary',
    passage: 'Le train part à huit heures, mais Marie arrive à sept heures et demie.',
    prompt: 'What does “part” mean here?',
    choices: ['Leaves', 'Shares', 'Stops'],
    acceptedChoice: 'Leaves',
    note: 'With a train and a time, “part” comes from partir: to leave or depart.',
  },
  {
    id: 'diagnostic-a2-rain',
    level: 'A2',
    skill: 'inference',
    passage: 'Comme il pleut beaucoup, Léa laisse son vélo chez elle et prend le bus.',
    prompt: 'Why does Léa take the bus?',
    choices: ['Because it is raining', 'Because her bicycle is broken', 'Because she is late'],
    acceptedChoice: 'Because it is raining',
    note: '“Comme il pleut beaucoup” gives the reason before the action.',
  },
  {
    id: 'diagnostic-a2-library',
    level: 'A2',
    skill: 'structure',
    passage: 'Il faut rendre les livres à la bibliothèque avant vendredi.',
    prompt: 'What must happen before Friday?',
    choices: ['The books must be returned', 'The books must be bought', 'The library must close'],
    acceptedChoice: 'The books must be returned',
    note: '“Il faut” expresses necessity; “rendre les livres” means to return the books.',
  },
  {
    id: 'diagnostic-b1-remote-work',
    level: 'B1',
    skill: 'inference',
    passage:
      'Depuis qu’elle travaille à distance, Nora gagne du temps le matin. Pourtant, elle a parfois du mal à terminer sa journée, car les demandes continuent d’arriver tard.',
    prompt: 'What difficulty does Nora experience?',
    choices: [
      'Work tends to extend into the evening',
      'She cannot connect to the internet',
      'Her morning commute takes longer',
    ],
    acceptedChoice: 'Work tends to extend into the evening',
    note: 'Requests keep arriving late, making it hard for her to bring the workday to an end.',
  },
  {
    id: 'diagnostic-b1-put-in-place',
    level: 'B1',
    skill: 'vocabulary',
    passage:
      'La mairie va mettre en place un service de prêt de vélos afin de réduire la circulation.',
    prompt: 'What does “mettre en place” mean in this sentence?',
    choices: ['Set up', 'Put away', 'Replace'],
    acceptedChoice: 'Set up',
    note: '“mettre en place un service” means to establish or set up a service.',
  },
  {
    id: 'diagnostic-b2-concession',
    level: 'B2',
    skill: 'structure',
    passage:
      'Bien que la mesure ait été présentée comme provisoire, rien n’indique qu’elle sera bientôt supprimée.',
    prompt: 'Which relationship does “bien que” establish?',
    choices: ['Concession', 'Cause', 'Chronological sequence'],
    acceptedChoice: 'Concession',
    note: '“Bien que” means although: the second idea contrasts with what the first might lead us to expect.',
  },
  {
    id: 'diagnostic-b2-nevertheless',
    level: 'B2',
    skill: 'detail',
    passage:
      'Le rapport reconnaît plusieurs incertitudes. Il n’en demeure pas moins que ses conclusions méritent d’être examinées.',
    prompt: 'What is the author saying about the conclusions?',
    choices: [
      'They still deserve consideration',
      'They have been disproved',
      'They should be ignored until every uncertainty is removed',
    ],
    acceptedChoice: 'They still deserve consideration',
    note: '“Il n’en demeure pas moins que” marks a conclusion that remains true despite the reservation.',
  },
] as const;

export interface DiagnosticSkillResult {
  readonly correct: number;
  readonly total: number;
}

export interface CalibrationResult {
  readonly correctAnswers: number;
  readonly globalAbility: number;
  readonly delfLevel: DelfLevel;
  readonly completed: true;
  readonly bySkill: Readonly<Record<DiagnosticSkill, DiagnosticSkillResult>>;
}

function levelForScore(correctAnswers: number): DelfLevel {
  if (correctAnswers <= 2) return 'A1';
  if (correctAnswers <= 4) return 'A2';
  if (correctAnswers <= 6) return 'B1';
  return 'B2';
}

/** Score a completed or partially completed diagnostic. */
export function scoreCalibration(answers: readonly string[]): CalibrationResult {
  const bySkill: Record<DiagnosticSkill, DiagnosticSkillResult> = {
    vocabulary: { correct: 0, total: 0 },
    detail: { correct: 0, total: 0 },
    inference: { correct: 0, total: 0 },
    structure: { correct: 0, total: 0 },
  };
  let correctAnswers = 0;

  CALIBRATION_QUESTIONS.forEach((question, index) => {
    const correct = answers[index] === question.acceptedChoice;
    if (correct) correctAnswers += 1;
    const current = bySkill[question.skill];
    bySkill[question.skill] = {
      correct: current.correct + (correct ? 1 : 0),
      total: current.total + 1,
    };
  });

  const delfLevel = levelForScore(correctAnswers);
  return {
    correctAnswers,
    globalAbility: abilityForDelfLevel(delfLevel),
    delfLevel,
    completed: true,
    bySkill,
  };
}

/** Persist a level the learner already knows without pretending it was tested. */
export function knownLevelCalibration(delfLevel: DelfLevel): CalibrationResult {
  return {
    correctAnswers: 0,
    globalAbility: abilityForDelfLevel(delfLevel),
    delfLevel,
    completed: true,
    bySkill: {
      vocabulary: { correct: 0, total: 0 },
      detail: { correct: 0, total: 0 },
      inference: { correct: 0, total: 0 },
      structure: { correct: 0, total: 0 },
    },
  };
}

/** Backwards-compatible programmatic default. The popup no longer offers Skip. */
export function skippedCalibration(): CalibrationResult {
  return knownLevelCalibration('B1');
}
