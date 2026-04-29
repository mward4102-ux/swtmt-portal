// Drafting Agent — the heart of the bid generation system.
// Each proposal section has a dedicated system prompt, a model assignment (Opus or Haiku),
// and a target word count. The prompts are highly specific to federal contracting voice,
// SDVOSB positioning, and evaluator expectations.

import { callModel, OPUS_MODEL, HAIKU_MODEL, type ModelChoice, type LLMResult } from '../llm';

// ─────────────────────────────────────────────────────────
// Section definitions — order, model routing, target length
// ─────────────────────────────────────────────────────────
export interface SectionDef {
  key: string;
  title: string;
  order: number;
  model: ModelChoice;
  target_words: number;
}

export const SECTION_DEFINITIONS: SectionDef[] = [
  { key: 'executive_summary',  title: 'Executive Summary',                          order: 1, model: 'opus',  target_words: 500  },
  { key: 'company_overview',   title: 'Company Overview and SDVOSB Status',         order: 2, model: 'haiku', target_words: 600  },
  { key: 'technical_approach', title: 'Technical Approach',                         order: 3, model: 'opus',  target_words: 1500 },
  { key: 'management_approach',title: 'Management Approach',                        order: 4, model: 'opus',  target_words: 1200 },
  { key: 'past_performance',   title: 'Past Performance',                           order: 5, model: 'haiku', target_words: 900  },
  { key: 'staffing_plan',      title: 'Key Personnel and Staffing Plan',            order: 6, model: 'haiku', target_words: 800  },
  { key: 'quality_assurance',  title: 'Quality Assurance and Risk Management',      order: 7, model: 'haiku', target_words: 700  },
  { key: 'transition_plan',    title: 'Transition and Implementation Plan',         order: 8, model: 'haiku', target_words: 700  },
];

// ─────────────────────────────────────────────────────────
// Drafting context — everything the agent knows about this bid
// ─────────────────────────────────────────────────────────
export interface DraftingContext {
  company: any;
  solicitation: any;
  research_brief: any | null;
  pricing_analysis: any | null;
  past_performance_records: any[];
}

// ─────────────────────────────────────────────────────────
// Section-specific system prompts
// ─────────────────────────────────────────────────────────
function buildSectionPrompt(sectionKey: string, ctx: DraftingContext, customInstructions?: string): string {
  const sol = ctx.solicitation || {};
  const co = ctx.company || {};
  const rb = ctx.research_brief || {};
  const pa = ctx.pricing_analysis || {};
  const pp = ctx.past_performance_records || [];

  const companyName = co.name || 'the offeror';
  const solNum = sol.solicitation_number || '[solicitation number]';
  const agency = sol.agency || '[agency]';
  const state = co.state || '[state]';
  const naics = sol.naics || (co.naics || []).join(', ') || '[NAICS]';
  const setAside = sol.set_aside || 'SDVOSB';
  const requirements = sol.extracted_requirements || [];
  const criteria = sol.evaluation_criteria || [];
  const winThemes = sol.win_themes || [];
  const pop = sol.period_of_performance || '[period of performance]';
  const placeOfPerf = sol.place_of_performance || '[place of performance]';

  // Common context block injected into every prompt
  const commonContext = `
=== COMPANY PROFILE ===
Name: ${companyName}
SDVOSB Certified: ${co.sdvosb_certified ? 'Yes' : 'Pending'}
State: ${state}
UEI: ${co.uei || 'On file'}
CAGE Code: ${co.cage_code || 'On file'}
EIN: ${co.ein || 'On file'}
NAICS Codes: ${naics}
Capabilities: ${co.capabilities_summary || 'Federal contracting services'}

=== SOLICITATION ===
Number: ${solNum}
Agency: ${agency}
Contract Type: ${sol.contract_type || 'Not specified'}
Set-Aside: ${setAside}
NAICS: ${naics}
Period of Performance: ${pop}
Place of Performance: ${placeOfPerf}
Estimated Value: ${sol.estimated_value || 'Not specified'}

=== REQUIREMENTS (${requirements.length} total) ===
${requirements.map((r: any) => `[${r.category}${r.mandatory ? ' MANDATORY' : ''}] ${r.requirement} (${r.source_section})`).join('\n')}

=== EVALUATION CRITERIA ===
${criteria.map((c: any) => `${c.criterion}${c.weight ? ` (${c.weight})` : ''}: ${c.description}${c.sub_factors ? ` Sub-factors: ${c.sub_factors.join(', ')}` : ''}`).join('\n')}

=== WIN THEMES ===
${winThemes.map((t: string, i: number) => `${i + 1}. ${t}`).join('\n')}

=== RESEARCH BRIEF ===
Agency Mission: ${rb.agency_intel?.mission || 'Not available'}
Strategic Priorities: ${(rb.agency_intel?.strategic_priorities || []).join('; ')}
Contracting Patterns: ${rb.agency_intel?.contracting_patterns || 'Not available'}
Historical Awards: ${rb.historical_awards?.summary || 'Not available'}
Likely Incumbent: ${rb.incumbent_analysis?.likely_incumbent || 'Unknown'}
Incumbent Vulnerabilities: ${(rb.incumbent_analysis?.vulnerabilities || []).join('; ')}
Competitive Landscape: ${rb.market_context?.competitive_landscape || 'Not available'}
Common Win Themes: ${(rb.market_context?.common_win_themes || []).join('; ')}
`;

  const prompts: Record<string, string> = {

    executive_summary: `You are writing the Executive Summary for a federal proposal submitted by a Service-Disabled Veteran-Owned Small Business in response to ${solNum} from ${agency}. This is the first section the evaluator reads. It must be sharp, confident, specific, and free of generic GovCon language.

Structure (do not label these as headers, weave them as paragraphs):
- Opening: A single declarative sentence stating that ${companyName} is pleased to submit this proposal in response to ${solNum} for the stated requirement, and that as a ${setAside} firm located in ${state}, the company is uniquely positioned to deliver.
- Paragraph 1: Two-three sentences on the company's qualifications — emphasize SDVOSB status, NAICS alignment, capabilities tied directly to the solicitation requirements.
- Paragraph 2: Demonstrate understanding of the requirement by referencing 2-3 specific extracted requirements verbatim, then explaining the company's approach in one sentence each.
- Paragraph 3: State the company's three primary differentiators, weaving in the win themes from the solicitation analysis.
- Closing: A confidence statement that frames the company as the lowest-risk, highest-value choice for this specific procurement.

Voice: First person plural ("we", "our team"). Present tense. Active voice. No filler. No "we are pleased to" beyond the opening. No promises of "leveraging synergies." Concrete, not abstract.
Length: 400-600 words.`,

    company_overview: `Write the Company Overview section for ${companyName}. Lead with veteran ownership and SDVOSB certification status. Include formation details, state of registration (${state}), SAM.gov UEI (${co.uei || 'on file'}), CAGE code (${co.cage_code || 'on file'}), EIN (${co.ein || 'on file'}), NAICS codes (${naics}), and SDVOSB certification status. Cover the company's core capabilities in 2-3 sentences. Reference the leadership team's veteran credentials. End with a one-sentence positioning statement tying the company to this specific procurement (${solNum} from ${agency}). 600 words. Federal contracting voice. No filler.`,

    technical_approach: `You are writing the Technical Approach section — the most heavily weighted section in most federal evaluations. This determines whether the bid wins or loses.

Critical rules:
1. Map directly to the technical requirements in the extracted requirements list (filter for category=technical and category=other where the requirement is technical in nature). For EACH technical requirement, address how ${companyName} will meet it. Do not skip any.
2. Reference the evaluation criteria explicitly — if Section M mentions a specific factor, your subsection should address it by name.
3. Use second-level subsection headers (markdown ## format) for each major requirement area.
4. For each subsection, write in this pattern: (a) acknowledge the requirement by paraphrasing it, (b) describe ${companyName}'s specific methodology or technical approach, (c) name relevant standards, frameworks, or technologies the approach uses, (d) explain why this approach reduces risk or improves outcomes vs alternatives.
5. Reference industry standards by name where appropriate: NIST 800-53 for security, ISO 9001 for quality, ITIL for service management, PMI PMBOK for project management, FAR clauses for compliance.
6. Weave in the win themes naturally — never list them as bullets, embed them in the prose.
7. Reference historical awards from the research brief if relevant ("comparable contracts in this NAICS category have averaged certain performance periods, and our approach is designed to meet that timeline").
8. End with a "Why This Approach Succeeds" subsection (about 150 words) that summarizes the three biggest reasons the technical approach is the right choice for this specific procurement.

Voice: First person plural. Confident but not arrogant. Specific not generic. Federal contracting standard.
Length: 1300-1700 words.
Do NOT invent specific dollar amounts, specific people's names, specific past contract numbers, or specific tools/products the company uses unless they are provided in the company profile or research brief.`,

    management_approach: `Write the Management Approach section for ${companyName}'s proposal in response to ${solNum}. Address management requirements from the extracted requirements (filter for category=management). Cover: project management methodology (reference PMI PMBOK or Agile depending on the solicitation tone), project organization and reporting structure, communication cadence with the COR/contracting officer, risk management framework, change management process, schedule management approach, deliverable acceptance process, escalation paths.

Use ## subsection headers for each major topic. Reference the win themes. Reference relevant evaluation criteria.
1100-1400 words. Same voice rules as other sections: first person plural, confident, specific, federal contracting standard.`,

    past_performance: `Write the Past Performance section. Use the following past performance records if available:

${pp.length > 0
  ? pp.map((r: any, i: number) => `Record ${i + 1}: Customer: ${r.customer_name} (${r.customer_type || 'N/A'}), Contract: ${r.contract_number || 'N/A'}, Period: ${r.period_of_performance_start || 'N/A'} to ${r.period_of_performance_end || 'N/A'}, Value: $${r.contract_value || 'N/A'}, Scope: ${r.scope || 'N/A'}, Outcome: ${r.outcome || 'N/A'}, NAICS: ${(r.relevant_naics || []).join(', ')}`).join('\n\n')
  : 'No past performance records on file.'}

If past performance records were provided above, format each as: Customer (name and type), Contract Number, Period of Performance, Contract Value, Scope, Outcome, and Relevance to the current procurement (${solNum}).

If no records or fewer than 3 were provided, generate plausible representative projects based on the company's NAICS (${naics}) and capabilities. Mark these clearly as "Representative Project" in the heading. Each representative project needs: Customer Type (federal agency, commercial, or state/local), Contract Type, Period of Performance (as a range, not specific dates), Approximate Value Range, Scope (3-4 sentences), Outcome (specific quantified results — percentage improvements, dollars saved, schedule beats), and Relevance.

Three projects total. 800-1000 words. For quantified results, use realistic federal contracting metrics — "Delivered on schedule and within budget" beats fabricated claims of "$50M savings."`,

    staffing_plan: `Write the Key Personnel and Staffing Plan section. Identify 4-6 key labor categories needed based on the solicitation requirements.${pa?.labor_category_estimates ? ` Use these labor categories from the pricing analysis: ${JSON.stringify(pa.labor_category_estimates.map((l: any) => l.category))}` : ''} For each labor category: role title, required qualifications, required clearances if mentioned in the solicitation, required certifications, and key responsibilities. Include a staffing approach section covering recruitment, retention, surge capacity, and key personnel substitution policy per FAR 52.237-3. Reference any security clearance requirements from the extracted requirements.
700-900 words. Federal contracting voice.`,

    quality_assurance: `Write the Quality Assurance and Risk Management section for ${companyName}'s proposal. Cover: quality management framework (ISO 9001 alignment if NAICS appropriate), quality control plan with inspection and acceptance criteria, performance metrics and reporting cadence, continuous improvement methodology. Then address the top 5 risks for this specific procurement with mitigation strategies for each — pull risks from the extracted requirements and the market context (competitive landscape, incumbent vulnerabilities). Include a corrective action process section.
600-800 words. Federal contracting voice.`,

    transition_plan: `Write the Transition and Implementation Plan section. Cover a phased approach:
- Phase 1 (Days 0-30): Mobilization, kickoff meeting, knowledge transfer from incumbent if applicable, security clearance processing, system access requests, initial staffing
- Phase 2 (Days 31-60): Full operational capability, baseline establishment, initial deliverables, SLA measurement begins
- Phase 3 (Days 61-90): Steady state operations, continuous improvement initiation, first quarterly performance review

Address acceptance criteria for go-live, knowledge management and documentation handover, and contingency plans if transition encounters obstacles. Reference the period of performance (${pop}) and place of performance (${placeOfPerf}).
600-800 words. Federal contracting voice.`
  };

  const sectionPrompt = prompts[sectionKey];
  if (!sectionPrompt) {
    throw new Error(`No prompt defined for section key: ${sectionKey}`);
  }

  let fullPrompt = sectionPrompt + '\n\n' + commonContext;

  if (customInstructions) {
    fullPrompt += `\n\n=== ADDITIONAL INSTRUCTIONS FROM USER ===\n${customInstructions}\n`;
  }

  fullPrompt += `\nReturn only the section content. No preamble. No commentary. No "Here is the section". No markdown code fences. Begin directly with the prose.`;

  return fullPrompt;
}

// ─────────────────────────────────────────────────────────
// Draft a single section
// ─────────────────────────────────────────────────────────
export interface DraftResult {
  content: string;
  word_count: number;
  model_used: string;
  cost_usd: number;
  prompt: string;
}

export async function draftSection(
  sectionKey: string,
  context: DraftingContext,
  customInstructions?: string
): Promise<DraftResult> {
  const def = SECTION_DEFINITIONS.find(s => s.key === sectionKey);
  if (!def) throw new Error(`Unknown section key: ${sectionKey}`);

  const prompt = buildSectionPrompt(sectionKey, context, customInstructions);
  const maxTokens = def.target_words * 2; // rough buffer for token-to-word ratio

  const result: LLMResult = await callModel(
    def.model,
    prompt,
    `Write the ${def.title} section now.`,
    maxTokens
  );

  // Strip any accidental code fences or preamble
  let content = result.text.trim();
  content = content.replace(/^```[a-z]*\s*/i, '').replace(/\s*```$/, '');

  // Count words
  const word_count = content.split(/\s+/).filter(w => w.length > 0).length;

  const modelString = def.model === 'opus' ? OPUS_MODEL : HAIKU_MODEL;

  return {
    content,
    word_count,
    model_used: modelString,
    cost_usd: result.cost_usd,
    prompt
  };
}
