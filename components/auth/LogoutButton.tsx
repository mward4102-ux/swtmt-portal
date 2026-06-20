"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { IconLogout } from "@/components/ui/icons";
import { cn } from "@/lib/utils";

export function LogoutButton({ className, compact }: { className?: string; compact?: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  return (
    <button
      className={cn(compact ? "btn-ghost btn-sm" : "btn-secondary btn-sm", className)}
      disabled={busy}
      onClick={async () => {
        setBusy(true);
        await fetch("/api/auth/logout", { method: "POST" });
        router.push("/");
        router.refresh();
      }}
      title="Sign out"
    >
      <IconLogout className="h-4 w-4" />
      {!compact && <span>Sign out</span>}
    </button>
  );
}
