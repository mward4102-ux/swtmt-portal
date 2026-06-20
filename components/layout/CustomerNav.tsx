"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/brand/Logo";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { IconCalendar, IconDoc, IconSparkles, IconUser } from "@/components/ui/icons";
import { cn, initials } from "@/lib/utils";
import type { SessionUser } from "@/lib/types";

const NAV = [
  { href: "/profile", label: "Profile", icon: IconUser },
  { href: "/documents", label: "Documents", icon: IconDoc },
  { href: "/quote", label: "Quote", icon: IconSparkles },
  { href: "/schedule", label: "Schedule", icon: IconCalendar },
];

export function CustomerNav({ user }: { user: SessionUser }) {
  const pathname = usePathname();
  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/85 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3">
          <Link href="/profile" aria-label="Home"><Logo subtitle={false} /></Link>

          <nav className="hidden items-center gap-1 md:flex">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition",
                  isActive(item.href) ? "bg-brand-50 text-brand-700" : "text-slate-600 hover:bg-slate-100",
                )}
              >
                <item.icon className="h-4 w-4" /> {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <div className="text-sm font-semibold leading-tight text-brand-900">{user.fullName}</div>
              <div className="text-xs text-slate-400">{user.email}</div>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-700">
              {initials(user.fullName)}
            </div>
            <LogoutButton compact />
          </div>
        </div>
      </header>

      {/* Mobile bottom tab bar */}
      <nav className="safe-bottom fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white/95 backdrop-blur md:hidden">
        <div className="mx-auto grid max-w-5xl grid-cols-4">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-0.5 py-2 text-[11px] font-medium transition",
                isActive(item.href) ? "text-brand-700" : "text-slate-400",
              )}
            >
              <item.icon className="h-5 w-5" /> {item.label}
            </Link>
          ))}
        </div>
      </nav>
    </>
  );
}
