'use client';
import { useState } from 'react';
import { createBrowserSupabase } from '@/lib/supabase';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function send() {
    setBusy(true);
    const supabase = createBrowserSupabase();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: typeof window !== 'undefined' ? window.location.origin : undefined }
    });
    setMsg(error ? 'Error: ' + error.message : 'Check your email for the login link.');
    setBusy(false);
  }

  return (
    <div className="max-w-sm mx-auto mt-16 bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
      <h1 className="text-xl font-bold text-ink mb-1">Sign in</h1>
      <p className="text-sm text-slate-600 mb-4">SWTMT Portal — magic link login.</p>
      <input
        type="email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        placeholder="you@company.com"
        className="w-full border border-slate-300 rounded px-3 py-2 text-sm mb-3"
      />
      <button
        onClick={send}
        disabled={busy || !email}
        className="w-full bg-navy hover:bg-ink text-white py-2 rounded font-medium disabled:opacity-50"
      >
        {busy ? 'Sending…' : 'Send magic link'}
      </button>
      {msg && <div className="text-sm text-slate-700 mt-3">{msg}</div>}
    </div>
  );
}
