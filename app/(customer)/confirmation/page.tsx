import type { Metadata } from "next";
import Link from "next/link";
import { IconCalendar, IconCheck, IconMail, IconSparkles } from "@/components/ui/icons";

export const metadata: Metadata = { title: "Confirmed" };

export default function ConfirmationPage({ searchParams }: { searchParams: { type?: string } }) {
  const isAppt = searchParams.type === "appointment";
  return (
    <div className="mx-auto max-w-xl py-8 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
        <IconCheck className="h-8 w-8" />
      </div>
      <h1 className="mt-5 text-2xl font-extrabold text-brand-950">
        {isAppt ? "You're booked!" : "Quote request received"}
      </h1>
      <p className="mt-2 text-slate-600">
        {isAppt
          ? "We've emailed your confirmation and added it to Beach's calendar. See you soon."
          : "Thanks! As an independent agency we'll shop your options across carriers and follow up shortly."}
      </p>

      <div className="card mt-6 p-5 text-left">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50 text-brand-600"><IconMail className="h-5 w-5" /></div>
          <div>
            <div className="text-sm font-semibold text-brand-900">Confirmation sent</div>
            <div className="text-xs text-slate-500">A copy is in your inbox; Beach has been alerted too.</div>
          </div>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Link href="/profile" className="btn-secondary">Back to my profile</Link>
        {isAppt ? (
          <Link href="/quote" className="btn-primary"><IconSparkles className="h-4 w-4" /> Start a quote</Link>
        ) : (
          <Link href="/schedule" className="btn-primary"><IconCalendar className="h-4 w-4" /> Book a time</Link>
        )}
      </div>
    </div>
  );
}
