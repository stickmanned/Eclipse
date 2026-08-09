/**
 * DELF reading levels used as Eclipse's learner-facing difficulty contract.
 *
 * `globalAbility` remains the small adaptive value used by mastery scoring.
 * `DelfLevel` is deliberately separate and stable: answering one article
 * challenge must not silently change the reading lens the learner selected or
 * earned in the diagnostic.
 */

export const DELF_LEVELS = ['A1', 'A2', 'B1', 'B2'] as const;
export type DelfLevel = (typeof DELF_LEVELS)[number];

export const DELF_LEVEL_COPY: Readonly<
  Record<DelfLevel, { label: string; description: string; ability: number }>
> = {
  A1: {
    label: 'Discover',
    description: 'Everyday words and short, concrete phrases.',
    ability: -0.75,
  },
  A2: {
    label: 'Connect',
    description: 'Frequent vocabulary and useful expressions in context.',
    ability: -0.25,
  },
  B1: {
    label: 'Navigate',
    description: 'Independent-reading vocabulary and multi-word phrases.',
    ability: 0.25,
  },
  B2: {
    label: 'Refine',
    description: 'Nuanced vocabulary, idioms, and abstract phrasing.',
    ability: 0.75,
  },
} as const;

/** Difficulty windows aligned with non-overlapping CEFR / DELF levels. */
export const DELF_DIFFICULTY_RANGE: Readonly<Record<DelfLevel, readonly [number, number]>> = {
  A1: [0, 0.29],
  A2: [0.3, 0.49],
  B1: [0.5, 0.69],
  B2: [0.7, 1],
} as const;

export function abilityForDelfLevel(level: DelfLevel): number {
  return DELF_LEVEL_COPY[level].ability;
}

export function delfLevelFromAbility(ability: number): DelfLevel {
  if (ability < -0.5) return 'A1';
  if (ability < 0) return 'A2';
  if (ability < 0.5) return 'B1';
  return 'B2';
}

export function delfLevelForDifficulty(difficulty: number): DelfLevel {
  if (difficulty < 0.3) return 'A1';
  if (difficulty < 0.5) return 'A2';
  if (difficulty < 0.7) return 'B1';
  return 'B2';
}

export function difficultyMatchesDelfLevel(difficulty: number, level: DelfLevel): boolean {
  const [minimum, maximum] = DELF_DIFFICULTY_RANGE[level];
  return difficulty >= minimum && difficulty <= maximum;
}
