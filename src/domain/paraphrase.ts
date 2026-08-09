/**
 * The Paraphrase Mode learning-item contract.
 *
 * Translate Mode hides an English span behind a French one and asks what the
 * French means. Paraphrase Mode never leaves French: it hides a *hard* French
 * span behind a simpler French one and asks which wording was simplified away.
 * Same shape, opposite direction — the page shows the easy form, the learner
 * reaches for the hard one.
 *
 *   page:   "Le mécanisme sert à [aider] le processus."
 *   asks:   which original wording did that replace?
 *   choices: "faciliter" · "entraver" · "prolonger"     (all French)
 *   accepts: "faciliter"                                (the exact page span)
 *
 * Deliberately a sibling of `./trap.ts` rather than an extension of it. The two
 * modes disagree on the single most load-bearing validation rule — Translate
 * *rejects* French choices, Paraphrase *requires* them — so one shared validator
 * would have to be told which mode it was in on every call, and the safety rule
 * that stops English leaking into a French quiz would become a flag rather than
 * a law. Everything that genuinely is shared (safety, normalization, ids) is
 * imported, not copied.
 */

import { z } from 'zod';
import {
  collapseWhitespace,
  containsFolded,
  countWordMatches,
  foldForComparison,
  toNfc,
} from './normalize';
import { checkFieldSafety, type SafetyIssue } from './safety';
import { failure, success, type Result } from './errors';

/**
 * Why a span is hard, not just how hard.
 *
 * Core #2 asks Eclipse to notice *which kinds* of words a learner stumbles on —
 * academic jargon behaves differently from idiom, and someone fluent in one can
 * be lost in the other. A single difficulty number cannot express that, so every
 * item carries the category it belongs to and the profile keeps per-register
 * counts alongside the global band.
 */
export const PARAPHRASE_REGISTERS = [
  'academic',
  'formal',
  'idiom',
  'technical',
  'literary',
  'everyday',
] as const;
export type ParaphraseRegister = (typeof PARAPHRASE_REGISTERS)[number];

/** Learner-facing English labels for the French-language reading mode. */
export const REGISTER_LABEL: Readonly<Record<ParaphraseRegister, string>> = {
  academic: 'Academic language',
  formal: 'Formal language',
  idiom: 'Idiom',
  technical: 'Technical term',
  literary: 'Literary wording',
  everyday: 'Everyday language',
};

/**
 * `frp:` rather than `fr:` so a paraphrase concept can never be mistaken for a
 * translate-mode mastery record, in storage or in a message payload. The two
 * profiles are separate stores and must stay separable by inspection.
 */
export type ParaphraseConceptId = `frp:${string}`;

export const PARAPHRASE_CONCEPT_ID_PATTERN =
  /^frp:[a-z0-9]+(?:-[a-z0-9]+)*:[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** How the item reached the page. Manual items were requested by the learner. */
export const PARAPHRASE_SOURCES = ['auto', 'manual'] as const;
export type ParaphraseSource = (typeof PARAPHRASE_SOURCES)[number];

export interface ParaphraseItem {
  id: string;
  conceptId: ParaphraseConceptId;
  /** Both sides are French. There is no source/target split in this mode. */
  locale: 'fr-FR';
  register: ParaphraseRegister;
  source: ParaphraseSource;
  /** The original French sentence, exactly as it appears on the page. */
  sentence: string;
  /** The hard span being hidden. Must occur in `sentence` exactly once. */
  exactSourceText: string;
  /** The simpler French wording rendered in its place. */
  simplifiedSurface: string;
  /** Three candidate originals, all French. */
  choices: [string, string, string];
  /** Must equal `exactSourceText`. */
  acceptedChoice: string;
  /** Evidence quotable from the sentence that does not give the answer away. */
  clueSpan: string;
  /** A plain-French gloss of the original. Shown on the reveal card. */
  plainMeaning: string;
  /** Why the simplification is faithful to the original. */
  explanation: string;
  /** Why the most tempting wrong original does not fit here. */
  distractorExplanation: string;
  /** 0–1. How hard the ORIGINAL span is, not the simplification. */
  complexity: number;
  confidence: number;
}

/** A generated item plus the submitted sentence it targets. */
export interface GeneratedParaphraseCandidate {
  readonly sentenceId: string;
  readonly item: ParaphraseItem;
}

/** Minimum confidence a generated item must carry to reach the page. */
export const MIN_PARAPHRASE_CONFIDENCE = 0.8;

/** A clause-length original is allowed; a paragraph-length one is not. */
export const MAX_ORIGINAL_LENGTH = 160;
/** The replacement is rendered inline, so it stays shorter than the original's budget. */
export const MAX_SIMPLIFIED_LENGTH = 120;

/**
 * Characters allowed in rendered French text: letters, combining marks, the
 * space variants French typography uses, apostrophes, hyphens and commas. No
 * digits, no other punctuation, no markup. Must open and close on a letter.
 *
 * Commas are permitted here where `isValidFrenchSurface` forbids them, because
 * a paraphrase legitimately spans a clause ("qui a duré plus longtemps que
 * prévu") while a translate-mode surface is a word or a tight phrase.
 */
const PARAPHRASE_TEXT = new RegExp(
  '^[\\p{L}\\p{M}](?:[\\p{L}\\p{M}\\u0020\\u00A0\\u202F\\u2009\\u0027\\u2018\\u2019\\u02BC\\u002D\\u002C]*[\\p{L}\\p{M}])?$',
  'u',
);

export function isValidParaphraseText(value: string, maxLength: number): boolean {
  if (value.length === 0 || value.length > maxLength) return false;
  // Validation never silently rewrites stored text.
  if (toNfc(value) !== value) return false;
  if (collapseWhitespace(value) !== value) return false;
  return PARAPHRASE_TEXT.test(value);
}

export const paraphraseItemSchema = z.object({
  id: z.string().min(1).max(160),
  conceptId: z.string().regex(PARAPHRASE_CONCEPT_ID_PATTERN),
  locale: z.literal('fr-FR'),
  register: z.enum(PARAPHRASE_REGISTERS),
  source: z.enum(PARAPHRASE_SOURCES),
  sentence: z.string().min(1).max(300),
  exactSourceText: z.string().min(1).max(MAX_ORIGINAL_LENGTH),
  simplifiedSurface: z.string().min(1).max(MAX_SIMPLIFIED_LENGTH),
  choices: z.tuple([
    z.string().min(1).max(MAX_ORIGINAL_LENGTH),
    z.string().min(1).max(MAX_ORIGINAL_LENGTH),
    z.string().min(1).max(MAX_ORIGINAL_LENGTH),
  ]),
  acceptedChoice: z.string().min(1).max(MAX_ORIGINAL_LENGTH),
  clueSpan: z.string().min(1).max(200),
  plainMeaning: z.string().min(1).max(300),
  explanation: z.string().min(1).max(300),
  distractorExplanation: z.string().min(1).max(300),
  complexity: z.number().min(0).max(1),
  confidence: z.number().min(0).max(1),
});

/**
 * The mirror image of Translate Mode's choice rules.
 *
 * There, a French word among the choices is the failure — the learner is meant
 * to pick an English meaning. Here the choices are the thing being recalled, so
 * they must all be plausible French wordings, and the one rule that actually
 * matters is that none of them leaks the answer.
 *
 * Two ways a generated set has leaked in practice:
 *
 * 1. A distractor that *is* the simplification already on the page. The learner
 *    reads "aider", sees "aider" offered, and picks it — not because they
 *    understood anything, but because it is the word in front of them.
 * 2. A distractor that *contains* the simplification ("aider un peu"). Same
 *    tell, one step removed.
 *
 * Both are cheap structural checks, not language detection. The prompt is the
 * first line; this is the one that holds when the prompt does not.
 *
 * Returns one issue per offending choice, empty when the set is clean.
 */
export function findParaphraseChoiceIssues(
  choices: readonly string[],
  simplifiedSurface: string,
): string[] {
  const issues: string[] = [];
  const shown = foldForComparison(simplifiedSurface);

  for (const [index, choice] of choices.entries()) {
    const folded = foldForComparison(choice);
    if (folded === shown) {
      issues.push(`choices.${index} repeats the simplification shown on the page`);
    } else if (folded.includes(shown)) {
      issues.push(`choices.${index} contains the simplification shown on the page`);
    } else if (!isValidParaphraseText(choice, MAX_ORIGINAL_LENGTH)) {
      issues.push(`choices.${index} is not renderable French text`);
    }
  }

  return issues;
}

export class ParaphraseValidationError extends Error {
  readonly issues: readonly string[];

  constructor(issues: readonly string[]) {
    super(`Invalid paraphrase item: ${issues.join('; ')}`);
    this.name = 'ParaphraseValidationError';
    this.issues = issues;
  }
}

function describeSafety(issue: SafetyIssue): string {
  return `${issue.field} ${issue.reason}`;
}

/**
 * Full validation: shape, ranges, cross-field consistency, content safety.
 *
 * Every item is provider output, so `untrusted` safety is unconditional here —
 * unlike Translate Mode, Paraphrase Mode has no bundled catalog whose entries
 * could be trusted a little further.
 *
 * Returns the item with its French text normalised to NFC. Never mutates the
 * input, and reports every issue at once so a bad generation is diagnosable in
 * one pass.
 */
export function validateParaphraseItem(candidate: unknown): Result<ParaphraseItem> {
  const parsed = paraphraseItemSchema.safeParse(candidate);
  if (!parsed.success) {
    const issues = parsed.error.issues.map(
      (issue) => `${issue.path.join('.') || '(root)'}: ${issue.message}`,
    );
    return failure('PROVIDER_INVALID_RESPONSE', new ParaphraseValidationError(issues).message);
  }

  const value = parsed.data;
  const issues: string[] = [];

  // --- content safety on every renderable string ---------------------------
  const safetyFields: Record<string, string> = {
    sentence: value.sentence,
    exactSourceText: value.exactSourceText,
    simplifiedSurface: value.simplifiedSurface,
    'choices.0': value.choices[0],
    'choices.1': value.choices[1],
    'choices.2': value.choices[2],
    acceptedChoice: value.acceptedChoice,
    clueSpan: value.clueSpan,
    plainMeaning: value.plainMeaning,
    explanation: value.explanation,
    distractorExplanation: value.distractorExplanation,
  };
  for (const [field, text] of Object.entries(safetyFields)) {
    const issue = checkFieldSafety(field, text, { untrusted: true });
    if (issue) issues.push(describeSafety(issue));
  }

  // --- the replacement has to be renderable French -------------------------
  if (!isValidParaphraseText(value.simplifiedSurface, MAX_SIMPLIFIED_LENGTH)) {
    issues.push(
      'simplifiedSurface must be non-empty NFC French text (letters, spaces, apostrophes, hyphens, commas only)',
    );
  }

  // --- and it has to actually be a different wording -----------------------
  const original = foldForComparison(value.exactSourceText);
  const simplified = foldForComparison(value.simplifiedSurface);
  if (original === simplified) {
    issues.push('simplifiedSurface repeats exactSourceText, so nothing was simplified');
  } else if (simplified.includes(original)) {
    issues.push(
      'simplifiedSurface still contains exactSourceText, so the hard wording is not hidden',
    );
  }

  // --- the hidden span must be locatable, and locatable uniquely -----------
  const occurrences = countWordMatches(value.sentence, value.exactSourceText);
  if (occurrences === 0) {
    issues.push('exactSourceText does not occur in sentence');
  } else if (occurrences > 1) {
    issues.push(`exactSourceText occurs ${occurrences} times in sentence, expected exactly once`);
  }

  // --- the clue is evidence, never the answer ------------------------------
  if (!containsFolded(value.sentence, value.clueSpan)) {
    issues.push('clueSpan does not occur in sentence');
  }
  if (containsFolded(value.clueSpan, value.exactSourceText)) {
    issues.push('clueSpan contains exactSourceText, which makes the question vacuous');
  }

  // --- exactly three distinct choices, one of which is the original --------
  const folded = value.choices.map((choice) => foldForComparison(choice));
  if (new Set(folded).size !== 3) {
    issues.push('choices must be unique after case and whitespace normalization');
  }
  if (!value.choices.includes(value.acceptedChoice)) {
    issues.push('acceptedChoice must exactly match one of choices');
  }
  if (foldForComparison(value.acceptedChoice) !== original) {
    issues.push('acceptedChoice must be the original exactSourceText copied from the sentence');
  }

  // --- and none of them may give the answer away --------------------------
  issues.push(...findParaphraseChoiceIssues(value.choices, value.simplifiedSurface));

  // --- generated items carry a confidence floor ---------------------------
  if (value.confidence < MIN_PARAPHRASE_CONFIDENCE) {
    issues.push(
      `confidence ${value.confidence} is below the generated-item minimum ${MIN_PARAPHRASE_CONFIDENCE}`,
    );
  }

  if (issues.length > 0) {
    return failure('PROVIDER_INVALID_RESPONSE', new ParaphraseValidationError(issues).message);
  }

  return success({
    id: value.id,
    conceptId: value.conceptId as ParaphraseConceptId,
    locale: 'fr-FR',
    register: value.register,
    source: value.source,
    sentence: collapseWhitespace(toNfc(value.sentence)),
    exactSourceText: value.exactSourceText,
    simplifiedSurface: toNfc(value.simplifiedSurface),
    choices: [value.choices[0], value.choices[1], value.choices[2]],
    acceptedChoice: value.acceptedChoice,
    clueSpan: value.clueSpan,
    plainMeaning: value.plainMeaning,
    explanation: value.explanation,
    distractorExplanation: value.distractorExplanation,
    complexity: value.complexity,
    confidence: value.confidence,
  });
}

/** The strongest distractor: the first choice that is not the original. */
export function primaryParaphraseDistractor(item: ParaphraseItem): string {
  return item.choices.find((choice) => choice !== item.acceptedChoice) ?? item.choices[0];
}

/** True when the learner recovered the original wording. */
export function isCorrectParaphraseChoice(item: ParaphraseItem, selected: string): boolean {
  return foldForComparison(selected) === foldForComparison(item.acceptedChoice);
}

/** Word or clause, used for copy and for the token's accessible name. */
export function paraphraseItemKind(item: ParaphraseItem): 'word' | 'phrase' {
  return /\s/u.test(item.exactSourceText.trim()) ? 'phrase' : 'word';
}
