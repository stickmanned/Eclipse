/**
 * End to end check of everything the service worker does, without Chrome.
 * picker -> prompt -> model -> validate -> what the page would draw.
 */
import { loadKey } from "./key.js";
import { LearnerStore } from "../src/engine/store.js";
import { planScreen } from "../src/engine/picker.js";
import { buildRequests } from "../src/background/prompt.js";
import { rewrite } from "../src/background/model.js";
import { getWord } from "../src/engine/words.js";
import { markAnswer } from "../src/engine/score.js";

const PAGE = [
  "Bob owns a blue apple, the apple is magical.",
  "She opened the door and walked into the small room.",
  "The government announced a new plan to build more houses.",
  "I think the best way to learn a language is to use it every day.",
  "He wrote a long letter to his mother.",
];

const store = LearnerStore.fromHskLevel(3);
const plans = planScreen(PAGE, store, { density: store.density, newBudget: store.newBudget });
const requests = buildRequests(plans);

console.log(`\nEngine chose ${requests.reduce((n,r)=>n+r.replace.length,0)} swaps across ${requests.length} sentences:`);
for (const r of requests) console.log(`  [${r.i}] ${r.replace.map(x=>`${x.en}->${x.zh}`).join("  ")}`);

const t = Date.now();
const result = await rewrite(loadKey(), requests);
console.log(`\nModel: ${Date.now()-t}ms, $${result.cost.toFixed(5)}${result.error ? ", ERROR: "+result.error : ""}`);

console.log("\nWhat the page would show:\n");
let rendered = 0;
for (let i = 0; i < plans.length; i++) {
  const reply = [...result.replies.entries()].find(([ri]) => requests[ri]?.i === i)?.[1];
  if (!reply) { console.log(`  ${PAGE[i]}   <- left in English`); continue; }
  rendered++;
  console.log(`  ${reply.text}`);
  for (const sw of reply.swaps) {
    const chosen = plans[i]!.swaps.find(c => c.mandarin === sw.zh);
    if (!chosen) continue;
    const w = getWord(chosen.wordId);
    const accepted = [...new Set([...w.meanings, sw.en.toLowerCase()])];
    // Pretend the reader types the English that was replaced.
    const marked = markAnswer(sw.en, accepted);
    console.log(`      ${sw.zh} (${w.pinyin})  typing "${sw.en}" -> ${marked.verdict}   accepts: ${accepted.slice(0,5).join(", ")}`);
  }
}
console.log(`\n${rendered}/${plans.length} sentences rendered, ${plans.length-rendered} safely left in English.\n`);
