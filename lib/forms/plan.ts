// Ties the form engine to a lead: derive the line(s) of business + carrier from
// the lead's extracted documents, merge those documents into one canonical
// record per line, and select the forms to fill (BUILD_SPEC §7, §10).

import { type CanonicalRecord, type DocType, emptyRecord } from "../canonical";
import { stateFromAddress } from "../utils";
import type { QuoteLineType, StoredDocument } from "../types";
import { type FormMap, getFormMap } from "./maps";
import { selectForms } from "./select";
import { type FilledForm, fillForm } from "./fill";

const LINE_BY_DOCTYPE: Record<DocType, QuoteLineType | null> = {
  personal_auto_dec: "personal_auto",
  prior_auto_dec: "personal_auto",
  vehicle_registration: "personal_auto",
  drivers_license: "personal_auto",
  homeowners_dec: "homeowners",
  commercial_gl_dec: "commercial",
  acord_certificate: "commercial",
  medicare_supplement: "life_health",
  unknown: null,
};

const LINE_LABEL: Record<QuoteLineType, string> = {
  personal_auto: "Personal Auto",
  homeowners: "Home & Property",
  commercial: "Business / Commercial",
  life_health: "Life & Health",
};

// Priority of doc types when choosing a base record for a line.
const PRIORITY: Record<QuoteLineType, DocType[]> = {
  personal_auto: ["personal_auto_dec", "prior_auto_dec", "vehicle_registration", "drivers_license"],
  homeowners: ["homeowners_dec"],
  commercial: ["commercial_gl_dec", "acord_certificate"],
  life_health: ["medicare_supplement"],
};

function clone(r: CanonicalRecord): CanonicalRecord {
  return structuredClone(r);
}

/** Merge a lead's documents for one line into a single canonical record. */
export function buildCanonicalForLine(documents: StoredDocument[], line: QuoteLineType): CanonicalRecord {
  const order = PRIORITY[line];
  const docs = documents
    .filter((d) => LINE_BY_DOCTYPE[d.docType] === line)
    .sort((a, b) => order.indexOf(a.docType) - order.indexOf(b.docType));
  if (!docs.length) return emptyRecord();

  const base = clone(docs[0].record);

  for (const d of docs.slice(1)) {
    const r = d.record;
    if (!base.named_insured.value && r.named_insured.value) base.named_insured = r.named_insured;
    if (!base.mailing_address.value && r.mailing_address.value) base.mailing_address = r.mailing_address;
    if (!base.carrier_name.value && r.carrier_name.value) base.carrier_name = r.carrier_name;
    if (!base.drivers.length && r.drivers.length) base.drivers = clone(r).drivers;
    if (!base.vehicles.length && r.vehicles.length) base.vehicles = clone(r).vehicles;
    if (!base.business.name.value && r.business.name.value) base.business = clone(r).business;
    if (!base.property.address.value && r.property.address.value) base.property = clone(r).property;
  }

  // Synthesize a driver from a license when the auto dec didn't list one.
  if (line === "personal_auto" && !base.drivers.length) {
    const lic = docs.find((d) => d.record.id_document.full_name.value)?.record.id_document;
    if (lic) base.drivers = [{ name: lic.full_name, license_number: lic.license_number, dob: lic.dob }];
    if (!base.named_insured.value && lic?.full_name.value) base.named_insured = lic.full_name;
  }
  return base;
}

function detectCarrier(record: CanonicalRecord): string {
  return record.carrier_name.value ?? "";
}

export interface LeadFormPlanLine {
  line: QuoteLineType;
  lineLabel: string;
  carrier: string;
  state: string;
  forms: { form_id: string; title: string; isSupplement: boolean }[];
}

/** What forms could be generated for this lead, grouped by line. */
export async function planForLead(documents: StoredDocument[]): Promise<LeadFormPlanLine[]> {
  const lines = new Set<QuoteLineType>();
  for (const d of documents) {
    const line = LINE_BY_DOCTYPE[d.docType];
    if (line) lines.add(line);
  }

  const plan: LeadFormPlanLine[] = [];
  for (const line of lines) {
    const record = buildCanonicalForLine(documents, line);
    const carrier = detectCarrier(record);
    const state = stateFromAddress(record.mailing_address.value || record.property.address.value);
    const maps = await selectForms(line, carrier, state);
    if (!maps.length) continue;
    plan.push({
      line,
      lineLabel: LINE_LABEL[line],
      carrier,
      state,
      forms: maps.map((m) => ({
        form_id: m.form_id,
        title: m.title,
        isSupplement: !!m.applies_to.carriers?.length,
      })),
    });
  }
  return plan;
}

/** Fill one form for a lead's line and return the PDF bytes. */
export async function fillFormForLead(
  documents: StoredDocument[],
  line: QuoteLineType,
  formId: string,
): Promise<FilledForm | null> {
  const map: FormMap | undefined = await getFormMap(formId);
  if (!map) return null;
  const record = buildCanonicalForLine(documents, line);
  return fillForm(map, record);
}
