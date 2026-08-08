/**
 * The context-trap contract.
 *
 * A trap is one replacement: a specific English span inside a specific sentence
 * becomes a French surface form, and answering it reveals the evidence that
 * settles the meaning. Traps arrive from the bundled catalog or, optionally,
 * from the local generation API. Both go through {@link validateTrap} before
 * anything is rendered.
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

export const TRAP_TYPES = ['polysemy', 'idiom', 'false_friend'] as const;
export type TrapType = (typeof TRAP_TYPES)[number];

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
