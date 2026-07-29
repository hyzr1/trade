// app/sector/[name]/page.tsx
"use client";

import Link from "next/link";
import { use, useEffect, useState } from "react";
import { notFound, useRouter } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { Brain, Flame, Inbox, Snowflake, TrendingUp } from "lucide-react";
import { DeskShell } from "@/components/desk/DeskShell";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { TimeAgo } from "@/components/ui/TimeAgo";
import {
  LINE,
  LINE_2,
  NEGATIVE,
  POSITIVE,
  TEXT_HI,
  TEXT_LOW,
  TEXT_MID,
  VIOLET_2,
  YELLOW,
} from "@/lib/theme";
import { SECTOR_COLORS, type Sector } from "@/lib/sectors";
import { describeSector } from "@/lib/sector-descriptions";
import type { SectorDetail } from "@/lib/queries";

export default function SectorPage({ params }: { params: Promise<{ name: string }> }) {
  const { name } = use(params);
  const decoded = decodeURIComponent(name);
  const [d, setD] = useState<SectorDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFoundFlag, setNotFoundFlag] = useState(false);

  useEffect(() => {
    fetch(`/api/sector/${encodeURIComponent(decoded)}`)
      .then((r) => {
        if (r.status === 404) {
          setNotFoundFlag(true);
          return null;
        }
        if (!r.ok) return null;
        return r.json();
      })
      .then((data: SectorDetail | null) => setD(data))
      .finally(() => setLoading(false));
  }, [decoded]);

  if (notFoundFlag) notFound();

  if (loading || !d) {
    return (
      <DeskShell breadcrumb={`Loading ${decoded}…`}>
        <div className="space-y-6">
          <Skeleton className="h-32 rounded-2xl" />
          <Skeleton className="h-60 rounded-2xl" />
          <div className="grid grid-cols-12 gap-6">
            <Skeleton className="col-span-12 lg:col-span-7 h-80 rounded-2xl" />
            <Skeleton className="col-span-12 lg:col-span-5 h-80 rounded-2xl" />
          </div>
        </div>
      </DeskShell>
    );
  }

  return (
    <DeskShell breadcrumb={`${d.name} sector`}>
      <SectorHeader d={d} />
      <WeeklyActivity points={d.weeklyActivity} />
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-7">
          <TickersList tickers={d.tickers} />
        </div>
        <div className="col-span-12 lg:col-span-5 space-y-6">
          <TopPoliticians rows={d.topPoliticians} />
          <AIOverlapCard pct={d.aiOverlapPct} />
        </div>
      </div>
      <RecentFilings rows={d.recentFilings} />
    </DeskShell>
  );
}

/* ─── Header ─────────────────────────────────────────── */
function SectorHeader({ d }: { d: SectorDetail }) {
  const reduced = useReducedMotion();
  const color = SECTOR_COLORS[d.name as Sector] ?? "rgba(255,255,255,0.20)";
  const desc = describeSector(d.name);
  // Trending / cooling: 7d × (30/7) vs 30d.
  // > +25% above projected → trending. < -25% below → cooling.
  const projected30FromWeek = d.count7d * (30 / 7);
  const ratio = d.count30d === 0 ? 0 : (projected30FromWeek - d.count30d) / Math.max(d.count30d, 1);
  const trend: "trending" | "cooling" | "steady" =
    d.count30d < 4
      ? "steady"
      : ratio > 0.25
        ? "trending"
        : ratio < -0.25
          ? "cooling"
          : "steady";
  return (
    <motion.section
      initial={reduced ? { opacity: 0 } : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="rounded-2xl p-5 sm:p-7"
      style={{
        background: "linear-gradient(180deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.015) 100%)",
        border: `1px solid ${LINE_2}`,
      }}
    >
      <div className="flex flex-wrap items-end justify-between gap-5">
        <div className="min-w-0 max-w-2xl">
          <div
            className="font-mono text-[10.5px] uppercase tracking-[0.18em]"
            style={{ color: TEXT_LOW }}
          >
            Sector
          </div>
          <div className="mt-2 flex items-center gap-3 flex-wrap">
            <span
              className="w-3 h-3 rounded-md"
              style={{ background: color, boxShadow: `0 0 24px ${color}88` }}
            />
            <h1
              className="font-semibold tracking-tight"
              style={{ color: TEXT_HI, fontSize: 40 }}
            >
              {d.name}
            </h1>
            <TrendBadge trend={trend} />
          </div>
          <div className="mt-2 text-[14px]" style={{ color: TEXT_MID }}>
            {desc.tagline}
          </div>
          <p
            className="mt-3 text-[13.5px] max-w-2xl leading-relaxed"
            style={{ color: TEXT_MID }}
          >
            {desc.blurb}
          </p>
          {desc.examples.length > 0 && (
            <div className="mt-3 flex flex-wrap items-center gap-1.5">
              <span
                className="font-mono text-[9.5px] uppercase tracking-[0.16em] mr-1"
                style={{ color: TEXT_LOW }}
              >
                ex:
              </span>
              {desc.examples.map((sym) => (
                <Link
                  key={sym}
                  href={`/ticker/${sym}`}
                  className="focus-ring font-mono text-[11px] px-1.5 py-0.5 rounded-sm transition-colors hover:bg-white/[0.06]"
                  style={{
                    color: YELLOW,
                    background: "rgba(247,210,74,0.08)",
                    border: `1px solid rgba(247,210,74,0.18)`,
                  }}
                >
                  {sym}
                </Link>
              ))}
            </div>
          )}
        </div>
        <div className="grid grid-cols-3 gap-6">
          <Stat label="Last 7d" value={d.count7d} />
          <Stat label="Last 30d" value={d.count30d} />
          <Stat label="Last 90d" value={d.count90d} />
        </div>
      </div>
    </motion.section>
  );
}

function TrendBadge({ trend }: { trend: "trending" | "cooling" | "steady" }) {
  if (trend === "steady") return null;
  if (trend === "trending") {
    return (
      <span
        className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.16em] px-2 py-1 rounded-md"
        style={{
          color: "#FCD34D",
          background: "rgba(245,158,11,0.15)",
          border: "1px solid rgba(245,158,11,0.40)",
        }}
        title="7-day pace running well above the 30-day average."
      >
        <Flame size={11} />
        Trending
      </span>
    );
  }
  return (
    <span
      className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.16em] px-2 py-1 rounded-md"
      style={{
        color: "#93C5FD",
        background: "rgba(59,130,246,0.12)",
        border: "1px solid rgba(59,130,246,0.30)",
      }}
      title="7-day pace running below the 30-day average."
    >
      <Snowflake size={11} />
      Cooling
    </span>
  );
}

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div>
      <div
        className="font-mono text-[10px] uppercase tracking-[0.16em]"
        style={{ color: TEXT_LOW }}
      >
        {label}
      </div>
      <div
        className="mt-1 font-mono tabular-nums text-[24px] font-semibold"
        style={{ color: TEXT_HI }}
      >
        {value}
      </div>
    </div>
  );
}

/* ─── Weekly activity ─────────────────────────────────────────── */
function WeeklyActivity({ points }: { points: SectorDetail["weeklyActivity"] }) {
  const reduced = useReducedMotion();
  const W = 1200, H = 160, PAD = 16;
  if (points.length === 0) {
    return (
      <Card title="Activity (last 16 weeks)">
        <EmptyState
          icon={<Inbox size={18} />}
          headline="No recent activity"
          body="No filings in this sector during the tracked window."
          compact
        />
      </Card>
    );
  }
  const max = Math.max(1, ...points.map((p) => p.count));
  const barW = (W - PAD * 2) / Math.max(points.length, 1) - 4;
  return (
    <Card
      title="Activity (last 16 weeks)"
      right={
        <span className="font-mono text-[10.5px] tabular-nums" style={{ color: TEXT_MID }}>
          peak {max} / wk
        </span>
      }
    >
      <div className="px-5 pt-4 pb-5">
        <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={{ width: "100%", height: 160 }}>
          {/* y-grid at 25/50/75% */}
          {[0.25, 0.5, 0.75].map((t) => {
            const y = PAD + (H - PAD * 2) * t;
            return (
              <line
                key={t}
                x1={PAD}
                x2={W - PAD}
                y1={y}
                y2={y}
                stroke="rgba(255,255,255,0.05)"
                strokeWidth="1"
                vectorEffect="non-scaling-stroke"
              />
            );
          })}
          {/* x-axis baseline */}
          <line
            x1={PAD}
            x2={W - PAD}
            y1={H - PAD}
            y2={H - PAD}
            stroke="rgba(255,255,255,0.10)"
            strokeWidth="1"
            vectorEffect="non-scaling-stroke"
          />
          {points.map((p, i) => {
            const h = ((H - PAD * 2) * p.count) / max;
            const x = PAD + i * ((W - PAD * 2) / points.length);
            const y = H - PAD - h;
            return (
              <motion.rect
                key={p.week}
                x={x}
                y={y}
                width={barW}
                height={h}
                rx="2"
                fill={YELLOW}
                fillOpacity="0.85"
                initial={reduced ? { opacity: 0 } : { y: H - PAD, height: 0, opacity: 0 }}
                animate={{ y, height: h, opacity: 0.9 }}
                transition={{ duration: reduced ? 0.2 : 0.5, delay: reduced ? 0 : i * 0.018, ease: [0.22, 1, 0.36, 1] }}
              />
            );
          })}
        </svg>
        <div className="mt-2 flex items-center justify-between font-mono text-[10.5px]" style={{ color: TEXT_LOW }}>
          <span>{points[0].week}</span>
          <span>{points[points.length - 1].week}</span>
        </div>
      </div>
    </Card>
  );
}

/* ─── Tickers list ─────────────────────────────────────────── */
function TickersList({ tickers }: { tickers: SectorDetail["tickers"] }) {
  const router = useRouter();
  if (tickers.length === 0) {
    return (
      <Card title="Tickers in sector">
        <EmptyState
          icon={<Inbox size={18} />}
          headline="No tickers"
          body="No tickers tagged to this sector yet."
          compact
        />
      </Card>
    );
  }
  return (
    <Card title="Tickers in sector" right={<span className="font-mono text-[10.5px]" style={{ color: TEXT_MID }}>{tickers.length}</span>}>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr
              className="text-[10px] uppercase tracking-[0.16em]"
              style={{ color: TEXT_LOW, background: "rgba(255,255,255,0.02)" }}
            >
              <th className="px-5 py-2.5 text-left font-normal">Ticker</th>
              <th className="px-3 py-2.5 text-right font-normal">Filings</th>
              <th className="px-3 py-2.5 text-right font-normal">Buys</th>
              <th className="px-5 py-2.5 text-right font-normal">Sells</th>
            </tr>
          </thead>
          <tbody>
            {tickers.map((t, i) => (
              <tr
                key={t.ticker}
                onClick={() => router.push(`/ticker/${t.ticker}`)}
                role="link"
                tabIndex={0}
                aria-label={`View ${t.ticker} ticker page`}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    router.push(`/ticker/${t.ticker}`);
                  }
                }}
                className="focus-ring text-[13px] hover:bg-white/[0.025] transition-colors cursor-pointer"
                style={{ borderTop: i === 0 ? "none" : `1px solid ${LINE}`, color: TEXT_HI }}
              >
                <td className="px-5 py-3 font-mono font-semibold" style={{ color: YELLOW }}>
                  {t.ticker}
                </td>
                <td className="px-3 py-3 font-mono tabular-nums text-right">{t.filings}</td>
                <td className="px-3 py-3 font-mono tabular-nums text-right" style={{ color: POSITIVE }}>{t.buys}</td>
                <td className="px-5 py-3 font-mono tabular-nums text-right" style={{ color: NEGATIVE }}>{t.sells}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

/* ─── Top politicians ─────────────────────────────────────────── */
function TopPoliticians({ rows }: { rows: SectorDetail["topPoliticians"] }) {
  if (rows.length === 0) {
    return (
      <Card title="Most active members">
        <EmptyState
          icon={<TrendingUp size={18} />}
          headline="No politicians"
          body="No member has filed in this sector recently."
          compact
        />
      </Card>
    );
  }
  const maxFilings = Math.max(...rows.map((r) => r.filings), 1);
  return (
    <Card title="Top political traders in this sector">
      <ul>
        {rows.map((r, i) => {
          const pct = (r.filings / maxFilings) * 100;
          const partyColor = r.party === "D" ? "#60A5FA" : r.party === "R" ? "#F87171" : TEXT_MID;
          return (
            <li
              key={r.slug}
              className="relative px-5 py-3 transition-colors hover:bg-white/[0.025]"
              style={{
                borderTop: i === 0 ? "none" : `1px solid ${LINE}`,
                color: TEXT_HI,
              }}
            >
              <Link
                href={`/${r.slug}`}
                className="focus-ring flex items-center gap-3 text-[13px]"
              >
                <span
                  className="w-6 font-mono text-[10.5px] tabular-nums"
                  style={{ color: TEXT_LOW }}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="truncate font-medium">{r.name}</span>
                    {r.party && (
                      <span
                        className="font-mono text-[9.5px] uppercase tracking-[0.18em] px-1.5 py-0.5 rounded-sm shrink-0"
                        style={{
                          background: `${partyColor}1A`,
                          color: partyColor,
                          border: `1px solid ${partyColor}55`,
                        }}
                      >
                        {r.party}
                      </span>
                    )}
                  </div>
                  <div
                    className="mt-1.5 h-1 rounded-full overflow-hidden"
                    style={{ background: "rgba(255,255,255,0.06)" }}
                  >
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${pct}%`,
                        background: `linear-gradient(90deg, rgba(124,95,255,0.95) 0%, rgba(167,139,250,0.85) 100%)`,
                      }}
                    />
                  </div>
                </div>
                <span
                  className="font-mono text-[11.5px] tabular-nums shrink-0"
                  style={{ color: TEXT_MID }}
                >
                  {r.filings} filing{r.filings === 1 ? "" : "s"}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}

/* ─── AI overlap card ─────────────────────────────────────────── */
function AIOverlapCard({ pct }: { pct: number }) {
  return (
    <Card title="AI mind overlap">
      <div className="px-5 py-6 flex items-center gap-5">
        <div
          className="relative inline-flex items-center justify-center"
          style={{ width: 84, height: 84 }}
        >
          <svg viewBox="0 0 36 36" className="absolute inset-0" style={{ transform: "rotate(-90deg)" }}>
            <circle cx="18" cy="18" r="16" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="3" />
            <circle
              cx="18"
              cy="18"
              r="16"
              fill="none"
              stroke={VIOLET_2}
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray={`${(pct / 100) * 100.53} 100.53`}
            />
          </svg>
          <Brain size={22} color={VIOLET_2} />
        </div>
        <div className="flex-1">
          <div className="font-mono text-[28px] font-semibold tabular-nums" style={{ color: TEXT_HI }}>
            {pct}%
          </div>
          <div className="text-[11.5px]" style={{ color: TEXT_MID }}>
            of AI minds hold something in this sector.
          </div>
        </div>
      </div>
    </Card>
  );
}

/* ─── Recent filings ─────────────────────────────────────────── */
function RecentFilings({ rows }: { rows: SectorDetail["recentFilings"] }) {
  const router = useRouter();
  if (rows.length === 0) {
    return (
      <Card title="Recent filings">
        <EmptyState icon={<Inbox size={18} />} headline="No recent filings" body="Quiet in this sector lately." compact />
      </Card>
    );
  }
  return (
    <Card title="Recent filings" right={<span className="font-mono text-[10.5px]" style={{ color: TEXT_MID }}>{rows.length}</span>}>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr
              className="text-[10px] uppercase tracking-[0.16em]"
              style={{ color: TEXT_LOW, background: "rgba(255,255,255,0.02)" }}
            >
              <th className="px-5 py-2.5 text-left font-normal">When</th>
              <th className="px-3 py-2.5 text-left font-normal">Member</th>
              <th className="px-3 py-2.5 text-right font-normal">Bracket</th>
              <th className="px-3 py-2.5 text-left font-normal">Side</th>
              <th className="px-5 py-2.5 text-right font-normal">Ticker</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr
                key={r.txId}
                className="focus-ring text-[12.5px] hover:bg-white/[0.025] transition-colors cursor-pointer"
                style={{ borderTop: i === 0 ? "none" : `1px solid ${LINE}`, color: TEXT_HI }}
                tabIndex={0}
                role="link"
                aria-label={`View ${r.portfolioName} profile`}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    router.push(`/${r.slug}`);
                  }
                }}
                onClick={() => router.push(`/${r.slug}`)}
              >
                <td className="px-5 py-3 font-mono tabular-nums text-[11px]" style={{ color: TEXT_LOW }}>
                  <TimeAgo iso={r.disclosedDate} />
                </td>
                <td className="px-3 py-3">{r.portfolioName}{r.party && <span className="ml-2 text-[10.5px]" style={{ color: TEXT_MID }}>({r.party})</span>}</td>
                <td className="px-3 py-3 font-mono text-right tabular-nums" style={{ color: TEXT_MID }}>{r.bracket}</td>
                <td className="px-3 py-3 font-mono uppercase text-[10.5px]" style={{ color: r.action === "buy" ? POSITIVE : NEGATIVE }}>
                  {r.action}
                </td>
                <td className="px-5 py-3 font-mono text-right" style={{ color: YELLOW }}>
                  <Link
                    href={`/ticker/${r.ticker}`}
                    onClick={(e) => e.stopPropagation()}
                    className="hover:underline"
                  >
                    {r.ticker}
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

/* ─── Card wrapper ─────────────────────────────────────────── */
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
