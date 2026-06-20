// In-memory data store backing demo mode. Seeded on first access and held as a
// singleton on globalThis so it survives Next.js HMR and is shared across all
// route handlers + server components within a single Node server process.
//
// This is the live backend whenever Supabase is not configured. The method
// surface mirrors what a Supabase-backed implementation would expose, so the
// switch in db/index.ts is the only place that needs to change to go live.

import {
  type CanonicalRecord, finalizeConfidence, recordSubject,
} from "../canonical";
import { normalizeName, uid } from "../utils";
import type {
  Appointment, AuditLogEntry, InboxItem, Lead, LeadStatus, OutboxMessage,
  Quote, Role, StoredDocument, User,
} from "../types";
import { buildSeed } from "./seed";
import { type Signals, mergeSignals, recordSignals, signalsMatch } from "./stitch";

export interface LeadSummary {
  lead: Lead;
  documents: StoredDocument[];
  quotes: Quote[];
  appointments: Appointment[];
}

export class MemoryStore {
  private users: User[] = [];
  private leads: Lead[] = [];
  private documents: StoredDocument[] = [];
  private quotes: Quote[] = [];
  private appointments: Appointment[] = [];
  private auditLog: AuditLogEntry[] = [];
  private outbox: OutboxMessage[] = [];
  private leadSignals = new Map<string, Signals>();
  private draftQuotes = new Map<string, Quote>(); // ownerUserId -> in-progress quote

  constructor() {
    const seed = buildSeed();
    this.users = seed.users;
    this.leads = seed.leads;
    this.documents = seed.documents;
    this.quotes = seed.quotes;
    this.appointments = seed.appointments;
    this.outbox = seed.outbox;
    this.auditLog = seed.audit;
    for (const d of this.documents) this.registerSignals(d.leadId, d.record);
  }

  private registerSignals(leadId: string, record: CanonicalRecord) {
    const sig = this.leadSignals.get(leadId) ?? {
      names: new Set<string>(), businessNames: new Set<string>(),
      licenses: new Set<string>(), vins: new Set<string>(), addresses: new Set<string>(),
    };
    mergeSignals(sig, recordSignals(record));
    this.leadSignals.set(leadId, sig);
  }

  // ── Users ──────────────────────────────────────────────────────────────────
  getUserById(id: string): User | undefined {
    return this.users.find((u) => u.id === id);
  }
  getUserByEmail(email: string): User | undefined {
    const e = email.trim().toLowerCase();
    return this.users.find((u) => u.email.toLowerCase() === e);
  }
  createUser(input: { email: string; fullName?: string; role?: Role; phone?: string }): User {
    const existing = this.getUserByEmail(input.email);
    if (existing) return existing;
    const user: User = {
      id: uid("u"),
      email: input.email.trim(),
      fullName: input.fullName?.trim() || input.email.split("@")[0].replace(/[._]/g, " "),
      role: input.role ?? "customer",
      phone: input.phone,
      createdAt: new Date().toISOString(),
    };
    this.users.push(user);
    return user;
  }

  // ── Leads ──────────────────────────────────────────────────────────────────
  listLeads(): Lead[] {
    return [...this.leads].sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1));
  }
  getLead(id: string): Lead | undefined {
    return this.leads.find((l) => l.id === id);
  }
  getLeadsByOwner(ownerUserId: string): Lead[] {
    return this.leads.filter((l) => l.ownerUserId === ownerUserId);
  }
  getPrimaryLeadForOwner(ownerUserId: string): Lead | undefined {
    return this.getLeadsByOwner(ownerUserId)[0];
  }
  updateLead(id: string, patch: Partial<Lead>): Lead | undefined {
    const lead = this.getLead(id);
    if (!lead) return undefined;
    Object.assign(lead, patch, { updatedAt: new Date().toISOString() });
    return lead;
  }
  setLeadStatus(id: string, status: LeadStatus): Lead | undefined {
    return this.updateLead(id, { status });
  }

  /** Directly create a lead (used for quote-only leads with no document yet). */
  createLead(input: {
    kind?: Lead["kind"]; displayName: string; ownerUserId: string | null;
    primaryAddress?: string; email?: string; phone?: string; status?: LeadStatus;
  }): Lead {
    const ts = new Date().toISOString();
    const lead: Lead = {
      id: uid("lead"),
      kind: input.kind ?? "person",
      displayName: input.displayName,
      normalizedName: normalizeName(input.displayName),
      ownerUserId: input.ownerUserId,
      status: input.status ?? "new",
      primaryAddress: input.primaryAddress,
      email: input.email,
      phone: input.phone,
      createdAt: ts,
      updatedAt: ts,
    };
    this.leads.push(lead);
    return lead;
  }

  /** Stitch a record to an existing lead by shared signals, else create one. */
  findOrCreateLead(record: CanonicalRecord, ownerUserId: string | null): Lead {
    const sig = recordSignals(record);
    // Prefer a lead the owner already has whose signals match this record.
    if (ownerUserId) {
      const owned = this.getLeadsByOwner(ownerUserId);
      for (const lead of owned) {
        const existing = this.leadSignals.get(lead.id);
        if (existing && signalsMatch(existing, sig)) return lead;
      }
    }
    for (const lead of this.leads) {
      const existing = this.leadSignals.get(lead.id);
      if (existing && signalsMatch(existing, sig)) {
        if (ownerUserId && !lead.ownerUserId) lead.ownerUserId = ownerUserId;
        return lead;
      }
    }
    const isBusiness = !!record.business.name.value;
    const subject = recordSubject(record);
    const lead: Lead = {
      id: uid("lead"),
      kind: isBusiness ? "business" : "person",
      displayName: subject,
      normalizedName: normalizeName(subject),
      ownerUserId,
      status: "new",
      primaryAddress:
        record.mailing_address.value ||
        record.property.address.value ||
        record.id_document.address.value ||
        undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.leads.push(lead);
    this.registerSignals(lead.id, record);
    return lead;
  }

  // ── Documents ────────────────────────────────────────────────────────────
  listDocuments(): StoredDocument[] {
    return [...this.documents].sort((a, b) => (a.uploadedAt < b.uploadedAt ? 1 : -1));
  }
  getDocument(id: string): StoredDocument | undefined {
    return this.documents.find((d) => d.id === id);
  }
  getDocumentsByLead(leadId: string): StoredDocument[] {
    return this.documents.filter((d) => d.leadId === leadId).sort((a, b) => (a.uploadedAt < b.uploadedAt ? 1 : -1));
  }
  getDocumentsByOwner(ownerUserId: string): StoredDocument[] {
    return this.documents.filter((d) => d.ownerUserId === ownerUserId).sort((a, b) => (a.uploadedAt < b.uploadedAt ? 1 : -1));
  }
  addDocument(input: Omit<StoredDocument, "id" | "uploadedAt"> & { id?: string; uploadedAt?: string }): StoredDocument {
    const doc: StoredDocument = {
      ...input,
      id: input.id ?? uid("doc"),
      uploadedAt: input.uploadedAt ?? new Date().toISOString(),
    };
    this.documents.push(doc);
    this.registerSignals(doc.leadId, doc.record);
    this.updateLead(doc.leadId, {});
    return doc;
  }
  updateDocumentRecord(id: string, record: CanonicalRecord, reviewed?: boolean): StoredDocument | undefined {
    const doc = this.getDocument(id);
    if (!doc) return undefined;
    doc.record = finalizeConfidence(record);
    if (typeof reviewed === "boolean") doc.reviewed = reviewed;
    this.registerSignals(doc.leadId, doc.record);
    return doc;
  }

  // ── Quotes ─────────────────────────────────────────────────────────────────
  listQuotes(): Quote[] {
    return [...this.quotes].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  }
  getQuote(id: string): Quote | undefined {
    return this.quotes.find((q) => q.id === id);
  }
  getQuotesByLead(leadId: string): Quote[] {
    return this.quotes.filter((q) => q.leadId === leadId);
  }
  getQuotesByOwner(ownerUserId: string): Quote[] {
    return this.quotes.filter((q) => q.ownerUserId === ownerUserId).sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  }
  addQuote(input: Omit<Quote, "id" | "createdAt" | "updatedAt"> & { id?: string }): Quote {
    const ts = new Date().toISOString();
    const quote: Quote = { ...input, id: input.id ?? uid("quote"), createdAt: ts, updatedAt: ts };
    this.quotes.push(quote);
    return quote;
  }
  updateQuote(id: string, patch: Partial<Quote>): Quote | undefined {
    const q = this.getQuote(id);
    if (!q) return undefined;
    Object.assign(q, patch, { updatedAt: new Date().toISOString() });
    return q;
  }

  // Save-and-resume draft (one per customer).
  getDraftQuote(ownerUserId: string): Quote | undefined {
    return this.draftQuotes.get(ownerUserId);
  }
  saveDraftQuote(ownerUserId: string, quote: Quote): void {
    this.draftQuotes.set(ownerUserId, quote);
  }
  clearDraftQuote(ownerUserId: string): void {
    this.draftQuotes.delete(ownerUserId);
  }

  // ── Appointments ───────────────────────────────────────────────────────────
  listAppointments(): Appointment[] {
    return [...this.appointments].sort((a, b) => (a.startsAt < b.startsAt ? 1 : -1));
  }
  getAppointmentsByOwner(ownerUserId: string): Appointment[] {
    return this.appointments.filter((a) => a.ownerUserId === ownerUserId).sort((a, b) => (a.startsAt < b.startsAt ? 1 : -1));
  }
  getAppointmentsByLead(leadId: string): Appointment[] {
    return this.appointments.filter((a) => a.leadId === leadId);
  }
  addAppointment(input: Omit<Appointment, "id" | "createdAt"> & { id?: string }): Appointment {
    const appt: Appointment = { ...input, id: input.id ?? uid("appt"), createdAt: new Date().toISOString() };
    this.appointments.push(appt);
    return appt;
  }

  // ── Audit + Outbox ─────────────────────────────────────────────────────────
  addAudit(entry: Omit<AuditLogEntry, "id" | "at"> & { id?: string; at?: string }): void {
    this.auditLog.unshift({ ...entry, id: entry.id ?? uid("au"), at: entry.at ?? new Date().toISOString() });
  }
  listAudit(limit = 100): AuditLogEntry[] {
    return this.auditLog.slice(0, limit);
  }
  addOutbox(msg: Omit<OutboxMessage, "id" | "at"> & { id?: string; at?: string }): OutboxMessage {
    const m: OutboxMessage = { ...msg, id: msg.id ?? uid("ob"), at: msg.at ?? new Date().toISOString() };
    this.outbox.unshift(m);
    return m;
  }
  listOutbox(limit = 50): OutboxMessage[] {
    return this.outbox.slice(0, limit);
  }

  // ── Derived views ──────────────────────────────────────────────────────────
  getLeadSummary(leadId: string): LeadSummary | undefined {
    const lead = this.getLead(leadId);
    if (!lead) return undefined;
    return {
      lead,
      documents: this.getDocumentsByLead(leadId),
      quotes: this.getQuotesByLead(leadId),
      appointments: this.getAppointmentsByLead(leadId),
    };
  }

  getInbox(): InboxItem[] {
    const docItems: InboxItem[] = this.documents.map((d) => ({
      id: `doc:${d.id}`, type: "document", leadId: d.leadId,
      title: recordSubject(d.record),
      subtitle: d.fileName,
      status: d.reviewed ? "reviewed" : "needs review",
      at: d.uploadedAt,
    }));
    const quoteItems: InboxItem[] = this.quotes.map((q) => {
      const lead = this.getLead(q.leadId);
      return {
        id: `quote:${q.id}`, type: "quote", leadId: q.leadId,
        title: lead?.displayName ?? "Quote",
        subtitle: q.lines.map((l) => l.line.replace(/_/g, " ")).join(", "),
        status: q.status, at: q.createdAt,
      };
    });
    const apptItems: InboxItem[] = this.appointments.map((a) => ({
      id: `appt:${a.id}`, type: "appointment", leadId: a.leadId,
      title: a.name, subtitle: a.eventType, status: a.status, at: a.createdAt,
    }));
    return [...docItems, ...quoteItems, ...apptItems].sort((a, b) => (a.at < b.at ? 1 : -1));
  }

  getStats() {
    const upcoming = this.appointments.filter((a) => new Date(a.startsAt).getTime() > Date.now() && a.status === "booked");
    return {
      totalLeads: this.leads.length,
      newLeads: this.leads.filter((l) => l.status === "new").length,
      openQuotes: this.quotes.filter((q) => q.status === "submitted" || q.status === "in_progress").length,
      upcomingAppointments: upcoming.length,
      docsToReview: this.documents.filter((d) => !d.reviewed).length,
    };
  }
}
