// ─────────────────────────────────────────────────────────────────────────────
// Feature configuration. Every external integration is gated on the presence of
// its credentials, so the app runs end-to-end with zero config (demo mode) and
// going live is a "flip the switch" exercise (BUILD_SPEC §1, §4, §13).
// ─────────────────────────────────────────────────────────────────────────────

import { DEV_SECRET } from "./session";

function has(v: string | undefined | null): boolean {
  return typeof v === "string" && v.trim().length > 0;
}

export const config = {
  // Supabase is the trigger for "real" persistence. Without it we use the
  // in-memory demo store. DEMO_MODE=false is ignored unless Supabase is set.
  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
    serviceKey: process.env.SUPABASE_SERVICE_ROLE_KEY ?? "",
    get enabled() {
      return has(this.url) && has(this.anonKey);
    },
  },

  anthropic: {
    apiKey: process.env.ANTHROPIC_API_KEY ?? "",
    extractionModel: process.env.ANTHROPIC_EXTRACTION_MODEL || "claude-sonnet-4-6",
    classifyModel: process.env.ANTHROPIC_CLASSIFY_MODEL || "claude-haiku-4-5-20251001",
    get enabled() {
      return has(this.apiKey);
    },
  },

  cal: {
    link: process.env.NEXT_PUBLIC_CAL_LINK ?? "",
    webhookSecret: process.env.CAL_WEBHOOK_SECRET ?? "",
    get enabled() {
      return has(this.link);
    },
  },

  resend: {
    apiKey: process.env.RESEND_API_KEY ?? "",
    from: process.env.EMAIL_FROM || "Beach Stanton Insurance <hello@beachstanton.com>",
    agentAlertEmail: process.env.AGENT_ALERT_EMAIL || "beach@beachstanton.com",
    get enabled() {
      return has(this.apiKey);
    },
  },

  twilio: {
    enabled: process.env.SMS_ENABLED === "true",
    accountSid: process.env.TWILIO_ACCOUNT_SID ?? "",
    authToken: process.env.TWILIO_AUTH_TOKEN ?? "",
    from: process.env.TWILIO_FROM_NUMBER ?? "",
    get ready() {
      return this.enabled && has(this.accountSid) && has(this.authToken) && has(this.from);
    },
  },

  authSecret: process.env.AUTH_SECRET || DEV_SECRET,

  // PII gate: when false, document binaries are dropped post-extraction and
  // sensitive columns are not persisted beyond the active session.
  piiStorageEnabled: process.env.PII_STORAGE_ENABLED === "true",
};

/** True when we are running against the in-memory seeded demo store. */
export function isDemoMode(): boolean {
  if (config.supabase.enabled && process.env.DEMO_MODE !== "true") return false;
  return true;
}

/** Agency contact details surfaced throughout the UI + documents. */
export const AGENCY = {
  name: "Beach Stanton Insurance",
  tagline: "Independent. Local. On your side.",
  address: "34400 Date Palm Dr, Ste O, Cathedral City, CA 92234",
  phone: "(760) 324-1144",
  license: "CA License #0H44120",
  email: "hello@beachstanton.com",
};
