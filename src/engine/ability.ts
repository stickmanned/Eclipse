/**
 * How good is this learner, and how sure are we?
 *
 * The first version of this was a single number nudged up and down by hand
 * tuned rates. It worked, but it could not answer the question that actually
 * matters: *how much do we know about this person?* Without that, the system
 * cannot tell the difference between "they are level 800" and "they might be
 * level 800, we have seen four answers". Those two need very different
 * behaviour.
 *
 * So the level is a distribution, not a number. It is item response theory
 * with a Gaussian belief over ability, updated once per answer.
 *
 *   ability  θ ~ N(mu, sigma²)
 *   item difficulty  b = log(rank + 1)
 *   P(correct) = sigmoid(SLOPE × (θ - b))
 *
 * Difficulty is the log of the frequency rank because vocabulary works that
 * way: the gap between rank 10 and rank 100 is a real jump in difficulty, the
 * gap between rank 9000 and rank 9090 is nothing.
 *
 * Three things fall out of this for free, which the old point estimate could
 * not do at all:
 *
 *   1. A brand new learner has huge uncertainty, so the selector knows to ask
 *      informative questions instead of guessing at a comfortable level.
 *   2. Uncertainty grows while we are not watching, so someone who studied
 *      elsewhere for a month is treated as an open question again.
 *   3. A run of surprises widens the belief, which makes the system explore
 *      again. That is the honest version of "correct quickly when you have
 *      leaned too far".
 */

/** How sharply the chance of success changes with difficulty. */
const SLOPE = 0.9;

/** What we believe about someone we have never met: somewhere around rank 400, very unsure. */
export const PRIOR_MU = Math.log(400);
export const PRIOR_SIGMA = 2.2;

/** Uncertainty never falls below this. Nobody is ever fully pinned down. */
const MIN_SIGMA = 0.25;
/** Nor does it grow without limit. */
const MAX_SIGMA = 3.0;

/** How much less sure we get per day of not watching. People change. */
const DRIFT_PER_DAY = 0.004;

/**
 * A wrong answer on an easy word, or a right answer on a hard one, means our
 * model of this person is off. Widen the belief so the selector goes and finds
 * out, rather than quietly carrying on with a wrong picture.
 *
 * The threshold has to be high. Eclipse deliberately aims at words the learner
 * has about an 85% chance of getting, so roughly one answer in seven is wrong
 * *by design*. At a threshold of 0.7 every one of those counted as a surprise,
 * uncertainty never fell, and the selector kept exploring forever — which
 * dragged real accuracy down to 50% on some pages, because exploring means
 * asking questions you cannot predict.
 *
 * Only a genuine shock should count.
 */
const SURPRISE_THRESHOLD = 0.92;
const SURPRISE_NOISE = 0.25;

/** Below this much uncertainty we stop hunting for information and aim for flow. */
export const SETTLED_SIGMA = 0.7;

/**
 * Exploring is never allowed to take over completely.
 *
 * Even when Eclipse knows nothing about someone, they are reading a web page,
 * not sitting an exam. A page tuned purely for information would be a page of
 * coin flips, which is miserable. So flow always keeps at least half the vote.
 */
export const MAX_EXPLORATION = 0.5;

const sigmoid = (x: number) => 1 / (1 + Math.exp(-x));

/** Turn a frequency rank into a difficulty on the ability scale. */
export function difficultyOf(rank: number): number {
  return Math.log(rank + 1);
}

/** And back again, for anything that wants to show a rank to a person. */
export function rankOf(difficulty: number): number {
  return Math.max(0, Math.round(Math.exp(difficulty) - 1));
}

export class Ability {
  /**
   * Switches used only by bench/ablate.ts, to measure whether the parts of
   * this model actually earn their place. Production never sets them.
   */
  exploreEnabled = true;
  /** Pin uncertainty, to imitate a model that does not track it at all. */
  frozenSigma: number | undefined = undefined;
  /** How much of the vote information-seeking may take. */
  exploreCap = MAX_EXPLORATION;

  constructor(
    public mu = PRIOR_MU,
    public sigma = PRIOR_SIGMA,
  ) {}

  /**
   * The chance this learner gets an item of this difficulty right.
   *
   * Averaged over everything we believe about their ability, not just our best
   * guess. When we are unsure this pulls the answer toward 0.5, which is
   * correct and useful: it stops the picker being confident about a learner it
   * has barely met.
   */
  pCorrect(b: number): number {
    const damping = Math.sqrt(1 + (SLOPE * SLOPE * this.sigma * this.sigma * Math.PI) / 8);
    return sigmoid((SLOPE * (this.mu - b)) / damping);
  }

  /**
   * How much would asking this item teach us about the learner?
   *
   * Fisher information. Highest for items they have a coin flip chance on,
   * because that is where the answer is least predictable and so tells us
   * most. Useless for items they are certain to get right or wrong.
   */
  information(b: number): number {
    const p = this.pCorrect(b);
    return SLOPE * SLOPE * p * (1 - p);
  }

  /**
   * Fold one answer into the belief.
   *
   * This is the standard online Bayesian update for logistic models: treat the
   * posterior as Gaussian again after each observation, matching its curvature
   * at the peak. It is a few lines and it is exact enough at this scale.
   */
  observe(b: number, correct: boolean): void {
    // The update uses the probability averaged over our uncertainty, which is
    // the standard form. Using the undamped probability at our best guess was
    // tried instead — it is theoretically tempting, since a large sigma makes
    // an easy word look like a coin flip — but measured across eight learners
    // it made calibration worse, not better. The theory lost to the data.
    const p = this.pCorrect(b);
    const y = correct ? 1 : 0;

    const precision = 1 / (this.sigma * this.sigma) + SLOPE * SLOPE * p * (1 - p);
    let variance = 1 / precision;

    this.mu += variance * SLOPE * (y - p);

    // A big surprise means the model was wrong, not that the learner was
    // unlucky. Being *less* sure afterwards is the honest response, and it is
    // what makes the system notice when someone's level has really changed.
    if (Math.abs(y - p) > SURPRISE_THRESHOLD) variance += SURPRISE_NOISE;

    this.sigma = this.frozenSigma ?? clampSigma(Math.sqrt(variance));
  }

  /** Time passed without us watching. Let the belief loosen. */
  drift(days: number): void {
    if (days <= 0 || this.frozenSigma !== undefined) return;
    const variance = this.sigma * this.sigma + DRIFT_PER_DAY * days;
    this.sigma = clampSigma(Math.sqrt(variance));
  }

  /** How much should we be exploring rather than settling into a comfortable page? */
  explorationWeight(): number {
    if (!this.exploreEnabled) return 0;
    return this.exploreCap * (this.sigma / (this.sigma + SETTLED_SIGMA));
  }

  /** The rank where this learner has a coin flip chance. For the popup. */
  level(): number {
    return rankOf(this.mu);
  }

  /** A plain range to show a person, rather than a false precision. */
  levelRange(): [number, number] {
    return [rankOf(this.mu - this.sigma), rankOf(this.mu + this.sigma)];
  }

  clone(): Ability {
    const c = new Ability(this.mu, this.sigma);
    c.exploreEnabled = this.exploreEnabled;
    c.frozenSigma = this.frozenSigma;
    c.exploreCap = this.exploreCap;
    return c;
  }
}

function clampSigma(s: number): number {
  if (!Number.isFinite(s)) return PRIOR_SIGMA;
  return Math.min(MAX_SIGMA, Math.max(MIN_SIGMA, s));
}
