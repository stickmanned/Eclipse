/**
 * Active-session state, owned exclusively by the background worker.
 *
 * Lives in `storage.session` so it disappears when the browser closes and
 * survives a service-worker restart in between. There is at most one active
 * Eclipse session across all tabs.
 */

import { z } from 'zod';
import { guarded, type StorageArea } from './area';
import { SESSION_KEY } from './keys';
import type { Result } from '../domain/errors';
import { success } from '../domain/errors';

export const activeSessionSchema = z
  .object({
    sessionId: z.string().min(1),
    tabId: z.number().int(),
    startedAt: z.string(),
    phase: z.enum(['pending', 'active']).optional(),
  })
  .transform((session) => ({ ...session, phase: session.phase ?? ('active' as const) }));

export type ActiveSession = z.infer<typeof activeSessionSchema>;

/** Generation is allowed during activation and after it, but never cross-session. */
export function isGenerationAuthorized(
  session: ActiveSession | null,
  senderTabId: number | undefined,
  requestedSessionId: string,
): boolean {
  return (
    session !== null && senderTabId === session.tabId && requestedSessionId === session.sessionId
  );
}

export async function readActiveSession(area: StorageArea): Promise<ActiveSession | null> {
  const read = await guarded(() => area.get(SESSION_KEY));
  if (!read.ok) return null;
  const parsed = activeSessionSchema.safeParse(read.data);
  return parsed.success ? parsed.data : null;
}

export async function writeActiveSession(
  area: StorageArea,
  session: ActiveSession,
): Promise<Result<ActiveSession>> {
  const written = await guarded(() => area.set(SESSION_KEY, session));
  if (!written.ok) return written;
  return success(session);
}

export async function clearActiveSession(area: StorageArea): Promise<Result<void>> {
  return guarded(() => area.remove(SESSION_KEY));
}
