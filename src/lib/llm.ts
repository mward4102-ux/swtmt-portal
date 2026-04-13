// LLM router. Direct Anthropic SDK — no relay, no local model.
// Keyword classification covers 90% of routing; the rest just goes to Haiku.

import Anthropic from '@anthropic-ai/sdk';
import { createServiceClient } from './supabase';

const CAP = parseFloat(process.env.LLM_MONTHLY_CAP_USD || '25');

// Haiku 4.5 approximate pricing (update if rates change)
const PRICE_IN_PER_M = 1.00;
const PRICE_OUT_PER_M = 5.00;

let _client: Anthropic | null = null;
function client() {
  if (!_client) {
    _client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }
  return _client;
}

export type RouteKind = 'doc_lookup' | 'doc_generate' | 'compliance_q' | 'general_chat';

/**
 * Pure keyword classification. No LLM round trip.
 */
export function classifyQuery(query: string): RouteKind {
  const q = query.toLowerCase();
  if (/^(find|pull|show|get|where is|download|list)\b/.test(q)) return 'doc_lookup';
  if (/^(draft|generate|create|build|write|make)\b/.test(q))   return 'doc_generate';
  if (/\b(far|dfars|compliance|sdvosb rule|naics|clause|set-aside|limitation)\b/.test(q)) return 'compliance_q';
  return 'general_chat';
}

/**
 * General-purpose Haiku call. Enforces the monthly budget cap.
 */
export async function callHaiku(
  system: string,
  userContent: string | Anthropic.MessageParam['content'],
  maxTokens = 1500
): Promise<{ text: string; tokens_in: number; tokens_out: number; cost_usd: number }> {
  if (!(await budgetAvailable())) {
    throw new Error('LLM_BUDGET_EXCEEDED: Monthly Haiku cap hit. Chatbot is in DB-only mode until next month.');
  }

  const resp = await client().messages.create({
    model: 'claude-haiku-4-5',
    max_tokens: maxTokens,
    system,
    messages: [
      {
        role: 'user',
        content: typeof userContent === 'string' ? userContent : userContent
      }
    ]
  });

  const text = resp.content.map(c => (c.type === 'text' ? c.text : '')).join('');
  const tokens_in = resp.usage?.input_tokens || 0;
  const tokens_out = resp.usage?.output_tokens || 0;
  const cost_usd = (tokens_in / 1_000_000) * PRICE_IN_PER_M + (tokens_out / 1_000_000) * PRICE_OUT_PER_M;

  await recordUsage('claude-haiku-4-5', tokens_in, tokens_out, cost_usd);
  return { text, tokens_in, tokens_out, cost_usd };
}

/**
 * Shim kept for backwards compat with the capability statement generator.
 */
export async function chatHaiku(system: string, user: string) {
  return callHaiku(system, user);
}

async function budgetAvailable(): Promise<boolean> {
  try {
    const svc = createServiceClient();
    const month = new Date().toISOString().slice(0, 7);
    const { data } = await svc.from('llm_usage').select('cost_usd').eq('month', month);
    const total = (data || []).reduce((s, r: any) => s + Number(r.cost_usd || 0), 0);
    return total < CAP;
  } catch {
    // If the check fails for any reason, err on the side of allowing the call
    // rather than leaving the user stuck. Budget will still be tracked post-call.
    return true;
  }
}

async function recordUsage(model: string, tin: number, tout: number, cost: number) {
  try {
    const svc = createServiceClient();
    const month = new Date().toISOString().slice(0, 7);
    await svc.rpc('increment_llm_usage', {
      p_month: month, p_model: model, p_in: tin, p_out: tout, p_cost: cost
    });
  } catch { /* non-fatal */ }
}
