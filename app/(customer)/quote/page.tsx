import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/PageHeader";
import { QuoteWizard } from "@/components/quote/QuoteWizard";

export const metadata: Metadata = { title: "Request a quote" };
export const dynamic = "force-dynamic";

export default function QuotePage() {
  return (
    <div>
      <PageHeader
        title="Request a quote"
        subtitle="Tell us what you need — or upload a current policy and we'll prefill it. You can save and come back anytime."
      />
      <QuoteWizard />
    </div>
  );
}
