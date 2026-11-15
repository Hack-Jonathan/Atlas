/**
 * Public entry point of the rules engine (pure, shared by the seed generator
 * now and by the check-up UI in Stage 3).
 */
export { computeBaseline, MIN_BASELINE_SAMPLES } from "@/lib/rules/baseline";
export type { ComputedBaseline } from "@/lib/rules/baseline";
export { classifyMeasurement, deviationPercent, worstOf } from "@/lib/rules/classify";
export { detectTrend } from "@/lib/rules/trend";
export type { TrendResult } from "@/lib/rules/trend";
export type { Baseline, Classification, IndicatorRules } from "@/lib/rules/types";
export { validateValue } from "@/lib/rules/validate";
export type { ValidationResult } from "@/lib/rules/validate";
