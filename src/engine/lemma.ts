/**
 * Turning an English word back into its dictionary form.
 *
 * A Chinese-English dictionary stores "have", not "has" or "having". Real web
 * pages are full of "has" and "having". Without this step Eclipse silently
 * misses most verbs and most plural nouns, and the pages look far emptier
 * than they should.
 *
 * This is rules plus a short list of exceptions. English inflection is regular
 * enough that a dictionary of every form would be mostly waste.
 */

/** Forms that no rule will ever get right. */
const IRREGULAR: Record<string, string> = {
  // to be
  am: "be", is: "be", are: "be", was: "be", were: "be", been: "be", being: "be",
  // the other very common verbs
  has: "have", had: "have", having: "have",
  does: "do", did: "do", done: "do", doing: "do",
  goes: "go", went: "go", gone: "go",
  says: "say", said: "say",
  got: "get", gotten: "get",
  made: "make", knew: "know", known: "know",
  thought: "think", took: "take", taken: "take",
  saw: "see", seen: "see", came: "come",
  gave: "give", given: "give", found: "find",
  told: "tell", became: "become", left: "leave",
  felt: "feel", brought: "bring",
  began: "begin", begun: "begin", kept: "keep", held: "hold",
  wrote: "write", written: "write", stood: "stand", heard: "hear",
  meant: "mean", met: "meet", ran: "run", paid: "pay", sat: "sit",
  spoke: "speak", spoken: "speak", led: "lead", grew: "grow", grown: "grow",
  lost: "lose", fell: "fall", fallen: "fall", sent: "send", built: "build",
  understood: "understand", drew: "draw", drawn: "draw",
  broke: "break", broken: "break", spent: "spend", rose: "rise", risen: "rise",
  drove: "drive", driven: "drive", bought: "buy", wore: "wear", worn: "wear",
  chose: "choose", chosen: "choose", ate: "eat", eaten: "eat",
  taught: "teach", caught: "catch", sold: "sell",
  sang: "sing", sung: "sing", drank: "drink", drunk: "drink",
  swam: "swim", swum: "swim", flew: "fly", flown: "fly",
  slept: "sleep", won: "win", threw: "throw", thrown: "throw",
  // irregular plurals
  children: "child", people: "person", men: "man", women: "woman",
  feet: "foot", teeth: "tooth", mice: "mouse", geese: "goose",
  lives: "life", knives: "knife", wives: "wife", leaves: "leaf",
  halves: "half", wolves: "wolf", shelves: "shelf", selves: "self",
  // comparatives that change the stem
  better: "good", best: "good", worse: "bad", worst: "bad",
  more: "many", most: "many", less: "little", least: "little",
};

/** Words that end in -s but are not plural. */
const NOT_PLURAL = new Set([
  "this", "his", "its", "us", "yes", "gas", "bus", "class", "glass", "grass",
  "pass", "press", "cross", "dress", "less", "miss", "boss", "loss", "news",
  "series", "species", "always", "perhaps", "was", "as", "has", "is",
]);

const VOWELS = "aeiou";

/**
 * Every base form worth trying for one word, best guess first.
 *
 * We return several rather than one because we cannot tell "saved" from
 * "saved" without knowing the verb: it could come from "save" or "sav". The
 * caller tries each against the dictionary and takes the first that exists,
 * which is a cheap and reliable way to pick the right one.
 */
export function lemmaCandidates(word: string): string[] {
  const w = word.toLowerCase();
  const out: string[] = [w];

  const add = (s: string) => {
    if (s.length >= 2 && !out.includes(s)) out.push(s);
  };

  const irregular = IRREGULAR[w];
  if (irregular) add(irregular);

  // plural and third person: owns -> own, studies -> study, watches -> watch
  if (w.endsWith("ies") && w.length > 4) add(`${w.slice(0, -3)}y`);
  if (w.endsWith("es") && w.length > 3) {
    add(w.slice(0, -2));
    add(w.slice(0, -1));
  }
  if (w.endsWith("s") && !w.endsWith("ss") && !NOT_PLURAL.has(w) && w.length > 2) {
    add(w.slice(0, -1));
  }

  // past tense: owned -> own, liked -> like, stopped -> stop, studied -> study
  if (w.endsWith("ied") && w.length > 4) add(`${w.slice(0, -3)}y`);
  if (w.endsWith("ed") && w.length > 3) {
    add(w.slice(0, -2));
    add(w.slice(0, -1));
    add(undouble(w.slice(0, -2)));
  }

  // present participle: eating -> eat, making -> make, running -> run
  if (w.endsWith("ing") && w.length > 4) {
    const stem = w.slice(0, -3);
    add(stem);
    add(`${stem}e`);
    add(undouble(stem));
  }

  // comparatives: bigger -> big, easiest -> easy
  if (w.endsWith("est") && w.length > 4) {
    add(w.slice(0, -3));
    add(`${w.slice(0, -3)}e`);
    add(undouble(w.slice(0, -3)));
    if (w.endsWith("iest")) add(`${w.slice(0, -4)}y`);
  }
  if (w.endsWith("er") && w.length > 4) {
    add(w.slice(0, -2));
    add(w.slice(0, -1));
    add(undouble(w.slice(0, -2)));
    if (w.endsWith("ier")) add(`${w.slice(0, -3)}y`);
  }

  // adverbs: quickly -> quick, happily -> happy
  if (w.endsWith("ly") && w.length > 4) {
    add(w.slice(0, -2));
    if (w.endsWith("ily")) add(`${w.slice(0, -3)}y`);
  }

  return out;
}

/** "stopp" -> "stop". Undo the doubled consonant before -ed or -ing. */
function undouble(stem: string): string {
  const n = stem.length;
  if (n < 3) return stem;
  const last = stem[n - 1]!;
  if (last === stem[n - 2] && !VOWELS.includes(last) && last !== "l" && last !== "s") {
    return stem.slice(0, -1);
  }
  return stem;
}
