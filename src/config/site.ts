/**
 * Global site information: product name, tagline and the permanent
 * disclaimer required by business rule RN-19.
 */
export const siteConfig = {
  name: "Atlas",
  tagline: "Health monitoring and self-assessment for astronauts on long missions",
  challenge:
    "NASA Space Apps Challenge 2026 · Create Health Monitoring Software for Astronauts on Space Missions",
  /** RN-19 (English translation): must be visible on every screen. */
  disclaimer: "Demonstration prototype. Not a medical device.",
} as const;
