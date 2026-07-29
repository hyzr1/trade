// app/calendar/page.tsx
"use client";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Inbox,
  TrendingUp,
  Flame,
} from "lucide-react";
import { DeskShell } from "@/components/desk/DeskShell";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import type { CalendarMonth, CalendarDay } from "@/lib/queries";
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

const EASE = [0.22, 1, 0.36, 1] as const;

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

type ViewMode = "month" | "week";

export default function CalendarPage() {
  // Track the active month as YYYY-MM. We don't know which month has data until
  // the first fetch lands. To avoid booting on a near-empty grid (today's month
  // is often "ahead" of indexed filings), seed to the previous month, then once
  // data lands jump to data.latestMonthWithData if the current view is empty.
  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const seedMonth = useMemo(() => {
    const d = new Date();
    d.setUTCDate(1);
    d.setUTCMonth(d.getUTCMonth() - 1);
    return d.toISOString().slice(0, 7);
  }, []);
  const [month, setMonth] = useState(seedMonth);
  const [autoJumped, setAutoJumped] = useState(false);
  const [view, setView] = useState<ViewMode>("month");
  const [data, setData] = useState<CalendarMonth | null>(null);
  const [loading, setLoading] = useState(true);
  const [hoverDate, setHoverDate] = useState<string | null>(null);
  const reduced = useReducedMotion();
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch(`/api/calendar?month=${encodeURIComponent(month)}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d: CalendarMonth | null) => {
        if (cancelled) return;
        setData(d);
        // One-shot auto-jump: if first load lands on an empty month and the API
        // hints at a busier nearby month via `prev`, hop back so users see a
        // populated grid instead of a blank one.
        if (!autoJumped && d && d.totalFilings === 0 && d.prev && d.prev !== month) {
          setAutoJumped(true);
          setMonth(d.prev);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [month, autoJumped]);

  const onPrev = () => data && setMonth(data.prev);
  const onNext = () => data && setMonth(data.next);
  const onToday = () => setMonth(today.slice(0, 7));

  // Max filings in the visible month — used to scale the intensity scale.
  const visibleDays = data?.days ?? [];
  const maxFilings = useMemo(() => {
    let m = 0;
    for (const d of visibleDays) {
      if (!d.outside && d.filings > m) m = d.filings;
    }
    return m;
  }, [visibleDays]);

  // Hovered day for the popover. We render outside the grid to escape overflow.
  const hovered = hoverDate ? visibleDays.find((d) => d.date === hoverDate) ?? null : null;

  return (
    <DeskShell breadcrumb="Calendar">
      <Header
        monthLabel={data?.monthLabel ?? "Loading…"}
        totalFilings={data?.totalFilings ?? 0}
        busyDay={data?.busyDay ?? null}
        onPrev={onPrev}
        onNext={onNext}
        onToday={onToday}
        view={view}
        onView={setView}
        disabled={loading}
      />

      <section
        className="rounded-2xl overflow-hidden"
        style={{
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.025) 0%, rgba(255,255,255,0.01) 100%)",
          border: `1px solid ${LINE_2}`,
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04)",
        }}
      >
        {loading && (
          <div className="p-5">
            <Skeleton className="h-[440px] w-full rounded-xl" />
          </div>
        )}

        {!loading && data && data.totalFilings === 0 && (
          <EmptyState
            icon={<Inbox size={20} />}
            headline="No filings indexed for this month"
            body="Try a different month — autotrade indexed 213 filings last week alone."
          />
        )}

        {!loading && data && data.totalFilings > 0 && (
          <>
            {/* Weekday header */}
            <div
              className="grid border-b"
              style={{
                gridTemplateColumns: "repeat(7, minmax(0, 1fr))",
                borderColor: LINE,
                background: "rgba(255,255,255,0.02)",
              }}
            >
              {WEEKDAYS.map((w) => (
                <div
                  key={w}
                  className="px-3 py-2 font-mono text-[10px] uppercase tracking-[0.18em]"
                  style={{ color: TEXT_LOW }}
                >
                  {w}
                </div>
              ))}
            </div>

            <div className="relative">
              <AnimatePresence mode="wait">
                <motion.div
                  key={`${month}::${view}`}
                  initial={reduced ? { opacity: 0 } : { opacity: 0, y: 6 }}
                  animate={reduced ? { opacity: 1 } : { opacity: 1, y: 0 }}
                  exit={reduced ? { opacity: 0 } : { opacity: 0, y: -6 }}
                  transition={{ duration: 0.24, ease: EASE }}
                  className="grid"
                  style={{
                    gridTemplateColumns:
                      view === "month" ? "repeat(7, minmax(0, 1fr))" : "1fr",
                  }}
                >
                  {view === "month"
                    ? visibleDays.map((d) => (
                        <DayCell
                          key={d.date}
                          day={d}
                          maxFilings={maxFilings}
                          isToday={d.date === today}
                          onHoverDate={setHoverDate}
                          onClick={() => {
                            if (!d.outside && d.filings > 0) {
                              setHoverDate(d.date);
                            }
                          }}
                        />
                      ))
                    : visibleDays
                        .filter((d) => !d.outside)
                        .map((d) => (
                          <WeekRow
                            key={d.date}
                            day={d}
                            maxFilings={maxFilings}
                            isToday={d.date === today}
                            onPortfolioGo={(slug) => router.push(`/${slug}`)}
                            onTickerGo={(t) => router.push(`/ticker/${t}`)}
                          />
                        ))}
                </motion.div>
              </AnimatePresence>

              {/* Hover/click popover */}
              {hovered && hovered.filings > 0 && (
                <DayPopover
                  day={hovered}
                  onClose={() => setHoverDate(null)}
                  onPortfolioGo={(slug) => {
                    setHoverDate(null);
                    router.push(`/${slug}`);
                  }}
                  onTickerGo={(t) => {
                    setHoverDate(null);
                    router.push(`/ticker/${t}`);
                  }}
                />
              )}
            </div>
          </>
        )}
      </section>

      {/* Legend */}
      <div
        className="rounded-2xl px-5 py-3 flex items-center justify-between flex-wrap gap-3"
        style={{
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.02) 0%, rgba(255,255,255,0.005) 100%)",
          border: `1px solid ${LINE_2}`,
        }}
      >
        <div
          className="font-mono text-[10.5px] uppercase tracking-[0.18em]"
          style={{ color: TEXT_LOW }}
        >
          Intensity scale
        </div>
        <div className="flex items-center gap-3 text-[11px]" style={{ color: TEXT_MID }}>
          <LegendSwatch tone="off" label="0–2" />
          <LegendSwatch tone="dim" label="3–5" />
          <LegendSwatch tone="hot" label="6–10" />
          <LegendSwatch tone="glow" label="10+" />
        </div>
      </div>
    </DeskShell>
  );
}

/* ───────────────────────── Header ───────────────────────── */

function Header({
  monthLabel,
  totalFilings,
  busyDay,
  onPrev,
  onNext,
  onToday,
  view,
  onView,
  disabled,
}: {
  monthLabel: string;
  totalFilings: number;
  busyDay: { date: string; count: number } | null;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
  view: ViewMode;
  onView: (v: ViewMode) => void;
  disabled: boolean;
}) {
  return (
    <div className="flex items-center justify-between flex-wrap gap-3">
      <div>
        <div
          className="font-mono text-[10.5px] uppercase tracking-[0.22em] mb-1"
          style={{ color: VIOLET_2 }}
        >
          <CalendarDays size={11} className="inline mr-1.5 mb-[1px]" />
          Filing calendar
        </div>
        <h1
          className="text-[26px] sm:text-[28px] font-semibold tracking-tight"
          style={{ color: TEXT_HI }}
        >
          {monthLabel}
        </h1>
        <div className="text-[12.5px] mt-1 flex items-center gap-3 flex-wrap" style={{ color: TEXT_MID }}>
          <span>
            <span className="tabular-nums font-mono" style={{ color: TEXT_HI }}>
              {totalFilings}
            </span>{" "}
            filings this month
          </span>
          {busyDay && (
            <>
              <span style={{ color: TEXT_LOW }}>·</span>
              <span>
                Busiest day{" "}
                <span style={{ color: VIOLET_2 }}>{fmtPretty(busyDay.date)}</span>{" "}
                <span style={{ color: TEXT_LOW }}>({busyDay.count})</span>
              </span>
            </>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <ViewToggle view={view} onView={onView} />

        <div
          className="rounded-full flex items-center"
          style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${LINE_2}` }}
        >
          <NavBtn aria-label="Previous month" onClick={onPrev} disabled={disabled}>
            <ChevronLeft size={14} />
          </NavBtn>
          <button
            onClick={onToday}
            disabled={disabled}
            className="px-3 py-1.5 font-mono text-[10.5px] uppercase tracking-[0.16em] disabled:opacity-40"
            style={{ color: TEXT_MID }}
          >
            Today
          </button>
          <NavBtn aria-label="Next month" onClick={onNext} disabled={disabled}>
            <ChevronRight size={14} />
          </NavBtn>
        </div>
      </div>
    </div>
  );
}

function NavBtn({
  children,
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...rest}
      className="inline-flex items-center justify-center w-8 h-8 transition-colors hover:bg-white/[0.05] disabled:opacity-40 disabled:cursor-not-allowed"
      style={{ color: TEXT_MID }}
    >
      {children}
    </button>
  );
}

function ViewToggle({
  view,
  onView,
}: {
  view: ViewMode;
  onView: (v: ViewMode) => void;
}) {
  return (
    <div
      className="rounded-full inline-flex items-center"
      style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${LINE_2}` }}
    >
      {(["month", "week"] as const).map((v) => (
        <button
          key={v}
          onClick={() => onView(v)}
          className="px-3 py-1.5 font-mono text-[10.5px] uppercase tracking-[0.16em] transition-colors"
          style={{
            background: view === v ? "#fff" : "transparent",
            color: view === v ? "#000" : TEXT_MID,
            borderRadius: "9999px",
          }}
        >
          {v}
        </button>
      ))}
    </div>
  );
}

/* ───────────────────────── Day cell ───────────────────────── */

type Intensity = "off" | "dim" | "warm" | "hot" | "glow";

function intensityFor(count: number, max: number): Intensity {
  if (count <= 2) return "off";
  if (count <= 5) return "dim";
  if (count <= 10) return "warm";
  if (max > 0 && count / max >= 0.8) return "glow";
  return "hot";
}

function bgFor(intensity: Intensity, outside: boolean): string {
  if (outside) return "rgba(255,255,255,0.0)";
  switch (intensity) {
    case "off":  return "rgba(255,255,255,0.02)";
    case "dim":  return "rgba(124,95,255,0.18)";
    case "warm": return "rgba(124,95,255,0.34)";
    case "hot":  return "rgba(247,210,74,0.30)";
    case "glow":
      return "linear-gradient(135deg, rgba(247,210,74,0.55) 0%, rgba(124,95,255,0.48) 100%)";
  }
}

function DayCell({
  day,
  maxFilings,
  isToday,
  onHoverDate,
  onClick,
}: {
  day: CalendarDay;
  maxFilings: number;
  isToday: boolean;
  onHoverDate: (date: string | null) => void;
  onClick: () => void;
}) {
  const intensity = intensityFor(day.filings, maxFilings);
  const interactive = !day.outside && day.filings > 0;
  return (
    <button
      type="button"
      onMouseEnter={interactive ? () => onHoverDate(day.date) : undefined}
      onMouseLeave={interactive ? () => onHoverDate(null) : undefined}
      onClick={interactive ? onClick : undefined}
      className="relative px-2.5 py-2 text-left transition-colors hover:bg-white/[0.02] focus:outline-none"
      style={{
        height: 96,
        background: bgFor(intensity, day.outside),
        borderRight: `1px solid ${LINE}`,
        borderBottom: `1px solid ${LINE}`,
        opacity: day.outside ? 0.32 : 1,
        cursor: interactive ? "pointer" : "default",
      }}
    >
      {/* Today indicator */}
      {isToday && (
        <span
          aria-hidden
          className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full pulse-dot"
          style={{ background: VIOLET_2, boxShadow: `0 0 8px ${VIOLET}` }}
        />
      )}
      <div className="flex items-center gap-1.5">
        <span
          className="font-mono text-[12px] tabular-nums"
          style={{
            color: isToday ? VIOLET_2 : day.outside ? TEXT_LOW : TEXT_HI,
            fontWeight: isToday ? 600 : 400,
          }}
        >
          {day.day}
        </span>
        {day.filings > 0 && (
          <span
            className="font-mono text-[9.5px] uppercase tracking-[0.14em]"
            style={{ color: intensity === "glow" ? YELLOW : TEXT_MID }}
          >
            {day.filings}
          </span>
        )}
      </div>
      <div className="mt-2 flex flex-wrap gap-1">
        {day.topTickers.map((t) => (
          <span
            key={t}
            className="font-mono text-[9.5px] px-1 py-[1px] rounded-sm"
            style={{
              background: "rgba(0,0,0,0.32)",
              color: YELLOW,
              border: `1px solid ${LINE_2}`,
            }}
          >
            {t}
          </span>
        ))}
      </div>
    </button>
  );
}

/* ───────────────────────── Day popover ───────────────────────── */

function DayPopover({
  day,
  onClose,
  onPortfolioGo,
  onTickerGo,
}: {
  day: CalendarDay;
  onClose: () => void;
  onPortfolioGo: (slug: string) => void;
  onTickerGo: (ticker: string) => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 6 }}
      transition={{ duration: 0.18, ease: EASE }}
      className="absolute z-40 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-2xl overflow-hidden"
      style={{
        background: "rgba(14,11,26,0.92)",
        backdropFilter: "blur(14px)",
        WebkitBackdropFilter: "blur(14px)",
        border: `1px solid ${LINE_2}`,
        boxShadow:
          "0 60px 160px -30px rgba(0,0,0,0.85), 0 20px 50px -20px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.06)",
        width: "min(440px, calc(100vw - 48px))",
      }}
    >
      <div
        className="flex items-center justify-between px-5 py-3 border-b"
        style={{ borderColor: LINE }}
      >
        <div>
          <div
            className="font-mono text-[10px] uppercase tracking-[0.18em]"
            style={{ color: TEXT_LOW }}
          >
            {fmtPretty(day.date)}
          </div>
          <div className="text-[15px] font-semibold mt-0.5" style={{ color: TEXT_HI }}>
            {day.filings} filings indexed
          </div>
        </div>
        <button
          onClick={onClose}
          className="font-mono text-[10px] uppercase tracking-[0.16em] px-2 py-1 rounded transition-colors hover:bg-white/[0.06]"
          style={{ color: TEXT_MID }}
        >
          close
        </button>
      </div>
      <div className="max-h-[300px] overflow-y-auto px-5 py-3">
        {day.filingsPreview.map((f) => (
          <div
            key={f.txId}
            className="flex items-center gap-3 py-1.5 font-mono text-[12px]"
            style={{ color: TEXT_HI }}
          >
            <button
              onClick={() => onPortfolioGo(f.slug)}
              className="flex-1 min-w-0 truncate text-left hover:underline"
              style={{ color: TEXT_HI }}
            >
              {f.portfolioName}
            </button>
            <span
              className="w-12 shrink-0 font-semibold"
              style={{ color: f.action === "buy" ? POSITIVE : NEGATIVE }}
            >
              {f.action.toUpperCase()}
            </span>
            <button
              onClick={() => onTickerGo(f.ticker)}
              className="w-16 shrink-0 text-right hover:underline"
              style={{ color: YELLOW }}
            >
              {f.ticker}
            </button>
          </div>
        ))}
        {day.filings > day.filingsPreview.length && (
          <div
            className="pt-3 mt-1 font-mono text-[10.5px] uppercase tracking-[0.16em] text-center"
            style={{ borderTop: `1px solid ${LINE}`, color: TEXT_LOW }}
          >
            + {day.filings - day.filingsPreview.length} more
          </div>
        )}
      </div>
    </motion.div>
  );
}

/* ───────────────────────── Week row ───────────────────────── */

function WeekRow({
  day,
  maxFilings,
  isToday,
  onPortfolioGo,
  onTickerGo,
}: {
  day: CalendarDay;
  maxFilings: number;
  isToday: boolean;
  onPortfolioGo: (slug: string) => void;
  onTickerGo: (ticker: string) => void;
}) {
  const intensity = intensityFor(day.filings, maxFilings);
  return (
    <div
      className="flex items-stretch"
      style={{
        background: bgFor(intensity, false),
        borderBottom: `1px solid ${LINE}`,
      }}
    >
      <div
        className="w-28 shrink-0 px-4 py-3"
        style={{ borderRight: `1px solid ${LINE}` }}
      >
        <div
          className="font-mono text-[10.5px] uppercase tracking-[0.16em]"
          style={{ color: TEXT_LOW }}
        >
          {new Date(`${day.date}T00:00:00Z`).toLocaleDateString("en-US", {
            weekday: "short",
            timeZone: "UTC",
          })}
        </div>
        <div
          className="text-[20px] font-semibold tabular-nums"
          style={{
            color: isToday ? VIOLET_2 : TEXT_HI,
          }}
        >
          {day.day}
        </div>
        <div
          className="font-mono text-[10.5px] tabular-nums"
          style={{ color: TEXT_MID }}
        >
          {day.filings} filings
        </div>
      </div>
      <div className="flex-1 px-4 py-3 space-y-1.5">
        {day.filingsPreview.map((f) => (
          <div
            key={f.txId}
            className="flex items-center gap-3 font-mono text-[12px]"
            style={{ color: TEXT_HI }}
          >
            <button
              onClick={() => onPortfolioGo(f.slug)}
              className="flex-1 min-w-0 truncate text-left hover:underline"
              style={{ color: TEXT_HI }}
            >
              {f.portfolioName}
            </button>
            <span
              className="w-12 shrink-0 font-semibold"
              style={{ color: f.action === "buy" ? POSITIVE : NEGATIVE }}
            >
              {f.action.toUpperCase()}
            </span>
            <button
              onClick={() => onTickerGo(f.ticker)}
              className="w-16 shrink-0 text-right hover:underline"
              style={{ color: YELLOW }}
            >
              {f.ticker}
            </button>
          </div>
        ))}
        {day.filings === 0 && (
          <div className="text-[12px]" style={{ color: TEXT_LOW }}>
            — quiet day —
          </div>
        )}
        {day.filings > day.filingsPreview.length && (
          <div
            className="pt-1 font-mono text-[10.5px] uppercase tracking-[0.16em]"
            style={{ color: TEXT_LOW }}
          >
            + {day.filings - day.filingsPreview.length} more
          </div>
        )}
      </div>
    </div>
  );
}

/* ───────────────────────── Misc ───────────────────────── */

function LegendSwatch({ tone, label }: { tone: "off" | "dim" | "hot" | "glow"; label: string }) {
  const bg =
    tone === "off"
      ? "rgba(255,255,255,0.04)"
      : tone === "dim"
      ? "rgba(124,95,255,0.30)"
      : tone === "hot"
      ? "rgba(247,210,74,0.40)"
      : "linear-gradient(135deg, rgba(247,210,74,0.55) 0%, rgba(124,95,255,0.48) 100%)";
  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        className="inline-block w-3.5 h-3.5 rounded-sm"
        style={{ background: bg, border: `1px solid ${LINE_2}` }}
      />
      <span className="font-mono text-[10.5px] tabular-nums">{label}</span>
    </span>
  );
}

function fmtPretty(iso: string): string {
  const d = new Date(`${iso}T00:00:00Z`);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
}
