/**
 * Builds the shared word list that ships inside the extension.
 *
 * The whole idea rests on one trick: sort every word by how often it appears,
 * then use its position in that list as its ID. Position 0 is the most common
 * word. A low ID means an easy word.
 *
 * After that, "give me easy words this person does not know yet" is a scan
 * from index 0 upward. No index. No query language. No database.
 *
 * Source: https://github.com/drkameleon/complete-hsk-vocabulary  (CC BY-SA 4.0)
 * It already joins HSK levels, SUBTLEX-CH frequency, pinyin, and CC-CEDICT
 * glosses, so we download one file instead of joining three.
 *
 * Run: npm run build:words
 */

import { mkdirSync, existsSync, writeFileSync, readFileSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..");
const CACHE = join(HERE, "cache");
const OUT = join(ROOT, "src", "data");

const SOURCE_URL =
  "https://raw.githubusercontent.com/drkameleon/complete-hsk-vocabulary/main/complete.min.json";

// ---------------------------------------------------------------------------
// The shape of the source file (minified field names).
// ---------------------------------------------------------------------------

interface SourceForm {
  t?: string; // traditional
  i?: { y?: string; n?: string }; // transcriptions: y = pinyin with tone marks
  m?: string[]; // English meanings
  c?: string[]; // classifiers (measure words)
}

interface SourceWord {
  s: string; // simplified
  l?: string[]; // levels, e.g. ["t3","n4","o3"]
  q?: number; // frequency rank (lower = more common)
  p?: string[]; // parts of speech
  f?: SourceForm[]; // forms
}

// ---------------------------------------------------------------------------
// What we ship. Arrays, not objects — the field names would cost more than
// the data at 11k entries.
// ---------------------------------------------------------------------------

/** [simplified, pinyin, hskLevel (0 = not in HSK), pos, meanings] */
export type PackedWord = [string, string, number, string, string[]];

// ---------------------------------------------------------------------------

async function fetchSource(): Promise<SourceWord[]> {
  mkdirSync(CACHE, { recursive: true });
  const cached = join(CACHE, "hsk.json");

  if (!existsSync(cached)) {
    process.stdout.write("downloading complete-hsk-vocabulary ... ");
    const res = await fetch(SOURCE_URL);
    if (!res.ok) throw new Error(`download failed: ${res.status} ${res.statusText}`);
    writeFileSync(cached, Buffer.from(await res.arrayBuffer()));
    console.log("done");
  } else {
    console.log(`using cached ${cached}`);
  }

  return JSON.parse(readFileSync(cached, "utf8")) as SourceWord[];
}

/**
 * HSK level from the source's level tags. "n4" means new HSK level 4.
 * We prefer the new (3.0) scale and fall back to the old one.
 */
function hskLevel(levels: string[] | undefined): number {
  if (!levels?.length) return 0;
  for (const prefix of ["n", "o", "t"]) {
    for (const tag of levels) {
      if (tag.startsWith(prefix)) {
        const n = Number.parseInt(tag.slice(1), 10);
        if (Number.isFinite(n)) return n;
      }
    }
  }
  return 0;
}

/** Glosses we can never use as a swap target, because they are not English words. */
const JUNK_GLOSS =
  /^(variant of|see |see also|abbr\.? for|old variant|erhua variant|surname |used in|also written|classifier for)/i;
const HAS_CJK = /[㐀-鿿豈-﫿]/;

/**
 * Turn one dictionary gloss into the English words a learner might type.
 *
 * The source packs synonyms into a single string with semicolons, so one
 * gloss usually holds several answers. Split first, or "to speak; to talk;
 * to say" gets thrown away for being six words long and we lose the three
 * best answers for 说.
 *
 * "to speak; to talk; to say"  -> ["speak", "talk", "say"]
 * "Arabic (language)"          -> ["arabic"]
 * "(bound form) individual"    -> ["individual"]
 * "variant of 啊"               -> []
 *
 * We keep short answers only. A ten-word definition is a definition, not a
 * word we can swap into a sentence.
 */
function normalizeGloss(raw: string): string[] {
  const out: string[] = [];

  for (let g of raw.split(/[;/]|,\s+(?=(?:to|a|an|the)\s)/)) {
    g = g.trim();
    if (!g || JUNK_GLOSS.test(g) || HAS_CJK.test(g)) continue;

    g = g.replace(/\([^)]*\)/g, " "); // drop parenthetical asides
    g = g.replace(/\[[^\]]*\]/g, " "); // drop bracketed pinyin
    g = g.replace(/\s+/g, " ").trim().toLowerCase();
    g = g.replace(/^to\s+/, ""); // "to bless" -> "bless"
    g = g.replace(/^(a|an|the)\s+/, ""); // "a blue apple" -> "blue apple"
    g = g.replace(/[.,;:!?~]+$/, "").trim();

    if (!g || !/[a-z]/.test(g)) continue;
    if (g.split(" ").length > 4) continue; // too phrasal to swap
    if (!out.includes(g)) out.push(g);
  }

  return out;
}

/**
 * How many meanings of this form survive normalization. Used to find the
 * dominant reading of a character that has more than one.
 */
function usableCount(form: SourceForm): number {
  let n = 0;
  for (const raw of form.m ?? []) n += normalizeGloss(raw).length;
  return n;
}

async function main() {
  const source = await fetchSource();
  console.log(`source entries: ${source.length}`);

  // ------------------------------------------------------------------
  // 1. Flatten to one record per word, keeping only what we need.
  // ------------------------------------------------------------------
  interface Draft {
    simplified: string;
    pinyin: string;
    hsk: number;
    pos: string;
    meanings: string[];
    freq: number;
  }

  const drafts: Draft[] = [];
  let droppedNoGloss = 0;

  for (const word of source) {
    if (!word.s) continue;

    // The source lists forms in alphabetical order of pinyin, not by how
    // common the reading is. That puts rare readings first: 说 comes out as
    // "shuì / to persuade" instead of "shuō / to speak".
    //
    // The dominant reading is reliably the one the dictionary gives the most
    // meanings to. Sort by that, so a learner sees the reading they will
    // actually meet. Array.sort is stable, so ties keep source order.
    const forms = [...(word.f ?? [])].sort((a, b) => usableCount(b) - usableCount(a));
    const primary = forms[0];

    // Collect glosses across every form, dominant reading first, no duplicates.
    const meanings: string[] = [];
    outer: for (const form of forms) {
      for (const raw of form.m ?? []) {
        for (const g of normalizeGloss(raw)) {
          if (!meanings.includes(g)) meanings.push(g);
          if (meanings.length >= 8) break outer;
        }
      }
    }

    if (meanings.length === 0) {
      droppedNoGloss++;
      continue; // we cannot teach a word we cannot explain in English
    }

    drafts.push({
      simplified: word.s,
      pinyin: primary?.i?.y ?? "",
      hsk: hskLevel(word.l),
      pos: word.p?.[0] ?? "",
      meanings,
      // Words with no frequency go to the back of the queue, not the front.
      freq: typeof word.q === "number" && word.q > 0 ? word.q : Number.MAX_SAFE_INTEGER,
    });
  }

  // ------------------------------------------------------------------
  // 2. Sort by frequency. This is the step that makes the ID meaningful.
  // ------------------------------------------------------------------
  drafts.sort((a, b) => a.freq - b.freq || a.simplified.localeCompare(b.simplified));

  const words: PackedWord[] = drafts.map((d) => [
    d.simplified,
    d.pinyin,
    d.hsk,
    d.pos,
    d.meanings,
  ]);

  // ------------------------------------------------------------------
  // 3. Write it as one string inside a .ts file.
  //
  //    Not JSON. A JSON module with 17,000 keys makes bundlers and loaders
  //    try to create a named export per key, which breaks. A single string
  //    constant is something every tool already handles, TypeScript types it
  //    as `string` with no work, and parsing it at startup costs a few
  //    milliseconds.
  //
  //    We do not ship an English index either. It is fully derivable from
  //    the meanings below, so building it on load saves 400 KB and removes a
  //    file that could fall out of step with this one.
  //
  //    One record per line. Tab between fields. Pipe between meanings.
  //      simplified <TAB> pinyin <TAB> hsk <TAB> pos <TAB> meaning|meaning
  // ------------------------------------------------------------------
  const lines = words.map((w) => [w[0], w[1], w[2], w[3], w[4].join("|")].join("\t"));
  const packed = lines.join("\n");

  mkdirSync(OUT, { recursive: true });
  const wordsPath = join(OUT, "words.ts");
  writeFileSync(
    wordsPath,
    `// Generated by data/build-wordlist.ts. Do not edit by hand.\n` +
      `// Source: complete-hsk-vocabulary (CC BY-SA 4.0), sorted by SUBTLEX-CH frequency.\n` +
      `// ${words.length} words. Line number = word ID = difficulty rank.\n` +
      `// Fields: simplified \\t pinyin \\t hskLevel \\t partOfSpeech \\t meaning|meaning|...\n` +
      `export const WORDS_PACKED = ${JSON.stringify(packed)};\n`,
  );

  // Count what the index will hold, so the report still tells us.
  const englishKeys = new Set<string>();
  for (const d of drafts) for (const g of d.meanings) englishKeys.add(g);

  // ------------------------------------------------------------------
  // 5. Report, so we can see what we actually got.
  // ------------------------------------------------------------------
  const kb = (p: string) => `${(statSync(p).size / 1024).toFixed(0)} KB`;
  const withFreq = drafts.filter((d) => d.freq !== Number.MAX_SAFE_INTEGER).length;
  const byHsk = new Map<number, number>();
  for (const d of drafts) byHsk.set(d.hsk, (byHsk.get(d.hsk) ?? 0) + 1);

  console.log("");
  console.log(`words kept        ${words.length}`);
  console.log(`  dropped (no usable English gloss)  ${droppedNoGloss}`);
  console.log(`  with real frequency data           ${withFreq}`);
  console.log(`english keys      ${englishKeys.size} (index built at load, not shipped)`);
  console.log(`src/data/words.ts ${kb(wordsPath)}`);
  console.log("");
  console.log("HSK level spread:");
  for (const lvl of [...byHsk.keys()].sort((a, b) => a - b)) {
    console.log(`  ${lvl === 0 ? "none" : `HSK ${lvl}`}  ${byHsk.get(lvl)}`);
  }
  console.log("");
  console.log("20 easiest words (rank 0-19):");
  for (let i = 0; i < 20; i++) {
    const w = words[i]!;
    console.log(`  ${String(i).padStart(4)}  ${w[0].padEnd(6)} ${w[1].padEnd(14)} ${w[4][0]}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
