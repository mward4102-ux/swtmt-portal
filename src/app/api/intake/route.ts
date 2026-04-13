import { NextRequest, NextResponse } from 'next/server';
import { createServerClient, createServiceClient } from '@/lib/supabase';
import { IntakeSchema, parseOrRespond } from '@/lib/validation';
import { generateCapabilityStatement } from '@/lib/docgen/capability-statement';

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const parsed = parseOrRespond(IntakeSchema, await req.json());
  if ('error' in parsed) return parsed.error;
  const body = parsed.data;
  const svc = createServiceClient();

  const naicsArr = typeof body.naics_codes === 'string'
    ? body.naics_codes.split(',').map((s: string) => s.trim()).filter(Boolean)
    : [];

  const { data: company, error: cErr } = await svc
    .from('companies')
    .insert({
      name: body.company_name,
      ein: body.ein,
      uei: body.uei,
      cage_code: body.cage_code,
      naics: naicsArr,
      sdvosb_certified: !!body.sdvosb_certified,
      owner_user_id: user.id
    })
    .select()
    .single();
  if (cErr) return NextResponse.json({ error: cErr.message }, { status: 500 });

  await svc.from('intakes').insert({
    company_id: company.id,
    submitted_by: user.id,
    raw_json: body,
    status: 'processed'
  });

  const { data: bid } = await svc
    .from('bids')
    .insert({
      company_id: company.id,
      title: `${body.company_name} — Capability Statement`,
      stage: 'drafting',
      agency: body.target_agencies || null
    })
    .select()
    .single();

  // Generate capability statement INLINE so it actually runs on Netlify
  // (fire-and-forget fetch between functions doesn't work reliably)
  let docResult: { ok: boolean; filename?: string; error?: string } = { ok: false };
  try {
    const r = await generateCapabilityStatement(body);
    const path = `${company.id}/${Date.now()}-${r.filename}`;
    const up = await svc.storage.from('documents').upload(path, r.buffer, {
      contentType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      upsert: false
    });
    if (up.error) throw up.error;

    await svc.from('documents').insert({
      bid_id: bid?.id,
      company_id: company.id,
      kind: 'capability_statement',
      filename: r.filename,
      storage_path: path,
      generator: 'template',
      generated_by: user.id
    });

    if (bid?.id) {
      await svc.from('bid_events').insert({
        bid_id: bid.id,
        actor_id: user.id,
        event_type: 'document_generated',
        payload: { kind: 'capability_statement', filename: r.filename }
      });
    }
    docResult = { ok: true, filename: r.filename };
  } catch (e: any) {
    docResult = { ok: false, error: e.message };
    if (bid?.id) {
      await svc.from('bid_events').insert({
        bid_id: bid.id,
        actor_id: user.id,
        event_type: 'document_generation_failed',
        payload: { error: e.message }
      });
    }
  }

  return NextResponse.json({
    ok: true,
    company_id: company.id,
    bid_id: bid?.id,
    document: docResult
  });
}
