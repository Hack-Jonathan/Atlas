/**
 * Shared types that describe the pages of Atlas (spec section 0.5).
 * They are used by the navigation config, the sidebar and the page placeholders.
 */
import type { LucideIcon } from "lucide-react";

/** People who use Atlas (spec Part 1, section 3). */
export type UserRole = "visitor" | "astronaut" | "flight-surgeon";

/** The eight consolidated modules of the system (spec Part 2). */
export type ModuleCode =
  | "M01"
  | "M02"
  | "M03"
  | "M04"
  | "M05"
  | "M06"
  | "M07"
  | "M08";

/** Development stages listed in spec section 0.6 (1 = environment setup … 7 = polish). */
export type DevelopmentStage = 1 | 2 | 3 | 4 | 5 | 6 | 7;

/** Everything Atlas needs to know about one page/route. */
export interface RouteInfo {
  /** URL path. Dynamic segments use Next.js notation, e.g. `/indicator/[code]`. */
  href: string;
  /** Short English label shown in the UI. */
  label: string;
  /** One-line purpose of the page, taken from the module catalog. */
  summary: string;
  /** Module that owns the page. */
  module: ModuleCode;
  /** Stage that will implement the page, or `null` when the team has not scheduled it yet. */
  stage: DevelopmentStage | null;
  /** Who uses the page. */
  roles: readonly UserRole[];
  /** Icon shown next to the label (never color-only, RNF-03). */
  icon: LucideIcon;
}
