// components/profile/ReturnChartBenchmarks.tsx
"use client";
import { useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  LINE,
  LINE_2,
  TEXT_MID,
  TEXT_LOW,
  VIOLET_2,
  POSITIVE,
  NEGATIVE,
  YELLOW,
} from "@/lib/theme";
import { CountUp } from "@/components/ui/CountUp";

type Series = { date: string; value: number }[];
type Range = "1M" | "3M" | "YTD" | "1Y" | "ALL";

export function ReturnChartBenchmarks({
  portfolio,
  spy,
  qqq,
  ytdReturn,
  vsSpy,
  maxDD,
}: {
  portfolio: Series;
  spy: Series;
  qqq: Series;
  ytdReturn: number | null;
  vsSpy: number | null;
  maxDD: number;
}) {
  const [range, setRange] = useState<Range>("ALL");

  const clipped = useMemo(() => {
    if (range === "ALL") return { p: portfolio, s: spy, q: qqq };
    const daysMap: Record<Range, number> = { "1M": 30, "3M": 90, "YTD": 365, "1Y": 365, "ALL": 99999 };
    const cutoff = new Date(Date.now() - daysMap[range] * 86400000).toISOString().slice(0, 10);
    return {
      p: portfolio.filter((d) => d.date >= cutoff),
      s: spy.filter((d) => d.date >= cutoff),
      q: qqq.filter((d) => d.date >= cutoff),
    };
  }, [range, portfolio, spy, qqq]);

  return (
    <section
      className="rounded-2xl p-4 sm:p-6"
      style={{
        background: "linear-gradient(180deg, rgba(255,255,255,0.025) 0%, rgba(255,255,255,0.005) 100%)",
        border: `1px solid ${LINE_2}`,
      }}
    >
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <div className="text-[10.5px] uppercase tracking-[0.16em]" style={{ color: TEXT_LOW }}>Return vs benchmarks</div>
          <div className="flex items-center gap-4 mt-1 text-[12px]" style={{ color: TEXT_MID }}>
            <span className="inline-flex items-center gap-1.5"><span className="w-3 h-[2px]" style={{ background: VIOLET_2 }} /> Portfolio</span>
            <span className="inline-flex items-center gap-1.5"><span className="w-3 h-[2px]" style={{ background: TEXT_MID }} /> SPY</span>
            <span className="inline-flex items-center gap-1.5"><span className="w-3 h-[2px]" style={{ background: YELLOW }} /> QQQ</span>
          </div>
        </div>
        <div className="flex gap-1 flex-wrap">
          {(["1M", "3M", "YTD", "1Y", "ALL"] as Range[]).map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className="rounded-full px-3 py-1 font-mono text-[10.5px] uppercase tracking-wider transition-colors"
              style={{
                background: range === r ? "#fff" : "transparent",
                color: range === r ? "#000" : TEXT_MID,
                border: `1px solid ${range === r ? "transparent" : LINE_2}`,
              }}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      <MultiLine portfolio={clipped.p} spy={clipped.s} qqq={clipped.q} />

      <div className="mt-5 grid grid-cols-3 gap-4 pt-4 border-t" style={{ borderColor: LINE }}>
        <StatNumeric
          label="Portfolio return"
          numericValue={ytdReturn}
          format={(v) => `${v >= 0 ? "+" : ""}${v.toFixed(1)}%`}
          color={ytdReturn !== null && ytdReturn >= 0 ? POSITIVE : NEGATIVE}
        />
        <StatNumeric
          label="vs SPY"
          numericValue={vsSpy}
          format={(v) => `${v >= 0 ? "+" : ""}${v.toFixed(1)}pp`}
          color={vsSpy !== null && vsSpy >= 0 ? POSITIVE : NEGATIVE}
        />
        <StatNumeric
          label="Max drawdown"
          numericValue={maxDD * 100}
          format={(v) => `${v.toFixed(1)}%`}
          color={NEGATIVE}
        />
      </div>
    </section>
  );
}

/* ──────────────────────── Chart ──────────────────────── */

function MultiLine({ portfolio, spy, qqq }: { portfolio: Series; spy: Series; qqq: Series }) {
  const w = 1000;
  const h = 360;
  const pad = { l: 56, r: 16, t: 16, b: 36 };

  // Unified sorted date axis so all three series share the same X.
  const unifiedDates = useMemo(() => {
    const set = new Set<string>();
    for (const d of portfolio) set.add(d.date);
    for (const d of spy) set.add(d.date);
    for (const d of qqq) set.add(d.date);
    return Array.from(set).sort();
  }, [portfolio, spy, qqq]);
  const dateIndex = useMemo(() => {
    const m = new Map<string, number>();
    unifiedDates.forEach((d, i) => m.set(d, i));
    return m;
  }, [unifiedDates]);

  // Y range with a touch of padding so lines don't kiss the edges.
  const { min, max, range } = useMemo(() => {
    const all = [...portfolio, ...spy, ...qqq];
    if (all.length === 0) return { min: 90, max: 110, range: 20 };
    const rawMin = Math.min(...all.map((d) => d.value));
    const rawMax = Math.max(...all.map((d) => d.value));
    const sp = rawMax - rawMin || 1;
    const mn = rawMin - sp * 0.08;
    const mx = rawMax + sp * 0.08;
    return { min: mn, max: mx, range: mx - mn || 1 };
  }, [portfolio, spy, qqq]);

  // Y-axis ticks (5 evenly spaced, top→bottom).
  const yTicks = useMemo(() => {
    const out: { v: number; pct: number }[] = [];
    const steps = 4;
    for (let i = 0; i <= steps; i++) {
      const v = max - (i / steps) * range;
      out.push({ v, pct: v - 100 });
    }
    return out;
  }, [min, max, range]);

  // X-axis: 4 evenly-spaced labels from unifiedDates.
  const xTicks = useMemo(() => {
    if (unifiedDates.length === 0) return [];
    const targets = 4;
    const out: { date: string; label: string }[] = [];
    for (let i = 0; i < targets; i++) {
      const idx = Math.round((i / (targets - 1)) * (unifiedDates.length - 1));
      const date = unifiedDates[Math.min(idx, unifiedDates.length - 1)];
      out.push({ date, label: fmtDateLabel(date) });
    }
    return out;
  }, [unifiedDates]);

  if (unifiedDates.length === 0) {
    return (
      <div
        style={{ height: h, color: TEXT_LOW }}
        className="flex items-center justify-center text-[12px]"
      >
        No data
      </div>
    );
  }

  const innerW = w - pad.l - pad.r;
  const innerH = h - pad.t - pad.b;

  const x = (date: string) => {
    const idx = dateIndex.get(date) ?? 0;
    if (unifiedDates.length < 2) return pad.l;
    return pad.l + (idx / (unifiedDates.length - 1)) * innerW;
  };
  const y = (v: number) => pad.t + (1 - (v - min) / range) * innerH;

  const path = (s: Series) =>
    s.length < 2
      ? ""
      : s
          .map((d, i) => `${i === 0 ? "M" : "L"} ${x(d.date).toFixed(1)} ${y(d.value).toFixed(1)}`)
          .join(" ");

  const areaPath = (s: Series) => {
    if (s.length < 2) return "";
    const baselineY = y(100).toFixed(1);
    const line = s
      .map((d, i) => `${i === 0 ? "M" : "L"} ${x(d.date).toFixed(1)} ${y(d.value).toFixed(1)}`)
      .join(" ");
    const first = x(s[0].date).toFixed(1);
    const last = x(s[s.length - 1].date).toFixed(1);
    return `${line} L ${last} ${baselineY} L ${first} ${baselineY} Z`;
  };

  const baselineY = y(100);

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-[360px]" aria-hidden>
      <defs>
        <linearGradient id="portfolioArea" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={VIOLET_2} stopOpacity="0.18" />
          <stop offset="100%" stopColor={VIOLET_2} stopOpacity="0" />
        </linearGradient>
        <filter id="portfolioGlow" x="-10%" y="-30%" width="120%" height="160%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Horizontal gridlines + Y-axis labels */}
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

      {/* Explicit baseline (0%) line, drawn over gridlines for clarity */}
      <line
        x1={pad.l}
        x2={w - pad.r}
        y1={baselineY}
        y2={baselineY}
        stroke="rgba(255,255,255,0.22)"
        strokeDasharray="4 4"
      />
      <text
        x={pad.l - 10}
        y={baselineY + 3}
        textAnchor="end"
        fontFamily="var(--font-mono, ui-monospace, monospace)"
        fontSize="10"
        fontWeight="600"
        fill={TEXT_MID}
      >
        0%
      </text>

      {/* Filled area under portfolio */}
      <ChartArea d={areaPath(portfolio)} />

      {/* Benchmark lines */}
      <ChartLine d={path(qqq)} stroke={YELLOW} strokeWidth={1.4} strokeOpacity={0.6} delay={0} />
      <ChartLine d={path(spy)} stroke={TEXT_MID} strokeWidth={1.4} strokeOpacity={0.85} delay={0.05} />

      {/* Portfolio line — thicker, with glow */}
      <ChartLine
        d={path(portfolio)}
        stroke={VIOLET_2}
        strokeWidth={3}
        strokeOpacity={1}
        delay={0.12}
        filter="url(#portfolioGlow)"
      />

      {/* X-axis labels */}
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

      {/* Axis hairline along the bottom */}
      <line
        x1={pad.l}
        x2={w - pad.r}
        y1={h - pad.b}
        y2={h - pad.b}
        stroke="rgba(255,255,255,0.08)"
      />
    </svg>
  );
}

function ChartLine({
  d,
  stroke,
  strokeWidth,
  strokeOpacity,
  delay,
  filter,
}: {
  d: string;
  stroke: string;
  strokeWidth: number;
  strokeOpacity: number;
  delay: number;
  filter?: string;
}) {
  const reduced = useReducedMotion();
  return (
    <motion.path
      key={d}
      d={d}
      fill="none"
      stroke={stroke}
      strokeWidth={strokeWidth}
      strokeOpacity={strokeOpacity}
      strokeLinecap="round"
      strokeLinejoin="round"
      filter={filter}
      initial={reduced ? { pathLength: 1 } : { pathLength: 0 }}
      animate={{ pathLength: 1 }}
      transition={{ duration: reduced ? 0.01 : 0.8, ease: [0.22, 1, 0.36, 1], delay }}
    />
  );
}

function ChartArea({ d }: { d: string }) {
  const reduced = useReducedMotion();
  return (
    <motion.path
      key={d}
      d={d}
      fill="url(#portfolioArea)"
      initial={reduced ? { opacity: 1 } : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: reduced ? 0.01 : 0.5, ease: [0.22, 1, 0.36, 1], delay: 0.4 }}
    />
  );
}

function fmtPct(n: number): string {
  const rounded = Math.round(n);
  if (rounded === 0) return "0%";
  return `${rounded > 0 ? "+" : ""}${rounded}%`;
}

function fmtDateLabel(iso: string): string {
  // iso = "YYYY-MM-DD"
  const [y, m] = iso.split("-");
  if (!y || !m) return iso;
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const mi = Math.max(0, Math.min(11, parseInt(m, 10) - 1));
  // Show "Mon 'YY" for clarity on ALL/long ranges
  return `${months[mi]} '${y.slice(2)}`;
}

function StatNumeric({
  label,
  numericValue,
  format,
  color,
}: {
  label: string;
  numericValue: number | null;
  format: (v: number) => string;
  color: string;
}) {
  return (
    <div>
      <div className="font-mono text-[10px] uppercase tracking-[0.16em]" style={{ color: TEXT_LOW }}>{label}</div>
      <div className="mt-1 font-mono text-[22px] font-semibold tabular-nums" style={{ color }}>
        {numericValue === null ? "—" : <CountUp value={numericValue} format={format} duration={0.7} />}
      </div>
    </div>
  );
}
