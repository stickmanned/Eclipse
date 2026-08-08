/**
 * The Eclipse visual system, as a CSS string.
 *
 * Shipped as a string rather than an imported stylesheet on purpose: it lets
 * the ShadowRoot be built with `cssInjectionMode` left alone, which means no
 * `web_accessible_resources` entry and therefore no host permission of any
 * kind. See wxt.config.ts.
 *
 * Everything is in pixels. `rem` would inherit the host page's root font size
 * straight through the shadow boundary, and Eclipse has to look the same on a
 * page that sets `html { font-size: 8px }`.
 */

export const COLORS = {
  background: '#0B1020',
  gold: '#F7C948',
  violet: '#8B5CF6',
  correct: '#2DD4BF',
  incorrect: '#FB7185',
  text: '#F8FAFC',
} as const;

/** Reveal duration, skipped under `prefers-reduced-motion`. */
export const REVEAL_MS = 180;

export const OVERLAY_CSS = `
:host {
  /* WXT already applies all:initial. These are ours. */
  --eclipse-bg: ${COLORS.background};
  --eclipse-gold: ${COLORS.gold};
  --eclipse-violet: ${COLORS.violet};
  --eclipse-correct: ${COLORS.correct};
  --eclipse-incorrect: ${COLORS.incorrect};
  --eclipse-text: ${COLORS.text};
  --eclipse-muted: #C7CEDB;
  --eclipse-line: #2A3350;
}

.eclipse-root {
  position: fixed;
  inset: 0;
  z-index: 2147483000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  box-sizing: border-box;
  font-family: ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  font-size: 16px;
  line-height: 1.5;
  color: var(--eclipse-text);
}

.eclipse-scrim {
  position: absolute;
  inset: 0;
  background: rgba(4, 7, 18, 0.62);
  /* The host page can be any colour; a real scrim is what guarantees contrast. */
  backdrop-filter: blur(2px);
}

.eclipse-card {
  position: relative;
  width: 100%;
  max-width: 460px;
  max-height: calc(100vh - 48px);
  overflow-y: auto;
  background: var(--eclipse-bg);
  border: 1px solid var(--eclipse-line);
  border-radius: 16px;
  box-shadow: 0 24px 64px rgba(0, 0, 0, 0.55);
  padding: 24px;
  box-sizing: border-box;
  animation: eclipse-rise ${REVEAL_MS}ms ease-out;
}

@keyframes eclipse-rise {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}

.eclipse-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 16px;
}

.eclipse-eyebrow {
  margin: 0;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--eclipse-gold);
}

.eclipse-close {
  flex: 0 0 auto;
  min-width: 40px;
  min-height: 40px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  color: var(--eclipse-muted);
  border: 1px solid var(--eclipse-line);
  border-radius: 10px;
  font-size: 18px;
  line-height: 1;
  cursor: pointer;
}

.eclipse-close:hover { color: var(--eclipse-text); border-color: var(--eclipse-violet); }

.eclipse-surface {
  margin: 0 0 8px;
  font-size: 30px;
  font-weight: 700;
  letter-spacing: -0.01em;
  color: var(--eclipse-gold);
  overflow-wrap: anywhere;
}

.eclipse-question {
  margin: 0 0 16px;
  font-size: 15px;
  color: var(--eclipse-muted);
}

.eclipse-sentence {
  margin: 0 0 20px;
  padding: 12px 14px;
  background: rgba(139, 92, 246, 0.1);
  border-left: 3px solid var(--eclipse-violet);
  border-radius: 0 10px 10px 0;
  font-size: 15px;
  color: var(--eclipse-text);
}

.eclipse-sentence mark {
  background: rgba(247, 201, 72, 0.22);
  color: var(--eclipse-gold);
  font-weight: 600;
  padding: 0 3px;
  border-radius: 4px;
}

.eclipse-choices {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin: 0 0 4px;
  padding: 0;
  list-style: none;
}

.eclipse-choice {
  width: 100%;
  min-height: 44px;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  background: rgba(248, 250, 252, 0.04);
  color: var(--eclipse-text);
  border: 1px solid var(--eclipse-line);
  border-radius: 12px;
  font: inherit;
  font-size: 15px;
  text-align: left;
  cursor: pointer;
}

.eclipse-choice:hover:not(:disabled) {
  border-color: var(--eclipse-violet);
  background: rgba(139, 92, 246, 0.14);
}

.eclipse-choice:disabled { cursor: default; }

.eclipse-choice-key {
  flex: 0 0 auto;
  width: 22px;
  height: 22px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--eclipse-line);
  border-radius: 6px;
  font-size: 12px;
  color: var(--eclipse-muted);
}

.eclipse-choice[data-state='correct'] {
  border-color: var(--eclipse-correct);
  background: rgba(45, 212, 191, 0.16);
}

.eclipse-choice[data-state='incorrect'] {
  border-color: var(--eclipse-incorrect);
  background: rgba(251, 113, 133, 0.16);
}

/* Correctness is never colour alone: every state also carries a glyph and a word. */
.eclipse-choice-mark {
  margin-left: auto;
  font-size: 13px;
  font-weight: 600;
}

.eclipse-choice[data-state='correct'] .eclipse-choice-mark { color: var(--eclipse-correct); }
.eclipse-choice[data-state='incorrect'] .eclipse-choice-mark { color: var(--eclipse-incorrect); }

.eclipse-verdict {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0 0 16px;
  font-size: 17px;
  font-weight: 700;
}

.eclipse-verdict[data-correct='true'] { color: var(--eclipse-correct); }
.eclipse-verdict[data-correct='false'] { color: var(--eclipse-incorrect); }

.eclipse-verdict-glyph {
  width: 26px;
  height: 26px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  border: 2px solid currentColor;
  font-size: 14px;
}

.eclipse-section { margin: 0 0 14px; }

.eclipse-section-label {
  margin: 0 0 4px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--eclipse-muted);
}

.eclipse-section-body { margin: 0; font-size: 14px; color: var(--eclipse-text); }

.eclipse-clue {
  display: inline-block;
  padding: 2px 8px;
  background: rgba(247, 201, 72, 0.16);
  border: 1px dashed rgba(247, 201, 72, 0.5);
  border-radius: 999px;
  color: var(--eclipse-gold);
  font-size: 14px;
  font-weight: 600;
}

.eclipse-phase {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 18px 0 0;
  padding: 12px 14px;
  border: 1px solid var(--eclipse-line);
  border-radius: 12px;
  background: rgba(139, 92, 246, 0.08);
}

.eclipse-phase-text { margin: 0; font-size: 13px; color: var(--eclipse-muted); }
.eclipse-phase-name { color: var(--eclipse-text); font-weight: 600; }

.eclipse-note {
  margin: 12px 0 0;
  font-size: 13px;
  color: var(--eclipse-muted);
}

.eclipse-note[data-tone='error'] { color: var(--eclipse-incorrect); }

.eclipse-actions { display: flex; gap: 8px; margin-top: 20px; }

.eclipse-primary {
  flex: 1 1 auto;
  min-height: 44px;
  padding: 10px 16px;
  background: var(--eclipse-gold);
  color: #1A1200;
  border: 1px solid var(--eclipse-gold);
  border-radius: 12px;
  font: inherit;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
}

.eclipse-primary:hover { filter: brightness(1.06); }

.eclipse-visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  padding: 0;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
  border: 0;
}

:focus-visible {
  outline: 3px solid var(--eclipse-gold);
  outline-offset: 2px;
}

@media (prefers-reduced-motion: reduce) {
  .eclipse-card { animation: none; }
  * { transition: none !important; }
}
`;

/**
 * Styles for the inline token. These go into the HOST page, not the shadow
 * root, because the token has to sit in the reader's own paragraph and inherit
 * its font. Everything is scoped to `[data-eclipse-owner]`, uses `all: revert`
 * as a base so the page's own button styling cannot leak in, and is marked
 * `!important` only where a host reset would otherwise win.
 */
export const TOKEN_CSS = `
button[data-eclipse-owner='eclipse'].eclipse-token {
  all: revert;
  display: inline;
  margin: 0;
  padding: 1px 5px;
  border: 1px solid ${COLORS.violet} !important;
  border-radius: 6px;
  /*
   * Fully opaque, not a translucent wash. The host page can be any colour, and
   * a semi-transparent background would put gold text on whatever is underneath
   * — on a white page that lands near 2.6:1, well under AA. Solid #0B1020 keeps
   * gold at roughly 10:1 no matter what the article looks like.
   *
   * It also reads better: the word is genuinely eclipsed rather than tinted.
   */
  background: ${COLORS.background} !important;
  background-image: none !important;
  color: ${COLORS.gold} !important;
  font: inherit !important;
  font-style: normal !important;
  font-weight: 600 !important;
  text-decoration: none !important;
  text-shadow: none !important;
  line-height: inherit !important;
  box-shadow: 0 1px 2px rgba(11, 16, 32, 0.35);
  cursor: pointer;
  /* A 40px hit target without disturbing line boxes in the reader's paragraph. */
  position: relative;
  min-height: 0;
}

button[data-eclipse-owner='eclipse'].eclipse-token::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  top: 50%;
  height: 40px;
  transform: translateY(-50%);
  min-width: 40px;
}

button[data-eclipse-owner='eclipse'].eclipse-token:hover {
  border-color: ${COLORS.gold} !important;
  background: #151C33 !important;
}

button[data-eclipse-owner='eclipse'].eclipse-token:focus-visible {
  outline: 3px solid ${COLORS.gold} !important;
  outline-offset: 2px;
}

button[data-eclipse-owner='eclipse'].eclipse-token[data-answered='correct'] {
  border-color: ${COLORS.correct} !important;
  color: ${COLORS.correct} !important;
}

button[data-eclipse-owner='eclipse'].eclipse-token[data-answered='incorrect'] {
  border-color: ${COLORS.incorrect} !important;
  color: ${COLORS.incorrect} !important;
}

@media (prefers-reduced-motion: reduce) {
  button[data-eclipse-owner='eclipse'].eclipse-token { transition: none !important; }
}
`;
