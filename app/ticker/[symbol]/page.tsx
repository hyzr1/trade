// app/ticker/[symbol]/page.tsx
"use client";

import Link from "next/link";
import { use, useEffect, useState } from "react";
import { notFound } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowDownRight, ArrowUpRight, Brain, ExternalLink, Inbox, Star, Users } from "lucide-react";
import { DeskShell } from "@/components/desk/DeskShell";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { TimeAgo } from "@/components/ui/TimeAgo";
import { useWatchlist } from "@/lib/watchlist";
import { useToast } from "@/components/ui/Toaster";
import {
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
import { SECTOR_COLORS, type Sector } from "@/lib/sectors";
import type { SectorDetail, TickerDetail } from "@/lib/queries";

export default function TickerPage({ params }: { params: Promise<{ symbol: string }> }) {
  const { symbol } = use(params);
  const ticker = symbol.toUpperCase();
  const [d, setD] = useState<TickerDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFoundFlag, setNotFoundFlag] = useState(false);

  useEffect(() => {
    fetch(`/api/ticker/${ticker}`)
      .then((r) => {
        if (r.status === 404) {
          setNotFoundFlag(true);
          return null;
        }
        if (!r.ok) return null;
        return r.json();
      })
      .then((data: TickerDetail | null) => setD(data))
      .finally(() => setLoading(false));
  }, [ticker]);

  if (notFoundFlag) notFound();

  if (loading || !d) {
    return (
      <DeskShell breadcrumb={`Loading ${ticker}…`}>
        <div className="space-y-6">
          <Skeleton className="h-32 rounded-2xl" />
          <Skeleton className="h-72 rounded-2xl" />
          <div className="grid grid-cols-12 gap-6">
            <Skeleton className="col-span-12 lg:col-span-7 h-80 rounded-2xl" />
            <Skeleton className="col-span-12 lg:col-span-5 h-80 rounded-2xl" />
          </div>
        </div>
      </DeskShell>
    );
  }

  return (
    <DeskShell breadcrumb={`${d.ticker} · ${d.name}`}>
      <TickerHeader d={d} />
      <PriceChart series={d.priceSeries} />

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-7">
          <FilingsByMember rows={d.byPortfolio} />
        </div>
        <div className="col-span-12 lg:col-span-5">
          <ActivityHeatmap cells={d.weeklyHeat} />
        </div>
      </div>

      <AIMindHistory history={d.mindHistory} />
      <RelatedTickers sector={d.sector} current={d.ticker} />
    </DeskShell>
  );
}

/* ─── Header ─────────────────────────────────────────── */
function TickerHeader({ d }: { d: TickerDetail }) {
  const reduced = useReducedMotion();
  const sectorColor = SECTOR_COLORS[d.sector as Sector] ?? "rgba(255,255,255,0.20)";
  const change = d.change30dPct;
  const isUp = (change ?? 0) >= 0;
  const { has, toggle, hydrated } = useWatchlist();
  const { toast } = useToast();
  const watched = hydrated && has("ticker", d.ticker);
  const onStar = () => {
    const wasOn = watched;
    toggle("ticker", d.ticker);
    toast(wasOn ? `Removed ${d.ticker} from watchlist` : `Watching ${d.ticker}`, {
      variant: wasOn ? "info" : "success",
    });
  };
  return (
    <motion.section
      initial={reduced ? { opacity: 0 } : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="rounded-2xl p-5 sm:p-7"
      style={{
        background: "linear-gradient(180deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.015) 100%)",
        border: `1px solid ${LINE_2}`,
        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04)",
      }}
    >
      <div className="flex flex-wrap items-end justify-between gap-5">
        <div className="min-w-0">
          <div
            className="font-mono text-[10.5px] uppercase tracking-[0.18em]"
            style={{ color: TEXT_LOW }}
          >
            Ticker · NASDAQ/NYSE
          </div>
          <div className="mt-2 flex items-center gap-3 flex-wrap">
            <h1
              className="font-mono font-semibold tracking-tight"
              style={{ color: YELLOW, fontSize: 56, lineHeight: 1 }}
            >
              {d.ticker}
            </h1>
            <button
              type="button"
              onClick={onStar}
              aria-pressed={watched}
              aria-label={watched ? `Unwatch ${d.ticker}` : `Add ${d.ticker} to watchlist`}
              title={watched ? "Remove from watchlist" : "Add to watchlist"}
              className="focus-ring inline-flex items-center justify-center w-9 h-9 rounded-lg transition-all hover:bg-white/[0.06]"
              style={{
                background: watched ? "rgba(124,95,255,0.15)" : "rgba(255,255,255,0.03)",
                border: `1px solid ${watched ? "rgba(124,95,255,0.40)" : LINE_2}`,
                color: watched ? VIOLET_2 : TEXT_MID,
              }}
            >
              <Star size={16} fill={watched ? VIOLET : "transparent"} strokeWidth={1.8} />
            </button>
            <Link
              href={`/sector/${encodeURIComponent(d.sector)}`}
              aria-label={`View ${d.sector} sector`}
              className="focus-ring inline-flex items-center gap-1.5 rounded-md px-2 py-1 font-mono text-[10.5px] uppercase tracking-[0.16em] transition-all hover:brightness-125"
              style={{
                color: sectorColor,
                background: `${sectorColor}1A`,
                border: `1px solid ${sectorColor}55`,
              }}
            >
              <span className="w-2 h-2 rounded-sm" style={{ background: sectorColor }} />
              {d.sector}
              <span aria-hidden style={{ color: sectorColor, opacity: 0.6 }}>
                →
              </span>
            </Link>
          </div>
          <div className="mt-1 text-[15px]" style={{ color: TEXT_MID }}>
            {d.name}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 sm:gap-6">
          <Stat
            label="30d change"
            value={
              change == null ? (
                <span style={{ color: TEXT_LOW }}>—</span>
              ) : (
                <span style={{ color: isUp ? POSITIVE : NEGATIVE }}>
                  {isUp ? "+" : ""}
                  {change.toFixed(2)}%
                </span>
              )
            }
            icon={
              change == null ? null : isUp ? (
                <ArrowUpRight size={14} color={POSITIVE} />
              ) : (
                <ArrowDownRight size={14} color={NEGATIVE} />
              )
            }
          />
          <Stat label="Filings" value={<span>{d.totalFilings}</span>} />
          <Stat
            label="Buys / Sells"
            value={
              <span>
                <span style={{ color: POSITIVE }}>{d.buys}</span>
                <span style={{ color: TEXT_LOW }}> / </span>
                <span style={{ color: NEGATIVE }}>{d.sells}</span>
              </span>
            }
          />
        </div>
      </div>
    </motion.section>
  );
}

function Stat({
  label,
  value,
  icon,
}: {
  label: string;
  value: React.ReactNode;
  icon?: React.ReactNode;
}) {
  return (
    <div>
      <div
        className="font-mono text-[10px] uppercase tracking-[0.16em]"
        style={{ color: TEXT_LOW }}
      >
        {label}
      </div>
      <div className="mt-1 flex items-center gap-1.5 font-mono tabular-nums text-[18px]" style={{ color: TEXT_HI }}>
        {icon}
        {value}
      </div>
    </div>
  );
}

/* ─── Price chart ─────────────────────────────────────────── */
function PriceChart({ series }: { series: { date: string; close: number }[] }) {
  const reduced = useReducedMotion();
  const W = 1200, H = 220, PAD = 16;
  if (series.length < 2) {
    return (
      <Card title="1Y price">
        <EmptyState
          icon={<Inbox size={18} />}
          headline="No price history"
          body="We don't have price data for this ticker yet."
          compact
        />
      </Card>
    );
  }
  const last = series[series.length - 1].close;
  const first = series[0].close;
  const positive = last >= first;
  const stroke = positive ? POSITIVE : NEGATIVE;
  const fillGrad = positive ? "ticker-grad-up" : "ticker-grad-down";

  const vals = series.map((s) => s.close);
  const min = Math.min(...vals);
  const max = Math.max(...vals);
  const range = max - min || 1;
  const stepX = (W - PAD * 2) / (series.length - 1);
  const pathD = series
    .map((s, i) => {
      const x = PAD + i * stepX;
      const y = PAD + (H - PAD * 2) * (1 - (s.close - min) / range);
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
  const areaD = `${pathD} L${PAD + (series.length - 1) * stepX},${H - PAD} L${PAD},${H - PAD} Z`;

  const startDate = series[0].date;
  const endDate = series[series.length - 1].date;

  return (
    <Card
      title="1Y price"
      right={
        <div className="font-mono text-[10.5px] tabular-nums" style={{ color: TEXT_MID }}>
          ${first.toFixed(2)} → ${last.toFixed(2)}
        </div>
      }
    >
      <div className="px-5 pt-4 pb-5 relative">
        <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={{ width: "100%", height: 220 }}>
          <defs>
            <linearGradient id="ticker-grad-up" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor={POSITIVE} stopOpacity="0.34" />
              <stop offset="100%" stopColor={POSITIVE} stopOpacity="0" />
            </linearGradient>
            <linearGradient id="ticker-grad-down" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor={NEGATIVE} stopOpacity="0.34" />
              <stop offset="100%" stopColor={NEGATIVE} stopOpacity="0" />
            </linearGradient>
          </defs>
          {/* y-grid: 3 horizontal lines at 25/50/75% of range */}
          {[0.25, 0.5, 0.75].map((t) => {
            const y = PAD + (H - PAD * 2) * t;
            return (
              <line
                key={t}
                x1={PAD}
                x2={W - PAD}
                y1={y}
                y2={y}
                stroke="rgba(255,255,255,0.06)"
                strokeWidth="1"
                vectorEffect="non-scaling-stroke"
              />
            );
          })}
          <path d={areaD} fill={`url(#${fillGrad})`} />
          <motion.path
            d={pathD}
            fill="none"
            stroke={stroke}
            strokeWidth="1.6"
            strokeLinejoin="round"
            initial={reduced ? { opacity: 0 } : { pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: reduced ? 0.2 : 0.9, ease: [0.22, 1, 0.36, 1] }}
          />
          {/* last-price marker dot */}
          {(() => {
            const lx = PAD + (series.length - 1) * stepX;
            const ly = PAD + (H - PAD * 2) * (1 - (last - min) / range);
            return (
              <circle
                cx={lx}
                cy={ly}
                r={4}
                fill={stroke}
                stroke="#0E0B1A"
                strokeWidth="2"
                vectorEffect="non-scaling-stroke"
              />
            );
          })()}
        </svg>
        {/* Left axis labels (price scale) + bottom date labels */}
        <div
          className="pointer-events-none absolute left-5 top-4 flex flex-col justify-between font-mono text-[9.5px] tabular-nums"
          style={{ height: 220, color: TEXT_LOW }}
        >
          <span>${max.toFixed(2)}</span>
          <span>${((max + min) / 2).toFixed(2)}</span>
          <span>${min.toFixed(2)}</span>
        </div>
        <div className="mt-2 flex items-center justify-between font-mono text-[10.5px]" style={{ color: TEXT_LOW }}>
          <span>{startDate}</span>
          <span style={{ color: stroke }}>${last.toFixed(2)} · last</span>
          <span>{endDate}</span>
        </div>
      </div>
    </Card>
  );
}

/* ─── Filings by member table ─────────────────────────────────────────── */
function FilingsByMember({ rows }: { rows: TickerDetail["byPortfolio"] }) {
  if (rows.length === 0) {
    return (
      <Card title="Filings by member">
        <EmptyState
          icon={<Inbox size={18} />}
          headline="No filings yet"
          body="No member or AI mind has disclosed a trade in this name."
          compact
        />
      </Card>
    );
  }
  return (
    <Card title="Filings by member" right={<span className="font-mono text-[10.5px]" style={{ color: TEXT_MID }}>{rows.length}</span>}>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr
              className="text-[10px] uppercase tracking-[0.16em]"
              style={{ color: TEXT_LOW, background: "rgba(255,255,255,0.02)" }}
            >
              <th className="px-5 py-2.5 text-left font-normal">Portfolio</th>
              <th className="px-3 py-2.5 text-left font-normal">Kind</th>
              <th className="px-3 py-2.5 text-right font-normal">Filings</th>
              <th className="px-3 py-2.5 text-left font-normal">Last action</th>
              <th className="px-5 py-2.5 text-right font-normal">When</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr
                key={r.slug}
                className="text-[13px] hover:bg-white/[0.02] transition-colors"
                style={{ borderTop: i === 0 ? "none" : `1px solid ${LINE}`, color: TEXT_HI }}
              >
                <td className="px-5 py-3">
                  <Link href={`/${r.slug}`} className="hover:underline">
                    {r.name}
                    {r.party && <span className="ml-2 text-[10.5px]" style={{ color: TEXT_MID }}>({r.party})</span>}
                  </Link>
                </td>
                <td className="px-3 py-3">
                  <span
                    className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.16em]"
                    style={{ color: r.kind === "llm" ? VIOLET_2 : TEXT_MID }}
                  >
                    {r.kind === "llm" ? <Brain size={11} /> : <Users size={11} />}
                    {r.kind}
                  </span>
                </td>
                <td className="px-3 py-3 font-mono tabular-nums text-right">{r.filings}</td>
                <td className="px-3 py-3">
                  <span
                    className="font-mono text-[10.5px] uppercase tracking-[0.16em] px-1.5 py-0.5 rounded-sm"
                    style={{
                      background: r.lastAction === "buy" ? "rgba(74,222,128,0.12)" : "rgba(248,113,113,0.12)",
                      color: r.lastAction === "buy" ? POSITIVE : NEGATIVE,
                    }}
                  >
                    {r.lastAction}
                  </span>
                  <span className="ml-2 font-mono text-[10.5px]" style={{ color: TEXT_LOW }}>
                    {r.lastBracket}
                  </span>
                </td>
                <td className="px-5 py-3 text-right font-mono tabular-nums text-[11.5px]" style={{ color: TEXT_MID }}>
                  <TimeAgo iso={r.lastDate} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

/* ─── Activity heatmap ─────────────────────────────────────────── */
function ActivityHeatmap({ cells }: { cells: TickerDetail["weeklyHeat"] }) {
  // 52 weeks × 5 day rows. Color = net (buys - sells).
  const byWeek = new Map(cells.map((c) => [c.week, c]));
  const today = new Date();
  const weeks: { week: string; cell?: { buys: number; sells: number } }[] = [];
  for (let i = 51; i >= 0; i--) {
    const monday = new Date(today.getTime() - i * 7 * 86400000);
    const d = monday.getUTCDay() || 7;
    monday.setUTCDate(monday.getUTCDate() - (d - 1));
    const wk = monday.toISOString().slice(0, 10);
    weeks.push({ week: wk, cell: byWeek.get(wk) });
  }
  const max = Math.max(1, ...cells.map((c) => c.buys + c.sells));
  return (
    <Card title="52-week activity">
      <div className="px-5 pt-4 pb-5">
        <div className="grid grid-cols-13 gap-[3px]" style={{ gridTemplateColumns: "repeat(13, 1fr)" }}>
          {weeks.map((w, i) => {
            const total = (w.cell?.buys ?? 0) + (w.cell?.sells ?? 0);
            const tone = total === 0 ? "rgba(255,255,255,0.04)" : w.cell!.buys >= w.cell!.sells ? POSITIVE : NEGATIVE;
            const op = total === 0 ? 1 : 0.18 + 0.7 * (total / max);
            return (
              <div
                key={i}
                title={
                  w.cell
                    ? `${w.week} · ${w.cell.buys} buy${w.cell.buys === 1 ? "" : "s"} · ${w.cell.sells} sell${w.cell.sells === 1 ? "" : "s"}`
                    : `${w.week} · no activity`
                }
                className="aspect-square rounded-[3px]"
                style={{
                  background: total === 0 ? tone : `${tone}${Math.round(op * 255).toString(16).padStart(2, "0")}`,
                  border: `1px solid ${LINE_2}`,
                }}
              />
            );
          })}
        </div>
        <div className="mt-3 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.16em]" style={{ color: TEXT_LOW }}>
          <span>52w ago</span>
          <span className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1"><span className="w-2 h-2 rounded-sm" style={{ background: POSITIVE }} /> buy</span>
            <span className="inline-flex items-center gap-1"><span className="w-2 h-2 rounded-sm" style={{ background: NEGATIVE }} /> sell</span>
          </span>
          <span>now</span>
        </div>
      </div>
    </Card>
  );
}

/* ─── AI mind history ─────────────────────────────────────────── */
function AIMindHistory({ history }: { history: TickerDetail["mindHistory"] }) {
  const allRanges = history.flatMap((h) => h.windows);
  const hasAny = allRanges.length > 0;
  if (!hasAny) {
    return (
      <Card title="AI consensus history">
        <EmptyState
          icon={<Brain size={18} />}
          headline="No mind has touched this ticker"
          body="Neither GPT-5 nor Claude has held positions in this name during the tracked window."
          compact
        />
      </Card>
    );
  }
  const allDates = allRanges.flatMap((r) => [r.start, r.end]).sort();
  const minD = new Date(allDates[0]).getTime();
  const maxD = new Date(allDates[allDates.length - 1]).getTime();
  const span = Math.max(maxD - minD, 1);

  const startLabel = new Date(minD).toISOString().slice(0, 10);
  const endLabel = new Date(maxD).toISOString().slice(0, 10);

  return (
    <Card title="AI consensus history" right={<span className="font-mono text-[10.5px]" style={{ color: TEXT_MID }}>4 minds</span>}>
      <div className="px-5 pt-4 pb-5 space-y-3">
        {history.map((m) => (
          <div key={m.name} className="flex items-center gap-3">
            <div className="w-24 shrink-0 font-mono text-[11px]" style={{ color: TEXT_MID }}>
              {m.name}
            </div>
            <div className="relative flex-1 h-6 rounded-md" style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${LINE}` }}>
              {m.windows.map((w, i) => {
                const sx = ((new Date(w.start).getTime() - minD) / span) * 100;
                const ex = ((new Date(w.end).getTime() - minD) / span) * 100;
                return (
                  <div
                    key={i}
                    className="absolute top-0 bottom-0 rounded-sm"
                    style={{
                      left: `${sx}%`,
                      width: `${Math.max(2, ex - sx)}%`,
                      background: `linear-gradient(180deg, ${VIOLET} 0%, ${VIOLET_2}AA 100%)`,
                      boxShadow: "inset 0 1px 0 rgba(255,255,255,0.15)",
                    }}
                  />
                );
              })}
            </div>
          </div>
        ))}
        <div className="flex items-center justify-between pt-2 font-mono text-[10px] uppercase tracking-[0.16em]" style={{ color: TEXT_LOW }}>
          <span>{startLabel}</span>
          <span className="inline-flex items-center gap-1">
            <ExternalLink size={10} /> hold windows
          </span>
          <span>{endLabel}</span>
        </div>
      </div>
    </Card>
  );
}

/* ─── Related tickers in same sector ─────────────────────────────────────────── */
function RelatedTickers({ sector, current }: { sector: string; current: string }) {
  const [tickers, setTickers] = useState<SectorDetail["tickers"]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let cancelled = false;
    fetch(`/api/sector/${encodeURIComponent(sector)}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d: SectorDetail | null) => {
        if (cancelled) return;
        if (d) setTickers(d.tickers.filter((t) => t.ticker !== current).slice(0, 8));
      })
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [sector, current]);
  if (loading) {
    return (
      <Card
        title={`More in ${sector}`}
        right={
          <Link
            href={`/sector/${encodeURIComponent(sector)}`}
            className="font-mono text-[10.5px] hover:underline"
            style={{ color: VIOLET_2 }}
          >
            view sector →
          </Link>
        }
      >
        <div className="px-5 py-4">
          <Skeleton className="h-9 rounded-lg" />
        </div>
      </Card>
    );
  }
  if (tickers.length === 0) return null;
  return (
    <Card
      title={`More in ${sector}`}
      right={
        <Link
          href={`/sector/${encodeURIComponent(sector)}`}
          className="font-mono text-[10.5px] transition-colors hover:underline"
          style={{ color: VIOLET_2 }}
        >
          view sector →
        </Link>
      }
    >
      <div className="px-5 py-4 flex flex-wrap gap-2">
        {tickers.map((t) => (
          <Link
            key={t.ticker}
            href={`/ticker/${t.ticker}`}
            className="focus-ring group inline-flex items-center gap-2 rounded-lg px-3 py-2 text-[12.5px] transition-all hover:-translate-y-0.5"
            style={{
              background: "rgba(255,255,255,0.025)",
              border: `1px solid ${LINE_2}`,
            }}
          >
            <span className="font-mono font-semibold" style={{ color: YELLOW }}>
              {t.ticker}
            </span>
            <span className="font-mono tabular-nums" style={{ color: TEXT_LOW }}>
              {t.filings}
            </span>
            <span className="font-mono text-[10.5px]" style={{ color: TEXT_LOW }}>
              filing{t.filings === 1 ? "" : "s"}
            </span>
          </Link>
        ))}
      </div>
    </Card>
  );
}

/* ─── Generic card wrapper ─────────────────────────────────────────── */
function Card({
  title,
  right,
  children,
}: {
  title: string;
  right?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section
      className="rounded-2xl overflow-hidden"
      style={{
        background: "linear-gradient(180deg, rgba(255,255,255,0.025) 0%, rgba(255,255,255,0.005) 100%)",
        border: `1px solid ${LINE_2}`,
      }}
    >
      <div className="flex items-center justify-between px-5 py-3 border-b" style={{ borderColor: LINE }}>
        <span className="text-[10.5px] uppercase tracking-[0.16em]" style={{ color: TEXT_LOW }}>{title}</span>
        {right}
      </div>
      {children}
    </section>
  );
}

// Keep VIOLET ref so the import isn't pruned for unrelated reasons.
void VIOLET;
