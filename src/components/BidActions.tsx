'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
const STAGES = [
  'opportunity','intake','drafting','review','submitted',
  'awarded','lost','fulfillment','closeout'
];
export function BidActions({ bidId, currentStage }: { bidId: string; currentStage: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [report, setReport] = useState<any>(null);
  const [err, setErr] = useState<string | null>(null);
  async function advance(toStage: string) {
    setBusy(true);
    setErr(null);
    try {
      const r = await fetch(`/api/bids/${bidId}/stage`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ stage: toStage })
      });
      if (!r.ok) throw new Error((await r.json()).error || 'Failed');
      router.refresh();
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  }
  async function runCompliance() {
    setBusy(true);
    setErr(null);
    setReport(null);
    try {
      const r = await fetch(`/api/bids/${bidId}/compliance`, { method: 'POST' });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || 'Failed');
      setReport(j.report);
      router.refresh();
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  }
  const currentIdx = STAGES.indexOf(currentStage);
  const nextStage = currentIdx >= 0 && currentIdx < STAGES.length - 1 ? STAGES[currentIdx + 1] : null;
  const badgeColor = (sev: string) =>
    sev === 'fail' ? 'bg-red-100 text-red-800'
    : sev === 'warn' ? 'bg-amber-100 text-amber-800'
    : 'bg-emerald-100 text-emerald-800';
  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-4 space-y-3">
      <h3 className="font-semibold text-ink">Actions</h3>
      <div className="flex flex-wrap gap-2">
        {nextStage && (
          <button
            onClick={() => advance(nextStage)}
            disabled={busy}
            className="bg-navy hover:bg-ink text-white text-sm px-3 py-2 rounded disabled:opacity-50"
          >
            Advance → {nextStage}
          </button>
        )}
        <select
          onChange={e => e.target.value && advance(e.target.value)}
          value=""
          disabled={busy}
          className="text-sm border border-slate-300 rounded px-2 py-2"
        >
          <option value="">Jump to stage…</option>
          {STAGES.filter(s => s !== currentStage).map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <button
          onClick={runCompliance}
          disabled={busy}
          className="bg-gold hover:bg-amber-600 text-ink text-sm px-3 py-2 rounded font-medium disabled:opacity-50"
        >
          {busy ? 'Running…' : 'Run compliance check'}
        </button>
      </div>
      {err && <div className="text-sm text-red-600">{err}</div>}
      {report && (
        <div className="mt-3 border-t border-slate-200 pt-3 space-y-2">
          <div className="flex items-center gap-2">
            <span className={`text-xs px-2 py-1 rounded font-medium ${badgeColor(report.overall)}`}>
              {report.overall?.toUpperCase()}
            </span>
            <span className="text-sm text-ink">{report.summary}</span>
          </div>
          <div className="space-y-1">
            {(report.findings || []).map((f: any, i: number) => (
              <div key={i} className="text-xs border border-slate-200 rounded p-2">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`px-1.5 py-0.5 rounded ${badgeColor(f.severity)}`}>{f.severity}</span>
                  <span className="font-medium text-ink">{f.rule}</span>
                  <span className="text-slate-500">({f.category})</span>
                </div>
                <div className="text-slate-700">{f.finding}</div>
                {f.recommendation && <div className="text-navy mt-1">→ {f.recommendation}</div>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
