// ─────────────────────────────────────────────────────────────────────────────
// Core extraction (BUILD_SPEC §6c). One entry point, three paths:
//   1. Known sample  → return its exact canonical record (works with no key).
//   2. ANTHROPIC key → real Claude vision extraction via a single forced tool.
//   3. Otherwise      → a clearly-labelled demo extraction.
// Everything funnels through one normalized CanonicalRecord.
// ─────────────────────────────────────────────────────────────────────────────

import { createHash } from "node:crypto";
import { config } from "../config";
import {
  type CanonicalRecord, type DocType, type Field,
  emptyRecord, f, finalizeConfidence,
} from "../canonical";
import { extractionTool } from "../extraction-schema";
import { type SampleMeta, matchSample } from "../samples";

export type ExtractionMode = "sample" | "ai" | "demo";

export interface ExtractionResult {
  record: CanonicalRecord;
  mode: ExtractionMode;
  sample?: SampleMeta;
  message?: string;
  sha256: string;
}

export interface ExtractInput {
  base64: string;
  mime: string;
  fileName?: string;
  sha256?: string;
}

const SUPPORTED_MIME = new Set(["application/pdf", "image/jpeg", "image/png", "image/webp"]);

export async function extract(input: ExtractInput): Promise<ExtractionResult> {
  const sha256 = input.sha256 ?? createHash("sha256").update(Buffer.from(input.base64, "base64")).digest("hex");

  // 1. Known sample — deterministic, exact, no API needed.
  const sample = matchSample({ sha256, fileName: input.fileName });
  if (sample) {
    return { record: sample.build(), mode: "sample", sample, sha256 };
  }

  // 2. Real AI extraction when a key is configured.
  if (config.anthropic.enabled && SUPPORTED_MIME.has(input.mime)) {
    try {
      const record = await extractWithClaude(input);
      return { record, mode: "ai", sha256 };
    } catch (err) {
      return {
        record: demoRecord(input.fileName),
        mode: "demo",
        sha256,
        message: `AI extraction failed (${(err as Error).message}); showing a demo extraction.`,
      };
    }
  }

  // 3. Demo fallback.
  return {
    record: demoRecord(input.fileName),
    mode: "demo",
    sha256,
    message:
      "Demo mode — real AI extraction needs ANTHROPIC_API_KEY. Upload one of the 8 bundled sample documents to see a full, exact extraction.",
  };
}

// ── Path 2: Anthropic vision + forced tool ───────────────────────────────────

async function extractWithClaude(input: ExtractInput): Promise<CanonicalRecord> {
  const Anthropic = (await import("@anthropic-ai/sdk")).default;
  const client = new Anthropic({ apiKey: config.anthropic.apiKey });

  const block =
    input.mime === "application/pdf"
      ? { type: "document" as const, source: { type: "base64" as const, media_type: "application/pdf" as const, data: input.base64 } }
      : { type: "image" as const, source: { type: "base64" as const, media_type: input.mime as "image/jpeg" | "image/png" | "image/webp", data: input.base64 } };

  const msg = await client.messages.create({
    model: config.anthropic.extractionModel,
    max_tokens: 4096,
    tools: [extractionTool as never],
    tool_choice: { type: "tool", name: "record_extraction" },
    messages: [
      {
        role: "user",
        content: [
          block as never,
          {
            type: "text",
            text:
              "This is an insurance-related document uploaded by a customer of an independent agency. " +
              "Classify it (doc_type) and extract every field present into the schema. " +
              "Read carefully: policy numbers, VINs, coverage limits, deductibles, premiums, names, dates. " +
              "Normalize dates to ISO (YYYY-MM-DD). Use null where a field is absent. " +
              "Confidence reflects legibility and certainty, not how common the field is.",
          },
        ],
      },
    ],
  });

  const tool = msg.content.find((b) => b.type === "tool_use");
  const raw = (tool as { input?: Record<string, unknown> } | undefined)?.input;
  if (!raw) throw new Error("model returned no structured output");
  return normalizeExtraction(raw);
}

// Coerce a raw tool-call object into a complete, valid CanonicalRecord. The
// model may omit absent fields; we merge onto an empty record so the shape is
// always whole (BUILD_SPEC §6c "map onto CanonicalRecord, validate, return").
export function normalizeExtraction(raw: Record<string, unknown>): CanonicalRecord {
  const r = emptyRecord();
  const asField = (v: unknown): Field<string> => {
    if (v && typeof v === "object" && "value" in (v as object)) {
      const o = v as { value: unknown; confidence?: unknown };
      const value = o.value == null ? null : String(o.value);
      const confidence = typeof o.confidence === "number" ? Math.max(0, Math.min(1, o.confidence)) : 0;
      return f(value, confidence);
    }
    return f(null, 0);
  };

  if (typeof raw.doc_type === "string") r.doc_type = raw.doc_type as DocType;
  if (typeof raw.overall_confidence === "number") r.overall_confidence = raw.overall_confidence;

  for (const k of ["carrier_name", "policy_number", "named_insured", "mailing_address", "premium_total"] as const) {
    if (raw[k] !== undefined) (r[k] as Field<string>) = asField(raw[k]);
  }

  const pp = raw.policy_period as Record<string, unknown> | undefined;
  if (pp) r.policy_period = { start: asField(pp.start), end: asField(pp.end) };

  const prop = raw.property as Record<string, unknown> | undefined;
  if (prop) {
    for (const k of ["address", "year_built", "construction", "coverage_a", "coverage_c", "liability", "deductible", "mortgagee"] as const) {
      if (prop[k] !== undefined) (r.property[k] as Field<string>) = asField(prop[k]);
    }
  }
  const biz = raw.business as Record<string, unknown> | undefined;
  if (biz) {
    for (const k of ["name", "entity_type", "description", "each_occurrence", "general_aggregate"] as const) {
      if (biz[k] !== undefined) (r.business[k] as Field<string>) = asField(biz[k]);
    }
  }
  const idd = raw.id_document as Record<string, unknown> | undefined;
  if (idd) {
    for (const k of ["full_name", "dob", "license_number", "address", "expiration"] as const) {
      if (idd[k] !== undefined) (r.id_document[k] as Field<string>) = asField(idd[k]);
    }
  }

  if (Array.isArray(raw.drivers)) {
    r.drivers = raw.drivers.map((d) => {
      const o = d as Record<string, unknown>;
      return { name: asField(o.name), license_number: asField(o.license_number), dob: asField(o.dob) };
    });
  }
  if (Array.isArray(raw.vehicles)) {
    r.vehicles = raw.vehicles.map((v) => {
      const o = v as Record<string, unknown>;
      return {
        year: asField(o.year), make: asField(o.make), model: asField(o.model),
        vin: asField(o.vin), comp_deductible: asField(o.comp_deductible), coll_deductible: asField(o.coll_deductible),
      };
    });
  }
  if (Array.isArray(raw.coverages)) {
    r.coverages = raw.coverages.map((c) => {
      const o = c as Record<string, unknown>;
      return { name: asField(o.name), limit: asField(o.limit), deductible: asField(o.deductible), premium: asField(o.premium) };
    });
  }

  return finalizeConfidence(r);
}

// ── Path 3: demo skeleton ────────────────────────────────────────────────────

function guessDocType(fileName?: string): DocType {
  const n = (fileName ?? "").toLowerCase();
  if (/medicare|medigap|supplement/.test(n)) return "medicare_supplement";
  if (/acord|cert/.test(n)) return "acord_certificate";
  if (/commercial|_gl_|general.?liab/.test(n)) return "commercial_gl_dec";
  if (/home|ho-?3|dwelling/.test(n)) return "homeowners_dec";
  if (/regist/.test(n)) return "vehicle_registration";
  if (/licen|dl_|drivers/.test(n)) return "drivers_license";
  if (/auto|vehicle|car/.test(n)) return "personal_auto_dec";
  return "unknown";
}

function demoRecord(fileName?: string): CanonicalRecord {
  const r = emptyRecord();
  r.doc_type = guessDocType(fileName);
  r.overall_confidence = 0.35;
  // A couple of low-confidence placeholders so the review UI has something to
  // show, clearly distinguishable from real extractions.
  r.carrier_name = f("(demo — set ANTHROPIC_API_KEY)", 0.3);
  return finalizeConfidence(r);
}
