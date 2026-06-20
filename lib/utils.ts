// Small, dependency-free helpers shared across server + client.

/** Conditional className join (tiny clsx replacement). */
export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

/** Stable-ish unique id. Uses crypto.randomUUID where available. */
export function uid(prefix = ""): string {
  const id =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : Math.random().toString(36).slice(2) + Date.now().toString(36);
  return prefix ? `${prefix}_${id}` : id;
}

/** Format an ISO date (YYYY-MM-DD or full ISO) as "Mon D, YYYY". */
export function formatDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso.length <= 10 ? `${iso}T00:00:00` : iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

/** Relative time like "3 days ago" / "in 2 hours". */
export function timeAgo(iso: string): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "";
  const diff = then - Date.now();
  const abs = Math.abs(diff);
  const units: [number, Intl.RelativeTimeFormatUnit][] = [
    [1000 * 60, "minute"],
    [1000 * 60 * 60, "hour"],
    [1000 * 60 * 60 * 24, "day"],
    [1000 * 60 * 60 * 24 * 7, "week"],
    [1000 * 60 * 60 * 24 * 30, "month"],
  ];
  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
  if (abs < units[0][0]) return "just now";
  let chosen = units[0];
  for (const u of units) if (abs >= u[0]) chosen = u;
  return rtf.format(Math.round(diff / chosen[0]), chosen[1]);
}

/** Coerce a dollar-ish string/number into "$1,842.00"; passes through text. */
export function formatCurrency(value: string | number | null | undefined): string {
  if (value === null || value === undefined || value === "") return "—";
  const num = typeof value === "number" ? value : Number(String(value).replace(/[^0-9.\-]/g, ""));
  if (Number.isNaN(num) || String(value).match(/[\/a-zA-Z]/)) return String(value);
  return num.toLocaleString("en-US", { style: "currency", currency: "USD" });
}

export function formatBytes(bytes: number | null | undefined): string {
  if (!bytes || bytes < 0) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

export function titleCase(s: string): string {
  return s.replace(/[_-]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

/** Normalize a person/business name for cross-document identity stitching. */
export function normalizeName(name: string | null | undefined): string {
  if (!name) return "";
  return name
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/\b(llc|inc|incorporated|co|corp|company|ltd)\b/g, "")
    .replace(/[^a-z0-9 ]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Pull a 5-digit-ish state guess out of a free-form address (CA default). */
export function stateFromAddress(addr: string | null | undefined): string {
  if (!addr) return "CA";
  const m = addr.match(/\b([A-Z]{2})\s+\d{5}\b/);
  return m ? m[1] : "CA";
}
