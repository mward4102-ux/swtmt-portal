// Supabase client factories for the go-live path (BUILD_SPEC §2, §3, §13).
//
// Unused in demo mode (the in-memory store is the live backend). Wired here so
// the switch is config-only: implement a SupabaseStore in lib/db using these
// clients and return it from getDb() when config.supabase.enabled.
//
//  - browserClient(): anon key, for 'use client' code.
//  - serverClient():  request-scoped, reads the auth cookie (RLS as the user).
//  - serviceClient(): service-role key, server/functions only — bypasses RLS.

import { config } from "./config";

export async function browserClient() {
  const { createBrowserClient } = await import("@supabase/ssr");
  return createBrowserClient(config.supabase.url, config.supabase.anonKey);
}

export async function serverClient() {
  const { createServerClient } = await import("@supabase/ssr");
  const { cookies } = await import("next/headers");
  const cookieStore = cookies();
  return createServerClient(config.supabase.url, config.supabase.anonKey, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (toSet: { name: string; value: string; options?: Record<string, unknown> }[]) => {
        try {
          toSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options as never));
        } catch {
          /* called from a Server Component — safe to ignore */
        }
      },
    },
  });
}

export async function serviceClient() {
  const { createClient } = await import("@supabase/supabase-js");
  return createClient(config.supabase.url, config.supabase.serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
