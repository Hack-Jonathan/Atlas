/**
 * Single source of truth for every Atlas page (spec section 0.5, English routes).
 * The sidebar, the page placeholders and the tests all read from here,
 * so a route is added or renamed in exactly one place.
 */
import {
  Activity,
  BookOpen,
  Bot,
  ClipboardCheck,
  Gauge,
  LogIn,
  Rocket,
  Satellite,
  Settings,
  Siren,
  Stethoscope,
  TrendingUp,
} from "lucide-react";

import type { RouteInfo, UserRole } from "@/types/navigation";

/** Human-readable English name of each user role. */
export const roleLabels: Record<UserRole, string> = {
  visitor: "Visitor",
  astronaut: "Astronaut",
  "flight-surgeon": "Flight surgeon",
};

/** All routes of the app, keyed by a stable id. */
export const routes = {
  home: {
    href: "/",
    label: "Home",
    summary: "Public presentation of Atlas.",
    module: "M01",
    stage: null,
    roles: ["visitor"],
    icon: Rocket,
  },
  login: {
    href: "/login",
    label: "Sign in",
    summary: "Access for astronauts and flight surgeons.",
    module: "M01",
    stage: null,
    roles: ["visitor", "astronaut", "flight-surgeon"],
    icon: LogIn,
  },
  dashboard: {
    href: "/dashboard",
    label: "Dashboard",
    summary: "Main panel with the body map and current status.",
    module: "M02",
    stage: 3,
    roles: ["astronaut"],
    icon: Gauge,
  },
  checkup: {
    href: "/checkup",
    label: "Check-up",
    summary: "Step-by-step self-assessment routine.",
    module: "M03",
    stage: 3,
    roles: ["astronaut"],
    icon: ClipboardCheck,
  },
  trends: {
    href: "/trends",
    label: "Trends",
    summary: "Measurements compared with the personal baseline.",
    module: "M04",
    stage: 3,
    roles: ["astronaut", "flight-surgeon"],
    icon: TrendingUp,
  },
  indicator: {
    href: "/indicator/[code]",
    label: "Indicator",
    summary: "Detail sheet of a single indicator.",
    module: "M04",
    stage: 3,
    roles: ["astronaut", "flight-surgeon"],
    icon: Activity,
  },
  incident: {
    href: "/incident",
    label: "Incident mode",
    summary: "Sequential steps for documented acute situations.",
    module: "M05",
    stage: 5,
    roles: ["astronaut"],
    icon: Siren,
  },
  communications: {
    href: "/communications",
    label: "Communications",
    summary: "Ship–ground messages with simulated delay.",
    module: "M06",
    stage: 4,
    roles: ["astronaut"],
    icon: Satellite,
  },
  ground: {
    href: "/ground",
    label: "Ground console",
    summary: "Prioritized console for the flight surgeon.",
    module: "M06",
    stage: 4,
    roles: ["flight-surgeon"],
    icon: Stethoscope,
  },
  assistant: {
    href: "/assistant",
    label: "Assistant",
    summary: "Explains results using the user's data and the verified library.",
    module: "M07",
    stage: 6,
    roles: ["astronaut", "flight-surgeon"],
    icon: Bot,
  },
  library: {
    href: "/library",
    label: "Library",
    summary: "Verified scientific articles.",
    module: "M07",
    stage: 6,
    roles: ["astronaut", "flight-surgeon"],
    icon: BookOpen,
  },
  settings: {
    href: "/settings",
    label: "Settings",
    summary: "Configuration and demo control.",
    module: "M08",
    stage: 7,
    roles: ["astronaut", "flight-surgeon"],
    icon: Settings,
  },
} as const satisfies Record<string, RouteInfo>;

/** Stable route id, e.g. `"dashboard"`. */
export type RouteId = keyof typeof routes;

/**
 * The only four links in the astronaut's main menu, in display order.
 * Incident mode and Settings have their own fixed controls; Trends and
 * Library are reached from the dashboard; the Ground console is the
 * flight surgeon's separate area.
 */
export const crewNavItems: readonly RouteInfo[] = [
  routes.dashboard,
  routes.checkup,
  routes.communications,
  routes.assistant,
];

/**
 * Builds the real URL of an indicator sheet.
 * @param code Indicator code; it is URL-encoded so any value is safe.
 */
export function indicatorHref(code: string): string {
  return `/indicator/${encodeURIComponent(code)}`;
}

/**
 * Tells whether a sidebar link should look active for the current path.
 * Matches the exact path or any nested path (e.g. `/trends/...`).
 */
export function isActivePath(itemHref: string, pathname: string): boolean {
  return pathname === itemHref || pathname.startsWith(`${itemHref}/`);
}
