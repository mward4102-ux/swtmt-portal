import { bad, ok, readJson } from "@/lib/api";
import { getCurrentUser } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { notifyAppointmentBooked } from "@/lib/notify";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface ApptBody {
  eventType?: string;
  startsAt?: string;
  endsAt?: string;
  name?: string;
  email?: string;
  phone?: string;
  notes?: string;
  leadId?: string;
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return bad("Not authenticated.", 401);

  const body = await readJson<ApptBody>(req);
  if (!body?.eventType || !body?.startsAt) return bad("eventType and startsAt are required.");
  const start = new Date(body.startsAt);
  if (Number.isNaN(start.getTime())) return bad("Invalid startsAt.");
  const end = body.endsAt ? new Date(body.endsAt) : new Date(start.getTime() + 30 * 60000);

  const db = getDb();
  const ownerUserId = user.role === "customer" ? user.id : null;
  let lead = body.leadId ? db.getLead(body.leadId) : undefined;
  if (!lead && ownerUserId) lead = db.getPrimaryLeadForOwner(ownerUserId);

  const appt = db.addAppointment({
    leadId: lead?.id ?? null,
    ownerUserId,
    eventType: body.eventType,
    name: body.name?.trim() || user.fullName,
    email: body.email?.trim() || user.email,
    phone: body.phone?.trim() || user.phone,
    startsAt: start.toISOString(),
    endsAt: end.toISOString(),
    notes: body.notes,
    source: "demo",
    status: "booked",
  });

  await notifyAppointmentBooked({ appointment: appt, lead });
  db.addAudit({
    actorId: user.id, actorEmail: user.email, action: "appointment.booked", entity: "appointment", entityId: appt.id,
    meta: { eventType: appt.eventType, startsAt: appt.startsAt },
  });

  return ok({ appointment: appt });
}
