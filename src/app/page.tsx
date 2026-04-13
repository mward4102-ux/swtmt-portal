import Link from 'next/link';
import { createServerClient } from '@/lib/supabase';
import { redirect } from 'next/navigation';

export default async function HomePage() {
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: bids } = await supabase
    .from('bids')
    .select('id, title, agency, due_date, stage')
    .order('created_at', { ascending: false })
    .limit(8);

  const stages = ['opportunity','intake','drafting','review','submitted','awarded','lost'];
  const counts: Record<string, number> = {};
  for (const s of stages) counts[s] = 0;
  for (const b of bids || []) counts[b.stage] = (counts[b.stage] || 0) + 1;

  // Deadline alerts: bids due within 7 days
  const now = new Date();
  const sevenDays = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const urgent = (bids || []).filter(
    (b) => b.due_date && new Date(b.due_date) <= sevenDays && new Date(b.due_date) >= now
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-ink">Dashboard</h1>
        <p className="text-sm text-slate-600">
          Welcome back. Pipeline summary and recent activity below.
        </p>
      </div>

      {urgent.length > 0 && (
        <div className="bg-amber-50 border border-amber-300 rounded-lg p-4">
          <h2 className="font-semibold text-amber-800 text-sm mb-2">
            Deadline alert — {urgent.length} bid{urgent.length > 1 ? 's' : ''} due within 7 days
          </h2>
          <ul className="space-y-1">
            {urgent.map((b) => (
              <li key={b.id} className="text-sm text-amber-900">
                <Link href={`/bids/${b.id}`} className="underline hover:text-amber-700">
                  {b.title}
                </Link>{' '}
                — due {new Date(b.due_date).toLocaleDateString()}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {stages.slice(0,4).map(stage => (
          <div key={stage} className="bg-white rounded-lg shadow-sm p-4 border border-slate-200">
            <div className="text-xs uppercase tracking-wide text-slate-500">{stage}</div>
            <div className="text-3xl font-bold text-navy mt-1">{counts[stage] || 0}</div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-slate-200">
        <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between">
          <h2 className="font-semibold text-ink">Recent bids</h2>
          <Link href="/bids" className="text-sm text-navy hover:text-gold">View all →</Link>
        </div>
        <ul className="divide-y divide-slate-100">
          {(bids || []).map(b => (
            <li key={b.id} className="px-4 py-3 flex justify-between items-center hover:bg-slate-50">
              <div>
                <Link href={`/bids/${b.id}`} className="font-medium text-navy hover:text-gold">
                  {b.title}
                </Link>
                <div className="text-xs text-slate-500">{b.agency || 'Agency TBD'}</div>
              </div>
              <span className="text-xs px-2 py-1 rounded bg-slate-100 text-slate-700">{b.stage}</span>
            </li>
          ))}
          {(!bids || bids.length === 0) && (
            <li className="px-4 py-6 text-center text-slate-500 text-sm">
              No bids yet. <Link href="/intake" className="text-navy underline">Start an intake →</Link>
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}
