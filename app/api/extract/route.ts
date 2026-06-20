import { createHash } from "node:crypto";
import { bad, ok, readJson } from "@/lib/api";
import { getCurrentUser } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { extract } from "@/lib/extraction/extract";
import { SAMPLE_BY_ID } from "@/lib/samples";
import { readSampleBuffer } from "@/lib/samples-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BYTES = 15 * 1024 * 1024;

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return bad("Not authenticated.", 401);

  const body = await readJson<{ sampleId?: string; base64?: string; mime?: string; fileName?: string }>(req);
  if (!body) return bad("Invalid request body.");

  let base64: string;
  let mime: string;
  let fileName: string;
  let sizeBytes: number;

  if (body.sampleId) {
    const sample = SAMPLE_BY_ID[body.sampleId];
    const buf = sample ? await readSampleBuffer(body.sampleId) : null;
    if (!sample || !buf) return bad("Unknown sample.", 404);
    base64 = buf.toString("base64");
    mime = "application/pdf";
    fileName = sample.fileName;
    sizeBytes = buf.length;
  } else {
    if (!body.base64 || !body.mime) return bad("Provide a file (base64 + mime) or a sampleId.");
    const approxBytes = Math.floor((body.base64.length * 3) / 4);
    if (approxBytes > MAX_BYTES) return bad("File is too large (max 15 MB).", 413);
    base64 = body.base64;
    mime = body.mime;
    fileName = body.fileName ?? "upload";
    sizeBytes = approxBytes;
  }

  const sha256 = createHash("sha256").update(Buffer.from(base64, "base64")).digest("hex");
  const result = await extract({ base64, mime, fileName, sha256 });

  getDb().addAudit({
    actorId: user.id, actorEmail: user.email, action: "document.scanned", entity: "document", entityId: sha256.slice(0, 12),
    meta: { doc_type: result.record.doc_type, mode: result.mode, needs_review: result.record.needs_review },
  });

  return ok({
    record: result.record,
    mode: result.mode,
    message: result.message ?? null,
    sample: result.sample ? { id: result.sample.id, title: result.sample.title, docType: result.sample.docType } : null,
    fileName,
    mime,
    sizeBytes,
    sampleId: body.sampleId ?? result.sample?.id ?? null,
    sha256,
  });
}
