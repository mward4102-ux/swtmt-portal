// Pricing Agent
// Analyzes solicitation requirements, historical awards, and labor market data
// to produce a three-tier pricing model (aggressive, target, conservative).
// Uses Opus — pricing analysis requires genuine reasoning about cost structures.

import { callOpus } from '../llm';
import { createServiceClient } from '../supabase';
import { fetchBLSLaborRates } from '../research/bls-labor';
import { parseJsonOrThrow } from './json-utils';

const PRICING_PROMPT = `You are a federal contracting pricing analyst preparing a competitive price analysis for an SDVOSB small business. You have been given:
1. The solicitation requirements (scope, period of performance, contract type)
2. Historical award data from USAspending (comparable contracts in the same NAICS/agency)
3. Labor market data from BLS (if available)
4. Company context

Your job is to build a three-tier pricing model. Return ONLY a JSON object with this schema. No preamble. No code fences.

{
  "aggressive_price": number,
  "target_price": number,
  "conservative_price": number,
  "pricing_methodology": string,
  "comparable_awards": [
    {
      "recipient": string,
      "amount": number,
      "period": string,
      "relevance": string
    }
  ],
  "labor_category_estimates": [
    {
      "category": string,
      "hours_per_year": number,
      "base_rate": number,
      "loaded_rate": number,
      "annual_cost": number
    }
  ],
  "indirect_rate_assumptions": {
    "fringe": number,
    "overhead": number,
    "g_and_a": number,
    "fee": number
  },
  "fee_structure": string
}

Pricing methodology rules:
1. Identify 3-6 labor categories needed to perform the work described in the solicitation requirements
2. Estimate hours per category per year based on the scope. For a full-time equivalent, use 1,880 productive hours/year (2,080 minus holidays and leave)
3. Set base rates using BLS data if provided, otherwise use industry-standard federal contracting rates for the labor category and region
4. Apply standard small business indirect rates as defaults:
   - Fringe: 30% (health, retirement, payroll taxes)
   - Overhead: 25% (facilities, IT, management)
   - G&A: 12% (corporate administration, accounting, HR)
   - Fee/profit: 8% (standard for FFP small business)
5. For the three price points:
   - Aggressive: 10-15% below the historical median award amount. Lean staffing, competitive rates. Use when the evaluation is price-dominant.
   - Target: At or near the historical median. Balanced staffing. Use for best-value evaluations.
   - Conservative: 10-15% above the historical median. Full staffing with contingency. Use when quality/risk outweighs price.
6. If the contract type is T&M, show fully-loaded hourly rates instead of total price
7. Show your math in pricing_methodology — walk through the calculation step by step
8. comparable_awards should reference 3-5 actual awards from the historical data provided. If none available, note that and explain how you derived the estimates.
9. All dollar amounts should be numbers (not strings). Round to nearest dollar for totals, nearest cent for rates.

Do NOT invent specific company names, contract numbers, or BLS rates that were not provided in the input data. If data is missing, state your assumptions clearly in pricing_methodology.`;

export interface PricingAnalysis {
  aggressive_price: number;
  target_price: number;
  conservative_price: number;
  pricing_methodology: string;
  comparable_awards: Array<{
    recipient: string;
    amount: number;
    period: string;
    relevance: string;
  }>;
  labor_category_estimates: Array<{
    category: string;
    hours_per_year: number;
    base_rate: number;
    loaded_rate: number;
    annual_cost: number;
  }>;
  indirect_rate_assumptions: {
    fringe: number;
    overhead: number;
    g_and_a: number;
    fee: number;
  };
  fee_structure: string;
}

export async function runPricingAgent(bidId: string): Promise<PricingAnalysis> {
  const start = Date.now();
  const svc = createServiceClient();
  let totalCost = 0;
  let status = 'success';
  let errorMsg: string | undefined;

  try {
    // Load all context
    const { data: bid } = await svc.from('bids').select('*').eq('id', bidId).single();
    if (!bid) throw new Error('Bid not found');

    const { data: solicitation } = await svc.from('solicitations').select('*').eq('bid_id', bidId).single();
    const { data: researchBrief } = await svc.from('research_briefs').select('*').eq('bid_id', bidId).single();
    const { data: company } = bid.company_id
      ? await svc.from('companies').select('*').eq('id', bid.company_id).single()
      : { data: null };

    // Attempt BLS labor rate lookup (best-effort)
    const blsData = await fetchBLSLaborRates(
      ['151200', '151210', '151250', '131000', '113000'], // common IT/management SOC codes
      solicitation?.place_of_performance || undefined
    );

    // Build context for Opus
    const contextText = [
      `=== SOLICITATION ===`,
      solicitation ? [
        `Number: ${solicitation.solicitation_number || 'N/A'}`,
        `Agency: ${solicitation.agency || 'N/A'}`,
        `NAICS: ${solicitation.naics || 'N/A'}`,
        `Contract Type: ${solicitation.contract_type || 'Not specified'}`,
        `Set-Aside: ${solicitation.set_aside || 'Not specified'}`,
        `Period of Performance: ${solicitation.period_of_performance || 'Not specified'}`,
        `Place of Performance: ${solicitation.place_of_performance || 'Not specified'}`,
        `Estimated Value: ${solicitation.estimated_value || 'Not specified'}`,
        ``,
        `Requirements:`,
        ...(solicitation.extracted_requirements as any[] || []).map((r: any) =>
          `  [${r.category}] ${r.requirement} (${r.mandatory ? 'MANDATORY' : 'desired'}, ${r.source_section})`
        )
      ].join('\n') : 'No solicitation data available.',
      ``,
      `=== COMPANY ===`,
      company ? `${company.name} — SDVOSB: ${company.sdvosb_certified ? 'Yes' : 'Pending'} — NAICS: ${(company.naics || []).join(', ')}` : 'No company data.',
      ``,
      `=== HISTORICAL AWARDS (from research brief) ===`,
      researchBrief?.historical_awards
        ? JSON.stringify(researchBrief.historical_awards, null, 2)
        : 'No historical award data available.',
      ``,
      `=== MARKET CONTEXT ===`,
      researchBrief?.market_context
        ? JSON.stringify(researchBrief.market_context, null, 2)
        : 'No market context available.',
      ``,
      `=== BLS LABOR RATE DATA ===`,
      blsData.length > 0
        ? blsData.map(b => `${b.occupation_code}: hourly_mean=$${b.hourly_mean}, annual_mean=$${b.annual_mean}`).join('\n')
        : 'No BLS data available. Use industry-standard federal contracting rates.'
    ].join('\n');

    const out = await callOpus(
      PRICING_PROMPT,
      `Build a three-tier pricing model for this procurement:\n\n${contextText}`,
      4000,
      true // web search for supplementary rate data
    );
    totalCost += out.cost_usd;

    const analysis: PricingAnalysis = parseJsonOrThrow(out.text, 'pricing analysis');

    // Store in database
    await svc.from('pricing_analyses').upsert({
      bid_id: bidId,
      aggressive_price: analysis.aggressive_price,
      target_price: analysis.target_price,
      conservative_price: analysis.conservative_price,
      pricing_methodology: analysis.pricing_methodology,
      comparable_awards: analysis.comparable_awards,
      labor_category_estimates: analysis.labor_category_estimates,
      indirect_rate_assumptions: analysis.indirect_rate_assumptions,
      fee_structure: analysis.fee_structure,
      total_cost_usd: totalCost
    }, { onConflict: 'bid_id' });

    return analysis;
  } catch (e: any) {
    status = 'error';
    errorMsg = e.message;
    throw e;
  } finally {
    const duration_ms = Date.now() - start;
    try {
      await svc.from('bid_agent_runs').insert({
        bid_id: bidId,
        agent_name: 'pricing_agent',
        status,
        output_summary: status === 'success' ? 'Pricing analysis complete' : undefined,
        error: errorMsg,
        cost_usd: totalCost,
        duration_ms
      });
    } catch { /* non-fatal */ }
  }
}
