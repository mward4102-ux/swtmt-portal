import { bad, ok, readJson } from "@/lib/api";
import { config } from "@/lib/config";
import { getDb } from "@/lib/db";
import { notifyAppointmentBooked } from "@/lib/notify";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Cal.com booking webhook (BUILD_SPEC §9). Verifies CAL_WEBHOOK_SECRET, writes an
// appointment row, and notifies Beach. In demo (no secret configured) the
// built-in scheduler is used instead and this endpoint reports as disabled.
export async function POST(req: Request) {
  if (!config.cal.webhookSecret) {
    return ok({ ok: false, reason: "CAL_WEBHOOK_SECRET not configured; using built-in scheduler." });
  }
  const secret = req.headers.get("x-cal-signature-256") || new URL(req.url).searchParams.get("secret");
  if (secret !== config.cal.webhookSecret) return bad("Invalid webhook signature.", 401);

  const body = await readJson<{
    triggerEvent?: string;
    payload?: {
      title?: string;
      eventType?: { title?: string };
      startTime?: string;
      endTime?: string;
      attendees?: { name?: string; email?: string }[];
      responses?: { phone?: { value?: string }; notes?: { value?: string } };
    };
  }>(req);
  if (!body?.payload) return bad("Missing payload.");
  if (body.triggerEvent && body.triggerEvent !== "BOOKING_CREATED") return ok({ ok: true, ignored: body.triggerEvent });

  const p = body.payload;
  const attendee = p.attendees?.[0];
  const db = getDb();
  const email = attendee?.email ?? "";
  const owner = email ? db.getUserByEmail(email) : undefined;
  const lead = owner ? db.getPrimaryLeadForOwner(owner.id) : undefined;

  const appt = db.addAppointment({
    leadId: lead?.id ?? null,
    ownerUserId: owner?.id ?? null,
    eventType: p.eventType?.title || p.title || "Consultation",
    name: attendee?.name || "Customer",
    email,
    phone: p.responses?.phone?.value,
    startsAt: p.startTime ?? new Date().toISOString(),
    endsAt: p.endTime ?? new Date(Date.now() + 30 * 60000).toISOString(),
    notes: p.responses?.notes?.value,
    source: "cal.com",
    status: "booked",
  });

  await notifyAppointmentBooked({ appointment: appt, lead });
  db.addAudit({ actorId: null, actorEmail: email, action: "appointment.booked", entity: "appointment", entityId: appt.id, meta: { source: "cal.com" } });

  return ok({ ok: true, appointmentId: appt.id });
}
