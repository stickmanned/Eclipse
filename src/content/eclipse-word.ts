/**
 * One swapped word on the page, and the little box that opens when you click it.
 *
 * This is a custom element with a shadow root, for two reasons that both bite
 * in practice. The shadow root means the page's own CSS cannot reach inside
 * and wreck the answer box — and web pages have very opinionated CSS. And
 * keeping the original English in an attribute means turning Eclipse off is
 * just reading it back out, with no bookkeeping to get wrong.
 */

import { send } from "../shared/messages.js";

export const TAG = "eclipse-word";

const CSS = `
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
`;

export class EclipseWord extends HTMLElement {
  private box?: HTMLDivElement;
  private answered = false;

  connectedCallback(): void {
    if (this.shadowRoot) return;

    const root = this.attachShadow({ mode: "open" });
    const style = document.createElement("style");
    style.textContent = CSS;

    const word = document.createElement("span");
    word.className = "word";
    word.part = "word";
    // The Mandarin lives in the light DOM and is slotted in here, not copied
    // out of the attribute. Text drawn inside a shadow root is invisible to
    // everything that reads the page as text — innerText, copy and paste,
    // find-on-page, screen readers. Drawing it that way removed the English
    // and put nothing readable in its place.
    word.append(document.createElement("slot"));

    root.append(style, word);

    word.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.toggle();
    });
  }

  /** Put the English back. Used when Eclipse is switched off. */
  restore(): Text {
    return document.createTextNode(this.getAttribute("en") ?? this.textContent ?? "");
  }

  private toggle(): void {
    if (this.box) {
      this.box.remove();
      this.box = undefined;
      return;
    }
    if (this.answered) return;
    this.open();
  }

  private open(): void {
    const root = this.shadowRoot!;
    const box = document.createElement("div");
    box.className = "box";

    const pinyin = document.createElement("div");
    pinyin.className = "pinyin";
    pinyin.textContent = this.getAttribute("pinyin") ?? "";

    const input = document.createElement("input");
    input.placeholder = "what does this mean?";
    input.autocomplete = "off";
    input.spellcheck = false;

    const hint = document.createElement("div");
    hint.className = "hint";
    hint.textContent = "type in English, then press enter";

    box.append(pinyin, input, hint);
    root.append(box);
    this.box = box;
    this.place(box);

    input.focus();

    input.addEventListener("keydown", (e) => {
      e.stopPropagation(); // the page must not see what is typed in here
      if (e.key === "Escape") this.toggle();
      if (e.key !== "Enter") return;
      void this.submit(input.value, box, hint, input);
    });
    // Pages love to steal keystrokes. Keep them out of this box.
    for (const ev of ["keyup", "keypress", "input", "click"]) {
      box.addEventListener(ev, (e) => e.stopPropagation());
    }
  }

  private async submit(
    typed: string,
    box: HTMLDivElement,
    hint: HTMLDivElement,
    input: HTMLInputElement,
  ): Promise<void> {
    if (!typed.trim()) return;
    input.disabled = true;

    const wordId = Number(this.getAttribute("word-id"));
    const reply = await send({ type: "answer", wordId, typed });

    const verdict = document.createElement("div");
    verdict.className = "verdict";

    if (reply.type === "answer:ok") {
      this.answered = true;
      const span = this.shadowRoot!.querySelector(".word")!;
      span.classList.add(reply.correct ? "right" : "wrong");
      verdict.classList.add(reply.correct ? "right" : "wrong");
      verdict.textContent = reply.correct
        ? reply.typo
          ? `close enough — ${reply.answer}`
          : `right — ${reply.answer}`
        : `not quite — ${reply.answer}`;
      this.setAttribute("title", reply.answer);
    } else {
      verdict.textContent = "could not check that just now";
    }

    hint.remove();
    box.append(verdict);
    setTimeout(() => {
      box.remove();
      if (this.box === box) this.box = undefined;
    }, 2200);
  }

  /**
   * Put the box under the word, and nudge it back on screen if it would hang
   * off the right edge.
   */
  private place(box: HTMLDivElement): void {
    const rect = this.getBoundingClientRect();
    box.style.top = `${rect.height + 6}px`;
    box.style.left = "0px";

    requestAnimationFrame(() => {
      const b = box.getBoundingClientRect();
      const overflow = b.right - document.documentElement.clientWidth + 8;
      if (overflow > 0) box.style.left = `${-overflow}px`;
    });
  }
}

export function defineEclipseWord(): void {
  const registry = globalThis.customElements;
  if (!registry) return;
  if (!registry.get(TAG)) registry.define(TAG, EclipseWord);
}
