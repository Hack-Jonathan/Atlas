-- =============================================================================
-- Atlas · Seed 02 · Demo mission and the two demo accounts
-- Fictional people only (RNF-06). Fixed UUIDs so the generated history (seed 03)
-- can reference them. Demo password for both accounts: atlas-demo-2026
-- (bcrypt hash below; demo-only — change it for any real deployment).
-- Inserting into auth.users / auth.identities is Supabase's documented local-seed
-- pattern; only columns present in Supabase's auth schema are used.
-- =============================================================================

-- Active mission: Mars transit, 20-minute one-way delay (RN-10), shown 60× faster
-- in the demo (RN-09: 1200 s / 60 = 20 s). Day 1 of transit was 65 days ago.
insert into public.mission (id, name, destination, start_date, current_phase, delay_seconds, demo_factor, active)
values (
  '00000000-0000-4000-a000-000000000001',
  'Ares-IV (Mars transit)',
  'mars',
  current_date - 65,
  'outbound_transit',
  1200,
  60,
  true
);

-- Auth users (astronaut + flight surgeon).
insert into auth.users (
  id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at
) values
(
  '00000000-0000-4000-a000-0000000000a1', '00000000-0000-0000-0000-000000000000',
  'authenticated', 'authenticated', 'astronaut@atlas.demo',
  '$2a$10$PVyElrQIMkpSLGN/TBLmiO5qh0Omi7pbdzPzjVFHJ4UNg0i/TDHdm', now(),
  '{"provider":"email","providers":["email"]}', '{"full_name":"Elena Ríos"}', now(), now()
),
(
  '00000000-0000-4000-a000-0000000000b1', '00000000-0000-0000-0000-000000000000',
  'authenticated', 'authenticated', 'surgeon@atlas.demo',
  '$2a$10$PVyElrQIMkpSLGN/TBLmiO5qh0Omi7pbdzPzjVFHJ4UNg0i/TDHdm', now(),
  '{"provider":"email","providers":["email"]}', '{"full_name":"Dr. Samuel Okafor"}', now(), now()
);

-- Email identities so the accounts can sign in with email + password.
insert into auth.identities (id, user_id, provider_id, provider, identity_data, created_at, updated_at)
values
(
  '00000000-0000-4000-a000-0000000000a2', '00000000-0000-4000-a000-0000000000a1',
  '00000000-0000-4000-a000-0000000000a1', 'email',
  '{"sub":"00000000-0000-4000-a000-0000000000a1","email":"astronaut@atlas.demo","email_verified":true}',
  now(), now()
),
(
  '00000000-0000-4000-a000-0000000000b2', '00000000-0000-4000-a000-0000000000b1',
  '00000000-0000-4000-a000-0000000000b1', 'email',
  '{"sub":"00000000-0000-4000-a000-0000000000b1","email":"surgeon@atlas.demo","email_verified":true}',
  now(), now()
);

-- Profiles (role + mission).
insert into public.profile (id, mission_id, full_name, role, title) values
(
  '00000000-0000-4000-a000-0000000000a1', '00000000-0000-4000-a000-000000000001',
  'Elena Ríos', 'astronaut', 'Mission specialist'
),
(
  '00000000-0000-4000-a000-0000000000b1', '00000000-0000-4000-a000-000000000001',
  'Dr. Samuel Okafor', 'flight_surgeon', 'Flight surgeon · Ground control'
);
