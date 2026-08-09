/**
 * Binding generated paraphrases to real DOM ranges, and ranking them.
 *
 * The rule worth protecting here is the one that makes the brief's fourth round
 * possible: an owed wording outranks everything else *and* bypasses the
 * complexity window. A wording is owed precisely because it was too hard, so the
 * miss will usually have pushed the band below it — filter first and the items
 * most worth repeating become the ones that can never come back.
 */

import { beforeEach, describe, expect, it } from 'vitest';
import { collectEligibleBlocks, countEligibleWords, findArticleRoot } from '@/content/article';
import { prepareBatches } from '@/content/paraphrase/session';
import {
  collectParaphraseCandidates,
  planParaphrases,
  proximityTo,
  type ParaphraseSelectionContext,
} from '@/content/paraphrase/place';
import type { GeneratedParaphraseCandidate, ParaphraseItem } from '@/domain/paraphrase';
import { renderBody } from './helpers';

const ARTICLE = `
  <article>
    <p>Le projet de rénovation a été entamé postérieurement à la date butoir, ce qui a suscité une certaine consternation au sein du conseil.</p>
    <p>Le dispositif mis en place sert avant tout à faciliter la coordination entre les maraîchers et les services techniques de la ville.</p>
    <p>Le caractère ambigu de la directive préfectorale explique en grande partie ce décalage entre les différents services concernés.</p>
    <p>Les riverains interrogés se montrent globalement favorables, tout en déplorant le manque de concertation en amont du chantier.</p>
  </article>
`;

interface Fixture {
  readonly blocks: ReturnType<typeof collectEligibleBlocks>;
  readonly targets: ReturnType<typeof prepareBatches>[number]['targets'];
  readonly sentences: { id: string; text: string }[];
}

function fixture(): Fixture {
  renderBody(ARTICLE);
  const root = findArticleRoot(document);
  if (!root) throw new Error('no article root');
  const blocks = collectEligibleBlocks(root);
  const batches = prepareBatches(blocks);
  return {
    blocks,
    targets: batches.flatMap((batch) => batch.targets),
    sentences: batches.flatMap((batch) => batch.sentences),
  };
}

function candidateFor(
  sentenceId: string,
  sentenceText: string,
  original: string,
  simplified: string,
  overrides: Partial<ParaphraseItem> = {},
): GeneratedParaphraseCandidate {
  const slug = original
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return {
    sentenceId,
    item: {
      id: `gemini:${slug}:x:0`,
      conceptId: `frp:${slug}:x`,
      locale: 'fr-FR',
      register: 'formal',
      source: 'auto',
      sentence: sentenceText,
      exactSourceText: original,
      simplifiedSurface: simplified,
      choices: [original, 'préalablement à', 'conformément à'],
      acceptedChoice: original,
      clueSpan: sentenceText.slice(0, 18).trim(),
      plainMeaning: 'une explication simple',
      explanation: 'La simplification garde le sens.',
      distractorExplanation: 'Le distracteur ne convient pas ici.',
      complexity: 0.6,
      confidence: 0.9,
      ...overrides,
    },
  };
}

const CONTEXT: ParaphraseSelectionContext = {
  target: 0.6,
  window: [0.48, 0.72],
  dueConceptIds: [],
};

describe('binding to DOM ranges', () => {
  let data: Fixture;
  beforeEach(() => {
    data = fixture();
  });

  it('places an item whose original resolves to exactly one text node', () => {
    const sentence = data.sentences.find((entry) => entry.text.includes('postérieurement à'));
    expect(sentence).toBeDefined();
    if (!sentence) return;

    const placements = collectParaphraseCandidates(
      [candidateFor(sentence.id, sentence.text, 'postérieurement à', 'après')],
      data.targets,
    );
    expect(placements).toHaveLength(1);
    expect(placements[0]?.item.simplifiedSurface).toBe('après');
  });

  it('re-keys the item id to where it landed, so two runs agree', () => {
    const sentence = data.sentences.find((entry) => entry.text.includes('faciliter'));
    if (!sentence) throw new Error('missing sentence');

    const first = collectParaphraseCandidates(
      [candidateFor(sentence.id, sentence.text, 'faciliter', 'aider')],
      data.targets,
    );
    const second = collectParaphraseCandidates(
      [candidateFor(sentence.id, sentence.text, 'faciliter', 'aider')],
      fixture().targets,
    );
    expect(first[0]?.item.id).toBe(second[0]?.item.id);
    expect(first[0]?.item.id).toMatch(/@\d+:\d+$/);
  });

  it('drops an item whose sentence is not the one that was submitted', () => {
    const sentence = data.sentences[0];
    if (!sentence) throw new Error('missing sentence');
    const candidate = candidateFor(sentence.id, 'Une phrase inventée par le modèle.', 'phrase', 'mot');
    expect(collectParaphraseCandidates([candidate], data.targets)).toHaveLength(0);
  });

  it('drops an item bound to a sentence id that was never sent', () => {
    const sentence = data.sentences[0];
    if (!sentence) throw new Error('missing sentence');
    const candidate = candidateFor('s999', sentence.text, 'projet', 'plan');
    expect(collectParaphraseCandidates([candidate], data.targets)).toHaveLength(0);
  });

  it('drops an item that fails validation outright', () => {
    const sentence = data.sentences[0];
    if (!sentence) throw new Error('missing sentence');
    const candidate = candidateFor(sentence.id, sentence.text, 'projet', 'projet');
    expect(collectParaphraseCandidates([candidate], data.targets)).toHaveLength(0);
  });
});

describe('ranking', () => {
  let data: Fixture;
  beforeEach(() => {
    data = fixture();
  });

  function place(
    specs: readonly { original: string; simplified: string; complexity: number }[],
    context: ParaphraseSelectionContext = CONTEXT,
  ) {
    const candidates = specs.flatMap((spec) => {
      const sentence = data.sentences.find((entry) => entry.text.includes(spec.original));
      if (!sentence) return [];
      return [
        candidateFor(sentence.id, sentence.text, spec.original, spec.simplified, {
          complexity: spec.complexity,
        }),
      ];
    });
    return planParaphrases(collectParaphraseCandidates(candidates, data.targets), context, {
      eligibleWordCount: countEligibleWords(data.blocks),
    });
  }

  it('prefers the item closest to the target complexity', () => {
    const placements = place([
      { original: 'postérieurement à', simplified: 'après', complexity: 0.71 },
      { original: 'faciliter', simplified: 'aider', complexity: 0.6 },
    ]);
    expect(placements).toHaveLength(2);
    const best = [...placements].sort((a, b) => b.scored.score - a.scored.score)[0];
    expect(best?.item.exactSourceText).toBe('faciliter');
  });

  it('drops items outside the complexity window', () => {
    const placements = place([
      { original: 'postérieurement à', simplified: 'après', complexity: 0.95 },
      { original: 'faciliter', simplified: 'aider', complexity: 0.6 },
    ]);
    expect(placements.map((entry) => entry.item.exactSourceText)).toEqual(['faciliter']);
  });

  it('lets an owed wording through the window and to the front of the queue', () => {
    const owed = 'frp:le-caractere-ambigu:x';
    const placements = place(
      [
        { original: 'faciliter', simplified: 'aider', complexity: 0.6 },
        // Far above the window: without the bypass this can never come back.
        { original: 'Le caractère ambigu', simplified: 'Le flou', complexity: 0.95 },
      ],
      { ...CONTEXT, dueConceptIds: [owed] },
    );

    const owedPlacement = placements.find((entry) => entry.item.conceptId === owed);
    expect(owedPlacement).toBeDefined();
    expect(owedPlacement?.scored.owed).toBe(true);

    const ranked = [...placements].sort((a, b) =>
      a.scored.owed === b.scored.owed ? b.scored.score - a.scored.score : a.scored.owed ? -1 : 1,
    );
    expect(ranked[0]?.item.conceptId).toBe(owed);
  });

  it('never places two items in one sentence or two for one wording', () => {
    const sentence = data.sentences.find((entry) => entry.text.includes('faciliter'));
    if (!sentence) throw new Error('missing sentence');

    const placements = planParaphrases(
      collectParaphraseCandidates(
        [
          candidateFor(sentence.id, sentence.text, 'faciliter', 'aider'),
          candidateFor(sentence.id, sentence.text, 'coordination', 'organisation'),
          candidateFor(sentence.id, sentence.text, 'faciliter', 'rendre simple'),
        ],
        data.targets,
      ),
      CONTEXT,
      { eligibleWordCount: countEligibleWords(data.blocks) },
    );

    expect(placements).toHaveLength(1);
  });

  it('orders placements back-to-front within a block so offsets stay valid', () => {
    const placements = place([
      { original: 'postérieurement à', simplified: 'après', complexity: 0.6 },
      { original: 'faciliter', simplified: 'aider', complexity: 0.6 },
      { original: 'Le caractère ambigu', simplified: 'Le flou', complexity: 0.6 },
    ]);

    for (let index = 1; index < placements.length; index += 1) {
      const previous = placements[index - 1]!;
      const current = placements[index]!;
      if (previous.block.index === current.block.index) {
        expect(current.blockStart).toBeLessThan(previous.blockStart);
      } else {
        expect(current.block.index).toBeGreaterThan(previous.block.index);
      }
    }
  });
});

describe('proximity', () => {
  it('peaks at the target and reaches zero at the window edge', () => {
    expect(proximityTo(0.6, CONTEXT)).toBeCloseTo(1, 6);
    expect(proximityTo(0.72, CONTEXT)).toBeCloseTo(0, 6);
    expect(proximityTo(0.9, CONTEXT)).toBe(0);
  });
});
