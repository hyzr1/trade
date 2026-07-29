// lib/format.ts
export function formatPct(n: number | null | undefined, opts: { precision?: number } = {}): string {
  if (n == null || !isFinite(n)) return "—";
  const sign = n >= 0 ? "+" : "";
  return `${sign}${n.toFixed(opts.precision ?? 1)}%`;
}

export function formatDateRelative(iso: string): string {
  const then = new Date(iso).getTime();
  if (!isFinite(then)) return iso;
  const days = Math.floor((Date.now() - then) / 86400000);
  if (days <= 0) return "today";
  if (days === 1) return "yesterday";
  if (days < 14) return `${days} days ago`;
  if (days < 60) return `${Math.floor(days / 7)} weeks ago`;
  if (days < 730) return `${Math.floor(days / 30)} months ago`;
  return `${Math.floor(days / 365)} years ago`;
}

export function formatDateLong(iso: string): string {
  const d = new Date(iso);
  if (!isFinite(d.getTime())) return iso;
  return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

export function initialsFor(name: string): string {
  const parts = name.split(/\s+/).filter(Boolean);
  return parts.map((w) => w[0]).join("").slice(0, 2).toUpperCase();
}

export function labelFor(slug: string): string {
  const map: Record<string, string> = {
    pelosi: "House Rep · CA · D",
    crenshaw: "House Rep · TX · R",
    tuberville: "Senator · AL · R",
    greene: "House Rep · GA · R",
    gpt: "OpenAI · weekly",
    claude: "Anthropic · weekly",
  };
  return map[slug] ?? "";
}
