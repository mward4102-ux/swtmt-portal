// Orchestrator — coordinates the full bid drafting pipeline.
// Manages the lifecycle: research → pricing → draft → critique → revise per section.
// Designed for the Netlify polling pattern: each section is drafted in a separate request.

import { createServiceClient } from '../supabase';
import { SECTION_DEFINITIONS, draftSection, type DraftingContext } from './drafting-agent';
import { critiqueSection } from './critique-agent';
import { reviseSection } from './revision-agent';
import { runResearchAgent } from './research-agent';
import { runPricingAgent } from './pricing-agent';

// ─────────────────────────────────────────────────────────
// Load full drafting context for a bid
// ─────────────────────────────────────────────────────────
export async function loadDraftingContext(bidId: string): Promise<DraftingContext> {
  const svc = createServiceClient();

  const { data: bid } = await svc.from('bids').select('*').eq('id', bidId).single();
  if (!bid) throw new Error('Bid not found');

  const { data: company } = bid.company_id
    ? await svc.from('companies').select('*').eq('id', bid.company_id).single()
    : { data: null };

  const { data: solicitation } = await svc.from('solicitations').select('*').eq('bid_id', bidId).single();
  const { data: researchBrief } = await svc.from('research_briefs').select('*').eq('bid_id', bidId).single();
  const { data: pricingAnalysis } = await svc.from('pricing_analyses').select('*').eq('bid_id', bidId).single();
  const { data: ppRecords } = bid.company_id
    ? await svc.from('past_performance_records').select('*').eq('company_id', bid.company_id).eq('is_active', true)
    : { data: [] };

  return {
    company: company || {},
    solicitation: solicitation || null,
    research_brief: researchBrief || null,
    pricing_analysis: pricingAnalysis || null,
    past_performance_records: ppRecords || []
  };
}

// ─────────────────────────────────────────────────────────
// Initialize bid sections — creates pending rows for all sections
// ─────────────────────────────────────────────────────────
export async function initializeBidSections(
  bidId: string,
  sectionKeys?: string[]
): Promise<number> {
  const svc = createServiceClient();
  const defs = sectionKeys
    ? SECTION_DEFINITIONS.filter(d => sectionKeys.includes(d.key))
    : SECTION_DEFINITIONS;

  let count = 0;
  for (const def of defs) {
    const { error } = await svc.from('bid_sections').upsert({
      bid_id: bidId,
      section_key: def.key,
      section_title: def.title,
      section_order: def.order,
      status: 'pending'
    }, { onConflict: 'bid_id,section_key' });

    if (!error) count++;
  }

  return count;
}

// ─────────────────────────────────────────────────────────
// Start the full drafting pipeline — run research + pricing, queue sections
// ─────────────────────────────────────────────────────────
export interface StartDraftingOptions {
  skip_research?: boolean;
  skip_pricing?: boolean;
  skip_critique?: boolean;
  sections_to_draft?: string[];
}

export async function startFullBidDrafting(
  bidId: string,
  options: StartDraftingOptions = {}
): Promise<{ sections_queued: number; research_ran: boolean; pricing_ran: boolean }> {
  const svc = createServiceClient();
  const start = Date.now();
  let status = 'success';
  let errorMsg: string | undefined;

  try {
    // Verify solicitation exists
    const { data: sol } = await svc.from('solicitations').select('id').eq('bid_id', bidId).single();
    if (!sol) throw new Error('Upload solicitation first — cannot draft without requirements.');

    // Run research if needed
    let research_ran = false;
    if (!options.skip_research) {
      const { data: existing } = await svc.from('research_briefs').select('id').eq('bid_id', bidId).single();
      if (!existing) {
        await runResearchAgent(bidId);
        research_ran = true;
      }
    }

    // Run pricing if needed
    let pricing_ran = false;
    if (!options.skip_pricing) {
      const { data: existing } = await svc.from('pricing_analyses').select('id').eq('bid_id', bidId).single();
      if (!existing) {
        await runPricingAgent(bidId);
        pricing_ran = true;
      }
    }

    // Initialize section rows
    const sections_queued = await initializeBidSections(bidId, options.sections_to_draft);

    return { sections_queued, research_ran, pricing_ran };
  } catch (e: any) {
    status = 'error';
    errorMsg = e.message;
    throw e;
  } finally {
    const duration_ms = Date.now() - start;
    try {
      await svc.from('bid_agent_runs').insert({
        bid_id: bidId,
        agent_name: 'orchestrator',
        status,
        input_summary: `Options: ${JSON.stringify(options)}`,
        output_summary: status === 'success' ? 'Drafting initialized' : undefined,
        error: errorMsg,
        cost_usd: 0,
        duration_ms
      });
    } catch { /* non-fatal */ }
  }
}

// ─────────────────────────────────────────────────────────
// Draft the next pending section — called repeatedly by the client
// ─────────────────────────────────────────────────────────
export async function draftNextSection(
  bidId: string,
  skipCritique = false
): Promise<{
  section_key: string;
  status: string;
  word_count: number;
  cost_usd: number;
  next_pending_count: number;
} | null> {
  const svc = createServiceClient();

  // Find next pending section
  const { data: pending } = await svc
    .from('bid_sections')
    .select('*')
    .eq('bid_id', bidId)
    .eq('status', 'pending')
    .order('section_order', { ascending: true })
    .limit(1);

  if (!pending || pending.length === 0) return null;

  const section = pending[0];
  const sectionKey = section.section_key;
  let totalCost = 0;

  try {
    // Load context
    const context = await loadDraftingContext(bidId);
    if (!context.solicitation) throw new Error('No solicitation data — cannot draft.');

    // Update status to drafting
    await svc.from('bid_sections').update({ status: 'drafting' }).eq('id', section.id);

    // Draft
    const draft = await draftSection(sectionKey, context);
    totalCost += draft.cost_usd;

    let finalContent = draft.content;
    let finalWordCount = draft.word_count;
    let critiqueText: string | null = null;

    // Critique + revise if enabled
    if (!skipCritique) {
      await svc.from('bid_sections').update({ status: 'critiquing' }).eq('id', section.id);

      const critique = await critiqueSection(sectionKey, draft.content, context, bidId);
      totalCost += critique.cost_usd;
      critiqueText = JSON.stringify(critique);

      if (critique.requires_revision) {
        await svc.from('bid_sections').update({ status: 'revised' }).eq('id', section.id);

        const revision = await reviseSection(sectionKey, draft.content, critique, context, bidId);
        totalCost += revision.cost_usd;
        finalContent = revision.content;
        finalWordCount = revision.word_count;
      }
    }

    // Update section to draft_ready
    await svc.from('bid_sections').update({
      status: 'draft_ready',
      content: finalContent,
      critique: critiqueText,
      word_count: finalWordCount,
      model_used: draft.model_used,
      cost_usd: totalCost,
      generation_prompt: draft.prompt.slice(0, 10000), // cap for storage
      generated_at: new Date().toISOString()
    }).eq('id', section.id);

    // Log bid event
    try {
      await svc.from('bid_events').insert({
        bid_id: bidId,
        event_type: 'section_drafted',
        payload: { section_key: sectionKey, word_count: finalWordCount, cost_usd: totalCost }
      });
    } catch { /* non-fatal */ }

    // Count remaining pending
    const { count } = await svc
      .from('bid_sections')
      .select('id', { count: 'exact', head: true })
      .eq('bid_id', bidId)
      .eq('status', 'pending');

    return {
      section_key: sectionKey,
      status: 'draft_ready',
      word_count: finalWordCount,
      cost_usd: totalCost,
      next_pending_count: count || 0
    };
  } catch (e: any) {
    // Mark section as failed but pending for retry
    await svc.from('bid_sections').update({
      status: 'pending',
      revision_notes: `Draft attempt failed: ${e.message}`
    }).eq('id', section.id);
    throw e;
  }
}

// ─────────────────────────────────────────────────────────
// Regenerate a single section — for iterating on weak spots
// ─────────────────────────────────────────────────────────
export async function regenerateSection(
  bidId: string,
  sectionKey: string,
  customInstructions?: string,
  skipCritique = false
): Promise<{
  content: string;
  word_count: number;
  cost_usd: number;
}> {
  const svc = createServiceClient();
  const context = await loadDraftingContext(bidId);
  if (!context.solicitation) throw new Error('No solicitation data.');

  let totalCost = 0;

  // Draft with optional custom instructions
  const draft = await draftSection(sectionKey, context, customInstructions);
  totalCost += draft.cost_usd;

  let finalContent = draft.content;
  let finalWordCount = draft.word_count;
  let critiqueText: string | null = null;

  if (!skipCritique) {
    const critique = await critiqueSection(sectionKey, draft.content, context, bidId);
    totalCost += critique.cost_usd;
    critiqueText = JSON.stringify(critique);

    if (critique.requires_revision) {
      const revision = await reviseSection(sectionKey, draft.content, critique, context, bidId);
      totalCost += revision.cost_usd;
      finalContent = revision.content;
      finalWordCount = revision.word_count;
    }
  }

  // Update section record
  await svc.from('bid_sections').update({
    status: 'draft_ready',
    content: finalContent,
    critique: critiqueText,
    word_count: finalWordCount,
    model_used: draft.model_used,
    cost_usd: totalCost,
    generation_prompt: draft.prompt.slice(0, 10000),
    generated_at: new Date().toISOString()
  }).eq('bid_id', bidId).eq('section_key', sectionKey);

  return { content: finalContent, word_count: finalWordCount, cost_usd: totalCost };
}
