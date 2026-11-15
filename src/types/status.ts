/**
 * Health status levels used across Atlas (the spec's traffic light,
 * "semáforo": green / yellow / red), plus "unknown" when there is no data yet.
 */
export type StatusLevel = "ok" | "watch" | "alert" | "unknown";
