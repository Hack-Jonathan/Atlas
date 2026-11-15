/**
 * Checks the navigation config against spec section 0.5 (English routes).
 */
import { describe, expect, it } from "vitest";

import { crewNavItems, indicatorHref, isActivePath, routes } from "@/config/navigation";

/** The 12 routes agreed for Stage 1 (spec 0.5 mapped to English). */
const expectedHrefs = [
  "/",
  "/login",
  "/dashboard",
  "/checkup",
  "/trends",
  "/indicator/[code]",
  "/incident",
  "/communications",
  "/ground",
  "/assistant",
  "/library",
  "/settings",
];

describe("routes", () => {
  const allRoutes = Object.values(routes);

  it("contains exactly the agreed routes", () => {
    expect(allRoutes.map((r) => r.href).sort()).toEqual([...expectedHrefs].sort());
  });

  it("has unique paths", () => {
    const hrefs = allRoutes.map((r) => r.href);
    expect(new Set(hrefs).size).toBe(hrefs.length);
  });

  it("gives every route a label, summary and at least one role", () => {
    for (const route of allRoutes) {
      expect(route.label.length).toBeGreaterThan(0);
      expect(route.summary.length).toBeGreaterThan(0);
      expect(route.roles.length).toBeGreaterThan(0);
    }
  });
});

describe("crewNavItems", () => {
  it("has exactly the four approved astronaut links", () => {
    expect(crewNavItems.map((i) => i.href)).toEqual([
      routes.dashboard.href,
      routes.checkup.href,
      routes.communications.href,
      routes.assistant.href,
    ]);
  });

  it("keeps incident, settings and the ground console out of the menu", () => {
    const hrefs = crewNavItems.map((i) => i.href);
    for (const href of [routes.incident.href, routes.settings.href, routes.ground.href]) {
      expect(hrefs).not.toContain(href);
    }
  });
});

describe("helpers", () => {
  it("indicatorHref encodes the code", () => {
    expect(indicatorHref("heart rate")).toBe("/indicator/heart%20rate");
  });

  it("isActivePath matches exact and nested paths only", () => {
    expect(isActivePath("/trends", "/trends")).toBe(true);
    expect(isActivePath("/trends", "/trends/week")).toBe(true);
    expect(isActivePath("/trends", "/trendsx")).toBe(false);
    expect(isActivePath("/trends", "/dashboard")).toBe(false);
  });
});
