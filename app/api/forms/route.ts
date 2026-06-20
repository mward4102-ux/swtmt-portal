import { bad, ok } from "@/lib/api";
import { getCurrentUser } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { planForLead } from "@/lib/forms/plan";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const user = await getCurrentUser();
  if (!user) return bad("Not authenticated.", 401);
  if (user.role !== "agent") return bad("Forbidden.", 403);

  const leadId = new URL(req.url).searchParams.get("leadId");
  if (!leadId) return bad("leadId is required.");
  const summary = getDb().getLeadSummary(leadId);
  if (!summary) return bad("Lead not found.", 404);

  const plan = await planForLead(summary.documents);
  return ok({ lead: summary.lead, plan });
}
