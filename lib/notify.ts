// Notifications (BUILD_SPEC §11). Resend for email, Twilio for SMS (behind
// SMS_ENABLED). When a provider isn't configured, the message is recorded in the
// in-app outbox so the demo shows exactly what would have been sent.

import { config } from "./config";
import { getDb } from "./db";
import type { EmailContent } from "./email-templates";
import {
  appointmentAgentAlert, appointmentConfirmationCustomer, quoteAgentAlert, quoteConfirmationCustomer,
} from "./email-templates";
import type { Appointment, Lead, Quote, User } from "./types";

function appUrl(path = ""): string {
  const base =
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.URL || // Netlify
    process.env.DEPLOY_PRIME_URL ||
    "";
  return base ? `${base.replace(/\/$/, "")}${path}` : path;
}

async function sendEmail(to: string, email: EmailContent, kind: string): Promise<void> {
  const db = getDb();
  if (config.resend.enabled) {
    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${config.resend.apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({ from: config.resend.from, to, subject: email.subject, html: email.html, text: email.text }),
      });
      db.addOutbox({ channel: "email", to, subject: email.subject, body: email.text, kind, provider: "resend", delivered: res.ok });
      return;
    } catch {
      db.addOutbox({ channel: "email", to, subject: email.subject, body: email.text, kind, provider: "resend", delivered: false });
      return;
    }
  }
  // Demo: simulate delivery and record it for the dashboard outbox.
  db.addOutbox({ channel: "email", to, subject: email.subject, body: email.text, kind, provider: "demo", delivered: true });
}

async function sendSms(to: string, body: string, kind: string): Promise<void> {
  if (!config.twilio.enabled) return;
  const db = getDb();
  if (config.twilio.ready) {
    try {
      const auth = Buffer.from(`${config.twilio.accountSid}:${config.twilio.authToken}`).toString("base64");
      const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${config.twilio.accountSid}/Messages.json`, {
        method: "POST",
        headers: { Authorization: `Basic ${auth}`, "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ To: to, From: config.twilio.from, Body: body }),
      });
      db.addOutbox({ channel: "sms", to, body, kind, provider: "twilio", delivered: res.ok });
      return;
    } catch {
      db.addOutbox({ channel: "sms", to, body, kind, provider: "twilio", delivered: false });
      return;
    }
  }
  db.addOutbox({ channel: "sms", to, body, kind, provider: "demo", delivered: true });
}

export async function notifyQuoteSubmitted(opts: { lead: Lead; quote: Quote; customer: User; lineLabel: string }): Promise<void> {
  const { lead, customer, lineLabel } = opts;
  const leadUrl = appUrl(`/lead/${lead.id}`);
  await Promise.all([
    sendEmail(customer.email, quoteConfirmationCustomer(customer.fullName, lineLabel), "quote_confirmation"),
    sendEmail(config.resend.agentAlertEmail, quoteAgentAlert(lead.displayName, lineLabel, leadUrl), "agent_alert"),
  ]);
  if (customer.phone) {
    await sendSms(customer.phone, `Thanks ${customer.fullName.split(" ")[0]} — Beach Stanton Insurance received your ${lineLabel} quote request.`, "quote_confirmation");
  }
}

export async function notifyAppointmentBooked(opts: { appointment: Appointment; lead?: Lead | null }): Promise<void> {
  const { appointment, lead } = opts;
  const leadUrl = lead ? appUrl(`/lead/${lead.id}`) : "";
  await Promise.all([
    sendEmail(appointment.email, appointmentConfirmationCustomer(appointment.name, appointment.eventType, appointment.startsAt), "appointment_confirmation"),
    sendEmail(config.resend.agentAlertEmail, appointmentAgentAlert(appointment.name, appointment.eventType, appointment.startsAt, leadUrl), "agent_alert"),
  ]);
  if (appointment.phone) {
    await sendSms(appointment.phone, `Your ${appointment.eventType} with Beach Stanton Insurance is booked.`, "appointment_confirmation");
  }
}
