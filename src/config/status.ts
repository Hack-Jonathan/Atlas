/**
 * How each status level is presented: a word, an icon (shape) and a color token.
 * Status never depends on color alone (RNF-03), so every level has all three.
 */
import { CircleCheck, CircleDashed, OctagonAlert, TriangleAlert, type LucideIcon } from "lucide-react";

import type { StatusLevel } from "@/types/status";

export interface StatusPresentation {
  /** Short word shown next to the icon. */
  label: string;
  /** Icon whose shape differs per level. */
  icon: LucideIcon;
  /** Tailwind text color class for the icon and accents. */
  textClass: string;
  /** CSS variable holding the level color (used by the Earth limb). */
  colorVar: string;
}

export const statusPresentation: Record<StatusLevel, StatusPresentation> = {
  ok: {
    label: "Steady",
    icon: CircleCheck,
    textClass: "text-status-ok",
    colorVar: "var(--status-ok)",
  },
  watch: {
    label: "Watch",
    icon: TriangleAlert,
    textClass: "text-status-watch",
    colorVar: "var(--status-watch)",
  },
  alert: {
    label: "Alert",
    icon: OctagonAlert,
    textClass: "text-status-alert",
    colorVar: "var(--status-alert)",
  },
  unknown: {
    label: "No data yet",
    icon: CircleDashed,
    textClass: "text-status-unknown",
    colorVar: "var(--status-unknown)",
  },
};
