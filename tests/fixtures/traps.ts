import type { ContextTrap } from '@/domain/trap';

/** A valid catalog trap, used as the base for negative cases. */
export function validTrap(overrides: Partial<ContextTrap> = {}): ContextTrap {
  return {
    id: 'fr:attendre:wait@0:10',
    conceptId: 'fr:attendre:wait',
    sourceLocale: 'en',
    targetLocale: 'fr-FR',
    type: 'false_friend',
    sentence: 'We had to wait for the bus for nearly an hour.',
    exactSourceText: 'wait',
    targetSurface: 'attendre',
    choices: ['wait', 'hope', 'hear'],
    acceptedChoice: 'wait',
    clueSpan: 'for the bus',
    explanation: 'attendre is to wait for something.',
    distractorExplanation: 'hope is esperer, an inner state rather than waiting on a thing.',
    difficulty: 0.35,
    confidence: 1,
    provider: 'catalog',
    ...overrides,
  };
}

/** A generated trap, which is held to the confidence floor and the untrusted checks. */
export function generatedTrap(overrides: Partial<ContextTrap> = {}): ContextTrap {
  return validTrap({ provider: 'gemini', confidence: 0.9, ...overrides });
}
