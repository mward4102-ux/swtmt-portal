"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { type CanonicalRecord, recordSubject } from "@/lib/canonical";
import { LINE_SCHEMA, type FieldDef } from "@/lib/quote-schema";
import { mapCanonicalToLine } from "@/lib/quote-prefill";
import { QUOTE_LINES, type QuoteLineType } from "@/lib/types";
import { LINE_ICONS, IconCheck, IconChevronRight, IconPlus, IconSparkles, IconUpload } from "@/components/ui/icons";
import { cn } from "@/lib/utils";

const STEPS = ["Coverage", "Autofill", "Details", "Review"];

const AUTOFILL_SAMPLES: Record<QuoteLineType, { id: string; label: string }[]> = {
  personal_auto: [
    { id: "01", label: "Pacific Crest Auto" },
    { id: "08", label: "Prior Auto (compare)" },
    { id: "03", label: "Driver License" },
    { id: "04", label: "Registration" },
  ],
  homeowners: [{ id: "02", label: "Sierra Vista Home" }],
  commercial: [
    { id: "06", label: "Granite Peak GL" },
    { id: "05", label: "ACORD 25 Cert" },
  ],
  life_health: [{ id: "07", label: "Medicare Plan G" }],
};

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(",")[1] ?? "");
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function isFilled(v: unknown): boolean {
  if (Array.isArray(v)) return v.length > 0;
  return typeof v === "string" ? v.trim().length > 0 : v != null;
}

export function QuoteWizard() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [line, setLine] = useState<QuoteLineType | null>(null);
  const [data, setData] = useState<Record<string, unknown>>({});
  const [prefillNote, setPrefillNote] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resumed, setResumed] = useState(false);

  // Resume a saved draft, if any.
  useEffect(() => {
    fetch("/api/quotes/draft")
      .then((r) => r.json())
      .then((d) => {
        const draft = d.draft;
        if (draft?.lines?.[0]) {
          setLine(draft.lines[0].line);
          setData(draft.lines[0].data ?? {});
          if (draft.notes) setNotes(draft.notes);
          setStep(3);
          setResumed(true);
        }
      })
      .catch(() => {});
  }, []);

  const schema: FieldDef[] = line ? LINE_SCHEMA[line] : [];

  function saveDraft(nextData = data) {
    if (!line) return;
    fetch("/api/quotes/draft", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lines: [{ line, data: nextData }], notes }),
    }).catch(() => {});
  }

  async function autofill(payload: Record<string, unknown>) {
    if (!line) return;
    setScanning(true);
    setError(null);
    try {
      const res = await fetch("/api/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Extraction failed");
      const record: CanonicalRecord = result.record;
      const prefilled = mapCanonicalToLine(line, record);
      const next = { ...data };
      for (const [k, val] of Object.entries(prefilled)) if (isFilled(val)) next[k] = val;
      setData(next);
      setPrefillNote(`Prefilled from ${recordSubject(record)}.`);
      setStep(3);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setScanning(false);
    }
  }

  async function submit() {
    if (!line) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/quotes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lines: [{ line, data }], notes }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Submit failed");
      router.push("/confirmation?type=quote");
    } catch (e) {
      setError((e as Error).message);
      setBusy(false);
    }
  }

  return (
    <div>
      {/* Stepper */}
      <ol className="mb-6 flex items-center gap-2">
        {STEPS.map((label, i) => {
          const n = i + 1;
          const active = step === n;
          const done = step > n;
          return (
            <li key={label} className="flex flex-1 items-center gap-2">
              <span className={cn("stepper-dot", done ? "bg-emerald-500 text-white" : active ? "bg-brand-600 text-white" : "bg-slate-200 text-slate-500")}>
                {done ? <IconCheck className="h-4 w-4" /> : n}
              </span>
              <span className={cn("hidden text-sm font-medium sm:block", active ? "text-brand-900" : "text-slate-400")}>{label}</span>
              {i < STEPS.length - 1 && <span className="h-px flex-1 bg-slate-200" />}
            </li>
          );
        })}
      </ol>

      {resumed && step === 3 && (
        <div className="mb-4 rounded-xl border border-brand-200 bg-brand-50 px-4 py-2.5 text-sm text-brand-800">
          Resumed your saved draft. Pick up where you left off.
        </div>
      )}

      {/* Step 1 — choose line */}
      {step === 1 && (
        <div className="grid gap-3 sm:grid-cols-2">
          {QUOTE_LINES.map((l) => {
            const Icon = LINE_ICONS[l.icon as keyof typeof LINE_ICONS];
            return (
              <button
                key={l.id}
                onClick={() => { setLine(l.id); setData({}); setPrefillNote(null); setStep(2); }}
                className="card flex items-center gap-4 p-5 text-left transition hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-lg"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
                  <Icon className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <div className="font-bold text-brand-900">{l.label}</div>
                  <div className="text-sm text-slate-500">{l.blurb}</div>
                </div>
                <IconChevronRight className="h-5 w-5 text-slate-300" />
              </button>
            );
          })}
        </div>
      )}

      {/* Step 2 — autofill */}
      {step === 2 && line && (
        <div className="card p-6">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-600 text-white"><IconSparkles className="h-5 w-5" /></div>
            <div>
              <h3 className="text-lg font-bold text-brand-900">Autofill from a document?</h3>
              <p className="text-sm text-slate-500">Upload your current policy and we&apos;ll prefill this quote. Or skip and type it in.</p>
            </div>
          </div>

          {scanning ? (
            <div className="mt-6 flex items-center gap-3 rounded-xl bg-brand-50 px-4 py-3 text-sm text-brand-800">
              <IconSparkles className="h-4 w-4 animate-pulse" /> Reading your document…
            </div>
          ) : (
            <>
              <div className="mt-5 grid gap-2 sm:grid-cols-2">
                <label className="btn-secondary cursor-pointer justify-start">
                  <IconUpload className="h-4 w-4 text-brand-500" /> Upload a file
                  <input
                    type="file" accept="application/pdf,image/*" capture="environment" className="hidden"
                    onChange={async (e) => { const f = e.target.files?.[0]; if (f) autofill({ base64: await fileToBase64(f), mime: f.type || "application/pdf", fileName: f.name }); }}
                  />
                </label>
                {AUTOFILL_SAMPLES[line].map((s) => (
                  <button key={s.id} className="btn-secondary justify-start" onClick={() => autofill({ sampleId: s.id })}>
                    <IconSparkles className="h-4 w-4 text-brand-500" /> {s.label}
                  </button>
                ))}
              </div>
              {error && <p className="mt-3 text-sm text-rose-600">{error}</p>}
            </>
          )}

          <div className="mt-6 flex justify-between">
            <button className="btn-ghost" onClick={() => setStep(1)}>Back</button>
            <button className="btn-primary" onClick={() => setStep(3)}>Skip, I&apos;ll type it <IconChevronRight className="h-4 w-4" /></button>
          </div>
        </div>
      )}

      {/* Step 3 — details */}
      {step === 3 && line && (
        <div className="card p-6">
          {prefillNote && (
            <div className="mb-4 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm text-emerald-800">
              <IconCheck className="h-4 w-4" /> {prefillNote}
            </div>
          )}
          <div className="grid gap-4 sm:grid-cols-2">
            {schema.map((def) => (
              <FieldControl
                key={def.key}
                def={def}
                value={data[def.key]}
                onChange={(v) => setData((d) => ({ ...d, [def.key]: v }))}
              />
            ))}
          </div>
          {error && <p className="mt-4 text-sm text-rose-600">{error}</p>}
          <div className="mt-6 flex justify-between">
            <button className="btn-ghost" onClick={() => setStep(2)}>Back</button>
            <button className="btn-primary" onClick={() => { saveDraft(); setStep(4); }}>Review <IconChevronRight className="h-4 w-4" /></button>
          </div>
        </div>
      )}

      {/* Step 4 — review */}
      {step === 4 && line && (
        <div className="card p-6">
          <h3 className="text-lg font-bold text-brand-900">Review &amp; submit</h3>
          <p className="text-sm text-slate-500">{QUOTE_LINES.find((l) => l.id === line)?.label} quote</p>

          <dl className="mt-5 space-y-1">
            {schema.map((def) => (
              <ReviewRow key={def.key} def={def} value={data[def.key]} />
            ))}
          </dl>

          <div className="mt-5">
            <label className="label" htmlFor="notes">Anything else we should know? (optional)</label>
            <textarea id="notes" className="textarea" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Coverage goals, budget, questions…" />
          </div>

          {error && <p className="mt-4 text-sm text-rose-600">{error}</p>}

          <div className="mt-6 flex justify-between">
            <button className="btn-ghost" onClick={() => setStep(3)}>Back</button>
            <button className="btn-primary" onClick={submit} disabled={busy}>
              {busy ? "Submitting…" : "Submit quote request"} <IconCheck className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Generic field controls ────────────────────────────────────────────────────

function FieldControl({ def, value, onChange }: { def: FieldDef; value: unknown; onChange: (v: unknown) => void }) {
  const type = def.type ?? "text";

  if (type === "array") {
    const items = (Array.isArray(value) ? value : []) as Record<string, string>[];
    const blank = Object.fromEntries((def.itemFields ?? []).map((f) => [f.key, ""]));
    return (
      <div className="sm:col-span-2">
        <div className="mb-2 flex items-center justify-between">
          <span className="label mb-0">{def.label}</span>
          <button className="btn-ghost btn-sm" onClick={() => onChange([...items, { ...blank }])}><IconPlus className="h-3.5 w-3.5" /> Add</button>
        </div>
        <div className="space-y-2.5">
          {items.map((item, i) => (
            <div key={i} className="rounded-xl border border-slate-200 bg-slate-50/60 p-3">
              <div className="grid gap-2.5 sm:grid-cols-3">
                {(def.itemFields ?? []).map((f) => (
                  <div key={f.key}>
                    <label className="label">{f.label}</label>
                    <input
                      type={f.type === "date" ? "date" : "text"}
                      className="input py-2 text-sm"
                      value={item[f.key] ?? ""}
                      onChange={(e) => {
                        const next = items.map((it, j) => (j === i ? { ...it, [f.key]: e.target.value } : it));
                        onChange(next);
                      }}
                    />
                  </div>
                ))}
              </div>
              <div className="mt-2 text-right">
                <button className="text-xs font-medium text-rose-600" onClick={() => onChange(items.filter((_, j) => j !== i))}>Remove</button>
              </div>
            </div>
          ))}
          {!items.length && <p className="text-sm text-slate-400">None added yet.</p>}
        </div>
      </div>
    );
  }

  if (type === "multiselect") {
    const selected = (Array.isArray(value) ? value : []) as string[];
    return (
      <div className="sm:col-span-2">
        <span className="label">{def.label}</span>
        <div className="flex flex-wrap gap-2">
          {(def.options ?? []).map((opt) => {
            const on = selected.includes(opt);
            return (
              <button
                key={opt}
                onClick={() => onChange(on ? selected.filter((s) => s !== opt) : [...selected, opt])}
                className={cn("chip border transition", on ? "border-brand-300 bg-brand-50 text-brand-700" : "border-slate-200 bg-white text-slate-600")}
              >
                {on && <IconCheck className="h-3 w-3" />} {opt}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  const str = typeof value === "string" ? value : "";
  return (
    <div className={cn(def.full && "sm:col-span-2")}>
      <label className="label">{def.label}</label>
      {type === "select" ? (
        <select className="select" value={str} onChange={(e) => onChange(e.target.value)}>
          <option value="">Select…</option>
          {(def.options ?? []).map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
      ) : type === "textarea" ? (
        <textarea className="textarea" value={str} onChange={(e) => onChange(e.target.value)} placeholder={def.placeholder} />
      ) : (
        <input type={type === "date" ? "date" : "text"} className="input" value={str} onChange={(e) => onChange(e.target.value)} placeholder={def.placeholder} />
      )}
    </div>
  );
}

function ReviewRow({ def, value }: { def: FieldDef; value: unknown }) {
  let display: React.ReactNode;
  if (Array.isArray(value)) {
    if (!value.length) display = <span className="text-slate-300">—</span>;
    else if (typeof value[0] === "string") display = (value as string[]).join(", ");
    else {
      display = (
        <ul className="space-y-0.5">
          {(value as Record<string, string>[]).map((it, i) => (
            <li key={i}>{Object.values(it).filter(Boolean).join(" · ") || "—"}</li>
          ))}
        </ul>
      );
    }
  } else {
    display = (typeof value === "string" && value) ? value : <span className="text-slate-300">—</span>;
  }
  return (
    <div className="flex items-start justify-between gap-6 border-b border-slate-100 py-2 last:border-0">
      <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">{def.label}</dt>
      <dd className="max-w-[60%] text-right text-sm font-medium text-brand-950">{display}</dd>
    </div>
  );
}
