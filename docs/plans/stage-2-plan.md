# PLAN: Atlas, Development Stage 2 (Data layer)

Source of truth: `../Especificacion_del_sistema_Atlas_v2.0.md`. The relevant parts are §0.6 (stage 2), Part 1 §5–§6 (RN-01…RN-20), §7 (RF-03, RF-48), §8 (RNF-05/06/09/10), Part 3 (12-entity ER and dictionary). Health content comes only from `../Documentacion/01_`–`06_`. Stage 1 plan: `stage-1-plan.md` (same folder).

## Goal

Deliver the complete database layer as versioned SQL, ready to apply to a Supabase project the team creates later. It contains:

- 12 tables;
- constraints and RLS by role;
- the scientific catalog (10 indicators, 3 incident scenarios, about 12 library articles);
- 1 active mission and 2 demo users (astronaut and flight surgeon);
- 75 days of simulated history.

The history is classified by a pure rules-engine core. Everything is verified locally with PGlite (real PostgreSQL in Vitest), because no Supabase project and no Docker are available. **No UI changes**, except updating the six body-system codes in `src/config/body-systems.ts` to the new English DB codes.

## Decisions (confirmed by Jonathan, 2026-11-15)

| Decision | Choice |
|---|---|
| DB naming | Tables, columns and enum values in **English**; the mapping to the spec's Spanish names is below and repeated as SQL comments |
| Verification | PGlite in Vitest (no Docker, no Supabase project yet). Applying to Supabase later is documented as one step |
| Rules engine | Bring the **pure classification core** forward from Stage 3 (RN-04, RN-05, RN-06, RN-07); the history generator uses it; Stage 3 UI reuses it |
| Library | About 12 articles: one per indicator (10) plus hazards overview plus key technologies; every article cites its source document |
| Content language | Catalog text (names, how-to-measure, why-it-matters, articles) written in **English** (UI language), translated faithfully from the Spanish analysis docs; `source` cites "Document 0X" |

## Name mapping (spec → Atlas)

| Spec table | Atlas table | Notable columns / enum values |
|---|---|---|
| `mision` | `mission` | `name, destination (low_earth_orbit\|moon\|mars), start_date, current_phase (preparation\|outbound_transit\|surface\|return_transit\|post_flight), delay_seconds (0–1200), demo_factor (>0), active` |
| `perfil` | `profile` | `id = auth.users.id, mission_id, full_name, role (astronaut\|flight_surgeon), title, created_at` |
| `indicador` | `indicator` | `code UK (heart_rate, systolic_pressure, diastolic_pressure, glucose, temperature, sleep_hours, mood, bone_density, eye_exam, radiation_dose), name, system_code (cardiovascular\|bone_muscle\|neuro_ocular\|behavioral_sleep\|immune_metabolic\|environment_radiation), unit, input_type (number\|scale\|text), is_self_assessed, valid_min, valid_max, suggested_frequency (continuous_telemetry\|daily\|weekly\|monthly), how_to_measure, why_it_matters, source, hazards jsonb, normal_min, normal_max, alert_min, alert_max, yellow_deviation_pct, red_deviation_pct, trend_readings (default 3), yellow_action, red_action, is_demo (always true)` |
| `linea_base` | `baseline` | `profile_id, indicator_id UNIQUE together, reference_value, std_dev, sample_count, source (calculated\|manual), updated_at` |
| `chequeo` | `checkup` | `profile_id, mission_id, started_at, completed_at, status (in_progress\|completed\|abandoned), overall_result (green\|yellow\|red)` |
| `medicion` | `measurement` | `profile_id, mission_id, indicator_id, checkup_id?, incident_id?, numeric_value, text_value, image_url, measured_at, mission_phase, origin (manual\|simulated), traffic_light (green\|yellow\|red), deviation_pct, status_reason` |
| `alerta` | `alert` | `profile_id, indicator_id, measurement_id?, type (value\|trend), level (yellow\|red), message, status (active\|attended\|dismissed), created_at, attended_at` |
| `escenario_incidente` | `incident_scenario` | `code UK (fainting_gravity\|chest_pain\|solar_storm), name, description, source, steps jsonb [{order, instruction, type (documented_action\|verification\|data_entry\|escalation), indicator_code}]` |
| `incidente` | `incident` | `mission_id, scenario_id, affected_id, status (open\|closed), summary, events jsonb, started_at, closed_at` |
| `mensaje` | `message` | `mission_id, sender_id, recipient_id, type (message\|checkup_report\|incident_report\|critical_alert\|reply), priority (normal\|high\|urgent), subject, body, checkup_id?, incident_id?, alert_id?, reply_to_id?, sent_at, arrives_at, read_at` |
| `mensaje_ia` | `ai_message` | `profile_id, role (user\|assistant), content, context_used, created_at` |
| `articulo_biblioteca` | `library_article` | `category (indicator\|hazard\|risk\|technology\|system), title, summary, content (Markdown), source, indicator_id?` |

All primary keys are `uuid default gen_random_uuid()`. Enums are `text` + `CHECK` (as in the spec, easy to evolve).

## Approach

### 1. Schema: `supabase/migrations/20261115000001_schema.sql`

- 12 tables with FKs, `CHECK`s for every enum and range:
  - `delay_seconds between 0 and 1200`;
  - `demo_factor > 0`;
  - `valid_min <= valid_max`.
- `UNIQUE(profile_id, indicator_id)` on `baseline` (RN-05).
- `CHECK (source <> 'calculated' or sample_count >= 5)` on `baseline` (RN-05). *(Inspection fix · R2)*
- `incident.summary` is required when `status = 'closed'` (RN-12, CHECK).
- Indexes on the FK columns and on `(profile_id, indicator_id, measured_at)` for trends.
- **Trigger `message_set_arrival`** (BEFORE INSERT, RN-09):
  - For any client role (`authenticated`/`anon`), it **overwrites `sent_at` with `now()`** (server time), so backdating is impossible.
  - It then computes `arrives_at = sent_at + delay_seconds / demo_factor` from the message's mission.
  - Only privileged roles (`postgres`, `service_role`, used by the seed) keep a supplied `sent_at`, so historical messages can be seeded. *(Rev 1 · R2)*
- **Trigger `message_immutable`** (BEFORE UPDATE/DELETE) allows changing only `read_at`, and rejects deletes (RN-11).
- `profile.id` references `auth.users(id) on delete cascade`.
- *(Inspection 4 fix · R1)* The measurement trigger validates RN-07 at the database: `number`/`scale` indicators need a finite value inside `[valid_min, valid_max]`.
- *(Inspection 4 fix · R2)* Threshold CHECKs keep the limits ordered: `alert_min <= normal_min`, `alert_max >= normal_max` and `yellow_deviation_pct <= red_deviation_pct`.
- *(Inspection 3 fix · R2)* `profile.mission_id` is locked once the profile has any checkup, measurement, incident, alert, message or baseline (trigger, all roles). History therefore never moves to another mission's surgeon.
- *(Inspection 3 fix · R1)* Surgeon UPDATE on `indicator` is column-granted to the thresholds and actions only (normal/alert limits, deviation %, trend_readings, yellow/red action). On `mission` it is granted to `current_phase`, `delay_seconds` and `demo_factor` only.
- *(Inspection 2 fix · R1)* Ownership and link columns cannot change on UPDATE. This covers `checkup`, `incident`, `measurement` and `alert`, and is enforced by the trigger for every role. Client UPDATE grants are column-limited: `checkup` (completed_at, status, overall_result), `incident` (status, summary, events, closed_at), `measurement` (text_value, image_url), `alert` (status, attended_at).
- **Trigger `enforce_owner_consistency`** (BEFORE INSERT/UPDATE) on `checkup`, `measurement`, `alert`, `incident`, `message`. *(Rev 1 · R3)*
  - For tables that have `mission_id` (`checkup`, `measurement`, `incident`, `message`), it must equal the owner profile's `mission_id`.
  - `alert` has **no `mission_id`** (as in the spec); its mission is derived from `alert.profile_id → profile.mission_id`. *(Rev 2 · R5)*
  - `measurement.checkup_id` must point to a checkup with the same `profile_id`.
  - `measurement.incident_id` must point to an incident whose `affected_id` is the same profile.
  - `alert.measurement_id` must belong to the same profile and indicator.
  - On `message`:
    - sender and recipient must both belong to `message.mission_id`;
    - linked `checkup_id`, `incident_id` and `alert_id` must belong to the sender or the recipient and to the same mission.
  - Violations raise a clear error.

### 2. RLS: `supabase/migrations/20261115000002_rls.sql` (RN-14, RNF-06)

- RLS enabled on **all 12 tables**. Helper SQL functions (`security definer`, `stable`, fixed `search_path`):
  - `app_current_role()` returns the caller's `profile.role`;
  - `app_current_mission()` returns the caller's `profile.mission_id`.
- Catalogs (`indicator`, `incident_scenario`, `library_article`):
  - SELECT for `authenticated`;
  - UPDATE on `indicator` for `flight_surgeon` only (RF-46);
  - no INSERT/DELETE from clients.
- `mission`:
  - SELECT for its members;
  - UPDATE for that mission's flight surgeon (RF-45).
- `profile`: *(Rev 1 · R1)*
  - SELECT for profiles in the caller's mission (needed to address messages).
  - Clients may UPDATE **only `full_name` and `title`** of their own row. This is enforced by column privileges (`revoke update on profile from authenticated; grant update (full_name, title) on profile to authenticated`) plus the own-row policy.
  - `id`, `role` and `mission_id` change only through privileged roles.
  - Clients never INSERT profiles.
- `baseline`: owner SELECT; flight surgeon of the same mission SELECT/INSERT/UPDATE (RF-47).
- `checkup`, `measurement`, `incident`, `alert`:
  - the astronaut SELECTs/INSERTs/UPDATEs own rows, with table-specific `WITH CHECK`:
    - `checkup` and `measurement`: `profile_id = auth.uid() and mission_id = app_current_mission()`;
    - `incident`: `affected_id = auth.uid() and mission_id = app_current_mission()`;
    - `alert`: `profile_id = auth.uid()` only, because its mission comes from the profile *(Rev 2 · R5)*;
    - the consistency trigger above also applies;
  - the flight surgeon SELECTs rows of profiles in the same mission;
  - `alert` UPDATE (mark attended) is allowed to the owner and to a flight surgeon whose mission equals the alert owner's mission (via `profile`).
- `message`:
  - SELECT when `sender_id = auth.uid()` **or** (`recipient_id = auth.uid()` and `arrives_at <= now()`), the server-side filter of RN-09;
  - INSERT only as yourself, within your mission, to a profile of the same mission;
  - UPDATE only by the recipient, and only the `read_at` column. *(Inspection fix · R1)*
    - The column grant is `update (read_at)`.
    - The trigger also compares the whole row, `id` included, except `read_at`.
- `ai_message`: owner only.
- `anon` (visitor) gets no access to any table.

### 3. Rules-engine core: `src/lib/rules/` (pure TypeScript, no I/O)

- `validate.ts`: `validateValue(indicator, value)` rejects values outside `[valid_min, valid_max]` with a clear English message (RN-07).
- `classify.ts`: `classifyMeasurement(indicator, value, baseline?)` returns `{ trafficLight, deviationPct, reason }`.
  - **Range criterion:**
    - red if `< alert_min` or `> alert_max`;
    - yellow if outside `[normal_min, normal_max]`;
    - otherwise green.
  - **Baseline criterion:** only when a baseline exists and `ref ≠ 0`. *(Rev 1 · R4)*
    - `deviationPct = 100 × (value − ref) / |ref|`. It is signed: positive means above baseline, and the sign gives the trend direction.
    - Yellow when `|deviationPct| ≥ yellow_deviation_pct`, red when `|deviationPct| ≥ red_deviation_pct` (thresholds are percentages).
    - With `ref = 0` the baseline criterion is skipped, `deviationPct = null`, and `reason` says so.
  - The result is the **most severe** of the two (RN-04), and `reason` always explains which rule fired.
  - Without a baseline, only the range applies (RN-05).
- `trend.ts`: `detectTrend(indicator, recent, baseline)` returns a yellow trend when the last `trend_readings` values all exceed the yellow deviation **in the same direction** (RN-06).
- `baseline.ts`: `computeBaseline(values)` needs ≥ 5 samples (RN-05) and returns mean, std_dev and n.
- `trend.ts` compares using the signed `deviationPct`.
- `src/lib/db/enums.ts`: Zod enums matching every SQL `CHECK` (one source for TypeScript; RNF-07).

### 4. Seed (the order matters; every file is plain SQL that is applied in order in the Supabase SQL editor. *(Inspection fix · R3: the Supabase CLI `db reset` path was dropped because there is no `config.toml`.)*)

1. **`supabase/seed/01_catalog.sql`**: 10 indicators, 3 incident scenarios, about 12 library articles, all from `01_`–`06_`.
   - **Content rules:**
     - every text field cites `Document 0X`;
     - glucose carries the transparency note (challenge proposal 01 + risk 06; not routinely measured in flight, RN-18);
     - eye_exam states that the OCT index is a demonstration value;
     - incident steps contain only verification, data entry, escalation or documented actions such as shelter during a solar storm, never drugs or treatments (RN-13).
   - **Thresholds** are demonstration parameters (`is_demo = true`, RN-02), because the sources document no clinical space thresholds:

| code | unit | valid | normal (green) | red if | yellow / red dev % | self-assessed |
|---|---|---|---|---|---|---|
| heart_rate | bpm | 20–250 | 50–100 | <40 or >130 | 15 / 30 | yes |
| systolic_pressure | mmHg | 50–260 | 90–130 | <80 or >160 | 10 / 20 | yes |
| diastolic_pressure | mmHg | 30–160 | 60–85 | <50 or >100 | 10 / 20 | yes |
| glucose | mg/dL | 20–600 | 70–140 | <54 or >250 | 15 / 30 | yes |
| temperature | °C | 30–44 | 36.0–37.5 | <35 or >38.5 | 2 / 4 | yes |
| sleep_hours | hours | 0–24 | 6–9 | <4 or >12 | 20 / 40 | yes |
| mood | scale 1–5 | 1–5 | 3–5 | <2 | 25 / 50 | yes |
| bone_density | % change/month | −10–5 | −1.0–1.0 | <−2.0 | n/a (no baseline) | no (simulated) |
| eye_exam | OCT index (demo) | 0–100 | 0–30 | >60 | n/a (no baseline) | no (simulated) |
| radiation_dose | µSv/day | 0–10000 | 0–300 | >1000 | n/a (no baseline) | no (simulated) |

   The radiation normal band includes the documented ~150 µSv/day neutron figure (spec §9; Document 05). The bone yellow band includes the documented 1–1.5 %/month loss (spec §9). These are **[demo parameter]** values for the team to review.
2. **`supabase/seed/02_demo.sql`**: the mission "Ares-IV" (destination `mars`, phase `outbound_transit`, `delay_seconds = 1200`, `demo_factor = 60`, active) plus two fixed-UUID demo users inserted into `auth.users` and `auth.identities`:
   - `astronaut@atlas.demo`, a fictional astronaut;
   - `surgeon@atlas.demo`, a fictional flight surgeon;
   - the documented demo password `atlas-demo-2026` (demo-only, stated in README);
   - their `profile` rows.

   Seeding `auth.users` is Supabase's documented local-seed pattern.
3. **`supabase/seed/03_history.sql`**: **generated** by `scripts/generate-history.ts` (`npm run db:generate-history`) from a **seeded deterministic PRNG**, so the output is byte-identical on every run. It is committed to the repo.
   - **Timeline:** 75 days relative to `now()` (SQL `now() - interval`), so the demo always looks recent.
   - **Pre-flight:** days −75…−66 are the `preparation` phase, with daily manual check-ups (all 7 self-assessed indicators) that produce **calculated baselines**. All 7 self-assessed indicators get baselines (≥ 5 samples); the 3 simulated ones get none.
   - **Daily check-ups** run from then on in `outbound_transit`; about 2 of them are `abandoned` with no report.
   - **Simulated data:**
     - radiation daily (continuous telemetry, one aggregated row per day);
     - bone density monthly;
     - eye exam monthly.
   - **Scripted, explainable events:**
     - one solar-storm radiation spike about 20 days ago: red value alert, plus a `critical_alert` message to the surgeon linked by `alert_id`;
     - sleep drifting down over the last 4 days: yellow measurements plus a `trend` alert, still `active`;
     - one yellow blood-pressure day (already `attended`).
   - **Messages:**
     - every completed check-up sends a `checkup_report` with priority from its worst result (RN-08);
     - one surgeon `reply` thread;
     - one message still **in transit** (`arrives_at` in the future) to demo RN-09.
   - `traffic_light`, `deviation_pct`, `status_reason` and alerts all come from `src/lib/rules` (the same code Stage 3 will use).
   - No incidents and no `ai_message` rows; those arrive in Stages 5 and 6.

### 5. Local verification harness (PGlite)

- `tests/db/harness.ts` boots PGlite and installs a **minimal Supabase auth stub** (the `auth` schema with `users` and `identities` columns used by the seed, `auth.uid()` reading `request.jwt.claim.sub`, and roles `anon`/`authenticated`). It then applies migrations and seeds in order.
- Tests run as each role with `set role` and `set request.jwt.claim.sub`.
- The stub is test-only and lives in `tests/`; the real migrations never create the `auth` schema.

### 6. Scripts and docs

- `package.json`:
  - `db:generate-history`;
  - `test` keeps running everything (unit + db).
  - New devDependencies: `@electric-sql/pglite`, `tsx`.
- `.env.example` adds `SUPABASE_SERVICE_ROLE_KEY=` (server-only, empty; for later stages).
- `supabase/README.md` covers how to apply to a real project (SQL editor in order; the CLI path is not configured, see R3) and the name-mapping table.
- `README.md` gets a short "Base de datos" section.

## Acceptance criteria

1. `npm run lint`, `npm run typecheck`, `npm test` and `npm run build` all exit 0.
2. The PGlite tests prove:
   - all 12 tables exist with RLS enabled;
   - invalid enum values, out-of-range `delay_seconds` and duplicate baselines are rejected;
   - closing an incident without a summary fails.
3. RLS tests prove:
   - the astronaut sees only own measurements;
   - the flight surgeon sees the astronaut's measurements in the same mission;
   - a recipient **cannot** see a message before `arrives_at` but the sender can;
   - updating a sent message's body fails while setting `read_at` works;
   - deleting a message fails;
   - `anon` reads 0 rows from every table;
   - the astronaut cannot update `indicator` thresholds and the surgeon can.
   - *(Rev 1)*:
     - the astronaut **cannot** change own `role` or `mission_id` but can change `full_name`;
     - a client-inserted message with a backdated `sent_at` gets `sent_at ≈ now()` and stays hidden from the recipient until `arrives_at`;
     - inserting a measurement whose `checkup_id` belongs to another profile fails;
     - inserting a measurement whose `mission_id` is not the owner's fails;
     - inserting a message linked to another mission's alert fails.
   - *(Rev 2)*:
     - the astronaut can INSERT an own alert;
     - the same-mission surgeon can UPDATE it to `attended`;
     - a surgeon of another mission cannot see or update it.
4. Seed tests prove:
   - 10 indicators, 3 scenarios, ≥ 10 articles;
   - every indicator, scenario and article has a non-empty `source` mentioning "Document";
   - all indicators have `is_demo = true`;
   - 3 indicators are non-self-assessed;
   - 1 active mission and 2 profiles;
   - 7 baselines with `sample_count >= 5`;
   - the history spans ≥ 60 days;
   - the solar-storm red alert has a linked `critical_alert` message;
   - an active sleep trend alert exists;
   - one message has `arrives_at > now()`.
5. Rules-engine unit tests cover:
   - range-only classification;
   - baseline-only escalation;
   - the most-severe result (RN-04);
   - no-baseline handling (RN-05);
   - trend in the same direction vs. mixed directions (RN-06);
   - out-of-range rejection (RN-07);
   - baseline with < 5 samples rejected;
   - a 20 % baseline-only deviation turns yellow when the yellow threshold is 15 (Rev 1);
   - a zero reference skips the baseline criterion (Rev 1).
6. `npm run db:generate-history` run twice produces byte-identical `03_history.sql`, and the committed file equals the generated output (a test compares them).
7. Every health statement in the seed traces to `01_`–`06_` ("Document 0X" in `source`); the thresholds are labelled as demonstration.

## Non-goals

- Creating the Supabase project, auth UI/login, or connecting pages to data (Stage 3+).
- Rules-engine UI and automatic message sending at runtime (Stages 3–4).
- Incident runtime (Stage 5), AI (Stage 6), and the "reset demo" function (RN-20, Stage 7).
- No commit/push unless Jonathan asks.

## Assumptions and risks

- `[INT]` English DB naming deviates from the spec's Spanish names by team decision; the mapping is kept here and in `supabase/README.md`.
- `[demo parameter]` All thresholds above; the team should review them.
- **Risk: PGlite fidelity vs. Supabase.**
  - PGlite is real Postgres (v18.6), but the auth stub only approximates Supabase's `auth` schema.
  - Mitigation: the seed inserts only columns that exist in Supabase's `auth.users`/`auth.identities` (`id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at` / `id, user_id, provider_id, provider, identity_data, created_at, updated_at`).
  - Real-Supabase application is verified when the project exists.
- **Risk:** `crypt()`/`gen_salt()` (pgcrypto) for the demo password may not be in PGlite. Mitigation: the seed stores a precomputed bcrypt hash literal instead of calling `crypt()`.
- **Risk (resolved by spike, 2026-11-15):** PGlite 0.5.16 (PostgreSQL 18.6) supports `create role`, `set role`, RLS policies and `gen_random_uuid()`; `pgcrypto` is unavailable, which confirms the precomputed-hash approach. Supabase runs PostgreSQL 15/17, so the SQL avoids any PG-18-only syntax.
- The demo password lives in a public repo. It is acceptable for a demo-only prototype with fictional data; README says to change it for any real deployment.

## Verification

Run from `Atlas/`:

```
npm install
npm run db:generate-history && git diff --exit-code supabase/seed/03_history.sql   # deterministic
npm run lint && npm run typecheck && npm test && npm run build
```

Expected: all exit 0; the Vitest output lists the rules, db-schema, db-rls and db-seed suites passing.

Manual: read 3 random indicators, 1 scenario and 2 articles from the seed and confirm each claim against the cited `Documentacion/0X` file.
