/**
 * Animated eclipse-and-orbit brand mark.
 *
 * Drawn as SVG so it scales with its container and needs no image asset. A
 * star travels the orbit path behind and in front of the planet, swapping
 * layers each half-lap so it reads as passing behind the eclipse.
 */

interface OrbitLogoProps {
  readonly size?: number;
}

export function OrbitLogo({ size = 42 }: OrbitLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="-10 8 130 112"
      role="img"
      aria-label="Eclipse"
      focusable="false"
    >
      <defs>
        <radialGradient id="orbitLogoGold" cx="38%" cy="35%" r="75%">
          <stop offset="0%" stopColor="#FDE39B" />
          <stop offset="55%" stopColor="#F8C949" />
          <stop offset="100%" stopColor="#E4A72B" />
        </radialGradient>

        <radialGradient id="orbitLogoNavy" cx="42%" cy="38%" r="70%">
          <stop offset="0%" stopColor="#232C52" />
          <stop offset="100%" stopColor="#171D38" />
        </radialGradient>

        <radialGradient id="orbitLogoStarGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFFCF2" stopOpacity="0.95" />
          <stop offset="45%" stopColor="#FFE9A8" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#FFE9A8" stopOpacity="0" />
        </radialGradient>

        <filter id="orbitLogoSoftBlur" x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur stdDeviation="1.6" />
        </filter>

        <filter id="orbitLogoStarBlur" x="-200%" y="-200%" width="500%" height="500%">
          <feGaussianBlur stdDeviation="0.6" />
        </filter>

        <path
          id="orbitLogoPath"
          d="M 110.161,43.077 A 58,21 -18 0,1 -0.161,78.923 A 58,21 -18 0,1 110.161,43.077"
        />

        <clipPath id="orbitLogoGoldClip">
          <circle cx="55" cy="61" r="45" />
        </clipPath>

        <g id="orbitLogoStarMark">
          <circle r="4.2" fill="url(#orbitLogoStarGlow)" filter="url(#orbitLogoStarBlur)" />
          <path
            d="M0,-2.7 L0.75,-0.65 L2.7,0 L0.75,0.65 L0,2.7 L-0.75,0.65 L-2.7,0 L-0.75,-0.65 Z"
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
      </defs>

      {/* star travelling behind the planet */}
      <g opacity="0">
        <animate
          attributeName="opacity"
          values="0;0;1;1;0"
          keyTimes="0;0.001;0.5;0.999;1"
          dur="6s"
          repeatCount="indefinite"
        />
        <animateMotion dur="6s" repeatCount="indefinite" rotate="auto">
          <mpath href="#orbitLogoPath" />
        </animateMotion>
        <use href="#orbitLogoStarMark" />
      </g>

      <g>
        <animateTransform
          attributeName="transform"
          type="scale"
          values="1;1.006;1"
          keyTimes="0;0.5;1"
          dur="7s"
          repeatCount="indefinite"
          additive="sum"
        />

        <circle cx="55" cy="61" r="45" fill="url(#orbitLogoGold)" />

        <circle cx="65" cy="61" r="35" fill="url(#orbitLogoNavy)" />

        <g clipPath="url(#orbitLogoGoldClip)">
          <circle
            cx="65"
            cy="61"
            r="35"
            fill="none"
            stroke="#FFE9A8"
            strokeWidth="2.2"
            filter="url(#orbitLogoSoftBlur)"
            opacity="0.35"
          >
            <animate
              attributeName="opacity"
              values="0.2;0.55;0.2"
              dur="5.5s"
              repeatCount="indefinite"
            />
            <animate
              attributeName="stroke-width"
              values="1.6;2.6;1.6"
              dur="5.5s"
              repeatCount="indefinite"
            />
          </circle>
        </g>
      </g>

      <use href="#orbitLogoPath" fill="none" stroke="#C9D3E8" strokeWidth="0.55" opacity="0.4" />

      {/* star travelling in front of the planet */}
      <g opacity="1">
        <animate
          attributeName="opacity"
          values="1;1;0;0;1"
          keyTimes="0;0.001;0.5;0.999;1"
          dur="6s"
          repeatCount="indefinite"
        />
        <animateMotion dur="6s" repeatCount="indefinite" rotate="auto">
          <mpath href="#orbitLogoPath" />
        </animateMotion>
        <use href="#orbitLogoStarMark" />
      </g>
    </svg>
  );
}
