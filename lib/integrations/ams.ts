// AMS / comparative-rater integration seam (BUILD_SPEC §18).
//
// Left intentionally as a single, clean interface to implement once Beach names
// his system (EZLynx, HawkSoft, Applied, NowCerts, …). Nothing else in the app
// needs to change — call pushLead(canonical) from the quote/lead flow when ready.

import type { CanonicalRecord } from "../canonical";

export interface AmsPushResult {
  ok: boolean;
  externalId?: string;
  message?: string;
}

export interface AmsClient {
  name: string;
  pushLead(canonical: CanonicalRecord, meta?: Record<string, unknown>): Promise<AmsPushResult>;
}

/** Default no-op client used until a real AMS is configured. */
export const noopAms: AmsClient = {
  name: "none",
  async pushLead() {
    return { ok: false, message: "No AMS configured. Implement lib/integrations/ams.ts for your system." };
  },
};

/** Returns the active AMS client. Swap this when Beach names his system. */
export function getAms(): AmsClient {
  // e.g. if (process.env.AMS_PROVIDER === "ezlynx") return ezLynxClient(...);
  return noopAms;
}
