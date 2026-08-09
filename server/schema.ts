/**
 * Request and response contracts for the loopback generation API.
 *
 * The server validates twice: the request on the way in, and the model's output
 * on the way back out. The second pass matters more — the model has just been
 * shown attacker-controlled page text, so nothing it returns is trusted until
 * it has passed exactly the same validation the bundled catalog passes.
 */

import { z } from 'zod';
import {
  findChoiceLanguageIssues,
  validateTrap,
  type GeneratedTrapCandidate,
} from '../src/domain/trap';
import { FRENCH_CATALOG } from '../src/catalog/french-catalog';
import { containsFolded, foldForComparison } from '../src/domain/normalize';
import { DELF_LEVELS } from '../src/domain/delf';

/** Hard limits from the plan. Enforced here and again by the body-size guard. */
export const MAX_SENTENCES = 8;
export const MAX_SENTENCE_LENGTH = 300;
export const MAX_BODY_BYTES = 12 * 1024;

export const requestSchema = z.object({
  sourceLocale: z.literal('en'),
  targetLocale: z.literal('fr-FR'),
  delfLevel: z.enum(DELF_LEVELS),
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
            description: 'Lowercase ASCII slug for the French concept, hyphen separated.',
          },
          englishSense: {
            type: 'string',
            description: 'Lowercase ASCII slug naming the English sense being taught.',
          },
          type: {
            type: 'string',
            enum: ['vocabulary', 'phrase', 'polysemy', 'idiom', 'false_friend'],
          },
          exactSourceText: {
            type: 'string',
            description:
              'English text copied exactly from the supplied sentence. This is also the correct answer.',
          },
          targetSurface: { type: 'string' },
          choices: {
            type: 'array',
            description:
              'Three distinct ENGLISH meanings of targetSurface, for a reader who does not know French. Never a French word, and never targetSurface itself.',
            items: { type: 'string' },
            minItems: 3,
            maxItems: 3,
          },
          acceptedChoice: {
            type: 'string',
            description:
              'Must equal exactSourceText and one of choices exactly, anchoring the answer in English.',
          },
          clueSpan: { type: 'string' },
          explanation: { type: 'string' },
          distractorExplanation: { type: 'string' },
          difficulty: { type: 'number' },
          confidence: { type: 'number' },
        },
      },
    },
  },
} as const;

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/**
 * `conceptSlug` and `englishSense` are internal identifiers — they key mastery
 * records and become a `data-eclipse-concept` attribute. They are never shown
 * to a learner. The model routinely answers the documented "hyphen separated
 * slug" with ordinary spacing ("pointed out"), so the spacing is conformed to
 * the contract before validation rather than costing a whole batch.
 *
 * This is not the accent rule in reverse. A French surface is content, and
 * repairing it would teach the wrong word; a slug carries no meaning a learner
 * ever reads. Anything that does not reduce to a valid slug is still rejected.
 */
const slugField = z
  .string()
  .min(1)
  .max(80)
  .transform((value) =>
    value
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, ''),
  )
  .refine((value) => SLUG_PATTERN.test(value));

const modelTrapSchema = z.object({
  sentenceId: z.string().min(1).max(64),
  conceptSlug: slugField,
  englishSense: slugField,
  type: z.enum(['vocabulary', 'phrase', 'polysemy', 'idiom', 'false_friend']),
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

export interface ModelOutputParse {
  readonly output: ModelOutput;
  /** Items dropped because they did not match the schema. Count only. */
  readonly droppedItems: number;
}

/**
 * Validate model output item by item.
 *
 * Every item still faces exactly the same schema as before — nothing is
 * accepted that `modelTrapSchema` would refuse. What changes is the blast
 * radius: one malformed item used to fail `z.array(...)` and discard the whole
 * batch, so a response with seven good learning items and one bad slug yielded
 * nothing and cost a second model call. Now the bad item is dropped and the
 * other seven survive.
 *
 * Returns null only when the envelope itself is unusable.
 */
export function parseModelOutput(value: unknown): ModelOutputParse | null {
  const envelope = z.object({ traps: z.array(z.unknown()).max(MAX_SENTENCES) }).safeParse(value);
  if (!envelope.success) return null;

  const traps: ModelOutput['traps'] = [];
  let droppedItems = 0;
  for (const item of envelope.data.traps) {
    const parsed = modelTrapSchema.safeParse(item);
    if (parsed.success) traps.push(parsed.data);
    else droppedItems += 1;
  }

  return { output: { traps }, droppedItems };
}

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

    // The learner reads English. Three French words is not a comprehension
    // question. `validateTrap` below refuses these too — this is here so the
    // rejection reads as itself in the log rather than as a generic failure.
    const acceptedChoiceIsEnglishSource =
      foldForComparison(candidate.acceptedChoice) === foldForComparison(candidate.exactSourceText);
    if (
      !acceptedChoiceIsEnglishSource ||
      findChoiceLanguageIssues(candidate.choices, candidate.targetSurface).length > 0
    ) {
      rejected.push('choices_not_english');
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
