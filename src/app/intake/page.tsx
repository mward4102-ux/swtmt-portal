'use client';
import { useState, useRef } from 'react';

const FIELDS = [
  { name: 'company_name', label: 'Legal company name', type: 'text', required: true },
  { name: 'ein', label: 'EIN', type: 'text' },
  { name: 'uei', label: 'SAM UEI', type: 'text' },
  { name: 'cage_code', label: 'CAGE code', type: 'text' },
  { name: 'state', label: 'State of formation', type: 'text', required: true },
  { name: 'naics_codes', label: 'NAICS codes (comma-separated)', type: 'text' },
  { name: 'sdvosb_certified', label: 'SDVOSB certified?', type: 'checkbox' },
  { name: 'mentor_company', label: 'Mentor company name (if JV)', type: 'text' },
  { name: 'primary_poc_name', label: 'Primary POC name', type: 'text', required: true },
  { name: 'primary_poc_email', label: 'Primary POC email', type: 'email', required: true },
  { name: 'primary_poc_phone', label: 'Primary POC phone', type: 'text' },
  { name: 'capabilities_summary', label: 'Core capabilities (2–4 sentences)', type: 'textarea', required: true },
  { name: 'past_performance', label: 'Key past performance highlights', type: 'textarea' },
  { name: 'target_agencies', label: 'Target agencies', type: 'text' },
  { name: 'differentiators', label: 'Differentiators / unique value', type: 'textarea' }
];

export default function IntakePage() {
  const [form, setForm] = useState<Record<string, any>>({});
  const [busy, setBusy] = useState(false);
  const [prefilling, setPrefilling] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [sourceFiles, setSourceFiles] = useState<string[]>([]);
  const [prefilled, setPrefilled] = useState<Set<string>>(new Set());
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function onFilesChosen(files: FileList | null) {
    if (!files || files.length === 0) return;
    if (files.length > 5) { setMsg('Upload at most 5 files at a time'); return; }

    setPrefilling(true);
    setMsg('Extracting fields from your documents...');

    const fd = new FormData();
    Array.from(files).forEach((f, i) => fd.append(`file_${i}`, f));

    try {
      const r = await fetch('/api/intake/prefill', { method: 'POST', body: fd });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || 'Prefill failed');

      // Merge extracted fields into form state (only if field is currently empty)
      const merged = { ...form };
      const newlyPrefilled = new Set(prefilled);
      for (const [k, v] of Object.entries(j.fields || {})) {
        if (!merged[k]) {
          merged[k] = v;
          newlyPrefilled.add(k);
        }
      }
      setForm(merged);
      setPrefilled(newlyPrefilled);
      setSourceFiles(j.source_files || []);
      setMsg(`Prefilled ${Object.keys(j.fields || {}).length} fields from ${(j.source_files || []).length} file(s). Review and edit as needed.`);
    } catch (e: any) {
      setMsg('Error: ' + e.message);
    } finally {
      setPrefilling(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    onFilesChosen(e.dataTransfer.files);
  }

  async function submit() {
    setBusy(true);
    setMsg(null);
    try {
      const r = await fetch('/api/intake', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(form)
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || 'submit failed');
      setMsg('Intake submitted. Document generation started — check the bids page shortly.');
      setForm({});
      setSourceFiles([]);
      setPrefilled(new Set());
    } catch (e: any) {
      setMsg('Error: ' + e.message);
    } finally {
      setBusy(false);
    }
  }

  function updateField(name: string, value: any) {
    setForm({ ...form, [name]: value });
    // Clear prefilled marker once user edits
    if (prefilled.has(name)) {
      const next = new Set(prefilled);
      next.delete(name);
      setPrefilled(next);
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-ink mb-1">SDVOSB Intake</h1>
      <p className="text-sm text-slate-600 mb-5">
        Upload existing documents to auto-fill the form, or fill it out manually. The portal generates your capability statement, seeds a bid record, and stages federal form drafts on submit.
      </p>

      {/* Upload zone */}
      <div
        onDragOver={e => e.preventDefault()}
        onDrop={onDrop}
        className="border-2 border-dashed border-slate-300 rounded-lg p-5 mb-5 text-center bg-white hover:border-navy transition"
      >
        <div className="text-sm text-slate-600 mb-2">
          Drop existing capability statements, SAM printouts, prior bids, licenses, or W-9s here
        </div>
        <div className="text-xs text-slate-400 mb-3">PDF, DOCX, PNG, JPG, TXT — up to 5 files, 8MB each</div>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.docx,.png,.jpg,.jpeg,.gif,.webp,.txt"
          onChange={e => onFilesChosen(e.target.files)}
          className="hidden"
          id="file-upload"
        />
        <label
          htmlFor="file-upload"
          className="inline-block bg-navy hover:bg-ink text-white px-4 py-2 rounded text-sm font-medium cursor-pointer"
        >
          {prefilling ? 'Extracting...' : 'Choose files'}
        </label>
        {sourceFiles.length > 0 && (
          <div className="mt-3 text-xs text-slate-600">
            Prefilled from: {sourceFiles.join(', ')}
          </div>
        )}
      </div>

      {/* Form */}
      <div className="space-y-4 bg-white p-5 rounded-lg border border-slate-200 shadow-sm">
        {FIELDS.map(f => {
          const isPrefilled = prefilled.has(f.name);
          const label = (
            <label className="block text-sm font-medium text-ink mb-1">
              {f.label} {f.required && <span className="text-red-500">*</span>}
              {isPrefilled && <span className="ml-2 text-xs text-gold">prefilled — review</span>}
            </label>
          );
          const ringClass = isPrefilled ? 'border-gold bg-amber-50' : 'border-slate-300';
          return (
            <div key={f.name}>
              {label}
              {f.type === 'textarea' ? (
                <textarea
                  rows={3}
                  value={form[f.name] || ''}
                  onChange={e => updateField(f.name, e.target.value)}
                  className={`w-full border rounded px-3 py-2 text-sm ${ringClass}`}
                />
              ) : f.type === 'checkbox' ? (
                <input
                  type="checkbox"
                  checked={!!form[f.name]}
                  onChange={e => updateField(f.name, e.target.checked)}
                  className="h-4 w-4"
                />
              ) : (
                <input
                  type={f.type}
                  value={form[f.name] || ''}
                  onChange={e => updateField(f.name, e.target.value)}
                  className={`w-full border rounded px-3 py-2 text-sm ${ringClass}`}
                />
              )}
            </div>
          );
        })}

        <button
          onClick={submit}
          disabled={busy}
          className="w-full bg-navy hover:bg-ink text-white py-2 rounded font-medium disabled:opacity-50"
        >
          {busy ? 'Submitting…' : 'Submit intake'}
        </button>
        {msg && <div className="text-sm text-slate-700 mt-2">{msg}</div>}
      </div>
    </div>
  );
}
