// LLM router. Direct Anthropic SDK — no relay, no local model.
// Phase A: dual-model routing (Haiku for extraction/templating, Opus for reasoning/critique).
// Keyword classification covers 90% of chatbot routing; the rest goes to Haiku.

import Anthropic from '@anthropic-ai/sdk';
import { createServiceClient } from './supabase';

// Monthly budget cap. Phase A raises this to 200 for Opus-heavy bid generation.
// Michael updates the actual Netlify env var; this default is just a fallback.
const CAP = parseFloat(process.env.LLM_MONTHLY_CAP_USD || '200');

// ─────────────────────────────────────────────────────────
// Pricing per million tokens (update if Anthropic changes rates)
// ─────────────────────────────────────────────────────────
const PRICE_IN_HAIKU  = 1.00;
const PRICE_OUT_HAIKU = 5.00;
const PRICE_IN_OPUS   = 15.00;
const PRICE_OUT_OPUS  = 75.00;

function pricingFor(model: string): { inp: number; out: number } {
  if (model.startsWith('claude-opus')) return { inp: PRICE_IN_OPUS, out: PRICE_OUT_OPUS };
  return { inp: PRICE_IN_HAIKU, out: PRICE_OUT_HAIKU };
}

// ─────────────────────────────────────────────────────────
// Singleton Anthropic client
// ─────────────────────────────────────────────────────────
let _client: Anthropic | null = null;
function client() {
  if (!_client) {
    _client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }
  return _client;
}

// ─────────────────────────────────────────────────────────
// Chatbot keyword classifier (unchanged from v2)
// ─────────────────────────────────────────────────────────
export type RouteKind = 'doc_lookup' | 'doc_generate' | 'compliance_q' | 'general_chat';

export function classifyQuery(query: string): RouteKind {
  const q = query.toLowerCase();
  if (/^(find|pull|show|get|where is|download|list)\b/.test(q)) return 'doc_lookup';
  if (/^(draft|generate|create|build|write|make)\b/.test(q))   return 'doc_generate';
  if (/\b(far|dfars|compliance|sdvosb rule|naics|clause|set-aside|limitation)\b/.test(q)) return 'compliance_q';
  return 'general_chat';
}

// ─────────────────────────────────────────────────────────
// Retry wrapper — 429/529/5xx with 2s/4s backoff
// ─────────────────────────────────────────────────────────
const RETRY_DELAYS = [2000, 4000];
async function callWithRetry<T>(fn: () => Promise<T>): Promise<T> {
  let lastErr: unknown;
  for (let attempt = 0; attempt <= RETRY_DELAYS.length; attempt++) {
    try {
      return await fn();
    } catch (err: any) {
      lastErr = err;
      const status = err?.status ?? err?.statusCode ?? 0;
      const retryable = status === 429 || status === 529 || (status >= 500 && status < 600);
      if (!retryable || attempt >= RETRY_DELAYS.length) throw err;
      await new Promise((r) => setTimeout(r, RETRY_DELAYS[attempt]));
    }
  }
  throw lastErr;
}

// ─────────────────────────────────────────────────────────
// LLM call result type
// ─────────────────────────────────────────────────────────
export interface LLMResult {
  text: string;
  tokens_in: number;
  tokens_out: number;
  cost_usd: number;
}

// ─────────────────────────────────────────────────────────
// Core internal call — both Haiku and Opus route through here
// ─────────────────────────────────────────────────────────
async function callInternal(
  model: string,
  system: string,
  userContent: string | Anthropic.MessageParam['content'],
  maxTokens: number,
  enableWebSearch: boolean
): Promise<LLMResult> {
  if (!(await budgetAvailable())) {
    throw new Error(`LLM_BUDGET_EXCEEDED: Monthly cap ($${CAP}) reached. All LLM calls blocked until next month.`);
  }

  // Build the tools array. The SDK types (v0.32) don't include web_search,
  // but the runtime API accepts it. Cast through any.
  const tools: any[] = [];
  if (enableWebSearch) {
    tools.push({ type: 'web_search_20250305', name: 'web_search', max_uses: 5 });
  }

  const createParams: any = {
    model,
    max_tokens: maxTokens,
    system,
    messages: [
      {
        role: 'user',
        content: typeof userContent === 'string' ? userContent : userContent
      }
    ]
  };
  if (tools.length > 0) createParams.tools = tools;

  const resp = await callWithRetry(() => client().messages.create(createParams));

  const text = resp.content.map((c: any) => (c.type === 'text' ? c.text : '')).join('');
  const tokens_in = resp.usage?.input_tokens || 0;
  const tokens_out = resp.usage?.output_tokens || 0;
  const { inp, out } = pricingFor(model);
  const cost_usd = (tokens_in / 1_000_000) * inp + (tokens_out / 1_000_000) * out;

  await recordUsage(model, tokens_in, tokens_out, cost_usd);
  return { text, tokens_in, tokens_out, cost_usd };
}

// ─────────────────────────────────────────────────────────
// Public API: callHaiku
// ─────────────────────────────────────────────────────────
export async function callHaiku(
  system: string,
  userContent: string | Anthropic.MessageParam['content'],
  maxTokens = 1500,
  enableWebSearch = false
): Promise<LLMResult> {
  return callInternal('claude-haiku-4-5', system, userContent, maxTokens, enableWebSearch);
}

// ─────────────────────────────────────────────────────────
// Public API: callOpus
// ─────────────────────────────────────────────────────────
export async function callOpus(
  system: string,
  userContent: string | Anthropic.MessageParam['content'],
  maxTokens = 4000,
  enableWebSearch = false
): Promise<LLMResult> {
  return callInternal('claude-opus-4-6', system, userContent, maxTokens, enableWebSearch);
}

// ─────────────────────────────────────────────────────────
// Public API: callModel — dispatches by model string
// ─────────────────────────────────────────────────────────
export type ModelChoice = 'opus' | 'haiku';

export async function callModel(
  model: ModelChoice,
  system: string,
  userContent: string | Anthropic.MessageParam['content'],
  maxTokens?: number,
  enableWebSearch = false
): Promise<LLMResult> {
  if (model === 'opus') return callOpus(system, userContent, maxTokens ?? 4000, enableWebSearch);
  return callHaiku(system, userContent, maxTokens ?? 1500, enableWebSearch);
}

// ─────────────────────────────────────────────────────────
// Shim for backwards compat with capability statement generator
// ─────────────────────────────────────────────────────────
export async function chatHaiku(system: string, user: string) {
  return callHaiku(system, user);
}

// ─────────────────────────────────────────────────────────
// Budget guard — checks total cost across ALL models for the month
// ─────────────────────────────────────────────────────────
async function budgetAvailable(): Promise<boolean> {
  try {
    const svc = createServiceClient();
    const month = new Date().toISOString().slice(0, 7);
    const { data } = await svc.from('llm_usage').select('cost_usd').eq('month', month);
    const total = (data || []).reduce((s, r: any) => s + Number(r.cost_usd || 0), 0);
    return total < CAP;
  } catch {
    // If the check fails, err on the side of allowing the call
    // rather than leaving the user stuck. Budget is still tracked post-call.
    return true;
  }
}

// ─────────────────────────────────────────────────────────
// Usage tracking — records per model per month
// ─────────────────────────────────────────────────────────
async function recordUsage(model: string, tin: number, tout: number, cost: number) {
  try {
    const svc = createServiceClient();
    const month = new Date().toISOString().slice(0, 7);
    await svc.rpc('increment_llm_usage', {
      p_month: month, p_model: model, p_in: tin, p_out: tout, p_cost: cost
    });
  } catch { /* non-fatal */ }
}

// ─────────────────────────────────────────────────────────
// Cost breakdown for UI — returns per-model and total spend
// ─────────────────────────────────────────────────────────
export interface CostBreakdown {
  haiku_cost: number;
  opus_cost: number;
  total_cost: number;
  cap_usd: number;
  pct_used: number;
}

export async function getMonthCostBreakdown(): Promise<CostBreakdown> {
  const svc = createServiceClient();
  const month = new Date().toISOString().slice(0, 7);
  const { data } = await svc.from('llm_usage').select('model, cost_usd').eq('month', month);

  let haiku_cost = 0;
  let opus_cost = 0;
  for (const row of data || []) {
    const c = Number((row as any).cost_usd || 0);
    const m = (row as any).model || '';
    if (m.startsWith('claude-opus')) opus_cost += c;
    else haiku_cost += c;
  }

  const total_cost = haiku_cost + opus_cost;
  return {
    haiku_cost: Math.round(haiku_cost * 10000) / 10000,
    opus_cost: Math.round(opus_cost * 10000) / 10000,
    total_cost: Math.round(total_cost * 10000) / 10000,
    cap_usd: CAP,
    pct_used: CAP > 0 ? Math.round((total_cost / CAP) * 10000) / 100 : 0
  };
}
