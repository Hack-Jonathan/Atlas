/**
 * Local PostgreSQL (PGlite, in-process WebAssembly) with Atlas's migrations
 * and seeds applied. Used by the history generator and by the database tests,
 * so both run the exact SQL that will be applied to Supabase.
 *
 * Supabase provides an `auth` schema and the roles anon / authenticated /
 * service_role; PGlite does not, so a minimal stand-in is installed first.
 * The stand-in lives only here — the real migrations never create `auth`.
 */
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { PGlite } from "@electric-sql/pglite";

export const SUPABASE_DIR = join(process.cwd(), "supabase");

/** Fixed demo ids from supabase/seed/02_demo.sql. */
export const DEMO = {
  mission: "00000000-0000-4000-a000-000000000001",
  astronaut: "00000000-0000-4000-a000-0000000000a1",
  surgeon: "00000000-0000-4000-a000-0000000000b1",
} as const;

/** Minimal Supabase auth stand-in: roles, auth.users/identities, auth.uid(). */
const AUTH_STUB = `
  create role anon nologin;
  create role authenticated nologin;
  create role service_role nologin bypassrls;
  create schema auth;
  create table auth.users (
    id uuid primary key, instance_id uuid, aud text, role text, email text unique,
    encrypted_password text, email_confirmed_at timestamptz,
    raw_app_meta_data jsonb, raw_user_meta_data jsonb,
    created_at timestamptz, updated_at timestamptz,
    confirmation_token text, recovery_token text, email_change text,
    email_change_token_new text, email_change_token_current text,
    phone_change text, phone_change_token text, reauthentication_token text
  );
  create table auth.identities (
    id uuid primary key, user_id uuid references auth.users(id) on delete cascade,
    provider_id text, provider text, identity_data jsonb,
    created_at timestamptz, updated_at timestamptz
  );
  create function auth.uid() returns uuid language sql stable as $$
    select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid
  $$;
  grant usage on schema auth to anon, authenticated, service_role;
  grant usage on schema public to anon, authenticated, service_role;
  -- Supabase grants broad default privileges on public objects; mimic that so
  -- the migrations' explicit REVOKEs are really exercised.
  alter default privileges in schema public grant all on tables to anon, authenticated, service_role;
  alter default privileges in schema public grant all on functions to anon, authenticated, service_role;
`;

/** Sorted .sql files of a folder under supabase/. */
export function sqlFiles(dir: "migrations" | "seed"): string[] {
  return readdirSync(join(SUPABASE_DIR, dir))
    .filter((f) => f.endsWith(".sql"))
    .sort()
    .map((f) => join(SUPABASE_DIR, dir, f));
}

/**
 * Boots PGlite, installs the auth stand-in, applies all migrations and the
 * seed files accepted by `includeSeed` (default: all).
 */
export async function createLocalDb(
  includeSeed: (fileName: string) => boolean = () => true,
): Promise<PGlite> {
  const db = new PGlite();
  await db.exec(AUTH_STUB);
  for (const file of sqlFiles("migrations")) {
    await db.exec(readFileSync(file, "utf8"));
  }
  for (const file of sqlFiles("seed")) {
    if (includeSeed(file)) await db.exec(readFileSync(file, "utf8"));
  }
  return db;
}
