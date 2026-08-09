import { describe, expect, it } from 'vitest';
import {
  backfillActivity,
  backfillStreak,
  createActivityHistory,
  createLearningStreak,
  currentStreak,
  localDateKey,
  recordActivity,
  recordStreak,
  sevenDayAnswerDelta,
  successRate,
  summarizeActivity,
  summarizeActivityRange,
} from '@/domain/stats';
import type { ReviewEvent, ReviewMode } from '@/domain/profile';

function localNoon(year: number, month: number, day: number): Date {
  return new Date(year, month - 1, day, 12, 0, 0, 0);
}

function event(
  interactionId: string,
  reviewedAt: Date,
  mode: ReviewMode,
  correct = true,
): ReviewEvent {
  return {
    interactionId,
    reviewedAt: reviewedAt.toISOString(),
    correct,
    assisted: mode === 'context-choice',
    mode,
    scheduled: false,
    schedulerRating: correct ? 'good' : 'again',
  };
}

describe('learning activity history', () => {
  it('buckets context and recall answers on the local calendar day', () => {
    const now = localNoon(2026, 8, 9);
    let history = createActivityHistory(localNoon(2026, 7, 1));
    history = recordActivity(history, event('context', now, 'context-choice'), now);
    history = recordActivity(history, event('typed', now, 'typed-meaning', false), now);
    history = recordActivity(history, event('bare', now, 'bare-recall'), now);

    expect(history.days).toEqual([
      {
        date: localDateKey(now),
        contextAttempts: 1,
        contextCorrect: 1,
        recallAttempts: 2,
        recallCorrect: 1,
      },
    ]);
  });

  it('keeps only the latest 30 local calendar days', () => {
    const completeSince = localNoon(2026, 6, 1);
    let history = createActivityHistory(completeSince);
    for (let offset = 30; offset >= 0; offset -= 1) {
      const reviewedAt = localNoon(2026, 8, 9);
      reviewedAt.setDate(reviewedAt.getDate() - offset);
      history = recordActivity(
        history,
        event(`event-${offset}`, reviewedAt, 'context-choice'),
        localNoon(2026, 8, 9),
      );
    }

    expect(history.days).toHaveLength(30);
    expect(history.days[0]?.date).toBe(localDateKey(localNoon(2026, 7, 11)));
    expect(history.days.at(-1)?.date).toBe(localDateKey(localNoon(2026, 8, 9)));
  });

  it('backfills retained events once per interaction id', () => {
    const now = localNoon(2026, 8, 9);
    const retained = event('same', now, 'typed-meaning');
    const history = backfillActivity([retained, retained], now);

    expect(history.completeSince).toBe(now.toISOString());
    expect(history.days[0]).toMatchObject({ recallAttempts: 1, recallCorrect: 1 });
  });

  it('returns 30 chronological zero-filled snapshot points', () => {
    const now = localNoon(2026, 8, 9);
    const history = recordActivity(
      createActivityHistory(localNoon(2026, 7, 1)),
      event('today', now, 'context-choice'),
      now,
    );
    const snapshot = summarizeActivity(history, now, {
      count: 3,
      lastExtendedDate: localDateKey(now),
    });

    expect(snapshot.days).toHaveLength(30);
    expect(snapshot.currentStreak).toBe(3);
    expect(snapshot.days[0]).toMatchObject({ date: localDateKey(localNoon(2026, 7, 11)) });
    expect(snapshot.days.at(-1)).toMatchObject({
      date: localDateKey(now),
      contextAttempts: 1,
    });
    expect(snapshot.days.filter((day) => day.contextAttempts > 0)).toHaveLength(1);
  });
});

describe('daily learning streak', () => {
  it('extends once per local day only for correct highlighted-word answers', () => {
    const firstDay = localNoon(2026, 8, 8);
    const secondDay = localNoon(2026, 8, 9);
    let streak = createLearningStreak();

    streak = recordStreak(streak, event('wrong', firstDay, 'context-choice', false));
    streak = recordStreak(streak, event('recall', firstDay, 'typed-meaning', true));
    expect(streak).toEqual({ count: 0 });

    streak = recordStreak(streak, event('first', firstDay, 'context-choice', true));
    streak = recordStreak(streak, event('same-day', firstDay, 'context-choice', true));
    expect(streak).toEqual({ count: 1, lastExtendedDate: localDateKey(firstDay) });

    streak = recordStreak(streak, event('next-day', secondDay, 'context-choice', true));
    expect(streak).toEqual({ count: 2, lastExtendedDate: localDateKey(secondDay) });
  });

  it('starts over after a missed local calendar day', () => {
    const firstDay = localNoon(2026, 8, 6);
    const thirdDay = localNoon(2026, 8, 8);
    let streak = recordStreak(createLearningStreak(), event('first', firstDay, 'context-choice'));
    streak = recordStreak(streak, event('after-gap', thirdDay, 'context-choice'));
    expect(streak).toEqual({ count: 1, lastExtendedDate: localDateKey(thirdDay) });
  });

  it('stays live through the next day and expires after a full missed day', () => {
    const extended = localNoon(2026, 8, 8);
    const streak = { count: 6, lastExtendedDate: localDateKey(extended) };
    expect(currentStreak(streak, localNoon(2026, 8, 8))).toBe(6);
    expect(currentStreak(streak, localNoon(2026, 8, 9))).toBe(6);
    expect(currentStreak(streak, localNoon(2026, 8, 10))).toBe(0);
  });

  it('backfills the latest consecutive run from contextual successes', () => {
    const day = (date: string, contextCorrect: number) => ({
      date,
      contextAttempts: contextCorrect,
      contextCorrect,
      recallAttempts: 0,
      recallCorrect: 0,
    });
    expect(
      backfillStreak([
        day('2026-08-01', 1),
        day('2026-08-04', 1),
        day('2026-08-05', 1),
        day('2026-08-06', 1),
      ]),
    ).toEqual({ count: 3, lastExtendedDate: '2026-08-06' });
  });
});

describe('activity summaries', () => {
  it('reports counts, active days, and mode totals for a selected range', () => {
    const summary = summarizeActivityRange([
      {
        date: '2026-08-08',
        contextAttempts: 2,
        contextCorrect: 1,
        recallAttempts: 1,
        recallCorrect: 1,
      },
      {
        date: '2026-08-09',
        contextAttempts: 0,
        contextCorrect: 0,
        recallAttempts: 0,
        recallCorrect: 0,
      },
    ]);

    expect(summary).toEqual({
      answers: 3,
      correct: 2,
      activeDays: 1,
      contextAttempts: 2,
      contextCorrect: 1,
      recallAttempts: 1,
      recallCorrect: 1,
    });
  });

  it('withholds seven-day comparison until both weeks are complete', () => {
    const now = localNoon(2026, 8, 14);
    const incomplete = summarizeActivity(createActivityHistory(localNoon(2026, 8, 5)), now);
    expect(sevenDayAnswerDelta(incomplete, now)).toBeNull();
  });

  it('compares the latest seven days with the preceding seven', () => {
    const now = localNoon(2026, 8, 14);
    let history = createActivityHistory(localNoon(2026, 7, 1));
    for (let offset = 13; offset >= 0; offset -= 1) {
      const reviewedAt = new Date(now);
      reviewedAt.setDate(reviewedAt.getDate() - offset);
      history = recordActivity(history, event(`day-${offset}`, reviewedAt, 'context-choice'), now);
      if (offset < 7) {
        history = recordActivity(
          history,
          event(`extra-${offset}`, reviewedAt, 'typed-meaning'),
          now,
        );
      }
    }

    expect(sevenDayAnswerDelta(summarizeActivity(history, now), now)).toBe(7);
  });

  it('uses an explicit empty rate instead of NaN', () => {
    expect(successRate(0, 0)).toBeNull();
    expect(successRate(3, 4)).toBe(75);
  });
});
