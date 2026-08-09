/**
 * Request and response contracts for the loopback paraphrase API.
 *
 * The server validates twice, exactly as `server/schema.ts` does: the request on
 * the way in, and the model's output on the way back out. The second pass is
 * the one that matters — the model has just been shown attacker-controlled page
 * text, so nothing it returns is trusted until it has passed the same
 * validation an item written by hand would have to pass.
 *
 * The JSON Schema handed to the model is deliberately narrower than the
 * internal item type. Ids, the locale and the source tag are stamped here, so a
 * model cannot claim its output was a learner-requested item or forge a concept
 * namespace.
 */

import { z } from 'zod';
import {
  MAX_ORIGINAL_LENGTH,
  MAX_SIMPLIFIED_LENGTH,
  PARAPHRASE_REGISTERS,
  findParaphraseChoiceIssues,
  validateParaphraseItem,
  type GeneratedParaphraseCandidate,
} from '../../src/domain/paraphrase';
import { containsFolded, foldForComparison } from '../../src/domain/normalize';

export const MAX_SENTENCES = 8;
export const MAX_SENTENCE_LENGTH = 300;
export const MAX_BODY_BYTES = 16 * 1024;

export const paraphraseRequestSchema = z
  .object({
    locale: z.literal('fr-FR'),
    mode: z.enum(['auto', 'manual']),
    complexity: z.object({
      target: z.number().min(0).max(1),
      min: z.number().min(0).max(1),
      max: z.number().min(0).max(1),
    }),
    focusRegisters: z.array(z.enum(PARAPHRASE_REGISTERS)).max(PARAPHRASE_REGISTERS.length),
    /** Bare wordings the learner previously missed. No counts, no dates. */
    reinforce: z.array(z.string().min(1).max(MAX_ORIGINAL_LENGTH)).max(12),
    sentences: z
      .array(
        z.object({
          id: z.string().min(1).max(64),
          text: z.string().min(1).max(MAX_SENTENCE_LENGTH),
        }),
      )
      .min(1)
      .max(MAX_SENTENCES),
    selection: z.string().min(1).max(MAX_ORIGINAL_LENGTH).optional(),
  })
  .refine((value) => value.mode !== 'manual' || typeof value.selection === 'string', {
    message: 'manual mode requires a selection',
  })
  .refine((value) => value.mode !== 'manual' || value.sentences.length === 1, {
    message: 'manual mode takes exactly one sentence',
  });

export type ParaphraseRequest = z.infer<typeof paraphraseRequestSchema>;

export const MODEL_OUTPUT_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['items'],
  properties: {
    items: {
      type: 'array',
      maxItems: MAX_SENTENCES,
      items: {
        type: 'object',
        additionalProperties: false,
        required: [
          'sentenceId',
          'conceptSlug',
          'senseSlug',
          'register',
          'exactSourceText',
          'simplifiedSurface',
          'choices',
          'acceptedChoice',
          'clueSpan',
          'plainMeaning',
          'explanation',
          'distractorExplanation',
          'complexity',
          'confidence',
        ],
        properties: {
          sentenceId: { type: 'string' },
          conceptSlug: {
            type: 'string',
            description:
              'Lowercase ASCII slug naming the difficult French wording, hyphen separated.',
          },
          senseSlug: {
            type: 'string',
            description: 'Lowercase ASCII slug naming the sense being taught, hyphen separated.',
          },
          register: { type: 'string', enum: [...PARAPHRASE_REGISTERS] },
          exactSourceText: {
            type: 'string',
            description:
              'The difficult FRENCH wording, copied character-for-character from the supplied sentence. This is also the correct answer.',
          },
          simplifiedSurface: {
            type: 'string',
            description:
              'Simpler FRENCH wording that replaces it in the sentence and reads naturally there.',
          },
          choices: {
            type: 'array',
            description:
              'Three distinct FRENCH wordings, one of which is exactSourceText. Never simplifiedSurface, and never any phrase containing it.',
            items: { type: 'string' },
            minItems: 3,
            maxItems: 3,
          },
          acceptedChoice: {
            type: 'string',
            description: 'Must equal exactSourceText exactly and be one of choices.',
          },
          clueSpan: { type: 'string' },
          plainMeaning: {
            type: 'string',
            description: 'A plain-French gloss of exactSourceText. French only, never English.',
          },
          explanation: { type: 'string' },
          distractorExplanation: { type: 'string' },
          complexity: { type: 'number' },
          confidence: { type: 'number' },
        },
      },
    },
  },
} as const;

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/**
 * Slugs are internal identifiers — they key the profile and become a
 * `data-eclipse-paraphrase-concept` attribute, and no learner ever reads one.
 * The model routinely answers "hyphen separated slug" with ordinary spacing and
 * French accents, so spacing and diacritics are conformed to the contract
 * before validation rather than costing a whole batch.
 *
 * This is not the accent rule in reverse: a French *surface* is content, and
 * repairing it would teach the wrong word. Anything that does not reduce to a
 * valid slug is still rejected.
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

const modelItemSchema = z.object({
  sentenceId: z.string().min(1).max(64),
  conceptSlug: slugField,
  senseSlug: slugField,
  register: z.enum(PARAPHRASE_REGISTERS),
  exactSourceText: z.string().min(1).max(MAX_ORIGINAL_LENGTH),
  simplifiedSurface: z.string().min(1).max(MAX_SIMPLIFIED_LENGTH),
  choices: z.array(z.string().min(1).max(MAX_ORIGINAL_LENGTH)).length(3),
  acceptedChoice: z.string().min(1).max(MAX_ORIGINAL_LENGTH),
  clueSpan: z.string().min(1).max(200),
  plainMeaning: z.string().min(1).max(300),
  explanation: z.string().min(1).max(300),
  distractorExplanation: z.string().min(1).max(300),
  complexity: z.number().min(0).max(1),
  confidence: z.number().min(0).max(1),
});

export const modelOutputSchema = z.object({
  items: z.array(modelItemSchema).max(MAX_SENTENCES),
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
 * Every item faces exactly the same schema either way; what changes is the
 * blast radius. One malformed item used to fail `z.array(...)` and discard the
 * whole batch, so a response with seven good items and one bad slug yielded
 * nothing and bought a second model call. Now the bad item is dropped and the
 * other seven survive.
 *
 * Returns null only when the envelope itself is unusable.
 */
export function parseModelOutput(value: unknown): ModelOutputParse | null {
  const envelope = z.object({ items: z.array(z.unknown()).max(MAX_SENTENCES) }).safeParse(value);
  if (!envelope.success) return null;

  const items: ModelOutput['items'] = [];
  let droppedItems = 0;
  for (const item of envelope.data.items) {
    const parsed = modelItemSchema.safeParse(item);
    if (parsed.success) items.push(parsed.data);
    else droppedItems += 1;
  }

  return { output: { items }, droppedItems };
}

export interface ConversionResult {
  readonly candidates: GeneratedParaphraseCandidate[];
  /** Codes only. Never the rejected content — that is page or model text. */
  readonly rejected: string[];
}

/**
 * Turn raw model output into validated items.
 *
 * Every item is bound back to the sentence it claims to belong to, so a model
 * cannot invent a sentence or attach an item to text the caller never sent. In
 * manual mode the learner's selection is authoritative: an item that simplified
 * something other than what was highlighted is rejected outright, because
 * answering a question the learner did not ask is worse than answering none.
 */
export function toParaphraseItems(
  output: ModelOutput,
  request: ParaphraseRequest,
): ConversionResult {
  const sentences = new Map(request.sentences.map((sentence) => [sentence.id, sentence.text]));
  const candidates: GeneratedParaphraseCandidate[] = [];
  const rejected: string[] = [];

  for (const [index, item] of output.items.entries()) {
    const sentence = sentences.get(item.sentenceId);
    if (sentence === undefined) {
      rejected.push('unknown_sentence_id');
      continue;
    }

    if (request.mode === 'manual' && request.selection !== undefined) {
      if (foldForComparison(item.exactSourceText) !== foldForComparison(request.selection)) {
        rejected.push('ignored_learner_selection');
        continue;
      }
    }

    // The clue is evidence, not the answer.
    if (containsFolded(item.clueSpan, item.exactSourceText)) {
      rejected.push('clue_reveals_source');
      continue;
    }

    // The whole exercise is recovering the harder wording. A choice set that
    // shows the reader what is already on the page in front of them teaches
    // nothing, so it is rejected here too — named, rather than folded into a
    // generic validation failure, so the log says which fault it was.
    if (
      foldForComparison(item.acceptedChoice) !== foldForComparison(item.exactSourceText) ||
      findParaphraseChoiceIssues(item.choices, item.simplifiedSurface).length > 0
    ) {
      rejected.push('choices_leak_or_mismatch');
      continue;
    }

    const validated = validateParaphraseItem({
      id: `gemini:${item.conceptSlug}:${item.senseSlug}:${index}`,
      conceptId: `frp:${item.conceptSlug}:${item.senseSlug}`,
      locale: 'fr-FR',
      register: item.register,
      source: request.mode === 'manual' ? 'manual' : 'auto',
      sentence,
      exactSourceText: item.exactSourceText,
      simplifiedSurface: item.simplifiedSurface.normalize('NFC'),
      choices: item.choices,
      acceptedChoice: item.acceptedChoice,
      clueSpan: item.clueSpan,
      plainMeaning: item.plainMeaning,
      explanation: item.explanation,
      distractorExplanation: item.distractorExplanation,
      complexity: item.complexity,
      confidence: item.confidence,
    });

    if (validated.ok) candidates.push({ sentenceId: item.sentenceId, item: validated.data });
    else rejected.push('failed_item_validation');
  }

  return { candidates, rejected };
}
