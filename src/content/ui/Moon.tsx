/**
 * Moon-phase imagery.
 *
 * Drawn as SVG so it scales with the card and needs no image asset. The phase
 * is always accompanied by its name in text — the moon is reinforcement, never
 * the only carrier of meaning.
 */

import type { MoonPhase } from '../../domain/profile';
import { COLORS } from './theme';

export const PHASE_LABEL: Readonly<Record<MoonPhase, string>> = {
  new_moon: 'New moon',
  crescent: 'Crescent',
  half: 'Half moon',
  full: 'Full moon',
};

export const PHASE_DESCRIPTION: Readonly<Record<MoonPhase, string>> = {
  new_moon: 'not met yet',
  crescent: 'starting to show',
  half: 'reading it more often than not',
  full: 'read reliably',
};

interface MoonProps {
  readonly phase: MoonPhase;
  readonly size?: number;
}

export function Moon({ phase, size = 28 }: MoonProps) {
  const radius = size / 2;
  const lit = COLORS.gold;
  const dark = '#1B2440';

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      role="img"
      aria-label={`${PHASE_LABEL[phase]} — ${PHASE_DESCRIPTION[phase]}`}
      focusable="false"
    >
      <circle cx="16" cy="16" r="14" fill={dark} stroke={COLORS.gold} strokeWidth="1.5" />
      {phase === 'crescent' && <path d="M16 2a14 14 0 0 0 0 28a10 14 0 0 1 0-28z" fill={lit} />}
      {phase === 'half' && <path d="M16 2a14 14 0 0 0 0 28z" fill={lit} />}
      {phase === 'full' && <circle cx="16" cy="16" r="14" fill={lit} />}
      {phase === 'new_moon' && (
        <circle cx="16" cy="16" r={radius / 8} fill={COLORS.gold} opacity="0.35" />
      )}
    </svg>
  );
}
