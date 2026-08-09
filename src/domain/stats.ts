/** Pure, local-only learning activity aggregation for the popup dashboard. */

import {
  ACTIVITY_DAY_LIMIT,
  type ActivityHistory,
  type DailyLearningActivity,
  type LearningStreak,
  type ReviewEvent,
  type ReviewMode,
} from './profile';

const DAY_KEY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export interface LearningStatsSnapshot {
  /** Activity is known to be complete only from this instant onward. */
  completeSince: string;
  /** Consecutive qualifying days, still live through the day after extension. */
  currentStreak: number;
  /** Exactly 30 chronological local-calendar buckets, including today. */
  days: DailyLearningActivity[];
}

export interface ActivityRangeSummary {
  answers: number;
  correct: number;
  activeDays: number;
  contextAttempts: number;
  contextCorrect: number;
  recallAttempts: number;
  recallCorrect: number;
}

export function localDateKey(value: Date): string {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, '0');
  const day = String(value.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function shiftDateKey(value: string, days: number): string | null {
  if (!DAY_KEY_PATTERN.test(value)) return null;
  const [year, month, day] = value.split('-').map(Number);
  const shifted = new Date(Date.UTC(year ?? 0, (month ?? 1) - 1, (day ?? 1) + days));
  return [
    shifted.getUTCFullYear(),
    String(shifted.getUTCMonth() + 1).padStart(2, '0'),
    String(shifted.getUTCDate()).padStart(2, '0'),
  ].join('-');
}

function dayKeysThrough(now: Date, count = ACTIVITY_DAY_LIMIT): string[] {
  const cursor = new Date(now);
  cursor.setHours(12, 0, 0, 0);
  const keys: string[] = [];
  for (let offset = count - 1; offset >= 0; offset -= 1) {
    const day = new Date(cursor);
    day.setDate(cursor.getDate() - offset);
    keys.push(localDateKey(day));
  }
  return keys;
}

function emptyDay(date: string): DailyLearningActivity {
  return {
    date,
    contextAttempts: 0,
    contextCorrect: 0,
    recallAttempts: 0,
    recallCorrect: 0,
  };
}

export function createActivityHistory(now = new Date()): ActivityHistory {
  return { completeSince: now.toISOString(), days: [] };
}

export function createLearningStreak(): LearningStreak {
  return { count: 0 };
}

function isRecallMode(mode: ReviewMode): boolean {
  return mode === 'typed-meaning' || mode === 'bare-recall';
}

/** Extend once per local day after a correct highlighted-word answer. */
export function recordStreak(
  streak: LearningStreak,
  event: Pick<ReviewEvent, 'reviewedAt' | 'correct' | 'mode'>,
): LearningStreak {
  if (!event.correct || event.mode !== 'context-choice') return streak;
  const reviewedAt = new Date(event.reviewedAt);
  if (Number.isNaN(reviewedAt.getTime())) return streak;

  const date = localDateKey(reviewedAt);
  if (
    date === streak.lastExtendedDate ||
    (streak.lastExtendedDate && date < streak.lastExtendedDate)
  )
    return streak;

  return {
    count:
      streak.lastExtendedDate && shiftDateKey(streak.lastExtendedDate, 1) === date
        ? streak.count + 1
        : 1,
    lastExtendedDate: date,
  };
}

/** Best-effort streak migration from the bounded activity history. */
export function backfillStreak(days: readonly DailyLearningActivity[]): LearningStreak {
  const qualified = [
    ...new Set(days.filter((day) => day.contextCorrect > 0).map((day) => day.date)),
  ]
    .filter((date) => DAY_KEY_PATTERN.test(date))
    .sort();
  let streak = createLearningStreak();
  for (const date of qualified) {
    streak = {
      count:
        streak.lastExtendedDate && shiftDateKey(streak.lastExtendedDate, 1) === date
          ? streak.count + 1
          : 1,
      lastExtendedDate: date,
    };
  }
  return streak;
}

/** A streak remains live until the learner has missed one complete local day. */
export function currentStreak(streak: LearningStreak, now = new Date()): number {
  if (streak.count === 0 || !streak.lastExtendedDate) return 0;
  const today = localDateKey(now);
  const yesterday = shiftDateKey(today, -1);
  return streak.lastExtendedDate === today || streak.lastExtendedDate === yesterday
    ? streak.count
    : 0;
}

/** Fold one applied answer into a bounded sparse activity history. */
export function recordActivity(
  history: ActivityHistory,
  event: Pick<ReviewEvent, 'reviewedAt' | 'correct' | 'mode'>,
  now = new Date(event.reviewedAt),
): ActivityHistory {
  const reviewedAt = new Date(event.reviewedAt);
  if (Number.isNaN(reviewedAt.getTime())) return history;

  const allowed = new Set(dayKeysThrough(now));
  const date = localDateKey(reviewedAt);
  const days = new Map<string, DailyLearningActivity>();

  for (const day of history.days) {
    if (!allowed.has(day.date)) continue;
    days.set(day.date, { ...day });
  }

  if (allowed.has(date)) {
    const day = days.get(date) ?? emptyDay(date);
    if (isRecallMode(event.mode)) {
      day.recallAttempts += 1;
      if (event.correct) day.recallCorrect += 1;
    } else {
      day.contextAttempts += 1;
      if (event.correct) day.contextCorrect += 1;
    }
    days.set(date, day);
  }

  return {
    completeSince: history.completeSince,
    days: [...days.values()].sort((left, right) => left.date.localeCompare(right.date)),
  };
}

/** Best-effort migration backfill from retained per-concept review evidence. */
export function backfillActivity(
  events: readonly ReviewEvent[],
  now = new Date(),
): ActivityHistory {
  let history = createActivityHistory(now);
  const seen = new Set<string>();
  const ordered = [...events].sort(
    (left, right) => Date.parse(left.reviewedAt) - Date.parse(right.reviewedAt),
  );

  for (const event of ordered) {
    if (seen.has(event.interactionId)) continue;
    seen.add(event.interactionId);
    history = recordActivity(history, event, now);
  }
  return history;
}

/** Dense, popup-safe activity points. Raw review events never cross the worker boundary. */
export function summarizeActivity(
  history: ActivityHistory,
  now = new Date(),
  streak: LearningStreak = createLearningStreak(),
): LearningStatsSnapshot {
  const byDate = new Map(
    history.days
      .filter((day) => DAY_KEY_PATTERN.test(day.date))
      .map((day) => [day.date, day] as const),
  );
  return {
    completeSince: history.completeSince,
    currentStreak: currentStreak(streak, now),
    days: dayKeysThrough(now).map((date) => ({ ...(byDate.get(date) ?? emptyDay(date)) })),
  };
}

export function summarizeActivityRange(
  days: readonly DailyLearningActivity[],
): ActivityRangeSummary {
  return days.reduce<ActivityRangeSummary>(
    (summary, day) => {
      const answers = day.contextAttempts + day.recallAttempts;
      summary.answers += answers;
      summary.correct += day.contextCorrect + day.recallCorrect;
      summary.activeDays += answers > 0 ? 1 : 0;
      summary.contextAttempts += day.contextAttempts;
      summary.contextCorrect += day.contextCorrect;
      summary.recallAttempts += day.recallAttempts;
      summary.recallCorrect += day.recallCorrect;
      return summary;
    },
    {
      answers: 0,
      correct: 0,
      activeDays: 0,
      contextAttempts: 0,
      contextCorrect: 0,
      recallAttempts: 0,
      recallCorrect: 0,
    },
  );
}

/** Seven-day answer delta, withheld until both calendar ranges are complete. */
export function sevenDayAnswerDelta(
  snapshot: LearningStatsSnapshot,
  now = new Date(),
): number | null {
  const comparisonStart = new Date(now);
  comparisonStart.setHours(0, 0, 0, 0);
  comparisonStart.setDate(comparisonStart.getDate() - 13);
  if (Date.parse(snapshot.completeSince) > comparisonStart.getTime()) return null;

  const current = summarizeActivityRange(snapshot.days.slice(-7)).answers;
  const previous = summarizeActivityRange(snapshot.days.slice(-14, -7)).answers;
  return current - previous;
}

export function successRate(correct: number, attempts: number): number | null {
  return attempts === 0 ? null : Math.round((correct / attempts) * 100);
}
