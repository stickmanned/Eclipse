/**
 * The article learning-item contract.
 *
 * One useful English word or phrase inside a specific sentence becomes a
 * French surface form. Selecting it opens a comprehension question and then
 * reveals the translation and contextual evidence. The historic `trap` name
 * remains internal so stored mastery ids and the safety boundary stay stable.
 */

import { z } from 'zod';
import {
  collapseWhitespace,
  countWordMatches,
  containsFolded,
  foldForComparison,
  isValidFrenchSurface,
  toNfc,
} from './normalize';
import { checkFieldSafety, type SafetyIssue } from './safety';
import { failure, success, type Result } from './errors';

export const TRAP_TYPES = ['vocabulary', 'phrase', 'polysemy', 'idiom', 'false_friend'] as const;
export type TrapType = (typeof TRAP_TYPES)[number];

export type LearningItemKind = 'word' | 'phrase';

export const TRAP_PROVIDERS = ['catalog', 'gemini'] as const;
export type TrapProvider = (typeof TRAP_PROVIDERS)[number];

export type ConceptId = `fr:${string}`;

export interface ContextTrap {
  id: string;
  conceptId: ConceptId;
  sourceLocale: 'en';
  targetLocale: 'fr-FR';
  type: TrapType;
  sentence: string;
  exactSourceText: string;
  targetSurface: string;
  choices: [string, string, string];
  acceptedChoice: string;
  clueSpan: string;
  explanation: string;
  distractorExplanation: string;
  difficulty: number;
  confidence: number;
  provider: TrapProvider;
}

/**
 * A generated trap plus the submitted sentence it targets. Sentence identity
 * is transport metadata and is intentionally not encoded in the trap id.
 */
export interface GeneratedTrapCandidate {
  readonly sentenceId: string;
  readonly trap: ContextTrap;
}

/** Minimum confidence a generated (non-catalog) trap must carry to be rendered. */
export const MIN_GENERATED_CONFIDENCE = 0.8;

/** `fr:` + ASCII slug + `:` + English sense. */
export const CONCEPT_ID_PATTERN = /^fr:[a-z0-9]+(?:-[a-z0-9]+)*:[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** Shape and range validation. Cross-field rules live in {@link validateTrap}. */
export const contextTrapSchema = z.object({
  id: z.string().min(1).max(120),
  conceptId: z.string().regex(CONCEPT_ID_PATTERN),
  sourceLocale: z.literal('en'),
  targetLocale: z.literal('fr-FR'),
  type: z.enum(TRAP_TYPES),
  sentence: z.string().min(1).max(300),
  exactSourceText: z.string().min(1).max(80),
  targetSurface: z.string().min(1).max(64),
  choices: z.tuple([
    z.string().min(1).max(80),
    z.string().min(1).max(80),
    z.string().min(1).max(80),
  ]),
  acceptedChoice: z.string().min(1).max(80),
  clueSpan: z.string().min(1).max(160),
  explanation: z.string().min(1).max(300),
  distractorExplanation: z.string().min(1).max(300),
  difficulty: z.number().min(0).max(1),
  confidence: z.number().min(0).max(1),
  provider: z.enum(TRAP_PROVIDERS),
});

/**
 * French-only orthography. Used to test *choices*, never a target surface.
 */
const FRENCH_ONLY_ORTHOGRAPHY = /[àâäçéèêëîïôöùûüÿœæ]/iu;

/** Comparison form with diacritics removed. Only ever used to compare, never to store. */
function deaccentFold(value: string): string {
  return foldForComparison(value).normalize('NFD').replace(/\p{M}/gu, '');
}

/**
 * The choices are English glosses, and these are the rules that keep them so.
 *
 * A model asked for "three English interpretations" sometimes answers with three
 * French words instead — inflections of the highlighted surface, or its French
 * near-synonyms. Such an item passes every structural rule and renders fine, but
 * it asks the learner to pick a French word out of three French words, which
 * teaches nothing. Two deterministic rules catch the shapes this has taken:
 *
 * 1. No choice may be the highlighted surface itself. Even for a true cognate —
 *    `programme` offered as the meaning of `programme` — the item is vacuous, so
 *    rejecting it is right whichever language the model thought it was writing.
 * 2. No choice may carry French-only orthography. English glosses needing an
 *    accent are rare, and each one has an accepted unaccented spelling ("cafe",
 *    "naive", "facade"), so the rule costs almost nothing and blocks a whole
 *    class of French leakage.
 *
 * Neither rule is language detection — there is no dictionary here. They are
 * cheap structural checks against the ways this has actually failed. A choice
 * set that slips past them is still possible; the prompt is the first line, and
 * this is the one that holds when the prompt does not.
 *
 * Returns one issue string per offending choice, empty when the set is clean.
 */
export function findChoiceLanguageIssues(
  choices: readonly string[],
  targetSurface: string,
): string[] {
  const issues: string[] = [];
  const surface = deaccentFold(targetSurface);

  for (const [index, choice] of choices.entries()) {
    if (deaccentFold(choice) === surface) {
      issues.push(`choices.${index} repeats targetSurface instead of giving its English meaning`);
    } else if (FRENCH_ONLY_ORTHOGRAPHY.test(choice)) {
      issues.push(`choices.${index} is French, not an English meaning`);
    }
  }

  return issues;
}

export interface TrapValidationOptions {
  /**
   * Treat the candidate as attacker-influenced. Enables instruction-shaped text
   * detection and enforces {@link MIN_GENERATED_CONFIDENCE}. Always true for
   * provider output.
   */
  readonly untrusted?: boolean;
}

export class TrapValidationError extends Error {
  readonly issues: readonly string[];

  constructor(issues: readonly string[]) {
    super(`Invalid context trap: ${issues.join('; ')}`);
    this.name = 'TrapValidationError';
    this.issues = issues;
  }
}

function describeSafety(issue: SafetyIssue): string {
  return `${issue.field} ${issue.reason}`;
}

/**
 * Full validation: shape, ranges, cross-field consistency and content safety.
 *
 * Returns the trap with its French text normalised to NFC. Never mutates the
 * input. A failing trap is reported with every issue so a broken catalog entry
 * is fixable in one pass.
 */
export function validateTrap(
  candidate: unknown,
  options: TrapValidationOptions = {},
): Result<ContextTrap> {
  const parsed = contextTrapSchema.safeParse(candidate);
  if (!parsed.success) {
    const issues = parsed.error.issues.map(
      (issue) => `${issue.path.join('.') || '(root)'}: ${issue.message}`,
    );
    return failure('PROVIDER_INVALID_RESPONSE', new TrapValidationError(issues).message);
  }

  const value = parsed.data;
  const issues: string[] = [];
  const untrusted = options.untrusted ?? value.provider !== 'catalog';

  // --- content safety on every renderable string -------------------------
  const safetyFields: Record<string, string> = {
    sentence: value.sentence,
    exactSourceText: value.exactSourceText,
    targetSurface: value.targetSurface,
    'choices.0': value.choices[0],
    'choices.1': value.choices[1],
    'choices.2': value.choices[2],
    acceptedChoice: value.acceptedChoice,
    clueSpan: value.clueSpan,
    explanation: value.explanation,
    distractorExplanation: value.distractorExplanation,
  };
  for (const [field, text] of Object.entries(safetyFields)) {
    const issue = checkFieldSafety(field, text, { untrusted });
    if (issue) issues.push(describeSafety(issue));
  }

  // --- French surface -----------------------------------------------------
  if (!isValidFrenchSurface(value.targetSurface)) {
    issues.push(
      'targetSurface must be non-empty NFC French text (letters, spaces, apostrophes, hyphens only)',
    );
  }

  // --- the source span must be locatable, and locatable uniquely ----------
  const occurrences = countWordMatches(value.sentence, value.exactSourceText);
  if (occurrences === 0) {
    issues.push('exactSourceText does not occur in sentence');
  } else if (occurrences > 1) {
    issues.push(`exactSourceText occurs ${occurrences} times in sentence, expected exactly once`);
  }

  // --- the clue must be quotable from the sentence ------------------------
  if (!containsFolded(value.sentence, value.clueSpan)) {
    issues.push('clueSpan does not occur in sentence');
  }

  // --- exactly three distinct choices, one of which is accepted -----------
  const folded = value.choices.map((choice) => foldForComparison(choice));
  if (new Set(folded).size !== 3) {
    issues.push('choices must be unique after case and whitespace normalization');
  }
  if (!value.choices.includes(value.acceptedChoice)) {
    issues.push('acceptedChoice must exactly match one of choices');
  }

  // --- and every one of them is an English gloss, not a French word ---------
  issues.push(...findChoiceLanguageIssues(value.choices, value.targetSurface));

  // --- generated traps carry a confidence floor ---------------------------
  if (untrusted && value.confidence < MIN_GENERATED_CONFIDENCE) {
    issues.push(
      `confidence ${value.confidence} is below the generated-trap minimum ${MIN_GENERATED_CONFIDENCE}`,
    );
  }

  if (issues.length > 0) {
    return failure('PROVIDER_INVALID_RESPONSE', new TrapValidationError(issues).message);
  }

  const trap: ContextTrap = {
    id: value.id,
    conceptId: value.conceptId as ConceptId,
    sourceLocale: 'en',
    targetLocale: 'fr-FR',
    type: value.type,
    sentence: collapseWhitespace(toNfc(value.sentence)),
    exactSourceText: value.exactSourceText,
    targetSurface: toNfc(value.targetSurface),
    choices: [value.choices[0], value.choices[1], value.choices[2]],
    acceptedChoice: value.acceptedChoice,
    clueSpan: value.clueSpan,
    explanation: value.explanation,
    distractorExplanation: value.distractorExplanation,
    difficulty: value.difficulty,
    confidence: value.confidence,
    provider: value.provider,
  };

  return success(trap);
}

/** Throwing wrapper used where a trap is a build-time constant. */
export function assertValidTrap(
  candidate: unknown,
  options: TrapValidationOptions = {},
): ContextTrap {
  const result = validateTrap(candidate, options);
  if (!result.ok) throw new TrapValidationError([result.error.message]);
  return result.data;
}

/** The strongest distractor: the first choice that is not the accepted one. */
export function primaryDistractor(trap: ContextTrap): string {
  return trap.choices.find((choice) => choice !== trap.acceptedChoice) ?? trap.choices[0];
}

/** True when the learner's selection is the accepted meaning. */
export function isCorrectChoice(trap: ContextTrap, selected: string): boolean {
  return selected === trap.acceptedChoice;
}

export function learningItemKind(trap: ContextTrap): LearningItemKind {
  return trap.type === 'phrase' || trap.type === 'idiom' || /\s/u.test(trap.exactSourceText.trim())
    ? 'phrase'
    : 'word';
}
