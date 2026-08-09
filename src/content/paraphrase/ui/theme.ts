/**
 * Penumbra — the Paraphrase Mode skin.
 *
 * Same cosmic family as Translate Mode, deliberately a different light. Gold is
 * Translate Mode's signal and it has to stay unambiguous: a reader glancing at
 * a page must be able to tell "this word was replaced by French" from "this
 * wording was made simpler" without reading either. Periwinkle carries the
 * second, and the token wears a dashed underline rather than a solid pill so
 * the difference survives greyscale, colour-blindness and forced-colors mode.
 *
 * Correct and incorrect retain a subtle teal or rose background. The underline
 * itself always stays periwinkle, so a token never acquires competing lines.
 *
 * Pixel units throughout keep the overlay independent of host root styles.
 */

export const PARAPHRASE_COLORS = {
  background: '#070A14',
  deep: '#0B1022',
  token: '#171A3A',
  tokenHover: '#232A5C',
  peri: '#A5B4FC',
  periHigh: '#C7D2FE',
  violet: '#8B5CF6',
  violetHigh: '#A78BFA',
  correct: '#2DD4BF',
  incorrect: '#FB7185',
  text: '#F8FAFC',
  textSoft: '#CBD5E1',
  muted: '#94A3B8',
} as const;

export const PARAPHRASE_REVEAL_MS = 220;

export const PARAPHRASE_OVERLAY_CSS = `
:host {
  --ep-cosmic: ${PARAPHRASE_COLORS.background};
  --ep-deep: ${PARAPHRASE_COLORS.deep};
  --ep-peri: ${PARAPHRASE_COLORS.peri};
  --ep-peri-high: ${PARAPHRASE_COLORS.periHigh};
  --ep-peri-soft: rgba(165, 180, 252, 0.13);
  --ep-peri-line: rgba(165, 180, 252, 0.34);
  --ep-violet: ${PARAPHRASE_COLORS.violet};
  --ep-violet-soft: rgba(139, 92, 246, 0.14);
  --ep-correct: ${PARAPHRASE_COLORS.correct};
  --ep-correct-soft: rgba(45, 212, 191, 0.13);
  --ep-incorrect: ${PARAPHRASE_COLORS.incorrect};
  --ep-incorrect-soft: rgba(251, 113, 133, 0.13);
  --ep-text: ${PARAPHRASE_COLORS.text};
  --ep-text-soft: ${PARAPHRASE_COLORS.textSoft};
  --ep-muted: ${PARAPHRASE_COLORS.muted};
  --ep-line: rgba(148, 163, 184, 0.2);
  --ep-glass: rgba(16, 20, 44, 0.93);
  --ep-shadow-card: 0 28px 80px rgba(0, 0, 0, 0.62), inset 0 1px 0 rgba(255, 255, 255, 0.055);
  --ep-shadow-peri: 0 0 28px rgba(165, 180, 252, 0.2);
  --ep-font-display: 'Iowan Old Style', 'Palatino Linotype', 'Book Antiqua', Palatino, Georgia, serif;
  --ep-font-body: 'Avenir Next', Avenir, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  --ep-transition: 160ms cubic-bezier(0.2, 0.8, 0.2, 1);
}

.ep-root,
.ep-root * { box-sizing: border-box; }

.ep-root {
  position: fixed;
  inset: 0;
  z-index: 2147483000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  color: var(--ep-text);
  font-family: var(--ep-font-body);
  font-size: 15px;
  line-height: 1.48;
}

/* The floating affordance is not a modal: it must not cover the page. */
.ep-root[data-mode='prompt'] {
  inset: auto;
  padding: 0;
  pointer-events: none;
}

.ep-scrim {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(circle at 50% 42%, rgba(165, 180, 252, 0.13), transparent 38%),
    rgba(3, 5, 12, 0.76);
  backdrop-filter: blur(14px) saturate(0.8);
}

.ep-card {
  position: relative;
  width: 100%;
  max-width: 540px;
  max-height: calc(100vh - 48px);
  overflow-x: hidden;
  overflow-y: auto;
  padding: 22px;
  border: 1px solid var(--ep-peri-line);
  border-radius: 18px;
  background:
    radial-gradient(circle at 105% -5%, var(--ep-violet-soft), transparent 30%),
    linear-gradient(155deg, var(--ep-glass), rgba(7, 10, 20, 0.97));
  box-shadow: var(--ep-shadow-card), var(--ep-shadow-peri);
  backdrop-filter: blur(20px);
  scrollbar-color: var(--ep-line) transparent;
  animation: ep-rise ${PARAPHRASE_REVEAL_MS}ms cubic-bezier(0.2, 0.8, 0.2, 1) both;
}

.ep-card::before {
  content: '';
  position: absolute;
  inset: 0 20% auto;
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--ep-peri-high), transparent);
  box-shadow: var(--ep-shadow-peri);
}

@keyframes ep-rise {
  from { opacity: 0; transform: translateY(10px) scale(0.985); }
  to { opacity: 1; transform: none; }
}

.ep-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 14px;
}

.ep-eyebrow {
  margin: 0;
  color: var(--ep-peri);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.13em;
  text-transform: uppercase;
}

.ep-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 3px 9px;
  border: 1px solid var(--ep-peri-line);
  border-radius: 999px;
  background: var(--ep-peri-soft);
  color: var(--ep-peri-high);
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.04em;
}

.ep-close {
  flex: none;
  width: 30px;
  height: 30px;
  border: 1px solid var(--ep-line);
  border-radius: 50%;
  background: transparent;
  color: var(--ep-text-soft);
  font-size: 13px;
  line-height: 1;
  cursor: pointer;
  transition: var(--ep-transition);
}

.ep-close:hover { border-color: var(--ep-peri); color: var(--ep-peri-high); }
.ep-close:focus-visible { outline: 3px solid var(--ep-peri); outline-offset: 2px; }

.ep-shown {
  margin: 0 0 4px;
  color: var(--ep-peri-high);
  font-family: var(--ep-font-display);
  font-size: 25px;
  line-height: 1.24;
}

.ep-question {
  margin: 0 0 14px;
  color: var(--ep-text-soft);
  font-size: 14px;
}

.ep-sentence {
  margin: 0 0 16px;
  padding: 12px 14px;
  border-left: 2px solid var(--ep-peri-line);
  border-radius: 0 10px 10px 0;
  background: rgba(148, 163, 184, 0.06);
  color: var(--ep-text-soft);
  font-size: 14px;
}

.ep-sentence mark {
  padding: 0 4px;
  border-radius: 4px;
  background: var(--ep-peri-soft);
  color: var(--ep-peri-high);
  font-weight: 650;
}

.ep-clue {
  margin: 0 0 16px;
  color: var(--ep-muted);
  font-size: 12.5px;
}

.ep-clue b { color: var(--ep-text-soft); font-weight: 650; }

.ep-choices {
  display: grid;
  gap: 8px;
  margin: 0 0 14px;
  padding: 0;
  list-style: none;
}

.ep-choice {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 11px 13px;
  border: 1px solid var(--ep-line);
  border-radius: 11px;
  background: rgba(248, 250, 252, 0.04);
  color: var(--ep-text);
  font-size: 14.5px;
  text-align: left;
  cursor: pointer;
  transition: var(--ep-transition);
}

.ep-choice:hover:not(:disabled) {
  border-color: var(--ep-peri);
  background: var(--ep-peri-soft);
  transform: translateX(2px);
}

.ep-choice:focus-visible { outline: 3px solid var(--ep-peri); outline-offset: 2px; }
.ep-choice:disabled { cursor: default; opacity: 0.95; }

.ep-choice-key {
  flex: none;
  display: grid;
  place-items: center;
  width: 22px;
  height: 22px;
  border: 1px solid var(--ep-line);
  border-radius: 6px;
  color: var(--ep-muted);
  font-size: 11px;
  font-weight: 700;
}

.ep-choice[data-state='correct'] {
  border-color: var(--ep-correct);
  background: var(--ep-correct-soft);
  color: var(--ep-correct);
}

.ep-choice[data-state='incorrect'] {
  border-color: var(--ep-incorrect);
  background: var(--ep-incorrect-soft);
  color: var(--ep-incorrect);
}

.ep-choice-mark { margin-left: auto; font-size: 11px; opacity: 0.85; }

.ep-verdict {
  display: flex;
  align-items: center;
  gap: 9px;
  margin: 0 0 14px;
  font-family: var(--ep-font-display);
  font-size: 21px;
}

.ep-verdict[data-correct='true'] { color: var(--ep-correct); }
.ep-verdict[data-correct='false'] { color: var(--ep-incorrect); }

.ep-verdict-glyph {
  display: grid;
  place-items: center;
  width: 26px;
  height: 26px;
  border: 1px solid currentColor;
  border-radius: 50%;
  font-size: 13px;
}

.ep-pair {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  gap: 10px;
  align-items: center;
  margin: 0 0 16px;
  padding: 14px;
  border: 1px solid var(--ep-line);
  border-radius: 13px;
  background: rgba(148, 163, 184, 0.05);
}

.ep-label {
  margin: 0 0 3px;
  color: var(--ep-muted);
  font-size: 10.5px;
  font-weight: 700;
  letter-spacing: 0.11em;
  text-transform: uppercase;
}

.ep-original {
  margin: 0;
  color: var(--ep-peri-high);
  font-family: var(--ep-font-display);
  font-size: 18px;
  line-height: 1.3;
}

.ep-simple { margin: 0; color: var(--ep-text-soft); font-size: 15px; line-height: 1.35; }
.ep-arrow { color: var(--ep-muted); font-size: 17px; }

.ep-sections { display: grid; gap: 10px; margin: 0 0 14px; }

.ep-section {
  padding: 12px 13px;
  border: 1px solid var(--ep-line);
  border-radius: 11px;
  background: rgba(248, 250, 252, 0.035);
}

.ep-section[data-kind='meaning'] { border-color: var(--ep-peri-line); background: var(--ep-peri-soft); }
.ep-section p { margin: 0; }
.ep-body { color: var(--ep-text-soft); font-size: 13.5px; }

.ep-band {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 0 0 12px;
  padding: 12px 13px;
  border: 1px solid var(--ep-line);
  border-radius: 11px;
  background: rgba(148, 163, 184, 0.05);
}

.ep-meter {
  position: relative;
  flex: 1;
  height: 6px;
  border-radius: 999px;
  background: rgba(148, 163, 184, 0.22);
  overflow: hidden;
}

.ep-meter-fill {
  position: absolute;
  inset: 0 auto 0 0;
  border-radius: 999px;
  background: linear-gradient(90deg, var(--ep-violet), var(--ep-peri-high));
  transition: width 320ms cubic-bezier(0.2, 0.8, 0.2, 1);
}

.ep-meter-ghost {
  position: absolute;
  top: -3px;
  width: 2px;
  height: 12px;
  border-radius: 2px;
  background: var(--ep-muted);
}

.ep-band-text { flex: none; max-width: 58%; margin: 0; color: var(--ep-text-soft); font-size: 12.5px; }
.ep-band-text b { color: var(--ep-peri-high); font-weight: 650; }

.ep-note { margin: 0 0 14px; color: var(--ep-muted); font-size: 12.5px; }
.ep-note[data-tone='error'] { color: var(--ep-incorrect); }

.ep-actions { display: flex; justify-content: flex-end; gap: 8px; }

.ep-primary {
  padding: 10px 18px;
  border: 1px solid transparent;
  border-radius: 999px;
  background: linear-gradient(140deg, var(--ep-peri-high), var(--ep-violet));
  color: #14102E;
  font-size: 14px;
  font-weight: 750;
  cursor: pointer;
  transition: var(--ep-transition);
}

.ep-primary:hover { filter: brightness(1.07); }
.ep-primary:focus-visible { outline: 3px solid var(--ep-peri); outline-offset: 2px; }

.ep-shortcuts {
  display: flex;
  gap: 14px;
  margin-top: 4px;
  color: var(--ep-muted);
  font-size: 11px;
}

.ep-shortcuts kbd {
  padding: 1px 5px;
  border: 1px solid var(--ep-line);
  border-radius: 5px;
  font-family: inherit;
  font-size: 10px;
}

.ep-spinner {
  display: grid;
  place-items: center;
  gap: 12px;
  padding: 26px 10px;
  color: var(--ep-text-soft);
  text-align: center;
}

.ep-spinner span {
  width: 30px;
  height: 30px;
  border: 2px solid var(--ep-line);
  border-top-color: var(--ep-peri-high);
  border-radius: 50%;
  animation: ep-spin 900ms linear infinite;
}

@keyframes ep-spin { to { transform: rotate(360deg); } }

/* --- the floating "simplify this" affordance ---------------------------- */

.ep-prompt {
  position: fixed;
  z-index: 2147483000;
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 7px 12px;
  border: 1px solid var(--ep-peri-line);
  border-radius: 999px;
  background: linear-gradient(150deg, rgba(23, 26, 58, 0.97), rgba(7, 10, 20, 0.97));
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.5), var(--ep-shadow-peri);
  color: var(--ep-peri-high);
  font-family: var(--ep-font-body);
  font-size: 12.5px;
  font-weight: 650;
  cursor: pointer;
  pointer-events: auto;
  animation: ep-rise 140ms cubic-bezier(0.2, 0.8, 0.2, 1) both;
}

.ep-prompt:hover { border-color: var(--ep-peri); filter: brightness(1.1); }
.ep-prompt:focus-visible { outline: 3px solid var(--ep-peri); outline-offset: 2px; }
.ep-prompt-glyph { font-size: 13px; }

.ep-visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  padding: 0;
  border: 0;
  clip-path: inset(50%);
  overflow: hidden;
  white-space: nowrap;
}

@media (prefers-reduced-motion: reduce) {
  .ep-card, .ep-prompt { animation: none; }
  .ep-spinner span { animation-duration: 3s; }
  .ep-meter-fill { transition: none; }
  .ep-choice:hover:not(:disabled) { transform: none; }
}
`;

/**
 * Host-page token styling.
 *
 * Repeated class selectors plus `!important` for the same reason Translate Mode
 * does it: the token lives in the page's cascade, and a host stylesheet that
 * styles every `button` would otherwise win.
 */
const TOKEN_SEL = `html body button[data-eclipse-owner='eclipse-paraphrase'].eclipse-paraphrase-token.eclipse-paraphrase-token.eclipse-paraphrase-token`;

export const PARAPHRASE_TOKEN_CSS = `
${TOKEN_SEL} {
  all: unset !important;
  -webkit-appearance: none !important;
  appearance: none !important;
  position: relative !important;
  display: inline !important;
  box-sizing: border-box !important;
  margin: 0 !important;
  padding: 0 1px !important;
  border: 0 !important;
  border-bottom: 2px dashed rgba(165, 180, 252, 0.85) !important;
  border-radius: 3px !important;
  background-color: rgba(165, 180, 252, 0.14) !important;
  color: inherit !important;
  font: inherit !important;
  font-style: normal !important;
  font-weight: 600 !important;
  line-height: inherit !important;
  text-decoration: none !important;
  cursor: pointer !important;
  transition: background-color 160ms ease, border-color 160ms ease, box-shadow 160ms ease !important;
}

/*
 * A tall, invisible hit area. The token is inline text, so its own box can be
 * only a few pixels high on a dense paragraph — comfortably below the 24px
 * pointer target the rest of the product holds itself to.
 */
${TOKEN_SEL}::after {
  content: '' !important;
  position: absolute !important;
  left: 0 !important;
  right: 0 !important;
  top: 50% !important;
  min-width: 32px !important;
  height: 32px !important;
  transform: translateY(-50%) !important;
}

${TOKEN_SEL}:hover,
${TOKEN_SEL}:focus-visible {
  border-bottom-color: ${PARAPHRASE_COLORS.periHigh} !important;
  background-color: rgba(165, 180, 252, 0.28) !important;
  box-shadow: 0 0 12px rgba(165, 180, 252, 0.45) !important;
}

${TOKEN_SEL}:focus-visible {
  outline: 3px solid ${PARAPHRASE_COLORS.peri} !important;
  outline-offset: 2px !important;
}

${TOKEN_SEL}[data-answered='correct'] {
  border-bottom-color: ${PARAPHRASE_COLORS.periHigh} !important;
  border-bottom-style: solid !important;
  background-color: rgba(45, 212, 191, 0.18) !important;
}

${TOKEN_SEL}[data-answered='incorrect'] {
  border-bottom-color: ${PARAPHRASE_COLORS.periHigh} !important;
  border-bottom-style: solid !important;
  background-color: rgba(251, 113, 133, 0.18) !important;
}

/* Keep the owed marker non-visual here: the token retains one clear underline. */
${TOKEN_SEL}[data-owed='true'] {
  box-shadow: none !important;
}

@media (prefers-reduced-motion: reduce) {
  ${TOKEN_SEL} { transition: none !important; }
}

@media (forced-colors: active) {
  ${TOKEN_SEL} {
    border-bottom: 2px dashed ButtonText !important;
    background: ButtonFace !important;
    color: ButtonText !important;
  }
}
`;
