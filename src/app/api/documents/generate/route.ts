import { NextRequest, NextResponse } from 'next/server';
import { createServerClient, createServiceClient } from '@/lib/supabase';
import { generateCapabilityStatement } from '@/lib/docgen/capability-statement';
import { generateSF1449 } from '@/lib/docgen/sf1449';

export async function POST(req: NextRequest) {
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const { kind, bid_id, company_id, intake, prompt } = await req.json();
  const svc = createServiceClient();

  let buffer: Buffer;
  let filename: string;

  try {
    if (kind === 'capability_statement') {
      const result = await generateCapabilityStatement(intake || { prompt });
      buffer = result.buffer;
      filename = result.filename;
    } else if (kind === 'sf1449') {
      const result = await generateSF1449(intake || {});
      buffer = result.buffer;
      filename = result.filename;
    } else {
      return NextResponse.json({ error: `Unsupported kind: ${kind}` }, { status: 400 });
    }

    // Upload to Supabase storage
    const path = `${company_id || 'shared'}/${Date.now()}-${filename}`;
    const up = await svc.storage.from('documents').upload(path, buffer, {
      contentType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      upsert: false
    });
    if (up.error) throw up.error;

    // Record in documents table
    await svc.from('documents').insert({
      bid_id: bid_id || null,
      company_id: company_id || null,
      kind,
      filename,
      storage_path: path,
      generator: 'template',
      generated_by: user.id
    });

    if (bid_id) {
      await svc.from('bid_events').insert({
        bid_id,
        actor_id: user.id,
        event_type: 'document_generated',
        payload: { kind, filename }
      });
    }

    return NextResponse.json({
      ok: true,
      filename,
      storage_path: path,
      summary: `Generated ${kind} → ${filename}. Available in your documents.`
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
