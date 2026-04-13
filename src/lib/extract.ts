// Document extraction for intake prefill.
// Supported inputs:
//   • PDF → sent to Haiku as a document block (native)
//   • Images (JPEG/PNG/GIF/WebP) → sent as image blocks (native vision)
//   • DOCX → mammoth extracts plain text, sent as text
//   • TXT → passed through as text
//
// Returns an array of Anthropic ContentBlockParam ready to pass to callHaiku.

import mammoth from 'mammoth';
import type Anthropic from '@anthropic-ai/sdk';

type Block = Anthropic.Messages.ContentBlockParam;

export interface UploadedFile {
  name: string;
  mime: string;
  buffer: Buffer;
}

export async function filesToContentBlocks(files: UploadedFile[]): Promise<Block[]> {
  const blocks: Block[] = [];

  for (const f of files) {
    if (f.mime === 'application/pdf') {
      blocks.push({
        type: 'document',
        source: {
          type: 'base64',
          media_type: 'application/pdf',
          data: f.buffer.toString('base64')
        }
      });
      blocks.push({ type: 'text', text: `[Document above: ${f.name}]` });
      continue;
    }

    if (f.mime.startsWith('image/')) {
      const allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowed.includes(f.mime)) continue;
      blocks.push({
        type: 'image',
        source: {
          type: 'base64',
          media_type: f.mime as any,
          data: f.buffer.toString('base64')
        }
      });
      blocks.push({ type: 'text', text: `[Image above: ${f.name}]` });
      continue;
    }

    if (
      f.mime === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      f.name.toLowerCase().endsWith('.docx')
    ) {
      try {
        const result = await mammoth.extractRawText({ buffer: f.buffer });
        const text = (result.value || '').slice(0, 60_000);
        blocks.push({ type: 'text', text: `=== ${f.name} ===\n${text}\n` });
      } catch {
        blocks.push({ type: 'text', text: `[Could not parse ${f.name}]` });
      }
      continue;
    }

    if (f.mime.startsWith('text/') || f.name.toLowerCase().endsWith('.txt')) {
      const text = f.buffer.toString('utf8').slice(0, 60_000);
      blocks.push({ type: 'text', text: `=== ${f.name} ===\n${text}\n` });
      continue;
    }

    // Unsupported — skip silently with a note
    blocks.push({ type: 'text', text: `[Skipping unsupported file: ${f.name} (${f.mime})]` });
  }

  return blocks;
}

export const EXTRACTION_SYSTEM_PROMPT = `You extract structured SDVOSB company data from uploaded documents (capability statements, SAM.gov printouts, prior bids, business licenses, W-9s, etc.).

You will receive one or more documents. Extract the following fields and return ONLY a JSON object — no preamble, no code fences, no explanation.

Schema:
{
  "company_name": string | null,
  "ein": string | null,
  "uei": string | null,
  "cage_code": string | null,
  "state": string | null,
  "naics_codes": string | null,
  "sdvosb_certified": boolean | null,
  "mentor_company": string | null,
  "primary_poc_name": string | null,
  "primary_poc_email": string | null,
  "primary_poc_phone": string | null,
  "capabilities_summary": string | null,
  "past_performance": string | null,
  "target_agencies": string | null,
  "differentiators": string | null
}

Rules:
- Return null for any field you cannot confidently infer from the documents. Do not guess.
- NAICS codes should be comma-separated six-digit numbers if present.
- EIN format: XX-XXXXXXX.
- capabilities_summary should be 2–4 sentences if derivable.
- Return only the JSON object. No other text.`;
