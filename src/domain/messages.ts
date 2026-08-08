/**
 * The extension's message contract.
 *
 * Popup → background:  START_SESSION, STOP_SESSION, GET_STATUS, RESET_PROFILE,
 *                      SAVE_CALIBRATION
 * Background → content: PING, ACTIVATE, DEACTIVATE
 * Content → background: GENERATE_TRAPS
 *
 * `SAVE_CALIBRATION` and `SET_PROVIDER` are the two additions to the eight
 * message types in the plan, and both exist to keep the ownership boundary
 * intact rather than to add features:
 *
 * - Calibration produces a `globalAbility`, which is learner history. The plan
 *   says the popup must not write that directly, so it routes through here.
 * - Enabling the optional provider needs `chrome.permissions.request`, which
 *   requires a user gesture and therefore must be called from the popup — but
 *   the resulting setting is the worker's to persist.
 *
 * Every handler returns `Success<T>` or `Failure`; nothing throws across a
 * message boundary.
 */

import { z } from 'zod';
import { ERROR_CODES, type Failure, type Result, type Success } from './errors';
import { MOON_PHASES, type MasterySummary, type MoonPhase } from './profile';
import type { GeneratedTrapCandidate } from './trap';

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
  globalAbility: number;
  correctAnswers: number;
  skipped: boolean;
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
  activeTabId: number | null;
  activeSessionId: string | null;
  /** True when the tab the popup is showing is the one with a live session. */
  activeHere: boolean;
  page: PopupPageSupport;
  calibrationCompleted: boolean;
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
    providerEnabled: z.boolean(),
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
    sentences: z
      .array(z.object({ id: z.string().min(1).max(64), text: z.string().min(1).max(300) }))
      .max(8),
  }),
  z.object({ type: z.literal('RESET_PROFILE'), confirmed: z.boolean() }),
  z.object({
    type: z.literal('SAVE_CALIBRATION'),
    globalAbility: z.number().min(-1).max(1),
    correctAnswers: z.number().int().min(0).max(3),
    skipped: z.boolean(),
  }),
  z.object({ type: z.literal('SET_PROVIDER'), enabled: z.boolean() }),
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

/** Narrow an unknown response value into a `Result`. */
export function isFailureResponse(value: unknown): value is Failure {
  return failureSchema.safeParse(value).success;
}

export function isSuccessResponse<T>(value: unknown): value is Success<T> {
  return typeof value === 'object' && value !== null && (value as { ok?: unknown }).ok === true;
}

export const moonPhaseSchema = z.enum(MOON_PHASES);
