import { bad, ok, readJson } from "@/lib/api";
import { getCurrentUser } from "@/lib/auth";
import { getDb } from "@/lib/db";
import type { CanonicalRecord } from "@/lib/canonical";
import { normalizeExtraction } from "@/lib/extraction/extract";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) return bad("Not authenticated.", 401);

  const db = getDb();
  const doc = db.getDocument(params.id);
  if (!doc) return bad("Document not found.", 404);
  if (user.role !== "agent" && doc.ownerUserId !== user.id) return bad("Forbidden.", 403);

  const body = await readJson<{ record?: CanonicalRecord; reviewed?: boolean }>(req);
  if (!body) return bad("Invalid request body.");

  if (body.record) {
    const record = normalizeExtraction(body.record as unknown as Record<string, unknown>);
    db.updateDocumentRecord(doc.id, record, body.reviewed);
  } else if (typeof body.reviewed === "boolean") {
    db.updateDocumentRecord(doc.id, doc.record, body.reviewed);
  }

  db.addAudit({
    actorId: user.id, actorEmail: user.email, action: "document.reviewed", entity: "document", entityId: doc.id,
    meta: { reviewed: db.getDocument(doc.id)?.reviewed },
  });

  return ok({ document: db.getDocument(doc.id) });
}
