"use client";

import { useMemo } from "react";
import {
  type CanonicalRecord, type DocType, type Field,
  REVIEW_THRESHOLD, finalizeConfidence,
} from "@/lib/canonical";
import { ConfidenceBadge } from "@/components/ui/chips";
import { IconCheck, IconPlus } from "@/components/ui/icons";
import { cn } from "@/lib/utils";

type Path = (string | number)[];

const GROUPS: Record<string, { title: string; fields: { path: Path; label: string }[] }> = {
  policy: {
    title: "Policy",
    fields: [
      { path: ["carrier_name"], label: "Carrier" },
      { path: ["policy_number"], label: "Policy #" },
      { path: ["policy_period", "start"], label: "Effective" },
      { path: ["policy_period", "end"], label: "Expires" },
      { path: ["premium_total"], label: "Premium" },
    ],
  },
  insured: {
    title: "Named insured",
    fields: [
      { path: ["named_insured"], label: "Name" },
      { path: ["mailing_address"], label: "Mailing address" },
    ],
  },
  property: {
    title: "Property",
    fields: [
      { path: ["property", "address"], label: "Property address" },
      { path: ["property", "year_built"], label: "Year built" },
      { path: ["property", "construction"], label: "Construction" },
      { path: ["property", "coverage_a"], label: "Coverage A (Dwelling)" },
      { path: ["property", "coverage_c"], label: "Coverage C (Personal property)" },
      { path: ["property", "liability"], label: "Personal liability" },
      { path: ["property", "deductible"], label: "Deductible" },
      { path: ["property", "mortgagee"], label: "Mortgagee" },
    ],
  },
  business: {
    title: "Business",
    fields: [
      { path: ["business", "name"], label: "Business name" },
      { path: ["business", "entity_type"], label: "Entity type" },
      { path: ["business", "description"], label: "Description" },
      { path: ["business", "each_occurrence"], label: "Each occurrence" },
      { path: ["business", "general_aggregate"], label: "General aggregate" },
    ],
  },
  id: {
    title: "Identification",
    fields: [
      { path: ["id_document", "full_name"], label: "Full name" },
      { path: ["id_document", "dob"], label: "Date of birth" },
      { path: ["id_document", "license_number"], label: "License #" },
      { path: ["id_document", "address"], label: "Address" },
      { path: ["id_document", "expiration"], label: "Expiration" },
    ],
  },
};

const ARRAY_FIELDS: Record<string, { key: string; label: string }[]> = {
  drivers: [
    { key: "name", label: "Name" },
    { key: "license_number", label: "License #" },
    { key: "dob", label: "DOB" },
  ],
  vehicles: [
    { key: "year", label: "Year" },
    { key: "make", label: "Make" },
    { key: "model", label: "Model" },
    { key: "vin", label: "VIN" },
    { key: "comp_deductible", label: "Comp ded." },
    { key: "coll_deductible", label: "Coll ded." },
  ],
  coverages: [
    { key: "name", label: "Coverage" },
    { key: "limit", label: "Limit" },
    { key: "deductible", label: "Deductible" },
    { key: "premium", label: "Premium" },
  ],
};

const ARRAY_TITLES: Record<string, string> = { drivers: "Drivers", vehicles: "Vehicles", coverages: "Coverages" };

const SHOW: Record<DocType, { groups: string[]; arrays: string[] }> = {
  personal_auto_dec: { groups: ["policy", "insured"], arrays: ["drivers", "vehicles", "coverages"] },
  prior_auto_dec: { groups: ["policy", "insured"], arrays: ["drivers", "vehicles", "coverages"] },
  homeowners_dec: { groups: ["policy", "insured", "property"], arrays: ["coverages"] },
  commercial_gl_dec: { groups: ["policy", "business"], arrays: ["coverages"] },
  acord_certificate: { groups: ["policy", "business"], arrays: ["coverages"] },
  drivers_license: { groups: ["id"], arrays: [] },
  vehicle_registration: { groups: ["insured"], arrays: ["vehicles", "coverages"] },
  medicare_supplement: { groups: ["policy", "insured"], arrays: ["coverages"] },
  unknown: { groups: ["policy", "insured", "property", "business", "id"], arrays: ["drivers", "vehicles", "coverages"] },
};

function getAt(obj: unknown, path: Path): Field<string> | undefined {
  let cur: unknown = obj;
  for (const k of path) {
    if (cur && typeof cur === "object") cur = (cur as Record<string, unknown>)[k as string];
    else return undefined;
  }
  return cur as Field<string> | undefined;
}

function setAt(record: CanonicalRecord, path: Path, value: string): CanonicalRecord {
  const draft = structuredClone(record);
  let cur: Record<string, unknown> = draft as unknown as Record<string, unknown>;
  for (let i = 0; i < path.length - 1; i++) cur = cur[path[i] as string] as Record<string, unknown>;
  const leaf = cur[path[path.length - 1] as string] as Field<string>;
  leaf.value = value === "" ? null : value;
  leaf.confidence = 1; // human-verified
  leaf.source = "user";
  return finalizeConfidence(draft);
}

const emptyField = (): Field<string> => ({ value: null, confidence: 0 });
function emptyArrayItem(name: string): Record<string, Field<string>> {
  return Object.fromEntries(ARRAY_FIELDS[name].map((f) => [f.key, emptyField()]));
}

export function countLowConfidence(record: CanonicalRecord): number {
  let n = 0;
  const visit = (v: unknown) => {
    if (!v || typeof v !== "object") return;
    if ("value" in v && "confidence" in v) {
      const fld = v as Field<string>;
      if (fld.value && fld.confidence < REVIEW_THRESHOLD) n++;
      return;
    }
    if (Array.isArray(v)) v.forEach(visit);
    else Object.values(v).forEach(visit);
  };
  visit(record);
  return n;
}

function FieldRow({
  label, field, editable, onEdit,
}: {
  label: string;
  field: Field<string>;
  editable: boolean;
  onEdit: (v: string) => void;
}) {
  const low = field.value != null && field.confidence < REVIEW_THRESHOLD;
  const verified = field.source === "user";
  return (
    <div className={cn("field-card", low && "border-amber-300 bg-amber-50/60")}>
      <div className="mb-1 flex items-center justify-between gap-2">
        <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</span>
        {verified ? (
          <span className="chip bg-emerald-100 text-emerald-700"><IconCheck className="h-3 w-3" /> You</span>
        ) : field.value != null ? (
          <ConfidenceBadge confidence={field.confidence} />
        ) : null}
      </div>
      {editable ? (
        <input
          value={field.value ?? ""}
          onChange={(e) => onEdit(e.target.value)}
          placeholder="—"
          className={cn("input py-2 text-sm", low && "border-amber-300")}
        />
      ) : (
        <div className="text-sm font-medium text-brand-950">{field.value ?? <span className="text-slate-300">—</span>}</div>
      )}
    </div>
  );
}

export function RecordReview({
  record, editable = false, onChange,
}: {
  record: CanonicalRecord;
  editable?: boolean;
  onChange?: (r: CanonicalRecord) => void;
}) {
  const cfg = SHOW[record.doc_type] ?? SHOW.unknown;

  const groupsToShow = useMemo(() => {
    const set = new Set(cfg.groups);
    for (const [name, g] of Object.entries(GROUPS)) {
      if (g.fields.some((f) => getAt(record, f.path)?.value)) set.add(name);
    }
    return Object.keys(GROUPS).filter((g) => set.has(g));
  }, [record, cfg.groups]);

  const arraysToShow = useMemo(() => {
    const set = new Set(cfg.arrays);
    for (const name of Object.keys(ARRAY_FIELDS)) {
      if (Array.isArray((record as never)[name]) && ((record as never)[name] as unknown[]).length) set.add(name);
    }
    return Object.keys(ARRAY_FIELDS).filter((a) => set.has(a));
  }, [record, cfg.arrays]);

  const apply = (r: CanonicalRecord) => onChange?.(r);
  const updateArrayItems = (name: string, items: unknown[]) => {
    const draft = structuredClone(record) as unknown as Record<string, unknown>;
    draft[name] = items;
    apply(finalizeConfidence(draft as unknown as CanonicalRecord));
  };

  return (
    <div className="space-y-5">
      {groupsToShow.map((name) => {
        const group = GROUPS[name];
        const fields = group.fields.filter((f) => editable || getAt(record, f.path)?.value);
        if (!fields.length) return null;
        return (
          <section key={name}>
            <h4 className="mb-2 text-sm font-bold text-brand-900">{group.title}</h4>
            <div className="grid gap-2.5 sm:grid-cols-2">
              {fields.map((f) => (
                <FieldRow
                  key={f.path.join(".")}
                  label={f.label}
                  field={getAt(record, f.path) ?? emptyField()}
                  editable={editable}
                  onEdit={(v) => apply(setAt(record, f.path, v))}
                />
              ))}
            </div>
          </section>
        );
      })}

      {arraysToShow.map((name) => {
        const items = ((record as never)[name] as Record<string, Field<string>>[]) ?? [];
        if (!editable && !items.length) return null;
        return (
          <section key={name}>
            <div className="mb-2 flex items-center justify-between">
              <h4 className="text-sm font-bold text-brand-900">{ARRAY_TITLES[name]}</h4>
              {editable && (
                <button
                  className="btn-ghost btn-sm"
                  onClick={() => updateArrayItems(name, [...items, emptyArrayItem(name)])}
                >
                  <IconPlus className="h-3.5 w-3.5" /> Add
                </button>
              )}
            </div>
            <div className="space-y-2.5">
              {items.map((item, i) => (
                <div key={i} className="rounded-xl border border-slate-200 bg-slate-50/60 p-3">
                  <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
                    {ARRAY_FIELDS[name].map((f) => (
                      <FieldRow
                        key={f.key}
                        label={f.label}
                        field={item[f.key] ?? emptyField()}
                        editable={editable}
                        onEdit={(v) => {
                          const next = structuredClone(items);
                          if (!next[i][f.key]) next[i][f.key] = emptyField();
                          next[i][f.key].value = v === "" ? null : v;
                          next[i][f.key].confidence = 1;
                          next[i][f.key].source = "user";
                          updateArrayItems(name, next);
                        }}
                      />
                    ))}
                  </div>
                  {editable && (
                    <div className="mt-2 text-right">
                      <button
                        className="text-xs font-medium text-rose-600 hover:text-rose-700"
                        onClick={() => updateArrayItems(name, items.filter((_, j) => j !== i))}
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>
              ))}
              {!items.length && <p className="text-sm text-slate-400">None extracted.</p>}
            </div>
          </section>
        );
      })}
    </div>
  );
}
