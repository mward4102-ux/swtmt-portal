import { cn, titleCase } from "@/lib/utils";
import { DOC_TYPE_LABELS, REVIEW_THRESHOLD, type DocType } from "@/lib/canonical";

const STATUS_STYLES: Record<string, string> = {
  // leads
  new: "bg-sky-100 text-sky-700",
  in_progress: "bg-amber-100 text-amber-700",
  quoted: "bg-violet-100 text-violet-700",
  closed: "bg-slate-100 text-slate-600",
  // quotes
  submitted: "bg-sky-100 text-sky-700",
  draft: "bg-slate-100 text-slate-600",
  // appts / docs
  booked: "bg-emerald-100 text-emerald-700",
  completed: "bg-slate-100 text-slate-600",
  canceled: "bg-rose-100 text-rose-700",
  reviewed: "bg-emerald-100 text-emerald-700",
  "needs review": "bg-amber-100 text-amber-700",
};

export function StatusChip({ status, className }: { status: string; className?: string }) {
  return (
    <span className={cn("chip", STATUS_STYLES[status] ?? "bg-slate-100 text-slate-600", className)}>
      {titleCase(status)}
    </span>
  );
}

export function DocTypeBadge({ docType, className }: { docType: DocType; className?: string }) {
  return (
    <span className={cn("chip bg-brand-50 text-brand-700", className)}>{DOC_TYPE_LABELS[docType]}</span>
  );
}

export function ConfidenceBadge({ confidence, className }: { confidence: number; className?: string }) {
  const pct = Math.round(confidence * 100);
  const style =
    confidence >= 0.9
      ? "bg-emerald-100 text-emerald-700"
      : confidence >= REVIEW_THRESHOLD
        ? "bg-sky-100 text-sky-700"
        : "bg-amber-100 text-amber-800";
  return <span className={cn("chip tabular-nums", style, className)}>{pct}%</span>;
}

export function ReviewBadge({ className }: { className?: string }) {
  return (
    <span className={cn("chip bg-amber-100 text-amber-800", className)}>
      <span className="h-1.5 w-1.5 rounded-full bg-amber-500" /> Needs review
    </span>
  );
}
