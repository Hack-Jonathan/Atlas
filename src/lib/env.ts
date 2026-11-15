/**
 * Environment variables, validated with Zod (RNF-07).
 *
 * In Stage 1 the Supabase project does not exist yet, so empty values are
 * allowed and simply mean "not configured". Nothing fails until code
 * actually asks for a Supabase client.
 */
import { z } from "zod";

/** Treats `""` (and missing values) as "not set" before validating. */
function optionalValue<T extends z.ZodType>(schema: T) {
  return z.preprocess(
    (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
    schema.optional(),
  );
}

/** Variables exposed to the browser (prefix `NEXT_PUBLIC_`). */
const publicEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: optionalValue(z.url()),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: optionalValue(z.string().min(1)),
});

export type PublicEnv = z.infer<typeof publicEnvSchema>;

/** Raw input shape accepted by the parser (useful for tests). */
export type RawPublicEnv = Partial<Record<keyof PublicEnv, string | undefined>>;

/**
 * Validates a set of public variables.
 * @throws ZodError when a value is present but malformed (e.g. a bad URL).
 */
export function parsePublicEnv(source: RawPublicEnv): PublicEnv {
  return publicEnvSchema.parse(source);
}

/**
 * Reads the public variables of the running app.
 * Each variable is referenced explicitly so Next.js can inline it in the browser bundle.
 */
export function getPublicEnv(): PublicEnv {
  return parsePublicEnv({
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  });
}

/** True when both Supabase URL and anon key are filled in. */
export function isSupabaseConfigured(env: PublicEnv = getPublicEnv()): boolean {
  return Boolean(env.NEXT_PUBLIC_SUPABASE_URL && env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

/**
 * Returns the Supabase connection values.
 * @throws Error with setup instructions when Supabase is not configured yet.
 */
export function getSupabaseConfig(env: PublicEnv = getPublicEnv()): {
  url: string;
  anonKey: string;
} {
  const url = env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    throw new Error(
      "Supabase is not configured: fill NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local (see .env.example).",
    );
  }
  return { url, anonKey };
}
