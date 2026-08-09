/**
 * The Paraphrase Mode wire contract.
 *
 * Paraphrase Mode talks over `runtime.connect` ports, not `runtime.sendMessage`,
 * and that is a correctness decision rather than a stylistic one.
 *
 * `runtime.onMessage` is broadcast: every listener in a context sees every
 * message, and the first one to call `sendResponse` wins. The Translate Mode
 * runtime answers *everything* — including shapes it does not recognise —
 * with `MESSAGE_UNSUPPORTED`. So in any tab where that runtime is already
 * injected, it would reliably answer a Paraphrase message before the Paraphrase
 * runtime could, and the reply the background actually acted on would be a
 * failure from a runtime that was never addressed. There is no ordering fix for
 * that from this side of the boundary.
 *
 * `runtime.onConnect` is addressed: a port reaches only listeners that opened
 * one, and the Translate Mode runtime has none. Two modes can therefore share a
 * document without either knowing the other exists, and this contract needs no
 * changes to `src/domain/messages.ts`.
 *
 * Ports are bidirectional, so one connection per tab carries both directions:
 * the background drives activation down it, and the runtime asks for generation
 * and records answers back up it.
 */

import { z } from 'zod';
import { ERROR_CODES, type Result } from '../domain/errors';
import {
  PARAPHRASE_CONCEPT_ID_PATTERN,
  PARAPHRASE_REGISTERS,
  paraphraseItemSchema,
  type ParaphraseItem,
  type ParaphraseRegister,
} from '../domain/paraphrase';
import type { ParaphraseSnapshot } from '../domain/paraphrase-profile';
import type { PopupPageSupport } from '../domain/messages';
import type { DelfLevel } from '../domain/delf';

/** Popup → background worker. */
export const POPUP_PORT = 'eclipse-paraphrase-popup';
/** Background worker → the runtime injected in a tab. */
export const TAB_PORT = 'eclipse-paraphrase-tab';

/**
 * Bumped whenever a payload below changes shape in a way an older peer cannot
 * parse. Reported by `STATUS`; the popup compares it against its own and shows
 * a reload notice rather than failing later on the first moved field. Same
 * reasoning as `MESSAGE_CONTRACT_VERSION`, kept separate so the two modes can
 * version independently.
 */
export const PARAPHRASE_CONTRACT_VERSION = 1;

/** Built bundle path of the runtime-injected Paraphrase content script. */
export const PARAPHRASE_CONTENT_SCRIPT = '/content-scripts/paraphrase.js' as const;

// ---------------------------------------------------------------------------
// Envelope
// ---------------------------------------------------------------------------

export interface PortRequest<P> {
  readonly channel: 'eclipse-paraphrase';
  readonly kind: 'request';
  readonly id: string;
  readonly payload: P;
}

export interface PortResponse<D> {
  readonly channel: 'eclipse-paraphrase';
  readonly kind: 'response';
  readonly id: string;
  readonly result: Result<D>;
}

export interface PortEvent<P> {
  readonly channel: 'eclipse-paraphrase';
  readonly kind: 'event';
  readonly payload: P;
}

export const CHANNEL = 'eclipse-paraphrase' as const;

const resultSchema = <T extends z.ZodTypeAny>(data: T) =>
  z.union([
    z.object({ ok: z.literal(true), data }),
    z.object({
      ok: z.literal(false),
      error: z.object({
        code: z.enum(ERROR_CODES),
        message: z.string(),
        recoverable: z.boolean(),
      }),
    }),
  ]);

export const envelopeSchema = z.union([
  z.object({
    channel: z.literal(CHANNEL),
    kind: z.literal('request'),
    id: z.string().min(1).max(120),
    payload: z.unknown(),
  }),
  z.object({
    channel: z.literal(CHANNEL),
    kind: z.literal('response'),
    id: z.string().min(1).max(120),
    result: resultSchema(z.unknown()),
  }),
  z.object({
    channel: z.literal(CHANNEL),
    kind: z.literal('event'),
    payload: z.unknown(),
  }),
]);

// ---------------------------------------------------------------------------
// Shared payload pieces
// ---------------------------------------------------------------------------

export interface ParaphraseSentence {
  readonly id: string;
  readonly text: string;
}

const sentenceSchema = z.object({
  id: z.string().min(1).max(64),
  text: z.string().min(1).max(300),
});

/**
 * Everything the runtime needs to rank locally, derived from the profile by the
 * background worker. The runtime never reads the profile itself — same
 * single-owner rule Translate Mode applies to mastery.
 */
export interface ParaphrasePlan {
  readonly window: readonly [number, number];
  readonly target: number;
  readonly focusRegisters: readonly ParaphraseRegister[];
  /** Wordings owed a reappearance. A hard priority tier during selection. */
  readonly dueConceptIds: readonly string[];
}

const planSchema = z.object({
  window: z.tuple([z.number().min(0).max(1), z.number().min(0).max(1)]),
  target: z.number().min(0).max(1),
  focusRegisters: z.array(z.enum(PARAPHRASE_REGISTERS)).max(PARAPHRASE_REGISTERS.length),
  dueConceptIds: z.array(z.string().regex(PARAPHRASE_CONCEPT_ID_PATTERN)).max(32),
});

// ---------------------------------------------------------------------------
// Background → tab runtime
// ---------------------------------------------------------------------------

export type TabRequest =
  | { readonly type: 'HELLO' }
  | { readonly type: 'ACTIVATE'; readonly sessionId: string; readonly plan: ParaphrasePlan }
  | { readonly type: 'DEACTIVATE'; readonly sessionId?: string };

export const tabRequestSchema: z.ZodType<TabRequest> = z.discriminatedUnion('type', [
  z.object({ type: z.literal('HELLO') }),
  z.object({
    type: z.literal('ACTIVATE'),
    sessionId: z.string().min(1).max(64),
    plan: planSchema,
  }),
  z.object({ type: z.literal('DEACTIVATE'), sessionId: z.string().min(1).max(64).optional() }),
]);

export interface HelloData {
  readonly runtime: 'eclipse-paraphrase';
  readonly sessionId: string | null;
}

export interface ActivatedData {
  readonly sessionId: string;
  readonly itemCount: number;
  readonly conceptIds: readonly string[];
}

export interface DeactivatedData {
  readonly restored: boolean;
  readonly textVerified: boolean;
}

// ---------------------------------------------------------------------------
// Tab runtime → background
// ---------------------------------------------------------------------------

export type RuntimeRequest =
  | {
      readonly type: 'GENERATE';
      readonly sessionId: string;
      readonly sentences: readonly ParaphraseSentence[];
    }
  | {
      readonly type: 'SIMPLIFY_SELECTION';
      readonly sessionId: string;
      readonly sentence: string;
      readonly selection: string;
    }
  | {
      readonly type: 'RECORD';
      readonly sessionId: string;
      readonly interactionId: string;
      readonly conceptId: string;
      readonly original: string;
      readonly simplified: string;
      readonly register: ParaphraseRegister;
      readonly complexity: number;
      readonly correct: boolean;
    }
  | {
      readonly type: 'RECORD_MANUAL';
      readonly sessionId: string;
      readonly interactionId: string;
      readonly conceptId: string;
      readonly original: string;
      readonly simplified: string;
      readonly register: ParaphraseRegister;
      readonly complexity: number;
    };

export const runtimeRequestSchema: z.ZodType<RuntimeRequest> = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('GENERATE'),
    sessionId: z.string().min(1).max(64),
    sentences: z.array(sentenceSchema).max(8),
  }),
  z.object({
    type: z.literal('SIMPLIFY_SELECTION'),
    sessionId: z.string().min(1).max(64),
    sentence: z.string().min(1).max(300),
    selection: z.string().min(1).max(160),
  }),
  z.object({
    type: z.literal('RECORD'),
    sessionId: z.string().min(1).max(64),
    interactionId: z.string().min(1).max(120),
    conceptId: z.string().regex(PARAPHRASE_CONCEPT_ID_PATTERN),
    original: z.string().min(1).max(200),
    simplified: z.string().min(1).max(200),
    register: z.enum(PARAPHRASE_REGISTERS),
    complexity: z.number().min(0).max(1),
    correct: z.boolean(),
  }),
  z.object({
    type: z.literal('RECORD_MANUAL'),
    sessionId: z.string().min(1).max(64),
    interactionId: z.string().min(1).max(120),
    conceptId: z.string().regex(PARAPHRASE_CONCEPT_ID_PATTERN),
    original: z.string().min(1).max(200),
    simplified: z.string().min(1).max(200),
    register: z.enum(PARAPHRASE_REGISTERS),
    complexity: z.number().min(0).max(1),
  }),
]);

export interface GeneratedData {
  readonly candidates: readonly { sentenceId: string; item: ParaphraseItem }[];
}

export interface SimplifiedSelectionData {
  readonly item: ParaphraseItem;
}

export interface RecordedData {
  readonly applied: boolean;
  readonly direction: 'raised' | 'lowered' | 'held';
  readonly band: { readonly center: number; readonly reach: number };
  readonly target: number;
  readonly state: 'unknown' | 'learning' | 'known';
  readonly owed: boolean;
  readonly plan: ParaphrasePlan;
}

export const candidateSchema = z.object({
  sentenceId: z.string().min(1).max(64),
  item: paraphraseItemSchema,
});

// ---------------------------------------------------------------------------
// Popup → background
// ---------------------------------------------------------------------------

export type PopupRequest =
  | { readonly type: 'STATUS' }
  | { readonly type: 'START' }
  | { readonly type: 'STOP' }
  | { readonly type: 'RESET'; readonly confirmed: boolean };

export const popupRequestSchema: z.ZodType<PopupRequest> = z.discriminatedUnion('type', [
  z.object({ type: z.literal('STATUS') }),
  z.object({ type: z.literal('START') }),
  z.object({ type: z.literal('STOP') }),
  z.object({ type: z.literal('RESET'), confirmed: z.boolean() }),
]);

export interface ParaphraseStatusData {
  readonly contractVersion: number;
  readonly activeTabId: number | null;
  readonly activeSessionId: string | null;
  readonly activeHere: boolean;
  /**
   * True when Translate Mode owns this tab. The two lenses cannot share an
   * article, so the popup offers to end that session rather than failing on
   * Start with an explanation the learner has to go looking for.
   */
  readonly translateActiveHere: boolean;
  readonly page: PopupPageSupport;
  readonly delfLevel: DelfLevel;
  readonly snapshot: ParaphraseSnapshot;
  readonly itemCount: number;
  readonly provider: {
    readonly configured: boolean;
    readonly permissionGranted: boolean;
    readonly lastError: string | null;
  };
}

export interface StartedData {
  readonly sessionId: string;
  readonly tabId: number;
  readonly itemCount: number;
}

export interface StoppedData {
  readonly restored: boolean;
}

/** Pushed to an open popup after the learner answers on the page. */
export interface SnapshotEvent {
  readonly type: 'SNAPSHOT';
  readonly snapshot: ParaphraseSnapshot;
}

export type PopupEvent = SnapshotEvent;
