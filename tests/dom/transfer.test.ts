/**
 * The behaviour the whole product exists to demonstrate: a concept you got
 * wrong on one page comes back on the next one.
 */

import { describe, expect, it } from 'vitest';
import { memoryArea, type StorageArea } from '@/storage/area';
import { loadProfile } from '@/storage/profile-store';
import type { OverlayStore } from '@/content/overlay-store';
import { loadDemo, newSession, renderHtml } from './helpers';
import type { ContextTrap } from '@/domain/trap';

const ATTENDRE = 'fr:attendre:wait';

function conceptsOnPage(): string[] {
  return Array.from(document.querySelectorAll('[data-eclipse-concept]')).map(
    (element) => element.getAttribute('data-eclipse-concept') ?? '',
  );
}

async function activate(storage: StorageArea, file: 'demo-a.html' | 'demo-b.html', id: string) {
  renderHtml(loadDemo(file));
  const { session } = newSession(storage);
  const result = await session.activate(id);
  expect(result.ok, result.ok ? '' : result.error.message).toBe(true);
  return session;
}

function currentTrap(overlay: OverlayStore): ContextTrap | null {
  const state = overlay.getSnapshot();
  if (state.kind === 'question') return state.trap;
  if (state.kind === 'result') return state.result.trap;
  return null;
}

describe('Demo A', () => {
  it('always places the four expected concepts, attendre among them', async () => {
    const storage = memoryArea();
    await activate(storage, 'demo-a.html', 'ses_a');

    expect(conceptsOnPage().sort()).toEqual([
      'fr:actuellement:currently',
      'fr:assister-a:attend',
      'fr:attendre:wait',
      'fr:avoir-le-cafard:gloomy',
    ]);
  });
});

describe('a fresh learner on Demo B', () => {
  it('receives the broader catalog coverage allowed by the paragraph-scaled cap', async () => {
    const storage = memoryArea();
    await activate(storage, 'demo-b.html', 'ses_b');
    expect(conceptsOnPage()).toContain(ATTENDRE);
    expect(conceptsOnPage().length).toBeGreaterThan(4);
  });
});

describe('wrong answer on Demo A transfers to Demo B', () => {
  it('makes attendre due, then places it first on the next page', async () => {
    const storage = memoryArea();

    // --- Demo A: open the attendre challenge and answer it wrong -------------
    const sessionA = await activate(storage, 'demo-a.html', 'ses_a');
    const token = document.querySelector<HTMLElement>(`[data-eclipse-concept="${ATTENDRE}"]`);
    expect(token).not.toBeNull();

    token!.click();
    const trap = currentTrap(sessionA.overlay);
    expect(trap?.conceptId).toBe(ATTENDRE);
    expect(sessionA.overlay.getSnapshot().kind).toBe('question');

    const wrong = trap!.choices.find((choice) => choice !== trap!.acceptedChoice)!;
    await sessionA.submitAnswer(trap!.id, wrong);

    const answered = sessionA.overlay.getSnapshot();
    expect(answered.kind).toBe('result');
    if (answered.kind === 'result') {
      expect(answered.result.correct).toBe(false);
      expect(answered.result.persist).toBe('saved');
      expect(answered.result.reviewNote).toMatch(/next time it appears/i);
    }

    // --- the profile records the debt ----------------------------------------
    const afterA = await loadProfile(storage);
    expect(afterA.ok).toBe(true);
    if (afterA.ok) {
      const mastery = afterA.data.profile.mastery[ATTENDRE];
      expect(mastery?.due).toEqual({ kind: 'next_occurrence' });
      expect(mastery?.attempts).toBe(1);
      expect(mastery?.correct).toBe(0);
      expect(mastery?.score).toBeLessThan(0);
    }

    await sessionA.deactivate('ses_a');

    // --- Demo B: attendre is now placed, and placed first --------------------
    await activate(storage, 'demo-b.html', 'ses_b');
    const concepts = conceptsOnPage();
    expect(concepts).toContain(ATTENDRE);

    const attendreToken = document.querySelector<HTMLElement>(
      `[data-eclipse-concept="${ATTENDRE}"]`,
    );
    expect(attendreToken?.textContent).toBe('attendre');
  });

  it('clears the debt and schedules a review when the retry is correct', async () => {
    const storage = memoryArea();

    const sessionA = await activate(storage, 'demo-a.html', 'ses_a');
    const tokenA = document.querySelector<HTMLElement>(`[data-eclipse-concept="${ATTENDRE}"]`)!;
    tokenA.click();
    const trapA = currentTrap(sessionA.overlay)!;
    await sessionA.submitAnswer(
      trapA.id,
      trapA.choices.find((choice) => choice !== trapA.acceptedChoice)!,
    );
    await sessionA.deactivate('ses_a');

    const sessionB = await activate(storage, 'demo-b.html', 'ses_b');
    const tokenB = document.querySelector<HTMLElement>(`[data-eclipse-concept="${ATTENDRE}"]`)!;
    tokenB.click();
    const trapB = currentTrap(sessionB.overlay)!;
    await sessionB.submitAnswer(trapB.id, trapB.acceptedChoice);

    const state = sessionB.overlay.getSnapshot();
    expect(state.kind).toBe('result');
    if (state.kind === 'result') {
      expect(state.result.correct).toBe(true);
      expect(state.result.reviewNote).toMatch(/1 day/);
    }

    const profile = await loadProfile(storage);
    expect(profile.ok).toBe(true);
    if (profile.ok) {
      const mastery = profile.data.profile.mastery[ATTENDRE];
      expect(mastery?.due.kind).toBe('timestamp');
      expect(mastery?.attempts).toBe(2);
      expect(mastery?.correct).toBe(1);
    }
  });
});

describe('answering is idempotent', () => {
  it('a replayed answer updates mastery exactly once', async () => {
    const storage = memoryArea();
    const session = await activate(storage, 'demo-a.html', 'ses_a');

    const token = document.querySelector<HTMLElement>(`[data-eclipse-concept="${ATTENDRE}"]`)!;
    token.click();
    const trap = currentTrap(session.overlay)!;

    await session.submitAnswer(trap.id, trap.acceptedChoice);
    await session.submitAnswer(trap.id, trap.acceptedChoice);
    await session.submitAnswer(trap.id, trap.acceptedChoice);

    const profile = await loadProfile(storage);
    expect(profile.ok).toBe(true);
    if (profile.ok) {
      expect(profile.data.profile.mastery[ATTENDRE]?.attempts).toBe(1);
      expect(profile.data.profile.recentOutcomes).toHaveLength(1);
    }
  });
});

describe('recoverable storage failure', () => {
  it('still shows the Truth Card and says the answer was not saved', async () => {
    const readOnly: StorageArea = {
      async get() {
        return undefined;
      },
      async set() {
        throw new Error('disk full');
      },
      async remove() {
        throw new Error('disk full');
      },
    };

    const session = await activate(readOnly, 'demo-a.html', 'ses_a');
    const token = document.querySelector<HTMLElement>(`[data-eclipse-concept="${ATTENDRE}"]`)!;
    token.click();
    const trap = currentTrap(session.overlay)!;

    await session.submitAnswer(trap.id, trap.acceptedChoice);

    const state = session.overlay.getSnapshot();
    expect(state.kind).toBe('result');
    if (state.kind === 'result') {
      // The learner still gets the answer and the evidence.
      expect(state.result.correct).toBe(true);
      expect(state.result.persist).toBe('error');
      expect(state.result.persistMessage).toMatch(/disk full/);
    }
  });
});

describe('the token reflects the answer', () => {
  it('marks itself correct or incorrect without relying on colour alone', async () => {
    const storage = memoryArea();
    const session = await activate(storage, 'demo-a.html', 'ses_a');
    const token = document.querySelector<HTMLElement>(`[data-eclipse-concept="${ATTENDRE}"]`)!;
    token.click();
    const trap = currentTrap(session.overlay)!;

    await session.submitAnswer(trap.id, trap.acceptedChoice);
    expect(token.getAttribute('data-answered')).toBe('correct');
  });

  it('rejects a choice that was never offered', async () => {
    const storage = memoryArea();
    const session = await activate(storage, 'demo-a.html', 'ses_a');
    const token = document.querySelector<HTMLElement>(`[data-eclipse-concept="${ATTENDRE}"]`)!;
    token.click();
    const trap = currentTrap(session.overlay)!;

    const result = await session.submitAnswer(trap.id, 'something the page invented');
    expect(result.ok).toBe(false);

    const profile = await loadProfile(storage);
    if (profile.ok) expect(profile.data.profile.mastery).toEqual({});
  });
});
