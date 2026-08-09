/**
 * Animated star ring drawn around the session Moon.
 *
 * Two instances are layered around the Moon — one `back`, one `front` — so
 * the star reads as passing behind the Moon for half its lap and in front
 * for the other half, matching the technique in OrbitLogo.
 */

const ORBIT_PATH_D = 'M 82.04,31.64 A 40,17.6 -18 0,1 5.96,56.36 A 40,17.6 -18 0,1 82.04,31.64';

interface OrbitRingProps {
  readonly layer: 'back' | 'front';
}

export function OrbitRing({ layer }: OrbitRingProps) {
  const isBack = layer === 'back';
  const pathId = `sessionOrbitPath-${layer}`;
  const glowId = `sessionOrbitGlow-${layer}`;
  const blurId = `sessionOrbitBlur-${layer}`;

  return (
    <svg
      className="session-orbit-ring"
      viewBox="0 0 88 88"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <path id={pathId} d={ORBIT_PATH_D} />
        <radialGradient id={glowId} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFFCF2" stopOpacity="0.95" />
          <stop offset="45%" stopColor="#FFE9A8" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#FFE9A8" stopOpacity="0" />
        </radialGradient>
        <filter id={blurId} x="-200%" y="-200%" width="500%" height="500%">
          <feGaussianBlur stdDeviation="0.5" />
        </filter>
      </defs>

      {isBack && <use href={`#${pathId}`} fill="none" stroke="var(--ec-gold-line)" strokeWidth="1" />}

      <g opacity={isBack ? 0 : 1}>
        <animate
          attributeName="opacity"
          values={isBack ? '0;0;1;1;0' : '1;1;0;0;1'}
          keyTimes="0;0.001;0.5;0.999;1"
          dur="6s"
          repeatCount="indefinite"
        />
        <animateMotion dur="6s" repeatCount="indefinite" rotate="auto">
          <mpath href={`#${pathId}`} />
        </animateMotion>
        <g>
          <circle r="3.4" fill={`url(#${glowId})`} filter={`url(#${blurId})`} />
          <path
            d="M0,-2.2 L0.6,-0.55 L2.2,0 L0.6,0.55 L0,2.2 L-0.6,0.55 L-2.2,0 L-0.6,-0.55 Z"
            fill="#FFFDF6"
          />
          <animateTransform
            attributeName="transform"
            type="scale"
            values="0.85;1.15;0.85"
            dur="1.4s"
            repeatCount="indefinite"
          />
        </g>
      </g>
    </svg>
  );
}
