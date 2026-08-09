/**
 * The deterministic French catalog.
 *
 * This is the complete product path. Everything Eclipse promises — the demo,
 * the wrong-answer transfer, the Truth Cards — runs from this file with no
 * network access of any kind.
 *
 * Every surface is written with its real accents and apostrophes and is stored
 * in NFC. `bibliothèque` is never `bibliotheque`; `l’école` keeps U+2019.
 */

import type { CatalogEntry } from './types';
import { toNfc } from '../domain/normalize';

function entry(value: CatalogEntry): CatalogEntry {
  return { ...value, targetSurface: toNfc(value.targetSurface) };
}

export const FRENCH_CATALOG: readonly CatalogEntry[] = [
  entry({
    conceptId: 'fr:attendre:wait',
    type: 'false_friend',
    targetSurface: 'attendre',
    exactSourceText: 'wait',
    choices: ['wait', 'hope', 'hear'],
    acceptedChoice: 'wait',
    clueCandidates: [
      'for the bus',
      'outside the theater',
      'until the doors open',
      'for nearly an hour',
      'for the train',
      'in line',
    ],
    forbidden: ['wait staff', 'wait tables', 'dumbwaiter', 'wait-and-see'],
    explanation:
      'attendre is to wait — to stay put until something arrives. The English verb it resembles, attend, is a different word entirely.',
    distractorExplanation:
      'hope is the tempting miss, because both verbs describe waiting on something you want. But hope is espérer, an inner state; attendre needs a thing you are waiting for, and the clue names it.',
    difficulty: 0.5,
    contextQuality: 0.95,
  }),

  entry({
    conceptId: 'fr:actuellement:currently',
    type: 'false_friend',
    targetSurface: 'actuellement',
    exactSourceText: 'currently',
    choices: ['currently', 'actually', 'eventually'],
    acceptedChoice: 'currently',
    clueCandidates: [
      'will reopen next Monday',
      'will reopen',
      'next Monday',
      'at the moment',
      'right now',
      'for the time being',
    ],
    explanation:
      'actuellement means currently, at this moment. It is about the present, not about correcting a misunderstanding.',
    distractorExplanation:
      'actually is the classic false friend — the two words look identical. But actually corrects something, and nothing here is being corrected: the sentence is fixing a moment in time, which is what the clue does.',
    difficulty: 0.5,
    contextQuality: 0.95,
  }),

  entry({
    conceptId: 'fr:assister-a:attend',
    type: 'false_friend',
    targetSurface: 'assister à',
    exactSourceText: 'attend',
    choices: ['attend', 'assist', 'organize'],
    acceptedChoice: 'attend',
    clueCandidates: ['the conference', 'the ceremony', 'the lecture', 'the meeting', 'the opening'],
    requiredAny: ['conference', 'ceremony', 'lecture', 'meeting', 'opening', 'concert'],
    forbidden: ['attend to', 'attended to'],
    explanation:
      'assister à is to attend — to be present at an event. It takes the preposition à and an event as its object.',
    distractorExplanation:
      'assist is the trap, because assister and assist share a root. But helping someone is aider; assister à only ever means being in the audience, and the clue names the event.',
    difficulty: 0.5,
    contextQuality: 0.9,
  }),

  entry({
    conceptId: 'fr:appel:appeal',
    type: 'polysemy',
    targetSurface: 'appel',
    exactSourceText: 'appeal',
    choices: ['appeal', 'call', 'name'],
    acceptedChoice: 'appeal',
    clueCandidates: ['after the verdict', 'The lawyer filed', 'the verdict', 'lawyer', 'filed'],
    requiredAny: ['lawyer', 'court', 'verdict', 'judge', 'filed', 'ruling', 'appellate'],
    forbidden: [
      'appeal to me',
      'wide appeal',
      'mass appeal',
      'lost its appeal',
      'holds appeal',
      'appealing',
    ],
    explanation:
      'In a courtroom, appel is an appeal: faire appel is to challenge a ruling before a higher court.',
    distractorExplanation:
      'call is the honest first guess — appel usually is a call, as in un appel téléphonique. The legal setting is what narrows it: lawyers file appeals, not calls, and verdicts are what get appealed.',
    difficulty: 0.6,
    contextQuality: 0.9,
  }),

  entry({
    conceptId: 'fr:avoir-le-cafard:gloomy',
    type: 'idiom',
    targetSurface: 'avait le cafard',
    exactSourceText: 'felt gloomy',
    choices: ['felt gloomy', 'saw a cockroach', 'felt hungry'],
    acceptedChoice: 'felt gloomy',
    clueCandidates: ['After failing the exam', 'failing the exam', 'After losing', 'all weekend'],
    explanation:
      'avoir le cafard is fixed: to feel low, to have the blues. The whole phrase carries the meaning; the parts do not.',
    distractorExplanation:
      'saw a cockroach is the literal reading, and cafard really does mean cockroach on its own. Idioms do not decompose — and nothing in the sentence puts an insect in the room, while the clue explains the mood.',
    difficulty: 0.55,
    contextQuality: 0.95,
  }),

  entry({
    conceptId: 'fr:bibliotheque:library',
    type: 'false_friend',
    targetSurface: 'bibliothèque',
    exactSourceText: 'library',
    choices: ['library', 'bookstore', 'stationery shop'],
    acceptedChoice: 'library',
    clueCandidates: ['borrow', 'borrowed', 'on loan', 'return the books', 'lending'],
    requiredAny: ['borrow', 'borrowed', 'lend', 'lending', 'loan', 'return'],
    forbidden: ['bought', 'purchase', 'purchased', 'price', 'checkout counter'],
    explanation:
      'bibliothèque is a library — a place that lends. It is also the word for a bookshelf at home.',
    distractorExplanation:
      'bookstore is the trap set by librairie, which looks like library but is where you buy. Borrowing is the giveaway: you borrow from a bibliothèque and pay at a librairie.',
    difficulty: 0.4,
    contextQuality: 0.92,
  }),

  entry({
    conceptId: 'fr:librairie:bookstore',
    type: 'false_friend',
    targetSurface: 'librairie',
    exactSourceText: 'bookstore',
    choices: ['bookstore', 'library', 'printing works'],
    acceptedChoice: 'bookstore',
    clueCandidates: ['bought', 'paid', 'sells', 'for sale', 'price'],
    requiredAny: ['bought', 'buy', 'buys', 'paid', 'sells', 'sold', 'price', 'for sale'],
    forbidden: ['borrow', 'borrowed', 'on loan'],
    explanation:
      'librairie is a bookstore. Money changes hands there; that is the whole distinction.',
    distractorExplanation:
      'library is the mirror image of the bibliothèque trap, and it catches learners in both directions. Buying, not borrowing, is what the clue establishes.',
    difficulty: 0.45,
    contextQuality: 0.9,
  }),

  entry({
    conceptId: 'fr:ecole:school',
    type: 'polysemy',
    targetSurface: 'l’école',
    exactSourceText: 'the school',
    choices: ['the school', 'the schooling', 'the schoolyard'],
    acceptedChoice: 'the school',
    clueCandidates: ['pupils', 'classrooms', 'teachers', 'the building', 'lessons'],
    requiredAny: ['pupils', 'classroom', 'classrooms', 'teachers', 'building', 'lessons'],
    explanation:
      'l’école names the institution and the building together. Note the apostrophe: le becomes l’ before a vowel.',
    distractorExplanation:
      'the schooling is close enough to be tempting, but that abstract sense is la scolarité. The clue points at a physical place with people in it, not at an education as a process.',
    difficulty: 0.25,
    contextQuality: 0.85,
  }),

  entry({
    conceptId: 'fr:journee:day',
    type: 'false_friend',
    targetSurface: 'journée',
    exactSourceText: 'day',
    choices: ['the day as a stretch of time', 'a journey', 'a day on the calendar'],
    acceptedChoice: 'the day as a stretch of time',
    clueCandidates: ['spent the entire', 'from morning', 'all through the', 'the entire'],
    requiredAny: ['entire', 'whole', 'spent', 'morning', 'throughout'],
    explanation:
      'journée is the day as lived through — its whole span. jour is the day as a unit you count.',
    distractorExplanation:
      'a journey is pure spelling coincidence and catches most English readers once. The clue is about duration, which is exactly the difference between journée and jour.',
    difficulty: 0.5,
    contextQuality: 0.88,
  }),

  entry({
    conceptId: 'fr:rester:stay',
    type: 'false_friend',
    targetSurface: 'rester',
    exactSourceText: 'stay',
    choices: ['stay', 'rest', 'resist'],
    acceptedChoice: 'stay',
    clueCandidates: ['at home', 'in the room', 'behind', 'outside', 'where they were'],
    forbidden: ['stay up', 'stay away from'],
    explanation: 'rester is to stay, to remain in place. Resting is se reposer.',
    distractorExplanation:
      'rest is the trap the spelling sets, and both words are about not moving. But rester is about location, not recovery, and the clue names a place.',
    difficulty: 0.35,
    contextQuality: 0.88,
  }),

  entry({
    conceptId: 'fr:sensible:sensitive',
    type: 'false_friend',
    targetSurface: 'sensible',
    exactSourceText: 'sensitive',
    choices: ['sensitive', 'level-headed', 'reasonable'],
    acceptedChoice: 'sensitive',
    clueCandidates: ['to criticism', 'easily hurt', 'took it badly', 'delicate'],
    requiredAny: ['criticism', 'hurt', 'feelings', 'delicate', 'badly'],
    explanation:
      'sensible means sensitive — quick to feel things. The English sensible is raisonnable.',
    distractorExplanation:
      'level-headed is what an English reader assumes, since the word is spelled identically. But the clue is about being wounded, and a level-headed person is precisely not that.',
    difficulty: 0.55,
    contextQuality: 0.87,
  }),

  entry({
    conceptId: 'fr:blesse:injured',
    type: 'false_friend',
    targetSurface: 'blessé',
    exactSourceText: 'injured',
    choices: ['injured', 'blessed', 'blamed'],
    acceptedChoice: 'injured',
    clueCandidates: ['in the crash', 'taken to hospital', 'the ambulance', 'a broken'],
    requiredAny: ['crash', 'hospital', 'ambulance', 'broken', 'collision'],
    explanation: 'blessé means injured, wounded. blesser is to hurt someone.',
    distractorExplanation:
      'blessed is the false friend, and it points the opposite way — one is harm, the other is grace. The clue puts the person in a medical situation.',
    difficulty: 0.45,
    contextQuality: 0.9,
  }),

  entry({
    conceptId: 'fr:deception:disappointment',
    type: 'false_friend',
    targetSurface: 'déception',
    exactSourceText: 'disappointment',
    choices: ['disappointment', 'trickery', 'disgrace'],
    acceptedChoice: 'disappointment',
    clueCandidates: ['after losing the final', 'the result was a heavy', 'brought a sense of'],
    explanation:
      'déception means disappointment — a feeling of letdown. Deception in French is tromperie.',
    distractorExplanation:
      'deception is the classic false friend. But déception is about feeling disappointed, not about lying or cheating.',
    difficulty: 0.6,
    contextQuality: 0.95,
  }),

  entry({
    conceptId: 'fr:eventuellement:possibly',
    type: 'false_friend',
    targetSurface: 'éventuellement',
    exactSourceText: 'possibly',
    choices: ['possibly', 'eventually', 'definitely'],
    acceptedChoice: 'possibly',
    clueCandidates: ['if time allows', 'we could', 'if necessary'],
    explanation:
      'éventuellement means possibly or potentially if circumstances allow. Eventually is finalement.',
    distractorExplanation:
      'eventually is the trap set by spelling similarity. But éventuellement expresses possibility, not certainty over time.',
    difficulty: 0.65,
    contextQuality: 0.92,
  }),

  entry({
    conceptId: 'fr:dailleurs:besides',
    type: 'phrase',
    targetSurface: 'd’ailleurs',
    exactSourceText: 'besides',
    choices: ['besides', 'elsewhere', 'moreover'],
    acceptedChoice: 'besides',
    clueCandidates: ['in addition', 'as a matter of fact', 'he mentioned'],
    explanation:
      'd’ailleurs means besides, moreover, or for that matter. It connects arguments or adds a relevant side note.',
    distractorExplanation:
      'elsewhere is the literal translation of ailleurs. But d’ailleurs functions as a logical connector.',
    difficulty: 0.55,
    contextQuality: 0.9,
  }),

  entry({
    conceptId: 'fr:en-fait:in-fact',
    type: 'phrase',
    targetSurface: 'en fait',
    exactSourceText: 'in fact',
    choices: ['in fact', 'by effect', 'in short'],
    acceptedChoice: 'in fact',
    clueCandidates: ['the truth is', 'contrary to expectations', 'as it turns out'],
    explanation: 'en fait means in fact or actually, clarifying what really happened.',
    distractorExplanation: 'by effect confuses fait (fact) with effet (effect).',
    difficulty: 0.52,
    contextQuality: 0.92,
  }),

  entry({
    conceptId: 'fr:resumer:summarize',
    type: 'false_friend',
    targetSurface: 'résumer',
    exactSourceText: 'summarize',
    choices: ['summarize', 'resume', 'restart'],
    acceptedChoice: 'summarize',
    clueCandidates: ['the main points', 'in a few words', 'the report'],
    explanation: 'résumer is to summarize or sum up. To resume an activity is reprendre.',
    distractorExplanation:
      'resume is the false friend. But résumer condenses text or ideas into a summary.',
    difficulty: 0.56,
    contextQuality: 0.9,
  }),

  entry({
    conceptId: 'fr:quitte-a:even-if-it-means',
    type: 'phrase',
    targetSurface: 'quitte à',
    exactSourceText: 'even if it means',
    choices: ['even if it means', 'leaving behind', 'as long as'],
    acceptedChoice: 'even if it means',
    clueCandidates: ['working late', 'taking a risk', 'spending extra money'],
    explanation:
      'quitte à means even if it involves or at the risk of. It expresses willingness to accept a consequence.',
    distractorExplanation:
      'leaving behind takes quitte literally from quitter, but quitte à is a fixed concession connector.',
    difficulty: 0.75,
    contextQuality: 0.9,
  }),
] as const;

/** Look up a catalog entry by concept id. */
export function catalogEntryFor(conceptId: string): CatalogEntry | undefined {
  return FRENCH_CATALOG.find((item) => item.conceptId === conceptId);
}

/** All concept ids in the bundled catalog, in declaration order. */
export function catalogConceptIds(): string[] {
  return FRENCH_CATALOG.map((item) => item.conceptId);
}
