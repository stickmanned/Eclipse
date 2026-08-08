/** The toolbar popup: switch this site on or off, and see today's numbers. */

import { send } from "../shared/messages.js";

const $ = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;
const toggle = $<HTMLButtonElement>("toggle");
const stats = $<HTMLDivElement>("stats");
const msg = $<HTMLDivElement>("msg");

let host = "";
let tabId = 0;

function row(label: string, value: string): string {
  return `<div class="stat"><span>${label}</span><strong>${value}</strong></div>`;
}

async function refresh(): Promise<void> {
  const reply = await send({ type: "status", host });
  if (reply.type !== "status:ok") return;
  const s = reply.status;

  toggle.disabled = false;
  toggle.textContent = s.enabledHere ? "Turn off for this site" : "Turn on for this site";
  toggle.classList.toggle("off", s.enabledHere);

  stats.innerHTML =
    row("Today", `${s.correctToday} right of ${s.answeredToday}`) +
    row("Words met", String(s.wordsMet)) +
    row("Level, roughly", `${s.levelRange[0]}–${s.levelRange[1]}`) +
    row("Swapping", `${Math.round(s.density * 100)}%`);

  const problem = !s.hasKey ? "No API key yet — open Settings." : s.lastError;
  msg.hidden = !problem;
  msg.textContent = problem ?? "";
}

toggle.addEventListener("click", async () => {
  const reply = await send({ type: "status", host });
  if (reply.type !== "status:ok") return;
  const on = !reply.status.enabledHere;

  await send({ type: "setEnabled", host, on });
  // Tell the page straight away, so it does not need a reload.
  try {
    await chrome.tabs.sendMessage(tabId, { type: "eclipse:toggle", on });
  } catch {
    // No content script on this tab (a chrome:// page, say). Nothing to tell.
  }
  await refresh();
});

$("opts").addEventListener("click", (e) => {
  e.preventDefault();
  void chrome.runtime.openOptionsPage();
});

void (async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  tabId = tab?.id ?? 0;
  try {
    host = new URL(tab?.url ?? "").hostname;
  } catch {
    host = "";
  }
  $("host").textContent = host || "no page here";
  if (!host) {
    toggle.textContent = "Not available here";
    return;
  }
  await refresh();
})();
