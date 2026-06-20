import Link from "next/link";
import { recordSubject } from "@/lib/canonical";
import { ConfidenceBadge, DocTypeBadge, ReviewBadge } from "@/components/ui/chips";
import { IconDoc, IconDownload } from "@/components/ui/icons";
import { formatBytes, timeAgo } from "@/lib/utils";
import type { StoredDocument } from "@/lib/types";

export function DocumentCard({ doc, href }: { doc: StoredDocument; href?: string }) {
  const subject = recordSubject(doc.record);
  const body = (
    <div className="flex items-start gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
        <IconDoc className="h-5 w-5" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <DocTypeBadge docType={doc.docType} />
          {!doc.reviewed && <ReviewBadge />}
        </div>
        <p className="mt-1.5 truncate text-sm font-semibold text-brand-950">{subject}</p>
        <p className="truncate text-xs text-slate-400">
          {doc.fileName} · {formatBytes(doc.sizeBytes)} · {timeAgo(doc.uploadedAt)}
        </p>
      </div>
      <div className="flex flex-col items-end gap-2">
        <ConfidenceBadge confidence={doc.record.overall_confidence} />
        {doc.binaryRetained && (
          <Link
            href={`/api/documents/${doc.id}/file`}
            target="_blank"
            className="inline-flex items-center gap-1 text-xs font-medium text-brand-600 hover:text-brand-800"
          >
            <IconDownload className="h-3.5 w-3.5" /> View
          </Link>
        )}
      </div>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="card block p-4 transition hover:-translate-y-0.5 hover:shadow-lg">
        {body}
      </Link>
    );
  }
  return <div className="card p-4">{body}</div>;
}
