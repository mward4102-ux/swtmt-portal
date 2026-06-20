// ─────────────────────────────────────────────────────────────────────────────
// Extraction tool schema (BUILD_SPEC §6b).
//
// Used as the `input_schema` of a single forced tool so the model MUST return
// exactly this JSON. The {value, confidence} field shape is generated
// programmatically from one source-of-truth list so the schema and the
// CanonicalRecord type never drift (per the build note in §6b).
// ─────────────────────────────────────────────────────────────────────────────

import type { DocType } from "./canonical";

export const DOC_TYPES: DocType[] = [
  "personal_auto_dec",
  "homeowners_dec",
  "commercial_gl_dec",
  "acord_certificate",
  "drivers_license",
  "vehicle_registration",
  "medicare_supplement",
  "prior_auto_dec",
  "unknown",
];

// A {value, confidence} pair, referenced everywhere a scalar field appears.
const fieldRef = { $ref: "#/$defs/f" } as const;

// Scalar (top-level) canonical fields → each is a {value, confidence} object.
const SCALAR_FIELDS = ["carrier_name", "policy_number", "named_insured", "mailing_address", "premium_total"];

// Nested objects whose leaves are all {value, confidence}.
const NESTED_OBJECTS: Record<string, string[]> = {
  policy_period: ["start", "end"],
  property: ["address", "year_built", "construction", "coverage_a", "coverage_c", "liability", "deductible", "mortgagee"],
  business: ["name", "entity_type", "description", "each_occurrence", "general_aggregate"],
  id_document: ["full_name", "dob", "license_number", "address", "expiration"],
};

// Array fields whose items are objects of {value, confidence} leaves.
const ARRAY_OBJECTS: Record<string, string[]> = {
  drivers: ["name", "license_number", "dob"],
  vehicles: ["year", "make", "model", "vin", "comp_deductible", "coll_deductible"],
  coverages: ["name", "limit", "deductible", "premium"],
};

function objectOfFields(keys: string[]) {
  return {
    type: "object",
    properties: Object.fromEntries(keys.map((k) => [k, fieldRef])),
  };
}

function buildProperties() {
  const props: Record<string, unknown> = {
    doc_type: { type: "string", enum: DOC_TYPES },
    overall_confidence: { type: "number", minimum: 0, maximum: 1 },
  };
  for (const k of SCALAR_FIELDS) props[k] = fieldRef;
  for (const [k, keys] of Object.entries(NESTED_OBJECTS)) props[k] = objectOfFields(keys);
  for (const [k, keys] of Object.entries(ARRAY_OBJECTS)) {
    props[k] = { type: "array", items: objectOfFields(keys) };
  }
  return props;
}

export const extractionTool = {
  name: "record_extraction",
  description:
    "Classify the insurance document and extract every field present. Use null for fields not present. Give a 0..1 confidence per field based on legibility and certainty.",
  input_schema: {
    type: "object",
    properties: buildProperties(),
    required: ["doc_type", "overall_confidence"],
    $defs: {
      f: {
        type: "object",
        properties: {
          value: { type: ["string", "null"] },
          confidence: { type: "number", minimum: 0, maximum: 1 },
        },
        required: ["value", "confidence"],
      },
    },
  },
} as const;

export type ExtractionToolInput = {
  doc_type: DocType;
  overall_confidence: number;
  [key: string]: unknown;
};
