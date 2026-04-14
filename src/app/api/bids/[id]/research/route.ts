import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { runResearchAgent } from '@/lib/agents/research-agent';

export const maxDuration = 60;

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

  try {
    const brief = await runResearchAgent(bidId);
    return NextResponse.json({ ok: true, brief });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
