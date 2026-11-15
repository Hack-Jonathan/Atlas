/**
 * Builds the seed-03 SQL text: loads the catalog (migrations + seeds 01–02)
 * into a local PGlite database, reads the indicators, generates the history and
 * renders it. Shared by the CLI script and the determinism test.
 */
import { basename } from "node:path";

import { generateHistory, type IndicatorInput } from "../../src/lib/demo/history";
import { historyToSql } from "../../src/lib/demo/to-sql";
import { createLocalDb, DEMO } from "./local-db";

interface IndicatorRow {
  id: string;
  code: string;
  unit: string;
  is_self_assessed: boolean;
  valid_min: string | number;
  valid_max: string | number;
  normal_min: string | number | null;
  normal_max: string | number | null;
  alert_min: string | number | null;
  alert_max: string | number | null;
  yellow_deviation_pct: string | number | null;
  red_deviation_pct: string | number | null;
  trend_readings: number;
}

const toNum = (v: string | number | null): number | null => (v === null ? null : Number(v));

/** Generates the SQL for supabase/seed/03_history.sql. */
export async function buildHistorySql(): Promise<string> {
  // Only the catalog and demo accounts are needed; never read the old history file.
  const db = await createLocalDb((file) => !basename(file).startsWith("03_"));
  try {
    const { rows } = await db.query<IndicatorRow>("select * from public.indicator order by code");
    const indicators: IndicatorInput[] = rows.map((r) => ({
      code: r.code,
      unit: r.unit,
      isSelfAssessed: r.is_self_assessed,
      validMin: Number(r.valid_min),
      validMax: Number(r.valid_max),
      normalMin: toNum(r.normal_min),
      normalMax: toNum(r.normal_max),
      alertMin: toNum(r.alert_min),
      alertMax: toNum(r.alert_max),
      yellowDeviationPct: toNum(r.yellow_deviation_pct),
      redDeviationPct: toNum(r.red_deviation_pct),
      trendReadings: r.trend_readings,
    }));
    return historyToSql(generateHistory(indicators), {
      missionId: DEMO.mission,
      astronautId: DEMO.astronaut,
      surgeonId: DEMO.surgeon,
    });
  } finally {
    await db.close();
  }
}
