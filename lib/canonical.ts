// ─────────────────────────────────────────────────────────────────────────────
// CanonicalRecord — the single normalized shape every extraction and every
// intake form maps into. Form-fill reads ONLY from this. The extraction layer
// and the form-fill layer never talk directly (see BUILD_SPEC §6, §7).
// ─────────────────────────────────────────────────────────────────────────────

export type Confidence = number; // 0..1

export interface Field<T> {
  value: T | null;
  confidence: Confidence;
  source?: string;
}

export type DocType =
  | "personal_auto_dec"
  | "homeowners_dec"
  | "commercial_gl_dec"
  | "acord_certificate"
  | "drivers_license"
  | "vehicle_registration"
  | "medicare_supplement"
  | "prior_auto_dec"
  | "unknown";

export interface Driver {
  name: Field<string>;
  license_number: Field<string>;
  dob: Field<string>;
}

export interface Vehicle {
  year: Field<string>;
  make: Field<string>;
  model: Field<string>;
  vin: Field<string>;
  comp_deductible: Field<string>;
  coll_deductible: Field<string>;
}

export interface Coverage {
  name: Field<string>;
  limit: Field<string>;
  deductible: Field<string>;
  premium: Field<string>;
}

export interface CanonicalRecord {
  doc_type: DocType;
  carrier_name: Field<string>;
  policy_number: Field<string>;
  policy_period: { start: Field<string>; end: Field<string> }; // ISO dates
  named_insured: Field<string>;
  mailing_address: Field<string>;
  drivers: Driver[];
  vehicles: Vehicle[];
  property: {
    address: Field<string>;
    year_built: Field<string>;
    construction: Field<string>;
    coverage_a: Field<string>;
    coverage_c: Field<string>;
    liability: Field<string>;
    deductible: Field<string>;
    mortgagee: Field<string>;
  };
  business: {
    name: Field<string>;
    entity_type: Field<string>;
    description: Field<string>;
    each_occurrence: Field<string>;
    general_aggregate: Field<string>;
  };
  coverages: Coverage[];
  premium_total: Field<string>;
  id_document: {
    full_name: Field<string>;
    dob: Field<string>;
    license_number: Field<string>;
    address: Field<string>;
    expiration: Field<string>;
  };
  overall_confidence: Confidence;
  needs_review: boolean; // true if any required-for-doc_type field < THRESHOLD
}

// The confidence floor below which a field is flagged for human review.
export const REVIEW_THRESHOLD = 0.75;

// Which scalar canonical paths are "required" for each doc_type. Drives the
// per-field check behind `needs_review` (BUILD_SPEC §6c, §15 shot 2.1).
export const REQUIRED_BY_DOCTYPE: Record<DocType, string[]> = {
  personal_auto_dec: ["carrier_name", "policy_number", "named_insured", "premium_total"],
  prior_auto_dec: ["carrier_name", "policy_number", "named_insured", "premium_total"],
  homeowners_dec: ["carrier_name", "policy_number", "named_insured", "property.coverage_a"],
  commercial_gl_dec: ["carrier_name", "policy_number", "business.name", "business.general_aggregate"],
  acord_certificate: ["business.name", "business.each_occurrence"],
  drivers_license: ["id_document.full_name", "id_document.license_number", "id_document.dob"],
  vehicle_registration: ["named_insured"],
  medicare_supplement: ["named_insured", "premium_total"],
  unknown: [],
};

// ── Field constructor (keeps seed + extraction code terse) ───────────────────
// Every canonical field is a Field<string>, so the helper is string-specific —
// this keeps `f(null)` typed as Field<string> rather than Field<null>.
export function f(value: string | null, confidence: Confidence = 0, source?: string): Field<string> {
  return source ? { value, confidence, source } : { value, confidence };
}

const ef = () => f(null, 0);

/** A fully-formed, empty CanonicalRecord. Extraction + seed both start here. */
export function emptyRecord(): CanonicalRecord {
  return {
    doc_type: "unknown",
    carrier_name: ef(),
    policy_number: ef(),
    policy_period: { start: ef(), end: ef() },
    named_insured: ef(),
    mailing_address: ef(),
    drivers: [],
    vehicles: [],
    property: {
      address: ef(),
      year_built: ef(),
      construction: ef(),
      coverage_a: ef(),
      coverage_c: ef(),
      liability: ef(),
      deductible: ef(),
      mortgagee: ef(),
    },
    business: {
      name: ef(),
      entity_type: ef(),
      description: ef(),
      each_occurrence: ef(),
      general_aggregate: ef(),
    },
    coverages: [],
    premium_total: ef(),
    id_document: {
      full_name: ef(),
      dob: ef(),
      license_number: ef(),
      address: ef(),
      expiration: ef(),
    },
    overall_confidence: 0,
    needs_review: true,
  };
}

/** Read a dotted path ("business.name.value") out of an arbitrary object. */
export function getPath(obj: unknown, path: string): unknown {
  return path.split(".").reduce<unknown>((acc, key) => {
    if (acc && typeof acc === "object" && key in (acc as Record<string, unknown>)) {
      return (acc as Record<string, unknown>)[key];
    }
    return undefined;
  }, obj);
}

/** Look up the {value, confidence} Field at a scalar canonical path. */
export function getField(record: CanonicalRecord, path: string): Field<unknown> | undefined {
  const node = getPath(record, path);
  if (node && typeof node === "object" && "value" in (node as object)) {
    return node as Field<unknown>;
  }
  return undefined;
}

/**
 * Recompute overall_confidence + needs_review from the record's contents.
 * needs_review is true when any required-for-doc_type field is below threshold
 * OR overall confidence is below threshold.
 */
export function finalizeConfidence(record: CanonicalRecord): CanonicalRecord {
  const required = REQUIRED_BY_DOCTYPE[record.doc_type] ?? [];
  const requiredFields = required
    .map((p) => getField(record, p))
    .filter((x): x is Field<unknown> => !!x);

  // overall = min of required-field confidences, falling back to the model's
  // own overall_confidence when there are no required fields.
  let overall = record.overall_confidence;
  if (requiredFields.length) {
    overall = Math.min(
      record.overall_confidence || 1,
      ...requiredFields.map((x) => x.confidence ?? 0),
    );
  }

  const anyRequiredLow = requiredFields.some((x) => (x.confidence ?? 0) < REVIEW_THRESHOLD);
  return {
    ...record,
    overall_confidence: Number(overall.toFixed(3)),
    needs_review: anyRequiredLow || overall < REVIEW_THRESHOLD,
  };
}

/** Human-readable label for a doc_type. */
export const DOC_TYPE_LABELS: Record<DocType, string> = {
  personal_auto_dec: "Personal Auto — Declarations",
  prior_auto_dec: "Prior Auto — Declarations",
  homeowners_dec: "Homeowners — Declarations",
  commercial_gl_dec: "Commercial GL — Declarations",
  acord_certificate: "ACORD 25 — Certificate of Liability",
  drivers_license: "Driver License",
  vehicle_registration: "Vehicle Registration",
  medicare_supplement: "Medicare Supplement",
  unknown: "Unrecognized Document",
};

/** Best-effort display name for whoever/whatever a record describes. */
export function recordSubject(record: CanonicalRecord): string {
  return (
    record.named_insured.value ||
    record.business.name.value ||
    record.id_document.full_name.value ||
    "Unknown"
  );
}
