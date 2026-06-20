// Data-layer facade. Returns the active store as a process-wide singleton.
//
// Demo mode → in-memory seeded store (the live backend out of the box).
// To go live: implement a SupabaseStore with the same surface as MemoryStore
// (see supabase/schema.sql + supabase/policies.sql) and return it here when
// config.supabase.enabled. That is the ONLY switch site — nothing else in the
// app talks to a backend directly. (BUILD_SPEC §1, §2, §13.)

import { MemoryStore } from "./store";

const g = globalThis as unknown as { __BSI_STORE__?: MemoryStore };

export function getDb(): MemoryStore {
  if (!g.__BSI_STORE__) {
    g.__BSI_STORE__ = new MemoryStore();
  }
  return g.__BSI_STORE__;
}

export type { LeadSummary } from "./store";
