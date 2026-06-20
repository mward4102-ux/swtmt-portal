import { bad, ok, readJson } from "@/lib/api";
import { getCurrentUser } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { LEAD_STATUSES, type LeadStatus } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) return bad("Not authenticated.", 401);
  if (user.role !== "agent") return bad("Forbidden.", 403);

  const body = await readJson<{ status?: LeadStatus }>(req);
  if (!body?.status || !LEAD_STATUSES.includes(body.status)) return bad("A valid status is required.");

  const lead = getDb().setLeadStatus(params.id, body.status);
  if (!lead) return bad("Lead not found.", 404);

  getDb().addAudit({
    actorId: user.id, actorEmail: user.email, action: "lead.status_changed", entity: "lead", entityId: lead.id,
    meta: { status: body.status },
  });
  return ok({ lead });
}
