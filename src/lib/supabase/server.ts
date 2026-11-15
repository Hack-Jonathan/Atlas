/**
 * Supabase client for Server Components, Server Actions and Route Handlers.
 * It reads/writes the auth session through Next.js cookies.
 * Not used in Stage 1; create a new client per request, never share one.
 */
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

import { getSupabaseConfig } from "@/lib/env";

/**
 * Creates a server Supabase client bound to the current request cookies.
 * @throws Error when the Supabase env variables are still empty.
 */
export async function createSupabaseServerClient() {
  const { url, anonKey } = getSupabaseConfig();
  const cookieStore = await cookies();

  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch {
          // Server Components cannot set cookies; a proxy/middleware
          // (added with authentication in a later stage) refreshes the session.
        }
      },
    },
  });
}
