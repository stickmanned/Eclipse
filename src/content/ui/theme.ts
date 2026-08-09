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
 * One selector for every token rule.
 *
 * The class is repeated rather than varied: specificity is what decides a fight
 * with a host stylesheet, and `.eclipse-token` three times costs nothing while
 * putting the base rule out of reach of essentially anything a page can write.
 * Repeating it also keeps every rule below on the *same* footing — which is the
 * actual bug this shape prevents. When the base rule and a variant rule sat at
 * different specificities and both restated the surface, a host page could beat
 * one and lose to the other, so single-word tokens rendered as bare grey
 * `<button>` chrome while multi-word ones kept the violet surface.
 */
const TOKEN_SEL = `html body button[data-eclipse-owner='eclipse'].eclipse-token.eclipse-token.eclipse-token`;

/**
 * The token surface is opaque.
 *
 * A translucent wash reads as whatever is behind it: grey on a light page, and
 * gold text on that lands near 2.6:1, well under AA. An opaque violet base with
 * a violet tint layered on top keeps the glass look on a dark article while
 * making the token's appearance independent of the host page entirely — there
 * is nothing behind it left to show through. `backdrop-filter` is gone for the
 * same reason: invisible under an opaque fill, and it created a containing
 * block for no benefit.
 */
const TOKEN_SURFACE = `
  background-color: #1A1438 !important;
  background-image: linear-gradient(180deg, rgba(139, 92, 246, 0.22) 0%, rgba(139, 92, 246, 0.08) 100%) !important;
`;

const TOKEN_SURFACE_HOVER = `
  background-color: #241B54 !important;
  background-image: linear-gradient(180deg, rgba(167, 139, 250, 0.34) 0%, rgba(139, 92, 246, 0.16) 100%) !important;
`;

/**
 * Styles for the inline token.
 *
 * Every rule below states only what it changes. Nothing restates the surface,
 * so a token can never be half-themed: the variants add an accent or a state
 * colour on top of one base that all of them share.
 */
export const TOKEN_CSS = `
${TOKEN_SEL} {
  all: unset !important;
  -webkit-appearance: none !important;
  appearance: none !important;
  display: inline-block !important;
  vertical-align: baseline !important;
  margin: 0 3px !important;
  padding: 2px 8px !important;
  border: 1px solid rgba(139, 92, 246, 0.75) !important;
  border-radius: 6px !important;
${TOKEN_SURFACE}
  color: ${COLORS.gold} !important;
  font: inherit !important;
  font-style: normal !important;
  font-weight: 700 !important;
  text-decoration: none !important;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.55) !important;
  line-height: inherit !important;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.12) !important;
  cursor: pointer !important;
  transition: border-color 180ms ease, background-color 180ms ease, box-shadow 180ms ease, color 180ms ease, transform 120ms ease !important;
  position: relative !important;
  min-height: 0 !important;
  box-sizing: border-box !important;
}

${TOKEN_SEL}::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  top: 50%;
  height: 40px;
  transform: translateY(-50%);
  min-width: 40px;
}

${TOKEN_SEL}:hover {
  border-color: ${COLORS.gold} !important;
${TOKEN_SURFACE_HOVER}
  color: #FFFFFF !important;
  box-shadow: 0 0 14px rgba(247, 201, 72, 0.45), 0 2px 10px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.3) !important;
  transform: translateY(-1px) !important;
}

/*
 * A phrase is one semantic unit even when it contains several words. The only
 * thing that marks it is the bottom rule — it adds to the shared surface rather
 * than repainting it.
 */
${TOKEN_SEL}[data-eclipse-kind='phrase'] {
  border-bottom: 2.5px solid ${COLORS.violet} !important;
}

${TOKEN_SEL}:focus-visible {
  outline: 3px solid ${COLORS.gold} !important;
  outline-offset: 2px !important;
}

${TOKEN_SEL}[data-answered='correct'] {
  border-color: ${COLORS.correct} !important;
  color: ${COLORS.correct} !important;
  background-color: #0B2D26 !important;
  background-image: linear-gradient(180deg, rgba(45, 212, 191, 0.18) 0%, rgba(45, 212, 191, 0.06) 100%) !important;
  box-shadow: 0 0 12px rgba(45, 212, 191, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2) !important;
}

${TOKEN_SEL}[data-answered='incorrect'] {
  border-color: ${COLORS.incorrect} !important;
  color: ${COLORS.incorrect} !important;
  background-color: #2D0B16 !important;
  background-image: linear-gradient(180deg, rgba(251, 113, 133, 0.18) 0%, rgba(251, 113, 133, 0.06) 100%) !important;
  box-shadow: 0 0 12px rgba(251, 113, 133, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2) !important;
}

/* The phrase rule sets border-bottom, so answered states have to restate it. */
${TOKEN_SEL}[data-eclipse-kind='phrase'][data-answered='correct'] {
  border-bottom-color: ${COLORS.correct} !important;
}

${TOKEN_SEL}[data-eclipse-kind='phrase'][data-answered='incorrect'] {
  border-bottom-color: ${COLORS.incorrect} !important;
}

@media (prefers-reduced-motion: reduce) {
  ${TOKEN_SEL} { transition: none !important; }
}
`;
