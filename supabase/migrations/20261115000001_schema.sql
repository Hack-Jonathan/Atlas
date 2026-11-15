-- =============================================================================
-- Atlas · Stage 2 · Schema (12 tables)
-- Source: Especificacion_del_sistema_Atlas_v2.0.md, Part 3 (ER model).
-- Names are in English by team decision; each table notes its spec (Spanish) name.
-- Enumerations are text + CHECK, mirrored by src/lib/db/enums.ts.
-- Requires Supabase's `auth.users` table (profile.id = auth.users.id).
-- =============================================================================

-- ---------------------------------------------------------------------------
-- Group A · Base catalogs (kept intact on demo reset, RN-20)
-- ---------------------------------------------------------------------------

-- indicador: scientific sheet + demonstration thresholds (1:1 rules).
create table public.indicator (
  id                    uuid primary key default gen_random_uuid(),
  code                  text not null unique check (code in (
                          'heart_rate','systolic_pressure','diastolic_pressure','glucose','temperature',
                          'sleep_hours','mood','bone_density','eye_exam','radiation_dose')),
  name                  text not null,
  system_code           text not null check (system_code in (
                          'cardiovascular','bone_muscle','neuro_ocular','behavioral_sleep',
                          'immune_metabolic','environment_radiation')),
  unit                  text not null,
  input_type            text not null check (input_type in ('number','scale','text')),
  is_self_assessed      boolean not null,
  valid_min             numeric not null,
  valid_max             numeric not null,
  suggested_frequency   text not null check (suggested_frequency in (
                          'continuous_telemetry','daily','weekly','monthly')),
  how_to_measure        text not null,
  why_it_matters        text not null,
  source                text not null,
  hazards               jsonb not null default '[]'::jsonb check (jsonb_typeof(hazards) = 'array'),
  normal_min            numeric,
  normal_max            numeric,
  alert_min             numeric,
  alert_max             numeric,
  yellow_deviation_pct  numeric check (yellow_deviation_pct > 0),
  red_deviation_pct     numeric check (red_deviation_pct > 0),
  trend_readings        int not null default 3 check (trend_readings >= 1),
  yellow_action         text not null,
  red_action            text not null,
  is_demo               boolean not null default true check (is_demo),  -- RN-02
  constraint indicator_valid_range check (valid_min <= valid_max),
  constraint indicator_normal_range check (normal_min is null or normal_max is null or normal_min <= normal_max),
  -- Thresholds must stay ordered so the traffic light keeps its meaning (RN-02/RN-04):
  -- red limits outside the green band, and the red deviation at or above the yellow one.
  constraint indicator_alert_below_normal check (alert_min is null or normal_min is null or alert_min <= normal_min),
  constraint indicator_alert_above_normal check (alert_max is null or normal_max is null or alert_max >= normal_max),
  constraint indicator_deviation_order check (
    yellow_deviation_pct is null or red_deviation_pct is null or yellow_deviation_pct <= red_deviation_pct)
);

-- escenario_incidente: documented acute-situation templates (RN-13).
create table public.incident_scenario (
  id           uuid primary key default gen_random_uuid(),
  code         text not null unique check (code in ('fainting_gravity','chest_pain','solar_storm')),
  name         text not null,
  description  text not null,
  source       text not null,
  steps        jsonb not null check (jsonb_typeof(steps) = 'array' and jsonb_array_length(steps) > 0)
);

-- articulo_biblioteca: verified knowledge cards (sources 01–06, RN-18).
create table public.library_article (
  id            uuid primary key default gen_random_uuid(),
  category      text not null check (category in ('indicator','hazard','risk','technology','system')),
  title         text not null,
  summary       text not null,
  content       text not null,
  source        text not null,
  indicator_id  uuid references public.indicator (id) on delete set null
);
create index library_article_indicator_idx on public.library_article (indicator_id);

-- ---------------------------------------------------------------------------
-- Group B · Context and configuration
-- ---------------------------------------------------------------------------

-- mision: active mission, phase and communication-delay parameters.
create table public.mission (
  id                uuid primary key default gen_random_uuid(),
  name              text not null,
  destination       text not null check (destination in ('low_earth_orbit','moon','mars')),
  start_date        date not null,
  current_phase     text not null check (current_phase in (
                      'preparation','outbound_transit','surface','return_transit','post_flight')),
  delay_seconds     int not null check (delay_seconds between 0 and 1200),  -- RN-10
  demo_factor       numeric not null check (demo_factor > 0),               -- RN-09
  active            boolean not null default true
);

-- perfil: extends auth.users with role and mission.
create table public.profile (
  id          uuid primary key references auth.users (id) on delete cascade,
  mission_id  uuid not null references public.mission (id),
  full_name   text not null,
  role        text not null check (role in ('astronaut','flight_surgeon')),
  title       text not null default '',
  created_at  timestamptz not null default now()
);
create index profile_mission_idx on public.profile (mission_id);

-- linea_base: personal reference per person and indicator (RN-05).
create table public.baseline (
  id               uuid primary key default gen_random_uuid(),
  profile_id       uuid not null references public.profile (id) on delete cascade,
  indicator_id     uuid not null references public.indicator (id) on delete cascade,
  reference_value  numeric not null,
  std_dev          numeric,
  sample_count     int not null default 0 check (sample_count >= 0),
  source           text not null check (source in ('calculated','manual')),
  updated_at       timestamptz not null default now(),
  constraint baseline_profile_indicator_key unique (profile_id, indicator_id),
  -- RN-05: a calculated baseline needs at least 5 readings; manual ones may have none.
  constraint baseline_calculated_min_samples check (source <> 'calculated' or sample_count >= 5)
);

-- ---------------------------------------------------------------------------
-- Group B · Transactional activity (cleared on demo reset, RN-20)
-- ---------------------------------------------------------------------------

-- chequeo: one guided self-assessment session.
create table public.checkup (
  id              uuid primary key default gen_random_uuid(),
  profile_id      uuid not null references public.profile (id) on delete cascade,
  mission_id      uuid not null references public.mission (id),
  started_at      timestamptz not null default now(),
  completed_at    timestamptz,
  status          text not null default 'in_progress' check (status in ('in_progress','completed','abandoned')),
  overall_result  text check (overall_result in ('green','yellow','red')),
  constraint checkup_completed_has_time check (status <> 'completed' or completed_at is not null)
);
create index checkup_profile_idx on public.checkup (profile_id, started_at);

-- incidente: an acute situation run by the astronaut (RN-12).
create table public.incident (
  id           uuid primary key default gen_random_uuid(),
  mission_id   uuid not null references public.mission (id),
  scenario_id  uuid not null references public.incident_scenario (id),
  affected_id  uuid not null references public.profile (id) on delete cascade,
  status       text not null default 'open' check (status in ('open','closed')),
  summary      text,
  events       jsonb not null default '[]'::jsonb check (jsonb_typeof(events) = 'array'),
  started_at   timestamptz not null default now(),
  closed_at    timestamptz,
  constraint incident_closed_needs_summary check (
    status <> 'closed' or (summary is not null and length(btrim(summary)) > 0 and closed_at is not null))
);
create index incident_affected_idx on public.incident (affected_id);

-- medicion: every single reading, its context and rule-engine result (RN-15).
create table public.measurement (
  id              uuid primary key default gen_random_uuid(),
  profile_id      uuid not null references public.profile (id) on delete cascade,
  mission_id      uuid not null references public.mission (id),
  indicator_id    uuid not null references public.indicator (id),
  checkup_id      uuid references public.checkup (id) on delete cascade,
  incident_id     uuid references public.incident (id) on delete cascade,
  numeric_value   numeric,
  text_value      text,
  image_url       text,
  measured_at     timestamptz not null default now(),
  mission_phase   text not null check (mission_phase in (
                    'preparation','outbound_transit','surface','return_transit','post_flight')),
  origin          text not null check (origin in ('manual','simulated')),
  traffic_light   text not null check (traffic_light in ('green','yellow','red')),
  deviation_pct   numeric,
  status_reason   text not null,  -- RN-04: always explain the color
  constraint measurement_has_value check (numeric_value is not null or text_value is not null)
);
create index measurement_trend_idx on public.measurement (profile_id, indicator_id, measured_at);
create index measurement_checkup_idx on public.measurement (checkup_id);

-- alerta: generated by the rules engine for values or sustained trends (RN-06/08).
-- No mission_id (as in the spec): its mission comes from profile_id.
create table public.alert (
  id              uuid primary key default gen_random_uuid(),
  profile_id      uuid not null references public.profile (id) on delete cascade,
  indicator_id    uuid not null references public.indicator (id),
  measurement_id  uuid references public.measurement (id) on delete cascade,
  type            text not null check (type in ('value','trend')),
  level           text not null check (level in ('yellow','red')),
  message         text not null,
  status          text not null default 'active' check (status in ('active','attended','dismissed')),
  created_at      timestamptz not null default now(),
  attended_at     timestamptz
);
create index alert_profile_idx on public.alert (profile_id, status);

-- mensaje: delayed ship–ground communication (RN-08…RN-12).
create table public.message (
  id             uuid primary key default gen_random_uuid(),
  mission_id     uuid not null references public.mission (id),
  sender_id      uuid not null references public.profile (id) on delete cascade,
  recipient_id   uuid not null references public.profile (id) on delete cascade,
  type           text not null check (type in ('message','checkup_report','incident_report','critical_alert','reply')),
  priority       text not null default 'normal' check (priority in ('normal','high','urgent')),
  subject        text not null,
  body           text not null,
  checkup_id     uuid references public.checkup (id) on delete set null,
  incident_id    uuid references public.incident (id) on delete set null,
  alert_id       uuid references public.alert (id) on delete set null,
  reply_to_id    uuid references public.message (id) on delete set null,
  sent_at        timestamptz not null default now(),
  arrives_at     timestamptz not null default now(),
  read_at        timestamptz,
  constraint message_not_to_self check (sender_id <> recipient_id),
  constraint message_critical_has_alert check (type <> 'critical_alert' or alert_id is not null)
);
create index message_recipient_idx on public.message (recipient_id, arrives_at);
create index message_sender_idx on public.message (sender_id, sent_at);

-- mensaje_ia: AI assistant chat history.
create table public.ai_message (
  id            uuid primary key default gen_random_uuid(),
  profile_id    uuid not null references public.profile (id) on delete cascade,
  role          text not null check (role in ('user','assistant')),
  content       text not null,
  context_used  text,
  created_at    timestamptz not null default now()
);
create index ai_message_profile_idx on public.ai_message (profile_id, created_at);

-- =============================================================================
-- Triggers
-- =============================================================================

-- True when the current database role is a client role (not the seed/admin).
create or replace function public.app_is_client_role()
returns boolean
language sql
stable
set search_path = ''
as $$
  select current_user in ('authenticated', 'anon');
$$;

-- RN-09: arrival time is computed by the server, never trusted from clients.
-- Client roles get sent_at = now(); privileged roles (seed) may set history.
create or replace function public.message_set_arrival()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  m_delay int;
  m_factor numeric;
begin
  if public.app_is_client_role() then
    new.sent_at := now();
    new.read_at := null;
  end if;
  select delay_seconds, demo_factor into m_delay, m_factor
  from public.mission where id = new.mission_id;
  if m_delay is null then
    raise exception 'Mission % not found for message', new.mission_id;
  end if;
  new.arrives_at := new.sent_at + make_interval(secs => m_delay / m_factor);
  return new;
end;
$$;

create trigger message_set_arrival
  before insert on public.message
  for each row execute function public.message_set_arrival();

-- RN-11: a sent message is immutable; only read_at may change; no deletes.
create or replace function public.message_immutable()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if tg_op = 'DELETE' then
    if public.app_is_client_role() then
      raise exception 'Messages cannot be deleted (RN-11)';
    end if;
    return old;
  end if;
  -- Compare the whole row (every column, id included) except read_at.
  if (to_jsonb(new) - 'read_at') is distinct from (to_jsonb(old) - 'read_at') then
    raise exception 'Sent messages are immutable; only read_at can change (RN-11)';
  end if;
  return new;
end;
$$;

create trigger message_immutable
  before update or delete on public.message
  for each row execute function public.message_immutable();

-- Cross-record consistency: owners, missions and linked records must agree.
-- Runs for every role (seed included) so even demo data stays coherent.
-- SECURITY DEFINER so lookups are not hidden by RLS (it only reads, never writes).
create or replace function public.enforce_owner_consistency()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  owner_mission uuid;
  sender_mission uuid;
  recipient_mission uuid;
  linked_owner uuid;
  linked_mission uuid;
  linked_indicator uuid;
begin
  -- Ownership and identity never change once a row exists, so links that were
  -- validated on insert stay valid (no re-pointing referenced records).
  -- One branch per table: PL/pgSQL resolves every NEW.field in an expression.
  if tg_op = 'UPDATE' then
    if tg_table_name = 'checkup' then
      if (new.profile_id, new.mission_id) is distinct from (old.profile_id, old.mission_id) then
        raise exception 'checkup ownership and links cannot change after creation';
      end if;
    elsif tg_table_name = 'incident' then
      if (new.affected_id, new.mission_id, new.scenario_id)
         is distinct from (old.affected_id, old.mission_id, old.scenario_id) then
        raise exception 'incident ownership and links cannot change after creation';
      end if;
    elsif tg_table_name = 'measurement' then
      if (new.profile_id, new.mission_id, new.indicator_id, new.checkup_id, new.incident_id)
         is distinct from (old.profile_id, old.mission_id, old.indicator_id, old.checkup_id, old.incident_id) then
        raise exception 'measurement ownership and links cannot change after creation';
      end if;
    elsif tg_table_name = 'alert' then
      if (new.profile_id, new.indicator_id, new.measurement_id)
         is distinct from (old.profile_id, old.indicator_id, old.measurement_id) then
        raise exception 'alert ownership and links cannot change after creation';
      end if;
    end if;
  end if;

  if tg_table_name = 'checkup' then
    select mission_id into owner_mission from public.profile where id = new.profile_id;
    if owner_mission is distinct from new.mission_id then
      raise exception 'checkup.mission_id must match the owner''s mission';
    end if;

  elsif tg_table_name = 'incident' then
    select mission_id into owner_mission from public.profile where id = new.affected_id;
    if owner_mission is distinct from new.mission_id then
      raise exception 'incident.mission_id must match the affected profile''s mission';
    end if;

  elsif tg_table_name = 'measurement' then
    -- RN-07 at the database boundary: numeric indicators need a finite value
    -- inside the indicator's physically plausible range.
    declare
      ind_type text;
      ind_min numeric;
      ind_max numeric;
    begin
      select input_type, valid_min, valid_max into ind_type, ind_min, ind_max
      from public.indicator where id = new.indicator_id;
      if ind_type in ('number', 'scale') then
        if new.numeric_value is null or new.numeric_value = 'NaN'::numeric
           or new.numeric_value in ('Infinity'::numeric, '-Infinity'::numeric) then
          raise exception 'measurement needs a finite numeric value for this indicator (RN-07)';
        end if;
        if new.numeric_value < ind_min or new.numeric_value > ind_max then
          raise exception 'measurement value % is outside the plausible range [%, %] (RN-07)',
            new.numeric_value, ind_min, ind_max;
        end if;
      end if;
    end;
    select mission_id into owner_mission from public.profile where id = new.profile_id;
    if owner_mission is distinct from new.mission_id then
      raise exception 'measurement.mission_id must match the owner''s mission';
    end if;
    if new.checkup_id is not null then
      select profile_id into linked_owner from public.checkup where id = new.checkup_id;
      if linked_owner is distinct from new.profile_id then
        raise exception 'measurement.checkup_id belongs to another profile';
      end if;
    end if;
    if new.incident_id is not null then
      select affected_id into linked_owner from public.incident where id = new.incident_id;
      if linked_owner is distinct from new.profile_id then
        raise exception 'measurement.incident_id belongs to another profile';
      end if;
    end if;

  elsif tg_table_name = 'alert' then
    if new.measurement_id is not null then
      select profile_id, indicator_id into linked_owner, linked_indicator
      from public.measurement where id = new.measurement_id;
      if linked_owner is distinct from new.profile_id or linked_indicator is distinct from new.indicator_id then
        raise exception 'alert.measurement_id must belong to the same profile and indicator';
      end if;
    end if;

  elsif tg_table_name = 'message' then
    select mission_id into sender_mission from public.profile where id = new.sender_id;
    select mission_id into recipient_mission from public.profile where id = new.recipient_id;
    if sender_mission is distinct from new.mission_id or recipient_mission is distinct from new.mission_id then
      raise exception 'message sender and recipient must belong to message.mission_id';
    end if;
    if new.checkup_id is not null then
      select profile_id, mission_id into linked_owner, linked_mission from public.checkup where id = new.checkup_id;
      if linked_owner not in (new.sender_id, new.recipient_id) or linked_mission is distinct from new.mission_id then
        raise exception 'message.checkup_id must belong to the sender or recipient in this mission';
      end if;
    end if;
    if new.incident_id is not null then
      select affected_id, mission_id into linked_owner, linked_mission from public.incident where id = new.incident_id;
      if linked_owner not in (new.sender_id, new.recipient_id) or linked_mission is distinct from new.mission_id then
        raise exception 'message.incident_id must belong to the sender or recipient in this mission';
      end if;
    end if;
    if new.alert_id is not null then
      select a.profile_id, p.mission_id into linked_owner, linked_mission
      from public.alert a join public.profile p on p.id = a.profile_id where a.id = new.alert_id;
      if linked_owner not in (new.sender_id, new.recipient_id) or linked_mission is distinct from new.mission_id then
        raise exception 'message.alert_id must belong to the sender or recipient in this mission';
      end if;
    end if;
    if new.reply_to_id is not null then
      select mission_id into linked_mission from public.message where id = new.reply_to_id;
      if linked_mission is distinct from new.mission_id then
        raise exception 'message.reply_to_id must be in the same mission';
      end if;
    end if;
  end if;
  return new;
end;
$$;

-- A profile's mission is fixed once it has mission-bound activity, so historical
-- records stay in their recorded mission and are never exposed to another
-- mission's surgeon (access is resolved through profile.mission_id).
create or replace function public.profile_mission_locked()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.mission_id is distinct from old.mission_id and (
       exists (select 1 from public.checkup where profile_id = old.id)
    or exists (select 1 from public.measurement where profile_id = old.id)
    or exists (select 1 from public.incident where affected_id = old.id)
    or exists (select 1 from public.alert where profile_id = old.id)
    or exists (select 1 from public.message where sender_id = old.id or recipient_id = old.id)
    or exists (select 1 from public.baseline where profile_id = old.id)) then
    raise exception 'profile.mission_id cannot change once the profile has mission activity';
  end if;
  return new;
end;
$$;

create trigger profile_mission_locked
  before update of mission_id on public.profile
  for each row execute function public.profile_mission_locked();

create trigger checkup_consistency before insert or update on public.checkup
  for each row execute function public.enforce_owner_consistency();
create trigger incident_consistency before insert or update on public.incident
  for each row execute function public.enforce_owner_consistency();
create trigger measurement_consistency before insert or update on public.measurement
  for each row execute function public.enforce_owner_consistency();
create trigger alert_consistency before insert or update on public.alert
  for each row execute function public.enforce_owner_consistency();
-- (Its checks do not depend on arrival time, so trigger order is irrelevant.)
create trigger message_consistency before insert or update on public.message
  for each row execute function public.enforce_owner_consistency();
