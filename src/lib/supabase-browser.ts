// Browser-only Supabase client. Imported by 'use client' pages.
// Separated from supabase.ts so Next.js never bundles next/headers into client code.

import { createBrowserClient } from '@supabase/ssr';

export function createBrowserSupabase() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
