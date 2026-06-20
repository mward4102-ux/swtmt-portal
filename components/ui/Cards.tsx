import Link from "next/link";
import type { ComponentType, SVGProps } from "react";
import { cn } from "@/lib/utils";

type IconType = ComponentType<SVGProps<SVGSVGElement>>;

export function StatTile({ label, value, icon: Icon, accent }: { label: string; value: string | number; icon: IconType; accent?: boolean }) {
  return (
    <div className={cn("card flex items-center gap-3 p-4", accent && "border-brand-200 bg-brand-50/50")}>
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-100 text-brand-600">
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <div className="text-xl font-extrabold leading-none text-brand-950">{value}</div>
        <div className="mt-1 text-xs font-medium text-slate-500">{label}</div>
      </div>
    </div>
  );
}

export function DataRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-slate-100 py-2 last:border-0">
      <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</span>
      <span className="text-right text-sm font-medium text-brand-950">{value || <span className="text-slate-300">—</span>}</span>
    </div>
  );
}

export function SectionCard({ title, action, children, className }: { title: string; action?: React.ReactNode; children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("card p-5", className)}>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-bold uppercase tracking-wide text-slate-500">{title}</h2>
        {action}
      </div>
      {children}
    </div>
  );
}

export function EmptyState({ icon: Icon, title, body, href, cta }: { icon: IconType; title: string; body: string; href?: string; cta?: string }) {
  return (
    <div className="card flex flex-col items-center justify-center gap-3 p-10 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
        <Icon className="h-6 w-6" />
      </div>
      <div>
        <p className="font-semibold text-brand-900">{title}</p>
        <p className="mt-1 max-w-sm text-sm text-slate-500">{body}</p>
      </div>
      {href && cta && (
        <Link href={href} className="btn-primary btn-sm mt-1">{cta}</Link>
      )}
    </div>
  );
}
