import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { startFullBidDrafting } from '@/lib/agents/orchestrator';

export const maxDuration = 60;

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const bidId = params.id;
  const { data: bid } = await supabase.from('bids').select('id').eq('id', bidId).single();
  if (!bid) return NextResponse.json({ error: 'Bid not found' }, { status: 404 });

  let body: any = {};
  try { body = await req.json(); } catch { /* empty body OK */ }

  try {
    const result = await startFullBidDrafting(bidId, {
      skip_research: body.skip_research,
      skip_pricing: body.skip_pricing,
      skip_critique: body.skip_critique,
      sections_to_draft: body.sections_to_draft
    });

    return NextResponse.json({ ok: true, ...result });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
