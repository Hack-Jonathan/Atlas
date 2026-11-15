/**
 * Checks env validation: empty Supabase values are allowed in Stage 1
 * and only fail when a client is actually requested.
 */
import { describe, expect, it } from "vitest";

import { getSupabaseConfig, isSupabaseConfigured, parsePublicEnv } from "@/lib/env";

describe("parsePublicEnv", () => {
  it("treats missing and empty values as not configured", () => {
    expect(isSupabaseConfigured(parsePublicEnv({}))).toBe(false);
    const empty = parsePublicEnv({
      NEXT_PUBLIC_SUPABASE_URL: "",
      NEXT_PUBLIC_SUPABASE_ANON_KEY: "  ",
    });
    expect(isSupabaseConfigured(empty)).toBe(false);
  });

  it("is configured only when both values are filled", () => {
    const onlyUrl = parsePublicEnv({ NEXT_PUBLIC_SUPABASE_URL: "https://demo.supabase.co" });
    expect(isSupabaseConfigured(onlyUrl)).toBe(false);

    const full = parsePublicEnv({
      NEXT_PUBLIC_SUPABASE_URL: "https://demo.supabase.co",
      NEXT_PUBLIC_SUPABASE_ANON_KEY: "public-anon-key",
    });
    expect(isSupabaseConfigured(full)).toBe(true);
    expect(getSupabaseConfig(full)).toEqual({
      url: "https://demo.supabase.co",
      anonKey: "public-anon-key",
    });
  });

  it("rejects a malformed URL", () => {
    expect(() => parsePublicEnv({ NEXT_PUBLIC_SUPABASE_URL: "not a url" })).toThrow();
  });
});

describe("getSupabaseConfig", () => {
  it("throws a setup hint when not configured", () => {
    expect(() => getSupabaseConfig(parsePublicEnv({}))).toThrow(/Supabase is not configured/);
  });
});
