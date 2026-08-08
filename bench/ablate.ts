/**
 * Does the Bayesian machinery actually earn its place?
 *
 * Three systems, identical in every other way, run against identical learners
 * on identical seeds. The only difference is how much of the ability model is
 * switched on.
 *
 *   A  point estimate      uncertainty pinned low, selector chases flow only.
 *                          This is the system that existed before.
 *   B  + uncertainty       uncertainty tracked and used in the prior, but the
 *                          selector still chases flow only.
 *   C  + information       the full thing: the selector also chases items whose
 *                          outcome it cannot predict, weighted by uncertainty.
 *
 * Run: npx tsx bench/ablate.ts
 */
import { LearnerStore, dayNumber } from "../src/engine/store.js";
import { planScreen } from "../src/engine/picker.js";
import { updateDials } from "../src/engine/balance.js";
import { CORPUS } from "./corpus.js";

const SLIP=0.05, GUESS=0.1, LEARN=0.35, SPREAD=250, CLICK=0.6;
function rng(seed:number){let s=seed>>>0;return()=>{s=(s*1664525+1013904223)>>>0;return s/4294967296;};}
const mean=(x:number[])=>{const o=x.filter(Number.isFinite);return o.length?o.reduce((a,b)=>a+b,0)/o.length:NaN;};
const sd=(x:number[])=>{const m=mean(x);return Math.sqrt(mean(x.map(v=>(v-m)**2)));};

interface Variant { name:string; explore:boolean; frozenSigma?:number; cap?:number }

function trial(v:Variant, startLevel:number, jumpTo:number|null, pages:number, seed:number){
  const r=rng(seed); const learned=new Set<number>(); let trueRank=startLevel;
  const store=LearnerStore.fresh(); const today=dayNumber();
  store.ability.exploreEnabled=v.explore;
  if(v.frozenSigma!==undefined){ store.ability.sigma=v.frozenSigma; store.ability.frozenSigma=v.frozenSigma; }
  if(v.cap!==undefined) store.ability.exploreCap=v.cap;
  const accs:number[]=[], briers:number[]=[], levels:number[]=[], real:number[]=[];
  const half=Math.floor(pages/2);
  for(let p=1;p<=pages;p++){
    if(jumpTo!==null && p===half+1) trueRank=jumpTo;
    const screen=Array.from({length:5},()=>CORPUS[Math.floor(r()*CORPUS.length)]!);
    const dials={density:store.density,newBudget:store.newBudget};
    const swaps=planScreen(screen,store,dials,today).flatMap(x=>x.swaps);
    let a=0,c=0,bs=0; const shown:number[]=[];
    for(const s of swaps){
      shown.push(s.wordId); store.markShown(s.wordId);
      if(r()>=CLICK){ store.glanced(s.wordId,today); continue; }
      const pred=store.probKnows(s.wordId,today);
      const knew=learned.has(s.wordId)||r()<1/(1+Math.exp(-(trueRank-s.wordId)/SPREAD));
      const ok=knew? r()>SLIP : r()<GUESS;
      bs+=(pred-(ok?1:0))**2;
      if(!knew&&r()<LEARN) learned.add(s.wordId);
      store.answer(s.wordId,ok,today); a++; if(ok)c++;
    }
    store.screenDone(shown);
    const n=updateDials(dials,{answered:a,correct:c});
    store.density=n.density; store.newBudget=n.newBudget;
    accs.push(a?c/a:NaN); briers.push(a?bs/a:NaN);
    levels.push(store.ability.level()); real.push(trueRank+learned.size);
  }
  let rec=99; for(let i=half;i<pages-5;i++){ if(Math.abs(mean(accs.slice(i,i+5))-0.85)<0.07){rec=i-half;break;} }
  const from=Math.min(60,Math.floor(pages*0.5)); const w=accs.slice(from,half>from?half:pages);
  return { acc:mean(w), swing:sd(w), brier:mean(briers.slice(from,half>from?half:pages)), rec,
           levelErr: mean(levels.slice(from,half>from?half:pages).map((l,i)=>Math.abs(Math.log((l+1)/(real[from+i]!+1))))) };
}

const VARIANTS:Variant[]=[
  {name:"A  point estimate (the old system)", explore:false, frozenSigma:0.45},
  {name:"B  + uncertainty tracked",           explore:false},
  {name:"C  + information, cap 0.50",         explore:true, cap:0.50},
  {name:"D  + information, cap 0.30",         explore:true, cap:0.30},
  {name:"E  + information, cap 0.15",         explore:true, cap:0.15},
];
const SEEDS=[12345,777,999,4242,31337,8080,55555,101010];

console.log("\nEach number is the mean over 8 learners, identical seeds across variants.");
console.log("levelErr is how far the estimate sits from the truth, in log units (0 = exact).\n");
console.log("variant                                acc     swing   Brier   levelErr  recovery  beginner");
console.log("-".repeat(94));
for(const v of VARIANTS){
  const main=SEEDS.map(s=>trial(v,800,3000,200,s));
  const beg =SEEDS.map(s=>trial(v,0,null,60,s).acc).filter(Number.isFinite);
  console.log(
    `${v.name.padEnd(38)} ${mean(main.map(x=>x.acc)).toFixed(3)}   ${mean(main.map(x=>x.swing)).toFixed(3)}   `+
    `${mean(main.map(x=>x.brier)).toFixed(3)}   ${mean(main.map(x=>x.levelErr)).toFixed(3)}     `+
    `${mean(main.map(x=>x.rec)).toFixed(1)}      ${mean(beg).toFixed(3)}`);
}
console.log("");
