// Compliance Agent — final pre-submission audit
// Scans the entire assembled proposal against solicitation requirements,
// FAR/DFARS clauses, and SDVOSB-specific rules.
// Always uses Opus for compliance review.

import { callOpus } from './llm';
import { createServiceClient } from './supabase';
import { parseJsonOrThrow } from './agents/json-utils';

export const COMPLIANCE_SYSTEM_PROMPT = `You are a senior federal contracting compliance reviewer conducting a final pre-submission audit of an SDVOSB proposal. You have deep expertise in FAR, DFARS, and VA-specific acquisition regulations (VAAR).

Your review covers:

1. REQUIREMENT COVERAGE: For each mandatory requirement in the solicitation, verify the proposal addresses it. Flag any requirement that is not addressed or is addressed inadequately.

2. SDVOSB COMPLIANCE: Verify the proposal properly represents SDVOSB status, limitations on subcontracting (FAR 52.219-14 / 13 CFR 125.6), and SDVOSB-specific certifications.

3. FORMAT COMPLIANCE: Check against any page limits, font requirements, section ordering, or format instructions from Section L.

4. FAR/DFARS CLAUSE COMPLIANCE: Identify any FAR or DFARS clauses referenced in the solicitation that the proposal should address but does not.

5. FACTUAL CONSISTENCY: Check for internal contradictions (e.g., different staffing numbers in different sections, inconsistent period of performance references).

6. RISK FLAGS: Identify any statements that could be challenged, are unsupported by evidence, or could be interpreted negatively by evaluators.

Return ONLY a JSON object with this schema. No preamble. No code fences.

{
  "compliance_score": number,
  "submission_readiness": "ready" | "needs_revision" | "not_ready",
  "requirement_coverage": {
    "total_requirements": number,
    "addressed": number,
    "missing": [{ "requirement": string, "source_section": string, "severity": "critical" | "major" | "minor" }]
  },
  "sdvosb_compliance": {
    "status": "compliant" | "needs_attention" | "non_compliant",
    "issues": [string]
  },
  "format_compliance": {
    "status": "compliant" | "needs_attention",
    "issues": [string]
  },
  "far_compliance": {
    "referenced_clauses": [string],
    "unaddressed_clauses": [string]
  },
  "factual_consistency": {
    "contradictions": [string]
  },
  "risk_flags": [
    { "location": string, "issue": string, "recommendation": string }
  ],
  "summary": string
}

Scoring guide for compliance_score (0-100):
- 90-100: Ready for submission. Minor polish only.
- 75-89: Needs revision. Specific gaps to address but fundamentally sound.
- 50-74: Significant issues. Multiple missing requirements or compliance gaps.
- Below 50: Not ready. Major rework needed.

submission_readiness:
- "ready": compliance_score >= 85 AND no critical missing requirements
- "needs_revision": compliance_score 60-84 OR has critical missing requirements
- "not_ready": compliance_score < 60`;

export interface ComplianceResult {
  compliance_score: number;
  submission_readiness: 'ready' | 'needs_revision' | 'not_ready';
  requirement_coverage: {
    total_requirements: number;
    addressed: number;
    missing: Array<{ requirement: string; source_section: string; severity: string }>;
  };
  sdvosb_compliance: { status: string; issues: string[] };
  format_compliance: { status: string; issues: string[] };
  far_compliance: { referenced_clauses: string[]; unaddressed_clauses: string[] };
  factual_consistency: { contradictions: string[] };
  risk_flags: Array<{ location: string; issue: string; recommendation: string }>;
  summary: string;
  cost_usd: number;
}

export async function runFinalComplianceCheck(bidId: string): Promise<ComplianceResult> {
  const start = Date.now();
  const svc = createServiceClient();
  let cost_usd = 0;
  let status = 'success';
  let errorMsg: string | undefined;

  try {
    // Load all data
    const { data: bid } = await svc.from('bids').select('*').eq('id', bidId).single();
    if (!bid) throw new Error('Bid not found');

    const { data: company } = bid.company_id
      ? await svc.from('companies').select('*').eq('id', bid.company_id).single()
      : { data: null };

    const { data: solicitation } = await svc.from('solicitations').select('*').eq('bid_id', bidId).single();
    if (!solicitation) throw new Error('No solicitation data — cannot run compliance check.');

    const { data: sections } = await svc
      .from('bid_sections')
      .select('section_key, section_title, content, word_count, status')
      .eq('bid_id', bidId)
      .in('status', ['draft_ready', 'approved'])
      .order('section_order', { ascending: true });

    if (!sections || sections.length === 0) {
      throw new Error('No drafted sections — cannot run compliance check.');
    }

    // Build full proposal text
    const proposalText = sections.map(s =>
      `\n\n=== ${s.section_title} (${s.word_count} words, status: ${s.status}) ===\n${s.content}`
    ).join('');

    const requirements = solicitation.extracted_requirements || [];
    const criteria = solicitation.evaluation_criteria || [];

    const userContent = [
      `=== COMPANY ===`,
      `Name: ${company?.name || 'Unknown'}`,
      `SDVOSB: ${company?.sdvosb_certified ? 'Yes' : 'Pending'}`,
      `NAICS: ${(company?.naics || []).join(', ')}`,
      ``,
      `=== SOLICITATION ===`,
      `Number: ${solicitation.solicitation_number || 'N/A'}`,
      `Agency: ${solicitation.agency || 'N/A'}`,
      `Set-Aside: ${solicitation.set_aside || 'N/A'}`,
      `Contract Type: ${solicitation.contract_type || 'N/A'}`,
      ``,
      `=== REQUIREMENTS (${requirements.length} total) ===`,
      requirements.map((r: any) => `[${r.category}${r.mandatory ? ' MANDATORY' : ''}] ${r.requirement} (${r.source_section})`).join('\n'),
      ``,
      `=== EVALUATION CRITERIA ===`,
      criteria.map((c: any) => `${c.criterion}${c.weight ? ` (${c.weight})` : ''}: ${c.description}`).join('\n'),
      ``,
      `=== FULL PROPOSAL TEXT ===`,
      proposalText,
      ``,
      `Conduct the final compliance review now. Return only the JSON object.`
    ].join('\n');

    const out = await callOpus(
      COMPLIANCE_SYSTEM_PROMPT + '\n\nThis is a final review before bid submission. Beyond identifying issues, return a compliance_score from 0-100 and submission_readiness as ready|needs_revision|not_ready.',
      userContent,
      4000
    );
    cost_usd = out.cost_usd;

    const result = parseJsonOrThrow(out.text, 'compliance review');

    // Store as bid event
    await svc.from('bid_events').insert({
      bid_id: bidId,
      event_type: 'final_compliance_check',
      payload: { ...result, cost_usd }
    });

    return { ...result, cost_usd };
  } catch (e: any) {
    status = 'error';
    errorMsg = e.message;
    throw e;
  } finally {
    const duration_ms = Date.now() - start;
    try {
      await svc.from('bid_agent_runs').insert({
        bid_id: bidId,
        agent_name: 'compliance_agent',
        status,
        output_summary: status === 'success' ? 'Compliance check complete' : undefined,
        error: errorMsg,
        cost_usd,
        duration_ms
      });
    } catch { /* non-fatal */ }
  }
}
