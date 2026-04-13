'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserSupabase } from '@/lib/supabase-browser';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function sendMagicLink() {
    setBusy(true);
    setMsg(null);
    const supabase = createBrowserSupabase();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: typeof window !== 'undefined' ? `${window.location.origin}/auth/callback` : undefined }
    });
    setMsg(error ? 'Error: ' + error.message : 'Check your email for the login link.');
    setBusy(false);
  }

  async function signInWithPassword() {
    setBusy(true);
    setMsg(null);
    const supabase = createBrowserSupabase();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setMsg('Error: ' + error.message);
      setBusy(false);
      return;
    }
    router.push('/');
    router.refresh();
  }

  return (
    <div className="max-w-sm mx-auto mt-16 bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
      <h1 className="text-xl font-bold text-ink mb-1">Sign in</h1>
      <p className="text-sm text-slate-600 mb-4">SWTMT Portal</p>
      <input
        type="email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        placeholder="you@company.com"
        className="w-full border border-slate-300 rounded px-3 py-2 text-sm mb-2"
      />
      <input
        type="password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        placeholder="Password"
        className="w-full border border-slate-300 rounded px-3 py-2 text-sm mb-3"
      />
      <button
        onClick={signInWithPassword}
        disabled={busy || !email || !password}
        className="w-full bg-navy hover:bg-ink text-white py-2 rounded font-medium disabled:opacity-50 mb-2"
      >
        {busy ? 'Signing in…' : 'Sign in with password'}
      </button>
      <div className="text-center text-xs text-slate-400 my-2">or</div>
      <button
        onClick={sendMagicLink}
        disabled={busy || !email}
        className="w-full border border-slate-300 hover:bg-slate-50 text-ink py-2 rounded text-sm disabled:opacity-50"
      >
        Email me a magic link
      </button>
      {msg && <div className="text-sm text-slate-700 mt-3">{msg}</div>}
    </div>
  );
}
