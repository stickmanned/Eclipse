"use strict";(()=>{function l(n){return chrome.runtime.sendMessage(n)}var d="eclipse-word",v=`
:host { all: initial; font: inherit; color: inherit; }
.word {
  font: inherit;
  color: #6d4aff;
  background: color-mix(in srgb, #6d4aff 12%, transparent);
  border-bottom: 1px solid color-mix(in srgb, #6d4aff 45%, transparent);
  border-radius: 3px;
  padding: 0 2px;
  cursor: pointer;
}
.word:hover { background: color-mix(in srgb, #6d4aff 22%, transparent); }
.word.right { color: #0a7d3f; background: color-mix(in srgb, #0a7d3f 14%, transparent);
              border-bottom-color: color-mix(in srgb, #0a7d3f 45%, transparent); }
.word.wrong { color: #b3261e; background: color-mix(in srgb, #b3261e 14%, transparent);
              border-bottom-color: color-mix(in srgb, #b3261e 45%, transparent); }

.box {
  position: absolute; z-index: 2147483647;
  background: #fff; color: #111;
  border: 1px solid #d8d3ee; border-radius: 10px;
  box-shadow: 0 8px 28px rgba(20,10,60,.18);
  padding: 10px; width: 232px;
  font: 14px/1.4 system-ui, sans-serif;
}
.pinyin { color: #6b6b7b; font-size: 12px; margin-bottom: 6px; }
input {
  width: 100%; box-sizing: border-box; font: inherit;
  padding: 6px 8px; border: 1px solid #cfc9e6; border-radius: 6px; outline: none;
}
input:focus { border-color: #6d4aff; }
.hint { font-size: 12px; color: #6b6b7b; margin-top: 6px; }
.verdict { margin-top: 7px; font-size: 13px; }
.verdict.right { color: #0a7d3f; }
.verdict.wrong { color: #b3261e; }
@media (prefers-color-scheme: dark) {
  .box { background: #1e1b2e; color: #eee; border-color: #3a3457; }
  input { background: #171426; color: #eee; border-color: #3a3457; }
  .pinyin, .hint { color: #a49fc0; }
}
`,f=class extends HTMLElement{box;answered=!1;connectedCallback(){if(this.shadowRoot)return;let r=this.attachShadow({mode:"open"}),t=document.createElement("style");t.textContent=v;let s=document.createElement("span");s.className="word",s.part="word",s.append(document.createElement("slot")),r.append(t,s),s.addEventListener("click",e=>{e.preventDefault(),e.stopPropagation(),this.toggle()})}restore(){return document.createTextNode(this.getAttribute("en")??this.textContent??"")}toggle(){if(this.box){this.box.remove(),this.box=void 0;return}this.answered||this.open()}open(){let r=this.shadowRoot,t=document.createElement("div");t.className="box";let s=document.createElement("div");s.className="pinyin",s.textContent=this.getAttribute("pinyin")??"";let e=document.createElement("input");e.placeholder="what does this mean?",e.autocomplete="off",e.spellcheck=!1;let i=document.createElement("div");i.className="hint",i.textContent="type in English, then press enter",t.append(s,e,i),r.append(t),this.box=t,this.place(t),e.focus(),e.addEventListener("keydown",o=>{o.stopPropagation(),o.key==="Escape"&&this.toggle(),o.key==="Enter"&&this.submit(e.value,t,i,e)});for(let o of["keyup","keypress","input","click"])t.addEventListener(o,a=>a.stopPropagation())}async submit(r,t,s,e){if(!r.trim())return;e.disabled=!0;let i=Number(this.getAttribute("word-id")),o=await l({type:"answer",wordId:i,typed:r}),a=document.createElement("div");a.className="verdict",o.type==="answer:ok"?(this.answered=!0,this.shadowRoot.querySelector(".word").classList.add(o.correct?"right":"wrong"),a.classList.add(o.correct?"right":"wrong"),a.textContent=o.correct?o.typo?`close enough \u2014 ${o.answer}`:`right \u2014 ${o.answer}`:`not quite \u2014 ${o.answer}`,this.setAttribute("title",o.answer)):a.textContent="could not check that just now",s.remove(),t.append(a),setTimeout(()=>{t.remove(),this.box===t&&(this.box=void 0)},2200)}place(r){let t=this.getBoundingClientRect();r.style.top=`${t.height+6}px`,r.style.left="0px",requestAnimationFrame(()=>{let e=r.getBoundingClientRect().right-document.documentElement.clientWidth+8;e>0&&(r.style.left=`${-e}px`)})}};function g(){let n=globalThis.customElements;n&&(n.get(d)||n.define(d,f))}var w=location.hostname,E="p, li, h1, h2, h3, h4, h5, h6, blockquote, td, dd, figcaption",T=new Set(["SCRIPT","STYLE","CODE","PRE","TEXTAREA","INPUT","SELECT","NOSCRIPT","KBD","SAMP"]),u=new WeakSet,p=!1,m=!1;function k(n){if(u.has(n))return!1;let r=n.nodeValue??"";if(r.trim().length<24||!/[a-z]{3}/i.test(r))return!1;let t=n.parentElement;for(;t;){if(T.has(t.tagName)||t.isContentEditable||t.getAttribute("aria-hidden")==="true"||t.tagName===d.toUpperCase())return!1;t=t.parentElement}return n.parentElement?.closest(E)!==null}function N(n){let r=[],t=window.innerHeight;if(!document.body)return r;let s=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);for(let e=s.nextNode();e&&r.length<n;e=s.nextNode()){let i=e;if(!k(i))continue;let o=document.createRange();o.selectNodeContents(i);let a=o.getBoundingClientRect();a.height!==0&&(a.bottom<-t||a.top>window.innerHeight+t||r.push(i))}return r}var C=600;function S(n,r){let t=n.parentNode;if(!t)return;let s=document.createDocumentFragment(),e=r.text,i=[...r.swaps].sort((o,a)=>e.indexOf(o.zh)-e.indexOf(a.zh));for(let o of i){let a=e.indexOf(o.zh);if(a===-1)continue;a>0&&s.append(document.createTextNode(e.slice(0,a)));let c=document.createElement(d);c.textContent=o.zh,c.setAttribute("zh",o.zh),c.setAttribute("en",o.en),c.setAttribute("pinyin",o.pinyin),c.setAttribute("word-id",String(o.wordId)),s.append(c),e=e.slice(a+o.zh.length)}e&&s.append(document.createTextNode(e)),u.add(n),t.replaceChild(s,n)}async function y(){if(!(!p||m)){m=!0;try{let n=N(12);if(n.length===0)return;let r=[],t=[];for(let e of n){let i=(e.nodeValue??"").trim();if(!i||i.length>C){u.add(e);continue}r.push(i),t.push(e)}if(r.length===0)return;let s=await l({type:"plan",sentences:r,host:w});if(s.type==="plan:off"){p=!1;return}if(s.type!=="plan:ok")return;for(let e of s.sentences){let i=t[e.i];i?.isConnected&&S(i,e)}for(let e of t)u.add(e)}finally{m=!1}}}function L(){for(let n of[...document.querySelectorAll(d)])n.replaceWith(n.restore())}var x;function h(){clearTimeout(x),x=setTimeout(()=>{y()},250)}function b(){if(g(),!document.body){document.addEventListener("DOMContentLoaded",()=>b(),{once:!0});return}p=!0,y(),window.addEventListener("scroll",h,{passive:!0}),window.addEventListener("resize",h,{passive:!0}),new MutationObserver(n=>{if(!p)return;n.every(t=>[...t.addedNodes,...t.removedNodes].every(s=>s.nodeName===d.toUpperCase()||s.parentElement?.tagName===d.toUpperCase()))||h()}).observe(document.body,{childList:!0,subtree:!0})}chrome.runtime.onMessage.addListener(n=>{n.type==="eclipse:toggle"&&(n.on?b():(p=!1,L()))});l({type:"status",host:w}).then(n=>{n.type==="status:ok"&&n.status.enabledHere&&n.status.hasKey&&b()});})();
