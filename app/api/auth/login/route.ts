import { NextResponse } from "next/server";
import { bad, isEmail, readJson } from "@/lib/api";
import { isDemoMode } from "@/lib/config";
import { getDb } from "@/lib/db";
import { makeSessionCookie } from "@/lib/auth";
import type { Role } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const body = await readJson<{ email?: string; fullName?: string; role?: Role }>(req);
  if (!body || !isEmail(body.email)) return bad("A valid email is required.");

  const db = getDb();
  const email = body.email.trim();
  let user = db.getUserByEmail(email);
  if (!user) {
    // In demo mode the preset buttons may request an agent session; real auth
    // (Supabase) would grant agent role only via the manual role column.
    const role: Role = body.role === "agent" && isDemoMode() ? "agent" : "customer";
    user = db.createUser({ email, fullName: body.fullName, role });
  }

  db.addAudit({ actorId: user.id, actorEmail: user.email, action: "auth.login", entity: "user", entityId: user.id });

  const redirect = user.role === "agent" ? "/dashboard" : "/profile";
  const res = NextResponse.json({ user: { id: user.id, email: user.email, fullName: user.fullName, role: user.role }, redirect });
  const cookie = await makeSessionCookie({ id: user.id, email: user.email, fullName: user.fullName, role: user.role });
  res.cookies.set(cookie.name, cookie.value, cookie.options);
  return res;
}
