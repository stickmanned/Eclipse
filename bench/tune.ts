/**
 * Search for balance-loop settings instead of guessing them.
 * Run: npx tsx bench/tune.ts
 */
import { LearnerStore, dayNumber } from "../src/engine/store.js";
import { planScreen } from "../src/engine/picker.js";
import { updateDials, type Tuning } from "../src/engine/balance.js";
import { CORPUS } from "./corpus.js";

const SLIP=0.05, GUESS=0.1, LEARN=0.35, SPREAD=250;
function rng(seed:number){let s=seed>>>0;return()=>{s=(s*1664525+1013904223)>>>0;return s/4294967296;};}

function trial(t:Tuning, startLevel:number, jumpTo:number|null, pages:number, seed:number){
  const r=rng(seed); const learned=new Set<number>(); let trueRank=startLevel;
  const store=LearnerStore.fresh(); const today=dayNumber();
  const accs:number[]=[]; const dens:number[]=[]; const ests:number[]=[];
  for(let p=1;p<=pages;p++){
    if(jumpTo!==null && p===Math.floor(pages/2)+1) trueRank=jumpTo;
    const screen=Array.from({length:5},()=>CORPUS[Math.floor(r()*CORPUS.length)]!);
    const dials={density:store.density,newBudget:store.newBudget};
    const swaps=planScreen(screen,store,dials,today).flatMap(x=>x.swaps);
    let a=0,c=0; const shown:number[]=[];
    for(const s of swaps){
      shown.push(s.wordId); store.markShown(s.wordId);
      if(r()>=0.6){ store.glanced(s.wordId,today); continue; }
      const knew=learned.has(s.wordId)||r()<1/(1+Math.exp(-(trueRank-s.wordId)/SPREAD));
      const ok=knew? r()>SLIP : r()<GUESS;
      if(!knew&&r()<LEARN) learned.add(s.wordId);
      store.answer(s.wordId,ok,today); a++; if(ok)c++;
    }
    store.screenDone(shown);
    const n=updateDials(dials,{answered:a,correct:c},t);
    store.density=n.density; store.newBudget=n.newBudget;
    accs.push(a?c/a:NaN); dens.push(n.density); ests.push(store.ability.level());
  }
  return {accs,dens,ests};
}
const mean=(x:number[])=>{const o=x.filter(Number.isFinite);return o.length?o.reduce((a,b)=>a+b,0)/o.length:NaN;};
const sd=(x:number[])=>{const m=mean(x);return Math.sqrt(mean(x.map(v=>(v-m)**2)));};

console.log("climb  fall  step  | settleAcc  swing  begAcc  advDens  recovery | cost");
let best:any=null;
for(const climb of [0.2,0.3,0.4,0.5,0.7])
for(const fall of [1.0,1.5,2.0,3.0])
for(const maxStep of [0.03,0.05,0.08,0.12]){
  const t:Tuning={climb,fall,leaningTooFar:0.15,maxStep,target:0.85};
  // average over 4 seeds so we tune on signal, not on one lucky run
  let sa=0,sw=0,ba=0,ad=0,rc=0;
  for(const seed of [12345,777,999,4242]){
    const main=trial(t,800,3000,200,seed);
    const half=Math.floor(200/2);
    sa+=mean(main.accs.slice(60,half)); sw+=sd(main.accs.slice(60,half));
    let rec=40; for(let i=half;i<196;i++){ if(Math.abs(mean(main.accs.slice(i,i+5))-0.85)<0.07){rec=i-half;break;} }
    rc+=rec;
    ba+=mean(trial(t,0,null,60,seed).accs.slice(30));
    ad+=mean(trial(t,6000,null,60,seed).dens.slice(30));
  }
  sa/=4; sw/=4; ba/=4; ad/=4; rc/=4;
  // what we want: accuracy on target, low swing, beginner not drowned, fast recovery
  const cost = Math.abs(sa-0.85)*3 + sw*1.5 + Math.max(0,0.6-ba)*2 + rc/100;
  const row=`${climb.toFixed(1)}    ${fall.toFixed(1)}   ${maxStep.toFixed(2)}  |   ${sa.toFixed(3)}    ${sw.toFixed(3)}  ${ba.toFixed(3)}   ${ad.toFixed(2)}    ${rc.toFixed(1)}     | ${cost.toFixed(3)}`;
  if(!best||cost<best.cost){best={cost,row,t};}
}
console.log("\nBEST:"); console.log(best.row); console.log(JSON.stringify(best.t));
