import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { StatTile, DataRow, SectionCard } from "@/components/ui/Cards";
import { StatusChip } from "@/components/ui/chips";
import { LeadStatusControl } from "@/components/agent/LeadStatusControl";
import { DocumentReview } from "@/components/agent/DocumentReview";
import { GenerateForms } from "@/components/agent/GenerateForms";
import {
  IconArrowLeft, IconBriefcase, IconCalendar, IconCar, IconDoc, IconMail, IconPhone, IconSparkles, IconUser,
} from "@/components/ui/icons";
import { requireAgent } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { buildProfile } from "@/lib/profile";
import { QUOTE_LINES } from "@/lib/types";
import { cn, formatCurrency, formatDate, formatDateTime } from "@/lib/utils";

export const metadata: Metadata = { title: "Lead" };
export const dynamic = "force-dynamic";

export default async function LeadPage({ params }: { params: { id: string } }) {
  await requireAgent();
  const db = getDb();
  const summary = db.getLeadSummary(params.id);
  if (!summary) notFound();

  const { lead, documents, quotes, appointments } = summary;
  const profile = buildProfile(documents);
  const toReview = documents.filter((d) => !d.reviewed).length;
  const firstUnreviewed = documents.find((d) => !d.reviewed);

  return (
    <div>
      <Link href="/dashboard" className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-brand-700 hover:text-brand-900">
        <IconArrowLeft className="h-4 w-4" /> Dashboard
      </Link>

      {/* Header */}
      <div className="card p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={cn("flex h-12 w-12 items-center justify-center rounded-2xl", lead.kind === "business" ? "bg-sand-100 text-sand-700" : "bg-brand-50 text-brand-600")}>
              {lead.kind === "business" ? <IconBriefcase className="h-6 w-6" /> : <IconUser className="h-6 w-6" />}
            </div>
            <div>
              <h1 className="text-xl font-extrabold tracking-tight text-brand-950">{lead.displayName}</h1>
              <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500">
                {lead.email && <span className="inline-flex items-center gap-1"><IconMail className="h-3.5 w-3.5" /> {lead.email}</span>}
                {lead.phone && <span className="inline-flex items-center gap-1"><IconPhone className="h-3.5 w-3.5" /> {lead.phone}</span>}
              </div>
              {lead.primaryAddress && <div className="mt-0.5 text-sm text-slate-500">{lead.primaryAddress}</div>}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <StatusChip status={lead.status} />
            <LeadStatusControl leadId={lead.id} status={lead.status} />
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatTile label="Documents" value={documents.length} icon={IconDoc} href={documents.length ? "#documents" : undefined} />
          <StatTile label="To review" value={toReview} icon={IconSparkles} accent={toReview > 0} href={firstUnreviewed ? `#doc-${firstUnreviewed.id}` : documents.length ? "#documents" : undefined} />
          <StatTile label="Quotes" value={quotes.length} icon={IconSparkles} href={quotes.length ? "#quotes" : undefined} />
          <StatTile label="Appointments" value={appointments.length} icon={IconCalendar} href={appointments.length ? "#appointments" : undefined} />
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        {/* Left: documents */}
        <section id="documents" className="space-y-4 scroll-mt-24">
          <h2 className="text-sm font-bold uppercase tracking-wide text-slate-500">Extracted documents ({documents.length})</h2>
          {documents.map((doc) => (
            <div key={doc.id} id={`doc-${doc.id}`} className="scroll-mt-24">
              <DocumentReview doc={doc} />
            </div>
          ))}
          {!documents.length && <p className="text-sm text-slate-400">No documents uploaded yet.</p>}
        </section>

        {/* Right: forms, quotes, appts, profile */}
        <div className="space-y-6">
          <GenerateForms leadId={lead.id} />

          {quotes.length > 0 && (
            <SectionCard id="quotes" title="Quotes">
              <div className="space-y-3">
                {quotes.map((q) => (
                  <div key={q.id} className="rounded-xl border border-slate-200 p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-brand-900">
                        {q.lines.map((l) => QUOTE_LINES.find((x) => x.id === l.line)?.label ?? l.line).join(", ")}
                      </span>
                      <StatusChip status={q.status} />
                    </div>
                    {q.notes && <p className="mt-1.5 text-sm text-slate-500">{q.notes}</p>}
                    <p className="mt-1 text-xs text-slate-400">{formatDate(q.createdAt)}</p>
                  </div>
                ))}
              </div>
            </SectionCard>
          )}

          {appointments.length > 0 && (
            <SectionCard id="appointments" title="Appointments">
              <div className="space-y-2">
                {appointments.map((a) => (
                  <div key={a.id} className="flex items-center justify-between gap-2 text-sm">
                    <span className="font-medium text-brand-900">{a.eventType}</span>
                    <span className="text-xs text-slate-500">{formatDateTime(a.startsAt)}</span>
                  </div>
                ))}
              </div>
            </SectionCard>
          )}

          {(profile.vehicles.length > 0 || profile.drivers.length > 0) && (
            <SectionCard title="Household">
              {profile.drivers.length > 0 && (
                <div className="mb-3">
                  <div className="mb-1 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400"><IconUser className="h-3.5 w-3.5" /> Drivers</div>
                  {profile.drivers.map((d, i) => (
                    <div key={i} className="flex justify-between text-sm"><span className="font-medium text-brand-950">{d.name}</span><span className="text-xs text-slate-400">{d.license}</span></div>
                  ))}
                </div>
              )}
              {profile.vehicles.length > 0 && (
                <div>
                  <div className="mb-1 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400"><IconCar className="h-3.5 w-3.5" /> Vehicles</div>
                  {profile.vehicles.map((v, i) => (
                    <div key={i} className="flex justify-between text-sm"><span className="font-medium text-brand-950">{[v.year, v.make, v.model].filter(Boolean).join(" ")}</span><span className="font-mono text-[11px] text-slate-400">{v.vin}</span></div>
                  ))}
                </div>
              )}
            </SectionCard>
          )}

          {profile.properties.map((p, i) => (
            <SectionCard key={i} title="Property">
              <DataRow label="Address" value={p.address} />
              <DataRow label="Year built" value={p.yearBuilt} />
              <DataRow label="Dwelling (Cov A)" value={formatCurrency(p.coverageA)} />
            </SectionCard>
          ))}

          {profile.businesses.map((b, i) => (
            <SectionCard key={i} title="Business">
              <DataRow label="Name" value={b.name} />
              <DataRow label="Entity" value={b.entityType} />
              <DataRow label="Each occurrence" value={formatCurrency(b.eachOccurrence)} />
              <DataRow label="General aggregate" value={formatCurrency(b.generalAggregate)} />
            </SectionCard>
          ))}
        </div>
      </div>
    </div>
  );
}
