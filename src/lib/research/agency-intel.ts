// Agency intelligence gatherer
// Uses Anthropic web search to find agency strategic plans, OIG reports,
// and contracting forecasts for a given federal agency.

import { callHaiku } from '../llm';

export interface AgencyContext {
  strategic_priorities: string[];
  recent_reports: string[];
  contracting_forecast: string;
  mission_summary: string;
}

const AGENCY_INTEL_PROMPT = `You are a federal contracting intelligence analyst. Given an agency name, use web search to find current information about:
1. The agency's mission and strategic priorities (from their strategic plan or .gov website)
2. Recent OIG (Office of Inspector General) reports or GAO audits relevant to their contracting
3. Any published contracting forecasts, procurement forecasts, or acquisition plans
4. The agency's IT modernization or service delivery priorities if applicable

Return ONLY a JSON object with this schema. No preamble. No code fences.

{
  "strategic_priorities": [string],
  "recent_reports": [string],
  "contracting_forecast": string,
  "mission_summary": string
}

Rules:
- strategic_priorities: 3-5 bullet points summarizing what the agency is focused on
- recent_reports: 2-4 one-sentence summaries of recent OIG/GAO findings related to contracting or service delivery
- contracting_forecast: A paragraph summarizing the agency's expected contracting activity
- mission_summary: 2-3 sentences on what the agency does and who it serves
- If you cannot find specific information for a field, provide a reasonable summary based on publicly known information about the agency. Federal agencies are public institutions with published missions.
- Do not fabricate specific dollar amounts, contract numbers, or report titles. Summarize what you find or what is generally known.`;

export async function fetchAgencyContext(agency: string): Promise<AgencyContext> {
  if (!agency) {
    return {
      strategic_priorities: [],
      recent_reports: [],
      contracting_forecast: 'No agency specified.',
      mission_summary: 'No agency specified.'
    };
  }

  try {
    const out = await callHaiku(
      AGENCY_INTEL_PROMPT,
      `Research the following federal agency: ${agency}\n\nFind their strategic priorities, recent OIG/GAO reports, and contracting forecast. Return the JSON object.`,
      3000,
      true // enable web search
    );

    let json = out.text.trim();
    json = json.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/, '');

    const parsed = JSON.parse(json);
    return {
      strategic_priorities: parsed.strategic_priorities || [],
      recent_reports: parsed.recent_reports || [],
      contracting_forecast: parsed.contracting_forecast || '',
      mission_summary: parsed.mission_summary || ''
    };
  } catch (e: any) {
    console.warn(`Agency intel fetch failed for "${agency}": ${e.message}`);
    return {
      strategic_priorities: [],
      recent_reports: [],
      contracting_forecast: `Unable to retrieve contracting forecast for ${agency}.`,
      mission_summary: `${agency} is a federal government agency.`
    };
  }
}
