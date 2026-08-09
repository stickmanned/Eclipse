/**
 * The extension's message contract.
 *
 * Popup → background:  START_SESSION, STOP_SESSION, GET_STATUS, RESET_PROFILE,
 *                      SAVE_CALIBRATION
 * Background → content: PING, ACTIVATE, DEACTIVATE
 * Content → background: GENERATE_TRAPS
 *
 * `SAVE_CALIBRATION` keeps the profile ownership boundary intact: the popup
 * reports the learner's diagnostic or self-selected DELF level and the worker
 * persists it. `SET_PROVIDER` remains only for compatibility with older popup
 * bundles; the worker always answers with enabled=true.
 *
 * Every handler returns `Success<T>` or `Failure`; nothing throws across a
 * message boundary.
 */

import { z } from 'zod';
import {
  ERROR_CODES,
  STALE_WORKER_MESSAGE,
  type Failure,
  type Result,
  type Success,
} from './errors';
import { MOON_PHASES, type MasterySummary, type MoonPhase } from './profile';
import type { GeneratedTrapCandidate } from './trap';
import { DELF_LEVELS, type DelfLevel } from './delf';

export const MESSAGE_TYPES = [
  'START_SESSION',
  'STOP_SESSION',
  'PING',
  'ACTIVATE',
  'DEACTIVATE',
  'GET_STATUS',
  'GENERATE_TRAPS',
  'RESET_PROFILE',
  'SAVE_CALIBRATION',
  'SET_PROVIDER',
] as const;

export type MessageType = (typeof MESSAGE_TYPES)[number];

/**
 * Bumped whenever a payload above changes shape in a way an older peer cannot
 * parse. Both halves of the extension compile this constant in, and the popup
 * compares the value `GET_STATUS` reports against its own — which is how a
 * popup talking to a stale service worker says "reload Eclipse" instead of
 * failing on the first message whose shape moved.
 *
 * v2: SAVE_CALIBRATION carries `delfLevel`/`method` rather than
 *     `globalAbility`/`skipped`, and GENERATE_TRAPS carries `delfLevel`.
 */
export const MESSAGE_CONTRACT_VERSION = 2;

// ---------------------------------------------------------------------------
// Payloads
// ---------------------------------------------------------------------------

export interface StartSessionMessage {
  type: 'START_SESSION';
}

export interface StopSessionMessage {
  type: 'STOP_SESSION';
}

export interface PingMessage {
  type: 'PING';
}

export interface ActivateMessage {
  type: 'ACTIVATE';
  sessionId: string;
  /** Whether the background worker may be asked for generated traps. */
  providerEnabled: boolean;
}

export interface DeactivateMessage {
  type: 'DEACTIVATE';
  /** Omit to deactivate whatever session is running. */
  sessionId?: string;
  reason?: 'user' | 'replaced' | 'reset';
}

export interface GetStatusMessage {
  type: 'GET_STATUS';
}

export interface GenerateTrapsMessage {
  type: 'GENERATE_TRAPS';
  sessionId: string;
  delfLevel: DelfLevel;
  sentences: { id: string; text: string }[];
}

export interface ResetProfileMessage {
  type: 'RESET_PROFILE';
  /** Must be `true`. Guards against an accidental send. */
  confirmed: boolean;
}

export interface SetProviderMessage {
  type: 'SET_PROVIDER';
  enabled: boolean;
}

export interface SaveCalibrationMessage {
  type: 'SAVE_CALIBRATION';
  delfLevel: DelfLevel;
  correctAnswers: number;
  method: 'diagnostic' | 'self_selected';
}

export type EclipseMessage =
  | StartSessionMessage
  | StopSessionMessage
  | PingMessage
  | ActivateMessage
  | DeactivateMessage
  | GetStatusMessage
  | GenerateTrapsMessage
  | ResetProfileMessage
  | SaveCalibrationMessage
  | SetProviderMessage;

// ---------------------------------------------------------------------------
// Response data
// ---------------------------------------------------------------------------

export interface SessionStartedData {
  sessionId: string;
  tabId: number;
  trapCount: number;
}

export interface SessionStoppedData {
  restored: boolean;
}

export interface PongData {
  runtime: 'eclipse-content';
  sessionId: string | null;
}

export interface ActivatedData {
  sessionId: string;
  trapCount: number;
  conceptIds: string[];
}

export interface DeactivatedData {
  restored: boolean;
  /** True when the restored text matched the pre-activation snapshot. */
  textVerified: boolean;
}

export type PopupPageSupport =
  { supported: true } | { supported: false; reason: 'internal' | 'file' | 'extension' | 'other' };

export interface StatusData {
  /** The worker's `MESSAGE_CONTRACT_VERSION`. Absent from pre-v2 workers. */
  contractVersion: number;
  activeTabId: number | null;
  activeSessionId: string | null;
  /** True when the tab the popup is showing is the one with a live session. */
  activeHere: boolean;
  page: PopupPageSupport;
  calibrationCompleted: boolean;
  delfLevel: DelfLevel;
  globalAbility: number;
  phase: MoonPhase;
  summary: MasterySummary;
  provider: {
    /** True once a server origin has been configured at build time. */
    configured: boolean;
    enabled: boolean;
    permissionGranted: boolean;
    lastError: string | null;
  };
  profileError: string | null;
}

export interface GenerateTrapsData {
  candidates: GeneratedTrapCandidate[];
}

export interface ResetProfileData {
  reset: true;
}

export interface SaveCalibrationData {
  globalAbility: number;
  delfLevel: DelfLevel;
}

export interface SetProviderData {
  enabled: boolean;
  permissionGranted: boolean;
}

/** Maps each message type to the shape of its success payload. */
export interface MessageResponseMap {
  START_SESSION: SessionStartedData;
  STOP_SESSION: SessionStoppedData;
  PING: PongData;
  ACTIVATE: ActivatedData;
  DEACTIVATE: DeactivatedData;
  GET_STATUS: StatusData;
  GENERATE_TRAPS: GenerateTrapsData;
  RESET_PROFILE: ResetProfileData;
  SAVE_CALIBRATION: SaveCalibrationData;
  SET_PROVIDER: SetProviderData;
}

export type ResponseFor<T extends MessageType> = Result<MessageResponseMap[T]>;

export type EclipseResponse = Result<MessageResponseMap[MessageType]>;

// ---------------------------------------------------------------------------
// Runtime validation
// ---------------------------------------------------------------------------

export const eclipseMessageSchema: z.ZodType<EclipseMessage> = z.discriminatedUnion('type', [
  z.object({ type: z.literal('START_SESSION') }),
  z.object({ type: z.literal('STOP_SESSION') }),
  z.object({ type: z.literal('PING') }),
  z.object({
    type: z.literal('ACTIVATE'),
    sessionId: z.string().min(1),
    providerEnabled: z.boolean().optional().default(true),
  }),
  z.object({
    type: z.literal('DEACTIVATE'),
    sessionId: z.string().min(1).optional(),
    reason: z.enum(['user', 'replaced', 'reset']).optional(),
  }),
  z.object({ type: z.literal('GET_STATUS') }),
  z.object({
    type: z.literal('GENERATE_TRAPS'),
    sessionId: z.string().min(1),
    delfLevel: z.enum(DELF_LEVELS),
    sentences: z
      .array(z.object({ id: z.string().min(1).max(64), text: z.string().min(1).max(300) }))
      .max(8),
  }),
  z.object({ type: z.literal('RESET_PROFILE'), confirmed: z.boolean().optional().default(true) }),
  z.object({
    type: z.literal('SAVE_CALIBRATION'),
    delfLevel: z.enum(DELF_LEVELS),
    correctAnswers: z.number().int().min(0).max(8).optional().default(0),
    method: z.enum(['diagnostic', 'self_selected']).optional().default('self_selected'),
  }),
  z.object({ type: z.literal('SET_PROVIDER'), enabled: z.boolean().optional().default(true) }),
]);

const failureSchema = z.object({
  ok: z.literal(false),
  error: z.object({
    code: z.enum(ERROR_CODES),
    message: z.string(),
    recoverable: z.boolean(),
  }),
});

/** Parse an inbound message. Unknown shapes are rejected, never coerced. */
export function parseMessage(value: unknown): EclipseMessage | null {
  const parsed = eclipseMessageSchema.safeParse(value);
  return parsed.success ? parsed.data : null;
}

/**
 * Say why a message was rejected, in terms a human reading the popup can act
 * on. A rejected message is nearly always version skew rather than a malicious
 * sender, so the copy leads with the fix and carries the field-level detail
 * behind it for whoever is looking at a console.
 */
export function describeRejectedMessage(value: unknown): string {
  const type = (value as { type?: unknown } | null | undefined)?.type;
  if (typeof type !== 'string' || !(MESSAGE_TYPES as readonly string[]).includes(type)) {
    return `${STALE_WORKER_MESSAGE} (unrecognised request${
      typeof type === 'string' ? ` "${type}"` : ''
    })`;
  }

  const parsed = eclipseMessageSchema.safeParse(value);
  const fields = parsed.success
    ? []
    : [
        ...new Set(
          parsed.error.issues.map((issue) => issue.path.join('.')).filter((path) => path !== ''),
        ),
      ];

  return fields.length > 0
    ? `${STALE_WORKER_MESSAGE} (${type} sent an unusable ${fields.join(', ')})`
    : `${STALE_WORKER_MESSAGE} (${type} had an unusable payload)`;
}

/** Narrow an unknown response value into a `Result`. */
export function isFailureResponse(value: unknown): value is Failure {
  return failureSchema.safeParse(value).success;
}

export function isSuccessResponse<T>(value: unknown): value is Success<T> {
  return typeof value === 'object' && value !== null && (value as { ok?: unknown }).ok === true;
}

export const moonPhaseSchema = z.enum(MOON_PHASES);
