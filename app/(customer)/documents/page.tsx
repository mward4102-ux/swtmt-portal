import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/PageHeader";
import { DocumentUploader } from "@/components/documents/DocumentUploader";
import { DocumentCard } from "@/components/documents/DocumentCard";
import { IconShield } from "@/components/ui/icons";
import { requireUser } from "@/lib/auth";
import { config } from "@/lib/config";
import { getDb } from "@/lib/db";

export const metadata: Metadata = { title: "Documents" };
export const dynamic = "force-dynamic";

export default async function DocumentsPage() {
  const user = await requireUser();
  const docs = getDb().getDocumentsByOwner(user.id);

  return (
    <div>
      <PageHeader
        title="Documents"
        subtitle="Upload a current policy, ID, or registration. Our AI reads it instantly — you confirm before anything is saved."
      />

      <DocumentUploader />

      <div className="mt-4 flex items-start gap-2 rounded-xl bg-slate-100/70 px-4 py-3 text-xs text-slate-500">
        <IconShield className="mt-0.5 h-4 w-4 shrink-0 text-brand-500" />
        <span>
          {config.piiStorageEnabled
            ? "PII storage is enabled — document binaries are retained securely."
            : "Privacy by default: uploaded files are processed transiently. Only the structured summary you confirm is kept — binaries are dropped after extraction."}
        </span>
      </div>

      {docs.length > 0 && (
        <section className="mt-8">
          <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-500">Your documents</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {docs.map((doc) => (
              <DocumentCard key={doc.id} doc={doc} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
