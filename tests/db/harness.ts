/**
 * Database test helpers: a fresh PGlite database (migrations + seeds, see
 * scripts/db/local-db.ts) and `as()`, which runs SQL as a given role/user so
 * Row Level Security is exercised exactly as in Supabase.
 */
import type { PGlite } from "@electric-sql/pglite";

import { createLocalDb, DEMO } from "../../scripts/db/local-db";

export { DEMO };

export interface TestDb {
  db: PGlite;
  /** Runs one statement as `role` with `auth.uid() = userId`, then resets to the superuser. */
  as<T = Record<string, unknown>>(
    role: "anon" | "authenticated",
    userId: string | null,
    sql: string,
    params?: unknown[],
  ): Promise<T[]>;
}

/** Creates a fresh database. With `seed: false` only the migrations are applied. */
export async function createTestDb(options: { seed?: boolean } = {}): Promise<TestDb> {
  const db = await createLocalDb(() => options.seed !== false);

  async function as<T>(
    role: "anon" | "authenticated",
    userId: string | null,
    sql: string,
    params: unknown[] = [],
  ): Promise<T[]> {
    await db.query("select set_config('request.jwt.claim.sub', $1, false)", [userId ?? ""]);
    await db.exec(`set role ${role}`);
    try {
      return (await db.query<T>(sql, params)).rows;
    } finally {
      await db.exec("reset role");
      await db.query("select set_config('request.jwt.claim.sub', '', false)");
    }
  }

  return { db, as };
}
