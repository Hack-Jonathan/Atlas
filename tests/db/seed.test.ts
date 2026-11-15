/**
 * Seed content: catalog completeness and traceability (RN-02, RN-18),
 * demo accounts, baselines, history span, scripted events, and that the
 * committed history file equals the generator output (determinism).
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { beforeAll, describe, expect, it } from "vitest";

import { buildHistorySql } from "../../scripts/db/history-sql";
import { createTestDb, DEMO, type TestDb } from "./harness";

let t: TestDb;
beforeAll(async () => {
  t = await createTestDb();
}, 60_000);

const one = async <T>(sql: string) => (await t.db.query<T>(sql)).rows[0];

describe("catalog", () => {
  it("has 10 indicators, 3 scenarios and at least 10 articles", async () => {
    const r = await one<{ i: number; s: number; a: number }>(
      `select (select count(*)::int from indicator) i, (select count(*)::int from incident_scenario) s,
              (select count(*)::int from library_article) a`,
    );
    expect(r).toEqual({ i: 10, s: 3, a: expect.any(Number) });
    expect(r.a).toBeGreaterThanOrEqual(10);
  });

  it("cites a source document everywhere (RN-18)", async () => {
    const r = await one<{ n: number }>(
      `select count(*)::int n from (
         select source from indicator union all select source from incident_scenario
         union all select source from library_article) s
       where source !~ 'Documents? 0[1-6]'`,
    );
    expect(r.n).toBe(0);
  });

  it("marks every threshold as demonstration (RN-02) and has 3 simulated indicators (RN-03)", async () => {
    const r = await one<{ demo: number; simulated: string[] }>(
      `select count(*) filter (where is_demo)::int demo,
              array_agg(code order by code) filter (where not is_self_assessed) simulated from indicator`,
    );
    expect(r.demo).toBe(10);
    expect(r.simulated).toEqual(["bone_density", "eye_exam", "radiation_dose"]);
  });

  it("states the glucose transparency note and the OCT demo index", async () => {
    const g = await one<{ source: string }>(`select source from indicator where code = 'glucose'`);
    expect(g.source).toMatch(/do not document routine glucose measurement/);
    const e = await one<{ source: string }>(`select source from indicator where code = 'eye_exam'`);
    expect(e.source).toMatch(/demonstration value/);
  });

  it("incident steps never prescribe drugs or treatment (RN-13)", async () => {
    const { rows } = await t.db.query<{ step: { type: string; instruction: string } }>(
      `select jsonb_array_elements(steps) as step from incident_scenario`,
    );
    for (const { step } of rows) {
      expect(["documented_action", "verification", "data_entry", "escalation"]).toContain(step.type);
      expect(step.instruction).not.toMatch(/\b(take|administer|inject|dose of|mg|tablet|pill|medication)\b/i);
    }
  });
});

describe("demo mission and accounts", () => {
  it("has one active mission and the two demo profiles", async () => {
    const r = await one<{ missions: number; roles: string[] }>(
      `select (select count(*)::int from mission where active) missions,
              (select array_agg(role order by role) from profile) roles`,
    );
    expect(r).toEqual({ missions: 1, roles: ["astronaut", "flight_surgeon"] });
  });
});

describe("simulated history", () => {
  it("has 7 calculated baselines with at least 5 samples each (RN-05)", async () => {
    const r = await one<{ n: number; min: number }>(
      `select count(*)::int n, min(sample_count) min from baseline where source = 'calculated'`,
    );
    expect(r.n).toBe(7);
    expect(r.min).toBeGreaterThanOrEqual(5);
  });

  it("spans at least 60 days", async () => {
    const r = await one<{ days: number }>(
      `select extract(day from max(measured_at) - min(measured_at))::int days from measurement`,
    );
    expect(r.days).toBeGreaterThanOrEqual(60);
  });

  it("links the solar-storm red alert to an urgent critical_alert message (RN-08)", async () => {
    const r = await one<{ n: number }>(
      `select count(*)::int n from message m join alert a on a.id = m.alert_id
       join indicator i on i.id = a.indicator_id
       where m.type = 'critical_alert' and m.priority = 'urgent' and a.level = 'red' and i.code = 'radiation_dose'`,
    );
    expect(r.n).toBe(1);
  });

  it("has an active sleep trend alert (RN-06)", async () => {
    const r = await one<{ n: number }>(
      `select count(*)::int n from alert a join indicator i on i.id = a.indicator_id
       where a.type = 'trend' and a.status = 'active' and i.code = 'sleep_hours'`,
    );
    expect(r.n).toBe(1);
  });

  it("has one message still in transit (RN-09)", async () => {
    const r = await one<{ n: number }>(`select count(*)::int n from message where arrives_at > now()`);
    expect(r.n).toBe(1);
  });

  it("reports every completed check-up to the surgeon, and none for abandoned ones (RN-08)", async () => {
    const r = await one<{ completed: number; reports: number; abandoned_reports: number }>(
      `select (select count(*)::int from checkup where status = 'completed') completed,
              (select count(*)::int from message where type = 'checkup_report' and recipient_id = '${DEMO.surgeon}') reports,
              (select count(*)::int from message m join checkup c on c.id = m.checkup_id
                 where m.type = 'checkup_report' and c.status = 'abandoned') abandoned_reports`,
    );
    expect(r.reports).toBe(r.completed);
    expect(r.abandoned_reports).toBe(0);
  });
});

describe("determinism", () => {
  it("the committed 03_history.sql equals the generator output", async () => {
    // Line endings are normalized: Git may check files out with CRLF on Windows.
    const committed = readFileSync(join(process.cwd(), "supabase", "seed", "03_history.sql"), "utf8");
    expect(await buildHistorySql()).toBe(committed.replace(/\r\n/g, "\n"));
  }, 60_000);
});
