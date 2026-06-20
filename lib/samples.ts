// ─────────────────────────────────────────────────────────────────────────────
// The 8 fictitious sample documents (BUILD_SPEC §16). Each is mapped to an exact
// CanonicalRecord built faithfully from the document's real content, with a few
// deliberately low-confidence fields so the human-in-the-loop review UI has
// something to flag. Matching is by content hash (sha256) first, then filename,
// so dropping any of the real sample PDFs into the uploader reproduces the
// extraction exactly — with or without an Anthropic key.
// ─────────────────────────────────────────────────────────────────────────────

import { type CanonicalRecord, type DocType, emptyRecord, f, finalizeConfidence } from "./canonical";

export type LeadKey = "maria" | "tanaka" | "desertbloom";

export interface SampleMeta {
  id: string;
  fileName: string;
  sha256: string;
  docType: DocType;
  title: string;
  leadKey: LeadKey;
  build: () => CanonicalRecord;
}

// ── Record builders ──────────────────────────────────────────────────────────

function rec01(): CanonicalRecord {
  const r = emptyRecord();
  r.doc_type = "personal_auto_dec";
  r.carrier_name = f("Pacific Crest Mutual", 0.99);
  r.policy_number = f("PA-CA-7741920", 0.98);
  r.policy_period = { start: f("2025-03-15", 0.95), end: f("2025-09-15", 0.95) };
  r.named_insured = f("Maria E. Gutierrez", 0.98);
  r.mailing_address = f("42 Cabrillo Ave, Cathedral City, CA 92234", 0.96);
  r.drivers = [
    { name: f("Maria E. Gutierrez", 0.97), license_number: f("D1234567", 0.95), dob: f("1985-07-14", 0.93) },
    { name: f("Luis A. Gutierrez", 0.96), license_number: f("D7654321", 0.94), dob: f("1983-11-02", 0.9) },
  ];
  r.vehicles = [
    {
      year: f("2021", 0.98), make: f("Toyota", 0.98), model: f("RAV4 XLE", 0.95),
      vin: f("2T3W1RFV5MW123456", 0.96), comp_deductible: f("$500", 0.93), coll_deductible: f("$1,000", 0.93),
    },
    {
      year: f("2018", 0.97), make: f("Honda", 0.97), model: f("Civic LX", 0.93),
      vin: f("19XFC2F59JE034521", 0.72), comp_deductible: f("$500", 0.92), coll_deductible: f("$1,000", 0.92),
    },
  ];
  r.coverages = [
    { name: f("Bodily Injury Liability", 0.97), limit: f("$100,000 / $300,000", 0.96), deductible: f(null), premium: f("$612.00", 0.96) },
    { name: f("Property Damage Liability", 0.97), limit: f("$50,000", 0.96), deductible: f(null), premium: f("$248.00", 0.96) },
    { name: f("Uninsured/Underinsured Motorist", 0.95), limit: f("$100,000 / $300,000", 0.94), deductible: f(null), premium: f("$96.00", 0.95) },
    { name: f("Medical Payments", 0.96), limit: f("$5,000", 0.95), deductible: f(null), premium: f("$44.00", 0.95) },
    { name: f("Comprehensive", 0.96), limit: f("ACV", 0.9), deductible: f("$500", 0.94), premium: f("$386.00", 0.95) },
    { name: f("Collision", 0.96), limit: f("ACV", 0.9), deductible: f("$1,000", 0.94), premium: f("$418.00", 0.95) },
    { name: f("Rental Reimbursement", 0.92), limit: f("$40/day, $1,200 max", 0.88), deductible: f(null), premium: f("$38.00", 0.92) },
  ];
  r.premium_total = f("$1,842.00", 0.98);
  r.overall_confidence = 0.95;
  return finalizeConfidence(r);
}

function rec02(): CanonicalRecord {
  const r = emptyRecord();
  r.doc_type = "homeowners_dec";
  r.carrier_name = f("Sierra Vista Insurance Group", 0.97);
  r.policy_number = f("HO-SV-3320915", 0.97);
  r.policy_period = { start: f("2025-01-01", 0.96), end: f("2026-01-01", 0.96) };
  r.named_insured = f("Robert T. Tanaka & Linda M. Tanaka", 0.96);
  r.mailing_address = f("318 Vista Del Sol, Palm Springs, CA 92262", 0.95);
  r.property = {
    address: f("318 Vista Del Sol, Palm Springs, CA 92262", 0.95),
    year_built: f("1998", 0.92),
    construction: f("Frame", 0.93),
    coverage_a: f("$485,000", 0.97),
    coverage_c: f("$242,500", 0.95),
    liability: f("$300,000", 0.95),
    deductible: f("$2,500", 0.95),
    mortgagee: f("Desert Sun Credit Union, ISAOA/ATIMA", 0.9),
  };
  r.coverages = [
    { name: f("Dwelling (Coverage A)", 0.97), limit: f("$485,000", 0.97), deductible: f("$2,500", 0.95), premium: f(null) },
    { name: f("Other Structures (Coverage B)", 0.95), limit: f("$48,500", 0.94), deductible: f(null), premium: f(null) },
    { name: f("Personal Property (Coverage C)", 0.95), limit: f("$242,500", 0.95), deductible: f(null), premium: f(null) },
    { name: f("Loss of Use (Coverage D)", 0.94), limit: f("$97,000", 0.93), deductible: f(null), premium: f(null) },
    { name: f("Personal Liability (Coverage E)", 0.95), limit: f("$300,000", 0.95), deductible: f(null), premium: f(null) },
    { name: f("Medical Payments (Coverage F)", 0.94), limit: f("$5,000", 0.94), deductible: f(null), premium: f(null) },
  ];
  r.premium_total = f("$2,310.00", 0.96);
  r.overall_confidence = 0.95;
  return finalizeConfidence(r);
}

function rec03(): CanonicalRecord {
  const r = emptyRecord();
  r.doc_type = "drivers_license";
  r.id_document = {
    full_name: f("Maria Elena Gutierrez", 0.95),
    dob: f("1985-07-14", 0.71), // partially obscured → flagged for review
    license_number: f("D1234567", 0.97),
    address: f("42 Cabrillo Ave, Cathedral City, CA 92234", 0.9),
    expiration: f("2027-07-14", 0.93),
  };
  r.overall_confidence = 0.89;
  return finalizeConfidence(r);
}

function rec04(): CanonicalRecord {
  const r = emptyRecord();
  r.doc_type = "vehicle_registration";
  r.named_insured = f("Maria Elena Gutierrez", 0.95);
  r.mailing_address = f("42 Cabrillo Ave, Cathedral City, CA 92234", 0.93);
  r.vehicles = [
    {
      year: f("2021", 0.97), make: f("Toyota", 0.9), model: f("RAV4", 0.92),
      vin: f("2T3W1RFV5MW123456", 0.97), comp_deductible: f(null), coll_deductible: f(null),
    },
  ];
  // Plate (8XYZ123) and registration dates have no canonical home; captured in
  // coverages as informational rows so nothing legible is silently dropped.
  r.coverages = [
    { name: f("License Plate", 0.96), limit: f("8XYZ123", 0.96), deductible: f(null), premium: f(null) },
    { name: f("Registration Valid", 0.93), limit: f("2025-03-01 to 2026-02-28", 0.9), deductible: f(null), premium: f(null) },
  ];
  r.overall_confidence = 0.93;
  return finalizeConfidence(r);
}

function rec05(): CanonicalRecord {
  const r = emptyRecord();
  r.doc_type = "acord_certificate";
  r.carrier_name = f("Granite Peak Commercial Ins Co", 0.92);
  r.policy_number = f("CGL-GP-5519082", 0.9);
  r.named_insured = f("Desert Bloom Landscaping LLC", 0.96);
  r.mailing_address = f("1100 Industrial Way, Indio, CA 92201", 0.93);
  r.business = {
    name: f("Desert Bloom Landscaping LLC", 0.97),
    entity_type: f("LLC", 0.8),
    description: f("Landscaping services", 0.78),
    each_occurrence: f("$1,000,000", 0.73), // flagged for review
    general_aggregate: f("$2,000,000", 0.9),
  };
  r.coverages = [
    { name: f("Commercial General Liability", 0.94), limit: f("Each Occ $1,000,000 / Agg $2,000,000", 0.9), deductible: f(null), premium: f(null) },
    { name: f("Automobile Liability", 0.92), limit: f("Combined Single Limit $1,000,000", 0.9), deductible: f(null), premium: f(null) },
    { name: f("Umbrella / Excess", 0.9), limit: f("Each Occ $2,000,000", 0.88), deductible: f(null), premium: f(null) },
    { name: f("Workers Compensation", 0.9), limit: f("Statutory · E.L. $1,000,000", 0.88), deductible: f(null), premium: f(null) },
  ];
  r.overall_confidence = 0.88;
  return finalizeConfidence(r);
}

function rec06(): CanonicalRecord {
  const r = emptyRecord();
  r.doc_type = "commercial_gl_dec";
  r.carrier_name = f("Granite Peak Commercial Insurance Company", 0.98);
  r.policy_number = f("CGL-GP-5519082", 0.98);
  r.policy_period = { start: f("2025-06-01", 0.96), end: f("2026-06-01", 0.96) };
  r.named_insured = f("Desert Bloom Landscaping LLC", 0.98);
  r.mailing_address = f("1100 Industrial Way, Indio, CA 92201", 0.95);
  r.business = {
    name: f("Desert Bloom Landscaping LLC", 0.98),
    entity_type: f("Limited Liability Company", 0.95),
    description: f("Landscaping & Lawn Care Services", 0.95),
    each_occurrence: f("$1,000,000", 0.96),
    general_aggregate: f("$2,000,000", 0.97),
  };
  r.coverages = [
    { name: f("Each Occurrence", 0.97), limit: f("$1,000,000", 0.97), deductible: f(null), premium: f(null) },
    { name: f("General Aggregate", 0.97), limit: f("$2,000,000", 0.97), deductible: f(null), premium: f(null) },
    { name: f("Products / Completed Operations Aggregate", 0.95), limit: f("$2,000,000", 0.95), deductible: f(null), premium: f(null) },
    { name: f("Personal & Advertising Injury", 0.95), limit: f("$1,000,000", 0.95), deductible: f(null), premium: f(null) },
    { name: f("Damage to Premises Rented to You", 0.93), limit: f("$100,000", 0.93), deductible: f(null), premium: f(null) },
    { name: f("Medical Expense (any one person)", 0.93), limit: f("$5,000", 0.93), deductible: f(null), premium: f(null) },
  ];
  r.premium_total = f("$4,250.00", 0.97);
  r.overall_confidence = 0.96;
  return finalizeConfidence(r);
}

function rec07(): CanonicalRecord {
  const r = emptyRecord();
  r.doc_type = "medicare_supplement";
  r.carrier_name = f("Golden State Senior Health", 0.96);
  r.policy_number = f("GSS-44820915", 0.95);
  r.policy_period = { start: f("2025-02-01", 0.9), end: f(null) };
  r.named_insured = f("Robert T. Tanaka", 0.97);
  r.premium_total = f("$148.50/mo", 0.95);
  r.coverages = [
    { name: f("Plan", 0.97), limit: f("Medigap Plan G", 0.96), deductible: f(null), premium: f("$148.50/mo", 0.95) },
    { name: f("Part A coinsurance & hospital costs", 0.94), limit: f("100%", 0.94), deductible: f(null), premium: f(null) },
    { name: f("Part B coinsurance or copayment", 0.94), limit: f("100%", 0.94), deductible: f(null), premium: f(null) },
    { name: f("Part A deductible", 0.93), limit: f("100%", 0.93), deductible: f(null), premium: f(null) },
    { name: f("Part B deductible", 0.93), limit: f("Not covered", 0.92), deductible: f(null), premium: f(null) },
    { name: f("Part B excess charges", 0.92), limit: f("100%", 0.92), deductible: f(null), premium: f(null) },
    { name: f("Foreign travel emergency", 0.9), limit: f("80% to plan limits", 0.88), deductible: f(null), premium: f(null) },
  ];
  r.overall_confidence = 0.94;
  return finalizeConfidence(r);
}

function rec08(): CanonicalRecord {
  const r = emptyRecord();
  r.doc_type = "prior_auto_dec";
  r.carrier_name = f("Coachella Valley Mutual", 0.98);
  r.policy_number = f("CVM-AUTO-668241", 0.96);
  r.policy_period = { start: f("2025-04-01", 0.95), end: f("2025-10-01", 0.95) };
  r.named_insured = f("Maria E. Gutierrez", 0.98);
  r.mailing_address = f("42 Cabrillo Ave, Cathedral City, CA 92234", 0.95);
  r.vehicles = [
    {
      year: f("2021", 0.97), make: f("Toyota", 0.97), model: f("RAV4", 0.93),
      vin: f("2T3W1RFV5MW123456", 0.95), comp_deductible: f("$1,000", 0.93), coll_deductible: f("$1,000", 0.93),
    },
    {
      year: f("2018", 0.96), make: f("Honda", 0.96), model: f("Civic", 0.92),
      vin: f("19XFC2F59JE034521", 0.94), comp_deductible: f("$1,000", 0.92), coll_deductible: f("$1,000", 0.92),
    },
  ];
  r.coverages = [
    { name: f("Bodily Injury Liability", 0.96), limit: f("$50,000 / $100,000", 0.95), deductible: f(null), premium: f(null) },
    { name: f("Property Damage", 0.96), limit: f("$50,000", 0.95), deductible: f(null), premium: f(null) },
    { name: f("Uninsured Motorist", 0.94), limit: f("$50,000 / $100,000", 0.93), deductible: f(null), premium: f(null) },
  ];
  r.premium_total = f("$2,040.00", 0.97);
  r.overall_confidence = 0.95;
  return finalizeConfidence(r);
}

// ── Sample registry ──────────────────────────────────────────────────────────

export const SAMPLES: SampleMeta[] = [
  { id: "01", fileName: "01_personal_auto_dec_pacific_crest.pdf", sha256: "0d7d77a377df806b1e84a488a567d81c6e313af2bf5f80245076935e831e0d2a", docType: "personal_auto_dec", title: "Pacific Crest Mutual — Personal Auto Dec", leadKey: "maria", build: rec01 },
  { id: "02", fileName: "02_homeowners_dec_sierra_vista.pdf", sha256: "f7e1f5a183f985734c7f6bcd6eb87ca7c7f2eaa72cdcd9495e2d92611339ff7c", docType: "homeowners_dec", title: "Sierra Vista — Homeowners Dec (HO-3)", leadKey: "tanaka", build: rec02 },
  { id: "03", fileName: "03_drivers_license_specimen.pdf", sha256: "918e1c0b7d0cf4f0c82bdd40c0f73c89ce69eb4502c7ee0751109665a23a1be3", docType: "drivers_license", title: "California Driver License (specimen)", leadKey: "maria", build: rec03 },
  { id: "04", fileName: "04_vehicle_registration_ca.pdf", sha256: "abbe3237c0e83f51a81e17138e1888031f8e2b1dfe19e94e1793ca634ddbfd4f", docType: "vehicle_registration", title: "California DMV — Registration Card", leadKey: "maria", build: rec04 },
  { id: "05", fileName: "05_acord25_cert_liability.pdf", sha256: "6d497d7f6d11198976be44d6528bf99726b6af41949f2b5000b25236f1dd318a", docType: "acord_certificate", title: "ACORD 25 — Certificate of Liability", leadKey: "desertbloom", build: rec05 },
  { id: "06", fileName: "06_commercial_gl_dec_granite_peak.pdf", sha256: "e9651e8532915c005e41c02afa6dde2adaaf91561307559cf920b46074266924", docType: "commercial_gl_dec", title: "Granite Peak — Commercial GL Dec", leadKey: "desertbloom", build: rec06 },
  { id: "07", fileName: "07_medicare_supplement_plan_g.pdf", sha256: "fe9a84e3f1832357a033ed391ff3cf8b87c2172ca19db756d6c641599e74d7d7", docType: "medicare_supplement", title: "Golden State Senior — Medicare Supp (Plan G)", leadKey: "tanaka", build: rec07 },
  { id: "08", fileName: "08_prior_auto_dec_coachella_valley.pdf", sha256: "6e303a5f37c742f11d4f4cd0ea493e9ad23ee9d6c2877575898156bbf0c32274", docType: "prior_auto_dec", title: "Coachella Valley Mutual — Prior Auto Dec", leadKey: "maria", build: rec08 },
];

export const SAMPLE_BY_HASH: Record<string, SampleMeta> = Object.fromEntries(
  SAMPLES.map((s) => [s.sha256, s]),
);
export const SAMPLE_BY_FILENAME: Record<string, SampleMeta> = Object.fromEntries(
  SAMPLES.map((s) => [s.fileName.toLowerCase(), s]),
);
export const SAMPLE_BY_ID: Record<string, SampleMeta> = Object.fromEntries(
  SAMPLES.map((s) => [s.id, s]),
);

/** Match an uploaded file to a known sample by content hash, then filename. */
export function matchSample(opts: { sha256?: string; fileName?: string }): SampleMeta | undefined {
  if (opts.sha256 && SAMPLE_BY_HASH[opts.sha256]) return SAMPLE_BY_HASH[opts.sha256];
  if (opts.fileName) {
    const byName = SAMPLE_BY_FILENAME[opts.fileName.toLowerCase()];
    if (byName) return byName;
  }
  return undefined;
}
