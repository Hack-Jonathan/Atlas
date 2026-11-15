-- =============================================================================
-- Atlas · Stage 2 · Row Level Security (RN-14, RNF-06)
-- - astronaut: only own records;
-- - flight_surgeon: records of profiles in the assigned mission;
-- - anon (visitor): no access to any table.
-- Role and mission are read from `profile` through SECURITY DEFINER helpers,
-- and clients cannot change their own role or mission (column grants below).
-- =============================================================================

-- ---------------------------------------------------------------------------
-- Helpers (security definer + empty search_path; stable within a statement)
-- ---------------------------------------------------------------------------

-- Role of the calling user ('astronaut' | 'flight_surgeon'), or null.
create or replace function public.app_current_role()
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select role from public.profile where id = auth.uid();
$$;

-- Mission of the calling user, or null.
create or replace function public.app_current_mission()
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  select mission_id from public.profile where id = auth.uid();
$$;

-- True when the given profile belongs to the caller's mission.
create or replace function public.app_profile_in_my_mission(target uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profile
    where id = target and mission_id = public.app_current_mission()
  );
$$;

-- True when the caller is the flight surgeon of the given profile's mission.
create or replace function public.app_is_surgeon_of(target uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select public.app_current_role() = 'flight_surgeon' and public.app_profile_in_my_mission(target);
$$;

revoke all on function public.app_current_role() from public;
revoke all on function public.app_current_mission() from public;
revoke all on function public.app_profile_in_my_mission(uuid) from public;
revoke all on function public.app_is_surgeon_of(uuid) from public;
grant execute on function public.app_current_role() to authenticated;
grant execute on function public.app_current_mission() to authenticated;
grant execute on function public.app_profile_in_my_mission(uuid) to authenticated;
grant execute on function public.app_is_surgeon_of(uuid) to authenticated;

-- ---------------------------------------------------------------------------
-- Table privileges: start from nothing, then grant only what clients need.
-- (Supabase grants broad defaults to anon/authenticated; we revoke them.)
-- ---------------------------------------------------------------------------
revoke all on
  public.indicator, public.incident_scenario, public.library_article,
  public.mission, public.profile, public.baseline,
  public.checkup, public.incident, public.measurement, public.alert,
  public.message, public.ai_message
from anon, authenticated;

grant select on
  public.indicator, public.incident_scenario, public.library_article,
  public.mission, public.profile, public.baseline,
  public.checkup, public.incident, public.measurement, public.alert,
  public.message, public.ai_message
to authenticated;

-- RF-46: surgeons may tune only the demonstration thresholds and rule settings;
-- identity, scientific content and manual-vs-simulated classification stay fixed.
grant update (normal_min, normal_max, alert_min, alert_max, yellow_deviation_pct, red_deviation_pct,
              trend_readings, yellow_action, red_action) on public.indicator to authenticated;
-- RF-45: surgeons may change only the mission's demo parameters (RN-20 values).
grant update (current_phase, delay_seconds, demo_factor) on public.mission to authenticated;
grant update (full_name, title) on public.profile to authenticated;         -- never role / mission_id / id
grant insert, update on public.baseline to authenticated;                   -- surgeon only (policies)
grant insert on public.checkup, public.incident, public.measurement, public.alert to authenticated;
-- Updates are limited to the columns each workflow needs (identity columns stay fixed):
grant update (completed_at, status, overall_result) on public.checkup to authenticated;
grant update (status, summary, events, closed_at) on public.incident to authenticated;
grant update (text_value, image_url) on public.measurement to authenticated;
grant update (status, attended_at) on public.alert to authenticated;   -- mark attended (RF-05)
grant insert on public.message to authenticated;
grant update (read_at) on public.message to authenticated;                  -- RN-11: only read_at (trigger double-checks)
grant insert on public.ai_message to authenticated;

-- ---------------------------------------------------------------------------
-- Enable RLS on all 12 tables
-- ---------------------------------------------------------------------------
alter table public.indicator         enable row level security;
alter table public.incident_scenario enable row level security;
alter table public.library_article   enable row level security;
alter table public.mission           enable row level security;
alter table public.profile           enable row level security;
alter table public.baseline          enable row level security;
alter table public.checkup           enable row level security;
alter table public.incident          enable row level security;
alter table public.measurement       enable row level security;
alter table public.alert             enable row level security;
alter table public.message           enable row level security;
alter table public.ai_message        enable row level security;

-- ---------------------------------------------------------------------------
-- Catalogs: readable by signed-in users; thresholds editable by surgeons (RF-46)
-- ---------------------------------------------------------------------------
create policy indicator_select on public.indicator
  for select to authenticated using (true);
create policy indicator_update_surgeon on public.indicator
  for update to authenticated
  using (public.app_current_role() = 'flight_surgeon')
  with check (public.app_current_role() = 'flight_surgeon');

create policy incident_scenario_select on public.incident_scenario
  for select to authenticated using (true);

create policy library_article_select on public.library_article
  for select to authenticated using (true);

-- ---------------------------------------------------------------------------
-- Mission and profiles
-- ---------------------------------------------------------------------------
create policy mission_select on public.mission
  for select to authenticated using (id = public.app_current_mission());
create policy mission_update_surgeon on public.mission                       -- RF-45
  for update to authenticated
  using (id = public.app_current_mission() and public.app_current_role() = 'flight_surgeon')
  with check (id = public.app_current_mission() and public.app_current_role() = 'flight_surgeon');

create policy profile_select_same_mission on public.profile
  for select to authenticated using (mission_id = public.app_current_mission());
create policy profile_update_own on public.profile                           -- only full_name / title (grants)
  for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

-- ---------------------------------------------------------------------------
-- Baselines: owner reads; mission surgeon reads and edits (RF-47)
-- ---------------------------------------------------------------------------
create policy baseline_select on public.baseline
  for select to authenticated
  using (profile_id = auth.uid() or public.app_is_surgeon_of(profile_id));
create policy baseline_insert_surgeon on public.baseline
  for insert to authenticated with check (public.app_is_surgeon_of(profile_id));
create policy baseline_update_surgeon on public.baseline
  for update to authenticated
  using (public.app_is_surgeon_of(profile_id))
  with check (public.app_is_surgeon_of(profile_id));

-- ---------------------------------------------------------------------------
-- Check-ups, measurements, incidents: owner writes; mission surgeon reads
-- ---------------------------------------------------------------------------
create policy checkup_select on public.checkup
  for select to authenticated
  using (profile_id = auth.uid() or public.app_is_surgeon_of(profile_id));
create policy checkup_insert_own on public.checkup
  for insert to authenticated
  with check (profile_id = auth.uid() and mission_id = public.app_current_mission());
create policy checkup_update_own on public.checkup
  for update to authenticated
  using (profile_id = auth.uid())
  with check (profile_id = auth.uid() and mission_id = public.app_current_mission());

create policy measurement_select on public.measurement
  for select to authenticated
  using (profile_id = auth.uid() or public.app_is_surgeon_of(profile_id));
create policy measurement_insert_own on public.measurement
  for insert to authenticated
  with check (profile_id = auth.uid() and mission_id = public.app_current_mission());
create policy measurement_update_own on public.measurement
  for update to authenticated
  using (profile_id = auth.uid())
  with check (profile_id = auth.uid() and mission_id = public.app_current_mission());

create policy incident_select on public.incident
  for select to authenticated
  using (affected_id = auth.uid() or public.app_is_surgeon_of(affected_id));
create policy incident_insert_own on public.incident
  for insert to authenticated
  with check (affected_id = auth.uid() and mission_id = public.app_current_mission());
create policy incident_update_own on public.incident
  for update to authenticated
  using (affected_id = auth.uid())
  with check (affected_id = auth.uid() and mission_id = public.app_current_mission());

-- ---------------------------------------------------------------------------
-- Alerts: no mission_id column; mission comes from profile_id (Rev 2 · R5)
-- ---------------------------------------------------------------------------
create policy alert_select on public.alert
  for select to authenticated
  using (profile_id = auth.uid() or public.app_is_surgeon_of(profile_id));
create policy alert_insert_own on public.alert
  for insert to authenticated with check (profile_id = auth.uid());
create policy alert_update_owner_or_surgeon on public.alert                 -- mark attended (RF-05)
  for update to authenticated
  using (profile_id = auth.uid() or public.app_is_surgeon_of(profile_id))
  with check (profile_id = auth.uid() or public.app_is_surgeon_of(profile_id));

-- ---------------------------------------------------------------------------
-- Messages: recipients only see a message once it has arrived (RN-09)
-- ---------------------------------------------------------------------------
create policy message_select on public.message
  for select to authenticated
  using (sender_id = auth.uid() or (recipient_id = auth.uid() and arrives_at <= now()));
create policy message_insert_as_self on public.message
  for insert to authenticated
  with check (sender_id = auth.uid() and mission_id = public.app_current_mission());
create policy message_update_recipient on public.message                    -- read_at only (trigger)
  for update to authenticated
  using (recipient_id = auth.uid() and arrives_at <= now())
  with check (recipient_id = auth.uid());

-- ---------------------------------------------------------------------------
-- AI chat history: owner only
-- ---------------------------------------------------------------------------
create policy ai_message_select_own on public.ai_message
  for select to authenticated using (profile_id = auth.uid());
create policy ai_message_insert_own on public.ai_message
  for insert to authenticated with check (profile_id = auth.uid());
