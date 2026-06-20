// The demo dataset. Three leads stitched from the 8 sample documents, plus a
// couple of quotes, appointments, audit entries, and simulated notifications so
// both the customer and agent experiences are populated out of the box.

import { config } from "../config";
import { SAMPLES, type LeadKey } from "../samples";
import type {
  Appointment, AuditLogEntry, Lead, OutboxMessage, Quote, StoredDocument, User,
} from "../types";

const now = Date.now();
const iso = (ms: number) => new Date(ms).toISOString();
const daysAgo = (d: number, h = 0) => iso(now - d * 86400000 - h * 3600000);
const daysAhead = (d: number, hour = 10) => {
  const dt = new Date(now + d * 86400000);
  dt.setHours(hour, 0, 0, 0);
  return dt.toISOString();
};

const SIZES: Record<string, number> = {
  "01": 28331, "02": 27958, "03": 28435, "04": 22846,
  "05": 25265, "06": 26127, "07": 25164, "08": 25491,
};

interface LeadConf {
  id: string;
  ownerId: string;
  user: User;
  lead: Lead;
}

export interface SeedData {
  users: User[];
  leads: Lead[];
  documents: StoredDocument[];
  quotes: Quote[];
  appointments: Appointment[];
  outbox: OutboxMessage[];
  audit: AuditLogEntry[];
}

export function buildSeed(): SeedData {
  const agent: User = {
    id: "u_agent", email: "beach@beachstanton.com", fullName: "Beach Stanton",
    role: "agent", phone: "(760) 324-1144", createdAt: daysAgo(120),
  };

  const leadConf: Record<LeadKey, LeadConf> = {
    maria: {
      id: "lead_maria", ownerId: "u_maria",
      user: { id: "u_maria", email: "maria@example.com", fullName: "Maria Gutierrez", role: "customer", phone: "(760) 555-0142", createdAt: daysAgo(9) },
      lead: {
        id: "lead_maria", kind: "person", displayName: "Maria E. Gutierrez",
        normalizedName: "maria gutierrez", ownerUserId: "u_maria", status: "in_progress",
        primaryAddress: "42 Cabrillo Ave, Cathedral City, CA 92234",
        email: "maria@example.com", phone: "(760) 555-0142",
        createdAt: daysAgo(9), updatedAt: daysAgo(1, 3),
      },
    },
    tanaka: {
      id: "lead_tanaka", ownerId: "u_robert",
      user: { id: "u_robert", email: "robert@example.com", fullName: "Robert Tanaka", role: "customer", phone: "(760) 555-0188", createdAt: daysAgo(6) },
      lead: {
        id: "lead_tanaka", kind: "person", displayName: "Robert T. Tanaka",
        normalizedName: "robert tanaka", ownerUserId: "u_robert", status: "quoted",
        primaryAddress: "318 Vista Del Sol, Palm Springs, CA 92262",
        email: "robert@example.com", phone: "(760) 555-0188",
        createdAt: daysAgo(6), updatedAt: daysAgo(2),
      },
    },
    desertbloom: {
      id: "lead_desertbloom", ownerId: "u_desertbloom",
      user: { id: "u_desertbloom", email: "owner@desertbloom.example", fullName: "Desert Bloom Landscaping", role: "customer", phone: "(760) 555-0210", createdAt: daysAgo(3) },
      lead: {
        id: "lead_desertbloom", kind: "business", displayName: "Desert Bloom Landscaping LLC",
        normalizedName: "desert bloom landscaping", ownerUserId: "u_desertbloom", status: "new",
        primaryAddress: "1100 Industrial Way, Indio, CA 92201",
        email: "owner@desertbloom.example", phone: "(760) 555-0210",
        createdAt: daysAgo(3), updatedAt: daysAgo(3),
      },
    },
  };

  const users: User[] = [agent, leadConf.maria.user, leadConf.tanaka.user, leadConf.desertbloom.user];
  const leads: Lead[] = [leadConf.maria.lead, leadConf.tanaka.lead, leadConf.desertbloom.lead];

  // Documents — staggered upload times for a believable activity feed.
  const uploadOffsets: Record<string, number> = {
    "01": 8, "03": 8, "04": 7, "08": 7, // Maria
    "02": 5, "07": 5, // Tanaka
    "05": 3, "06": 3, // Desert Bloom
  };

  const documents: StoredDocument[] = SAMPLES.map((s) => {
    const lc = leadConf[s.leadKey];
    const record = s.build();
    return {
      id: `doc_${s.id}`,
      leadId: lc.id,
      ownerUserId: lc.ownerId,
      fileName: s.fileName,
      docType: s.docType,
      mime: "application/pdf",
      sizeBytes: SIZES[s.id] ?? 0,
      uploadedAt: daysAgo(uploadOffsets[s.id] ?? 4, Number(s.id)),
      record,
      // Bundled fictitious samples are retained for viewing; real uploads are
      // dropped post-extraction when PII storage is disabled.
      binaryRetained: true,
      sampleId: s.id,
      source: "sample",
      reviewed: !record.needs_review,
    };
  });

  const quotes: Quote[] = [
    {
      id: "quote_maria", leadId: "lead_maria", ownerUserId: "u_maria", status: "submitted",
      createdAt: daysAgo(1, 3), updatedAt: daysAgo(1, 3),
      notes: "Shopping for a better rate — currently $1,842/6mo with Pacific Crest; prior Coachella Valley renewal was $2,040/6mo at lower limits.",
      lines: [
        {
          id: "ql_maria_auto", line: "personal_auto",
          data: {
            drivers: [
              { name: "Maria E. Gutierrez", dob: "1985-07-14", license_number: "D1234567" },
              { name: "Luis A. Gutierrez", dob: "1983-11-02", license_number: "D7654321" },
            ],
            vehicles: [
              { year: "2021", make: "Toyota", model: "RAV4 XLE", vin: "2T3W1RFV5MW123456", use: "Commute" },
              { year: "2018", make: "Honda", model: "Civic LX", vin: "19XFC2F59JE034521", use: "Pleasure" },
            ],
            current_carrier: "Pacific Crest Mutual",
            current_expiry: "2025-09-15",
            desired_bi_limit: "$250,000 / $500,000",
            desired_pd_limit: "$100,000",
            desired_comp_deductible: "$500",
            desired_coll_deductible: "$500",
          },
        },
      ],
    },
    {
      id: "quote_tanaka", leadId: "lead_tanaka", ownerUserId: "u_robert", status: "quoted",
      createdAt: daysAgo(4), updatedAt: daysAgo(2),
      notes: "Reviewing homeowners + exploring bundling the Medicare supplement servicing.",
      lines: [
        {
          id: "ql_tanaka_home", line: "homeowners",
          data: {
            property_address: "318 Vista Del Sol, Palm Springs, CA 92262",
            year_built: "1998", construction: "Frame", sq_ft: "2140",
            roof_age: "Reroofed 2019", current_cov_a: "$485,000",
            mortgagee: "Desert Sun Credit Union", prior_claims: "None in last 5 years",
            current_carrier: "Sierra Vista Insurance Group",
          },
        },
      ],
    },
  ];

  const appointments: Appointment[] = [
    {
      id: "appt_maria", leadId: "lead_maria", ownerUserId: "u_maria",
      eventType: "New Quote Consultation", name: "Maria Gutierrez", email: "maria@example.com",
      phone: "(760) 555-0142", startsAt: daysAhead(2, 10), endsAt: daysAhead(2, 10.5),
      notes: "Wants to compare auto options and ask about bundling renters.",
      source: "demo", status: "booked", createdAt: daysAgo(1, 3),
    },
    {
      id: "appt_tanaka", leadId: "lead_tanaka", ownerUserId: "u_robert",
      eventType: "Policy Review", name: "Robert Tanaka", email: "robert@example.com",
      phone: "(760) 555-0188", startsAt: daysAhead(5, 14), endsAt: daysAhead(5, 14.5),
      notes: "Annual homeowners review.", source: "demo", status: "booked", createdAt: daysAgo(2),
    },
  ];

  const outbox: OutboxMessage[] = [
    { id: "ob_1", channel: "email", to: config.resend.agentAlertEmail, subject: "New auto quote — Maria Gutierrez", body: "Maria Gutierrez submitted a Personal Auto quote. Open the lead to review extracted docs and generate forms.", kind: "agent_alert", provider: "demo", delivered: true, at: daysAgo(1, 3) },
    { id: "ob_2", channel: "email", to: "maria@example.com", subject: "We received your quote request", body: "Thanks Maria — Beach Stanton Insurance has your auto quote request and will follow up shortly.", kind: "quote_confirmation", provider: "demo", delivered: true, at: daysAgo(1, 3) },
    { id: "ob_3", channel: "email", to: "robert@example.com", subject: "Your Policy Review is booked", body: "Your Policy Review with Beach Stanton Insurance is confirmed. We'll send a calendar invite.", kind: "appointment_confirmation", provider: "demo", delivered: true, at: daysAgo(2) },
  ];

  const audit: AuditLogEntry[] = [
    ...documents.map((d, i) => ({
      id: `au_doc_${d.id}`, actorId: d.ownerUserId, actorEmail: leadConf[SAMPLES[i].leadKey].user.email,
      action: "document.extracted", entity: "document", entityId: d.id,
      meta: { doc_type: d.docType, needs_review: d.record.needs_review, overall_confidence: d.record.overall_confidence },
      at: d.uploadedAt,
    })),
    { id: "au_q1", actorId: "u_maria", actorEmail: "maria@example.com", action: "quote.submitted", entity: "quote", entityId: "quote_maria", meta: { line: "personal_auto" }, at: daysAgo(1, 3) },
    { id: "au_q2", actorId: "u_robert", actorEmail: "robert@example.com", action: "quote.submitted", entity: "quote", entityId: "quote_tanaka", meta: { line: "homeowners" }, at: daysAgo(4) },
    { id: "au_a1", actorId: "u_maria", actorEmail: "maria@example.com", action: "appointment.booked", entity: "appointment", entityId: "appt_maria", meta: { eventType: "New Quote Consultation" }, at: daysAgo(1, 3) },
    { id: "au_a2", actorId: "u_robert", actorEmail: "robert@example.com", action: "appointment.booked", entity: "appointment", entityId: "appt_tanaka", meta: { eventType: "Policy Review" }, at: daysAgo(2) },
  ].sort((a, b) => (a.at < b.at ? 1 : -1));

  return { users, leads, documents, quotes, appointments, outbox, audit };
}
