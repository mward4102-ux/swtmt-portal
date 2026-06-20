import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/PageHeader";
import { Scheduler } from "@/components/schedule/Scheduler";
import { requireUser } from "@/lib/auth";
import { config } from "@/lib/config";

export const metadata: Metadata = { title: "Schedule" };
export const dynamic = "force-dynamic";

export default async function SchedulePage() {
  const user = await requireUser();
  return (
    <div>
      <PageHeader title="Book a time" subtitle="Grab a slot with Beach Stanton — confirmations are sent instantly and synced to our calendar." />
      <Scheduler
        defaultName={user.fullName}
        defaultEmail={user.email}
        defaultPhone={user.phone}
        calLink={config.cal.link || undefined}
      />
    </div>
  );
}
