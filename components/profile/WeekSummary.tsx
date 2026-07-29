// components/profile/WeekSummary.tsx
//
// Compact "this week" recap card. Sits between the PortraitHeader and the
// performance chart. Pure derivation from the transactions array already
// returned by ProfileData — no new query.
"use client";
import { useMemo } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowDownRight, ArrowUpRight, Calendar, Sparkles } from "lucide-react";
import type { ProfileData } from "@/lib/queries";
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

type WeekStats = {
  buys: number;
  sells: number;
  tickers: string[];
  /** Daily buckets — 7 entries, oldest first (Mon..Sun relative to today). */
  daily: { date: string; buys: number; sells: number }[];
  /** Max daily volume across the 7-day window, used to scale sparkbars. */
  dailyMax: number;
};

function buildWeekStats(transactions: ProfileData["transactions"]): WeekStats {
  // Anchor on the most recent disclosed transaction date if present, else today.
  // This way profiles with old fake data don't look perpetually quiet.
  const allTs = transactions
    .map((t) => new Date(t.disclosedDate).getTime())
    .filter((t) => Number.isFinite(t));
  const latestTs = allTs.length > 0 ? Math.max(...allTs) : Date.now();
  const anchor = new Date(latestTs);
  // Treat "this week" as the trailing 7 days ending on the anchor (inclusive).
  const start = new Date(anchor);
  start.setUTCDate(start.getUTCDate() - 6);
  start.setUTCHours(0, 0, 0, 0);
  const startMs = start.getTime();
  const endMs = anchor.getTime() + 86400_000 - 1;

  const inWindow = transactions.filter((t) => {
    const ts = new Date(t.disclosedDate).getTime();
    return Number.isFinite(ts) && ts >= startMs && ts <= endMs;
  });

  // Build daily buckets keyed by YYYY-MM-DD in UTC.
  const days: { date: string; buys: number; sells: number }[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(start);
    d.setUTCDate(start.getUTCDate() + i);
    days.push({ date: d.toISOString().slice(0, 10), buys: 0, sells: 0 });
  }
  const idx = new Map(days.map((d, i) => [d.date, i] as const));
  for (const t of inWindow) {
    const key = t.disclosedDate.slice(0, 10);
    const i = idx.get(key);
    if (i === undefined) continue;
    if (t.action === "buy") days[i].buys += 1;
    else days[i].sells += 1;
  }

  // Last unique tickers (most recent first), capped at 3 for chip row.
  const seen = new Set<string>();
  const tickers: string[] = [];
  for (const t of [...inWindow].sort(
    (a, b) => b.disclosedDate.localeCompare(a.disclosedDate),
  )) {
    if (seen.has(t.ticker)) continue;
    seen.add(t.ticker);
    tickers.push(t.ticker);
    if (tickers.length >= 3) break;
  }

  const buys = inWindow.filter((t) => t.action === "buy").length;
  const sells = inWindow.filter((t) => t.action === "sell").length;
  let dailyMax = 1;
  for (const d of days) dailyMax = Math.max(dailyMax, d.buys + d.sells);

  return { buys, sells, tickers, daily: days, dailyMax };
}

export function WeekSummary({ d }: { d: ProfileData }) {
  const reduced = useReducedMotion();
  const stats = useMemo(() => buildWeekStats(d.transactions), [d.transactions]);
  const totalFilings = stats.buys + stats.sells;

  // Last filing date — surfaced when this week is quiet.
  const lastFiling = useMemo(() => {
    if (d.transactions.length === 0) return null;
    return d.transactions
      .slice()
      .sort((a, b) => b.disclosedDate.localeCompare(a.disclosedDate))[0];
  }, [d.transactions]);

  return (
    <motion.section
      data-printable="true"
      initial={reduced ? { opacity: 0 } : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      className="rounded-2xl p-4 sm:p-5"
      style={{
        background:
          "linear-gradient(180deg, rgba(255,255,255,0.025) 0%, rgba(255,255,255,0.005) 100%)",
        border: `1px solid ${LINE_2}`,
        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04)",
      }}
    >
      <div className="flex items-center gap-3 flex-wrap">
        <div
          className="font-mono text-[10px] uppercase tracking-[0.18em] inline-flex items-center gap-1.5"
          style={{ color: VIOLET_2 }}
        >
          <Sparkles size={11} /> This week
        </div>
        {totalFilings === 0 ? (
          <QuietState lastFiling={lastFiling} />
        ) : (
          <ActiveHeadline buys={stats.buys} sells={stats.sells} />
        )}
        <div className="ml-auto flex items-center gap-2">
          <Link
            href="/calendar"
            className="inline-flex items-center gap-1.5 text-[11.5px] hover:underline"
            style={{ color: TEXT_LOW }}
          >
            <Calendar size={11} />
            View calendar
          </Link>
        </div>
      </div>

      {totalFilings > 0 && (
        <>
          <Sparkbars daily={stats.daily} dailyMax={stats.dailyMax} reduced={!!reduced} />
          {stats.tickers.length > 0 && (
            <div className="mt-3 flex items-center gap-2 flex-wrap">
              <span
                className="font-mono text-[10px] uppercase tracking-[0.18em]"
                style={{ color: TEXT_LOW }}
              >
                Tickers
              </span>
              {stats.tickers.map((t) => (
                <Link
                  key={t}
                  href={`/ticker/${t}`}
                  className="font-mono text-[11.5px] px-2 py-0.5 rounded transition-colors hover:opacity-90"
                  style={{
                    background: "rgba(247,210,74,0.10)",
                    color: YELLOW,
                    border: `1px solid rgba(247,210,74,0.25)`,
                  }}
                >
                  {t}
                </Link>
              ))}
            </div>
          )}
        </>
      )}
    </motion.section>
  );
}

function ActiveHeadline({ buys, sells }: { buys: number; sells: number }) {
  return (
    <div className="text-[13px] flex items-center gap-2 flex-wrap" style={{ color: TEXT_HI }}>
      <span className="inline-flex items-center gap-1.5">
        <ArrowUpRight size={13} style={{ color: POSITIVE }} />
        <span className="font-mono tabular-nums" style={{ color: POSITIVE }}>
          {buys}
        </span>
        <span style={{ color: TEXT_MID }}>{buys === 1 ? "buy" : "buys"}</span>
      </span>
      <span style={{ color: TEXT_LOW }}>·</span>
      <span className="inline-flex items-center gap-1.5">
        <ArrowDownRight size={13} style={{ color: NEGATIVE }} />
        <span className="font-mono tabular-nums" style={{ color: NEGATIVE }}>
          {sells}
        </span>
        <span style={{ color: TEXT_MID }}>{sells === 1 ? "sell" : "sells"}</span>
      </span>
      <span style={{ color: TEXT_LOW }}>·</span>
      <span className="text-[12px]" style={{ color: TEXT_MID }}>
        last 7 days
      </span>
    </div>
  );
}

function QuietState({
  lastFiling,
}: {
  lastFiling: ProfileData["transactions"][number] | null;
}) {
  return (
    <div className="text-[13px]" style={{ color: TEXT_MID }}>
      No filings this week
      {lastFiling && (
        <>
          <span className="mx-1.5" style={{ color: TEXT_LOW }}>·</span>
          <span style={{ color: TEXT_LOW }}>
            last filing{" "}
            <span style={{ color: TEXT_HI }}>{fmtDate(lastFiling.disclosedDate)}</span>
            <span className="mx-1.5" style={{ color: TEXT_LOW }}>·</span>
            <span
              className="font-mono uppercase tracking-[0.12em] text-[11px]"
              style={{ color: lastFiling.action === "buy" ? POSITIVE : NEGATIVE }}
            >
              {lastFiling.action}
            </span>{" "}
            <span className="font-mono" style={{ color: YELLOW }}>
              {lastFiling.ticker}
            </span>
          </span>
        </>
      )}
    </div>
  );
}

function Sparkbars({
  daily,
  dailyMax,
  reduced,
}: {
  daily: WeekStats["daily"];
  dailyMax: number;
  reduced: boolean;
}) {
  return (
    <div className="mt-4">
      <div
        className="grid gap-1.5"
        style={{ gridTemplateColumns: "repeat(7, minmax(0, 1fr))" }}
      >
        {daily.map((d, i) => {
          const total = d.buys + d.sells;
          const buyH = total === 0 ? 0 : (d.buys / dailyMax) * 100;
          const sellH = total === 0 ? 0 : (d.sells / dailyMax) * 100;
          return (
            <div
              key={d.date}
              className="flex flex-col items-stretch gap-1"
              title={`${fmtDate(d.date)} — ${d.buys} buys · ${d.sells} sells`}
            >
              <div
                className="relative rounded-md overflow-hidden flex flex-col-reverse"
                style={{
                  height: 44,
                  background: "rgba(255,255,255,0.04)",
                  border: `1px solid ${LINE}`,
                }}
              >
                {/* Stacked buys (bottom, green) + sells (above, red).
                    flex-col-reverse means children render bottom-up. */}
                <motion.span
                  initial={reduced ? { height: `${buyH}%` } : { height: 0 }}
                  animate={{ height: `${buyH}%` }}
                  transition={{ duration: 0.5, ease: "easeOut", delay: i * 0.04 }}
                  style={{
                    background: "rgba(74,222,128,0.65)",
                    width: "100%",
                  }}
                />
                <motion.span
                  initial={reduced ? { height: `${sellH}%` } : { height: 0 }}
                  animate={{ height: `${sellH}%` }}
                  transition={{ duration: 0.5, ease: "easeOut", delay: 0.08 + i * 0.04 }}
                  style={{
                    background: "rgba(248,113,113,0.55)",
                    width: "100%",
                  }}
                />
              </div>
              <span
                className="font-mono text-[9.5px] uppercase tracking-[0.14em] text-center"
                style={{ color: TEXT_LOW }}
              >
                {fmtDayLabel(d.date)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function fmtDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function fmtDayLabel(iso: string): string {
  // Mon/Tue/Wed/… in caller's locale.
  const d = new Date(`${iso}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-US", { weekday: "short", timeZone: "UTC" });
}
