/** The settings page. */

import { send } from "../shared/messages.js";
import { INTENSITY, type Intensity } from "../engine/balance.js";

const $ = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;

const key = $<HTMLInputElement>("key");
const level = $<HTMLSelectElement>("level");
const model = $<HTMLInputElement>("model");
const intensity = $<HTMLSelectElement>("intensity");
const intensityNote = $<HTMLParagraphElement>("intensity-note");
const saved = $<HTMLSpanElement>("saved");
const stats = $<HTMLDivElement>("stats");

const DEFAULTS = { apiKey: "", hskLevel: 1, model: "google/gemini-3.5-flash-lite", intensity: "normal" };

async function load(): Promise<void> {
  const s = await chrome.storage.local.get(DEFAULTS);
  key.value = String(s.apiKey ?? "");
  level.value = String(s.hskLevel ?? 1);
  model.value = String(s.model ?? DEFAULTS.model);
  intensity.value = String(s.intensity ?? "normal");
  showIntensityNote();
  await refresh();
}

function showIntensityNote(): void {
  intensityNote.textContent = INTENSITY[intensity.value as Intensity]?.label ?? "";
}
intensity.addEventListener("change", showIntensityNote);

function row(label: string, value: string): string {
  return `<div class="stat"><span>${label}</span><strong>${value}</strong></div>`;
}

async function refresh(): Promise<void> {
  const reply = await send({ type: "status" });
  if (reply.type !== "status:ok") return;
  const s = reply.status;

  stats.innerHTML =
    row("Words you have met", String(s.wordsMet)) +
    // A range, not a single number. Eclipse tracks how sure it is, so showing
    // one figure would claim a precision it does not have.
    row("Level, roughly", `${s.levelRange[0]} to ${s.levelRange[1]}`) +
    row("Answered today", `${s.correctToday} right of ${s.answeredToday}`) +
    row("Swapping", `${Math.round(s.density * 100)}% of what it can`) +
    row("New words per screen", String(Math.floor(s.newBudget)));
}

$("save").addEventListener("click", async () => {
  await chrome.storage.local.set({
    apiKey: key.value.trim(),
    hskLevel: Number(level.value),
    model: model.value.trim() || DEFAULTS.model,
    intensity: intensity.value,
  });
  saved.hidden = false;
  setTimeout(() => (saved.hidden = true), 1600);
});

$("forget").addEventListener("click", async () => {
  if (!confirm("Delete everything Eclipse has learned about you? This cannot be undone.")) return;
  // Through the worker, not straight into IndexedDB. The worker keeps the
  // record in memory too, and clearing the database under it would leave that
  // copy alive to be written back a moment later.
  await send({ type: "forget" });
  await refresh();
});

void load();
