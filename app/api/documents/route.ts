import { bad, ok, readJson } from "@/lib/api";
import { getCurrentUser } from "@/lib/auth";
import { config } from "@/lib/config";
import { getDb } from "@/lib/db";
import type { CanonicalRecord } from "@/lib/canonical";
import { normalizeExtraction } from "@/lib/extraction/extract";
import type { DocSource } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface SaveBody {
  record?: CanonicalRecord;
  fileName?: string;
  mime?: string;
  sizeBytes?: number;
  sampleId?: string;
  source?: DocSource;
  reviewed?: boolean;
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return bad("Not authenticated.", 401);

  const body = await readJson<SaveBody>(req);
  if (!body?.record || typeof body.record !== "object") return bad("A canonical record is required.");

  // Re-normalize the (possibly edited) record so the stored shape is always whole
  // and confidence/needs_review are recomputed from the final values.
  const record = normalizeExtraction(body.record as unknown as Record<string, unknown>);

  const db = getDb();
  const ownerUserId = user.role === "customer" ? user.id : null;
  const lead = db.findOrCreateLead(record, ownerUserId);

  const doc = db.addDocument({
    leadId: lead.id,
    ownerUserId,
    fileName: body.fileName ?? "document.pdf",
    docType: record.doc_type,
    mime: body.mime ?? "application/pdf",
    sizeBytes: body.sizeBytes ?? 0,
    record,
    binaryRetained: body.sampleId ? true : config.piiStorageEnabled,
    sampleId: body.sampleId,
    source: body.source ?? (body.sampleId ? "sample" : "upload"),
    reviewed: body.reviewed ?? !record.needs_review,
  });

  if (lead.status === "new" && user.role === "customer") db.setLeadStatus(lead.id, "in_progress");

  db.addAudit({
    actorId: user.id, actorEmail: user.email, action: "document.saved", entity: "document", entityId: doc.id,
    meta: { doc_type: doc.docType, leadId: lead.id, needs_review: record.needs_review, pii_retained: doc.binaryRetained },
  });

  return ok({ document: doc, lead });
}
