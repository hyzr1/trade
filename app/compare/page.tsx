// app/compare/page.tsx
"use client";
import { useEffect, useMemo, useRef, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown,
  GitCompareArrows,
  Plus,
  X,
  Trophy,
} from "lucide-react";
import { DeskShell } from "@/components/desk/DeskShell";
import {
  BG_2,
  LINE,
  LINE_2,
  NEGATIVE,
  POSITIVE,
  TEXT_HI,
  TEXT_LOW,
  TEXT_MID,
  VIOLET,
  VIOLET_2,
  YELLOW,
} from "@/lib/theme";

type ComparePortfolio = {
  slug: string;
  name: string;
  kind: "politician" | "llm";
  meta: {
    party?: string;
    chamber?: string;
    district?: string;
    role?: string;
    estAUM?: string;
    house?: string;
    modelId?: string;
  };
  ytdReturn: number | null;
  return30d: number | null;
  holdingsCount: number;
  lastFilingDate: string | null;
  topHoldings: { ticker: string; weight: number; sector: string }[];
  allTickers: string[];
  recentTransactions: {
    id: string;
    ticker: string;
    action: "buy" | "sell";
    tradeDate: string;
    disclosedDate: string;
  }[];
  portfolioSeries: { date: string; value: number }[];
  sectorWeights: { sector: string; weight: number; color: string }[];
  aiConfirmedPct: number;
};

type CompareResponse = {
  portfolios: ComparePortfolio[];
  spy: { date: string; value: number }[];
  overlapMatrix: number[][];
};

const ALL_SLUGS: { slug: string; name: string; kind: "politician" | "llm" }[] = [
  { slug: "pelosi", name: "Nancy Pelosi", kind: "politician" },
  { slug: "greene", name: "M.T. Greene", kind: "politician" },
  { slug: "gottheimer", name: "Josh Gottheimer", kind: "politician" },
  { slug: "hern", name: "Kevin Hern", kind: "politician" },
  { slug: "gpt", name: "GPT-5", kind: "llm" },
  { slug: "claude", name: "Claude", kind: "llm" },
];

const MAX_PORTFOLIOS = 4;
const MIN_PORTFOLIOS = 2;

/** Distinct line palette — order matters; ACCENTS[0] is first column accent. */
const ACCENTS = [VIOLET_2, YELLOW, "#4ADE80", "#60A5FA"];

const KEYS = ["a", "b", "c", "d"] as const;

export default function ComparePage() {
  return (
    <Suspense fallback={<DeskShell breadcrumb="Compare"><LoadingShimmer /></DeskShell>}>
      <CompareInner />
    </Suspense>
  );
}

function CompareInner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Parse slugs from URL: a,b,c,d in order. Fallback to pelosi/gpt.
  const slugsFromUrl = useMemo(() => {
    const slugsParam = searchParams.get("slugs");
    if (slugsParam) {
      return slugsParam
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
        .slice(0, MAX_PORTFOLIOS);
    }
    const out: string[] = [];
    for (const k of KEYS) {
      const v = searchParams.get(k);
      if (v) out.push(v);
    }
    if (out.length === 0) return ["pelosi", "gpt"];
    return out.slice(0, MAX_PORTFOLIOS);
  }, [searchParams]);

  const [data, setData] = useState<CompareResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const qs = `slugs=${slugsFromUrl.map(encodeURIComponent).join(",")}`;
    fetch(`/api/compare?${qs}`)
      .then((r) => r.json())
      .then((j: CompareResponse) => setData(j))
      .finally(() => setLoading(false));
  }, [slugsFromUrl]);

  const setSlugs = (next: string[]) => {
    const params = new URLSearchParams(searchParams.toString());
    // Wipe legacy a/b/c/d so they don't ghost in URL.
    for (const k of KEYS) params.delete(k);
    params.set("slugs", next.join(","));
    router.push(`/compare?${params.toString()}`);
  };

  const changeSlug = (idx: number, slug: string) => {
    const next = [...slugsFromUrl];
    next[idx] = slug;
    setSlugs(next);
  };

  const addSlug = () => {
    if (slugsFromUrl.length >= MAX_PORTFOLIOS) return;
    // Pick the first non-included slug.
    const used = new Set(slugsFromUrl);
    const candidate = ALL_SLUGS.find((s) => !used.has(s.slug))?.slug;
    if (!candidate) return;
    setSlugs([...slugsFromUrl, candidate]);
  };

  const removeSlug = (idx: number) => {
    if (slugsFromUrl.length <= MIN_PORTFOLIOS) return;
    const next = slugsFromUrl.filter((_, i) => i !== idx);
    setSlugs(next);
  };

  return (
    <DeskShell breadcrumb="Compare">
      <div className="flex flex-wrap items-baseline justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <GitCompareArrows size={20} style={{ color: VIOLET_2 }} />
          <div>
            <h1
              className="text-[22px] sm:text-[26px] font-semibold tracking-tight"
              style={{ color: TEXT_HI }}
            >
              Compare
            </h1>
            <p className="text-[13px] mt-0.5" style={{ color: TEXT_MID }}>
              Up to four portfolios, side by side
            </p>
          </div>
        </div>
        <div
          className="font-mono text-[10.5px] uppercase tracking-[0.16em]"
          style={{ color: TEXT_LOW }}
        >
          {slugsFromUrl.length} of {MAX_PORTFOLIOS}
        </div>
      </div>

      {loading || !data ? (
        <LoadingShimmer />
      ) : (
        <>
          <PortfolioPickers
            portfolios={data.portfolios}
            onChange={changeSlug}
            onRemove={removeSlug}
            onAdd={addSlug}
            canAdd={data.portfolios.length < MAX_PORTFOLIOS}
            canRemove={data.portfolios.length > MIN_PORTFOLIOS}
          />
          <MetricTable portfolios={data.portfolios} />
          <OverlayChart portfolios={data.portfolios} spy={data.spy} />
          <SectorBarsGrouped portfolios={data.portfolios} />
          <ActivityColumns portfolios={data.portfolios} />
          <OverlapMatrix portfolios={data.portfolios} matrix={data.overlapMatrix} />
        </>
      )}
    </DeskShell>
  );
}

function LoadingShimmer() {
  return (
    <div className="space-y-4">
      {[140, 120, 320, 220, 280, 220].map((h, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0.3 }}
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 1.4, repeat: Infinity, delay: i * 0.15 }}
          className="rounded-2xl"
          style={{
            height: h,
            background: "rgba(255,255,255,0.025)",
            border: `1px solid ${LINE_2}`,
          }}
        />
      ))}
    </div>
  );
}

/* ─────────────── Portfolio pickers (horizontal grid) ─────────────── */

function PortfolioPickers({
  portfolios,
  onChange,
  onRemove,
  onAdd,
  canAdd,
  canRemove,
}: {
  portfolios: ComparePortfolio[];
  onChange: (idx: number, slug: string) => void;
  onRemove: (idx: number) => void;
  onAdd: () => void;
  canAdd: boolean;
  canRemove: boolean;
}) {
  return (
    <div
      className="grid gap-3"
      style={{
        gridTemplateColumns: `repeat(auto-fit, minmax(220px, 1fr))`,
      }}
    >
      {portfolios.map((p, i) => (
        <PortfolioPickerCard
          key={`${p.slug}-${i}`}
          p={p}
          idx={i}
          accent={ACCENTS[i % ACCENTS.length]}
          onChange={onChange}
          onRemove={onRemove}
          canRemove={canRemove}
          usedSlugs={new Set(portfolios.map((q) => q.slug))}
        />
      ))}
      {canAdd && <AddPortfolioCard onAdd={onAdd} />}
    </div>
  );
}

function PortfolioPickerCard({
  p,
  idx,
  accent,
  onChange,
  onRemove,
  canRemove,
  usedSlugs,
}: {
  p: ComparePortfolio;
  idx: number;
  accent: string;
  onChange: (idx: number, slug: string) => void;
  onRemove: (idx: number) => void;
  canRemove: boolean;
  usedSlugs: Set<string>;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  const initials = p.name
    .split(/\s+/)
    .slice(0, 2)
    .map((s) => s[0])
    .join("")
    .toUpperCase();

  return (
    <div
      className="relative rounded-2xl p-4"
      style={{
        background:
          "linear-gradient(180deg, rgba(255,255,255,0.025) 0%, rgba(255,255,255,0.005) 100%)",
        border: `1px solid ${LINE_2}`,
        boxShadow: `inset 0 1px 0 rgba(255,255,255,0.04), 0 0 0 1px ${accent}11`,
      }}
      ref={ref}
    >
      {/* Remove × */}
      {canRemove && (
        <button
          aria-label={`Remove ${p.name}`}
          onClick={() => onRemove(idx)}
          className="absolute top-2 right-2 inline-flex items-center justify-center w-6 h-6 rounded-md transition-colors hover:bg-white/10 select-none"
          style={{ color: TEXT_LOW }}
        >
          <X size={12} />
        </button>
      )}

      <div className="flex items-center gap-3">
        <div
          className="shrink-0 w-11 h-11 rounded-xl inline-flex items-center justify-center font-mono text-[14px] font-bold tabular-nums"
          style={{
            background: `linear-gradient(135deg, ${accent}33 0%, ${accent}11 100%)`,
            color: accent,
            border: `1px solid ${accent}44`,
          }}
        >
          {initials}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span
              className="font-mono text-[9px] uppercase tracking-[0.18em] px-1.5 py-0.5 rounded-sm"
              style={{
                background: p.kind === "llm" ? "rgba(247,210,74,0.12)" : "rgba(124,95,255,0.14)",
                color: p.kind === "llm" ? YELLOW : VIOLET_2,
              }}
            >
              {p.kind === "llm" ? "AI" : "POL"}
            </span>
          </div>
          <button
            onClick={() => setOpen((v) => !v)}
            className="mt-0.5 flex items-center gap-1.5 text-left group max-w-full"
          >
            <h2
              className="text-[15px] font-semibold tracking-tight truncate group-hover:opacity-80 transition-opacity"
              style={{ color: TEXT_HI }}
            >
              {p.name}
            </h2>
            <ChevronDown
              size={12}
              style={{
                color: TEXT_LOW,
                transform: open ? "rotate(180deg)" : "none",
                transition: "transform .15s",
              }}
            />
          </button>
          <div className="text-[11px]" style={{ color: TEXT_MID }}>
            {p.kind === "llm"
              ? `${p.meta.house ?? ""}${p.meta.modelId ? " · " + p.meta.modelId : ""}`
              : `${p.meta.role ?? ""}${p.meta.district ? " · " + p.meta.district : ""}`}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.14 }}
            className="absolute left-3 right-3 top-[78px] z-30 rounded-xl p-1.5"
            style={{
              background: BG_2,
              border: `1px solid ${LINE_2}`,
              boxShadow: "0 30px 80px -20px rgba(0,0,0,0.8)",
            }}
          >
            {ALL_SLUGS.map((opt) => {
              const isUsedElsewhere = usedSlugs.has(opt.slug) && opt.slug !== p.slug;
              return (
                <button
                  key={opt.slug}
                  disabled={isUsedElsewhere}
                  onClick={() => {
                    if (isUsedElsewhere) return;
                    onChange(idx, opt.slug);
                    setOpen(false);
                  }}
                  className="w-full flex items-center justify-between gap-2 px-3 py-1.5 rounded-md text-[12.5px] transition-colors hover:bg-white/5 disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{ color: opt.slug === p.slug ? TEXT_HI : TEXT_MID }}
                >
                  <span className="flex items-center gap-2">
                    <span
                      className="font-mono text-[9px] uppercase tracking-[0.18em] px-1.5 py-0.5 rounded-sm"
                      style={{
                        background:
                          opt.kind === "llm"
                            ? "rgba(247,210,74,0.12)"
                            : "rgba(124,95,255,0.14)",
                        color: opt.kind === "llm" ? YELLOW : VIOLET_2,
                      }}
                    >
                      {opt.kind === "llm" ? "AI" : "POL"}
                    </span>
                    {opt.name}
                  </span>
                  {opt.slug === p.slug && (
                    <span
                      className="font-mono text-[10px]"
                      style={{ color: accent }}
                    >
                      current
                    </span>
                  )}
                  {isUsedElsewhere && (
                    <span
                      className="font-mono text-[10px]"
                      style={{ color: TEXT_LOW }}
                    >
                      added
                    </span>
                  )}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function AddPortfolioCard({ onAdd }: { onAdd: () => void }) {
  return (
    <button
      onClick={onAdd}
      className="rounded-2xl p-4 flex items-center justify-center gap-2 transition-colors hover:bg-white/[0.03] select-none active:scale-[0.99]"
      style={{
        background: "rgba(255,255,255,0.01)",
        border: `1px dashed ${LINE_2}`,
        color: TEXT_MID,
        minHeight: 100,
      }}
    >
      <Plus size={14} />
      <span className="text-[13px] font-medium">Add portfolio</span>
    </button>
  );
}

/* ─────────────── Metric comparison table ─────────────── */

type MetricRow = {
  key: string;
  label: string;
  /** Sort key: number or null. null treated as -Infinity for highest-wins, +Infinity for lowest-wins. */
  values: (number | null)[];
  /** Display strings, parallel to values. */
  display: string[];
  /** "high" = bigger wins, "low" = smaller wins, "neutral" = no highlight. */
  bestRule: "high" | "low" | "neutral";
};

function MetricTable({ portfolios }: { portfolios: ComparePortfolio[] }) {
  const rows = useMemo<MetricRow[]>(() => {
    const fmtPct = (n: number | null) =>
      n === null ? "—" : `${n >= 0 ? "+" : ""}${n.toFixed(1)}%`;
    const fmtPctRet30 = (n: number | null) =>
      n === null ? "—" : `${n >= 0 ? "+" : ""}${(n * 100).toFixed(1)}%`;
    return [
      {
        key: "ytd",
        label: "YTD return",
        values: portfolios.map((p) => p.ytdReturn),
        display: portfolios.map((p) => fmtPct(p.ytdReturn)),
        bestRule: "high" as const,
      },
      {
        key: "30d",
        label: "30-day return",
        values: portfolios.map((p) => p.return30d),
        display: portfolios.map((p) => fmtPctRet30(p.return30d)),
        bestRule: "high" as const,
      },
      {
        key: "holdings",
        label: "Holdings count",
        values: portfolios.map((p) => p.holdingsCount),
        display: portfolios.map((p) => String(p.holdingsCount)),
        bestRule: "neutral" as const,
      },
      {
        key: "ai",
        label: "AI confirmed",
        values: portfolios.map((p) => p.aiConfirmedPct),
        display: portfolios.map((p) => `${p.aiConfirmedPct.toFixed(0)}%`),
        bestRule: "high" as const,
      },
      {
        key: "last",
        label: "Last filing",
        values: portfolios.map((p) =>
          p.lastFilingDate ? new Date(p.lastFilingDate).getTime() : null,
        ),
        display: portfolios.map((p) =>
          p.lastFilingDate ? fmtDate(p.lastFilingDate) : "—",
        ),
        bestRule: "high" as const,
      },
    ];
  }, [portfolios]);

  // Compute "best index" per row
  const bestIdxFor = (row: MetricRow): number | null => {
    if (row.bestRule === "neutral") return null;
    const finite = row.values.map((v, i) => ({ v, i })).filter((x) => x.v !== null) as { v: number; i: number }[];
    if (finite.length < 2) return null;
    finite.sort((a, b) => (row.bestRule === "high" ? b.v - a.v : a.v - b.v));
    // Avoid lighting up "winner" if tied.
    if (finite.length >= 2 && finite[0].v === finite[1].v) return null;
    return finite[0].i;
  };

  return (
    <section
      className="rounded-2xl overflow-x-auto"
      style={{
        background:
          "linear-gradient(180deg, rgba(255,255,255,0.025) 0%, rgba(255,255,255,0.005) 100%)",
        border: `1px solid ${LINE_2}`,
      }}
    >
      <table className="min-w-full text-[12.5px]">
        <thead>
          <tr style={{ borderBottom: `1px solid ${LINE}` }}>
            <th
              className="text-left px-4 py-3 font-mono text-[10px] uppercase tracking-[0.16em]"
              style={{ color: TEXT_LOW, width: 160 }}
            >
              Metric
            </th>
            {portfolios.map((p, i) => (
              <th
                key={p.slug}
                className="text-right px-4 py-3 font-mono text-[10.5px] uppercase tracking-[0.16em]"
                style={{ color: ACCENTS[i % ACCENTS.length] }}
              >
                <span className="truncate inline-block max-w-[150px]">{p.name}</span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => {
            const bestIdx = bestIdxFor(r);
            return (
              <tr key={r.key} style={{ borderBottom: `1px solid ${LINE}` }}>
                <td
                  className="px-4 py-3 font-mono text-[10.5px] uppercase tracking-[0.14em]"
                  style={{ color: TEXT_MID }}
                >
                  {r.label}
                </td>
                {r.display.map((d, i) => {
                  const isBest = bestIdx === i;
                  return (
                    <td
                      key={i}
                      className="px-4 py-3 text-right font-mono tabular-nums text-[13px]"
                      style={{
                        background: isBest ? "rgba(247,210,74,0.10)" : "transparent",
                        color: isBest ? YELLOW : TEXT_HI,
                        position: "relative",
                      }}
                    >
                      <span className="inline-flex items-center gap-1.5 justify-end">
                        {isBest && <Trophy size={11} />}
                        <span>{d}</span>
                      </span>
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </section>
  );
}

/* ─────────────── Overlay chart (N lines + SPY) ─────────────── */

function OverlayChart({
  portfolios,
  spy,
}: {
  portfolios: ComparePortfolio[];
  spy: { date: string; value: number }[];
}) {
  const w = 1100;
  const h = 360;
  const pad = { l: 56, r: 16, t: 16, b: 36 };

  const { unifiedDates, dateIdx } = useMemo(() => {
    const set = new Set<string>();
    for (const p of portfolios) for (const d of p.portfolioSeries) set.add(d.date);
    for (const d of spy) set.add(d.date);
    const dates = Array.from(set).sort();
    const idx = new Map<string, number>();
    dates.forEach((d, i) => idx.set(d, i));
    return { unifiedDates: dates, dateIdx: idx };
  }, [portfolios, spy]);

  const { min, range } = useMemo(() => {
    const all = [...portfolios.flatMap((p) => p.portfolioSeries), ...spy];
    if (all.length === 0) return { min: 90, max: 110, range: 20 };
    const rmin = Math.min(...all.map((d) => d.value));
    const rmax = Math.max(...all.map((d) => d.value));
    const sp = rmax - rmin || 1;
    return { min: rmin - sp * 0.08, max: rmax + sp * 0.08, range: (rmax + sp * 0.08) - (rmin - sp * 0.08) };
  }, [portfolios, spy]);

  if (unifiedDates.length === 0) {
    return (
      <div
        className="rounded-2xl p-6 flex items-center justify-center"
        style={{
          height: 360,
          background: "rgba(255,255,255,0.02)",
          border: `1px solid ${LINE_2}`,
          color: TEXT_LOW,
        }}
      >
        No chart data
      </div>
    );
  }

  const innerW = w - pad.l - pad.r;
  const innerH = h - pad.t - pad.b;
  const x = (date: string) => {
    const idx = dateIdx.get(date) ?? 0;
    if (unifiedDates.length < 2) return pad.l;
    return pad.l + (idx / (unifiedDates.length - 1)) * innerW;
  };
  const y = (v: number) => pad.t + (1 - (v - min) / range) * innerH;
  const path = (s: { date: string; value: number }[]) =>
    s.length < 2
      ? ""
      : s
          .map(
            (d, i) =>
              `${i === 0 ? "M" : "L"} ${x(d.date).toFixed(1)} ${y(d.value).toFixed(1)}`,
          )
          .join(" ");
  const baselineY = y(100);

  const yTicks: { v: number; pct: number }[] = [];
  for (let i = 0; i <= 4; i++) {
    const v = min + range - (i / 4) * range;
    yTicks.push({ v, pct: v - 100 });
  }
  const xTicks: { date: string; label: string }[] = [];
  for (let i = 0; i < 4; i++) {
    const idx = Math.round((i / 3) * (unifiedDates.length - 1));
    const date = unifiedDates[Math.min(idx, unifiedDates.length - 1)];
    xTicks.push({ date, label: fmtMonth(date) });
  }

  return (
    <section
      className="rounded-2xl p-4 sm:p-6"
      style={{
        background:
          "linear-gradient(180deg, rgba(255,255,255,0.025) 0%, rgba(255,255,255,0.005) 100%)",
        border: `1px solid ${LINE_2}`,
      }}
    >
      <div className="flex items-center justify-between flex-wrap gap-2 mb-4">
        <div
          className="text-[10.5px] uppercase tracking-[0.16em]"
          style={{ color: TEXT_LOW }}
        >
          Performance overlay
        </div>
        <div
          className="flex items-center gap-4 text-[12px] flex-wrap"
          style={{ color: TEXT_MID }}
        >
          {portfolios.map((p, i) => (
            <span key={p.slug} className="inline-flex items-center gap-1.5">
              <span className="w-3 h-[2px]" style={{ background: ACCENTS[i % ACCENTS.length] }} />
              {p.name}
            </span>
          ))}
          <span className="inline-flex items-center gap-1.5">
            <span className="w-3 h-[2px]" style={{ background: TEXT_MID }} />
            SPY
          </span>
        </div>
      </div>
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-[360px]" aria-hidden>
        <defs>
          {portfolios.map((_, i) => (
            <linearGradient key={`grad-${i}`} id={`cmpGrad${i}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={ACCENTS[i % ACCENTS.length]} stopOpacity="0.12" />
              <stop offset="100%" stopColor={ACCENTS[i % ACCENTS.length]} stopOpacity="0" />
            </linearGradient>
          ))}
          <filter id="cmpGlow" x="-10%" y="-30%" width="120%" height="160%">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        {yTicks.map((t, i) => {
          const yy = y(t.v);
          const isBaseline = Math.abs(t.v - 100) < 0.5;
          return (
            <g key={i}>
              <line
                x1={pad.l}
                x2={w - pad.r}
                y1={yy}
                y2={yy}
                stroke={isBaseline ? "rgba(255,255,255,0.20)" : "rgba(255,255,255,0.05)"}
                strokeDasharray={isBaseline ? "4 4" : "2 4"}
              />
              <text
                x={pad.l - 10}
                y={yy + 3}
                textAnchor="end"
                fontFamily="var(--font-mono, ui-monospace, monospace)"
                fontSize="10"
                fill={isBaseline ? TEXT_MID : TEXT_LOW}
              >
                {fmtPct(t.pct)}
              </text>
            </g>
          );
        })}

        {/* Optional gradient under first portfolio only — keeps the chart legible. */}
        {portfolios.length > 0 && portfolios[0].portfolioSeries.length >= 2 && (
          <path
            d={`${path(portfolios[0].portfolioSeries)} L ${x(portfolios[0].portfolioSeries[portfolios[0].portfolioSeries.length - 1].date).toFixed(1)} ${baselineY.toFixed(1)} L ${x(portfolios[0].portfolioSeries[0].date).toFixed(1)} ${baselineY.toFixed(1)} Z`}
            fill="url(#cmpGrad0)"
          />
        )}

        {/* SPY benchmark line */}
        <path
          d={path(spy)}
          fill="none"
          stroke={TEXT_MID}
          strokeWidth="1.3"
          strokeOpacity="0.7"
          strokeLinecap="round"
        />

        {/* Portfolio lines (reverse so first portfolio sits on top) */}
        {portfolios
          .map((p, i) => ({ p, i }))
          .reverse()
          .map(({ p, i }) => (
            <motion.path
              key={p.slug}
              d={path(p.portfolioSeries)}
              fill="none"
              stroke={ACCENTS[i % ACCENTS.length]}
              strokeWidth={i === 0 ? 2.6 : 2.2}
              strokeLinecap="round"
              strokeLinejoin="round"
              filter={i === 0 ? "url(#cmpGlow)" : undefined}
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 1.1 + i * 0.05, ease: "easeOut" }}
            />
          ))}

        {xTicks.map((t, i) => (
          <text
            key={i}
            x={x(t.date)}
            y={h - pad.b + 18}
            textAnchor={i === 0 ? "start" : i === xTicks.length - 1 ? "end" : "middle"}
            fontFamily="var(--font-mono, ui-monospace, monospace)"
            fontSize="10"
            fill={TEXT_LOW}
          >
            {t.label}
          </text>
        ))}
        <line
          x1={pad.l}
          x2={w - pad.r}
          y1={h - pad.b}
          y2={h - pad.b}
          stroke="rgba(255,255,255,0.08)"
        />
      </svg>
    </section>
  );
}

/* ─────────────── Grouped sector bars ─────────────── */

function SectorBarsGrouped({ portfolios }: { portfolios: ComparePortfolio[] }) {
  // Unique sector set across all portfolios, ordered by combined weight desc.
  const sectors = useMemo(() => {
    const totals = new Map<string, number>();
    for (const p of portfolios) {
      for (const s of p.sectorWeights) {
        totals.set(s.sector, (totals.get(s.sector) ?? 0) + s.weight);
      }
    }
    return [...totals.entries()].sort((a, b) => b[1] - a[1]).map(([s]) => s);
  }, [portfolios]);

  // Compute % weight per portfolio per sector for a fair head-to-head.
  const pctMatrix: Record<string, number[]> = useMemo(() => {
    const out: Record<string, number[]> = {};
    for (const sector of sectors) {
      out[sector] = portfolios.map((p) => {
        const total = p.sectorWeights.reduce((s, x) => s + x.weight, 0) || 1;
        const hit = p.sectorWeights.find((x) => x.sector === sector);
        return hit ? (hit.weight / total) * 100 : 0;
      });
    }
    return out;
  }, [portfolios, sectors]);

  // Global max — gives the bar lengths a shared scale per sector row.
  const maxPct = useMemo(() => {
    let m = 0;
    for (const sector of sectors)
      for (const v of pctMatrix[sector]) if (v > m) m = v;
    return Math.max(m, 5);
  }, [sectors, pctMatrix]);

  return (
    <section
      className="rounded-2xl p-4 sm:p-6"
      style={{
        background:
          "linear-gradient(180deg, rgba(255,255,255,0.025) 0%, rgba(255,255,255,0.005) 100%)",
        border: `1px solid ${LINE_2}`,
      }}
    >
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div
          className="text-[10.5px] uppercase tracking-[0.16em]"
          style={{ color: TEXT_LOW }}
        >
          Sector allocation
        </div>
        <div
          className="flex items-center gap-3 text-[11.5px] flex-wrap"
          style={{ color: TEXT_MID }}
        >
          {portfolios.map((p, i) => (
            <span key={p.slug} className="inline-flex items-center gap-1.5">
              <span
                className="w-2.5 h-2.5 rounded-sm"
                style={{ background: ACCENTS[i % ACCENTS.length] }}
              />
              {p.name}
            </span>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {sectors.slice(0, 10).map((sector) => (
          <div key={sector}>
            <div className="flex items-center justify-between mb-1.5">
              <span
                className="text-[12px] font-medium"
                style={{ color: TEXT_HI }}
              >
                {sector}
              </span>
              <span
                className="font-mono text-[10px] uppercase tracking-[0.14em]"
                style={{ color: TEXT_LOW }}
              >
                share of portfolio
              </span>
            </div>
            <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${portfolios.length}, 1fr)` }}>
              {portfolios.map((p, i) => {
                const v = pctMatrix[sector][i];
                const pct = (v / maxPct) * 100;
                const accent = ACCENTS[i % ACCENTS.length];
                return (
                  <div
                    key={p.slug}
                    className="relative rounded h-5 overflow-hidden"
                    style={{
                      background: "rgba(255,255,255,0.04)",
                    }}
                    title={`${p.name} · ${sector} · ${v.toFixed(1)}%`}
                  >
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.6, ease: "easeOut" }}
                      style={{ background: accent, height: "100%" }}
                    />
                    <span
                      className="absolute inset-0 flex items-center justify-end pr-1.5 font-mono text-[9.5px] tabular-nums"
                      style={{ color: v > maxPct * 0.55 ? "#000" : TEXT_MID }}
                    >
                      {v.toFixed(1)}%
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ─────────────── Activity columns (N parallel) ─────────────── */

function ActivityColumns({ portfolios }: { portfolios: ComparePortfolio[] }) {
  return (
    <section
      className="rounded-2xl p-4 sm:p-6"
      style={{
        background:
          "linear-gradient(180deg, rgba(255,255,255,0.025) 0%, rgba(255,255,255,0.005) 100%)",
        border: `1px solid ${LINE_2}`,
      }}
    >
      <div
        className="text-[10.5px] uppercase tracking-[0.16em] mb-4"
        style={{ color: TEXT_LOW }}
      >
        Recent trade activity
      </div>
      <div
        className="overflow-x-auto -mx-2 px-2"
        style={{ scrollSnapType: "x mandatory" }}
      >
        <div
          className="grid gap-4"
          style={{
            gridTemplateColumns: `repeat(${portfolios.length}, minmax(220px, 1fr))`,
          }}
        >
          {portfolios.map((p, i) => (
            <ActivityColumn key={p.slug} p={p} accent={ACCENTS[i % ACCENTS.length]} />
          ))}
        </div>
      </div>
    </section>
  );
}

function ActivityColumn({ p, accent }: { p: ComparePortfolio; accent: string }) {
  return (
    <div style={{ scrollSnapAlign: "start" }}>
      <div
        className="font-mono text-[11px] uppercase tracking-[0.16em] mb-2"
        style={{ color: accent }}
      >
        {p.name}
      </div>
      <div className="space-y-1.5">
        {p.recentTransactions.length === 0 && (
          <div className="text-[12px]" style={{ color: TEXT_LOW }}>
            No recent filings.
          </div>
        )}
        {p.recentTransactions.slice(0, 12).map((t) => {
          const isBuy = t.action === "buy";
          return (
            <div
              key={t.id}
              className="flex items-center gap-3 text-[12.5px] px-2 py-1 rounded"
              style={{ background: "rgba(255,255,255,0.02)" }}
            >
              <span
                className="font-mono text-[9.5px] uppercase tracking-[0.16em] px-1 py-[1px] rounded-sm"
                style={{
                  background: isBuy
                    ? "rgba(74,222,128,0.12)"
                    : "rgba(248,113,113,0.12)",
                  color: isBuy ? POSITIVE : NEGATIVE,
                }}
              >
                {t.action}
              </span>
              <span className="font-mono" style={{ color: YELLOW }}>
                {t.ticker}
              </span>
              <span
                className="ml-auto font-mono text-[10.5px] tabular-nums"
                style={{ color: TEXT_LOW }}
              >
                {fmtDate(t.disclosedDate)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─────────────── N×N overlap matrix (heatmap) ─────────────── */

function OverlapMatrix({
  portfolios,
  matrix,
}: {
  portfolios: ComparePortfolio[];
  matrix: number[][];
}) {
  // Off-diagonal max — used to scale color intensity so diagonals (100%) don't
  // dominate the scale.
  const maxOff = useMemo(() => {
    let m = 0;
    for (let i = 0; i < matrix.length; i++) {
      for (let j = 0; j < matrix.length; j++) {
        if (i !== j && matrix[i][j] > m) m = matrix[i][j];
      }
    }
    return Math.max(m, 1);
  }, [matrix]);

  const cellBg = (i: number, j: number, v: number): string => {
    if (i === j) return "rgba(255,255,255,0.04)";
    // 0 → faint gray, max → violet glow
    const t = Math.min(1, v / maxOff);
    const alpha = 0.06 + t * 0.36;
    return `rgba(124,95,255,${alpha.toFixed(3)})`;
  };
  const cellTextColor = (i: number, j: number, v: number): string => {
    if (i === j) return TEXT_LOW;
    const t = v / maxOff;
    return t > 0.55 ? "#fff" : TEXT_HI;
  };

  return (
    <section
      className="rounded-2xl p-4 sm:p-6"
      style={{
        background:
          "linear-gradient(180deg, rgba(255,255,255,0.025) 0%, rgba(255,255,255,0.005) 100%)",
        border: `1px solid ${LINE_2}`,
      }}
    >
      <div className="flex items-baseline justify-between mb-4">
        <div
          className="text-[10.5px] uppercase tracking-[0.16em]"
          style={{ color: TEXT_LOW }}
        >
          Holdings overlap matrix
        </div>
        <div className="text-[11.5px]" style={{ color: TEXT_MID }}>
          Cell <span style={{ color: TEXT_HI }}>i,j</span> = overlap %
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="text-[12px]" style={{ borderCollapse: "separate", borderSpacing: 4 }}>
          <thead>
            <tr>
              <th style={{ width: 100 }}></th>
              {portfolios.map((p, j) => (
                <th
                  key={`h-${j}`}
                  className="px-2 py-1 text-center font-mono text-[10px] uppercase tracking-[0.16em]"
                  style={{
                    color: ACCENTS[j % ACCENTS.length],
                    minWidth: 90,
                  }}
                >
                  <span className="truncate inline-block max-w-[110px]">{p.name}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {portfolios.map((p, i) => (
              <tr key={`r-${i}`}>
                <th
                  className="px-2 py-1 text-right font-mono text-[10px] uppercase tracking-[0.16em] whitespace-nowrap"
                  style={{ color: ACCENTS[i % ACCENTS.length] }}
                >
                  <span className="truncate inline-block max-w-[100px]">{p.name}</span>
                </th>
                {portfolios.map((q, j) => {
                  const v = matrix[i][j];
                  return (
                    <td
                      key={`c-${i}-${j}`}
                      className="rounded-md text-center font-mono tabular-nums text-[12.5px] font-semibold"
                      style={{
                        background: cellBg(i, j, v),
                        color: cellTextColor(i, j, v),
                        border: `1px solid ${LINE_2}`,
                        padding: "10px 12px",
                        minWidth: 90,
                      }}
                      title={`${p.name} vs ${q.name}: ${v.toFixed(0)}%`}
                    >
                      {v.toFixed(0)}%
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-3 flex items-center gap-3 text-[11px]" style={{ color: TEXT_MID }}>
        <span className="inline-flex items-center gap-1.5">
          <span
            className="inline-block w-3 h-3 rounded-sm"
            style={{ background: "rgba(124,95,255,0.06)", border: `1px solid ${LINE_2}` }}
          />
          low
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span
            className="inline-block w-3 h-3 rounded-sm"
            style={{ background: "rgba(124,95,255,0.20)", border: `1px solid ${LINE_2}` }}
          />
          mid
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span
            className="inline-block w-3 h-3 rounded-sm"
            style={{ background: "rgba(124,95,255,0.42)", border: `1px solid ${LINE_2}` }}
          />
          high
        </span>
      </div>
    </section>
  );
}

/* ─────────────── Utils ─────────────── */

function fmtDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
function fmtMonth(iso: string): string {
  const [y, m] = iso.split("-");
  if (!y || !m) return iso;
  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];
  const mi = Math.max(0, Math.min(11, parseInt(m, 10) - 1));
  return `${months[mi]} '${y.slice(2)}`;
}
function fmtPct(n: number): string {
  const r = Math.round(n);
  if (r === 0) return "0%";
  return `${r > 0 ? "+" : ""}${r}%`;
}
