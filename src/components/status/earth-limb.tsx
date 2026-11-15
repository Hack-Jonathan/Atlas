/**
 * Signature element of Atlas: the curved atmospheric limb of Earth seen from the
 * ISS cupola at night — faint stars above, an airglow band on the rim, scattered
 * city lights on the dark planet. The rim takes the overall status color and
 * "breathes" in once when shown. Decorative only (aria-hidden): the status is
 * always also written in text.
 */
import { useId } from "react";

import { statusPresentation } from "@/config/status";
import { cn } from "@/lib/utils";
import type { StatusLevel } from "@/types/status";

/** Hand-placed star field above the horizon: [x, y, radius, opacity]. */
const stars: ReadonlyArray<readonly [number, number, number, number]> = [
  [40, 30, 1.1, 0.7], [118, 92, 0.8, 0.5], [205, 18, 1.3, 0.8], [262, 128, 0.7, 0.4],
  [331, 56, 1, 0.6], [402, 12, 0.8, 0.5], [455, 98, 1.2, 0.7], [521, 40, 0.7, 0.4],
  [588, 70, 1, 0.55], [655, 22, 1.4, 0.85], [712, 104, 0.8, 0.45], [781, 48, 1.1, 0.65],
  [846, 14, 0.7, 0.4], [903, 86, 1.2, 0.7], [968, 34, 0.9, 0.5], [1032, 118, 0.8, 0.45],
  [1094, 58, 1.3, 0.8], [1160, 24, 0.8, 0.5], [74, 140, 0.7, 0.35], [1128, 150, 0.7, 0.35],
];

/** Sparse city lights on the night side, just under the rim: [x, y, radius]. */
const cityLights: ReadonlyArray<readonly [number, number, number]> = [
  [318, 214, 1.2], [334, 219, 0.9], [352, 211, 1.4], [497, 192, 1], [512, 197, 1.3],
  [530, 190, 0.8], [690, 188, 1.1], [706, 194, 1.5], [721, 186, 0.9], [868, 206, 1.2],
  [884, 212, 0.9], [902, 203, 1.3], [210, 238, 1], [1000, 228, 1.1],
];

const rim = "M-40 300 Q600 70 1240 300";

interface EarthLimbProps {
  level: StatusLevel;
  className?: string;
}

export function EarthLimb({ level, className }: EarthLimbProps) {
  const color = statusPresentation[level].colorVar;
  // Unique ids so two limbs on one page never share gradients/filters.
  const id = useId().replace(/:/g, "");

  return (
    <svg
      aria-hidden
      viewBox="0 0 1200 300"
      preserveAspectRatio="none"
      className={cn("pointer-events-none block h-full w-full", className)}
    >
      <defs>
        <radialGradient id={`${id}-planet`} cx="50%" cy="10%" r="80%">
          <stop offset="0%" stopColor="oklch(0.32 0.1 255)" />
          <stop offset="30%" stopColor="oklch(0.22 0.07 260)" />
          <stop offset="100%" stopColor="var(--space)" />
        </radialGradient>
        <filter id={`${id}-glow`} x="-10%" y="-200%" width="120%" height="500%">
          <feGaussianBlur stdDeviation="12" />
        </filter>
      </defs>

      <g fill="oklch(0.95 0.02 250)">
        {stars.map(([x, y, r, o]) => (
          <circle key={`${x}-${y}`} cx={x} cy={y} r={r} opacity={o} />
        ))}
      </g>

      <path d={`${rim} Z`} fill={`url(#${id}-planet)`} />

      <g fill="oklch(0.85 0.14 75)" opacity="0.55">
        {cityLights.map(([x, y, r]) => (
          <circle key={`${x}-${y}`} cx={x} cy={y} r={r} />
        ))}
      </g>

      <g className="motion-safe:animate-[limb-breathe_1400ms_var(--ease-out)_both]">
        {/* Airglow band: wide, soft, in the status color. */}
        <path d={rim} fill="none" stroke={color} strokeWidth="34" opacity="0.22" filter={`url(#${id}-glow)`} />
        <path d={rim} fill="none" stroke={color} strokeWidth="10" opacity="0.5" filter={`url(#${id}-glow)`} />
        {/* Crisp rim line. */}
        <path d={rim} fill="none" stroke={color} strokeWidth="2.2" />
      </g>
    </svg>
  );
}
