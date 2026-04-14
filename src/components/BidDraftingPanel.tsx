'use client';
import { useState, useCallback, useRef } from 'react';

// ─────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────
interface Solicitation {
  solicitation_number: string;
  agency: string;
  naics: string;
  set_aside: string;
  due_date: string;
  contract_type: string;
  extracted_requirements: any[];
  evaluation_criteria: any[];
  win_themes: string[];
}

interface BidSection {
  id: string;
  section_key: string;
  section_title: string;
  section_order: number;
  status: string;
  content: string | null;
  critique: string | null;
  word_count: number | null;
  model_used: string | null;
  cost_usd: number | null;
}

interface Props {
  bidId: string;
  companyId: string;
  solicitation: Solicitation | null;
  researchBrief: any | null;
  pricingAnalysis: any | null;
  sections: BidSection[];
  totalBidCost: number;
}

type PipelineStage = 'idle' | 'uploading' | 'researching' | 'pricing' | 'drafting' | 'compliance' | 'assembling';

const POLL_INTERVAL_MS = 5_000;
const POLL_MAX_MS = 5 * 60 * 1_000; // 5 minute safety cutoff

// ─────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────
export function BidDraftingPanel({
  bidId, companyId, solicitation: initSol, researchBrief: initRB,
  pricingAnalysis: initPA, sections: initSections, totalBidCost: initCost
}: Props) {
  const [sol, setSol] = useState<Solicitation | null>(initSol);
  const [rb, setRB] = useState<any>(initRB);
  const [pa, setPA] = useState<any>(initPA);
  const [sections, setSections] = useState<BidSection[]>(initSections);
  const [cost, setCost] = useState(initCost);
  const [stage, setStage] = useState<PipelineStage>('idle');
  const [error, setError] = useState<string | null>(null);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [complianceResult, setComplianceResult] = useState<any>(null);
  const [draftingProgress, setDraftingProgress] = useState('');
  const [agentElapsed, setAgentElapsed] = useState(0);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ─── Helpers ───
  const api = useCallback(async (path: string, opts?: RequestInit) => {
    const r = await fetch(path, { method: 'POST', ...opts });
    const j = await r.json();
    // 202 is expected for background agents — not an error
    if (!r.ok && r.status !== 202) throw new Error(j.error || `Request failed (${r.status})`);
    return { ...j, httpStatus: r.status };
  }, []);

  // Stop any active polling loop
  function stopPolling() {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }

  // Poll /api/bids/{id}/agent-status?agent=<name> until success/error or timeout
  function pollAgentStatus(
    agentName: string,
    onSuccess: () => Promise<void>,
    onError: (msg: string) => void
  ) {
    const startTime = Date.now();
    setAgentElapsed(0);

    pollRef.current = setInterval(async () => {
      const elapsed = Date.now() - startTime;
      setAgentElapsed(Math.round(elapsed / 1000));

      // Safety cutoff
      if (elapsed > POLL_MAX_MS) {
        stopPolling();
        onError('Agent timed out after 5 minutes. Check the Netlify function logs for details.');
        return;
      }

      try {
        const r = await fetch(`/api/bids/${bidId}/agent-status?agent=${agentName}`);
        if (!r.ok) return; // retry next interval
        const j = await r.json();

        if (j.status === 'success') {
          stopPolling();
          await onSuccess();
        } else if (j.status === 'error') {
          stopPolling();
          onError(j.error || 'Agent failed with unknown error');
        }
        // 'running' or 'not_started' → keep polling
      } catch {
        // Network error — retry next interval
      }
    }, POLL_INTERVAL_MS);
  }

  // ─── Solicitation Upload (sync — fast enough) ───
  async function uploadSolicitation(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    setStage('uploading');
    setError(null);
    try {
      const j = await api(`/api/bids/${bidId}/solicitation`, { body: fd });
      setSol(j.extraction);
      setCost(c => c + (j.cost_usd || 0));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setStage('idle');
    }
  }

  // ─── Research (background + polling) ───
  async function runResearch() {
    setStage('researching');
    setError(null);
    try {
      const j = await api(`/api/bids/${bidId}/research`);

      if (j.httpStatus === 202) {
        // Background function launched — poll for completion
        pollAgentStatus(
          'research_agent',
          async () => {
            // On success: reload research brief from the database via page refresh data
            const r = await fetch(`/api/bids/${bidId}/agent-status?agent=research_agent`);
            const status = await r.json();
            setCost(c => c + (status.cost_usd || 0));
            // Reload the page to pull fresh research_brief from server
            window.location.reload();
          },
          (msg) => {
            setError(msg);
            setStage('idle');
          }
        );
      } else {
        // Fallback: if the response wasn't 202, treat as synchronous (local dev)
        setRB(j.brief);
        setStage('idle');
      }
    } catch (err: any) {
      setError(err.message);
      setStage('idle');
    }
  }

  // ─── Pricing (background + polling) ───
  async function runPricing() {
    setStage('pricing');
    setError(null);
    try {
      const j = await api(`/api/bids/${bidId}/pricing`);

      if (j.httpStatus === 202) {
        pollAgentStatus(
          'pricing_agent',
          async () => {
            const r = await fetch(`/api/bids/${bidId}/agent-status?agent=pricing_agent`);
            const status = await r.json();
            setCost(c => c + (status.cost_usd || 0));
            window.location.reload();
          },
          (msg) => {
            setError(msg);
            setStage('idle');
          }
        );
      } else {
        setPA(j.analysis);
        setStage('idle');
      }
    } catch (err: any) {
      setError(err.message);
      setStage('idle');
    }
  }

  // ─── Full Drafting (polling pattern — unchanged) ───
  async function startDrafting() {
    setStage('drafting');
    setError(null);
    try {
      // Step 1: Initialize (runs research + pricing if needed, queues sections)
      setDraftingProgress('Initializing pipeline...');
      const init = await api(`/api/bids/${bidId}/draft-full-bid`, {
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({})
      });

      setDraftingProgress(`${init.sections_queued} sections queued. Drafting...`);

      // Step 2: Poll draft-next-section until all done
      let done = false;
      while (!done) {
        const result = await api(`/api/bids/${bidId}/draft-next-section`, {
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({})
        });

        if (result.done) {
          done = true;
        } else {
          setCost(c => c + (result.cost_usd || 0));
          setDraftingProgress(`Drafted: ${result.section_key} (${result.word_count} words). ${result.next_pending_count} remaining.`);

          // Refresh sections from server
          await refreshSections();
        }
      }

      setDraftingProgress('All sections drafted.');
      await refreshSections();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setStage('idle');
    }
  }

  // ─── Refresh sections ───
  async function refreshSections() {
    try {
      const r = await fetch(`/api/bids/${bidId}/sections`);
      if (r.ok) {
        const j = await r.json();
        if (j.sections) setSections(j.sections);
      }
    } catch { /* swallow */ }
  }

  // ─── Regenerate single section ───
  async function regenerate(sectionKey: string) {
    setError(null);
    try {
      const j = await api(`/api/bids/${bidId}/sections/${sectionKey}/regenerate`, {
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({})
      });
      setCost(c => c + (j.cost_usd || 0));
      await refreshSections();
    } catch (err: any) {
      setError(err.message);
    }
  }

  // ─── Compliance (background + polling) ───
  async function runCompliance() {
    setStage('compliance');
    setError(null);
    try {
      const j = await api(`/api/bids/${bidId}/final-compliance`);

      if (j.httpStatus === 202) {
        pollAgentStatus(
          'compliance_agent',
          async () => {
            // Compliance result is stored as a bid_event — reload page to get it
            const r = await fetch(`/api/bids/${bidId}/agent-status?agent=compliance_agent`);
            const status = await r.json();
            setCost(c => c + (status.cost_usd || 0));
            window.location.reload();
          },
          (msg) => {
            setError(msg);
            setStage('idle');
          }
        );
      } else {
        // Synchronous fallback (local dev)
        setComplianceResult(j);
        setCost(c => c + (j.cost_usd || 0));
        setStage('idle');
      }
    } catch (err: any) {
      setError(err.message);
      setStage('idle');
    }
  }

  // ─── Assemble (sync — DOCX generation is fast) ───
  async function assemble() {
    setStage('assembling');
    setError(null);
    try {
      await api(`/api/bids/${bidId}/assemble`);
      window.location.reload(); // Reload to show new document in documents panel
    } catch (err: any) {
      setError(err.message);
    } finally {
      setStage('idle');
    }
  }

  // ─── UI helpers ───
  const readySections = sections.filter(s => s.status === 'draft_ready' || s.status === 'approved');
  const allDrafted = sections.length > 0 && readySections.length === sections.length;
  const busy = stage !== 'idle';

  function statusBadge(status: string) {
    const colors: Record<string, string> = {
      pending: 'bg-slate-100 text-slate-600',
      researching: 'bg-blue-100 text-blue-700',
      drafting: 'bg-amber-100 text-amber-700',
      critiquing: 'bg-purple-100 text-purple-700',
      revised: 'bg-indigo-100 text-indigo-700',
      draft_ready: 'bg-green-100 text-green-700',
      approved: 'bg-emerald-100 text-emerald-800',
      rejected: 'bg-red-100 text-red-700'
    };
    return (
      <span className={`text-xs px-2 py-0.5 rounded ${colors[status] || 'bg-slate-100 text-slate-600'}`}>
        {status.replace('_', ' ')}
      </span>
    );
  }

  // Label for the agent running in the background
  const stageLabels: Record<PipelineStage, string> = {
    idle: '', uploading: 'Extracting solicitation',
    researching: 'Research agent', pricing: 'Pricing agent',
    drafting: 'Drafting', compliance: 'Compliance check', assembling: 'Assembling document'
  };

  // ─── RENDER ───
  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-sm">
      <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between">
        <h2 className="font-semibold text-ink">Bid Drafting Pipeline</h2>
        <span className="text-xs text-slate-500">Cost: ${cost.toFixed(2)}</span>
      </div>

      <div className="p-4 space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded p-3 text-sm text-red-800">
            {error}
            <button onClick={() => setError(null)} className="ml-2 text-red-500 underline text-xs">dismiss</button>
          </div>
        )}

        {/* ─── Background agent progress indicator ─── */}
        {busy && (stage === 'researching' || stage === 'pricing' || stage === 'compliance') && agentElapsed > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded p-3 text-sm text-blue-800 flex items-center gap-2">
            <svg className="animate-spin h-4 w-4 text-blue-600" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            {stageLabels[stage]} running... ({agentElapsed}s elapsed)
          </div>
        )}

        {/* ─── STEP 1: Upload Solicitation ─── */}
        {!sol && (
          <div className="border border-dashed border-slate-300 rounded-lg p-4">
            <h3 className="text-sm font-medium text-ink mb-2">Step 1: Upload Solicitation</h3>
            <p className="text-xs text-slate-500 mb-3">Upload the RFP, RFQ, or Sources Sought document to begin.</p>
            <form onSubmit={uploadSolicitation}>
              <input type="file" name="files" multiple accept=".pdf,.docx,.doc,.txt" className="text-sm mb-2" />
              <button
                type="submit"
                disabled={busy}
                className="bg-navy hover:bg-ink text-white px-3 py-1.5 rounded text-sm disabled:opacity-50"
              >
                {stage === 'uploading' ? 'Extracting...' : 'Upload & Extract'}
              </button>
            </form>
          </div>
        )}

        {/* ─── Solicitation Summary ─── */}
        {sol && (
          <details className="border border-slate-200 rounded-lg">
            <summary className="px-4 py-2 text-sm font-medium text-ink cursor-pointer hover:bg-slate-50">
              Solicitation: {sol.solicitation_number || 'Extracted'} — {sol.agency || 'N/A'} — {(sol.extracted_requirements || []).length} requirements
            </summary>
            <div className="px-4 pb-3 text-xs text-slate-600 space-y-1">
              <div>NAICS: {sol.naics} · Set-Aside: {sol.set_aside} · Type: {sol.contract_type}</div>
              <div>Due: {sol.due_date ? new Date(sol.due_date).toLocaleDateString() : 'TBD'}</div>
              {sol.win_themes?.length > 0 && (
                <div>Win Themes: {sol.win_themes.join(' · ')}</div>
              )}
            </div>
          </details>
        )}

        {/* ─── STEP 2: Research ─── */}
        {sol && !rb && (
          <button
            onClick={runResearch}
            disabled={busy}
            className="w-full bg-navy hover:bg-ink text-white py-2 rounded text-sm font-medium disabled:opacity-50"
          >
            {stage === 'researching' ? `Running Research Agent... (${agentElapsed}s)` : 'Step 2: Run Research Agent'}
          </button>
        )}

        {rb && (
          <details className="border border-slate-200 rounded-lg">
            <summary className="px-4 py-2 text-sm font-medium text-ink cursor-pointer hover:bg-slate-50">
              Research Brief — {rb.historical_awards?.count || 0} historical awards analyzed
            </summary>
            <div className="px-4 pb-3 text-xs text-slate-600 space-y-1">
              <div>Agency: {rb.agency_intel?.mission?.slice(0, 200)}</div>
              <div>Likely Incumbent: {rb.incumbent_analysis?.likely_incumbent || 'Unknown'}</div>
              <div>Landscape: {rb.market_context?.competitive_landscape?.slice(0, 200)}</div>
            </div>
          </details>
        )}

        {/* ─── STEP 3: Pricing ─── */}
        {sol && rb && !pa && (
          <button
            onClick={runPricing}
            disabled={busy}
            className="w-full bg-navy hover:bg-ink text-white py-2 rounded text-sm font-medium disabled:opacity-50"
          >
            {stage === 'pricing' ? `Running Pricing Agent... (${agentElapsed}s)` : 'Step 3: Run Pricing Agent'}
          </button>
        )}

        {pa && (
          <details className="border border-slate-200 rounded-lg">
            <summary className="px-4 py-2 text-sm font-medium text-ink cursor-pointer hover:bg-slate-50">
              Pricing: Aggressive ${Number(pa.aggressive_price || 0).toLocaleString()} · Target ${Number(pa.target_price || 0).toLocaleString()} · Conservative ${Number(pa.conservative_price || 0).toLocaleString()}
            </summary>
            <div className="px-4 pb-3 text-xs text-slate-600">
              {pa.fee_structure || ''}
            </div>
          </details>
        )}

        {/* ─── STEP 4: Draft Full Bid ─── */}
        {sol && rb && pa && sections.length === 0 && (
          <button
            onClick={startDrafting}
            disabled={busy}
            className="w-full bg-gold hover:bg-amber-600 text-ink py-2 rounded text-sm font-bold disabled:opacity-50"
          >
            {stage === 'drafting' ? draftingProgress : 'Step 4: Draft Full Bid'}
          </button>
        )}

        {stage === 'drafting' && draftingProgress && (
          <div className="text-xs text-slate-500 text-center">{draftingProgress}</div>
        )}

        {/* ─── Section Cards ─── */}
        {sections.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-ink">Sections</h3>
            {/* Progress bar */}
            <div className="w-full bg-slate-100 rounded-full h-2">
              <div
                className="bg-green-500 h-2 rounded-full transition-all"
                style={{ width: `${sections.length > 0 ? (readySections.length / sections.length) * 100 : 0}%` }}
              />
            </div>
            <div className="text-xs text-slate-500 text-right">{readySections.length}/{sections.length} complete</div>

            {sections.map(s => (
              <div key={s.id} className="border border-slate-200 rounded-lg">
                <div
                  className="px-3 py-2 flex items-center justify-between cursor-pointer hover:bg-slate-50"
                  onClick={() => setExpandedSection(expandedSection === s.section_key ? null : s.section_key)}
                >
                  <div className="flex items-center gap-2">
                    {statusBadge(s.status)}
                    <span className="text-sm font-medium text-ink">{s.section_title}</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-500">
                    {s.word_count && <span>{s.word_count} words</span>}
                    {s.model_used && <span>{s.model_used.includes('opus') ? 'Opus' : 'Haiku'}</span>}
                    {s.cost_usd != null && <span>${Number(s.cost_usd).toFixed(3)}</span>}
                    <span>{expandedSection === s.section_key ? '▲' : '▼'}</span>
                  </div>
                </div>

                {expandedSection === s.section_key && s.content && (
                  <div className="px-3 pb-3 border-t border-slate-100">
                    <div className="text-xs text-slate-700 mt-2 whitespace-pre-wrap max-h-64 overflow-y-auto leading-relaxed">
                      {s.content}
                    </div>
                    <div className="mt-2 flex gap-2">
                      <button
                        onClick={() => regenerate(s.section_key)}
                        className="text-xs text-navy hover:text-gold underline"
                      >
                        Regenerate
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* Continue drafting if some sections still pending */}
            {!allDrafted && sections.some(s => s.status === 'pending') && stage !== 'drafting' && (
              <button
                onClick={startDrafting}
                disabled={busy}
                className="w-full bg-navy hover:bg-ink text-white py-2 rounded text-sm font-medium disabled:opacity-50"
              >
                Continue Drafting Remaining Sections
              </button>
            )}
          </div>
        )}

        {/* ─── STEP 5: Final Compliance + Assemble ─── */}
        {allDrafted && (
          <div className="space-y-2 pt-2 border-t border-slate-200">
            <div className="flex gap-2">
              <button
                onClick={runCompliance}
                disabled={busy}
                className="flex-1 bg-navy hover:bg-ink text-white py-2 rounded text-sm font-medium disabled:opacity-50"
              >
                {stage === 'compliance' ? `Running Compliance... (${agentElapsed}s)` : 'Run Final Compliance Check'}
              </button>
              <button
                onClick={assemble}
                disabled={busy}
                className="flex-1 bg-gold hover:bg-amber-600 text-ink py-2 rounded text-sm font-bold disabled:opacity-50"
              >
                {stage === 'assembling' ? 'Assembling...' : 'Assemble Final Document'}
              </button>
            </div>
          </div>
        )}

        {/* ─── Compliance Result ─── */}
        {complianceResult && (
          <div className={`border rounded-lg p-3 ${
            complianceResult.submission_readiness === 'ready' ? 'border-green-300 bg-green-50' :
            complianceResult.submission_readiness === 'needs_revision' ? 'border-amber-300 bg-amber-50' :
            'border-red-300 bg-red-50'
          }`}>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Compliance Score: {complianceResult.compliance_score}/100</span>
              <span className={`text-xs px-2 py-0.5 rounded font-medium ${
                complianceResult.submission_readiness === 'ready' ? 'bg-green-200 text-green-800' :
                complianceResult.submission_readiness === 'needs_revision' ? 'bg-amber-200 text-amber-800' :
                'bg-red-200 text-red-800'
              }`}>
                {complianceResult.submission_readiness}
              </span>
            </div>
            <p className="text-xs text-slate-700">{complianceResult.summary}</p>
            {complianceResult.requirement_coverage?.missing?.length > 0 && (
              <div className="mt-2 text-xs text-red-700">
                Missing requirements: {complianceResult.requirement_coverage.missing.map((m: any) => m.requirement).join('; ')}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
