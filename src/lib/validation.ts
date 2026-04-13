// SWTMT Portal — Zod validation schemas for all API routes
// v3: centralized input validation. Every API route uses parseOrRespond().

import { z } from 'zod';
import { NextResponse } from 'next/server';

// ─────────────────────────────────────────────────────────
// HELPER: parse body against schema, return 400 if invalid
// ─────────────────────────────────────────────────────────
export function parseOrRespond<T extends z.ZodTypeAny>(
  schema: T,
  data: unknown
): { data: z.infer<T> } | { error: NextResponse } {
  const result = schema.safeParse(data);
  if (!result.success) {
    const issues = result.error.issues.map(
      (i) => `${i.path.join('.')}: ${i.message}`
    );
    return {
      error: NextResponse.json(
        { error: 'Validation failed', issues },
        { status: 400 }
      ),
    };
  }
  return { data: result.data };
}

// ─────────────────────────────────────────────────────────
// /api/intake — POST body
// ─────────────────────────────────────────────────────────
export const IntakeSchema = z.object({
  company_name: z.string().min(1, 'Company name is required').max(200),
  ein: z.string().max(20).optional().default(''),
  uei: z.string().max(20).optional().default(''),
  cage_code: z.string().max(10).optional().default(''),
  naics_codes: z.string().max(500).optional().default(''),
  sdvosb_certified: z.union([z.boolean(), z.string()]).optional(),
  target_agencies: z.string().max(500).optional().default(''),
  // Allow any additional fields from the extraction
}).passthrough();

// ─────────────────────────────────────────────────────────
// /api/chatbot — POST body
// ─────────────────────────────────────────────────────────
const ChatMessageSchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string().min(1).max(10000),
});

export const ChatbotSchema = z.object({
  messages: z.array(ChatMessageSchema).min(1).max(50),
});

// ─────────────────────────────────────────────────────────
// /api/documents/generate — POST body
// ─────────────────────────────────────────────────────────
export const DocGenerateSchema = z.object({
  kind: z.string().min(1),
  bid_id: z.string().uuid().optional(),
  company_id: z.string().uuid().optional(),
  intake: z.record(z.unknown()).optional(),
  prompt: z.string().max(5000).optional(),
});

// ─────────────────────────────────────────────────────────
// /api/documents/download — GET query params
// ─────────────────────────────────────────────────────────
export const DocDownloadSchema = z.object({
  path: z.string().min(1, 'Missing storage path'),
});
