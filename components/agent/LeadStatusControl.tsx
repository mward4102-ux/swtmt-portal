"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LEAD_STATUSES, type LeadStatus } from "@/lib/types";
import { titleCase } from "@/lib/utils";

export function LeadStatusControl({ leadId, status }: { leadId: string; status: LeadStatus }) {
  const router = useRouter();
  const [value, setValue] = useState<LeadStatus>(status);
  const [busy, setBusy] = useState(false);

  async function change(next: LeadStatus) {
    setValue(next);
    setBusy(true);
    await fetch(`/api/leads/${leadId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next }),
    });
    setBusy(false);
    router.refresh();
  }

  return (
    <select
      className="select w-auto py-2 text-sm font-semibold"
      value={value}
      disabled={busy}
      onChange={(e) => change(e.target.value as LeadStatus)}
      aria-label="Lead status"
    >
      {LEAD_STATUSES.map((s) => (
        <option key={s} value={s}>{titleCase(s)}</option>
      ))}
    </select>
  );
}
