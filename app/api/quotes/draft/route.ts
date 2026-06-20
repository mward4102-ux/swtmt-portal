import { bad, ok, readJson } from "@/lib/api";
import { getCurrentUser } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { uid } from "@/lib/utils";
import type { QuoteLine, QuoteLineType } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return bad("Not authenticated.", 401);
  return ok({ draft: getDb().getDraftQuote(user.id) ?? null });
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return bad("Not authenticated.", 401);
  const body = await readJson<{ lines?: { line: QuoteLineType; data: Record<string, unknown> }[]; notes?: string }>(req);
  if (!body) return bad("Invalid request body.");

  const lines: QuoteLine[] = (body.lines ?? []).map((l) => ({ id: uid("ql"), line: l.line, data: l.data ?? {} }));
  const ts = new Date().toISOString();
  getDb().saveDraftQuote(user.id, {
    id: `draft_${user.id}`, leadId: "", ownerUserId: user.id, status: "draft",
    lines, notes: body.notes, createdAt: ts, updatedAt: ts,
  });
  return ok({ ok: true });
}
