/**
 * Supabase client for Client Components (runs in the browser).
 * Not used in Stage 1; it is wired now so later stages only need to call it.
 */
import { createBrowserClient } from "@supabase/ssr";

import { getSupabaseConfig } from "@/lib/env";

/**
 * Creates a browser Supabase client.
 * @throws Error when the Supabase env variables are still empty.
 */
export function createSupabaseBrowserClient() {
  const { url, anonKey } = getSupabaseConfig();
  return createBrowserClient(url, anonKey);
}
