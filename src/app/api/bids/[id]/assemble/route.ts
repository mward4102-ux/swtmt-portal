import { NextRequest, NextResponse } from 'next/server';
import { createServerClient, createServiceClient } from '@/lib/supabase';
import { generateFullBidDocx } from '@/lib/docgen/full-bid';

export const maxDuration = 60;

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const bidId = params.id;
  const svc = createServiceClient();

  const { data: bid } = await supabase.from('bids').select('id, company_id').eq('id', bidId).single();
  if (!bid) return NextResponse.json({ error: 'Bid not found' }, { status: 404 });

  try {
    const { buffer, filename } = await generateFullBidDocx(bidId);

    // Upload to Supabase Storage
    const storagePath = `${bid.company_id || 'shared'}/${Date.now()}-${filename}`;
    const { error: upErr } = await svc.storage.from('documents').upload(storagePath, buffer, {
      contentType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      upsert: false
    });
    if (upErr) throw upErr;

    // Insert document record
    await svc.from('documents').insert({
      bid_id: bidId,
      company_id: bid.company_id,
      kind: 'full_bid',
      filename,
      storage_path: storagePath,
      generator: 'haiku',
      generated_by: user.id
    });

    // Log event
    await svc.from('bid_events').insert({
      bid_id: bidId,
      actor_id: user.id,
      event_type: 'full_bid_assembled',
      payload: { filename, storage_path: storagePath }
    });

    return NextResponse.json({ ok: true, filename, storage_path: storagePath });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
