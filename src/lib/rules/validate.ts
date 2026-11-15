/**
 * RN-07: reject values outside the physically plausible range of an indicator.
 */
import type { IndicatorRules } from "@/lib/rules/types";

export type ValidationResult = { ok: true } | { ok: false; message: string };

/** Checks that `value` is a finite number inside `[validMin, validMax]`. */
export function validateValue(indicator: IndicatorRules, value: number): ValidationResult {
  if (!Number.isFinite(value)) {
    return { ok: false, message: "Enter a number." };
  }
  if (value < indicator.validMin || value > indicator.validMax) {
    return {
      ok: false,
      message: `Value ${value} ${indicator.unit} is not physically plausible. Expected between ${indicator.validMin} and ${indicator.validMax} ${indicator.unit}.`,
    };
  }
  return { ok: true };
}
