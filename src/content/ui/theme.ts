/**
 * Celestial Gold & Cosmic Indigo theme for the Shadow DOM overlay and the
 * host-page token pills. Pixel units keep it independent of host root styles.
 */

export const COLORS = {
  background: '#070A14',
  orbit: '#11182C',
  orbitDeep: '#0C1122',
  token: '#1A1438',
  tokenHover: '#241B54',
  gold: '#F7C948',
  goldHigh: '#F9D76E',
  violet: '#8B5CF6',
  violetHigh: '#A78BFA',
  correct: '#2DD4BF',
  incorrect: '#FB7185',
  text: '#F8FAFC',
  textSoft: '#CBD5E1',
  muted: '#94A3B8',
} as const;

export const REVEAL_MS = 220;

export const OVERLAY_CSS = `
:host {
  --eclipse-cosmic: ${COLORS.background};
  --eclipse-orbit: ${COLORS.orbit};
  --eclipse-orbit-deep: ${COLORS.orbitDeep};
  --eclipse-gold: ${COLORS.gold};
  --eclipse-gold-high: ${COLORS.goldHigh};
  --eclipse-gold-soft: rgba(247, 201, 72, 0.13);
  --eclipse-gold-line: rgba(247, 201, 72, 0.32);
  --eclipse-violet: ${COLORS.violet};
  --eclipse-violet-high: ${COLORS.violetHigh};
  --eclipse-violet-soft: rgba(139, 92, 246, 0.14);
  --eclipse-correct: ${COLORS.correct};
  --eclipse-correct-soft: rgba(45, 212, 191, 0.13);
  --eclipse-incorrect: ${COLORS.incorrect};
  --eclipse-incorrect-soft: rgba(251, 113, 133, 0.13);
  --eclipse-text: ${COLORS.text};
  --eclipse-text-soft: ${COLORS.textSoft};
  --eclipse-muted: ${COLORS.muted};
  --eclipse-line: rgba(148, 163, 184, 0.2);
  --eclipse-line-strong: rgba(148, 163, 184, 0.34);
  --eclipse-glass: rgba(18, 24, 43, 0.92);
  --eclipse-glass-soft: rgba(248, 250, 252, 0.045);
  --eclipse-shadow-card: 0 28px 80px rgba(0, 0, 0, 0.62), inset 0 1px 0 rgba(255, 255, 255, 0.055);
  --eclipse-shadow-gold: 0 0 28px rgba(247, 201, 72, 0.2);
  --eclipse-font-display: 'Iowan Old Style', 'Palatino Linotype', 'Book Antiqua', Palatino, Georgia, serif;
  --eclipse-font-body: 'Avenir Next', Avenir, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  --eclipse-font-mono: 'SFMono-Regular', Consolas, 'Liberation Mono', monospace;
  --eclipse-transition: 160ms cubic-bezier(0.2, 0.8, 0.2, 1);
}

.eclipse-root,
.eclipse-root * { box-sizing: border-box; }

.eclipse-root {
  position: fixed;
  inset: 0;
  z-index: 2147483000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  color: var(--eclipse-text);
  font-family: var(--eclipse-font-body);
  font-size: 15px;
  line-height: 1.48;
}

.eclipse-scrim {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(circle at 50% 42%, rgba(139, 92, 246, 0.13), transparent 38%),
    rgba(3, 5, 12, 0.76);
  backdrop-filter: blur(14px) saturate(0.8);
}

.eclipse-card {
  position: relative;
  width: 100%;
  max-width: 520px;
  max-height: calc(100vh - 48px);
  overflow-x: hidden;
  overflow-y: auto;
  padding: 22px;
  border: 1px solid var(--eclipse-gold-line);
  border-radius: 18px;
  background:
    radial-gradient(circle at 105% -5%, var(--eclipse-violet-soft), transparent 30%),
    linear-gradient(155deg, var(--eclipse-glass), rgba(7, 10, 20, 0.97));
  box-shadow: var(--eclipse-shadow-card), var(--eclipse-shadow-gold);
  backdrop-filter: blur(20px);
  scrollbar-color: var(--eclipse-line-strong) transparent;
  animation: eclipse-rise ${REVEAL_MS}ms cubic-bezier(0.2, 0.8, 0.2, 1) both;
}

.eclipse-card::before {
  content: '';
  position: absolute;
  inset: 0 20% auto;
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--eclipse-gold-high), transparent);
  box-shadow: var(--eclipse-shadow-gold);
}

.eclipse-card::after {
  content: '';
  position: absolute;
  z-index: -1;
  width: 190px;
  height: 190px;
  top: -124px;
  right: -94px;
  border: 1px solid var(--eclipse-line);
  border-radius: 50%;
}

@keyframes eclipse-rise {
  from { opacity: 0; transform: translateY(10px) scale(0.975); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}

.eclipse-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  min-height: 34px;
  margin-bottom: 14px;
}

.eclipse-command { display: flex; align-items: center; gap: 9px; }

.eclipse-command-orbit {
  position: relative;
  width: 24px;
  height: 24px;
  border: 1px solid var(--eclipse-gold-line);
  border-radius: 50%;
  box-shadow: var(--eclipse-shadow-gold);
}

.eclipse-command-orbit::before {
  content: '';
  position: absolute;
  width: 11px;
  height: 11px;
  inset: 5px;
  border-radius: 50%;
  background: var(--eclipse-gold);
}

.eclipse-command-orbit::after {
  content: '';
  position: absolute;
  width: 13px;
  height: 13px;
  top: 4px;
  left: 10px;
  border-radius: 50%;
  background: var(--eclipse-orbit);
}

.eclipse-eyebrow {
  margin: 0;
  color: var(--eclipse-gold);
  font-family: var(--eclipse-font-mono);
  font-size: 10px;
  font-weight: 750;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.eclipse-close {
  display: inline-grid;
  place-items: center;
  flex: 0 0 auto;
  min-width: 34px;
  min-height: 34px;
  border: 1px solid var(--eclipse-line);
  border-radius: 10px;
  background: var(--eclipse-glass-soft);
  color: var(--eclipse-muted);
  font: inherit;
  font-size: 14px;
  cursor: pointer;
  transition: color var(--eclipse-transition), border-color var(--eclipse-transition), background var(--eclipse-transition);
}

.eclipse-close:hover { border-color: var(--eclipse-gold); background: var(--eclipse-gold-soft); color: var(--eclipse-gold-high); }

.eclipse-surface-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0 0 6px;
}

.eclipse-surface {
  min-width: 0;
  margin: 0;
  color: var(--eclipse-gold-high);
  font-family: var(--eclipse-font-display);
  font-size: 34px;
  font-weight: 700;
  letter-spacing: -0.035em;
  line-height: 1.1;
  overflow-wrap: anywhere;
  text-shadow: var(--eclipse-shadow-gold);
}

.eclipse-speak {
  display: inline-flex;
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: 1px solid rgba(139, 92, 246, 0.4);
  border-radius: 10px;
  background: rgba(139, 92, 246, 0.18);
  color: var(--eclipse-gold);
  font: inherit;
  font-size: 16px;
  line-height: 1;
  cursor: pointer;
  transition: background 120ms ease, border-color 120ms ease, transform 80ms ease;
}

.eclipse-speak:hover { border-color: var(--eclipse-gold); background: rgba(139, 92, 246, 0.3); }
.eclipse-speak:active { transform: scale(0.94); }
.eclipse-speak:focus-visible { outline: 2px solid var(--eclipse-gold); outline-offset: 2px; }

.eclipse-question { margin: 0 0 15px; color: var(--eclipse-text-soft); font-size: 13px; }

.eclipse-sentence {
  margin: 0 0 17px;
  padding: 12px 14px;
  border: 1px solid var(--eclipse-line);
  border-left: 3px solid var(--eclipse-violet);
  border-radius: 3px 12px 12px 3px;
  background: var(--eclipse-violet-soft);
  color: var(--eclipse-text-soft);
  font-family: var(--eclipse-font-display);
  font-size: 15px;
  line-height: 1.52;
}

.eclipse-sentence mark {
  padding: 1px 4px;
  border-radius: 4px;
  background: var(--eclipse-gold-soft);
  color: var(--eclipse-gold-high);
  font-weight: 700;
}

.eclipse-choices {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.eclipse-choice {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: center;
  gap: 10px;
  width: 100%;
  min-height: 46px;
  padding: 9px 11px;
  border: 1px solid var(--eclipse-line);
  border-radius: 12px;
  background: var(--eclipse-glass-soft);
  color: var(--eclipse-text);
  font: inherit;
  font-size: 14px;
  text-align: left;
  cursor: pointer;
  transition: transform var(--eclipse-transition), border-color var(--eclipse-transition), background var(--eclipse-transition), box-shadow var(--eclipse-transition);
}

.eclipse-choice:hover:not(:disabled) {
  border-color: var(--eclipse-gold);
  background: linear-gradient(90deg, var(--eclipse-gold-soft), var(--eclipse-violet-soft));
  box-shadow: var(--eclipse-shadow-gold);
  transform: translateY(-1px);
}

.eclipse-choice:active:not(:disabled) { transform: translateY(1px); }
.eclipse-choice:disabled { cursor: default; }

.eclipse-choice-key,
.eclipse-shortcuts kbd {
  display: inline-grid;
  place-items: center;
  min-width: 25px;
  height: 25px;
  padding: 0 5px;
  border: 1px solid var(--eclipse-line-strong);
  border-radius: 7px;
  background: var(--eclipse-orbit);
  color: var(--eclipse-gold);
  font-family: var(--eclipse-font-mono);
  font-size: 10px;
  font-weight: 800;
  box-shadow: inset 0 -2px 0 rgba(0, 0, 0, 0.28);
}

.eclipse-choice[data-state='correct'] { border-color: var(--eclipse-correct); background: var(--eclipse-correct-soft); box-shadow: 0 0 16px var(--eclipse-correct-soft); }
.eclipse-choice[data-state='incorrect'] { border-color: var(--eclipse-incorrect); background: var(--eclipse-incorrect-soft); box-shadow: 0 0 16px var(--eclipse-incorrect-soft); }
.eclipse-choice-mark { margin-left: auto; font-size: 11px; font-weight: 750; }
.eclipse-choice[data-state='correct'] .eclipse-choice-mark { color: var(--eclipse-correct); }
.eclipse-choice[data-state='incorrect'] .eclipse-choice-mark { color: var(--eclipse-incorrect); }

.eclipse-shortcuts {
  display: flex;
  justify-content: flex-end;
  gap: 13px;
  margin-top: 10px;
  color: var(--eclipse-muted);
  font-family: var(--eclipse-font-mono);
  font-size: 9px;
}

.eclipse-shortcuts span { display: flex; align-items: center; gap: 5px; }
.eclipse-shortcuts kbd { min-width: 22px; height: 20px; padding-inline: 4px; font-size: 8px; }

.eclipse-verdict {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0 0 14px;
  padding: 10px 12px;
  border: 1px solid currentColor;
  border-radius: 12px;
  font-family: var(--eclipse-font-display);
  font-size: 20px;
  font-weight: 700;
  animation: verdict-arrive 300ms cubic-bezier(0.2, 0.8, 0.2, 1) both;
}

@keyframes verdict-arrive { from { opacity: 0; transform: scale(0.98); } to { opacity: 1; transform: scale(1); } }
.eclipse-verdict[data-correct='true'] { background: var(--eclipse-correct-soft); color: var(--eclipse-correct); }
.eclipse-verdict[data-correct='false'] { background: var(--eclipse-incorrect-soft); color: var(--eclipse-incorrect); }
.eclipse-verdict-glyph { display: inline-grid; place-items: center; width: 27px; height: 27px; border: 2px solid currentColor; border-radius: 50%; font-family: var(--eclipse-font-body); font-size: 13px; }

.eclipse-translation-pair {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
  padding: 13px;
  border: 1px solid var(--eclipse-gold-line);
  border-radius: 14px;
  background: linear-gradient(110deg, var(--eclipse-gold-soft), var(--eclipse-glass-soft) 50%, var(--eclipse-violet-soft));
}

.eclipse-translation-pair .eclipse-surface-row { margin: 2px 0 0; }
.eclipse-translation-pair .eclipse-surface { font-size: 25px; }
.eclipse-translation-arrow { color: var(--eclipse-gold); font-family: var(--eclipse-font-mono); }
.eclipse-translation { margin: 2px 0 0; color: var(--eclipse-text); font-family: var(--eclipse-font-display); font-size: 20px; font-weight: 700; overflow-wrap: anywhere; }

.eclipse-section { margin: 0; }
.eclipse-section-label { margin: 0 0 4px; color: var(--eclipse-violet-high); font-family: var(--eclipse-font-mono); font-size: 9px; font-weight: 750; letter-spacing: 0.1em; text-transform: uppercase; }
.eclipse-section-body { margin: 0; color: var(--eclipse-text-soft); font-size: 12px; }

.eclipse-reason-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; margin-bottom: 12px; }
.eclipse-reason-grid .eclipse-section { padding: 10px 11px; border: 1px solid var(--eclipse-line); border-radius: 11px; background: var(--eclipse-glass-soft); }
.eclipse-reason-grid .eclipse-section[data-kind='why'] { border-top-color: var(--eclipse-correct); }
.eclipse-reason-grid .eclipse-section[data-kind='why-not'] { border-top-color: var(--eclipse-incorrect); }

.eclipse-phase { display: flex; align-items: center; gap: 11px; margin-top: 12px; padding: 10px 11px; border: 1px solid var(--eclipse-violet); border-radius: 12px; background: var(--eclipse-violet-soft); }
.eclipse-phase-text { margin: 0; color: var(--eclipse-text-soft); font-size: 11px; }
.eclipse-phase-name { color: var(--eclipse-gold-high); font-weight: 750; }
.eclipse-note { margin: 9px 0 0; color: var(--eclipse-muted); font-size: 10px; }
.eclipse-note[data-tone='error'] { color: var(--eclipse-incorrect); }
.eclipse-actions { display: flex; margin-top: 13px; }

.eclipse-primary {
  flex: 1;
  min-height: 43px;
  padding: 9px 14px;
  border: 1px solid var(--eclipse-gold-high);
  border-radius: 12px;
  background: linear-gradient(135deg, var(--eclipse-gold-high), var(--eclipse-gold));
  box-shadow: var(--eclipse-shadow-gold), inset 0 1px 0 rgba(255, 255, 255, 0.55);
  color: #251B02;
  font: inherit;
  font-weight: 800;
  cursor: pointer;
  transition: transform var(--eclipse-transition), filter var(--eclipse-transition);
}

.eclipse-primary:hover { filter: brightness(1.04); transform: translateY(-1px); }
.eclipse-primary:active { transform: translateY(1px); }

.eclipse-visually-hidden { position: absolute; width: 1px; height: 1px; margin: -1px; padding: 0; overflow: hidden; clip-path: inset(50%); white-space: nowrap; border: 0; }
:focus-visible { outline: 3px solid var(--eclipse-gold); outline-offset: 2px; }

@media (max-width: 560px) {
  .eclipse-root { padding: 12px; }
  .eclipse-card { max-height: calc(100vh - 24px); padding: 17px; border-radius: 15px; }
  .eclipse-reason-grid { grid-template-columns: 1fr; }
  .eclipse-translation-pair { grid-template-columns: 1fr; gap: 5px; }
  .eclipse-translation-arrow { transform: rotate(90deg); }
}

@media (prefers-reduced-motion: reduce) {
  .eclipse-card,
  .eclipse-verdict { animation: none; }
  * { transition: none !important; }
}

@media (forced-colors: active) {
  .eclipse-card,
  .eclipse-choice,
  .eclipse-verdict,
  .eclipse-primary { border: 2px solid CanvasText; }
  .eclipse-scrim { backdrop-filter: none; }
}
`;

const TOKEN_SEL = `html body button[data-eclipse-owner='eclipse'].eclipse-token.eclipse-token.eclipse-token`;

const TOKEN_SURFACE = `
  background-color: ${COLORS.token} !important;
  background-image: linear-gradient(180deg, rgba(139, 92, 246, 0.2), rgba(7, 10, 20, 0.08)) !important;
`;

const TOKEN_SURFACE_HOVER = `
  background-color: ${COLORS.tokenHover} !important;
  background-image: linear-gradient(180deg, rgba(167, 139, 250, 0.3), rgba(139, 92, 246, 0.12)) !important;
`;

export const TOKEN_CSS = `
${TOKEN_SEL} {
  all: unset !important;
  -webkit-appearance: none !important;
  appearance: none !important;
  position: relative !important;
  display: inline-block !important;
  vertical-align: baseline !important;
  box-sizing: border-box !important;
  min-height: 0 !important;
  margin: 0 2px !important;
  padding: 1px 6px !important;
  border: 1px solid rgba(139, 92, 246, 0.82) !important;
  border-radius: 6px !important;
${TOKEN_SURFACE}
  box-shadow: 0 2px 7px rgba(0, 0, 0, 0.34), inset 0 1px 0 rgba(255, 255, 255, 0.1) !important;
  color: ${COLORS.goldHigh} !important;
  font: inherit !important;
  font-style: normal !important;
  font-weight: 750 !important;
  line-height: inherit !important;
  text-decoration: none !important;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.65) !important;
  cursor: pointer !important;
  transition: border-color 160ms ease, background-color 160ms ease, box-shadow 160ms ease, color 160ms ease, transform 120ms ease !important;
}

${TOKEN_SEL}::after {
  content: '' !important;
  position: absolute !important;
  left: 0 !important;
  right: 0 !important;
  top: 50% !important;
  min-width: 40px !important;
  height: 40px !important;
  transform: translateY(-50%) !important;
}

${TOKEN_SEL}:hover,
${TOKEN_SEL}:focus-visible {
  border-color: ${COLORS.gold} !important;
${TOKEN_SURFACE_HOVER}
  color: #FFFFFF !important;
  animation: eclipse-golden-aura 2.2s linear infinite !important;
  transform: translateY(-1px) !important;
}

${TOKEN_SEL}[data-eclipse-kind='phrase'] {
  box-shadow: 0 2px 7px rgba(0, 0, 0, 0.34), inset 0 1px 0 rgba(255, 255, 255, 0.1) !important;
}

${TOKEN_SEL}:focus-visible {
  outline: 3px solid ${COLORS.gold} !important;
  outline-offset: 2px !important;
}

${TOKEN_SEL}[data-answered='correct'] {
  border-color: ${COLORS.correct} !important;
  color: ${COLORS.correct} !important;
  background-color: #0B2D26 !important;
  background-image: linear-gradient(180deg, rgba(45, 212, 191, 0.18), rgba(45, 212, 191, 0.05)) !important;
  box-shadow: 0 0 13px rgba(45, 212, 191, 0.38), inset 0 1px 0 rgba(255, 255, 255, 0.18) !important;
}

${TOKEN_SEL}[data-answered='incorrect'] {
  border-color: ${COLORS.incorrect} !important;
  color: ${COLORS.incorrect} !important;
  background-color: #2D0B16 !important;
  background-image: linear-gradient(180deg, rgba(251, 113, 133, 0.18), rgba(251, 113, 133, 0.05)) !important;
  box-shadow: 0 0 13px rgba(251, 113, 133, 0.38), inset 0 1px 0 rgba(255, 255, 255, 0.18) !important;
}

@keyframes eclipse-golden-aura {
  0% {
    border-color: ${COLORS.gold} !important;
    box-shadow:
      0 0 0 1px ${COLORS.gold},
      0 -5px 12px 1px rgba(249, 215, 110, 0.95),
      3px -3px 16px 2px rgba(247, 201, 72, 0.7),
      0 0 6px rgba(247, 201, 72, 0.5) !important;
  }
  25% {
    border-color: ${COLORS.goldHigh} !important;
    box-shadow:
      0 0 0 1px ${COLORS.goldHigh},
      5px 0 12px 1px rgba(249, 215, 110, 0.95),
      3px 3px 16px 2px rgba(247, 201, 72, 0.7),
      0 0 6px rgba(247, 201, 72, 0.5) !important;
  }
  50% {
    border-color: ${COLORS.gold} !important;
    box-shadow:
      0 0 0 1px ${COLORS.gold},
      0 5px 12px 1px rgba(249, 215, 110, 0.95),
      -3px 3px 16px 2px rgba(247, 201, 72, 0.7),
      0 0 6px rgba(247, 201, 72, 0.5) !important;
  }
  75% {
    border-color: ${COLORS.goldHigh} !important;
    box-shadow:
      0 0 0 1px ${COLORS.goldHigh},
      -5px 0 12px 1px rgba(249, 215, 110, 0.95),
      -3px -3px 16px 2px rgba(247, 201, 72, 0.7),
      0 0 6px rgba(247, 201, 72, 0.5) !important;
  }
  100% {
    border-color: ${COLORS.gold} !important;
    box-shadow:
      0 0 0 1px ${COLORS.gold},
      0 -5px 12px 1px rgba(249, 215, 110, 0.95),
      3px -3px 16px 2px rgba(247, 201, 72, 0.7),
      0 0 6px rgba(247, 201, 72, 0.5) !important;
  }
}

@media (prefers-reduced-motion: reduce) {
  ${TOKEN_SEL} { animation: none !important; transition: none !important; }
}

@media (forced-colors: active) {
  ${TOKEN_SEL} { border: 2px solid ButtonText !important; color: ButtonText !important; background: ButtonFace !important; }
}
`;
