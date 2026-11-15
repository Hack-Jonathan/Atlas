/**
 * Row Level Security (RN-14, RNF-06) and the server-side rules attached to it:
 * own-data access, mission surgeon access, delayed message visibility (RN-09),
 * message immutability (RN-11), no self-promotion, and record consistency.
 */
import { beforeAll, describe, expect, it } from "vitest";

import { createTestDb, DEMO, type TestDb } from "./harness";

const ASTRO = DEMO.astronaut;
const SURGEON = DEMO.surgeon;
// A second mission with its own astronaut and surgeon, created in beforeAll.
const OTHER_MISSION = "22222222-2222-4222-8222-222222222222";
const OTHER_ASTRO = "22222222-2222-4222-8222-2222222222a1";
const OTHER_SURGEON = "22222222-2222-4222-8222-2222222222b1";

let t: TestDb;
let otherAlertId: string;
let otherCheckupId: string;
let astroAlertId: string;

beforeAll(async () => {
  t = await createTestDb();
  await t.db.exec(`
    insert into mission (id, name, destination, start_date, current_phase, delay_seconds, demo_factor)
    values ('${OTHER_MISSION}', 'Other mission', 'moon', current_date, 'outbound_transit', 3, 1);
    insert into auth.users (id, email) values ('${OTHER_ASTRO}', 'a2@x.test'), ('${OTHER_SURGEON}', 's2@x.test');
    insert into profile (id, mission_id, full_name, role) values
      ('${OTHER_ASTRO}', '${OTHER_MISSION}', 'Other Astronaut', 'astronaut'),
      ('${OTHER_SURGEON}', '${OTHER_MISSION}', 'Other Surgeon', 'flight_surgeon');
  `);
  otherCheckupId = (
    await t.db.query<{ id: string }>(
      `insert into checkup (profile_id, mission_id) values ('${OTHER_ASTRO}', '${OTHER_MISSION}') returning id`,
    )
  ).rows[0].id;
  otherAlertId = (
    await t.db.query<{ id: string }>(
      `insert into alert (profile_id, indicator_id, type, level, message)
       select '${OTHER_ASTRO}', id, 'value', 'yellow', 'x' from indicator where code = 'heart_rate' returning id`,
    )
  ).rows[0].id;
}, 60_000);

const count = async (role: "anon" | "authenticated", uid: string | null, table: string) =>
  Number((await t.as<{ n: number }>(role, uid, `select count(*)::int as n from ${table}`))[0].n);

describe("visitor (anon)", () => {
  it("reads nothing from any table", async () => {
    for (const table of [
      "indicator", "incident_scenario", "library_article", "mission", "profile", "baseline",
      "checkup", "incident", "measurement", "alert", "message", "ai_message",
    ]) {
      await expect(count("anon", null, table)).rejects.toThrow(/permission denied/);
    }
  });
});

describe("astronaut", () => {
  it("sees own measurements only", async () => {
    const total = await count("authenticated", ASTRO, "measurement");
    expect(total).toBeGreaterThan(500);
    const foreign = await t.as<{ n: number }>(
      "authenticated", ASTRO, `select count(*)::int as n from measurement where profile_id <> '${ASTRO}'`,
    );
    expect(foreign[0].n).toBe(0);
  });

  it("cannot change own role or mission, but can change full_name (R1)", async () => {
    await expect(
      t.as("authenticated", ASTRO, `update profile set role = 'flight_surgeon' where id = '${ASTRO}'`),
    ).rejects.toThrow(/permission denied/);
    await expect(
      t.as("authenticated", ASTRO, `update profile set mission_id = '${OTHER_MISSION}' where id = '${ASTRO}'`),
    ).rejects.toThrow(/permission denied/);
    await t.as("authenticated", ASTRO, `update profile set full_name = 'Elena R.' where id = '${ASTRO}'`);
    const { rows } = await t.db.query<{ full_name: string; role: string }>(
      `select full_name, role from profile where id = '${ASTRO}'`,
    );
    expect(rows[0]).toEqual({ full_name: "Elena R.", role: "astronaut" });
  });

  it("cannot edit indicator thresholds", async () => {
    const updated = await t.as(
      "authenticated", ASTRO, `update indicator set normal_max = 999 where code = 'heart_rate' returning id`,
    );
    expect(updated).toHaveLength(0);
  });

  it("can insert an own alert (R5)", async () => {
    const rows = await t.as<{ id: string }>(
      "authenticated", ASTRO,
      `insert into alert (profile_id, indicator_id, type, level, message)
       select '${ASTRO}', id, 'value', 'yellow', 'test alert' from indicator where code = 'mood' returning id`,
    );
    astroAlertId = rows[0].id;
    expect(astroAlertId).toBeTruthy();
  });

  it("cannot link a measurement to another profile's check-up (R3)", async () => {
    await expect(
      t.as(
        "authenticated", ASTRO,
        `insert into measurement (profile_id, mission_id, indicator_id, checkup_id, numeric_value, mission_phase, origin, traffic_light, status_reason)
         select '${ASTRO}', '${DEMO.mission}', id, '${otherCheckupId}', 70, 'outbound_transit', 'manual', 'green', 'x'
         from indicator where code = 'heart_rate'`,
      ),
    ).rejects.toThrow(/another profile/);
  });

  it("cannot insert a physically impossible value, even directly (inspection 4 · R1, RN-07)", async () => {
    await expect(
      t.as(
        "authenticated", ASTRO,
        `insert into measurement (profile_id, mission_id, indicator_id, numeric_value, mission_phase, origin, traffic_light, status_reason)
         select '${ASTRO}', '${DEMO.mission}', id, 400, 'outbound_transit', 'manual', 'green', 'x'
         from indicator where code = 'heart_rate'`,
      ),
    ).rejects.toThrow(/plausible range/);
    await expect(
      t.as(
        "authenticated", ASTRO,
        `insert into measurement (profile_id, mission_id, indicator_id, numeric_value, mission_phase, origin, traffic_light, status_reason)
         select '${ASTRO}', '${DEMO.mission}', id, 'NaN', 'outbound_transit', 'manual', 'green', 'x'
         from indicator where code = 'heart_rate'`,
      ),
    ).rejects.toThrow(/finite numeric value/);
  });

  it("cannot insert a measurement for a mission that is not theirs (R3)", async () => {
    await expect(
      t.as(
        "authenticated", ASTRO,
        `insert into measurement (profile_id, mission_id, indicator_id, numeric_value, mission_phase, origin, traffic_light, status_reason)
         select '${ASTRO}', '${OTHER_MISSION}', id, 70, 'outbound_transit', 'manual', 'green', 'x'
         from indicator where code = 'heart_rate'`,
      ),
    ).rejects.toThrow();
  });

  it("cannot send a message linked to another mission's alert (R3)", async () => {
    await expect(
      t.as(
        "authenticated", ASTRO,
        `insert into message (mission_id, sender_id, recipient_id, type, priority, subject, body, alert_id)
         values ('${DEMO.mission}', '${ASTRO}', '${SURGEON}', 'critical_alert', 'urgent', 's', 'b', '${otherAlertId}')`,
      ),
    ).rejects.toThrow(/alert_id/);
  });
});

describe("referenced records (inspection 2 · R1)", () => {
  it("the astronaut cannot re-point a measurement's indicator", async () => {
    const m = (await t.db.query<{ id: string }>(`select measurement_id as id from alert where measurement_id is not null limit 1`)).rows[0].id;
    await expect(
      t.as(
        "authenticated", ASTRO,
        `update measurement set indicator_id = (select id from indicator where code = 'heart_rate') where id = '${m}'`,
      ),
    ).rejects.toThrow(/permission denied/);
    // Even privileged writers cannot change identity columns.
    await expect(
      t.db.exec(`update measurement set indicator_id = (select id from indicator where code = 'heart_rate') where id = '${m}'`),
    ).rejects.toThrow(/cannot change after creation/);
  });

  it("the surgeon can only change an alert's status, not its owner", async () => {
    const a = (await t.db.query<{ id: string }>(`select id from alert where profile_id = '${ASTRO}' limit 1`)).rows[0].id;
    await expect(
      t.as("authenticated", SURGEON, `update alert set profile_id = '${SURGEON}' where id = '${a}'`),
    ).rejects.toThrow(/permission denied/);
    await expect(t.db.exec(`update alert set profile_id = '${SURGEON}' where id = '${a}'`)).rejects.toThrow(
      /cannot change after creation/,
    );
  });
});

describe("mission reassignment (inspection 3 · R2)", () => {
  it("a profile with history cannot be moved to another mission, even by privileged writers", async () => {
    await expect(
      t.db.exec(`update profile set mission_id = '${OTHER_MISSION}' where id = '${ASTRO}'`),
    ).rejects.toThrow(/mission_id cannot change/);
    expect(await count("authenticated", OTHER_SURGEON, "measurement")).toBe(0);
  });
});

describe("flight surgeon", () => {
  it("sees the astronaut's measurements in the same mission", async () => {
    const rows = await t.as<{ n: number }>(
      "authenticated", SURGEON, `select count(*)::int as n from measurement where profile_id = '${ASTRO}'`,
    );
    expect(rows[0].n).toBeGreaterThan(500);
  });

  it("can edit indicator thresholds (RF-46)", async () => {
    const updated = await t.as(
      "authenticated", SURGEON, `update indicator set yellow_action = yellow_action where code = 'mood' returning id`,
    );
    expect(updated).toHaveLength(1);
  });

  it("can tune thresholds but not scientific content or classification (inspection 3 · R1)", async () => {
    for (const set of ["is_self_assessed = true", "system_code = 'cardiovascular'", "source = 'x'", "how_to_measure = 'x'"]) {
      await expect(
        t.as("authenticated", SURGEON, `update indicator set ${set} where code = 'radiation_dose'`),
      ).rejects.toThrow(/permission denied/);
    }
    const ok = await t.as(
      "authenticated", SURGEON, `update indicator set alert_max = 1100 where code = 'radiation_dose' returning id`,
    );
    expect(ok).toHaveLength(1);
    // Inspection 4 · R2: thresholds must stay ordered.
    await expect(
      t.as("authenticated", SURGEON, `update indicator set alert_max = 60 where code = 'heart_rate'`),
    ).rejects.toThrow(/indicator_alert_above_normal/);
    await expect(
      t.as("authenticated", SURGEON, `update indicator set red_deviation_pct = 5 where code = 'heart_rate'`),
    ).rejects.toThrow(/indicator_deviation_order/);
  });

  it("can mark a same-mission alert attended (R5)", async () => {
    const rows = await t.as(
      "authenticated", SURGEON,
      `update alert set status = 'attended', attended_at = now() where id = '${astroAlertId}' returning id`,
    );
    expect(rows).toHaveLength(1);
  });

  it("cannot store a calculated baseline with fewer than 5 samples, but can set a manual one (inspection R2)", async () => {
    await expect(
      t.as(
        "authenticated", SURGEON,
        `insert into baseline (profile_id, indicator_id, reference_value, sample_count, source)
         select '${ASTRO}', id, 1, 0, 'calculated' from indicator where code = 'bone_density'`,
      ),
    ).rejects.toThrow(/baseline_calculated_min_samples/);
    const manual = await t.as(
      "authenticated", SURGEON,
      `insert into baseline (profile_id, indicator_id, reference_value, sample_count, source)
       select '${ASTRO}', id, -0.5, 0, 'manual' from indicator where code = 'bone_density' returning id`,
    );
    expect(manual).toHaveLength(1);
    await expect(
      t.as(
        "authenticated", SURGEON,
        `update baseline set source = 'calculated' where id = '${(manual[0] as { id: string }).id}'`,
      ),
    ).rejects.toThrow(/baseline_calculated_min_samples/);
  });

  it("from another mission cannot see or update that alert (R5)", async () => {
    const seen = await t.as("authenticated", OTHER_SURGEON, `select id from alert where id = '${astroAlertId}'`);
    expect(seen).toHaveLength(0);
    const updated = await t.as(
      "authenticated", OTHER_SURGEON, `update alert set status = 'dismissed' where id = '${astroAlertId}' returning id`,
    );
    expect(updated).toHaveLength(0);
    expect(await count("authenticated", OTHER_SURGEON, "measurement")).toBe(0);
  });
});

describe("messages", () => {
  it("recipient cannot see a message before arrives_at; sender can (RN-09)", async () => {
    const inTransit = await t.db.query<{ id: string }>(`select id from message where arrives_at > now()`);
    expect(inTransit.rows).toHaveLength(1);
    const id = inTransit.rows[0].id;
    expect(await t.as("authenticated", SURGEON, `select id from message where id = '${id}'`)).toHaveLength(0);
    expect(await t.as("authenticated", ASTRO, `select id from message where id = '${id}'`)).toHaveLength(1);
  });

  it("a backdated client message gets server time and stays hidden (R2)", async () => {
    const rows = await t.as<{ id: string; sent_at: Date }>(
      "authenticated", ASTRO,
      `insert into message (mission_id, sender_id, recipient_id, type, priority, subject, body, sent_at)
       values ('${DEMO.mission}', '${ASTRO}', '${SURGEON}', 'message', 'normal', 'hi', 'body', now() - interval '1 day')
       returning id, sent_at`,
    );
    const { rows: now } = await t.db.query<{ now: Date }>("select now() as now");
    expect(Math.abs(new Date(rows[0].sent_at).getTime() - new Date(now[0].now).getTime())).toBeLessThan(60_000);
    expect(await t.as("authenticated", SURGEON, `select id from message where id = '${rows[0].id}'`)).toHaveLength(0);
  });

  it("sent messages are immutable except read_at (RN-11)", async () => {
    const delivered = (
      await t.db.query<{ id: string }>(
        `select id from message where recipient_id = '${SURGEON}' and arrives_at <= now() limit 1`,
      )
    ).rows[0].id;
    // Layer 1: clients may only update the read_at column.
    await expect(
      t.as("authenticated", SURGEON, `update message set body = 'changed' where id = '${delivered}'`),
    ).rejects.toThrow(/permission denied/);
    // Layer 2: the trigger rejects any other change, even for privileged roles.
    await expect(t.db.exec(`update message set body = 'changed' where id = '${delivered}'`)).rejects.toThrow(
      /immutable/,
    );
    const read = await t.as(
      "authenticated", SURGEON, `update message set read_at = now() where id = '${delivered}' returning id`,
    );
    expect(read).toHaveLength(1);
  });

  it("the recipient cannot change a message id (inspection R1)", async () => {
    const delivered = (
      await t.db.query<{ id: string }>(
        `select id from message where recipient_id = '${SURGEON}' and arrives_at <= now() and read_at is null limit 1`,
      )
    ).rows[0]?.id ?? (await t.db.query<{ id: string }>(`select id from message where recipient_id = '${SURGEON}' and arrives_at <= now() limit 1`)).rows[0].id;
    await expect(
      t.as("authenticated", SURGEON, `update message set id = gen_random_uuid() where id = '${delivered}'`),
    ).rejects.toThrow(/permission denied/);
  });

  it("messages cannot be deleted by clients", async () => {
    await expect(t.as("authenticated", ASTRO, `delete from message`)).rejects.toThrow(/permission denied/);
    const { rows } = await t.db.query<{ n: number }>("select count(*)::int as n from message");
    expect(rows[0].n).toBeGreaterThan(70);
  });
});
