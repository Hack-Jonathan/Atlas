/**
 * Schema: the 12 tables exist with RLS enabled, and constraints reject bad data.
 * Runs as the superuser (constraints, not policies, are under test here).
 */
import { beforeAll, describe, expect, it } from "vitest";

import { createTestDb, DEMO, type TestDb } from "./harness";

const TABLES = [
  "indicator", "incident_scenario", "library_article", "mission", "profile", "baseline",
  "checkup", "incident", "measurement", "alert", "message", "ai_message",
];

let t: TestDb;
beforeAll(async () => {
  t = await createTestDb();
}, 60_000);

/** Expects `sql` to fail (any error). */
async function rejects(sql: string) {
  await expect(t.db.exec(sql)).rejects.toThrow();
}

describe("schema", () => {
  it("has exactly the 12 tables, all with row level security", async () => {
    const { rows } = await t.db.query<{ relname: string; relrowsecurity: boolean }>(
      `select c.relname, c.relrowsecurity from pg_class c join pg_namespace n on n.oid = c.relnamespace
       where n.nspname = 'public' and c.relkind = 'r' order by 1`,
    );
    expect(rows.map((r) => r.relname).sort()).toEqual([...TABLES].sort());
    expect(rows.every((r) => r.relrowsecurity)).toBe(true);
  });

  it("rejects invalid enum values", async () => {
    await rejects(`update mission set current_phase = 'warp' where id = '${DEMO.mission}'`);
    await rejects(`update profile set role = 'captain' where id = '${DEMO.astronaut}'`);
  });

  it("rejects delay_seconds outside 0–1200 (RN-10)", async () => {
    await rejects(`update mission set delay_seconds = 1201 where id = '${DEMO.mission}'`);
  });

  it("rejects a duplicate baseline for the same person and indicator (RN-05)", async () => {
    await rejects(
      `insert into baseline (profile_id, indicator_id, reference_value, source)
       select profile_id, indicator_id, 1, 'manual' from baseline limit 1`,
    );
  });

  it("refuses to close an incident without a summary (RN-12)", async () => {
    await t.db.exec(
      `insert into incident (id, mission_id, scenario_id, affected_id)
       select '11111111-1111-4111-8111-111111111111', '${DEMO.mission}', id, '${DEMO.astronaut}'
       from incident_scenario where code = 'solar_storm'`,
    );
    await rejects(
      `update incident set status = 'closed', closed_at = now() where id = '11111111-1111-4111-8111-111111111111'`,
    );
    await t.db.exec(
      `update incident set status = 'closed', closed_at = now(), summary = 'Crew sheltered; dose recorded.'
       where id = '11111111-1111-4111-8111-111111111111'`,
    );
  });

  it("computes arrival from the mission delay (RN-09: 1200 s / 60 = 20 s)", async () => {
    const { rows } = await t.db.query<{ secs: number }>(
      `select extract(epoch from arrives_at - sent_at)::int as secs from message limit 1`,
    );
    expect(rows[0].secs).toBe(20);
  });
});
