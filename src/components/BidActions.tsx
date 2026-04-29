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
  const currentIdx = STAGES.indexOf(currentStage);
  const nextStage = currentIdx >= 0 && currentIdx < STAGES.length - 1 ? STAGES[currentIdx + 1] : null;
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
      </div>
      {err && <div className="text-sm text-red-600">{err}</div>}
    </div>
  );
}
