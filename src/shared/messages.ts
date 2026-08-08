/**
 * What the page and the service worker say to each other.
 *
 * The content script is deliberately thin. It knows how to find text and how
 * to draw, and nothing else. Every decision — which words, how hard, right or
 * wrong — happens in the service worker, which is where the word list and the
 * learner's record live.
 */

export interface RenderSwap {
  /** The Mandarin as it appears in the mixed sentence. */
  zh: string;
  /** The English it replaced, kept so we can put the page back. */
  en: string;
  wordId: number;
  pinyin: string;
  /** English answers we will accept. Sent so marking feels instant. */
  accepted: string[];
}

export interface RenderSentence {
  /** Index into the sentences the page sent. */
  i: number;
  /** The mixed sentence, ready to display. */
  text: string;
  swaps: RenderSwap[];
}

export type ToWorker =
  | { type: "plan"; sentences: string[]; host: string }
  | { type: "answer"; wordId: number; typed: string }
  | { type: "glanced"; wordIds: number[] }
  | { type: "status"; host?: string }
  | { type: "setEnabled"; host: string; on: boolean }
  | { type: "forget" };

export type FromWorker =
  | { type: "plan:ok"; sentences: RenderSentence[] }
  | { type: "plan:off"; reason: string }
  | { type: "answer:ok"; correct: boolean; answer: string; typo: boolean }
  | { type: "status:ok"; status: Status }
  | { type: "ok" }
  | { type: "error"; message: string };

export interface Status {
  enabledHere: boolean;
  hasKey: boolean;
  /** Words answered today. */
  answeredToday: number;
  correctToday: number;
  /** Where we think they are, and how sure. */
  level: number;
  levelRange: [number, number];
  wordsMet: number;
  density: number;
  newBudget: number;
  intensity: "gentle" | "normal" | "intense";
  lastError?: string;
}

export function send<T extends FromWorker = FromWorker>(msg: ToWorker): Promise<T> {
  return chrome.runtime.sendMessage(msg) as Promise<T>;
}
