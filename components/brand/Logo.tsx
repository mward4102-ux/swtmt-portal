import { cn } from "@/lib/utils";

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 512 512" className={cn("h-9 w-9", className)} aria-hidden="true">
      <defs>
        <linearGradient id="bsmark" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#2a86d0" />
          <stop offset="0.55" stopColor="#125a9e" />
          <stop offset="1" stopColor="#0a223c" />
        </linearGradient>
      </defs>
      <rect width="512" height="512" rx="120" fill="url(#bsmark)" />
      <circle cx="256" cy="196" r="62" fill="#ffffff" fillOpacity="0.96" />
      <g fill="none" stroke="#ffffff" strokeWidth="22" strokeLinecap="round">
        <path d="M64 322 q48 -42 96 0 t96 0 t96 0 t96 0" strokeOpacity="0.96" />
        <path d="M64 378 q48 -42 96 0 t96 0 t96 0 t96 0" strokeOpacity="0.7" />
        <path d="M64 434 q48 -42 96 0 t96 0 t96 0 t96 0" strokeOpacity="0.45" />
      </g>
    </svg>
  );
}

export function Logo({ className, subtitle = true }: { className?: string; subtitle?: boolean }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <LogoMark />
      <span className="leading-tight">
        <span className="block text-[15px] font-extrabold tracking-tight text-brand-900">Beach Stanton</span>
        {subtitle && <span className="block text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-500">Insurance</span>}
      </span>
    </span>
  );
}
