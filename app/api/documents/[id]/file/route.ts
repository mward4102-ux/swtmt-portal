import { NextResponse } from "next/server";
import { bad } from "@/lib/api";
import { getCurrentUser } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { readSampleBuffer } from "@/lib/samples-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Auth-gated binary access (BUILD_SPEC §13: signed access, never public buckets).
export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) return bad("Not authenticated.", 401);

  const db = getDb();
  const doc = db.getDocument(params.id);
  if (!doc) return bad("Document not found.", 404);
  if (user.role !== "agent" && doc.ownerUserId !== user.id) return bad("Forbidden.", 403);

  if (doc.sampleId && doc.binaryRetained) {
    const buf = await readSampleBuffer(doc.sampleId);
    if (buf) {
      return new NextResponse(new Uint8Array(buf), {
        headers: {
          "Content-Type": doc.mime || "application/pdf",
          "Content-Disposition": `inline; filename="${doc.fileName}"`,
          "Cache-Control": "private, no-store",
        },
      });
    }
  }

  return bad("Binary not retained — dropped after extraction (PII storage disabled).", 410);
}
