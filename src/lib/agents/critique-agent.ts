// Critique Agent
// Evaluates a drafted proposal section against evaluation criteria using Opus.
// Always uses Opus — this is the quality control lever.

import { callOpus } from '../llm';
import { createServiceClient } from '../supabase';
import type { DraftingContext } from './drafting-agent';
import { parseJsonOrThrow } from './json-utils';

const CRITIQUE_PROMPT = `You are a senior federal contracting Source Selection Evaluation Board (SSEB) member scoring a proposal section. You have evaluated hundreds of proposals. You are thorough, fair, and constructive — but you do not tolerate generic language, missing requirement responses, or weak differentiators.

You will receive:
1. The section content to evaluate
2. The evaluation criteria from the solicitation
3. The extracted requirements
4. The win themes the proposal should emphasize

Score the section on a 1-10 scale across these five dimensions:

1. RESPONSIVENESS: Does the section directly address the evaluation criteria and requirements? Does it cover every mandatory requirement? Are there gaps?
2. SPECIFICITY: Does the section use concrete details, named standards, specific methodologies? Or does it rely on vague promises and generic boilerplate?
3. WIN THEME INTEGRATION: Are the win themes woven naturally into the prose? Or are they absent/forced?
4. VOICE AND FORMAT: Is the writing in proper federal contracting voice? First person plural, active voice, confident but not arrogant? Is the formatting appropriate (headers, flow, length)?
5. COMPLIANCE: Does the section align with FAR requirements, SDVOSB regulations, and any specific solicitation instructions?

Then list 3-7 specific weaknesses with concrete revision recommendations.

Finally, determine if revision is needed: requires_revision = true if overall_score < 7 OR if any single dimension scores below 5.

Return ONLY a JSON object with this schema. No preamble. No code fences.

{
  "scores": {
    "responsiveness": { "score": number, "justification": string },
    "specificity": { "score": number, "justification": string },
    "win_theme_integration": { "score": number, "justification": string },
    "voice_and_format": { "score": number, "justification": string },
    "compliance": { "score": number, "justification": string }
  },
  "weaknesses": [
    { "weakness": string, "recommendation": string }
  ],
  "overall_score": number,
  "requires_revision": boolean
}`;

export interface CritiqueResult {
  scores: {
    responsiveness: { score: number; justification: string };
    specificity: { score: number; justification: string };
    win_theme_integration: { score: number; justification: string };
    voice_and_format: { score: number; justification: string };
    compliance: { score: number; justification: string };
  };
  weaknesses: Array<{ weakness: string; recommendation: string }>;
  overall_score: number;
  requires_revision: boolean;
  cost_usd: number;
}

export async function critiqueSection(
  sectionKey: string,
  content: string,
  context: DraftingContext,
  bidId: string
): Promise<CritiqueResult> {
  const start = Date.now();
  const svc = createServiceClient();
  let cost_usd = 0;
  let status = 'success';
  let errorMsg: string | undefined;

  try {
    const sol = context.solicitation || {};
    const requirements = sol.extracted_requirements || [];
    const criteria = sol.evaluation_criteria || [];
    const winThemes = sol.win_themes || [];

    const userContent = [
      `=== SECTION TO EVALUATE: ${sectionKey} ===`,
      content,
      ``,
      `=== EVALUATION CRITERIA ===`,
      criteria.map((c: any) => `${c.criterion}${c.weight ? ` (${c.weight})` : ''}: ${c.description}`).join('\n'),
      ``,
      `=== REQUIREMENTS THIS SECTION SHOULD ADDRESS ===`,
      requirements.map((r: any) => `[${r.category}${r.mandatory ? ' MANDATORY' : ''}] ${r.requirement}`).join('\n'),
      ``,
      `=== WIN THEMES THAT SHOULD BE INTEGRATED ===`,
      winThemes.join('\n'),
      ``,
      `Evaluate this section now. Return only the JSON object.`
    ].join('\n');

    const out = await callOpus(CRITIQUE_PROMPT, userContent, 2000);
    cost_usd = out.cost_usd;

    const parsed = parseJsonOrThrow(out.text, 'critique evaluation');

    return {
      scores: parsed.scores,
      weaknesses: parsed.weaknesses || [],
      overall_score: parsed.overall_score,
      requires_revision: parsed.requires_revision,
      cost_usd
    };
  } catch (e: any) {
    status = 'error';
    errorMsg = e.message;
    throw e;
  } finally {
    const duration_ms = Date.now() - start;
    try {
      await svc.from('bid_agent_runs').insert({
        bid_id: bidId,
        agent_name: 'critique_agent',
        status,
        input_summary: `Section: ${sectionKey}`,
        output_summary: status === 'success' ? `Score: ${cost_usd > 0 ? 'complete' : 'N/A'}` : undefined,
        error: errorMsg,
        cost_usd,
        duration_ms
      });
    } catch { /* non-fatal */ }
  }
}
