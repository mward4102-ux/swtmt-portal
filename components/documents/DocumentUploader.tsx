"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { type CanonicalRecord, DOC_TYPE_LABELS, recordSubject } from "@/lib/canonical";
import { RecordReview, countLowConfidence } from "@/components/documents/RecordReview";
import { ConfidenceBadge } from "@/components/ui/chips";
import { IconCheck, IconFile, IconSparkles, IconUpload } from "@/components/ui/icons";

const SAMPLE_CHOICES = [
  { id: "01", label: "Pacific Crest — Auto" },
  { id: "02", label: "Sierra Vista — Home" },
  { id: "03", label: "CA Driver License" },
  { id: "04", label: "CA Registration" },
  { id: "05", label: "ACORD 25 Cert" },
  { id: "06", label: "Granite Peak — GL" },
  { id: "07", label: "Medicare Plan G" },
  { id: "08", label: "Prior Auto (compare)" },
];

interface ExtractResult {
  record: CanonicalRecord;
  mode: "sample" | "ai" | "demo";
  message: string | null;
  sample: { id: string; title: string } | null;
  fileName: string;
  mime: string;
  sizeBytes: number;
  sampleId: string | null;
}

type Phase = "idle" | "scanning" | "review" | "saving";

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(",")[1] ?? "");
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function DocumentUploader() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [phase, setPhase] = useState<Phase>("idle");
  const [result, setResult] = useState<ExtractResult | null>(null);
  const [edited, setEdited] = useState<CanonicalRecord | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);

  async function runExtract(payload: Record<string, unknown>) {
    setPhase("scanning");
    setError(null);
    setSaved(null);
    try {
      const res = await fetch("/api/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Extraction failed");
      setResult(data);
      setEdited(data.record);
      setPhase("review");
    } catch (e) {
      setError((e as Error).message);
      setPhase("idle");
    }
  }

  async function onPickFile(file: File) {
    const base64 = await fileToBase64(file);
    await runExtract({ base64, mime: file.type || "application/pdf", fileName: file.name });
  }

  async function save() {
    if (!result || !edited) return;
    setPhase("saving");
    try {
      const res = await fetch("/api/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          record: edited,
          fileName: result.fileName,
          mime: result.mime,
          sizeBytes: result.sizeBytes,
          sampleId: result.sampleId ?? undefined,
          source: result.sampleId ? "sample" : "upload",
          reviewed: true,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Save failed");
      setSaved(`Saved “${recordSubject(edited)}” to your profile.`);
      reset();
      router.refresh();
    } catch (e) {
      setError((e as Error).message);
      setPhase("review");
    }
  }

  function reset() {
    setResult(null);
    setEdited(null);
    setPhase("idle");
    if (fileRef.current) fileRef.current.value = "";
  }

  if (phase === "scanning") {
    return (
      <div className="card flex flex-col items-center justify-center gap-4 p-12 text-center">
        <div className="relative h-14 w-14">
          <div className="absolute inset-0 animate-ping rounded-full bg-brand-200" />
          <div className="relative flex h-14 w-14 items-center justify-center rounded-full bg-brand-600 text-white">
            <IconSparkles className="h-6 w-6" />
          </div>
        </div>
        <div>
          <p className="font-semibold text-brand-900">Reading your document…</p>
          <p className="text-sm text-slate-500">Classifying and extracting every field with a confidence score.</p>
        </div>
      </div>
    );
  }

  if ((phase === "review" || phase === "saving") && result && edited) {
    const low = countLowConfidence(edited);
    const modeBanner =
      result.mode === "sample"
        ? { cls: "bg-emerald-50 text-emerald-800 border-emerald-200", text: `Recognized sample — exact extraction${result.sample ? ` (${result.sample.title})` : ""}.` }
        : result.mode === "ai"
          ? { cls: "bg-brand-50 text-brand-800 border-brand-200", text: "Extracted with Claude vision." }
          : { cls: "bg-amber-50 text-amber-900 border-amber-200", text: result.message ?? "Demo extraction." };

    return (
      <div className="card p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-bold text-brand-900">{DOC_TYPE_LABELS[edited.doc_type]}</h3>
            <p className="text-sm text-slate-500">{recordSubject(edited)}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Overall</span>
            <ConfidenceBadge confidence={edited.overall_confidence} />
          </div>
        </div>

        <div className={`mt-4 rounded-xl border px-3.5 py-2.5 text-sm ${modeBanner.cls}`}>{modeBanner.text}</div>

        {low > 0 && (
          <p className="mt-3 text-sm text-amber-700">
            {low} field{low > 1 ? "s" : ""} flagged as low-confidence (highlighted below). Confirm or correct, then save.
          </p>
        )}

        <div className="mt-5">
          <RecordReview record={edited} editable onChange={setEdited} />
        </div>

        {error && <p className="mt-4 text-sm text-rose-600">{error}</p>}

        <div className="mt-6 flex flex-wrap gap-2.5">
          <button className="btn-primary" onClick={save} disabled={phase === "saving"}>
            <IconCheck className="h-4 w-4" /> {phase === "saving" ? "Saving…" : "Confirm & save to profile"}
          </button>
          <button className="btn-secondary" onClick={reset} disabled={phase === "saving"}>Discard</button>
        </div>
      </div>
    );
  }

  // idle
  return (
    <div className="space-y-4">
      {saved && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">
          <IconCheck className="h-4 w-4" /> {saved}
        </div>
      )}

      <button
        type="button"
        onClick={() => fileRef.current?.click()}
        className="card flex w-full flex-col items-center justify-center gap-3 border-2 border-dashed border-slate-300 p-10 text-center transition hover:border-brand-400 hover:bg-brand-50/40"
      >
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-600 text-white">
          <IconUpload className="h-6 w-6" />
        </div>
        <div>
          <p className="font-semibold text-brand-900">Upload or photograph a document</p>
          <p className="text-sm text-slate-500">PDF, JPG or PNG · dec pages, ID, registration, certificates</p>
        </div>
      </button>
      <input
        ref={fileRef}
        type="file"
        accept="application/pdf,image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onPickFile(f);
        }}
      />

      {error && <p className="text-sm text-rose-600">{error}</p>}

      <div className="card p-5">
        <div className="mb-3 flex items-center gap-2">
          <IconFile className="h-4 w-4 text-brand-500" />
          <h3 className="text-sm font-bold text-brand-900">No document handy? Try a sample</h3>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {SAMPLE_CHOICES.map((s) => (
            <button
              key={s.id}
              onClick={() => runExtract({ sampleId: s.id })}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-left text-xs font-medium text-brand-800 transition hover:border-brand-300 hover:bg-brand-50"
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
