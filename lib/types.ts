// App-level entities that wrap the canonical extraction model into the things
// the UI and dashboard actually work with: users, leads, documents, quotes,
// appointments, audit log, and the simulated notification outbox.

import type { CanonicalRecord, DocType } from "./canonical";

export type Role = "customer" | "agent";

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: Role;
  phone?: string;
  createdAt: string;
}

export type LeadKind = "person" | "business";
export type LeadStatus = "new" | "in_progress" | "quoted" | "closed";

export const LEAD_STATUSES: LeadStatus[] = ["new", "in_progress", "quoted", "closed"];

export interface Lead {
  id: string;
  kind: LeadKind;
  displayName: string;
  normalizedName: string; // for cross-document identity stitching
  ownerUserId: string | null; // the customer who owns this lead (if any)
  status: LeadStatus;
  primaryAddress?: string;
  email?: string;
  phone?: string;
  createdAt: string;
  updatedAt: string;
}

export type DocSource = "sample" | "upload" | "ai" | "demo";

export interface StoredDocument {
  id: string;
  leadId: string;
  ownerUserId: string | null;
  fileName: string;
  docType: DocType;
  mime: string;
  sizeBytes: number;
  uploadedAt: string;
  record: CanonicalRecord;
  // When false, the binary was dropped post-extraction per PII_STORAGE_ENABLED.
  binaryRetained: boolean;
  sampleId?: string; // set when this maps to one of the 8 bundled samples
  source: DocSource;
  reviewed: boolean; // human-in-the-loop confirmation done?
}

export type QuoteLineType = "personal_auto" | "homeowners" | "commercial" | "life_health";

export const QUOTE_LINES: { id: QuoteLineType; label: string; blurb: string; icon: string }[] = [
  { id: "personal_auto", label: "Personal Auto", blurb: "Cars, trucks, motorcycles", icon: "car" },
  { id: "homeowners", label: "Home & Property", blurb: "Homeowners, renters, condo", icon: "home" },
  { id: "commercial", label: "Business / Commercial", blurb: "GL, auto, WC, umbrella", icon: "briefcase" },
  { id: "life_health", label: "Life & Health", blurb: "Term, whole, Medicare, dental", icon: "heart" },
];

export type QuoteStatus = "submitted" | "in_progress" | "quoted" | "closed" | "draft";

export interface QuoteLine {
  id: string;
  line: QuoteLineType;
  data: Record<string, unknown>;
}

export interface Quote {
  id: string;
  leadId: string;
  ownerUserId: string | null;
  status: QuoteStatus;
  lines: QuoteLine[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type AppointmentStatus = "booked" | "completed" | "canceled";

export interface Appointment {
  id: string;
  leadId: string | null;
  ownerUserId: string | null;
  eventType: string;
  name: string;
  email: string;
  phone?: string;
  startsAt: string;
  endsAt: string;
  notes?: string;
  source: "demo" | "cal.com";
  status: AppointmentStatus;
  createdAt: string;
}

export interface AuditLogEntry {
  id: string;
  actorId: string | null;
  actorEmail: string;
  action: string;
  entity: string;
  entityId: string;
  meta?: Record<string, unknown>;
  at: string;
}

export type OutboxChannel = "email" | "sms";

export interface OutboxMessage {
  id: string;
  channel: OutboxChannel;
  to: string;
  subject?: string;
  body: string;
  kind: string;
  provider: "resend" | "twilio" | "demo";
  delivered: boolean;
  at: string;
}

// Derived inbox item for the agent dashboard.
export type InboxItemType = "document" | "quote" | "appointment";

export interface InboxItem {
  id: string;
  type: InboxItemType;
  leadId: string | null;
  title: string;
  subtitle: string;
  status: string;
  at: string;
}

export interface SessionUser {
  id: string;
  email: string;
  fullName: string;
  role: Role;
}
