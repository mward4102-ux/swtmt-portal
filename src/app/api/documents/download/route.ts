import { NextRequest, NextResponse } from 'next/server';
import { createServerClient, createServiceClient } from '@/lib/supabase';
import { DocDownloadSchema, parseOrRespond } from '@/lib/validation';

export async function GET(req: NextRequest) {
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const parsed = parseOrRespond(DocDownloadSchema, {
    path: req.nextUrl.searchParams.get('path') ?? ''
  });
  if ('error' in parsed) return parsed.error;
  const { path } = parsed.data;

  const svc = createServiceClient();
  const { data, error } = await svc.storage.from('documents').createSignedUrl(path, 60);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.redirect(data.signedUrl);
}
