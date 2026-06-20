import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/layout/PageHeader";
import { StatTile } from "@/components/ui/Cards";
import { StatusChip } from "@/components/ui/chips";
import {
  IconAlert, IconBell, IconBriefcase, IconCalendar, IconDoc, IconSparkles, IconUser,
} from "@/components/ui/icons";
import { requireAgent } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { LEAD_STATUSES, type InboxItem } from "@/lib/types";
import { cn, timeAgo } from "@/lib/utils";

export const metadata: Metadata = { title: "Dashboard" };
export const dynamic = "force-dynamic";

const COLUMN_LABELS: Record<string, string> = {
  new: "New", in_progress: "In progress", quoted: "Quoted", closed: "Closed",
};

const INBOX_ICON = { document: IconDoc, quote: IconSparkles, appointment: IconCalendar };

export default async function DashboardPage() {
  await requireAgent();
  const db = getDb();
  const leads = db.listLeads();
  const stats = db.getStats();
  const inbox = db.getInbox().slice(0, 8);
  const outbox = db.listOutbox(6);

  const leadMeta = (id: string) => {
    const docs = db.getDocumentsByLead(id);
    return {
      docs: docs.length,
      review: docs.filter((d) => !d.reviewed).length,
      quotes: db.getQuotesByLead(id).length,
    };
  };

  return (
    <div>
      <PageHeader title="Dashboard" subtitle="Incoming quotes, uploads and bookings — every customer, ready to action." />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        <StatTile label="Leads" value={stats.totalLeads} icon={IconUser} accent />
        <StatTile label="New" value={stats.newLeads} icon={IconBell} />
        <StatTile label="Open quotes" value={stats.openQuotes} icon={IconSparkles} />
        <StatTile label="Upcoming" value={stats.upcomingAppointments} icon={IconCalendar} />
        <StatTile label="To review" value={stats.docsToReview} icon={IconAlert} />
      </div>

      {stats.docsToReview > 0 && (
        <div className="mt-4 flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <IconAlert className="h-4 w-4" />
          {stats.docsToReview} extracted document{stats.docsToReview > 1 ? "s have" : " has"} low-confidence fields awaiting review.
        </div>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        {/* Pipeline */}
        <section>
          <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-500">Pipeline</h2>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {LEAD_STATUSES.map((status) => {
              const col = leads.filter((l) => l.status === status);
              return (
                <div key={status} className="rounded-2xl bg-slate-100/70 p-2.5">
                  <div className="mb-2 flex items-center justify-between px-1.5">
                    <span className="text-xs font-bold uppercase tracking-wide text-slate-500">{COLUMN_LABELS[status]}</span>
                    <span className="chip bg-white text-slate-500">{col.length}</span>
                  </div>
                  <div className="space-y-2">
                    {col.map((lead) => {
                      const m = leadMeta(lead.id);
                      return (
                        <Link key={lead.id} href={`/lead/${lead.id}`} className="block rounded-xl border border-slate-200 bg-white p-3 transition hover:-translate-y-0.5 hover:shadow-md">
                          <div className="flex items-center gap-2">
                            <div className={cn("flex h-7 w-7 items-center justify-center rounded-lg", lead.kind === "business" ? "bg-sand-100 text-sand-700" : "bg-brand-50 text-brand-600")}>
                              {lead.kind === "business" ? <IconBriefcase className="h-4 w-4" /> : <IconUser className="h-4 w-4" />}
                            </div>
                            <span className="min-w-0 flex-1 truncate text-sm font-semibold text-brand-900">{lead.displayName}</span>
                          </div>
                          <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[11px] text-slate-500">
                            <span className="chip bg-slate-100 text-slate-600">{m.docs} docs</span>
                            {m.quotes > 0 && <span className="chip bg-violet-100 text-violet-700">{m.quotes} quote{m.quotes > 1 ? "s" : ""}</span>}
                            {m.review > 0 && <span className="chip bg-amber-100 text-amber-700">{m.review} to review</span>}
                          </div>
                          <div className="mt-1.5 text-[11px] text-slate-400">{timeAgo(lead.updatedAt)}</div>
                        </Link>
                      );
                    })}
                    {!col.length && <p className="px-1.5 py-3 text-xs text-slate-400">Nothing here.</p>}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Activity + notifications */}
        <div className="space-y-6">
          <section>
            <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-500">Recent activity</h2>
            <div className="card divide-y divide-slate-100">
              {inbox.map((item: InboxItem) => {
                const Icon = INBOX_ICON[item.type];
                const inner = (
                  <div className="flex items-center gap-3 p-3.5">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600"><Icon className="h-4.5 w-4.5" /></div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-semibold text-brand-900">{item.title}</div>
                      <div className="truncate text-xs text-slate-500">{item.subtitle}</div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <StatusChip status={item.status} />
                      <span className="text-[11px] text-slate-400">{timeAgo(item.at)}</span>
                    </div>
                  </div>
                );
                return item.leadId ? (
                  <Link key={item.id} href={`/lead/${item.leadId}`} className="block transition hover:bg-slate-50">{inner}</Link>
                ) : (
                  <div key={item.id}>{inner}</div>
                );
              })}
            </div>
          </section>

          <section>
            <h2 className="mb-3 flex items-center gap-1.5 text-sm font-bold uppercase tracking-wide text-slate-500"><IconBell className="h-4 w-4" /> Notifications sent</h2>
            <div className="card divide-y divide-slate-100">
              {outbox.map((m) => (
                <div key={m.id} className="p-3.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate text-sm font-medium text-brand-900">{m.subject || m.body.slice(0, 40)}</span>
                    <span className={cn("chip", m.provider === "demo" ? "bg-slate-100 text-slate-500" : "bg-emerald-100 text-emerald-700")}>
                      {m.provider === "demo" ? "simulated" : m.provider}
                    </span>
                  </div>
                  <div className="mt-0.5 text-xs text-slate-500">{m.channel.toUpperCase()} → {m.to} · {timeAgo(m.at)}</div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
