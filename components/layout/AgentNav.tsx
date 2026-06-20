"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/brand/Logo";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { IconGrid } from "@/components/ui/icons";
import { cn, initials } from "@/lib/utils";
import type { SessionUser } from "@/lib/types";

export function AgentNav({ user }: { user: SessionUser }) {
  const pathname = usePathname();
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/85 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" aria-label="Dashboard"><Logo subtitle={false} /></Link>
          <span className="chip bg-brand-900 text-white">Agent</span>
        </div>

        <nav className="hidden md:flex">
          <Link
            href="/dashboard"
            className={cn(
              "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition",
              pathname.startsWith("/dashboard") ? "bg-brand-50 text-brand-700" : "text-slate-600 hover:bg-slate-100",
            )}
          >
            <IconGrid className="h-4 w-4" /> Dashboard
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <div className="hidden text-right sm:block">
            <div className="text-sm font-semibold leading-tight text-brand-900">{user.fullName}</div>
            <div className="text-xs text-slate-400">{user.email}</div>
          </div>
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-900 text-sm font-bold text-white">
            {initials(user.fullName)}
          </div>
          <LogoutButton compact />
        </div>
      </div>
    </header>
  );
}
