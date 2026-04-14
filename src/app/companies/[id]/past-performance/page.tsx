'use client';
import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

interface PastPerformanceRecord {
  id: string;
  customer_name: string;
  customer_type: string | null;
  contract_number: string | null;
  period_of_performance_start: string | null;
  period_of_performance_end: string | null;
  contract_value: number | null;
  scope: string | null;
  outcome: string | null;
  relevant_naics: string[];
  poc_name: string | null;
  poc_email: string | null;
  poc_phone: string | null;
}

const EMPTY_FORM = {
  customer_name: '',
  customer_type: '',
  contract_number: '',
  period_of_performance_start: '',
  period_of_performance_end: '',
  contract_value: '',
  scope: '',
  outcome: '',
  relevant_naics: '',
  poc_name: '',
  poc_email: '',
  poc_phone: '',
};

export default function PastPerformancePage() {
  const params = useParams<{ id: string }>();
  const companyId = params.id;

  const [records, setRecords] = useState<PastPerformanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const loadRecords = useCallback(async () => {
    try {
      const r = await fetch(`/api/companies/${companyId}/past-performance`);
      if (r.ok) {
        const j = await r.json();
        setRecords(j.records || []);
      }
    } catch { /* swallow */ }
    setLoading(false);
  }, [companyId]);

  useEffect(() => { loadRecords(); }, [loadRecords]);

  function updateField(field: string, value: string) {
    setForm(f => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const payload: Record<string, unknown> = {
        customer_name: form.customer_name,
      };
      if (form.customer_type) payload.customer_type = form.customer_type;
      if (form.contract_number) payload.contract_number = form.contract_number;
      if (form.period_of_performance_start) payload.period_of_performance_start = form.period_of_performance_start;
      if (form.period_of_performance_end) payload.period_of_performance_end = form.period_of_performance_end;
      if (form.contract_value) payload.contract_value = parseFloat(form.contract_value);
      if (form.scope) payload.scope = form.scope;
      if (form.outcome) payload.outcome = form.outcome;
      if (form.relevant_naics) payload.relevant_naics = form.relevant_naics.split(',').map(s => s.trim()).filter(Boolean);
      if (form.poc_name) payload.poc_name = form.poc_name;
      if (form.poc_email) payload.poc_email = form.poc_email;
      if (form.poc_phone) payload.poc_phone = form.poc_phone;

      const r = await fetch(`/api/companies/${companyId}/past-performance`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const j = await r.json();
      if (!r.ok) throw new Error(typeof j.error === 'string' ? j.error : JSON.stringify(j.error));

      setForm(EMPTY_FORM);
      setShowForm(false);
      await loadRecords();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-6 bg-slate-200 rounded w-48 animate-pulse" />
        <div className="h-40 bg-slate-200 rounded animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/companies" className="text-sm text-slate-500 hover:text-navy">&larr; Companies</Link>
          <h1 className="text-2xl font-bold text-ink mt-2">Past Performance Library</h1>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-navy hover:bg-ink text-white px-4 py-2 rounded text-sm font-medium"
        >
          {showForm ? 'Cancel' : '+ Add Record'}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded p-3 text-sm text-red-800">
          {error}
          <button onClick={() => setError(null)} className="ml-2 text-red-500 underline text-xs">dismiss</button>
        </div>
      )}

      {/* ─── Add Form ─── */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-lg p-4 space-y-3">
          <h3 className="font-semibold text-ink text-sm">New Past Performance Record</h3>

          <div className="grid md:grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-600 block mb-1">Customer Name *</label>
              <input
                value={form.customer_name}
                onChange={e => updateField('customer_name', e.target.value)}
                required
                className="w-full border border-slate-300 rounded px-3 py-1.5 text-sm"
                placeholder="e.g., Department of Veterans Affairs"
              />
            </div>
            <div>
              <label className="text-xs text-slate-600 block mb-1">Customer Type</label>
              <select
                value={form.customer_type}
                onChange={e => updateField('customer_type', e.target.value)}
                className="w-full border border-slate-300 rounded px-3 py-1.5 text-sm"
              >
                <option value="">Select...</option>
                <option value="Federal">Federal</option>
                <option value="State">State</option>
                <option value="Local">Local</option>
                <option value="Commercial">Commercial</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-slate-600 block mb-1">Contract Number</label>
              <input
                value={form.contract_number}
                onChange={e => updateField('contract_number', e.target.value)}
                className="w-full border border-slate-300 rounded px-3 py-1.5 text-sm"
                placeholder="e.g., 36C10X21C0042"
              />
            </div>
            <div>
              <label className="text-xs text-slate-600 block mb-1">Contract Value ($)</label>
              <input
                type="number"
                step="0.01"
                value={form.contract_value}
                onChange={e => updateField('contract_value', e.target.value)}
                className="w-full border border-slate-300 rounded px-3 py-1.5 text-sm"
                placeholder="e.g., 2500000"
              />
            </div>
            <div>
              <label className="text-xs text-slate-600 block mb-1">PoP Start</label>
              <input
                type="date"
                value={form.period_of_performance_start}
                onChange={e => updateField('period_of_performance_start', e.target.value)}
                className="w-full border border-slate-300 rounded px-3 py-1.5 text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-slate-600 block mb-1">PoP End</label>
              <input
                type="date"
                value={form.period_of_performance_end}
                onChange={e => updateField('period_of_performance_end', e.target.value)}
                className="w-full border border-slate-300 rounded px-3 py-1.5 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-slate-600 block mb-1">Scope of Work</label>
            <textarea
              value={form.scope}
              onChange={e => updateField('scope', e.target.value)}
              rows={3}
              className="w-full border border-slate-300 rounded px-3 py-1.5 text-sm"
              placeholder="Describe the work performed..."
            />
          </div>

          <div>
            <label className="text-xs text-slate-600 block mb-1">Outcome / Results</label>
            <textarea
              value={form.outcome}
              onChange={e => updateField('outcome', e.target.value)}
              rows={2}
              className="w-full border border-slate-300 rounded px-3 py-1.5 text-sm"
              placeholder="Key results, metrics, CPARS rating if applicable..."
            />
          </div>

          <div className="grid md:grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-600 block mb-1">Relevant NAICS (comma-separated)</label>
              <input
                value={form.relevant_naics}
                onChange={e => updateField('relevant_naics', e.target.value)}
                className="w-full border border-slate-300 rounded px-3 py-1.5 text-sm"
                placeholder="e.g., 541511, 541512"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-3">
            <div>
              <label className="text-xs text-slate-600 block mb-1">POC Name</label>
              <input
                value={form.poc_name}
                onChange={e => updateField('poc_name', e.target.value)}
                className="w-full border border-slate-300 rounded px-3 py-1.5 text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-slate-600 block mb-1">POC Email</label>
              <input
                type="email"
                value={form.poc_email}
                onChange={e => updateField('poc_email', e.target.value)}
                className="w-full border border-slate-300 rounded px-3 py-1.5 text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-slate-600 block mb-1">POC Phone</label>
              <input
                value={form.poc_phone}
                onChange={e => updateField('poc_phone', e.target.value)}
                className="w-full border border-slate-300 rounded px-3 py-1.5 text-sm"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => { setShowForm(false); setForm(EMPTY_FORM); }}
              className="px-3 py-1.5 text-sm text-slate-600 hover:text-ink"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="bg-navy hover:bg-ink text-white px-4 py-1.5 rounded text-sm font-medium disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Record'}
            </button>
          </div>
        </form>
      )}

      {/* ─── Records Table ─── */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50">
            <tr className="text-left text-xs uppercase tracking-wide text-slate-600">
              <th className="px-4 py-2">Customer</th>
              <th className="px-4 py-2">Contract</th>
              <th className="px-4 py-2">Period</th>
              <th className="px-4 py-2">Value</th>
              <th className="px-4 py-2">NAICS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {records.map(r => (
              <tr key={r.id} className="hover:bg-slate-50">
                <td className="px-4 py-2">
                  <div className="font-medium text-ink">{r.customer_name}</div>
                  {r.customer_type && <div className="text-xs text-slate-500">{r.customer_type}</div>}
                </td>
                <td className="px-4 py-2 text-slate-600">{r.contract_number || '—'}</td>
                <td className="px-4 py-2 text-slate-600 text-xs">
                  {r.period_of_performance_start && r.period_of_performance_end
                    ? `${new Date(r.period_of_performance_start).toLocaleDateString()} – ${new Date(r.period_of_performance_end).toLocaleDateString()}`
                    : r.period_of_performance_start
                      ? `From ${new Date(r.period_of_performance_start).toLocaleDateString()}`
                      : '—'
                  }
                </td>
                <td className="px-4 py-2 text-slate-600">
                  {r.contract_value ? `$${Number(r.contract_value).toLocaleString()}` : '—'}
                </td>
                <td className="px-4 py-2 text-slate-600 text-xs">
                  {(r.relevant_naics || []).join(', ') || '—'}
                </td>
              </tr>
            ))}
            {records.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-slate-500">
                  No past performance records yet. Add one to get started.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
