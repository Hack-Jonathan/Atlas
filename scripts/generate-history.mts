/**
 * CLI: regenerates supabase/seed/03_history.sql (npm run db:generate-history).
 * Deterministic: running it twice produces the same file.
 */
import { writeFileSync } from "node:fs";
import { join } from "node:path";

import { buildHistorySql } from "./db/history-sql";
import { SUPABASE_DIR } from "./db/local-db";

const target = join(SUPABASE_DIR, "seed", "03_history.sql");
const sql = await buildHistorySql();
writeFileSync(target, sql, "utf8");
console.log(`Wrote ${target} (${sql.length} characters).`);
