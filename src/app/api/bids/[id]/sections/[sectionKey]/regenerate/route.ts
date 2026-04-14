import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { regenerateSection } from '@/lib/agents/orchestrator';

export const maxDuration = 60;

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string; sectionKey: string } }
) {
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const bidId = params.id;
  const sectionKey = params.sectionKey;

  const { data: bid } = await supabase.from('bids').select('id').eq('id', bidId).single();
  if (!bid) return NextResponse.json({ error: 'Bid not found' }, { status: 404 });

  let customInstructions: string | undefined;
  let skipCritique = false;
  try {
    const body = await req.json();
    customInstructions = body.custom_instructions;
    skipCritique = !!body.skip_critique;
  } catch { /* empty body OK */ }

  try {
    const result = await regenerateSection(bidId, sectionKey, customInstructions, skipCritique);
    return NextResponse.json({ ok: true, ...result });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
