import { NextRequest, NextResponse } from 'next/server';
import { createServerClient, createServiceClient } from '@/lib/supabase';
import { extractSolicitation } from '@/lib/agents/solicitation-extractor';
import type { UploadedFile } from '@/lib/extract';

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

  // Verify bid exists and user has access
  const { data: bid } = await supabase.from('bids').select('id').eq('id', bidId).single();
  if (!bid) return NextResponse.json({ error: 'Bid not found' }, { status: 404 });

  // Parse multipart form data
  const formData = await req.formData();
  const files: UploadedFile[] = [];

  for (const [, value] of formData.entries()) {
    if (value instanceof File) {
      if (value.size > 8 * 1024 * 1024) {
        return NextResponse.json({ error: `${value.name} exceeds 8MB limit` }, { status: 400 });
      }
      const arrayBuffer = await value.arrayBuffer();
      files.push({
        name: value.name,
        mime: value.type || 'application/octet-stream',
        buffer: Buffer.from(arrayBuffer)
      });
    }
  }

  if (files.length === 0) {
    return NextResponse.json({ error: 'No files uploaded' }, { status: 400 });
  }
  if (files.length > 5) {
    return NextResponse.json({ error: 'Upload at most 5 files at a time' }, { status: 400 });
  }

  // Upload raw files to storage for audit trail
  const storagePaths: string[] = [];
  for (const f of files) {
    const path = `uploads/solicitations/${bidId}/${Date.now()}-${f.name}`;
    const { error: upErr } = await svc.storage.from('uploads').upload(path, f.buffer, {
      contentType: f.mime,
      upsert: false
    });
    if (!upErr) storagePaths.push(path);
  }

  try {
    // Extract structured data
    const { extraction, cost_usd } = await extractSolicitation(bidId, files);

    // Insert or update solicitation record (one per bid)
    await svc.from('solicitations').upsert({
      bid_id: bidId,
      source_filename: files.map(f => f.name).join(', '),
      source_storage_path: storagePaths.join(', '),
      agency: extraction.agency,
      sub_agency: extraction.sub_agency,
      solicitation_number: extraction.solicitation_number,
      contract_type: extraction.contract_type,
      naics: extraction.naics,
      psc_code: extraction.psc_code,
      set_aside: extraction.set_aside,
      due_date: extraction.due_date,
      place_of_performance: extraction.place_of_performance,
      estimated_value: extraction.estimated_value,
      period_of_performance: extraction.period_of_performance,
      extracted_requirements: extraction.extracted_requirements,
      evaluation_criteria: extraction.evaluation_criteria,
      win_themes: extraction.win_themes
    }, { onConflict: 'bid_id' });

    // Update bid metadata from extraction if available
    const bidUpdate: Record<string, any> = {};
    if (extraction.agency) bidUpdate.agency = extraction.agency;
    if (extraction.solicitation_number) bidUpdate.solicitation_number = extraction.solicitation_number;
    if (extraction.naics) bidUpdate.naics = extraction.naics;
    if (extraction.due_date) bidUpdate.due_date = extraction.due_date;
    if (Object.keys(bidUpdate).length > 0) {
      await svc.from('bids').update(bidUpdate).eq('id', bidId);
    }

    // Log event
    await svc.from('bid_events').insert({
      bid_id: bidId,
      actor_id: user.id,
      event_type: 'solicitation_uploaded',
      payload: {
        files: files.map(f => f.name),
        solicitation_number: extraction.solicitation_number,
        requirements_count: extraction.extracted_requirements.length,
        criteria_count: extraction.evaluation_criteria.length,
        cost_usd
      }
    });

    return NextResponse.json({
      ok: true,
      extraction,
      cost_usd,
      files_uploaded: files.map(f => f.name)
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
