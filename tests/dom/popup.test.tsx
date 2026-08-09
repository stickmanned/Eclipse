/**
 * The popup, rendered with the real React runtime against a scripted worker.
 *
 * This suite exists because of a real failure: a popup built from new source
 * talked to a service worker Chrome had kept alive from an older build, the
 * worker's schema rejected the new `SAVE_CALIBRATION` payload, and the learner
 * was shown "Unrecognised message." with nothing to do about it. Everything
 * below pins the two halves of that: the message the popup sends must be one
 * the current contract accepts, and a peer from another build must produce
 * copy that names the fix.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createRoot, type Root } from 'react-dom/client';
import { act } from 'react';
import type { StatusData } from '@/domain/messages';

const sendMessage = vi.fn();
const reload = vi.fn();

vi.mock('wxt/browser', () => ({
  browser: { runtime: { sendMessage, reload } },
}));

const { App } = await import('@/entrypoints/popup/App');
const { MESSAGE_CONTRACT_VERSION, parseMessage } = await import('@/domain/messages');
const { STALE_WORKER_MESSAGE } = await import('@/domain/errors');

interface StatusOverrides {
  contractVersion?: number;
  calibrationCompleted?: boolean;
  vocabulary?: StatusData['vocabulary'];
}

const trackedVocabulary: StatusData['vocabulary'][number] = {
  conceptId: 'fr:attendre:wait',
  targetSurface: 'attendre',
  englishMeaning: 'wait',
  kind: 'word',
  phase: 'crescent',
  attempts: 2,
  correct: 1,
  intervalDays: 0,
  unassistedCorrect: 0,
  lapses: 1,
  stability: 0.2,
  retrievability: 0.2,
  successfulReviewDays: [],
  contextCount: 1,
  memoryDimmed: false,
  due: { kind: 'next_occurrence' },
  updatedAt: '2026-08-08T12:00:00.000Z',
};

function statusData(overrides: StatusOverrides = {}) {
  return {
    contractVersion: MESSAGE_CONTRACT_VERSION,
    activeTabId: null,
    activeSessionId: null,
    activeHere: false,
    page: { supported: true } as const,
    calibrationCompleted: false,
    delfLevel: 'B1' as const,
    globalAbility: 0.25,
    phase: 'new_moon' as const,
    summary: {
      tracked: 0,
      attempts: 0,
      correct: 0,
      due: 0,
      byPhase: { crescent: 0, half: 0, full: 0 },
      overallPhase: 'new_moon' as const,
    },
    vocabulary: [],
    provider: {
      configured: true,
      enabled: true,
      permissionGranted: true,
      lastError: null,
    },
    profileError: null,
    ...overrides,
  };
}

let container: HTMLElement;
let root: Root;

/** Render and let the popup's initial GET_STATUS settle. */
async function mount(): Promise<void> {
  await act(async () => {
    root.render(<App />);
  });
}

function text(): string {
  return container.textContent ?? '';
}

function button(name: string): HTMLButtonElement | undefined {
  return Array.from(container.querySelectorAll('button')).find((element) =>
    (element.textContent ?? '').includes(name),
  );
}

async function click(name: string): Promise<void> {
  const target = button(name);
  if (!target) throw new Error(`No button matching "${name}". Rendered: ${text()}`);
  await act(async () => {
    target.click();
  });
}

/** The payloads the popup actually sent, in order. */
function sent(): Record<string, unknown>[] {
  return sendMessage.mock.calls.map(([payload]) => payload as Record<string, unknown>);
}

beforeEach(() => {
  document.body.innerHTML = '';
  container = document.createElement('div');
  document.body.append(container);
  root = createRoot(container);
  sendMessage.mockReset();
  reload.mockReset();
});

afterEach(() => {
  act(() => {
    root.unmount();
  });
  container.remove();
});

describe('the popup against a worker on the current contract', () => {
  beforeEach(() => {
    sendMessage.mockImplementation((message: { type: string }) => {
      if (message.type === 'GET_STATUS') return Promise.resolve({ ok: true, data: statusData() });
      if (message.type === 'SAVE_CALIBRATION') {
        return Promise.resolve({ ok: true, data: { globalAbility: 0.25, delfLevel: 'B1' } });
      }
      return Promise.resolve({ ok: true, data: {} });
    });
  });

  it('sends a SAVE_CALIBRATION the current schema accepts when a level is picked', async () => {
    await mount();
    expect(text()).toContain('Set your DELF level');

    await click('B1');

    const calibration = sent().find((payload) => payload.type === 'SAVE_CALIBRATION');
    expect(calibration).toBeDefined();
    // The regression in one line: whatever the popup sends must survive the
    // very parser the worker runs on it.
    expect(parseMessage(calibration)).not.toBeNull();
    expect(calibration).toMatchObject({ delfLevel: 'B1', method: 'self_selected' });
  });

  it('sends a diagnostic result the current schema accepts', async () => {
    await mount();
    await click('Take the comprehension diagnostic');

    // Answer every question with its first choice, then accept the result.
    for (let guard = 0; guard < 40 && !button('Use DELF'); guard += 1) {
      const choice = container.querySelector<HTMLButtonElement>('.cal-choice:not([disabled])');
      const advance = button('Next question') ?? button('See my result');
      const target = advance ?? choice;
      if (!target) break;
      await act(async () => {
        target.click();
      });
    }

    expect(text()).toContain('Diagnostic complete');
    await click('Use DELF');

    const calibration = sent().find((payload) => payload.type === 'SAVE_CALIBRATION');
    expect(parseMessage(calibration)).not.toBeNull();
    expect(calibration).toMatchObject({ method: 'diagnostic' });
  });

  it('shows no stale-worker notice when both halves agree', async () => {
    await mount();
    expect(text()).not.toContain(STALE_WORKER_MESSAGE);
    expect(button('Reload Eclipse')).toBeUndefined();
  });

  it('exposes an accessible four-view tab interface after calibration', async () => {
    sendMessage.mockImplementation((message: { type: string }) => {
      if (message.type === 'GET_STATUS') {
        return Promise.resolve({
          ok: true,
          data: statusData({ calibrationCompleted: true }),
        });
      }
      return Promise.resolve({ ok: true, data: {} });
    });

    await mount();
    const tabs = Array.from(container.querySelectorAll<HTMLButtonElement>('[role="tab"]'));
    expect(tabs).toHaveLength(4);
    expect(tabs.map((tab) => tab.textContent)).toEqual(['Session', 'Vocab', 'Stats', 'Settings']);
    expect(tabs[0]?.getAttribute('aria-selected')).toBe('true');

    await act(async () => {
      tabs[0]?.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true, cancelable: true }),
      );
    });
    expect(tabs[1]?.getAttribute('aria-selected')).toBe('true');
    expect(container.querySelector('[role="tabpanel"]')?.getAttribute('aria-labelledby')).toBe(
      'eclipse-tab-vocabulary',
    );
  });

  it('renders tracked vocabulary as French-to-English deck rows', async () => {
    sendMessage.mockImplementation((message: { type: string }) => {
      if (message.type === 'GET_STATUS') {
        return Promise.resolve({
          ok: true,
          data: statusData({
            calibrationCompleted: true,
            vocabulary: [trackedVocabulary],
          }),
        });
      }
      return Promise.resolve({ ok: true, data: {} });
    });

    await mount();
    await click('Vocab');

    expect(text()).toContain('Vocabulary deck');
    expect(container.querySelector('[lang="fr-FR"]')?.textContent).toBe('attendre');
    expect(text()).toContain('wait');
    expect(text()).toContain('Crescent');
    expect(text()).toContain('Practice now');
    expect(container.querySelectorAll('.phase-filters button')).toHaveLength(4);
    expect(text()).not.toContain('New Moon');
    expect(container.querySelector('.mini-progress')).toBeNull();
    expect(container.querySelector('.vocabulary-meta')?.textContent).not.toContain('%');
  });

  it('keeps a long phrase intact in a scrollable phrase surface', async () => {
    const phrase = {
      ...trackedVocabulary,
      conceptId: 'fr:une-seule-commande-pour-installer:one-command-to-install',
      targetSurface: 'Une seule commande pour installer le système',
      englishMeaning: 'One command to install the system',
      kind: 'phrase' as const,
    };
    sendMessage.mockImplementation((message: { type: string }) => {
      if (message.type === 'GET_STATUS') {
        return Promise.resolve({
          ok: true,
          data: statusData({ calibrationCompleted: true, vocabulary: [phrase] }),
        });
      }
      return Promise.resolve({ ok: true, data: {} });
    });

    await mount();
    await click('Vocab');

    const surface = container.querySelector<HTMLElement>('.phrase-scroll');
    expect(surface?.textContent).toBe(phrase.targetSurface);
    expect(surface?.title).toBe(phrase.targetSurface);
  });

  it('records typed recall without assistance through the shared writer', async () => {
    sendMessage.mockImplementation((message: { type: string; interactionId?: string }) => {
      if (message.type === 'GET_STATUS') {
        return Promise.resolve({
          ok: true,
          data: statusData({ calibrationCompleted: true, vocabulary: [trackedVocabulary] }),
        });
      }
      if (message.type === 'RECORD_ANSWER') {
        return Promise.resolve({
          ok: true,
          data: {
            interactionId: message.interactionId,
            applied: true,
            previousPhase: 'crescent',
            phase: 'half',
            mastery: {
              unassistedCorrect: 1,
              due: { kind: 'timestamp', at: '2026-08-10T12:00:00.000Z' },
            },
          },
        });
      }
      return Promise.resolve({ ok: true, data: {} });
    });

    await mount();
    await click('Vocab');
    await click('Review now');
    const input = container.querySelector<HTMLInputElement>('.practice-answer input');
    expect(input).not.toBeNull();
    await act(async () => {
      if (!input) return;
      const valueSetter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set;
      valueSetter?.call(input, 'to wait');
      input.dispatchEvent(new Event('input', { bubbles: true }));
    });
    expect(button('Check answer')?.disabled).toBe(false);
    await click('Check answer');

    const answer = sent().find((payload) => payload.type === 'RECORD_ANSWER');
    expect(answer).toMatchObject({
      correct: true,
      assisted: false,
      mode: 'typed-meaning',
      conceptId: 'fr:attendre:wait',
    });
    expect(parseMessage(answer)).not.toBeNull();
    expect(text()).toContain('Half Moon');
  });

  it('puts a missed practice item back at session end for one correction', async () => {
    sendMessage.mockImplementation((message: { type: string; interactionId?: string }) => {
      if (message.type === 'GET_STATUS') {
        return Promise.resolve({
          ok: true,
          data: statusData({ calibrationCompleted: true, vocabulary: [trackedVocabulary] }),
        });
      }
      if (message.type === 'RECORD_ANSWER') {
        return Promise.resolve({
          ok: true,
          data: {
            interactionId: message.interactionId,
            applied: true,
            previousPhase: 'crescent',
            phase: 'crescent',
            mastery: { due: { kind: 'next_occurrence' } },
          },
        });
      }
      return Promise.resolve({ ok: true, data: {} });
    });

    await mount();
    await click('Vocab');
    await click('Review now');
    await click("I don't know");

    expect(sent().find((payload) => payload.type === 'RECORD_ANSWER')).toMatchObject({
      correct: false,
      assisted: false,
    });
    expect(text()).toContain('queued for relearning');
    expect(text()).toContain('1 of 2');
    await click('Next word');
    expect(text()).toContain('2 of 2');
  });
});

describe('the popup against a worker from another build', () => {
  it('names the fix as soon as GET_STATUS reports a different contract', async () => {
    sendMessage.mockImplementation((message: { type: string }) => {
      if (message.type === 'GET_STATUS') {
        // A pre-v2 worker answers GET_STATUS fine and simply omits the field.
        const { contractVersion: _omitted, ...legacy } = statusData();
        return Promise.resolve({ ok: true, data: legacy });
      }
      return Promise.resolve(undefined);
    });

    await mount();

    expect(text()).toContain(STALE_WORKER_MESSAGE);
    expect(button('Reload Eclipse')).toBeDefined();
  });

  it('reloads the extension when the learner presses the button', async () => {
    sendMessage.mockImplementation(() =>
      Promise.resolve({ ok: true, data: statusData({ contractVersion: 1 }) }),
    );

    await mount();
    await click('Reload Eclipse');

    expect(reload).toHaveBeenCalledTimes(1);
  });

  it('turns a rejected SAVE_CALIBRATION into the fix, not "Unrecognised message."', async () => {
    sendMessage.mockImplementation((message: { type: string }) => {
      if (message.type === 'GET_STATUS') return Promise.resolve({ ok: true, data: statusData() });
      // What the old worker did to the new payload.
      return Promise.resolve({
        ok: false,
        error: { code: 'MESSAGE_UNSUPPORTED', message: 'Unrecognised message.', recoverable: true },
      });
    });

    await mount();
    await click('B1');

    expect(text()).toContain(STALE_WORKER_MESSAGE);
    expect(text()).not.toContain('Unrecognised message.');
    expect(button('Reload Eclipse')).toBeDefined();
  });

  it('treats a dropped message the same as an explicit rejection', async () => {
    sendMessage.mockImplementation((message: { type: string }) => {
      if (message.type === 'GET_STATUS') return Promise.resolve({ ok: true, data: statusData() });
      // A listener that returns false without answering resolves `undefined`.
      return Promise.resolve(undefined);
    });

    await mount();
    await click('B1');

    expect(text()).toContain(STALE_WORKER_MESSAGE);
    expect(button('Reload Eclipse')).toBeDefined();
  });

  it('turns a raw Chrome port rejection into the same actionable copy', async () => {
    sendMessage.mockImplementation((message: { type: string }) => {
      if (message.type === 'GET_STATUS') {
        return Promise.reject(
          new Error('Could not establish connection. Receiving end does not exist.'),
        );
      }
      return Promise.resolve(undefined);
    });

    await mount();

    expect(text()).toContain(STALE_WORKER_MESSAGE);
    expect(text()).not.toContain('Receiving end does not exist');
  });
});
