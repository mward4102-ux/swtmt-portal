import { Suspense } from "react";
import { redirect } from "next/navigation";
import { Logo } from "@/components/brand/Logo";
import { LoginPanel } from "@/components/auth/LoginPanel";
import { getCurrentUser } from "@/lib/auth";
import { AGENCY } from "@/lib/config";
import {
  IconCalendar, IconCheck, IconHeart, IconPhone, IconShield, IconSparkles, IconUpload,
} from "@/components/ui/icons";

export default async function LandingPage() {
  const user = await getCurrentUser();
  if (user) redirect(user.role === "agent" ? "/dashboard" : "/profile");

  const features = [
    { icon: IconSparkles, title: "AI policy review", body: "Snap or upload a dec page. We read the carrier, limits, VINs, deductibles and premium — with a confidence score on every field." },
    { icon: IconShield, title: "Independent by design", body: "We're not captive to one carrier. We shop the market and bring you the options that actually fit." },
    { icon: IconUpload, title: "One profile, every line", body: "Auto, home, business, life & health — build it once and reuse it for every quote and renewal." },
    { icon: IconCalendar, title: "Book in a tap", body: "Grab a consultation, policy review, or claims-help slot that syncs straight to our calendar." },
  ];

  return (
    <main className="relative">
      {/* Top bar */}
      <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
        <Logo />
        <a href={`tel:${AGENCY.phone.replace(/[^0-9+]/g, "")}`} className="btn-ghost btn-sm hidden sm:inline-flex">
          <IconPhone className="h-4 w-4" /> {AGENCY.phone}
        </a>
      </header>

      {/* Hero */}
      <section className="mx-auto grid max-w-6xl items-center gap-10 px-5 pb-10 pt-6 lg:grid-cols-[1.1fr_minmax(360px,440px)] lg:pt-12">
        <div className="animate-fade-in">
          <span className="chip bg-brand-100 text-brand-700">Independent agency · Coachella Valley</span>
          <h1 className="mt-4 text-4xl font-extrabold leading-[1.05] tracking-tight text-brand-950 sm:text-5xl">
            Your policies,
            <span className="block bg-gradient-to-r from-brand-600 to-brand-400 bg-clip-text text-transparent">
              understood in seconds.
            </span>
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-slate-600">
            Upload what you already have. Our AI reads it, builds your profile, and helps you compare coverage across
            carriers — then connects you with a real local agent who works for <em>you</em>.
          </p>
          <ul className="mt-6 grid max-w-lg gap-2.5 sm:grid-cols-2">
            {["No password to remember", "Every field human-reviewed", "We shop multiple carriers", "Your data, transient by default"].map((t) => (
              <li key={t} className="flex items-center gap-2 text-sm text-slate-700">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                  <IconCheck className="h-3.5 w-3.5" />
                </span>
                {t}
              </li>
            ))}
          </ul>
        </div>

        <div className="lg:pl-4">
          <Suspense fallback={<div className="card h-[420px] animate-pulse" />}>
            <LoginPanel />
          </Suspense>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-5 py-10">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f) => (
            <div key={f.title} className="card p-5 transition hover:-translate-y-0.5 hover:shadow-lg">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 font-bold text-brand-900">{f.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-6xl px-5 py-10">
        <div className="card overflow-hidden">
          <div className="grid gap-px bg-slate-200 sm:grid-cols-3">
            {[
              { n: "1", t: "Upload or snap", d: "Add a current policy, dec page, or ID. Works on your phone camera." },
              { n: "2", t: "Review the read", d: "We extract the details and flag anything we're unsure about for a quick confirm." },
              { n: "3", t: "Quote & book", d: "Request quotes across lines and grab time with your agent." },
            ].map((s) => (
              <div key={s.n} className="bg-white p-6">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-600 text-sm font-bold text-white">
                  {s.n}
                </div>
                <h3 className="mt-3 font-bold text-brand-900">{s.t}</h3>
                <p className="mt-1 text-sm text-slate-600">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mx-auto max-w-6xl px-5 py-10">
        <div className="flex flex-col gap-4 border-t border-slate-200 pt-6 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <IconHeart className="h-4 w-4 text-brand-400" />
            <span>{AGENCY.name} · {AGENCY.license}</span>
          </div>
          <div>{AGENCY.address} · {AGENCY.phone}</div>
        </div>
        <p className="mt-4 text-xs text-slate-400">
          Demo build — runs on 8 fictitious sample documents. No real customer data is stored.
        </p>
      </footer>
    </main>
  );
}
