"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { IconCalendar, IconCheck, IconClock } from "@/components/ui/icons";
import { cn } from "@/lib/utils";

const EVENT_TYPES = [
  { id: "New Quote Consultation", blurb: "Compare options across carriers" },
  { id: "Policy Review", blurb: "Annual check-up on current coverage" },
  { id: "Claims Help", blurb: "Guidance filing or following a claim" },
];

function businessDays(count: number): Date[] {
  const days: Date[] = [];
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  while (days.length < count) {
    d.setDate(d.getDate() + 1);
    const day = d.getDay();
    if (day !== 0 && day !== 6) days.push(new Date(d));
  }
  return days;
}

const SLOTS = (() => {
  const out: string[] = [];
  for (let h = 9; h <= 15; h++) for (const m of [0, 30]) out.push(`${String(h).padStart(2, "0")}:${m === 0 ? "00" : "30"}`);
  return out;
})();

export function Scheduler({ defaultName, defaultEmail, defaultPhone, calLink }: { defaultName: string; defaultEmail: string; defaultPhone?: string; calLink?: string }) {
  const router = useRouter();
  const days = useMemo(() => businessDays(8), []);
  const [eventType, setEventType] = useState(EVENT_TYPES[0].id);
  const [day, setDay] = useState<Date>(days[0]);
  const [time, setTime] = useState<string>("10:00");
  const [name, setName] = useState(defaultName);
  const [email, setEmail] = useState(defaultEmail);
  const [phone, setPhone] = useState(defaultPhone ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (calLink) {
    const src = calLink.startsWith("http") ? calLink : `https://cal.com/${calLink}`;
    return (
      <div className="card overflow-hidden">
        <iframe src={src} title="Book an appointment" className="h-[680px] w-full" />
      </div>
    );
  }

  async function confirm() {
    setBusy(true);
    setError(null);
    try {
      const [hh, mm] = time.split(":").map(Number);
      const start = new Date(day);
      start.setHours(hh, mm, 0, 0);
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventType, startsAt: start.toISOString(), name, email, phone }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Booking failed");
      router.push("/confirmation?type=appointment");
    } catch (e) {
      setError((e as Error).message);
      setBusy(false);
    }
  }

  const fmtDay = (d: Date) => ({
    dow: d.toLocaleDateString("en-US", { weekday: "short" }),
    day: d.toLocaleDateString("en-US", { day: "numeric" }),
    mon: d.toLocaleDateString("en-US", { month: "short" }),
  });

  return (
    <div className="space-y-5">
      <div className="card p-5">
        <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-500">1 · Type of appointment</h3>
        <div className="grid gap-2.5 sm:grid-cols-3">
          {EVENT_TYPES.map((e) => (
            <button
              key={e.id}
              onClick={() => setEventType(e.id)}
              className={cn("rounded-xl border p-3 text-left transition", eventType === e.id ? "border-brand-400 bg-brand-50 ring-2 ring-brand-200" : "border-slate-200 hover:border-brand-300")}
            >
              <div className="font-semibold text-brand-900">{e.id}</div>
              <div className="text-xs text-slate-500">{e.blurb}</div>
            </button>
          ))}
        </div>
      </div>

      <div className="card p-5">
        <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-500">2 · Pick a day</h3>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {days.map((d) => {
            const f = fmtDay(d);
            const on = d.toDateString() === day.toDateString();
            return (
              <button
                key={d.toISOString()}
                onClick={() => setDay(d)}
                className={cn("flex shrink-0 flex-col items-center rounded-xl border px-4 py-2.5 transition", on ? "border-brand-400 bg-brand-600 text-white" : "border-slate-200 text-slate-600 hover:border-brand-300")}
              >
                <span className="text-[11px] font-medium uppercase opacity-80">{f.dow}</span>
                <span className="text-lg font-bold leading-none">{f.day}</span>
                <span className="text-[11px] opacity-80">{f.mon}</span>
              </button>
            );
          })}
        </div>

        <h3 className="mb-2 mt-5 flex items-center gap-1.5 text-sm font-bold uppercase tracking-wide text-slate-500"><IconClock className="h-4 w-4" /> Time</h3>
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
          {SLOTS.map((s) => {
            const [h, m] = s.split(":").map(Number);
            const label = `${((h + 11) % 12) + 1}:${String(m).padStart(2, "0")} ${h < 12 ? "AM" : "PM"}`;
            const on = time === s;
            return (
              <button
                key={s}
                onClick={() => setTime(s)}
                className={cn("rounded-lg border py-2 text-sm font-medium transition", on ? "border-brand-400 bg-brand-50 text-brand-700" : "border-slate-200 text-slate-600 hover:border-brand-300")}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="card p-5">
        <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-500">3 · Your details</h3>
        <div className="grid gap-3 sm:grid-cols-3">
          <div><label className="label">Name</label><input className="input" value={name} onChange={(e) => setName(e.target.value)} /></div>
          <div><label className="label">Email</label><input className="input" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
          <div><label className="label">Phone</label><input className="input" value={phone} onChange={(e) => setPhone(e.target.value)} /></div>
        </div>
        {error && <p className="mt-3 text-sm text-rose-600">{error}</p>}
        <button className="btn-primary mt-5 w-full sm:w-auto" onClick={confirm} disabled={busy}>
          <IconCalendar className="h-4 w-4" /> {busy ? "Booking…" : "Confirm appointment"} <IconCheck className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
