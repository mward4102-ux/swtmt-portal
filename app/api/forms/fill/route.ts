import { NextResponse } from "next/server";
import { bad } from "@/lib/api";
import { getCurrentUser } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { fillFormForLead } from "@/lib/forms/plan";
import type { QuoteLineType } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const user = await getCurrentUser();
  if (!user) return bad("Not authenticated.", 401);
  if (user.role !== "agent") return bad("Forbidden.", 403);

  const sp = new URL(req.url).searchParams;
  const leadId = sp.get("leadId");
  const form = sp.get("form");
  const line = sp.get("line") as QuoteLineType | null;
  if (!leadId || !form || !line) return bad("leadId, form and line are required.");

  const db = getDb();
  const summary = db.getLeadSummary(leadId);
  if (!summary) return bad("Lead not found.", 404);

  const filled = await fillFormForLead(summary.documents, line, form);
  if (!filled) return bad("Form not found.", 404);

  db.addAudit({
    actorId: user.id, actorEmail: user.email, action: "form.generated", entity: "lead", entityId: leadId,
    meta: { form, line, filledCount: filled.filledCount, fieldCount: filled.fieldCount, template: filled.usedTemplate },
  });

  return new NextResponse(new Uint8Array(filled.bytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filled.fileName}"`,
      "Cache-Control": "private, no-store",
    },
  });
}
