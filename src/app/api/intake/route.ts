import { NextRequest, NextResponse } from 'next/server';
import { createServerClient, createServiceClient } from '@/lib/supabase';
import { IntakeSchema, parseOrRespond } from '@/lib/validation';

export async function POST(req: NextRequest) {
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const parsed = parseOrRespond(IntakeSchema, await req.json());
  if ('error' in parsed) return parsed.error;
  const body = parsed.data;
  const svc = createServiceClient();

  // 1. Upsert the company
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

  // 2. Store the raw intake
  await svc.from('intakes').insert({
    company_id: company.id,
    submitted_by: user.id,
    raw_json: body,
    status: 'processed'
  });

  // 3. Create a placeholder bid record so the pipeline has something to track
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

  // 4. Kick off document generation (fire and forget)
  fetch(new URL('/api/documents/generate', req.url), {
    method: 'POST',
    headers: { 'content-type': 'application/json', cookie: req.headers.get('cookie') || '' },
    body: JSON.stringify({
      kind: 'capability_statement',
      bid_id: bid?.id,
      company_id: company.id,
      intake: body
    })
  }).catch(() => {});

  return NextResponse.json({ ok: true, company_id: company.id, bid_id: bid?.id });
}
