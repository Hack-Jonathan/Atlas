/**
 * RN-05: a personal baseline needs at least 5 prior readings.
 * Returns the mean, the sample standard deviation and the sample count.
 */
export const MIN_BASELINE_SAMPLES = 5;

export interface ComputedBaseline {
  referenceValue: number;
  stdDev: number;
  sampleCount: number;
}

/** @throws Error when fewer than 5 finite values are given. */
export function computeBaseline(values: readonly number[]): ComputedBaseline {
  const clean = values.filter(Number.isFinite);
  if (clean.length < MIN_BASELINE_SAMPLES) {
    throw new Error(
      `A baseline needs at least ${MIN_BASELINE_SAMPLES} readings; got ${clean.length}.`,
    );
  }
  const n = clean.length;
  const mean = clean.reduce((a, b) => a + b, 0) / n;
  const variance = clean.reduce((acc, v) => acc + (v - mean) ** 2, 0) / (n - 1);
  const round2 = (x: number) => Math.round(x * 100) / 100;
  return { referenceValue: round2(mean), stdDev: round2(Math.sqrt(variance)), sampleCount: n };
}
