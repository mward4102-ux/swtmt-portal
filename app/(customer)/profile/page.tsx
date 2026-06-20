import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/layout/PageHeader";
import { DataRow, EmptyState, SectionCard, StatTile } from "@/components/ui/Cards";
import { StatusChip } from "@/components/ui/chips";
import {
  IconCalendar, IconCar, IconDoc, IconHome, IconBriefcase, IconSparkles, IconUser,
} from "@/components/ui/icons";
import { requireUser } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { buildProfile } from "@/lib/profile";
import { QUOTE_LINES } from "@/lib/types";
import { formatCurrency, formatDate, formatDateTime } from "@/lib/utils";

export const metadata: Metadata = { title: "Profile" };
export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const user = await requireUser();
  const db = getDb();
  const docs = db.getDocumentsByOwner(user.id);
  const quotes = db.getQuotesByOwner(user.id);
  const appts = db.getAppointmentsByOwner(user.id).filter((a) => new Date(a.startsAt).getTime() > Date.now());
  const profile = buildProfile(docs);

  return (
    <div>
      <PageHeader title={`Hi, ${user.fullName.split(" ")[0]}`} subtitle="Your profile vault — everything we've learned from your documents, ready to reuse." />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatTile label="Documents" value={docs.length} icon={IconDoc} accent href="/documents" />
        <StatTile label="Quotes" value={quotes.length} icon={IconSparkles} href={quotes.length ? "#quotes" : "/quote"} />
        <StatTile label="Upcoming" value={appts.length} icon={IconCalendar} href={appts.length ? "#appointments" : "/schedule"} />
        <StatTile label="Vehicles" value={profile.vehicles.length} icon={IconCar} href={profile.vehicles.length ? "#vehicles" : "/documents"} />
      </div>

      {docs.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            icon={IconDoc}
            title="Your vault is empty"
            body="Upload a current policy or try one of our samples — we'll read it and build your profile automatically."
            href="/documents"
            cta="Add your first document"
          />
        </div>
      ) : (
        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          <SectionCard title="Contact" action={<IconUser className="h-4 w-4 text-slate-300" />}>
            <DataRow label="Name" value={user.fullName} />
            <DataRow label="Email" value={user.email} />
            <DataRow label="Phone" value={user.phone} />
            <DataRow label="Address" value={profile.addresses[0]} />
          </SectionCard>

          {profile.policies.length > 0 && (
            <SectionCard title="Current coverage">
              <div className="space-y-2.5">
                {profile.policies.map((p, i) => (
                  <div key={i} className="rounded-xl border border-slate-200 p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-brand-900">{p.carrier || p.label}</span>
                      <span className="text-sm font-bold text-brand-700">{formatCurrency(p.premium)}</span>
                    </div>
                    <div className="mt-0.5 text-xs text-slate-500">
                      {p.label}{p.policyNumber ? ` · ${p.policyNumber}` : ""}{p.expires ? ` · expires ${formatDate(p.expires)}` : ""}
                    </div>
                  </div>
                ))}
              </div>
            </SectionCard>
          )}

          {profile.vehicles.length > 0 && (
            <SectionCard id="vehicles" title="Vehicles" action={<IconCar className="h-4 w-4 text-slate-300" />}>
              <div className="space-y-2">
                {profile.vehicles.map((v, i) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <span className="font-medium text-brand-950">{[v.year, v.make, v.model].filter(Boolean).join(" ")}</span>
                    <span className="font-mono text-xs text-slate-400">{v.vin}</span>
                  </div>
                ))}
              </div>
            </SectionCard>
          )}

          {profile.drivers.length > 0 && (
            <SectionCard title="Drivers" action={<IconUser className="h-4 w-4 text-slate-300" />}>
              <div className="space-y-2">
                {profile.drivers.map((d, i) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <span className="font-medium text-brand-950">{d.name}</span>
                    <span className="text-xs text-slate-400">{d.license}{d.dob ? ` · ${formatDate(d.dob)}` : ""}</span>
                  </div>
                ))}
              </div>
            </SectionCard>
          )}

          {profile.properties.map((p, i) => (
            <SectionCard key={`prop${i}`} title="Property" action={<IconHome className="h-4 w-4 text-slate-300" />}>
              <DataRow label="Address" value={p.address} />
              <DataRow label="Year built" value={p.yearBuilt} />
              <DataRow label="Construction" value={p.construction} />
              <DataRow label="Dwelling (Cov A)" value={formatCurrency(p.coverageA)} />
            </SectionCard>
          ))}

          {profile.businesses.map((b, i) => (
            <SectionCard key={`biz${i}`} title="Business" action={<IconBriefcase className="h-4 w-4 text-slate-300" />}>
              <DataRow label="Name" value={b.name} />
              <DataRow label="Entity" value={b.entityType} />
              <DataRow label="Operations" value={b.description} />
              <DataRow label="Each occurrence" value={formatCurrency(b.eachOccurrence)} />
              <DataRow label="General aggregate" value={formatCurrency(b.generalAggregate)} />
            </SectionCard>
          ))}
        </div>
      )}

      {quotes.length > 0 && (
        <section id="quotes" className="mt-8 scroll-mt-24">
          <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-500">Your quotes</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {quotes.map((q) => (
              <div key={q.id} className="card p-4">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-brand-900">
                    {q.lines.map((l) => QUOTE_LINES.find((x) => x.id === l.line)?.label ?? l.line).join(", ")}
                  </span>
                  <StatusChip status={q.status} />
                </div>
                {q.notes && <p className="mt-2 text-sm text-slate-500">{q.notes}</p>}
                <p className="mt-2 text-xs text-slate-400">Submitted {formatDate(q.createdAt)}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {appts.length > 0 && (
        <section id="appointments" className="mt-8 scroll-mt-24">
          <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-500">Upcoming appointments</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {appts.map((a) => (
              <div key={a.id} className="card flex items-center gap-3 p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
                  <IconCalendar className="h-5 w-5" />
                </div>
                <div>
                  <div className="font-semibold text-brand-900">{a.eventType}</div>
                  <div className="text-xs text-slate-500">{formatDateTime(a.startsAt)}</div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <div className="mt-8 flex flex-wrap gap-3">
        <Link href="/documents" className="btn-secondary"><IconDoc className="h-4 w-4" /> Add a document</Link>
        <Link href="/quote" className="btn-primary"><IconSparkles className="h-4 w-4" /> Start a quote</Link>
        <Link href="/schedule" className="btn-secondary"><IconCalendar className="h-4 w-4" /> Book a time</Link>
      </div>
    </div>
  );
}
