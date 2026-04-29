// Revision Agent
// Takes a drafted section and a critique, revises the section to address weaknesses.
// Uses the same model that generated the original section (Opus or Haiku).

import { callModel, OPUS_MODEL, HAIKU_MODEL, type LLMResult } from '../llm';
import { createServiceClient } from '../supabase';
import { SECTION_DEFINITIONS, type DraftingContext } from './drafting-agent';

const REVISION_PROMPT = `You previously wrote a proposal section that received the following critique from a Source Selection Evaluation Board member. Your job is to revise the section to address every weakness identified while maintaining the overall structure and approximate length.

Revision rules:
1. Address EVERY weakness listed in the critique. Do not skip any.
2. Strengthen specificity — replace generic language with concrete details, named standards, and specific methodologies.
3. Integrate win themes more directly where the critique identifies gaps.
4. Address evaluation criteria more explicitly where the critique calls out missing coverage.
5. Maintain federal contracting voice: first person plural, active voice, confident.
6. Maintain approximate word count — do not significantly shorten or lengthen the section.
7. Do not add a preamble like "Here is the revised section" — begin directly with the prose.
8. Do not add markdown code fences.

Return only the revised section content.`;

export interface RevisionResult {
  content: string;
  word_count: number;
  model_used: string;
  cost_usd: number;
}

export async function reviseSection(
  sectionKey: string,
  originalContent: string,
  critique: { weaknesses: Array<{ weakness: string; recommendation: string }>; scores: any },
  context: DraftingContext,
  bidId: string
): Promise<RevisionResult> {
  const start = Date.now();
  const svc = createServiceClient();
  let cost_usd = 0;
  let status = 'success';
  let errorMsg: string | undefined;

  try {
    const def = SECTION_DEFINITIONS.find(s => s.key === sectionKey);
    if (!def) throw new Error(`Unknown section key: ${sectionKey}`);

    const sol = context.solicitation || {};
    const winThemes = sol.win_themes || [];
    const criteria = sol.evaluation_criteria || [];

    const userContent = [
      `=== ORIGINAL SECTION ===`,
      originalContent,
      ``,
      `=== CRITIQUE ===`,
      `Overall Score: ${critique.scores ? Object.values(critique.scores).map((s: any) => `${s.score}/10`).join(', ') : 'N/A'}`,
      ``,
      `Weaknesses to address:`,
      ...critique.weaknesses.map((w, i) =>
        `${i + 1}. WEAKNESS: ${w.weakness}\n   RECOMMENDATION: ${w.recommendation}`
      ),
      ``,
      `=== WIN THEMES TO INTEGRATE ===`,
      winThemes.join('\n'),
      ``,
      `=== EVALUATION CRITERIA ===`,
      criteria.map((c: any) => `${c.criterion}: ${c.description}`).join('\n'),
      ``,
      `Revise the section now. Address every weakness. Return only the revised content.`
    ].join('\n');

    const maxTokens = def.target_words * 2;
    const result: LLMResult = await callModel(def.model, REVISION_PROMPT, userContent, maxTokens);
    cost_usd = result.cost_usd;

    let content = result.text.trim();
    content = content.replace(/^```[a-z]*\s*/i, '').replace(/\s*```$/, '');

    const word_count = content.split(/\s+/).filter(w => w.length > 0).length;
    const modelString = def.model === 'opus' ? OPUS_MODEL : HAIKU_MODEL;

    return { content, word_count, model_used: modelString, cost_usd };
  } catch (e: any) {
    status = 'error';
    errorMsg = e.message;
    throw e;
  } finally {
    const duration_ms = Date.now() - start;
    try {
      await svc.from('bid_agent_runs').insert({
        bid_id: bidId,
        agent_name: 'revision_agent',
        status,
        input_summary: `Section: ${sectionKey}`,
        output_summary: status === 'success' ? 'Revision complete' : undefined,
        error: errorMsg,
        cost_usd,
        duration_ms
      });
    } catch { /* non-fatal */ }
  }
}
