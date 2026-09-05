import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { createClient as createSupabaseAdminClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

/**
 * Server-side Supabase client.
 * Use in Server Components, API routes, and middleware.
 * Reads the session from the HTTP cookie jar — no client-side exposure.
 * Never exposes the service-role key to the browser (per TRD §9, RULES.md).
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // setAll called from a Server Component — cookies cannot be set.
            // Session refresh is handled by middleware instead.
          }
        },
      },
    }
  );
}

/**
 * Service-role Supabase client.
 * ONLY for server-side admin operations that bypass RLS.
 * Never imported by or passed to any client-facing module (per TRD §9, RULES.md).
 *
 * Uses a top-level ES import (aliased) so tree-shaking and server-only module
 * boundaries keep this out of the browser bundle.
 */
export function createServiceClient() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set — server-side admin operations will fail.");
  }
  return createSupabaseAdminClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceKey, {
    auth: { persistSession: false },
  });
}
