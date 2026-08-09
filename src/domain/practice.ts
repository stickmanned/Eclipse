/** Pure ordering for learner-started vocabulary practice. */

import type { LearningPhase, VocabularyItem } from './profile';
import { stableHash } from './ids';

export const PRACTICE_SESSION_LIMIT = 10;

export function normalizePracticeAnswer(value: string): string {
  return value
    .normalize('NFC')
    .trim()
    .toLocaleLowerCase('en')
    .replace(/[’‘]/g, "'")
    .replace(/^[\s.,!?;:'"()[\]{}-]+|[\s.,!?;:'"()[\]{}-]+$/g, '')
    .replace(/\s+/g, ' ');
}

function comparableMeanings(value: string): Set<string> {
  const normalized = normalizePracticeAnswer(value);
  const withoutParenthetical = normalizePracticeAnswer(value.replace(/\s*\([^)]*\)\s*/g, ' '));
  const variants = new Set([normalized, withoutParenthetical]);
  for (const candidate of [...variants]) {
    variants.add(candidate.replace(/^to\s+/, ''));
    variants.add(candidate.replace(/^(?:a|an|the)\s+/, ''));
  }
  variants.delete('');
  return variants;
}

/** Canonical meaning plus explicitly authored slash/semicolon aliases. */
export function isPracticeAnswerCorrect(answer: string, expected: string): boolean {
  const submitted = comparableMeanings(answer);
  if (submitted.size === 0) return false;
  const accepted = expected
    .split(/\s*(?:\/|;|\|)\s*/)
    .flatMap((meaning) => [...comparableMeanings(meaning)]);
  return accepted.some((meaning) => submitted.has(meaning));
}

export function isVocabularyDue(item: VocabularyItem, now: Date): boolean {
  if (item.due.kind === 'next_occurrence') return true;
  return item.due.kind === 'timestamp' && Date.parse(item.due.at) <= now.getTime();
}

function phaseRank(phase: LearningPhase): number {
  return phase === 'crescent' ? 0 : phase === 'half' ? 1 : 2;
}

function dueRank(item: VocabularyItem, now: Date): number {
  if (item.due.kind === 'next_occurrence') return 0;
  if (isVocabularyDue(item, now)) return 1;
  return 2;
}

/**
 * Due failures first, then overdue reviews, then the weakest non-mastered
 * items. Full Moon is terminal for Practice weakest and is never reintroduced
 * by due scheduling or an all-mastered fallback.
 */
export function buildPracticeQueue(
  items: readonly VocabularyItem[],
  now: Date,
  limit = PRACTICE_SESSION_LIMIT,
  seed = now.toISOString(),
): VocabularyItem[] {
  if (limit <= 0) return [];

  const pool = items.filter((item) => item.phase !== 'full');

  return [...pool]
    .sort((left, right) => {
      const byDue = dueRank(left, now) - dueRank(right, now);
      if (byDue !== 0) return byDue;
      if (isVocabularyDue(left, now) && left.retrievability !== right.retrievability) {
        return left.retrievability - right.retrievability;
      }
      const byPhase = phaseRank(left.phase) - phaseRank(right.phase);
      if (byPhase !== 0) return byPhase;
      const leftAccuracy = left.attempts === 0 ? 0 : left.correct / left.attempts;
      const rightAccuracy = right.attempts === 0 ? 0 : right.correct / right.attempts;
      if (leftAccuracy !== rightAccuracy) return leftAccuracy - rightAccuracy;
      const byUpdated = Date.parse(left.updatedAt) - Date.parse(right.updatedAt);
      if (byUpdated !== 0) return byUpdated;
      const bySeed = stableHash(`${seed}:${left.conceptId}`).localeCompare(
        stableHash(`${seed}:${right.conceptId}`),
      );
      if (bySeed !== 0) return bySeed;
      return left.conceptId.localeCompare(right.conceptId);
    })
    .slice(0, limit);
}
