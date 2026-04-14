// Research Agent
// Gathers competitive intelligence for a bid: historical awards, SAM.gov opportunities,
// agency context, and synthesizes a research brief for downstream agents.
// Uses Haiku for data fetching, Opus for synthesis.

import { callOpus } from '../llm';
import { createServiceClient } from '../supabase';
import { searchUSASpending } from '../research/usaspending';
import { searchSAMOpportunities } from '../research/sam-gov';
import { fetchAgencyContext } from '../research/agency-intel';
import { parseJsonOrThrow } from './json-utils';

const SYNTHESIS_PROMPT = `You are a federal contracting competitive intelligence analyst. You have been given raw research data from USAspending.gov (historical awards), SAM.gov (recent opportunities), and agency strategic context for a specific procurement.

Synthesize this into a structured research brief that a proposal writer can use. Return ONLY a JSON object with this schema. No preamble. No code fences.

{
  "agency_intel": {
    "mission": string,
    "strategic_priorities": [string],
    "contracting_patterns": string
  },
  "historical_awards": {
    "count": number,
    "value_range": string,
    "top_recipients": [string],
    "average_period_of_performance": string,
    "summary": string
  },
  "incumbent_analysis": {
    "likely_incumbent": string | null,
    "contract_history": string,
    "vulnerabilities": [string],
    "recompete_indicators": [string]
  },
  "market_context": {
    "competitive_landscape": string,
    "common_win_themes": [string],
    "pricing_pressures": string
  }
}

Rules:
- agency_intel.contracting_patterns: Describe how this agency typically contracts (FFP vs T&M, preference for small business, typical award sizes)
- historical_awards: Analyze the USAspending data. If no awards found, say so explicitly.
- incumbent_analysis.likely_incumbent: The recipient with the most awards or highest total value in the same NAICS. If unclear, set to null.
- incumbent_analysis.vulnerabilities: What could an SDVOSB challenger exploit? (e.g., incumbent is large business, awards show cost overruns, agency has expressed desire for new entrants)
- market_context.common_win_themes: Based on the data, what do winning proposals in this space typically emphasize?
- market_context.pricing_pressures: Are award amounts trending up, down, or stable? Is this a price-sensitive or best-value environment?
- Do NOT fabricate specific numbers, contract IDs, or company names that are not in the source data.
- If source data is thin, acknowledge the gaps and provide the best analysis possible from what's available.`;

export interface ResearchBrief {
  agency_intel: {
    mission: string;
    strategic_priorities: string[];
    contracting_patterns: string;
  };
  historical_awards: {
    count: number;
    value_range: string;
    top_recipients: string[];
    average_period_of_performance: string;
    summary: string;
  };
  incumbent_analysis: {
    likely_incumbent: string | null;
    contract_history: string;
    vulnerabilities: string[];
    recompete_indicators: string[];
  };
  market_context: {
    competitive_landscape: string;
    common_win_themes: string[];
    pricing_pressures: string;
  };
}

export async function runResearchAgent(bidId: string): Promise<ResearchBrief> {
  const start = Date.now();
  const svc = createServiceClient();
  let totalCost = 0;
  let status = 'success';
  let errorMsg: string | undefined;

  try {
    // Load bid and solicitation
    const { data: bid } = await svc.from('bids').select('*').eq('id', bidId).single();
    if (!bid) throw new Error('Bid not found');

    const { data: solicitation } = await svc.from('solicitations').select('*').eq('bid_id', bidId).single();

    const { data: company } = bid.company_id
      ? await svc.from('companies').select('*').eq('id', bid.company_id).single()
      : { data: null };

    const naics = solicitation?.naics || bid.naics || '';
    const agency = solicitation?.agency || bid.agency || '';
    const setAside = solicitation?.set_aside || '';

    // Parallel data fetching
    const [usaAwards, samOpps, agencyCtx] = await Promise.all([
      searchUSASpending(naics, agency),
      searchSAMOpportunities(naics, setAside),
      fetchAgencyContext(agency)
    ]);

    // Build context for synthesis
    const contextText = [
      `=== BID CONTEXT ===`,
      `Company: ${company?.name || 'Unknown'}`,
      `Solicitation: ${solicitation?.solicitation_number || 'N/A'}`,
      `Agency: ${agency}`,
      `NAICS: ${naics}`,
      `Set-Aside: ${setAside || 'Not specified'}`,
      `Contract Type: ${solicitation?.contract_type || 'Not specified'}`,
      ``,
      `=== USASPENDING HISTORICAL AWARDS (${usaAwards.length} results) ===`,
      usaAwards.length > 0
        ? usaAwards.map(a =>
            `Award ${a.award_id}: ${a.recipient_name} — $${a.award_amount.toLocaleString()} — ${a.start_date} to ${a.end_date} — ${a.description?.slice(0, 200) || 'No description'}`
          ).join('\n')
        : 'No historical awards found for this NAICS/agency combination.',
      ``,
      `=== SAM.GOV RECENT OPPORTUNITIES (${samOpps.length} results) ===`,
      samOpps.length > 0
        ? samOpps.map(o =>
            `${o.solicitation_number}: ${o.title} — ${o.agency} — ${o.set_aside} — Due: ${o.response_deadline}`
          ).join('\n')
        : 'No recent SAM.gov opportunities found for this NAICS.',
      ``,
      `=== AGENCY CONTEXT ===`,
      `Mission: ${agencyCtx.mission_summary}`,
      `Strategic Priorities: ${agencyCtx.strategic_priorities.join('; ')}`,
      `Contracting Forecast: ${agencyCtx.contracting_forecast}`,
      `Recent Reports: ${agencyCtx.recent_reports.join('; ')}`
    ].join('\n');

    // Synthesize with Opus
    const out = await callOpus(
      SYNTHESIS_PROMPT,
      `Synthesize the following research data into a competitive intelligence brief:\n\n${contextText}`,
      4000,
      true // enable web search for supplementary context
    );
    totalCost += out.cost_usd;

    const brief: ResearchBrief = parseJsonOrThrow(out.text, 'research synthesis');

    // Store in database
    await svc.from('research_briefs').upsert({
      bid_id: bidId,
      agency_intel: brief.agency_intel,
      historical_awards: brief.historical_awards,
      incumbent_analysis: brief.incumbent_analysis,
      market_context: brief.market_context,
      raw_sources: {
        usaspending_count: usaAwards.length,
        sam_gov_count: samOpps.length,
        agency_context: agencyCtx
      },
      total_cost_usd: totalCost
    }, { onConflict: 'bid_id' });

    return brief;
  } catch (e: any) {
    status = 'error';
    errorMsg = e.message;
    throw e;
  } finally {
    const duration_ms = Date.now() - start;
    try {
      await svc.from('bid_agent_runs').insert({
        bid_id: bidId,
        agent_name: 'research_agent',
        status,
        output_summary: status === 'success' ? 'Research brief generated' : undefined,
        error: errorMsg,
        cost_usd: totalCost,
        duration_ms
      });
    } catch { /* non-fatal */ }
  }
}
