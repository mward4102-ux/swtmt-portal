"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { IconArrowLeft, IconShield, IconSparkles, IconUser } from "@/components/ui/icons";

export function LoginPanel() {
  const router = useRouter();
  const search = useSearchParams();
  const nextParam = search.get("next");
  const wantsAuth = nextParam === "auth" || (nextParam && nextParam !== "auth");
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function login(payload: { email: string; role?: "agent" | "customer"; fullName?: string }, key: string) {
    setBusy(key);
    setError(null);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Sign-in failed");
      const dest = nextParam && nextParam !== "auth" && nextParam.startsWith("/") ? nextParam : data.redirect;
      router.push(dest);
      router.refresh();
    } catch (e) {
      setError((e as Error).message);
      setBusy(null);
    }
  }

  return (
    <div className="card p-6 sm:p-7">
      <div className="mb-5">
        <h2 className="text-lg font-bold text-brand-900">Sign in to your vault</h2>
        <p className="mt-1 text-sm text-slate-500">
          {wantsAuth ? "Please sign in to continue." : "Magic-link sign-in. No password to remember."}
        </p>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (email.trim()) login({ email: email.trim() }, "email");
        }}
        className="space-y-3"
      >
        <div>
          <label className="label" htmlFor="email">Email address</label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="input"
          />
        </div>
        <button type="submit" className="btn-primary w-full" disabled={busy !== null}>
          {busy === "email" ? "Signing in…" : "Send magic link"}
        </button>
      </form>

      {error && <p className="mt-3 text-sm text-rose-600">{error}</p>}

      <div className="my-5 flex items-center gap-3 text-xs font-medium uppercase tracking-wide text-slate-400">
        <span className="h-px flex-1 bg-slate-200" /> or explore the demo <span className="h-px flex-1 bg-slate-200" />
      </div>

      <div className="grid gap-2.5">
        <button
          onClick={() => login({ email: "maria@example.com", role: "customer", fullName: "Maria Gutierrez" }, "maria")}
          className="btn-secondary w-full justify-start"
          disabled={busy !== null}
        >
          <IconUser className="text-brand-500" />
          <span className="text-left">
            <span className="block font-semibold">Explore as a customer</span>
            <span className="block text-xs font-normal text-slate-500">Maria — auto, license &amp; a live quote</span>
          </span>
        </button>
        <button
          onClick={() => login({ email: "beach@beachstanton.com", role: "agent", fullName: "Beach Stanton" }, "beach")}
          className="btn-secondary w-full justify-start"
          disabled={busy !== null}
        >
          <IconShield className="text-brand-500" />
          <span className="text-left">
            <span className="block font-semibold">Open the agent dashboard</span>
            <span className="block text-xs font-normal text-slate-500">Beach — inbox, extractions &amp; forms</span>
          </span>
        </button>
      </div>

      <p className="mt-5 flex items-center gap-1.5 text-xs text-slate-400">
        <IconSparkles className="h-3.5 w-3.5" /> Demo mode — no real data is stored.
      </p>
    </div>
  );
}

export function BackToHome() {
  return (
    <a href="/" className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-700 hover:text-brand-900">
      <IconArrowLeft className="h-4 w-4" /> Back
    </a>
  );
}
