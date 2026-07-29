// app/backtest/page.tsx
"use client";
import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown,
  DollarSign,
  Calendar,
  Play,
  RotateCcw,
  LineChart as LineChartIcon,
  TrendingUp,
  TrendingDown,
  Sparkles,
} from "lucide-react";
import { DeskShell } from "@/components/desk/DeskShell";
import { Spinner } from "@/components/ui/Spinner";
import { CountUp } from "@/components/ui/CountUp";
import { ShareButton } from "@/components/profile/ShareButton";
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
  VIOLET_DEEP,
  YELLOW,
} from "@/lib/theme";

type BacktestTrade = {
  date: string;
  ticker: string;
  action: "buy" | "sell";
  entryPrice: number | null;
  exitPrice: number | null;
  shares: number;
  pnl: number;
  pnlPct: number | null;
};

type BacktestResponse = {
  portfolioSlug: string;
  portfolioName: string;
  startDate: string;
  capital: number;
  endingValue: number;
  totalReturnPct: number;
  vsSpyPct: number;
  maxDrawdownPct: number;
  winRatePct: number;
  totalTrades: number;
  valueSeries: { date: string; portfolio: number; spy: number }[];
  trades: BacktestTrade[];
};

const ALL_SLUGS: { slug: string; name: string; kind: "politician" | "llm" }[] = [
  { slug: "pelosi", name: "Nancy Pelosi", kind: "politician" },
  { slug: "greene", name: "M.T. Greene", kind: "politician" },
  { slug: "gottheimer", name: "Josh Gottheimer", kind: "politician" },
  { slug: "hern", name: "Kevin Hern", kind: "politician" },
  { slug: "gpt", name: "GPT-5", kind: "llm" },
  { slug: "claude", name: "Claude", kind: "llm" },
];

const DEFAULT_PORTFOLIO = "pelosi";
const DEFAULT_START_DATE = "2025-01-01";
const DEFAULT_CAPITAL = 10000;

export default function BacktestPage() {
  const [portfolio, setPortfolio] = useState(DEFAULT_PORTFOLIO);
  const [startDate, setStartDate] = useState(DEFAULT_START_DATE);
  const [capital, setCapital] = useState<number>(DEFAULT_CAPITAL);
  const [data, setData] = useState<BacktestResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [hasRun, setHasRun] = useState(false);

  const run = async () => {
    setLoading(true);
    setHasRun(true);
    try {
      const res = await fetch(
        `/api/backtest?portfolio=${encodeURIComponent(portfolio)}&startDate=${encodeURIComponent(
          startDate,
        )}&capital=${encodeURIComponent(String(capital))}`,
      );
      const j = await res.json();
      setData(j);
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setPortfolio(DEFAULT_PORTFOLIO);
    setStartDate(DEFAULT_START_DATE);
    setCapital(DEFAULT_CAPITAL);
    setData(null);
    setHasRun(false);
  };

  // run on first mount
  useEffect(() => {
    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <DeskShell breadcrumb="Backtest">
      <div className="flex flex-wrap items-baseline justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <LineChartIcon size={20} style={{ color: VIOLET_2 }} />
          <div>
            <h1
              className="text-[22px] sm:text-[26px] font-semibold tracking-tight"
              style={{ color: TEXT_HI }}
            >
              Backtest
            </h1>
            <p className="text-[13px] mt-0.5" style={{ color: TEXT_MID }}>
              If I had copied this portfolio&apos;s trades, how would I have done?
            </p>
          </div>
        </div>
        <div className="hidden sm:inline-flex font-mono text-[10px] uppercase tracking-[0.18em] items-center gap-2" style={{ color: TEXT_LOW }}>
          <Sparkles size={10} />
          Simulated · equal-weight model
        </div>
      </div>

      <ControlsBar
        portfolio={portfolio}
        setPortfolio={setPortfolio}
        startDate={startDate}
        setStartDate={setStartDate}
        capital={capital}
        setCapital={setCapital}
        loading={loading}
        onRun={run}
        onReset={reset}
      />

      {!hasRun ? null : loading ? (
        <Shimmer />
      ) : !data ? (
        <div
          className="rounded-2xl p-12 text-center"
          style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${LINE_2}`, color: TEXT_LOW }}
        >
          No data returned
        </div>
      ) : (
        <ResultsPanel data={data} />
      )}
    </DeskShell>
  );
}

/* ─────────────── Controls ─────────────── */

function ControlsBar({
  portfolio,
  setPortfolio,
  startDate,
  setStartDate,
  capital,
  setCapital,
  loading,
  onRun,
  onReset,
}: {
  portfolio: string;
  setPortfolio: (s: string) => void;
  startDate: string;
  setStartDate: (s: string) => void;
  capital: number;
  setCapital: (n: number) => void;
  loading: boolean;
  onRun: () => void;
  onReset: () => void;
}) {
  return (
    <section
      className="rounded-2xl p-5"
      style={{
        background:
          "linear-gradient(180deg, rgba(255,255,255,0.025) 0%, rgba(255,255,255,0.005) 100%)",
        border: `1px solid ${LINE_2}`,
      }}
    >
      <div className="grid grid-cols-12 gap-4 items-end">
        <div className="col-span-12 md:col-span-4">
          <FieldLabel>Portfolio</FieldLabel>
          <PortfolioDropdown value={portfolio} onChange={setPortfolio} />
        </div>
        <div className="col-span-6 md:col-span-3 min-w-0">
          <FieldLabel>Start date</FieldLabel>
          <div
            className="rounded-lg h-11 md:h-10 flex items-center pl-3 pr-2 min-w-0"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: `1px solid ${LINE_2}`,
            }}
          >
            <Calendar size={13} style={{ color: TEXT_LOW }} className="shrink-0" />
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="bg-transparent outline-none ml-2 flex-1 min-w-0 font-mono text-[13px]"
              style={{ color: TEXT_HI, colorScheme: "dark" }}
            />
          </div>
        </div>
        <div className="col-span-6 md:col-span-3 min-w-0">
          <FieldLabel>Capital</FieldLabel>
          <div
            className="rounded-lg h-11 md:h-10 flex items-center pl-3 pr-2 min-w-0"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: `1px solid ${LINE_2}`,
            }}
          >
            <DollarSign size={13} style={{ color: TEXT_LOW }} className="shrink-0" />
            <input
              type="number"
              value={capital}
              onChange={(e) => setCapital(Math.max(1, Number(e.target.value)))}
              className="bg-transparent outline-none ml-1 flex-1 min-w-0 w-full font-mono text-[13px] tabular-nums"
              style={{ color: TEXT_HI }}
              min={100}
              step={100}
            />
          </div>
        </div>
        <div className="col-span-12 md:col-span-2 flex gap-2">
          <button
            onClick={onRun}
            disabled={loading}
            className="flex-1 h-11 md:h-10 rounded-full inline-flex items-center justify-center gap-2 text-[13px] font-medium transition-all hover:brightness-110 disabled:opacity-60"
            style={{
              background: `linear-gradient(135deg, ${VIOLET} 0%, ${VIOLET_DEEP} 100%)`,
              color: "#fff",
              boxShadow:
                "0 10px 30px -10px rgba(124,95,255,0.55), inset 0 1px 0 rgba(255,255,255,0.20)",
            }}
          >
            {loading ? (
              <Spinner size="sm" color="#fff" />
            ) : (
              <Play size={13} fill="#fff" />
            )}
            {loading ? "Running…" : "Run"}
          </button>
          <button
            onClick={onReset}
            aria-label="Reset"
            className="h-11 w-11 md:h-10 md:w-10 rounded-full inline-flex items-center justify-center transition-colors hover:bg-white/5"
            style={{
              background: "rgba(255,255,255,0.03)",
              border: `1px solid ${LINE_2}`,
              color: TEXT_MID,
            }}
          >
            <RotateCcw size={13} />
          </button>
        </div>
      </div>
    </section>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="font-mono text-[10px] uppercase tracking-[0.18em] mb-1.5"
      style={{ color: TEXT_LOW }}
    >
      {children}
    </div>
  );
}

function PortfolioDropdown({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const current = ALL_SLUGS.find((s) => s.slug === value);
  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full rounded-lg h-10 flex items-center justify-between pl-3 pr-3"
        style={{
          background: "rgba(255,255,255,0.04)",
          border: `1px solid ${LINE_2}`,
        }}
      >
        <span className="flex items-center gap-2">
          <span
            className="font-mono text-[9.5px] uppercase tracking-[0.18em] px-1.5 py-0.5 rounded-sm"
            style={{
              background:
                current?.kind === "llm" ? "rgba(247,210,74,0.12)" : "rgba(124,95,255,0.14)",
              color: current?.kind === "llm" ? YELLOW : VIOLET_2,
            }}
          >
            {current?.kind === "llm" ? "AI" : "POL"}
          </span>
          <span className="text-[13px]" style={{ color: TEXT_HI }}>
            {current?.name ?? value}
          </span>
        </span>
        <ChevronDown
          size={14}
          style={{
            color: TEXT_LOW,
            transform: open ? "rotate(180deg)" : "none",
            transition: "transform .15s",
          }}
        />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.12 }}
            className="absolute left-0 right-0 top-[44px] z-20 rounded-xl p-1.5"
            style={{
              background: BG_2,
              border: `1px solid ${LINE_2}`,
              boxShadow: "0 30px 80px -20px rgba(0,0,0,0.8)",
            }}
          >
            {ALL_SLUGS.map((opt) => (
              <button
                key={opt.slug}
                onClick={() => {
                  onChange(opt.slug);
                  setOpen(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-1.5 rounded-md text-[13px] transition-colors hover:bg-white/5 text-left"
                style={{ color: opt.slug === value ? TEXT_HI : TEXT_MID }}
              >
                <span
                  className="font-mono text-[9.5px] uppercase tracking-[0.18em] px-1.5 py-0.5 rounded-sm"
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
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─────────────── Shimmer ─────────────── */

function Shimmer() {
  return (
    <div className="space-y-4">
      {[200, 320, 120, 200].map((h, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0.3 }}
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 1.4, repeat: Infinity, delay: i * 0.18 }}
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

/* ─────────────── Results ─────────────── */

function ResultsPanel({ data }: { data: BacktestResponse }) {
  const positive = data.totalReturnPct >= 0;
  return (
    <div className="space-y-4">
      <BigResult
        capital={data.capital}
        ending={data.endingValue}
        totalReturnPct={data.totalReturnPct}
        positive={positive}
        portfolioSlug={data.portfolioSlug}
        portfolioName={data.portfolioName}
      />
      {/* KPI strip sits directly below the headline so total/draw/win/vsSPY
          read as a single hero block, not as orphans floating below the chart. */}
      <StatRow data={data} />
      <ValueChart series={data.valueSeries} capital={data.capital} />
      <TradesTable trades={data.trades} />
    </div>
  );
}

function BigResult({
  capital,
  ending,
  totalReturnPct,
  positive,
  portfolioSlug,
  portfolioName,
}: {
  capital: number;
  ending: number;
  totalReturnPct: number;
  positive: boolean;
  portfolioSlug: string;
  portfolioName: string;
}) {
  return (
    <section
      className="rounded-2xl p-6 md:p-8 relative"
      style={{
        background:
          "linear-gradient(180deg, rgba(255,255,255,0.025) 0%, rgba(255,255,255,0.005) 100%)",
        border: `1px solid ${LINE_2}`,
      }}
    >
      <div className="absolute top-4 right-4">
        <ShareButton
          slug={portfolioSlug}
          title={portfolioName}
          tagline={`Backtest: copying ${portfolioName} from ${fmtMoney(
            capital,
          )} → ${fmtMoney(ending)} (${positive ? "+" : ""}${totalReturnPct.toFixed(
            1,
          )}%) on @autotrade.`}
          compact
        />
      </div>
      <div className="grid grid-cols-12 gap-6 items-end">
        <div className="col-span-12 md:col-span-9">
          <div
            className="font-mono text-[10px] uppercase tracking-[0.18em]"
            style={{ color: TEXT_LOW }}
          >
            Ending value
          </div>
          <div className="flex items-baseline gap-3 mt-1 flex-wrap">
            <CountUp
              from={capital}
              value={ending}
              format={(n) => fmtMoney(n)}
              duration={0.9}
              className="font-mono tabular-nums text-[36px] sm:text-[44px] md:text-[60px] font-semibold leading-none"
              style={{ color: TEXT_HI }}
            />
            <span
              className="font-mono tabular-nums text-[18px] sm:text-[22px] font-semibold"
              style={{ color: positive ? POSITIVE : NEGATIVE }}
            >
              {positive ? "+" : ""}
              {totalReturnPct.toFixed(1)}%
            </span>
          </div>
          <div
            className="mt-2 text-[12.5px]"
            style={{ color: TEXT_MID }}
          >
            Starting capital · {fmtMoney(capital)}
          </div>
        </div>
        <div
          className="col-span-12 md:col-span-3 flex items-center justify-end"
        >
          <motion.div
            initial={{ rotate: 0, opacity: 0.6 }}
            animate={{ rotate: positive ? 0 : 0, opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-2xl"
            style={{
              background: positive
                ? "linear-gradient(135deg, rgba(74,222,128,0.20), rgba(74,222,128,0.04))"
                : "linear-gradient(135deg, rgba(248,113,113,0.20), rgba(248,113,113,0.04))",
              border: `1px solid ${positive ? "rgba(74,222,128,0.30)" : "rgba(248,113,113,0.30)"}`,
            }}
          >
            {positive ? (
              <TrendingUp size={36} style={{ color: POSITIVE }} />
            ) : (
              <TrendingDown size={36} style={{ color: NEGATIVE }} />
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function ValueChart({
  series,
  capital,
}: {
  series: { date: string; portfolio: number; spy: number }[];
  capital: number;
}) {
  const w = 1100;
  const h = 320;
  const pad = { l: 70, r: 16, t: 16, b: 36 };

  const { min, max, range } = useMemo(() => {
    if (series.length === 0) return { min: 0, max: capital * 2, range: capital * 2 };
    const all = series.flatMap((s) => [s.portfolio, s.spy]);
    const rmin = Math.min(...all);
    const rmax = Math.max(...all);
    const sp = rmax - rmin || 1;
    return { min: rmin - sp * 0.08, max: rmax + sp * 0.08, range: rmax - rmin + sp * 0.16 };
  }, [series, capital]);

  const innerW = w - pad.l - pad.r;
  const innerH = h - pad.t - pad.b;
  const x = (i: number) =>
    series.length < 2 ? pad.l : pad.l + (i / (series.length - 1)) * innerW;
  const y = (v: number) => pad.t + (1 - (v - min) / range) * innerH;

  if (series.length === 0) {
    return (
      <section
        className="rounded-2xl p-6 flex items-center justify-center"
        style={{
          height: 320,
          background: "rgba(255,255,255,0.02)",
          border: `1px solid ${LINE_2}`,
          color: TEXT_LOW,
        }}
      >
        No backtest data — try an earlier start date.
      </section>
    );
  }

  const pathPort = series
    .map((d, i) => `${i === 0 ? "M" : "L"} ${x(i).toFixed(1)} ${y(d.portfolio).toFixed(1)}`)
    .join(" ");
  const pathSpy = series
    .map((d, i) => `${i === 0 ? "M" : "L"} ${x(i).toFixed(1)} ${y(d.spy).toFixed(1)}`)
    .join(" ");
  const baselineY = y(capital);

  const yTicks: { v: number }[] = [];
  for (let i = 0; i <= 4; i++) {
    yTicks.push({ v: max - (i / 4) * range });
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
      <div className="flex items-center justify-between mb-4">
        <div>
          <div
            className="text-[10.5px] uppercase tracking-[0.16em]"
            style={{ color: TEXT_LOW }}
          >
            Portfolio value over time
          </div>
          <div
            className="flex items-center gap-4 mt-1 text-[12px]"
            style={{ color: TEXT_MID }}
          >
            <span className="inline-flex items-center gap-1.5">
              <span className="w-3 h-[2px]" style={{ background: VIOLET_2 }} />
              Copy portfolio
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-3 h-[2px]" style={{ background: TEXT_MID }} />
              SPY
            </span>
          </div>
        </div>
      </div>
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-[320px]" aria-hidden>
        <defs>
          <linearGradient id="btArea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={VIOLET_2} stopOpacity="0.16" />
            <stop offset="100%" stopColor={VIOLET_2} stopOpacity="0" />
          </linearGradient>
          <filter id="btGlow" x="-10%" y="-30%" width="120%" height="160%">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        {yTicks.map((t, i) => {
          const yy = y(t.v);
          const isBaseline = Math.abs(t.v - capital) / Math.max(capital, 1) < 0.005;
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
                {fmtMoneyShort(t.v)}
              </text>
            </g>
          );
        })}
        <line
          x1={pad.l}
          x2={w - pad.r}
          y1={baselineY}
          y2={baselineY}
          stroke="rgba(255,255,255,0.22)"
          strokeDasharray="4 4"
        />
        {/* Area */}
        <path
          d={`${pathPort} L ${x(series.length - 1).toFixed(1)} ${baselineY.toFixed(1)} L ${x(0).toFixed(1)} ${baselineY.toFixed(1)} Z`}
          fill="url(#btArea)"
        />
        <motion.path
          d={pathSpy}
          fill="none"
          stroke={TEXT_MID}
          strokeWidth="1.4"
          strokeOpacity="0.7"
          strokeLinecap="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 1.0, ease: "easeOut" }}
        />
        <motion.path
          d={pathPort}
          fill="none"
          stroke={VIOLET_2}
          strokeWidth="2.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter="url(#btGlow)"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        />
        {/* X labels */}
        {series.length > 0 && (
          <>
            <text
              x={pad.l}
              y={h - pad.b + 18}
              fontFamily="var(--font-mono, ui-monospace, monospace)"
              fontSize="10"
              fill={TEXT_LOW}
              textAnchor="start"
            >
              {fmtMonth(series[0].date)}
            </text>
            <text
              x={w - pad.r}
              y={h - pad.b + 18}
              fontFamily="var(--font-mono, ui-monospace, monospace)"
              fontSize="10"
              fill={TEXT_LOW}
              textAnchor="end"
            >
              {fmtMonth(series[series.length - 1].date)}
            </text>
          </>
        )}
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

function StatRow({ data }: { data: BacktestResponse }) {
  const cells: { label: string; value: string; color: string }[] = [
    {
      label: "Total return",
      value: `${data.totalReturnPct >= 0 ? "+" : ""}${data.totalReturnPct.toFixed(1)}%`,
      color: data.totalReturnPct >= 0 ? POSITIVE : NEGATIVE,
    },
    {
      label: "vs SPY",
      value: `${data.vsSpyPct >= 0 ? "+" : ""}${data.vsSpyPct.toFixed(1)}pp`,
      color: data.vsSpyPct >= 0 ? POSITIVE : NEGATIVE,
    },
    {
      label: "Max drawdown",
      value: `${data.maxDrawdownPct.toFixed(1)}%`,
      color: NEGATIVE,
    },
    {
      label: "Win rate",
      value: `${data.winRatePct.toFixed(0)}%`,
      color: TEXT_HI,
    },
    {
      label: "Total trades",
      value: String(data.totalTrades),
      color: TEXT_HI,
    },
  ];
  return (
    <section
      className="rounded-2xl"
      style={{
        background:
          "linear-gradient(180deg, rgba(255,255,255,0.025) 0%, rgba(255,255,255,0.005) 100%)",
        border: `1px solid ${LINE_2}`,
      }}
    >
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5">
        {cells.map((c) => (
          <div
            key={c.label}
            className="px-4 sm:px-5 py-4"
            style={{
              borderLeft: `1px solid ${LINE}`,
              borderTop: `1px solid ${LINE}`,
            }}
          >
            <div
              className="font-mono text-[10px] uppercase tracking-[0.18em]"
              style={{ color: TEXT_LOW }}
            >
              {c.label}
            </div>
            <div
              className="mt-1 font-mono tabular-nums text-[22px] font-semibold"
              style={{ color: c.color }}
            >
              {c.value}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function TradesTable({ trades }: { trades: BacktestTrade[] }) {
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
          Trade attribution
        </div>
        <div className="font-mono text-[10px]" style={{ color: TEXT_LOW }}>
          {trades.length} trade{trades.length === 1 ? "" : "s"}
        </div>
      </div>
      <div
        className="rounded-lg overflow-hidden"
        style={{ border: `1px solid ${LINE}` }}
      >
        <div
          className="grid grid-cols-12 px-3 py-2 font-mono text-[10px] uppercase tracking-[0.18em]"
          style={{ background: "rgba(255,255,255,0.02)", color: TEXT_LOW }}
        >
          <div className="col-span-3 sm:col-span-2">Date</div>
          <div className="col-span-3 sm:col-span-2">Ticker</div>
          <div className="col-span-2 sm:col-span-1">Side</div>
          <div className="hidden sm:block sm:col-span-2 text-right">Entry</div>
          <div className="hidden sm:block sm:col-span-2 text-right">Exit / Mark</div>
          <div className="col-span-4 sm:col-span-3 text-right">P&amp;L</div>
        </div>
        <div className="max-h-[420px] overflow-y-auto">
          {trades.length === 0 && (
            <div className="px-3 py-6 text-[12px] text-center" style={{ color: TEXT_LOW }}>
              No trades in this window.
            </div>
          )}
          {trades.map((t, i) => {
            const positive = t.pnl > 0;
            const isBuy = t.action === "buy";
            return (
              <div
                key={i}
                className="grid grid-cols-12 px-3 py-2 text-[12.5px] items-center"
                style={{
                  borderTop: i === 0 ? "none" : `1px solid ${LINE}`,
                }}
              >
                <div className="col-span-3 sm:col-span-2 font-mono text-[11.5px]" style={{ color: TEXT_MID }}>
                  {fmtDate(t.date)}
                </div>
                <div className="col-span-3 sm:col-span-2 font-mono" style={{ color: YELLOW }}>
                  {t.ticker}
                </div>
                <div className="col-span-2 sm:col-span-1">
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
                </div>
                <div
                  className="hidden sm:block sm:col-span-2 text-right font-mono tabular-nums"
                  style={{ color: TEXT_MID }}
                >
                  {t.entryPrice == null ? "—" : `$${t.entryPrice.toFixed(2)}`}
                </div>
                <div
                  className="hidden sm:block sm:col-span-2 text-right font-mono tabular-nums"
                  style={{ color: TEXT_MID }}
                >
                  {t.exitPrice == null ? "—" : `$${t.exitPrice.toFixed(2)}`}
                </div>
                <div
                  className="col-span-4 sm:col-span-3 text-right font-mono tabular-nums font-semibold"
                  style={{
                    color:
                      t.pnl === 0
                        ? TEXT_LOW
                        : positive
                          ? POSITIVE
                          : NEGATIVE,
                  }}
                >
                  {t.pnl === 0
                    ? "—"
                    : `${positive ? "+" : ""}${fmtMoney(t.pnl)}${
                        t.pnlPct == null
                          ? ""
                          : ` · ${(t.pnlPct * 100).toFixed(1)}%`
                      }`}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ─────────────── Utils ─────────────── */

function fmtMoney(n: number): string {
  const abs = Math.abs(n);
  const sign = n < 0 ? "-" : "";
  return `${sign}$${abs.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
}
function fmtMoneyShort(n: number): string {
  if (Math.abs(n) >= 1_000_000)
    return `$${(n / 1_000_000).toFixed(1)}M`;
  if (Math.abs(n) >= 1_000) return `$${(n / 1_000).toFixed(1)}k`;
  return `$${Math.round(n)}`;
}
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
