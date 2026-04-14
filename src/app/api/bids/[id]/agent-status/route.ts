import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

// GET /api/bids/[id]/agent-status?agent=research_agent
// Returns the most recent bid_agent_runs row for the given bid + agent.
// Used by the UI to poll for background function completion.

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const bidId = params.id;
  const agentName = req.nextUrl.searchParams.get('agent');

  let query = supabase
    .from('bid_agent_runs')
    .select('id, agent_name, status, error, output_summary, cost_usd, duration_ms, created_at')
    .eq('bid_id', bidId)
    .order('created_at', { ascending: false })
    .limit(1);

  if (agentName) {
    query = query.eq('agent_name', agentName);
  }

  const { data, error } = await query.single();

  if (error) {
    // No rows found is not an error — agent hasn't run yet
    if (error.code === 'PGRST116') {
      return NextResponse.json({ status: 'not_started' });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    id: data.id,
    agent_name: data.agent_name,
    status: data.status,
    error: data.error,
    output_summary: data.output_summary,
    cost_usd: data.cost_usd,
    duration_ms: data.duration_ms,
    created_at: data.created_at
  });
}
