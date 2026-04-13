import { NextRequest, NextResponse } from 'next/server';
import { createServerClient, createServiceClient } from '@/lib/supabase';
import { classifyQuery, callHaiku } from '@/lib/llm';

export async function POST(req: NextRequest) {
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const { messages } = await req.json();
  const lastUser = [...messages].reverse().find((m: any) => m.role === 'user')?.content || '';
  const kind = classifyQuery(lastUser);

  try {
    if (kind === 'doc_lookup') {
      const svc = createServiceClient();
      const { data: profile } = await svc.from('users').select('company_id, role').eq('id', user.id).single();
      let q = svc.from('documents').select('id, filename, kind, created_at').order('created_at', { ascending: false }).limit(10);
      if (profile?.role !== 'admin') q = q.eq('company_id', profile?.company_id);
      const { data } = await q;
      const list = (data || []).map(d => `• ${d.filename} (${d.kind})`).join('\n') || 'No documents found.';
      return NextResponse.json({ reply: `Here's what I found:\n${list}` });
    }

    if (kind === 'doc_generate') {
      const r = await fetch(new URL('/api/documents/generate', req.url), {
        method: 'POST',
        headers: { 'content-type': 'application/json', cookie: req.headers.get('cookie') || '' },
        body: JSON.stringify({ prompt: lastUser, kind: 'capability_statement' })
      });
      const j = await r.json();
      return NextResponse.json({ reply: j.summary || 'Document generation started. Check the bid detail page.' });
    }

    if (kind === 'compliance_q') {
      const system = 'You are a federal contracting compliance advisor for SDVOSB firms. Be concise. Cite FAR/DFARS where relevant. Flag SDVOSB-specific considerations. Keep responses under 200 words unless the user asks for more depth.';
      const out = await callHaiku(system, lastUser);
      return NextResponse.json({ reply: out.text });
    }

    // general_chat
    const system = 'You are the SWTMT Portal assistant. You help SDVOSB operators, mentor companies, and SWTMT admins navigate federal contracting, manage their bid pipeline, and generate documents. Be concise, practical, and direct.';
    const out = await callHaiku(system, lastUser);
    return NextResponse.json({ reply: out.text });
  } catch (e: any) {
    return NextResponse.json({ reply: `Error: ${e.message}` }, { status: 500 });
  }
}
