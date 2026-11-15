/**
 * Rules engine (spec RN-04 … RN-07): classification, trend, baseline, validation.
 */
import { describe, expect, it } from "vitest";

import { classifyMeasurement, computeBaseline, detectTrend, validateValue } from "@/lib/rules";
import type { IndicatorRules } from "@/lib/rules";

/** Heart-rate-like demo indicator. */
const hr: IndicatorRules = {
  code: "heart_rate",
  unit: "bpm",
  validMin: 20,
  validMax: 250,
  normalMin: 50,
  normalMax: 100,
  alertMin: 40,
  alertMax: 130,
  yellowDeviationPct: 15,
  redDeviationPct: 30,
  trendReadings: 3,
};

describe("classifyMeasurement · range only (no baseline, RN-05)", () => {
  it("green inside the normal band", () => {
    const c = classifyMeasurement(hr, 70);
    expect(c.trafficLight).toBe("green");
    expect(c.deviationPct).toBeNull();
  });
  it("yellow outside normal but inside alert limits", () => {
    expect(classifyMeasurement(hr, 110).trafficLight).toBe("yellow");
    expect(classifyMeasurement(hr, 45).trafficLight).toBe("yellow");
  });
  it("red beyond alert limits, with a reason", () => {
    const c = classifyMeasurement(hr, 135);
    expect(c.trafficLight).toBe("red");
    expect(c.reason).toMatch(/above the red limit/);
  });
});

describe("classifyMeasurement · baseline", () => {
  it("20% above baseline turns yellow even when the range is green (R4)", () => {
    const c = classifyMeasurement(hr, 84, { referenceValue: 70 });
    expect(c.trafficLight).toBe("yellow");
    expect(c.deviationPct).toBe(20);
    expect(c.reason).toMatch(/20% above your baseline/);
  });
  it("signed deviation below baseline", () => {
    const c = classifyMeasurement(hr, 56, { referenceValue: 80 });
    expect(c.deviationPct).toBe(-30);
    expect(c.trafficLight).toBe("red");
  });
  it("keeps the most severe of range and baseline (RN-04)", () => {
    // Range says red (135 > 130); baseline says green (+3.8%).
    const c = classifyMeasurement(hr, 135, { referenceValue: 130 });
    expect(c.trafficLight).toBe("red");
    expect(c.reason).toMatch(/red limit/);
  });
  it("skips the baseline criterion when the reference is 0 (R4)", () => {
    const c = classifyMeasurement(hr, 70, { referenceValue: 0 });
    expect(c.trafficLight).toBe("green");
    expect(c.deviationPct).toBeNull();
    expect(c.reason).toMatch(/baseline is 0/);
  });
  it("ignores baselines for indicators without deviation thresholds", () => {
    const radiation: IndicatorRules = { ...hr, yellowDeviationPct: null, redDeviationPct: null };
    expect(classifyMeasurement(radiation, 70, { referenceValue: 10 }).deviationPct).toBeNull();
  });
});

describe("detectTrend (RN-06)", () => {
  const base = { referenceValue: 100 };
  it("fires when the last 3 readings all exceed the yellow deviation in the same direction", () => {
    const t = detectTrend(hr, [100, 120, 118, 121], base);
    expect(t?.direction).toBe("above");
  });
  it("does not fire when directions are mixed", () => {
    expect(detectTrend(hr, [120, 80, 121], base)).toBeNull();
  });
  it("does not fire with fewer readings than required or without baseline", () => {
    expect(detectTrend(hr, [120, 121], base)).toBeNull();
    expect(detectTrend(hr, [120, 121, 122], null)).toBeNull();
  });
});

describe("computeBaseline (RN-05)", () => {
  it("returns mean, std dev and count with ≥5 samples", () => {
    const b = computeBaseline([60, 62, 64, 66, 68]);
    expect(b).toEqual({ referenceValue: 64, stdDev: 3.16, sampleCount: 5 });
  });
  it("rejects fewer than 5 samples", () => {
    expect(() => computeBaseline([60, 62, 64, 66])).toThrow(/at least 5/);
  });
});

describe("validateValue (RN-07)", () => {
  it("accepts plausible values and rejects others with a clear message", () => {
    expect(validateValue(hr, 72)).toEqual({ ok: true });
    const bad = validateValue(hr, 400);
    expect(bad.ok).toBe(false);
    if (!bad.ok) expect(bad.message).toMatch(/between 20 and 250 bpm/);
    expect(validateValue(hr, Number.NaN).ok).toBe(false);
  });
});
