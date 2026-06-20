import { bad, ok, readJson } from "@/lib/api";
import { getCurrentUser } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { uid } from "@/lib/utils";
import { notifyQuoteSubmitted } from "@/lib/notify";
import { QUOTE_LINES, type QuoteLine, type QuoteLineType } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface QuoteBody {
  lines?: { line: QuoteLineType; data: Record<string, unknown> }[];
  leadId?: string;
  notes?: string;
}

const VALID_LINES = new Set(QUOTE_LINES.map((l) => l.id));

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return bad("Not authenticated.", 401);

  const body = await readJson<QuoteBody>(req);
  if (!body?.lines?.length) return bad("At least one quote line is required.");
  for (const l of body.lines) {
    if (!VALID_LINES.has(l.line)) return bad(`Unknown line: ${l.line}`);
  }

  const db = getDb();
  const ownerUserId = user.role === "customer" ? user.id : null;

  // Resolve the lead: explicit id → owner's primary lead → a new lead.
  let lead = body.leadId ? db.getLead(body.leadId) : undefined;
  if (lead && user.role !== "agent" && lead.ownerUserId !== user.id) lead = undefined;
  if (!lead && ownerUserId) lead = db.getPrimaryLeadForOwner(ownerUserId);
  if (!lead) {
    const data = body.lines[0].data as Record<string, unknown>;
    const driverName = Array.isArray(data.drivers) ? (data.drivers[0] as { name?: string })?.name : undefined;
    const displayName =
      driverName || (typeof data.business_name === "string" ? data.business_name : "") || user.fullName;
    const kind = body.lines.some((l) => l.line === "commercial") ? "business" : "person";
    lead = db.createLead({
      kind, displayName: String(displayName), ownerUserId,
      email: user.email, phone: user.phone, status: "in_progress",
    });
  }

  const lines: QuoteLine[] = body.lines.map((l) => ({ id: uid("ql"), line: l.line, data: l.data ?? {} }));
  const quote = db.addQuote({ leadId: lead.id, ownerUserId, status: "submitted", lines, notes: body.notes });

  if (lead.status === "new") db.setLeadStatus(lead.id, "in_progress");
  db.clearDraftQuote(user.id);

  const customer = (ownerUserId && db.getUserById(ownerUserId)) || user;
  const lineLabel = QUOTE_LINES.find((l) => l.id === lines[0].line)?.label ?? "Insurance";
  await notifyQuoteSubmitted({ lead, quote, customer, lineLabel });

  db.addAudit({
    actorId: user.id, actorEmail: user.email, action: "quote.submitted", entity: "quote", entityId: quote.id,
    meta: { leadId: lead.id, lines: lines.map((l) => l.line) },
  });

  return ok({ quote, lead });
}
