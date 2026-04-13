import { NextRequest, NextResponse } from 'next/server';
import { createServerClient, createServiceClient } from '@/lib/supabase';
import { callHaiku } from '@/lib/llm';
import { filesToContentBlocks, EXTRACTION_SYSTEM_PROMPT, type UploadedFile } from '@/lib/extract';

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const formData = await req.formData();
  const files: UploadedFile[] = [];

  for (const [_, value] of formData.entries()) {
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

  // Upload raw files to storage for audit trail (fire and forget; don't block on errors)
  const svc = createServiceClient();
  const audit: string[] = [];
  for (const f of files) {
    const path = `intake-uploads/${user.id}/${Date.now()}-${f.name}`;
    svc.storage.from('uploads').upload(path, f.buffer, {
      contentType: f.mime,
      upsert: false
    }).then(() => audit.push(path)).catch(() => {});
  }

  // Build content blocks and call Haiku
  try {
    const blocks = await filesToContentBlocks(files);
    blocks.push({
      type: 'text',
      text: 'Extract the SDVOSB intake fields from the documents above. Return only the JSON object.'
    });

    const out = await callHaiku(EXTRACTION_SYSTEM_PROMPT, blocks as any, 2000);

    // Strip any accidental code fences
    let json = out.text.trim();
    json = json.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/, '');

    let extracted: Record<string, any> = {};
    try {
      extracted = JSON.parse(json);
    } catch {
      return NextResponse.json({
        error: 'Could not parse extracted data. Try fewer or clearer documents.',
        raw: out.text.slice(0, 500)
      }, { status: 500 });
    }

    // Sanitize: strip nulls, trim strings, cap field length to prevent injection
    const MAX_FIELD_LEN = 2000;
    const cleaned: Record<string, any> = {};
    for (const [k, v] of Object.entries(extracted)) {
      if (v === null || v === undefined || v === '') continue;
      if (typeof v === 'string') {
        const trimmed = v.trim().slice(0, MAX_FIELD_LEN);
        if (trimmed) cleaned[k] = trimmed;
      } else {
        cleaned[k] = v;
      }
    }

    return NextResponse.json({
      ok: true,
      fields: cleaned,
      source_files: files.map(f => f.name),
      cost_usd: out.cost_usd
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
