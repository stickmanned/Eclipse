import { describe, expect, it } from 'vitest';
import { memoryArea } from '@/storage/area';
import { SESSION_KEY } from '@/storage/keys';
import {
  isGenerationAuthorized,
  readActiveSession,
  writeActiveSession,
} from '@/storage/session-store';

const BASE = {
  sessionId: 'ses_current',
  tabId: 42,
  startedAt: '2026-08-08T12:00:00.000Z',
} as const;

describe('pending session authorization', () => {
  it('persists pending state before content activation completes', async () => {
    const area = memoryArea();
    await writeActiveSession(area, { ...BASE, phase: 'pending' });
    expect(await readActiveSession(area)).toEqual({ ...BASE, phase: 'pending' });
  });

  it('authorizes only an exact tab and session match', () => {
    const pending = { ...BASE, phase: 'pending' as const };
    expect(isGenerationAuthorized(pending, 42, 'ses_current')).toBe(true);
    expect(isGenerationAuthorized(pending, 41, 'ses_current')).toBe(false);
    expect(isGenerationAuthorized(pending, 42, 'ses_replaced')).toBe(false);
    expect(isGenerationAuthorized(null, 42, 'ses_current')).toBe(false);
  });

  it('reads legacy records as active', async () => {
    const area = memoryArea({ [SESSION_KEY]: BASE });
    expect(await readActiveSession(area)).toEqual({ ...BASE, phase: 'active' });
  });
});
