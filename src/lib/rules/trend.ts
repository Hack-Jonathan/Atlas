/**
 * RN-06: a trend alert fires when the last `trendReadings` readings all exceed
 * the yellow deviation from baseline in the SAME direction.
 */
import { deviationPercent } from "@/lib/rules/classify";
import type { Baseline, IndicatorRules } from "@/lib/rules/types";

export interface TrendResult {
  direction: "above" | "below";
  readings: number;
  message: string;
}

/**
 * @param recentValues readings ordered oldest → newest (only the last N are used).
 * @returns the trend, or null when there is none.
 */
export function detectTrend(
  indicator: IndicatorRules,
  recentValues: readonly number[],
  baseline: Baseline | null | undefined,
): TrendResult | null {
  const n = indicator.trendReadings;
  const threshold = indicator.yellowDeviationPct;
  if (!baseline || threshold === null || n < 1 || recentValues.length < n) return null;

  const deviations = recentValues.slice(-n).map((v) => deviationPercent(v, baseline.referenceValue));
  if (deviations.some((d) => d === null)) return null;

  const devs = deviations as number[];
  const allAbove = devs.every((d) => d >= threshold);
  const allBelow = devs.every((d) => d <= -threshold);
  if (!allAbove && !allBelow) return null;

  const direction = allAbove ? "above" : "below";
  return {
    direction,
    readings: n,
    message: `Last ${n} ${indicator.code.replace(/_/g, " ")} readings are ${direction} your baseline by at least ${threshold}%.`,
  };
}
