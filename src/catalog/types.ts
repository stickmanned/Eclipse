/**
 * The bundled French catalog.
 *
 * A catalog entry is a *rule* for making traps, not a trap. It says which
 * English span it replaces, what French surface takes its place, which context
 * has to be present for the swap to be honest, and which context rules it out.
 * A `ContextTrap` is produced when an entry matches a real sentence.
 *
 * Surfaces are curated. Eclipse never conjugates French — if a sentence needs
 * `avait le cafard` rather than `avoir le cafard`, that inflected form is
 * written out here.
 */

import type { ConceptId, TrapType } from '../domain/trap';

export interface CatalogEntry {
  readonly conceptId: ConceptId;
  readonly type: TrapType;
  /** Exactly the French text rendered in the page. Already NFC. */
  readonly targetSurface: string;
  /** The English span it replaces. Matched on word boundaries, case-insensitively. */
  readonly exactSourceText: string;
  readonly choices: readonly [string, string, string];
  readonly acceptedChoice: string;
  /**
   * Ordered clue candidates. The first one present in the sentence becomes the
   * trap's `clueSpan`, quoted back exactly as the article wrote it.
   */
  readonly clueCandidates: readonly string[];
  /** At least one must be present in the sentence. Empty means no requirement. */
  readonly requiredAny?: readonly string[];
  /** All must be present in the sentence. */
  readonly requiredAll?: readonly string[];
  /** None may be present in the sentence. Guards against the wrong sense. */
  readonly forbidden?: readonly string[];
  readonly explanation: string;
  readonly distractorExplanation: string;
  /** 0..1. Higher means a harder read for a beginner. */
  readonly difficulty: number;
  /** 0..1. How well this entry's contexts pin the meaning down. */
  readonly contextQuality: number;
}
