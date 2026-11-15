/**
 * Input and output types of the rules engine (pure functions, no I/O).
 * `IndicatorRules` is the subset of an `indicator` row the engine needs.
 */
import type { TrafficLight } from "@/lib/db/enums";

export interface IndicatorRules {
  /** Indicator code, used in messages. */
  code: string;
  /** Human-readable unit, used in messages (e.g. "bpm"). */
  unit: string;
  /** Physically plausible range (RN-07). */
  validMin: number;
  validMax: number;
  /** Green band (demonstration values, RN-02). */
  normalMin: number | null;
  normalMax: number | null;
  /** Below / above these values the reading is red. */
  alertMin: number | null;
  alertMax: number | null;
  /** Deviation from the personal baseline, in percent, for yellow / red. */
  yellowDeviationPct: number | null;
  redDeviationPct: number | null;
  /** Consecutive readings needed for a trend alert (RN-06, default 3). */
  trendReadings: number;
}

/** Personal baseline for one indicator (RN-05). */
export interface Baseline {
  referenceValue: number;
}

export interface Classification {
  trafficLight: TrafficLight;
  /** Signed deviation from baseline in percent; null when no baseline applies. */
  deviationPct: number | null;
  /** Plain-English explanation of which rule set the color (always present, RN-04). */
  reason: string;
}
