/**
 * Generates the simulated 75-day history of the demo astronaut (spec RF-48).
 * Pure and deterministic: same input → same output. Every traffic light,
 * deviation, reason and alert comes from the real rules engine (src/lib/rules),
 * the same code the Stage 3 check-up will use.
 *
 * Timeline (days ago):
 *  75…66  preparation (pre-flight): daily check-ups → personal baselines (RN-05)
 *  65…1   outbound_transit: daily check-ups, cabin radiation telemetry,
 *         monthly bone and eye exams, plus scripted, explainable events:
 *           · day 30  blood pressure above range (yellow, already attended)
 *           · day 20  solar-storm radiation spike (red → critical_alert message)
 *           · days 4…1 sleep drifting down → yellow readings + trend alert (active)
 *  now    one message still in transit (RN-09 demo)
 */
import type { MissionPhase, TrafficLight } from "@/lib/db/enums";
import { createPrng } from "@/lib/demo/prng";
import { classifyMeasurement, computeBaseline, detectTrend, worstOf } from "@/lib/rules";
import type { Baseline, IndicatorRules } from "@/lib/rules";

/** When something happened, relative to the moment the seed is applied. */
export type TimeRef =
  | { kind: "day"; daysAgo: number; minute: number }
  | { kind: "now"; secondsAgo: number };

/** Indicator data the generator needs (read from the seeded catalog). */
export interface IndicatorInput extends IndicatorRules {
  isSelfAssessed: boolean;
}

export interface GeneratedHistory {
  baselines: { id: string; indicatorCode: string; referenceValue: number; stdDev: number; sampleCount: number; at: TimeRef }[];
  checkups: { id: string; startedAt: TimeRef; completedAt: TimeRef | null; status: "completed" | "abandoned"; overallResult: TrafficLight | null }[];
  measurements: { id: string; indicatorCode: string; checkupId: string | null; value: number; at: TimeRef; phase: MissionPhase; origin: "manual" | "simulated"; trafficLight: TrafficLight; deviationPct: number | null; reason: string }[];
  alerts: { id: string; indicatorCode: string; measurementId: string | null; type: "value" | "trend"; level: "yellow" | "red"; message: string; status: "active" | "attended"; at: TimeRef; attendedAt: TimeRef | null }[];
  messages: { id: string; fromAstronaut: boolean; type: "message" | "checkup_report" | "critical_alert" | "reply"; priority: "normal" | "high" | "urgent"; subject: string; body: string; checkupId: string | null; alertId: string | null; replyToId: string | null; sentAt: TimeRef; read: boolean }[];
}

export const HISTORY_SEED = 20261115;
const PREP_FIRST_DAY = 75;
const PREP_LAST_DAY = 66;
const ABANDONED_DAYS = new Set([47, 23]);
const SKIPPED_DAYS = new Set([52, 12]);

/** The astronaut's simulated "true" values: [mean, sd] per indicator. */
const PERSONAL: Record<string, [number, number]> = {
  heart_rate: [64, 3],
  systolic_pressure: [116, 3.5],
  diastolic_pressure: [74, 2.5],
  temperature: [36.6, 0.12],
  glucose: [92, 4],
  sleep_hours: [7.2, 0.3],
  mood: [4.3, 0.4],
};

/** Order of the daily check-up (cardiovascular first, as in RF-08). */
const CHECKUP_ORDER = ["heart_rate", "systolic_pressure", "diastolic_pressure", "temperature", "glucose", "sleep_hours", "mood"];

const day = (daysAgo: number, minute: number): TimeRef => ({ kind: "day", daysAgo, minute });

function roundFor(code: string, v: number): number {
  if (code === "mood") return Math.max(1, Math.min(5, Math.round(v)));
  if (code === "temperature") return Math.round(v * 10) / 10;
  if (code === "sleep_hours" || code === "bone_density") return Math.round(v * 10) / 10;
  return Math.round(v);
}

const LABEL: Record<string, string> = {
  heart_rate: "heart rate",
  systolic_pressure: "systolic blood pressure",
  diastolic_pressure: "diastolic blood pressure",
  temperature: "body temperature",
  glucose: "blood glucose",
  sleep_hours: "sleep duration",
  mood: "mood",
  bone_density: "bone density change",
  eye_exam: "eye exam index",
  radiation_dose: "radiation dose",
};

export function generateHistory(indicators: readonly IndicatorInput[]): GeneratedHistory {
  const rng = createPrng(HISTORY_SEED);
  const byCode = new Map(indicators.map((i) => [i.code, i]));
  const ind = (code: string): IndicatorInput => {
    const found = byCode.get(code);
    if (!found) throw new Error(`Indicator ${code} missing from catalog`);
    return found;
  };

  const out: GeneratedHistory = { baselines: [], checkups: [], measurements: [], alerts: [], messages: [] };
  const baselines = new Map<string, Baseline>();
  const recent = new Map<string, number[]>(); // values since baseline, per indicator
  const activeTrend = new Set<string>();

  /** Adds a classified measurement and any value/trend alert it triggers. */
  function addMeasurement(code: string, value: number, at: TimeRef, phase: MissionPhase, checkupId: string | null) {
    const indicator = ind(code);
    const baseline = baselines.get(code) ?? null;
    const c = classifyMeasurement(indicator, value, baseline);
    const id = rng.uuid();
    out.measurements.push({
      id, indicatorCode: code, checkupId, value, at, phase,
      origin: indicator.isSelfAssessed ? "manual" : "simulated",
      trafficLight: c.trafficLight, deviationPct: c.deviationPct, reason: c.reason,
    });

    const daysAgo = at.kind === "day" ? at.daysAgo : 0;
    const recentEnough = daysAgo <= 5;
    if (c.trafficLight !== "green") {
      out.alerts.push({
        id: rng.uuid(), indicatorCode: code, measurementId: id, type: "value",
        level: c.trafficLight, message: `${LABEL[code][0].toUpperCase()}${LABEL[code].slice(1)}: ${c.reason}`,
        status: recentEnough ? "active" : "attended", at,
        attendedAt: recentEnough ? null : day(Math.max(daysAgo - 1, 0), 9 * 60),
      });
    }

    if (baseline) {
      const values = [...(recent.get(code) ?? []), value];
      recent.set(code, values);
      const trend = detectTrend(indicator, values, baseline);
      if (trend && !activeTrend.has(code)) {
        activeTrend.add(code);
        out.alerts.push({
          id: rng.uuid(), indicatorCode: code, measurementId: id, type: "trend", level: "yellow",
          message: trend.message, status: recentEnough ? "active" : "attended", at,
          attendedAt: recentEnough ? null : day(Math.max(daysAgo - 1, 0), 9 * 60),
        });
      } else if (!trend) {
        activeTrend.delete(code);
      }
    }
    return { id, light: c.trafficLight };
  }

  /** Scripted values for specific days; otherwise drawn around PERSONAL. */
  function valueFor(code: string, daysAgo: number): number {
    if (code === "systolic_pressure" && daysAgo === 30) return 138;
    if (code === "diastolic_pressure" && daysAgo === 30) return 88;
    if (code === "sleep_hours" && daysAgo <= 4) return [5.3, 5.1, 4.9, 5.0][4 - daysAgo];
    if (code === "mood" && daysAgo <= 2) return 3;
    const [mean, sd] = PERSONAL[code];
    const transitShift = code === "sleep_hours" && daysAgo <= PREP_LAST_DAY - 1 ? -0.3 : 0;
    return roundFor(code, rng.normal(mean + transitShift, sd));
  }

  for (let daysAgo = PREP_FIRST_DAY; daysAgo >= 1; daysAgo--) {
    const phase: MissionPhase = daysAgo >= PREP_LAST_DAY ? "preparation" : "outbound_transit";

    // Personal baselines are fixed the morning transit starts (RN-05: ≥5 pre-flight samples).
    if (daysAgo === PREP_LAST_DAY - 1) {
      for (const code of CHECKUP_ORDER) {
        const values = out.measurements.filter((m) => m.indicatorCode === code).map((m) => m.value);
        const b = computeBaseline(values);
        baselines.set(code, { referenceValue: b.referenceValue });
        out.baselines.push({ id: rng.uuid(), indicatorCode: code, ...b, at: day(daysAgo, 6 * 60) });
      }
    }

    // --- Daily check-up ---------------------------------------------------
    if (!SKIPPED_DAYS.has(daysAgo)) {
      const abandoned = ABANDONED_DAYS.has(daysAgo);
      const checkupId = rng.uuid();
      const start = 7 * 60 + 30;
      const codes = abandoned ? CHECKUP_ORDER.slice(0, 3) : CHECKUP_ORDER;
      let worst: TrafficLight = "green";
      for (const [i, code] of codes.entries()) {
        const r = addMeasurement(code, valueFor(code, daysAgo), day(daysAgo, start + i), phase, checkupId);
        worst = worstOf(worst, r.light);
      }
      const end = day(daysAgo, start + codes.length + 1);
      out.checkups.push({
        id: checkupId, startedAt: day(daysAgo, start), completedAt: abandoned ? null : end,
        status: abandoned ? "abandoned" : "completed", overallResult: abandoned ? null : worst,
      });

      // RN-08: completed check-ups send an automatic report; priority from the worst result.
      if (!abandoned) {
        const priority = worst === "red" ? "urgent" : worst === "yellow" ? "high" : "normal";
        const reportId = rng.uuid();
        out.messages.push({
          id: reportId, fromAstronaut: true, type: "checkup_report", priority,
          subject: `Daily check-up · ${worst === "green" ? "all steady" : worst === "yellow" ? "needs a look" : "urgent"}`,
          body: worst === "green"
            ? "Automatic report: all values within the usual range."
            : "Automatic report: at least one value outside the usual range. See the linked check-up.",
          checkupId, alertId: null, replyToId: null, sentAt: end, read: daysAgo > 1,
        });
        if (daysAgo === 30) {
          out.messages.push({
            id: rng.uuid(), fromAstronaut: false, type: "reply", priority: "normal",
            subject: "Re: Daily check-up · needs a look",
            body: "Thanks for the report. Please repeat the blood pressure reading after rest tomorrow and include it in your check-up.",
            checkupId, alertId: null, replyToId: reportId, sentAt: day(29, 6 * 60), read: true,
          });
        }
      }
    }

    // --- Simulated telemetry and exams (RN-03: never in the daily form) ------
    if (phase === "outbound_transit") {
      const dose = daysAgo === 20 ? 1450 : daysAgo === 19 ? 420 : roundFor("radiation_dose", rng.normal(215, 25));
      const r = addMeasurement("radiation_dose", dose, day(daysAgo, 23 * 60 + 55), phase, null);
      if (daysAgo === 20) {
        const alert = out.alerts.findLast((a) => a.measurementId === r.id && a.type === "value");
        if (alert) {
          out.messages.push({
            id: rng.uuid(), fromAstronaut: true, type: "critical_alert", priority: "urgent",
            subject: "Critical alert · radiation dose",
            body: `Automatic alert: ${alert.message}`,
            checkupId: null, alertId: alert.id, replyToId: null, sentAt: day(20, 23 * 60 + 56), read: true,
          });
        }
      }
    }
    if (daysAgo === 70 || daysAgo === 40 || daysAgo === 10) {
      const v = daysAgo === 70 ? 12 : daysAgo === 40 ? 18 : 24;
      addMeasurement("eye_exam", v, day(daysAgo, 14 * 60), phase, null);
    }
    if (daysAgo === 60 || daysAgo === 30) {
      addMeasurement("bone_density", daysAgo === 60 ? -0.9 : -1.3, day(daysAgo, 15 * 60), phase, null);
    }
  }

  // RN-09 demo: one message still travelling to Earth when the seed is applied.
  out.messages.push({
    id: rng.uuid(), fromAstronaut: true, type: "message", priority: "normal",
    subject: "Sleep the last few nights",
    body: "Sleep has been shorter than usual the last few nights. Can we review my work schedule?",
    checkupId: null, alertId: null, replyToId: null, sentAt: { kind: "now", secondsAgo: 0 }, read: false,
  });

  return out;
}
