import { loadKey } from "./key.js";
const KEY=loadKey(); const BASE="https://ai.hackclub.com/proxy/v1/chat/completions";
const M="google/gemini-3.5-flash-lite";
const SENTS=["Bob owns a blue apple, the apple is magical.","She opened the door and walked into the small room.","The old man sat by the window and read his book.","They ate dinner together and talked about the weather.","My sister bought a new car last week.","The cat slept on the warm floor all afternoon.","He wrote a long letter to his mother.","We walked to the station and waited for the train."];
const swaps=[["blue apple->蓝色的苹果","magical->神奇"],["door->门","room->房间"],["sat->坐","book->书"],["ate->吃","weather->天气"],["sister->姐姐","car->车"],["cat->猫","floor->地板"],["wrote->写","letter->信"],["walked->走","train->火车"]];
const ECHO=`Rewrite each sentence, swapping only the given words. Return JSON {"s":[{"i":N,"text":"full mixed sentence"}]}.\n`+SENTS.map((s,i)=>`[${i}] ${s}\n   ${swaps[i]!.join("  ")}`).join("\n");
const EDIT=`For each sentence return ONLY the replacements to apply, not the sentence. Return JSON {"s":[{"i":N,"r":[{"en":"exact english span","zh":"mandarin"}]}]}.\n`+SENTS.map((s,i)=>`[${i}] ${s}\n   ${swaps[i]!.join("  ")}`).join("\n");

async function timeIt(label:string,prompt:string,stream=false){
  const t=Date.now(); let ttft=0;
  const r=await fetch(BASE,{method:"POST",headers:{Authorization:`Bearer ${KEY}`,"Content-Type":"application/json"},
    body:JSON.stringify({model:M,messages:[{role:"user",content:prompt}],temperature:0.2,max_tokens:2000,stream,provider:{sort:"latency"}})});
  if(stream){
    const rd=r.body!.getReader(); let n=0;
    while(true){const{done,value}=await rd.read(); if(done)break; if(!ttft&&value?.length){ttft=Date.now()-t;} n+=value?.length??0;}
    console.log(`  ${label.padEnd(30)} total ${String(Date.now()-t).padStart(5)}ms   first byte ${String(ttft).padStart(5)}ms`);
  }else{
    const j:any=await r.json();
    console.log(`  ${label.padEnd(30)} total ${String(Date.now()-t).padStart(5)}ms   out tokens ${j?.usage?.completion_tokens}  cost $${(j?.usage?.cost??0).toFixed(5)}`);
  }
}
console.log("\n8 sentences, one request:");
await timeIt("echo full sentences",ECHO);
await timeIt("return edits only",EDIT);
await timeIt("echo full, streaming",ECHO,true);
await timeIt("edits only, streaming",EDIT,true);
