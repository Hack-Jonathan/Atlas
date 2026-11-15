/**
 * The traffic-light classifier (spec RN-01, RN-04, RN-05).
 * Only this engine assigns green / yellow / red; the AI never does (RN-01).
 *
 * Two criteria, the most severe wins (RN-04):
 *  - range:    red outside [alertMin, alertMax]; yellow outside [normalMin, normalMax].
 *  - baseline: |deviation %| from the personal baseline vs. yellow / red thresholds.
 * Without a baseline (or with a zero reference) only the range applies (RN-05).
 */
import type { TrafficLight } from "@/lib/db/enums";
import type { Baseline, Classification, IndicatorRules } from "@/lib/rules/types";

const severity: Record<TrafficLight, number> = { green: 0, yellow: 1, red: 2 };

/** Returns the more severe of two traffic lights. */
export function worstOf(a: TrafficLight, b: TrafficLight): TrafficLight {
  return severity[a] >= severity[b] ? a : b;
}

/** Signed deviation in percent from a reference; null when the reference is 0. */
export function deviationPercent(value: number, reference: number): number | null {
  if (reference === 0) return null;
  return (100 * (value - reference)) / Math.abs(reference);
}

/** Rounds to one decimal for storage and messages. */
function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

function classifyByRange(ind: IndicatorRules, value: number): { light: TrafficLight; reason: string } {
  const u = ind.unit;
  if (ind.alertMin !== null && value < ind.alertMin) {
    return { light: "red", reason: `${value} ${u} is below the red limit of ${ind.alertMin} ${u}` };
  }
  if (ind.alertMax !== null && value > ind.alertMax) {
    return { light: "red", reason: `${value} ${u} is above the red limit of ${ind.alertMax} ${u}` };
  }
  if (ind.normalMin !== null && value < ind.normalMin) {
    return { light: "yellow", reason: `${value} ${u} is below the normal range (${ind.normalMin}–${ind.normalMax ?? "…"} ${u})` };
  }
  if (ind.normalMax !== null && value > ind.normalMax) {
    return { light: "yellow", reason: `${value} ${u} is above the normal range (${ind.normalMin ?? "…"}–${ind.normalMax} ${u})` };
  }
  return { light: "green", reason: `${value} ${u} is within the normal range` };
}

function classifyByBaseline(
  ind: IndicatorRules,
  deviation: number,
): { light: TrafficLight; reason: string } {
  const abs = Math.abs(deviation);
  const dir = deviation >= 0 ? "above" : "below";
  const shown = `${round1(abs)}% ${dir} your baseline`;
  if (ind.redDeviationPct !== null && abs >= ind.redDeviationPct) {
    return { light: "red", reason: `${shown} (red at ${ind.redDeviationPct}%)` };
  }
  if (ind.yellowDeviationPct !== null && abs >= ind.yellowDeviationPct) {
    return { light: "yellow", reason: `${shown} (yellow at ${ind.yellowDeviationPct}%)` };
  }
  return { light: "green", reason: `${shown}, within your usual variation` };
}

/**
 * Classifies one measurement. The caller must validate the value first (RN-07).
 * @param baseline personal baseline, or null/undefined when none exists.
 */
export function classifyMeasurement(
  indicator: IndicatorRules,
  value: number,
  baseline?: Baseline | null,
): Classification {
  const range = classifyByRange(indicator, value);

  const usesBaseline =
    baseline != null && (indicator.yellowDeviationPct !== null || indicator.redDeviationPct !== null);
  const deviation = usesBaseline ? deviationPercent(value, baseline.referenceValue) : null;

  if (deviation === null) {
    const note =
      usesBaseline && baseline.referenceValue === 0 ? " (baseline is 0, so only the range was used)" : "";
    return { trafficLight: range.light, deviationPct: null, reason: `${range.reason}${note}.` };
  }

  const base = classifyByBaseline(indicator, deviation);
  const trafficLight = worstOf(range.light, base.light);
  // Explain the criterion that decided the color; mention both when they agree.
  const reason =
    severity[range.light] > severity[base.light]
      ? range.reason
      : severity[base.light] > severity[range.light]
        ? base.reason
        : `${range.reason}; ${base.reason}`;

  return { trafficLight, deviationPct: round1(deviation), reason: `${reason}.` };
}
