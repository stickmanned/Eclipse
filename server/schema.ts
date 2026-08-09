/**
 * Request and response contracts for the optional generation API.
 *
 * The server validates twice: the request on the way in, and the model's output
 * on the way back out. The second pass matters more — the model has just been
 * shown attacker-controlled page text, so nothing it returns is trusted until
 * it has passed exactly the same validation the bundled catalog passes.
 */

import { z } from 'zod';
import { validateTrap, type GeneratedTrapCandidate } from '../src/domain/trap';
import { FRENCH_CATALOG } from '../src/catalog/french-catalog';
import { containsFolded, foldForComparison } from '../src/domain/normalize';

/** Hard limits from the plan. Enforced here and again by the body-size guard. */
export const MAX_SENTENCES = 8;
export const MAX_SENTENCE_LENGTH = 300;
export const MAX_BODY_BYTES = 12 * 1024;

export const requestSchema = z.object({
  sourceLocale: z.literal('en'),
  targetLocale: z.literal('fr-FR'),
  sentences: z
    .array(
      z.object({
        id: z.string().min(1).max(64),
        text: z.string().min(1).max(MAX_SENTENCE_LENGTH),
      }),
    )
    .min(1)
    .max(MAX_SENTENCES),
});

export type ContextTrapsRequest = z.infer<typeof requestSchema>;

/**
 * The JSON Schema handed to the model. Deliberately narrower than the internal
 * trap type: the model supplies the linguistic content and nothing else. Ids,
 * locales and the provider tag are stamped by this server, so a model cannot
 * pass its output off as a catalog trap.
 */
export const MODEL_OUTPUT_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['traps'],
  properties: {
    traps: {
      type: 'array',
      maxItems: MAX_SENTENCES,
      items: {
        type: 'object',
        additionalProperties: false,
        required: [
          'sentenceId',
          'conceptSlug',
          'englishSense',
          'type',
          'exactSourceText',
          'targetSurface',
          'choices',
          'acceptedChoice',
          'clueSpan',
          'explanation',
          'distractorExplanation',
          'difficulty',
          'confidence',
        ],
        properties: {
          sentenceId: { type: 'string' },
          conceptSlug: {
            type: 'string',
            pattern: '^[a-z0-9]+(-[a-z0-9]+)*$',
            description: 'Lowercase ASCII slug for the French concept, hyphen separated, no spaces.',
          },
          englishSense: {
            type: 'string',
            pattern: '^[a-z0-9]+(-[a-z0-9]+)*$',
            description: 'Lowercase ASCII slug naming the English sense being taught, hyphen separated, no spaces (e.g. "break-down", not "break down").',
          },
          type: { type: 'string', enum: ['polysemy', 'idiom', 'false_friend'] },
          exactSourceText: { type: 'string', maxLength: 80 },
          targetSurface: { type: 'string', maxLength: 64 },
          choices: {
            type: 'array',
            items: { type: 'string', maxLength: 80 },
            minItems: 3,
            maxItems: 3,
          },
          acceptedChoice: { type: 'string', maxLength: 80 },
          clueSpan: { type: 'string', maxLength: 160 },
          explanation: { type: 'string', maxLength: 300 },
          distractorExplanation: { type: 'string', maxLength: 300 },
          difficulty: {
            type: 'number',
            minimum: 0,
            maximum: 1,
            description: 'Normalized 0 to 1, not a 1-5 or 1-3 scale.',
          },
          confidence: { type: 'number', minimum: 0, maximum: 1 },
        },
      },
    },
  },
} as const;

const modelTrapSchema = z.object({
  sentenceId: z.string().min(1).max(64),
  conceptSlug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  englishSense: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  type: z.enum(['polysemy', 'idiom', 'false_friend']),
  exactSourceText: z.string().min(1).max(80),
  targetSurface: z.string().min(1).max(64),
  choices: z.array(z.string().min(1).max(80)).length(3),
  acceptedChoice: z.string().min(1).max(80),
  clueSpan: z.string().min(1).max(160),
  explanation: z.string().min(1).max(300),
  distractorExplanation: z.string().min(1).max(300),
  difficulty: z.number().min(0).max(1),
  confidence: z.number().min(0).max(1),
});

export const modelOutputSchema = z.object({
  traps: z.array(modelTrapSchema).max(MAX_SENTENCES),
});

export type ModelOutput = z.infer<typeof modelOutputSchema>;

export interface ConversionResult {
  readonly candidates: GeneratedTrapCandidate[];
  /** Codes only. Never the rejected content — that is page or model text. */
  readonly rejected: string[];
}

/** Strip diacritics. Used only to detect a de-accented word, never to store one. */
function deaccent(value: string): string {
  return value.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}

/**
 * Surfaces the bundled catalog knows must carry accents, keyed by their
 * de-accented spelling.
 *
 * There is no French dictionary in this server, so it cannot judge an arbitrary
 * word. What it can do is refuse to un-teach something the catalog already
 * knows: if a model returns `bibliotheque`, that is a wrong spelling of a word
 * Eclipse ships the correct spelling of, and shipping it would actively mislead
 * a learner.
 */
const ACCENTED_SURFACES: ReadonlyMap<string, string> = new Map(
  FRENCH_CATALOG.filter(
    (entry) => deaccent(entry.targetSurface) !== entry.targetSurface.toLowerCase(),
  ).map((entry) => [deaccent(entry.targetSurface), entry.targetSurface] as const),
);

/** The correct spelling, when the model returned a de-accented known word. */
export function requiredAccentedForm(surface: string): string | null {
  const known = ACCENTED_SURFACES.get(deaccent(surface));
  if (!known) return null;
  return foldForComparison(known) === foldForComparison(surface) ? null : known;
}

/**
 * Turn raw model output into validated traps.
 *
 * Every trap is bound back to the sentence it claims to belong to, so a model
 * cannot invent a sentence or attach a trap to text the caller never sent.
 */
export function toContextTraps(
  output: ModelOutput,
  request: ContextTrapsRequest,
): ConversionResult {
  const sentences = new Map(request.sentences.map((sentence) => [sentence.id, sentence.text]));
  const candidates: GeneratedTrapCandidate[] = [];
  const rejected: string[] = [];

  for (const [candidateIndex, candidate] of output.traps.entries()) {
    const sentence = sentences.get(candidate.sentenceId);
    if (sentence === undefined) {
      rejected.push('unknown_sentence_id');
      continue;
    }

    // A de-accented spelling of a word Eclipse ships correctly is worse than no
    // trap: it teaches the learner the wrong thing.
    if (requiredAccentedForm(candidate.targetSurface) !== null) {
      rejected.push('missing_required_accent');
      continue;
    }

    // The clue is evidence, not the answer. A clue containing the hidden span
    // makes the exercise vacuous.
    if (containsFolded(candidate.clueSpan, candidate.exactSourceText)) {
      rejected.push('clue_reveals_source');
      continue;
    }

    const validated = validateTrap(
      {
        id: `gemini:${candidate.conceptSlug}:${candidate.englishSense}:${candidateIndex}`,
        conceptId: `fr:${candidate.conceptSlug}:${candidate.englishSense}`,
        sourceLocale: 'en',
        targetLocale: 'fr-FR',
        type: candidate.type,
        sentence,
        exactSourceText: candidate.exactSourceText,
        targetSurface: candidate.targetSurface.normalize('NFC'),
        choices: candidate.choices,
        acceptedChoice: candidate.acceptedChoice,
        clueSpan: candidate.clueSpan,
        explanation: candidate.explanation,
        distractorExplanation: candidate.distractorExplanation,
        difficulty: candidate.difficulty,
        confidence: candidate.confidence,
        provider: 'gemini',
      },
      { untrusted: true },
    );

    if (validated.ok) {
      candidates.push({ sentenceId: candidate.sentenceId, trap: validated.data });
    } else rejected.push('failed_trap_validation');
  }

  return { candidates, rejected };
}
