import { loadKey } from "./key.js";
const KEY = loadKey();
const BASE="https://ai.hackclub.com/proxy/v1/chat/completions";
const M="google/gemini-3.5-flash-lite";
const P="Rewrite using ONLY these swaps: 门=door, 房间=room.\nOutput only the sentence.\nShe opened the door and walked into the small room.";

async function go(label:string, extra:any, prompt=P){
  const t=Date.now();
  try{
    const r=await fetch(BASE,{method:"POST",headers:{Authorization:`Bearer ${KEY}`,"Content-Type":"application/json"},
      body:JSON.stringify({model:M,messages:[{role:"user",content:prompt}],temperature:0.2,max_tokens:300,...extra})});
    const j:any=await r.json();
    const u=j?.usage;
    console.log(`  ${label.padEnd(38)} ${r.ok?String(Date.now()-t).padStart(5)+"ms":"HTTP "+r.status}  think=${u?.completion_tokens_details?.reasoning_tokens??"?"} out=${u?.completion_tokens??"?"} in=${u?.prompt_tokens??"?"}`);
    if(!r.ok) console.log("      ", JSON.stringify(j).slice(0,150));
  }catch(e){console.log(`  ${label.padEnd(38)} ERROR ${e}`);}
}

console.log("\n--- does HCAI accept OpenRouter routing/reasoning params? ---");
await go("baseline", {});
await go("reasoning:{enabled:false}", {reasoning:{enabled:false}});
await go("reasoning:{effort:'minimal'}", {reasoning:{effort:"minimal"}});
await go("reasoning_effort:'none'", {reasoning_effort:"none"});
await go("provider:{sort:'throughput'}", {provider:{sort:"throughput"}});
await go("provider:{sort:'latency'}", {provider:{sort:"latency"}});

console.log("\n--- does prompt length matter? ---");
const pad=(n:number)=>"Context: "+"the quick brown fox jumps over the lazy dog. ".repeat(n)+"\n"+P;
for(const n of [0,20,100,400]) await go(`prompt ~${Math.round((pad(n).length)/4)} tokens`, {}, pad(n));

console.log("\n--- repeat baseline 5x (how much is variance?) ---");
for(let i=0;i<5;i++) await go(`run ${i+1}`, {});
