// Solicitation Extraction Agent
// Reads uploaded RFP/RFQ/Sources Sought documents and extracts structured fields
// for downstream agents (research, pricing, drafting, compliance).
// Uses Haiku — this is context loading + structured extraction, not reasoning.

import { callHaiku } from '../llm';
import { filesToContentBlocks, type UploadedFile } from '../extract';
import { createServiceClient } from '../supabase';

const SOLICITATION_EXTRACTION_PROMPT = `You are a federal contracting solicitation parser. You receive one or more documents that together constitute a government solicitation (RFP, RFQ, Sources Sought, Combined Synopsis/Solicitation, or similar procurement document).

Your job is to extract every structurally important field into a JSON object. Read the ENTIRE document before answering. Pay special attention to:
- The cover page or header block for agency, solicitation number, NAICS, set-aside
- Section B (Supplies or Services) for contract type and estimated value
- Section C (Description/Statement of Work/Performance Work Statement) for technical requirements
- Section F (Deliveries or Performance) for period of performance and place of performance
- Section H (Special Contract Requirements) for certifications, clearances, key personnel
- Section L (Instructions to Offerors) for format requirements and page limits
- Section M (Evaluation Factors for Award) for evaluation criteria, weights, and sub-factors

Return ONLY a JSON object with this exact schema. No preamble. No code fences. No explanation.

{
  "agency": string | null,
  "sub_agency": string | null,
  "solicitation_number": string | null,
  "contract_type": string | null,
  "naics": string | null,
  "psc_code": string | null,
  "set_aside": string | null,
  "due_date": string | null,
  "place_of_performance": string | null,
  "estimated_value": string | null,
  "period_of_performance": string | null,
  "extracted_requirements": [
    {
      "category": "technical" | "management" | "past_performance" | "pricing" | "certifications" | "format" | "key_personnel" | "security" | "other",
      "requirement": string,
      "mandatory": boolean,
      "source_section": string
    }
  ],
  "evaluation_criteria": [
    {
      "criterion": string,
      "weight": string | null,
      "description": string,
      "sub_factors": [string] | null
    }
  ],
  "win_themes": [string]
}

Field-level rules:
- agency: The top-level awarding agency (e.g., "Department of Veterans Affairs", "Department of Defense"). Not the contracting office.
- sub_agency: The contracting office or sub-component (e.g., "Network Contracting Office 15", "Army Corps of Engineers").
- solicitation_number: The exact solicitation or RFP number as printed on the document.
- contract_type: One of "FFP" (Firm Fixed Price), "T&M" (Time and Materials), "CR" (Cost Reimbursable), "IDIQ", "BPA", "CPFF", "CPAF", "CPIF", or the exact text if none of these match.
- naics: The six-digit NAICS code. If multiple are listed, use the primary one.
- psc_code: The Product Service Code if listed.
- set_aside: One of "SDVOSB", "VOSB", "8(a)", "HUBZone", "WOSB", "EDWOSB", "Small Business", "Full and Open", or the exact text.
- due_date: ISO 8601 format (YYYY-MM-DDTHH:MM:SSZ). Convert from any format in the document. If only a date is given, use T17:00:00Z (5 PM ET default).
- place_of_performance: City, State or "Remote" or "Various" as stated.
- estimated_value: Preserve the original format (e.g., "$2.5M", "Not to exceed $500,000", "Base year + 4 option years").
- period_of_performance: Preserve the original format (e.g., "12 months base + 4 x 12-month options", "5 years").
- extracted_requirements: Extract EVERY requirement you can identify — technical, management, past performance, pricing, certifications, format, key personnel, security. Be exhaustive. Each requirement should be one clear statement. Set mandatory=true if the document uses "shall", "must", "required", or "mandatory". Set mandatory=false for "should", "may", "desired", "preferred". source_section should reference where in the document it appears (e.g., "Section C, para 3.2", "Section L.4", "Attachment J-1").
- evaluation_criteria: Extract from Section M verbatim. Include the exact weighting language (e.g., "Technical is significantly more important than price", "Factors are listed in descending order of importance"). For each criterion, capture any sub-factors mentioned.
- win_themes: Generate 3-5 strategic themes the proposal should emphasize. Base these on: (1) the evaluation criteria weighting, (2) the agency's stated mission/needs, (3) gaps between requirements and typical incumbent capabilities, (4) SDVOSB-specific advantages, (5) anything the solicitation language emphasizes repeatedly.

If a field cannot be determined from the documents, set it to null. For arrays, return an empty array [] if no items can be extracted. Do not guess or fabricate.`;

export interface SolicitationExtraction {
  agency: string | null;
  sub_agency: string | null;
  solicitation_number: string | null;
  contract_type: string | null;
  naics: string | null;
  psc_code: string | null;
  set_aside: string | null;
  due_date: string | null;
  place_of_performance: string | null;
  estimated_value: string | null;
  period_of_performance: string | null;
  extracted_requirements: Array<{
    category: string;
    requirement: string;
    mandatory: boolean;
    source_section: string;
  }>;
  evaluation_criteria: Array<{
    criterion: string;
    weight: string | null;
    description: string;
    sub_factors: string[] | null;
  }>;
  win_themes: string[];
}

export async function extractSolicitation(
  bidId: string,
  files: UploadedFile[]
): Promise<{ extraction: SolicitationExtraction; cost_usd: number }> {
  const start = Date.now();
  const svc = createServiceClient();
  let cost_usd = 0;
  let status = 'success';
  let errorMsg: string | undefined;

  try {
    // Build content blocks from files
    const blocks = await filesToContentBlocks(files);
    blocks.push({
      type: 'text',
      text: 'Extract all solicitation fields from the documents above. Return only the JSON object.'
    });

    const out = await callHaiku(SOLICITATION_EXTRACTION_PROMPT, blocks as any, 8000);
    cost_usd = out.cost_usd;

    // Parse JSON — strip code fences if present
    let json = out.text.trim();
    json = json.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/, '');

    let extraction: SolicitationExtraction;
    try {
      extraction = JSON.parse(json);
    } catch {
      throw new Error(`Failed to parse solicitation extraction JSON. Raw output: ${out.text.slice(0, 500)}`);
    }

    // Normalize arrays that might be null
    extraction.extracted_requirements = extraction.extracted_requirements || [];
    extraction.evaluation_criteria = extraction.evaluation_criteria || [];
    extraction.win_themes = extraction.win_themes || [];

    return { extraction, cost_usd };
  } catch (e: any) {
    status = 'error';
    errorMsg = e.message;
    throw e;
  } finally {
    // Log agent run
    const duration_ms = Date.now() - start;
    try {
      await svc.from('bid_agent_runs').insert({
        bid_id: bidId,
        agent_name: 'solicitation_extractor',
        status,
        input_summary: `${files.length} file(s): ${files.map(f => f.name).join(', ')}`,
        output_summary: status === 'success' ? 'Extraction complete' : undefined,
        error: errorMsg,
        cost_usd,
        duration_ms
      });
    } catch { /* non-fatal logging */ }
  }
}
