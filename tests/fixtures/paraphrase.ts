/**
 * Valid Paraphrase Mode items, and the French sentences they came from.
 *
 * Every fixture here passes `validateParaphraseItem` unmodified, so a test that
 * wants to prove a rule *rejects* something can start from a known-good item
 * and break exactly one field. That keeps a failing assertion pointing at the
 * rule under test rather than at an unrelated field the fixture got wrong.
 */

import type { ParaphraseItem } from '@/domain/paraphrase';

export const SENTENCES = {
  deadline:
    'Le projet de rénovation a été entamé postérieurement à la date butoir, ce qui a suscité une certaine consternation.',
  mechanism:
    'Le dispositif mis en place sert avant tout à faciliter la coordination entre les maraîchers et les services techniques.',
  ambiguous:
    'Le caractère ambigu de la directive préfectorale explique en grande partie ce décalage entre les services.',
  timeline:
    'L’échéancier des travaux a été prolongé en raison de circonstances imprévues, notamment la découverte de fondations fragiles.',
} as const;

export function paraphraseItem(overrides: Partial<ParaphraseItem> = {}): ParaphraseItem {
  return {
    id: 'gemini:posterieurement:apres:0',
    conceptId: 'frp:posterieurement:apres',
    locale: 'fr-FR',
    register: 'formal',
    source: 'auto',
    sentence: SENTENCES.deadline,
    exactSourceText: 'postérieurement à',
    simplifiedSurface: 'après',
    choices: ['postérieurement à', 'préalablement à', 'conformément à'],
    acceptedChoice: 'postérieurement à',
    clueSpan: 'la date butoir',
    plainMeaning: 'après, une fois la date passée',
    explanation: 'La phrase situe le début du projet une fois la date dépassée.',
    distractorExplanation: 'préalablement à voudrait dire avant, ce que la suite contredit.',
    complexity: 0.62,
    confidence: 0.92,
    ...overrides,
  };
}

/** The spec's second round: a mechanism that "sert à faciliter" the process. */
export function facilitateItem(overrides: Partial<ParaphraseItem> = {}): ParaphraseItem {
  return paraphraseItem({
    id: 'gemini:faciliter:aider:0',
    conceptId: 'frp:faciliter:aider',
    register: 'formal',
    sentence: SENTENCES.mechanism,
    exactSourceText: 'faciliter',
    simplifiedSurface: 'aider',
    choices: ['faciliter', 'entraver', 'prolonger'],
    acceptedChoice: 'faciliter',
    clueSpan: 'la coordination entre les maraîchers',
    plainMeaning: 'rendre plus facile, rendre plus simple',
    explanation: 'Le dispositif rend la coordination plus simple.',
    distractorExplanation: 'entraver signifierait gêner, l’inverse de ce que dit la phrase.',
    complexity: 0.55,
    ...overrides,
  });
}

/** The spec's third round: the wording the learner gets wrong and is owed. */
export function ambiguousItem(overrides: Partial<ParaphraseItem> = {}): ParaphraseItem {
  return paraphraseItem({
    id: 'gemini:ambigu:flou:0',
    conceptId: 'frp:ambigu:flou',
    register: 'academic',
    sentence: SENTENCES.ambiguous,
    exactSourceText: 'Le caractère ambigu',
    simplifiedSurface: 'Le flou',
    choices: ['Le caractère ambigu', 'Le caractère ambitieux', 'Le caractère impératif'],
    acceptedChoice: 'Le caractère ambigu',
    clueSpan: 'explique en grande partie ce décalage',
    plainMeaning: 'ce qui peut se comprendre de plusieurs façons',
    explanation: 'Une directive ambiguë se prête à plusieurs lectures, d’où le décalage.',
    distractorExplanation: 'ambitieux parle de l’ampleur du projet, pas de sa clarté.',
    complexity: 0.78,
    ...overrides,
  });
}
