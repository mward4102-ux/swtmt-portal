import { createServerClient, createServiceClient } from '@/lib/supabase';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { BidActions } from '@/components/BidActions';
import { BidDraftingPanel } from '@/components/BidDraftingPanel';

export default async function BidDetail({ params }: { params: { id: string } }) {
  const supabase = createServerClient();
  const { data: bid } = await supabase
    .from('bids')
    .select('*')
    .eq('id', params.id)
    .single();
  if (!bid) notFound();

  const svc = createServiceClient();

  // Load documents + events (existing)
  const [docsResult, eventsResult] = await Promise.all([
    svc
      .from('documents')
      .select('id, filename, kind, created_at, storage_path')
      .eq('bid_id', params.id)
      .order('created_at', { ascending: false }),
    svc
      .from('bid_events')
      .select('event_type, payload, created_at')
      .eq('bid_id', params.id)
      .order('created_at', { ascending: false })
      .limit(20)
  ]);
  const docs = docsResult.data;
  const events = eventsResult.data;

  // Load Phase A data (may not exist yet)
  const [solResult, rbResult, paResult, sectionsResult, agentRunsResult] = await Promise.all([
    svc.from('solicitations').select('*').eq('bid_id', params.id).single(),
    svc.from('research_briefs').select('*').eq('bid_id', params.id).single(),
    svc.from('pricing_analyses').select('*').eq('bid_id', params.id).single(),
    svc
      .from('bid_sections')
      .select('id, section_key, section_title, section_order, status, content, critique, word_count, model_used, cost_usd')
      .eq('bid_id', params.id)
      .order('section_order', { ascending: true }),
    svc
      .from('bid_agent_runs')
      .select('cost_usd')
      .eq('bid_id', params.id)
  ]);

  const solicitation = solResult.data;
  const researchBrief = rbResult.data;
  const pricingAnalysis = paResult.data;
  const sections = sectionsResult.data || [];
  const totalBidCost = (agentRunsResult.data || []).reduce(
    (sum: number, r: { cost_usd: number | null }) => sum + (r.cost_usd || 0),
    0
  );

  return (
    <div className="space-y-6">
      <div>
        <Link href="/bids" className="text-sm text-slate-500 hover:text-navy">&larr; Pipeline</Link>
        <h1 className="text-2xl font-bold text-ink mt-2">{bid.title}</h1>
        <div className="text-sm text-slate-600">
          {bid.agency || 'Agency TBD'} &middot; Stage: <span className="font-medium">{bid.stage}</span>
          {bid.due_date && <> &middot; Due {new Date(bid.due_date).toLocaleDateString()}</>}
        </div>
      </div>

      {/* ─── Bid Actions ─── */}
      <BidActions bidId={params.id} currentStage={bid.stage} />

      {/* ─── Bid Drafting Pipeline ─── */}
      <BidDraftingPanel
        bidId={params.id}
        companyId={bid.company_id || ''}
        solicitation={solicitation}
        researchBrief={researchBrief}
        pricingAnalysis={pricingAnalysis}
        sections={sections}
        totalBidCost={totalBidCost}
      />

      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm">
          <div className="px-4 py-3 border-b border-slate-200 font-semibold text-ink">Documents</div>
          <ul className="divide-y divide-slate-100">
            {(docs || []).map(d => (
              <li key={d.id} className="px-4 py-3 flex items-center justify-between">
                <div>
                  <div className="font-medium text-sm text-ink">{d.filename}</div>
                  <div className="text-xs text-slate-500">{d.kind} &middot; {new Date(d.created_at).toLocaleDateString()}</div>
                </div>
                {d.storage_path ? (
                  <a
                    href={`/api/documents/download?path=${encodeURIComponent(d.storage_path)}`}
                    className="text-sm text-navy hover:text-gold"
                  >
                    Download
                  </a>
                ) : (
                  <span className="text-xs text-slate-400" title="Document failed to upload">
                    unavailable
                  </span>
                )}
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
