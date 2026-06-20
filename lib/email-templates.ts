// Plain, branded, mobile-friendly email templates (BUILD_SPEC §11).

import { AGENCY } from "./config";
import { formatDateTime } from "./utils";

export interface EmailContent {
  subject: string;
  text: string;
  html: string;
}

const BLUE = "#125a9e";

function shell(title: string, bodyHtml: string): string {
  return `<!doctype html><html><body style="margin:0;background:#f4f7fb;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#11355a">
  <div style="max-width:560px;margin:0 auto;padding:24px">
    <div style="font-size:18px;font-weight:700;color:${BLUE};letter-spacing:.3px">${AGENCY.name}</div>
    <div style="font-size:12px;color:#5b7088;margin-bottom:16px">${AGENCY.tagline}</div>
    <div style="background:#fff;border:1px solid #e3eaf2;border-radius:14px;padding:24px;box-shadow:0 8px 24px -16px rgba(16,62,107,.3)">
      <h1 style="font-size:18px;margin:0 0 12px">${title}</h1>
      ${bodyHtml}
    </div>
    <div style="font-size:11px;color:#7187a0;margin-top:16px;line-height:1.6">
      ${AGENCY.name} · ${AGENCY.address}<br/>${AGENCY.phone} · ${AGENCY.license}
    </div>
  </div></body></html>`;
}

export function quoteConfirmationCustomer(name: string, lineLabel: string): EmailContent {
  const subject = "We received your quote request";
  const text = `Hi ${name},\n\nThanks for your ${lineLabel} quote request with ${AGENCY.name}. As an independent agency we shop multiple carriers for you. We'll review and follow up shortly.\n\n${AGENCY.name}\n${AGENCY.phone}`;
  const html = shell(
    `Thanks, ${name} — we've got it`,
    `<p style="margin:0 0 12px;line-height:1.6">We received your <strong>${lineLabel}</strong> quote request. As an independent agency, we shop multiple carriers to find your best fit and will follow up shortly.</p>
     <p style="margin:0;line-height:1.6">Questions? Call us at <a style="color:${BLUE}" href="tel:${AGENCY.phone.replace(/[^0-9+]/g, "")}">${AGENCY.phone}</a>.</p>`,
  );
  return { subject, text, html };
}

export function quoteAgentAlert(leadName: string, lineLabel: string, leadUrl: string): EmailContent {
  const subject = `New ${lineLabel} quote — ${leadName}`;
  const text = `${leadName} submitted a ${lineLabel} quote.\n\nOpen the lead: ${leadUrl || "(dashboard)"}`;
  const html = shell(
    `New ${lineLabel} quote`,
    `<p style="margin:0 0 16px;line-height:1.6"><strong>${leadName}</strong> submitted a ${lineLabel} quote request with extracted documents ready to review.</p>
     ${leadUrl ? `<a href="${leadUrl}" style="display:inline-block;background:${BLUE};color:#fff;text-decoration:none;padding:10px 18px;border-radius:8px;font-weight:600">Open lead</a>` : ""}`,
  );
  return { subject, text, html };
}

export function appointmentConfirmationCustomer(name: string, eventType: string, startsAt: string): EmailContent {
  const subject = `Your ${eventType} is booked`;
  const when = formatDateTime(startsAt);
  const text = `Hi ${name},\n\nYour ${eventType} with ${AGENCY.name} is confirmed for ${when}. We'll send a calendar invite.\n\n${AGENCY.name}\n${AGENCY.phone}`;
  const html = shell(
    `You're booked, ${name}`,
    `<p style="margin:0 0 8px;line-height:1.6">Your <strong>${eventType}</strong> is confirmed for:</p>
     <p style="margin:0 0 12px;font-size:16px;font-weight:700;color:${BLUE}">${when}</p>
     <p style="margin:0;line-height:1.6">A calendar invite is on its way. Need to reschedule? Just reply or call ${AGENCY.phone}.</p>`,
  );
  return { subject, text, html };
}

export function appointmentAgentAlert(name: string, eventType: string, startsAt: string, leadUrl: string): EmailContent {
  const subject = `New booking — ${eventType} with ${name}`;
  const when = formatDateTime(startsAt);
  const text = `${name} booked a ${eventType} for ${when}.\n\n${leadUrl || ""}`;
  const html = shell(
    `New booking`,
    `<p style="margin:0 0 16px;line-height:1.6"><strong>${name}</strong> booked a <strong>${eventType}</strong> for ${when}.</p>
     ${leadUrl ? `<a href="${leadUrl}" style="display:inline-block;background:${BLUE};color:#fff;text-decoration:none;padding:10px 18px;border-radius:8px;font-weight:600">Open lead</a>` : ""}`,
  );
  return { subject, text, html };
}
