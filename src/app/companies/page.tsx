import { createServerClient } from '@/lib/supabase';

export default async function CompaniesPage() {
  const supabase = createServerClient();
  const { data: companies } = await supabase
    .from('companies')
    .select('id, name, naics, sdvosb_certified, sam_status, created_at')
    .order('name');

  return (
    <div>
      <h1 className="text-2xl font-bold text-ink mb-4">Companies</h1>
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50">
            <tr className="text-left text-xs uppercase tracking-wide text-slate-600">
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">NAICS</th>
              <th className="px-4 py-2">SDVOSB</th>
              <th className="px-4 py-2">SAM Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {(companies || []).map(c => (
              <tr key={c.id}>
                <td className="px-4 py-2 font-medium text-ink">{c.name}</td>
                <td className="px-4 py-2 text-slate-600">{(c.naics || []).join(', ')}</td>
                <td className="px-4 py-2">{c.sdvosb_certified ? '✓' : '—'}</td>
                <td className="px-4 py-2 text-slate-600">{c.sam_status || '—'}</td>
              </tr>
            ))}
            {(!companies || companies.length === 0) && (
              <tr><td colSpan={4} className="px-4 py-6 text-center text-slate-500">No companies yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
