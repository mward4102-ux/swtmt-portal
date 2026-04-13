import Link from 'next/link';
import { createServerClient } from '@/lib/supabase';

const STAGES = [
  'opportunity','intake','drafting','review','submitted','awarded','fulfillment','closeout'
];

export default async function BidsPage() {
  const supabase = createServerClient();
  const { data: bids } = await supabase
    .from('bids')
    .select('id, title, agency, due_date, stage, company_id')
    .order('due_date', { ascending: true });

  const grouped: Record<string, any[]> = {};
  for (const s of STAGES) grouped[s] = [];
  for (const b of bids || []) (grouped[b.stage] ||= []).push(b);

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-2xl font-bold text-ink">Bid Pipeline</h1>
          <p className="text-sm text-slate-600">Full lifecycle — drag between stages to advance. Tap a card to open.</p>
        </div>
        <Link href="/intake" className="bg-navy hover:bg-ink text-white text-sm px-4 py-2 rounded">
          + New Intake
        </Link>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-4">
        {STAGES.map(stage => (
          <div key={stage} className="min-w-[260px] bg-slate-100 rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-700">{stage}</h3>
              <span className="text-xs bg-white px-2 py-0.5 rounded text-slate-600">
                {grouped[stage].length}
              </span>
            </div>
            <div className="space-y-2">
              {grouped[stage].map(b => (
                <Link
                  key={b.id}
                  href={`/bids/${b.id}`}
                  className="block bg-white rounded p-3 shadow-sm border border-slate-200 hover:border-navy"
                >
                  <div className="font-medium text-sm text-ink line-clamp-2">{b.title}</div>
                  <div className="text-xs text-slate-500 mt-1">{b.agency || '—'}</div>
                  {b.due_date && (
                    <div className="text-xs text-red-600 mt-1">
                      Due {new Date(b.due_date).toLocaleDateString()}
                    </div>
                  )}
                </Link>
              ))}
              {grouped[stage].length === 0 && (
                <div className="text-xs text-slate-400 italic text-center py-4">Empty</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
