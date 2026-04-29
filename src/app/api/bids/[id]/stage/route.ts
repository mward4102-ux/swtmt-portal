import { NextRequest, NextResponse } from 'next/server';
import { createServerClient, createServiceClient } from '@/lib/supabase';
import { z } from 'zod';

const STAGES = [
  'opportunity', 'intake', 'drafting', 'review', 'submitted',
  'awarded', 'lost', 'fulfillment', 'closeout',
] as const;

const StageSchema = z.object({ stage: z.enum(STAGES) });

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const bidId = params.id;

  let body: unknown;
  try { body = await req.json(); } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }); }

  const parsed = StageSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
  }
  const { stage } = parsed.data;

  const { data: bid } = await supabase.from('bids').select('id, stage').eq('id', bidId).single();
  if (!bid) return NextResponse.json({ error: 'Bid not found' }, { status: 404 });

  const svc = createServiceClient();
  const { error: updErr } = await svc.from('bids').update({ stage }).eq('id', bidId);
  if (updErr) return NextResponse.json({ error: updErr.message }, { status: 500 });

  await svc.from('bid_events').insert({
    bid_id: bidId,
    actor_id: user.id,
    event_type: 'stage_changed',
    payload: { from: bid.stage, to: stage },
  });

  return NextResponse.json({ ok: true, stage });
}
