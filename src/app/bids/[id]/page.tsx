import { createServerClient, createServiceClient } from '@/lib/supabase';
import { notFound } from 'next/navigation';
import Link from 'next/link';

export default async function BidDetail({ params }: { params: { id: string } }) {
  const supabase = createServerClient();
  const { data: bid } = await supabase
    .from('bids')
    .select('*')
    .eq('id', params.id)
    .single();
  if (!bid) notFound();

  const svc = createServiceClient();
  const { data: docs } = await svc
    .from('documents')
    .select('id, filename, kind, created_at, storage_path')
    .eq('bid_id', params.id)
    .order('created_at', { ascending: false });

  const { data: events } = await svc
    .from('bid_events')
    .select('event_type, payload, created_at')
    .eq('bid_id', params.id)
    .order('created_at', { ascending: false })
    .limit(20);

  return (
    <div className="space-y-6">
      <div>
        <Link href="/bids" className="text-sm text-slate-500 hover:text-navy">← Pipeline</Link>
        <h1 className="text-2xl font-bold text-ink mt-2">{bid.title}</h1>
        <div className="text-sm text-slate-600">
          {bid.agency || 'Agency TBD'} · Stage: <span className="font-medium">{bid.stage}</span>
          {bid.due_date && <> · Due {new Date(bid.due_date).toLocaleDateString()}</>}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm">
          <div className="px-4 py-3 border-b border-slate-200 font-semibold text-ink">Documents</div>
          <ul className="divide-y divide-slate-100">
            {(docs || []).map(d => (
              <li key={d.id} className="px-4 py-3 flex items-center justify-between">
                <div>
                  <div className="font-medium text-sm text-ink">{d.filename}</div>
                  <div className="text-xs text-slate-500">{d.kind} · {new Date(d.created_at).toLocaleDateString()}</div>
                </div>
                <form action={`/api/documents/download?path=${encodeURIComponent(d.storage_path)}`} method="get">
                  <button className="text-sm text-navy hover:text-gold">Download</button>
                </form>
              </li>
            ))}
            {(!docs || docs.length === 0) && (
              <li className="px-4 py-6 text-center text-sm text-slate-500">No documents yet.</li>
            )}
          </ul>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 shadow-sm">
          <div className="px-4 py-3 border-b border-slate-200 font-semibold text-ink">Activity</div>
          <ul className="divide-y divide-slate-100">
            {(events || []).map((e, i) => (
              <li key={i} className="px-4 py-3 text-sm">
                <div className="font-medium text-ink">{e.event_type}</div>
                <div className="text-xs text-slate-500">{new Date(e.created_at).toLocaleString()}</div>
              </li>
            ))}
            {(!events || events.length === 0) && (
              <li className="px-4 py-6 text-center text-sm text-slate-500">No activity yet.</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
