"use client";

import { useState } from "react";
import { IconDoc, IconDownload, IconSparkles } from "@/components/ui/icons";

interface PlanLine {
  line: string;
  lineLabel: string;
  carrier: string;
  state: string;
  forms: { form_id: string; title: string; isSupplement: boolean }[];
}

export function GenerateForms({ leadId }: { leadId: string }) {
  const [plan, setPlan] = useState<PlanLine[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function generate() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/forms?leadId=${encodeURIComponent(leadId)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not build forms");
      setPlan(data.plan);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  const totalForms = plan?.reduce((n, l) => n + l.forms.length, 0) ?? 0;

  return (
    <div className="card p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-slate-500">
            <IconDoc className="h-4 w-4" /> ACORD forms
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Fill the right form set from this lead&apos;s canonical data — picked by line, carrier &amp; state.
          </p>
        </div>
        <button className="btn-primary" onClick={generate} disabled={loading}>
          <IconSparkles className="h-4 w-4" /> {loading ? "Building…" : plan ? "Rebuild" : "Generate forms"}
        </button>
      </div>

      {error && <p className="mt-3 text-sm text-rose-600">{error}</p>}

      {plan && (
        <div className="mt-4 space-y-4">
          {plan.length === 0 && <p className="text-sm text-slate-500">No mappable forms for this lead&apos;s documents yet.</p>}
          {plan.map((l) => (
            <div key={l.line}>
              <div className="mb-2 flex items-center gap-2 text-sm">
                <span className="font-semibold text-brand-900">{l.lineLabel}</span>
                {l.carrier && <span className="text-slate-400">· {l.carrier}</span>}
                <span className="chip bg-slate-100 text-slate-500">{l.state}</span>
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                {l.forms.map((f) => (
                  <a
                    key={f.form_id}
                    href={`/api/forms/fill?leadId=${encodeURIComponent(leadId)}&line=${l.line}&form=${encodeURIComponent(f.form_id)}`}
                    className="flex items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white p-3 transition hover:border-brand-300 hover:bg-brand-50"
                  >
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-semibold text-brand-900">{f.title}</span>
                      <span className="text-xs text-slate-400">{f.form_id}{f.isSupplement ? " · carrier supplement" : ""}</span>
                    </span>
                    <span className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-brand-600"><IconDownload className="h-4 w-4" /> PDF</span>
                  </a>
                ))}
              </div>
            </div>
          ))}
          {totalForms > 0 && (
            <p className="text-xs text-slate-400">
              Filled on the real ACORD layout. Drop the official fillable PDF into <code>forms/</code> to fill that instead — see forms/README.md.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
