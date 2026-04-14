import { NextRequest, NextResponse } from 'next/server';
import { createServerClient, createServiceClient } from '@/lib/supabase';

export const maxDuration = 10; // fast — just inserts a row and invokes background function

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const bidId = params.id;

  // Verify bid exists
  const { data: bid } = await supabase.from('bids').select('id').eq('id', bidId).single();
  if (!bid) return NextResponse.json({ error: 'Bid not found' }, { status: 404 });

  // Insert a 'running' sentinel into bid_agent_runs so the UI can poll
  const svc = createServiceClient();
  const { data: run, error: insertErr } = await svc
    .from('bid_agent_runs')
    .insert({
      bid_id: bidId,
      agent_name: 'research_agent',
      status: 'running',
      output_summary: 'Agent started — polling for completion',
      cost_usd: 0,
      duration_ms: 0
    })
    .select('id')
    .single();

  if (insertErr) {
    return NextResponse.json({ error: insertErr.message }, { status: 500 });
  }

  // Invoke the Netlify Background Function (returns 202 immediately on Netlify)
  const siteUrl = process.env.URL || process.env.DEPLOY_URL || `http://localhost:8888`;
  try {
    await fetch(`${siteUrl}/.netlify/functions/research-agent-background`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ bidId })
    });
  } catch (e: any) {
    // If the background invocation itself fails, update the sentinel row
    await svc.from('bid_agent_runs').update({ status: 'error', error: e.message }).eq('id', run.id);
    return NextResponse.json({ error: `Failed to start background agent: ${e.message}` }, { status: 500 });
  }

  return NextResponse.json({ ok: true, run_id: run.id, status: 'running' }, { status: 202 });
}
