"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { type CanonicalRecord, DOC_TYPE_LABELS, recordSubject } from "@/lib/canonical";
import { RecordReview, countLowConfidence } from "@/components/documents/RecordReview";
import { ConfidenceBadge, ReviewBadge } from "@/components/ui/chips";
import { IconCheck, IconDownload, IconEdit } from "@/components/ui/icons";
import { formatDate } from "@/lib/utils";
import type { StoredDocument } from "@/lib/types";

export function DocumentReview({ doc }: { doc: StoredDocument }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [record, setRecord] = useState<CanonicalRecord>(doc.record);
  const [busy, setBusy] = useState(false);
  const low = countLowConfidence(record);

  async function patch(body: Record<string, unknown>) {
    setBusy(true);
    await fetch(`/api/documents/${doc.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setBusy(false);
    setEditing(false);
    router.refresh();
  }

  return (
    <div className="card p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-bold text-brand-900">{DOC_TYPE_LABELS[doc.docType]}</h3>
            {!doc.reviewed && <ReviewBadge />}
          </div>
          <p className="mt-0.5 text-sm text-slate-500">{recordSubject(record)} · uploaded {formatDate(doc.uploadedAt)}</p>
        </div>
        <div className="flex items-center gap-2">
          <ConfidenceBadge confidence={record.overall_confidence} />
          {doc.binaryRetained && (
            <Link href={`/api/documents/${doc.id}/file`} target="_blank" className="btn-secondary btn-sm"><IconDownload className="h-3.5 w-3.5" /> View</Link>
          )}
        </div>
      </div>

      {low > 0 && !editing && (
        <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
          {low} low-confidence field{low > 1 ? "s" : ""} highlighted below — review before relying on it.
        </p>
      )}

      <div className="mt-4">
        <RecordReview record={record} editable={editing} onChange={setRecord} />
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {editing ? (
          <>
            <button className="btn-primary" disabled={busy} onClick={() => patch({ record, reviewed: true })}>
              <IconCheck className="h-4 w-4" /> {busy ? "Saving…" : "Save & mark reviewed"}
            </button>
            <button className="btn-secondary" disabled={busy} onClick={() => { setRecord(doc.record); setEditing(false); }}>Cancel</button>
          </>
        ) : (
          <>
            <button className="btn-secondary" onClick={() => setEditing(true)}><IconEdit className="h-4 w-4" /> Review &amp; edit</button>
            {!doc.reviewed && (
              <button className="btn-ghost" disabled={busy} onClick={() => patch({ reviewed: true })}><IconCheck className="h-4 w-4" /> Mark reviewed</button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
