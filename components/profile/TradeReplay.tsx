// components/profile/TradeReplay.tsx
"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Play, Pause, RotateCcw, Rewind, Gauge } from "lucide-react";
import type { ProfileData } from "@/lib/queries";
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

const SPEEDS = [0.5, 1, 2, 4] as const;
const BASE_INTERVAL_MS = 100; // 1x = ~10 tx/sec → 100ms per step

type Tx = ProfileData["transactions"][number];
type SeriesPoint = { date: string; value: number };

export function TradeReplay({
  transactions,
  series,
}: {
  transactions: Tx[];
  series: SeriesPoint[];
}) {
  const reduced = useReducedMotion();

  // Sort chronologically — oldest first, so we advance forward through time.
  const ordered = useMemo<Tx[]>(() => {
    return [...transactions].sort((a, b) =>
      a.tradeDate.localeCompare(b.tradeDate),
    );
  }, [transactions]);

  const total = ordered.length;
  const [idx, setIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState<(typeof SPEEDS)[number]>(1);
  const idxRef = useRef(idx);
  idxRef.current = idx;

  // Reset everything when the underlying dataset changes (e.g. nav between profiles).
  useEffect(() => {
    setIdx(0);
    setPlaying(false);
  }, [ordered.length]);

  // Playback engine.
  useEffect(() => {
    if (!playing || total === 0) return;
    const tick = () => {
      const cur = idxRef.current;
      if (cur >= total) {
        setPlaying(false);
        return;
      }
      setIdx(cur + 1);
    };
    const ms = BASE_INTERVAL_MS / speed;
    const id = setInterval(tick, ms);
    return () => clearInterval(id);
  }, [playing, speed, total]);

  // Auto-pause when we hit the end.
  useEffect(() => {
    if (idx >= total) setPlaying(false);
  }, [idx, total]);

  // Last shown transaction date — drives the date label and mini chart.
  const lastShown = idx > 0 ? ordered[idx - 1] : null;
  const cursorDate = lastShown?.tradeDate ?? series[0]?.date ?? null;

  // Mini chart series, sliced to the cursor.
  const chartSlice = useMemo(() => {
    if (!cursorDate || series.length === 0) return [] as SeriesPoint[];
    return series.filter((s) => s.date <= cursorDate);
  }, [cursorDate, series]);

  // Visible tx list — newest at top, last 12 shown.
  const visibleTxs = useMemo(() => {
    return ordered.slice(0, idx).reverse().slice(0, 12);
  }, [ordered, idx]);

  const onPlayPause = () => {
    if (total === 0) return;
    if (idx >= total) {
      // Replay from the beginning.
      setIdx(0);
      setPlaying(true);
      return;
    }
    setPlaying((p) => !p);
  };

  const onReset = () => {
    setIdx(0);
    setPlaying(false);
  };

  const onScrub = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = parseInt(e.target.value, 10);
    if (Number.isFinite(v)) {
      setIdx(Math.max(0, Math.min(total, v)));
    }
  };

  const cursorValue = chartSlice[chartSlice.length - 1]?.value ?? 100;
  const cursorReturn = cursorValue - 100;
  const atEnd = idx >= total;

  return (
    <section
      className="rounded-2xl overflow-hidden"
      style={{
        background:
          "linear-gradient(180deg, rgba(255,255,255,0.025) 0%, rgba(255,255,255,0.01) 100%)",
        border: `1px solid ${LINE_2}`,
        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04)",
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-5 py-3.5 border-b flex-wrap gap-2"
        style={{ borderColor: LINE }}
      >
        <div className="flex items-center gap-2.5">
          <Rewind size={14} style={{ color: VIOLET_2 }} />
          <span
            className="text-[10.5px] uppercase tracking-[0.18em]"
            style={{ color: TEXT_LOW }}
          >
            Trade replay
          </span>
          {playing && (
            <span
              className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider"
              style={{
                background: `${VIOLET}1f`,
                color: VIOLET_2,
                border: `1px solid ${VIOLET}40`,
              }}
            >
              <span
                className="w-1 h-1 rounded-full pulse-dot"
                style={{ background: VIOLET_2 }}
              />
              live
            </span>
          )}
        </div>
        <div
          className="font-mono text-[10.5px] tabular-nums"
          style={{ color: TEXT_MID }}
        >
          <span style={{ color: TEXT_HI }}>{idx}</span> /{" "}
          <span>{total}</span> filings
        </div>
      </div>

      <div className="grid grid-cols-12 gap-5 p-5">
        {/* Left: control panel + mini chart + date stamp */}
        <div className="col-span-12 lg:col-span-7 flex flex-col gap-4">
          {/* Date stamp + return */}
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <div
                className="font-mono text-[10px] uppercase tracking-[0.18em] mb-1"
                style={{ color: TEXT_LOW }}
              >
                Cursor date
              </div>
              <div
                className="text-[20px] sm:text-[22px] font-semibold tracking-tight tabular-nums"
                style={{ color: TEXT_HI }}
              >
                {fmtPretty(cursorDate)}
              </div>
            </div>
            <div className="text-right">
              <div
                className="font-mono text-[10px] uppercase tracking-[0.18em] mb-1"
                style={{ color: TEXT_LOW }}
              >
                Cumulative return
              </div>
              <div
                className="font-mono text-[20px] sm:text-[22px] tabular-nums font-semibold"
                style={{
                  color: cursorReturn >= 0 ? POSITIVE : NEGATIVE,
                }}
              >
                {cursorReturn >= 0 ? "+" : ""}
                {cursorReturn.toFixed(2)}%
              </div>
            </div>
          </div>

          {/* Mini chart */}
          <MiniChart
            slice={chartSlice}
            fullSeries={series}
            reduced={!!reduced}
            color={cursorReturn >= 0 ? POSITIVE : NEGATIVE}
          />

          {/* Controls */}
          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={onPlayPause}
              disabled={total === 0}
              aria-label={playing ? "Pause" : atEnd ? "Replay" : "Play"}
              className="inline-flex items-center justify-center w-10 h-10 rounded-full transition-all active:scale-[0.96] disabled:opacity-40"
              style={{
                background: `linear-gradient(135deg, ${VIOLET} 0%, ${VIOLET_2} 100%)`,
                color: "#fff",
                boxShadow: `0 10px 26px -8px ${VIOLET}88, inset 0 1px 0 rgba(255,255,255,0.20)`,
              }}
            >
              {atEnd ? (
                <RotateCcw size={14} />
              ) : playing ? (
                <Pause size={14} fill="#fff" />
              ) : (
                <Play size={14} fill="#fff" className="ml-0.5" />
              )}
            </button>
            <button
              onClick={onReset}
              disabled={idx === 0}
              aria-label="Reset"
              className="inline-flex items-center justify-center w-9 h-9 rounded-full transition-colors hover:bg-white/[0.05] disabled:opacity-40"
              style={{ color: TEXT_MID, border: `1px solid ${LINE_2}` }}
            >
              <Rewind size={12} />
            </button>

            {/* Scrubber */}
            <div className="flex-1 min-w-[160px] flex items-center gap-2">
              <input
                type="range"
                min={0}
                max={total}
                value={idx}
                onChange={onScrub}
                aria-label="Replay scrubber"
                className="flex-1 accent-violet-400"
                style={{ accentColor: VIOLET_2 }}
              />
            </div>

            {/* Speed selector */}
            <SpeedSelector value={speed} onChange={setSpeed} />
          </div>
        </div>

        {/* Right: scrolling tx list */}
        <div
          className="col-span-12 lg:col-span-5 rounded-xl overflow-hidden"
          style={{
            background: "rgba(0,0,0,0.32)",
            border: `1px solid ${LINE_2}`,
          }}
        >
          <div
            className="flex items-center justify-between px-3 py-2 border-b"
            style={{ borderColor: LINE, background: "rgba(255,255,255,0.02)" }}
          >
            <span
              className="font-mono text-[9.5px] uppercase tracking-[0.18em]"
              style={{ color: TEXT_LOW }}
            >
              Tape · newest first
            </span>
            <span
              className="font-mono text-[10px] tabular-nums"
              style={{ color: TEXT_MID }}
            >
              {visibleTxs.length}
            </span>
          </div>
          <div
            className="overflow-y-auto"
            style={{ maxHeight: 280, minHeight: 260 }}
          >
            {visibleTxs.length === 0 && (
              <div
                className="px-4 py-6 text-center text-[12px]"
                style={{ color: TEXT_LOW }}
              >
                {total === 0
                  ? "No filings to replay yet"
                  : "Press play to start the tape"}
              </div>
            )}
            {visibleTxs.map((t, i) => (
              <motion.div
                key={`${t.id}-${idx - i}`}
                initial={
                  reduced
                    ? { opacity: 0 }
                    : {
                        opacity: 0,
                        y: -12,
                        backgroundColor: "rgba(124,95,255,0.22)",
                      }
                }
                animate={
                  reduced
                    ? { opacity: 1 }
                    : {
                        opacity: 1,
                        y: 0,
                        backgroundColor: ["rgba(124,95,255,0.22)", "rgba(0,0,0,0)"],
                      }
                }
                transition={{
                  duration: 0.5,
                  ease: EASE,
                  backgroundColor: { duration: 1.6 },
                }}
                className="flex items-center gap-2.5 px-3 py-2 font-mono text-[12px]"
                style={{
                  borderBottom:
                    i === visibleTxs.length - 1 ? "none" : `1px solid ${LINE}`,
                  color: TEXT_HI,
                }}
              >
                <span
                  className="font-mono text-[10px] uppercase tracking-[0.14em] tabular-nums w-12 shrink-0"
                  style={{ color: TEXT_LOW }}
                >
                  {fmtShort(t.tradeDate)}
                </span>
                <span
                  className="font-mono text-[9.5px] uppercase tracking-[0.16em] px-1.5 py-[1px] rounded-sm w-10 text-center"
                  style={{
                    background:
                      t.action === "buy"
                        ? "rgba(74,222,128,0.14)"
                        : "rgba(248,113,113,0.14)",
                    color: t.action === "buy" ? POSITIVE : NEGATIVE,
                  }}
                >
                  {t.action}
                </span>
                <span
                  className="flex-1 text-right truncate font-mono"
                  style={{ color: YELLOW }}
                >
                  {t.ticker}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ───────────────────────── Mini chart ───────────────────────── */

function MiniChart({
  slice,
  fullSeries,
  reduced,
  color,
}: {
  slice: SeriesPoint[];
  fullSeries: SeriesPoint[];
  reduced: boolean;
  color: string;
}) {
  const w = 760;
  const h = 110;
  const pad = { l: 6, r: 6, t: 6, b: 6 };

  if (fullSeries.length < 2) {
    return (
      <div
        className="rounded-xl flex items-center justify-center"
        style={{
          height: h,
          background: "rgba(0,0,0,0.25)",
          border: `1px solid ${LINE_2}`,
          color: TEXT_LOW,
          fontSize: 12,
        }}
      >
        Not enough data
      </div>
    );
  }

  const all = fullSeries;
  const min = Math.min(...all.map((d) => d.value));
  const max = Math.max(...all.map((d) => d.value));
  const range = (max - min) || 1;

  const innerW = w - pad.l - pad.r;
  const innerH = h - pad.t - pad.b;

  const xFor = (i: number) =>
    pad.l + (i / (all.length - 1)) * innerW;
  const yFor = (v: number) =>
    pad.t + (1 - (v - min) / range) * innerH;

  // Map slice → indices in the full series.
  const dateToIdx = new Map(all.map((p, i) => [p.date, i]));
  const sliceLen = slice.length;
  const lastIdx = sliceLen > 0 ? dateToIdx.get(slice[sliceLen - 1].date) ?? 0 : 0;

  // Played portion path.
  const playedPath = all
    .slice(0, lastIdx + 1)
    .map((p, i) => `${i === 0 ? "M" : "L"} ${xFor(i).toFixed(1)} ${yFor(p.value).toFixed(1)}`)
    .join(" ");

  // Ghost-of-future path.
  const futurePath = all
    .slice(lastIdx)
    .map((p, i) => {
      const realIdx = lastIdx + i;
      return `${i === 0 ? "M" : "L"} ${xFor(realIdx).toFixed(1)} ${yFor(p.value).toFixed(1)}`;
    })
    .join(" ");

  const cursorX = xFor(lastIdx);
  const cursorY = yFor(all[lastIdx]?.value ?? 100);
  const baselineY = yFor(100);

  return (
    <div
      className="rounded-xl overflow-hidden relative"
      style={{
        background: "rgba(0,0,0,0.32)",
        border: `1px solid ${LINE_2}`,
      }}
    >
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full" style={{ height: h }}>
        <defs>
          <linearGradient id="replayFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.28" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        {/* Baseline 100 dotted */}
        <line
          x1={pad.l}
          x2={w - pad.r}
          y1={baselineY}
          y2={baselineY}
          stroke="rgba(255,255,255,0.12)"
          strokeDasharray="3 4"
        />
        {/* Ghost-of-future line */}
        <path
          d={futurePath}
          fill="none"
          stroke="rgba(255,255,255,0.18)"
          strokeWidth="1.2"
          strokeLinecap="round"
        />
        {/* Played path fill */}
        {sliceLen > 0 && (
          <path
            d={`${playedPath} L ${cursorX.toFixed(1)} ${baselineY.toFixed(1)} L ${pad.l} ${baselineY.toFixed(1)} Z`}
            fill="url(#replayFill)"
          />
        )}
        {/* Played path stroke */}
        <motion.path
          d={playedPath}
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={reduced ? false : { pathLength: 0 }}
          animate={reduced ? false : { pathLength: 1 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        />
        {/* Cursor */}
        {sliceLen > 0 && (
          <>
            <line
              x1={cursorX}
              x2={cursorX}
              y1={pad.t}
              y2={h - pad.b}
              stroke={VIOLET_2}
              strokeOpacity="0.5"
              strokeDasharray="2 3"
            />
            <circle
              cx={cursorX}
              cy={cursorY}
              r={3.5}
              fill={color}
              stroke="#fff"
              strokeWidth="1"
            />
          </>
        )}
      </svg>
    </div>
  );
}

/* ───────────────────────── Speed selector ───────────────────────── */

function SpeedSelector({
  value,
  onChange,
}: {
  value: (typeof SPEEDS)[number];
  onChange: (s: (typeof SPEEDS)[number]) => void;
}) {
  return (
    <div
      className="inline-flex items-center rounded-full p-0.5"
      style={{
        background: "rgba(255,255,255,0.03)",
        border: `1px solid ${LINE_2}`,
      }}
    >
      <Gauge
        size={11}
        className="mx-1.5"
        style={{ color: TEXT_LOW }}
        aria-hidden
      />
      {SPEEDS.map((s) => (
        <button
          key={s}
          onClick={() => onChange(s)}
          className="px-2 py-1 font-mono text-[10.5px] uppercase tracking-[0.14em] tabular-nums transition-colors rounded-full select-none"
          style={{
            background: value === s ? "#fff" : "transparent",
            color: value === s ? "#000" : TEXT_MID,
          }}
        >
          {s}x
        </button>
      ))}
    </div>
  );
}

/* ───────────────────────── Utils ───────────────────────── */

function fmtPretty(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(`${iso}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

function fmtShort(iso: string): string {
  const d = new Date(`${iso}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}
