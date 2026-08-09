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
  --eclipse-muted: #E2E8F0;
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
  background: rgba(4, 7, 18, 0.7);
  /* The host page can be any colour; a real scrim is what guarantees contrast. */
  backdrop-filter: blur(12px);
}

.eclipse-card {
  position: relative;
  width: 100%;
  max-width: 460px;
  max-height: calc(100vh - 48px);
  overflow-y: auto;
  background: linear-gradient(135deg, rgba(27, 36, 64, 0.88), rgba(15, 23, 42, 0.94));
  border: 1px solid rgba(247, 201, 72, 0.25);
  border-radius: 16px;
  box-shadow: 0 24px 64px rgba(0, 0, 0, 0.65), 0 0 0 1px rgba(139, 92, 246, 0.2);
  backdrop-filter: blur(16px);
  padding: 24px;
  box-sizing: border-box;
  animation: eclipse-rise ${REVEAL_MS}ms ease-out;
}

@keyframes eclipse-rise {
  from { opacity: 0; transform: scale(0.97) translateY(6px); }
  to   { opacity: 1; transform: scale(1) translateY(0); }
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
  font-weight: 700;
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
  background: rgba(27, 36, 64, 0.5);
  color: var(--eclipse-muted);
  border: 1px solid rgba(139, 92, 246, 0.3);
  border-radius: 10px;
  font-size: 18px;
  line-height: 1;
  cursor: pointer;
  transition: color 120ms ease, border-color 120ms ease, background 120ms ease;
}

.eclipse-close:hover { color: #FFFFFF; border-color: var(--eclipse-gold); background: rgba(139, 92, 246, 0.2); }

.eclipse-surface {
  margin: 0 0 8px;
  font-size: 30px;
  font-weight: 700;
  letter-spacing: -0.01em;
  color: var(--eclipse-gold);
  text-shadow: 0 2px 8px rgba(247, 201, 72, 0.25);
  overflow-wrap: anywhere;
}

.eclipse-question {
  margin: 0 0 16px;
  font-size: 15px;
  color: #E2E8F0;
}

.eclipse-sentence {
  margin: 0 0 20px;
  padding: 12px 14px;
  background: rgba(139, 92, 246, 0.15);
  border-left: 3px solid var(--eclipse-violet);
  border-radius: 0 10px 10px 0;
  font-size: 15px;
  color: var(--eclipse-text);
  backdrop-filter: blur(4px);
}

.eclipse-sentence mark {
  background: rgba(247, 201, 72, 0.25);
  color: var(--eclipse-gold);
  font-weight: 700;
  padding: 1px 5px;
  border-radius: 4px;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.6);
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
  background: rgba(27, 36, 64, 0.6);
  backdrop-filter: blur(8px);
  color: var(--eclipse-text);
  border: 1px solid rgba(139, 92, 246, 0.3);
  border-radius: 12px;
  font: inherit;
  font-size: 15px;
  text-align: left;
  cursor: pointer;
  transition: border-color 150ms ease, background 150ms ease, transform 80ms ease, box-shadow 150ms ease;
}

.eclipse-choice:hover:not(:disabled) {
  border-color: var(--eclipse-gold);
  background: rgba(139, 92, 246, 0.22);
  box-shadow: 0 0 12px rgba(139, 92, 246, 0.2);
}

.eclipse-choice:disabled { cursor: default; }

.eclipse-choice-key {
  flex: 0 0 auto;
  width: 24px;
  height: 24px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: rgba(139, 92, 246, 0.25);
  border: 1px solid rgba(167, 139, 250, 0.4);
  border-radius: 6px;
  font-weight: 800;
  font-size: 12px;
  color: var(--eclipse-gold);
}

.eclipse-choice[data-state='correct'] {
  border-color: var(--eclipse-correct);
  background: rgba(45, 212, 191, 0.2);
  box-shadow: 0 0 14px rgba(45, 212, 191, 0.25);
}

.eclipse-choice[data-state='incorrect'] {
  border-color: var(--eclipse-incorrect);
  background: rgba(251, 113, 133, 0.2);
  box-shadow: 0 0 14px rgba(251, 113, 133, 0.25);
}

/* Correctness is never colour alone: every state also carries a glyph and a word. */
.eclipse-choice-mark {
  margin-left: auto;
  font-size: 13px;
  font-weight: 700;
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
  color: #A78BFA;
}

.eclipse-section-body { margin: 0; font-size: 14px; color: var(--eclipse-text); }

.eclipse-clue {
  display: inline-block;
  padding: 2px 8px;
  background: rgba(247, 201, 72, 0.18);
  border: 1px dashed rgba(247, 201, 72, 0.6);
  border-radius: 999px;
  color: var(--eclipse-gold);
  font-size: 14px;
  font-weight: 700;
}

.eclipse-phase {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 18px 0 0;
  padding: 12px 14px;
  border: 1px solid rgba(139, 92, 246, 0.35);
  border-radius: 12px;
  backdrop-filter: blur(8px);
  background: rgba(139, 92, 246, 0.12);
}

.eclipse-phase-text { margin: 0; font-size: 13px; color: #E2E8F0; }
.eclipse-phase-name { color: var(--eclipse-gold); font-weight: 700; }

.eclipse-note {
  margin: 12px 0 0;
  font-size: 13px;
  color: #E2E8F0;
}

.eclipse-note[data-tone='error'] { color: var(--eclipse-incorrect); }

.eclipse-actions { display: flex; gap: 8px; margin-top: 20px; }

.eclipse-primary {
  flex: 1 1 auto;
  min-height: 44px;
  padding: 10px 16px;
  background: linear-gradient(135deg, #F7C948 0%, #F5B027 100%);
  color: #1A1200;
  border: 1px solid var(--eclipse-gold);
  border-radius: 12px;
  font: inherit;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  transition: filter 120ms ease, transform 80ms ease;
}

.eclipse-primary:hover {
  filter: brightness(1.08);
  transform: translateY(-1px);
}

.eclipse-primary:active {
  transform: translateY(0);
  filter: brightness(0.96);
}

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
 * Styles for the inline token. High specificity selector chain ensures host page
 * stylesheets can NEVER override token rules or cause grey boxes.
 */
export const TOKEN_CSS = `
html body button[data-eclipse-owner='eclipse'].eclipse-token,
button[data-eclipse-owner='eclipse'].eclipse-token {
  all: unset !important;
  -webkit-appearance: none !important;
  appearance: none !important;
  display: inline-block !important;
  vertical-align: baseline !important;
  margin: 0 3px !important;
  padding: 2px 8px !important;
  border: 1px solid rgba(139, 92, 246, 0.65) !important;
  border-radius: 6px !important;
  /*
   * Translucent Violet Glassmorphic Surface (65% Dark Violet Glass with 8px backdrop blur).
   * High specificity selector prevents any host site stylesheet from overriding.
   */
  background: rgba(24, 20, 52, 0.65) !important;
  background-color: rgba(24, 20, 52, 0.65) !important;
  background-image: none !important;
  backdrop-filter: blur(8px) !important;
  -webkit-backdrop-filter: blur(8px) !important;
  color: ${COLORS.gold} !important;
  font: inherit !important;
  font-style: normal !important;
  font-weight: 700 !important;
  text-decoration: none !important;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.9), 0 0 4px rgba(0, 0, 0, 0.7) !important;
  line-height: inherit !important;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.15) !important;
  cursor: pointer !important;
  transition: border-color 180ms ease, background 180ms ease, box-shadow 180ms ease, color 180ms ease, transform 120ms ease !important;
  position: relative !important;
  min-height: 0 !important;
  box-sizing: border-box !important;
}

html body button[data-eclipse-owner='eclipse'].eclipse-token::after,
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

html body button[data-eclipse-owner='eclipse'].eclipse-token:hover,
button[data-eclipse-owner='eclipse'].eclipse-token:hover {
  border-color: ${COLORS.gold} !important;
  background: rgba(42, 34, 90, 0.85) !important;
  background-color: rgba(42, 34, 90, 0.85) !important;
  color: #FFFFFF !important;
  box-shadow: 0 0 14px rgba(247, 201, 72, 0.45), 0 2px 10px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.3) !important;
  transform: translateY(-1px) !important;
}

/* A phrase is one semantic unit even when it contains several words. */
html body button[data-eclipse-owner='eclipse'].eclipse-token[data-eclipse-kind='phrase'],
button[data-eclipse-owner='eclipse'].eclipse-token[data-eclipse-kind='phrase'] {
  border-radius: 6px !important;
  border: 1px solid rgba(139, 92, 246, 0.75) !important;
  border-bottom: 2.5px solid ${COLORS.violet} !important;
  background: rgba(24, 20, 52, 0.65) !important;
  background-color: rgba(24, 20, 52, 0.65) !important;
  box-shadow:
    inset 0 -2px 0 ${COLORS.violet},
    0 2px 8px rgba(0, 0, 0, 0.35),
    inset 0 1px 0 rgba(255, 255, 255, 0.15) !important;
}

html body button[data-eclipse-owner='eclipse'].eclipse-token[data-eclipse-kind='phrase']:hover,
button[data-eclipse-owner='eclipse'].eclipse-token[data-eclipse-kind='phrase']:hover {
  background: rgba(42, 34, 90, 0.85) !important;
  background-color: rgba(42, 34, 90, 0.85) !important;
  box-shadow:
    inset 0 -2px 0 ${COLORS.violet},
    0 0 14px rgba(139, 92, 246, 0.45),
    0 2px 10px rgba(0, 0, 0, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.3) !important;
}

html body button[data-eclipse-owner='eclipse'].eclipse-token:focus-visible,
button[data-eclipse-owner='eclipse'].eclipse-token:focus-visible {
  outline: 3px solid ${COLORS.gold} !important;
  outline-offset: 2px !important;
}

html body button[data-eclipse-owner='eclipse'].eclipse-token[data-answered='correct'],
button[data-eclipse-owner='eclipse'].eclipse-token[data-answered='correct'] {
  border-color: ${COLORS.correct} !important;
  color: ${COLORS.correct} !important;
  background: rgba(11, 45, 38, 0.65) !important;
  background-color: rgba(11, 45, 38, 0.65) !important;
  box-shadow: 0 0 12px rgba(45, 212, 191, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2) !important;
}

html body button[data-eclipse-owner='eclipse'].eclipse-token[data-answered='incorrect'],
button[data-eclipse-owner='eclipse'].eclipse-token[data-answered='incorrect'] {
  border-color: ${COLORS.incorrect} !important;
  color: ${COLORS.incorrect} !important;
  background: rgba(45, 11, 22, 0.65) !important;
  background-color: rgba(45, 11, 22, 0.65) !important;
  box-shadow: 0 0 12px rgba(251, 113, 133, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2) !important;
}

@media (prefers-reduced-motion: reduce) {
  html body button[data-eclipse-owner='eclipse'].eclipse-token,
  button[data-eclipse-owner='eclipse'].eclipse-token { transition: none !important; }
}
`;
