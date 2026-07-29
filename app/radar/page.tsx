// app/radar/page.tsx
"use client";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Radar as RadarIcon, Eye, EyeOff, ChevronsUpDown, Filter, ArrowUpRight } from "lucide-react";
import { DeskShell } from "@/components/desk/DeskShell";
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

type Sector =
  | "Tech"
  | "Comms"
  | "Defense"
  | "Healthcare"
  | "Finance"
  | "Energy"
  | "Consumer"
  | "Industrials"
  | "Utilities"
  | "Materials"
  | "REIT"
  | "Crypto";

type RadarSector = {
  sector: Sector;
  color: string;
  count7d: number;
  count30d: number;
  count90d: number;
  netBuys: number;
  topTicker: string | null;
  weeklyCounts: number[];
  contributors: string[];
};

type RadarPolitician = {
  slug: string;
  name: string;
  kind: "politician" | "llm";
  color: string;
  sectorWeights: { sector: Sector; weight: number }[];
};

type RadarResponse = {
  timeframes: { days: number; label: "7d" | "30d" | "90d" }[];
  sectors: RadarSector[];
  politicians: RadarPolitician[];
};

type Timeframe = "7d" | "30d" | "90d";

export default function RadarPage() {
  const [data, setData] = useState<RadarResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState<Timeframe>("30d");
  const [activeSlugs, setActiveSlugs] = useState<Set<string>>(new Set());
  const [focusedSector, setFocusedSector] = useState<Sector | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch("/api/radar")
      .then((r) => r.json())
      .then((j: RadarResponse) => {
        setData(j);
        // default: show all politicians
        setActiveSlugs(new Set(j.politicians.map((p) => p.slug)));
      })
      .finally(() => setLoading(false));
  }, []);

  const togglePol = (slug: string) => {
    setActiveSlugs((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      return next;
    });
  };

  return (
    <DeskShell breadcrumb="Radar">
      <div className="flex flex-wrap items-baseline justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <RadarIcon size={20} style={{ color: VIOLET_2 }} />
          <div>
            <h1
              className="text-[22px] sm:text-[26px] font-semibold tracking-tight"
              style={{ color: TEXT_HI }}
            >
              Insider Radar
            </h1>
            <p className="text-[13px] mt-0.5" style={{ color: TEXT_MID }}>
              Where insider attention is concentrated, right now
            </p>
          </div>
        </div>
        <TimeframeToggle value={timeframe} onChange={setTimeframe} />
      </div>

      {loading || !data ? (
        <ShimmerBlock />
      ) : (
        <>
          <div className="grid grid-cols-12 gap-6">
            <section className="col-span-12 lg:col-span-9">
              <RadarPanel
                sectors={data.sectors}
                politicians={data.politicians}
                timeframe={timeframe}
                activeSlugs={activeSlugs}
                focusedSector={focusedSector}
                setFocusedSector={setFocusedSector}
              />
            </section>
            <section className="col-span-12 lg:col-span-3">
              <Legend
                politicians={data.politicians}
                activeSlugs={activeSlugs}
                togglePol={togglePol}
              />
            </section>
          </div>

          <SectorCards
            sectors={data.sectors}
            timeframe={timeframe}
            focusedSector={focusedSector}
            setFocusedSector={setFocusedSector}
          />
        </>
      )}
    </DeskShell>
  );
}

function ShimmerBlock() {
  return (
    <div className="space-y-4">
      {[420, 180].map((h, i) => (
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

function TimeframeToggle({
  value,
  onChange,
}: {
  value: Timeframe;
  onChange: (v: Timeframe) => void;
}) {
  const opts: Timeframe[] = ["7d", "30d", "90d"];
  return (
    <div className="flex gap-1">
      {opts.map((o) => (
        <button
          key={o}
          onClick={() => onChange(o)}
          className="rounded-full px-3 py-1.5 font-mono text-[10.5px] uppercase tracking-wider transition-colors"
          style={{
            background: value === o ? "#fff" : "transparent",
            color: value === o ? "#000" : TEXT_MID,
            border: `1px solid ${value === o ? "transparent" : LINE_2}`,
          }}
        >
          {o}
        </button>
      ))}
    </div>
  );
}

/* ─────────────── Radar panel ─────────────── */

function RadarPanel({
  sectors,
  politicians,
  timeframe,
  activeSlugs,
  focusedSector,
  setFocusedSector,
}: {
  sectors: RadarSector[];
  politicians: RadarPolitician[];
  timeframe: Timeframe;
  activeSlugs: Set<string>;
  focusedSector: Sector | null;
  setFocusedSector: (s: Sector | null) => void;
}) {
  const w = 720;
  const h = 720;
  const cx = w / 2;
  const cy = h / 2;
  const radius = 260;

  const sectorCount = sectors.length;
  const sectorAngles = useMemo(() => {
    const map = new Map<Sector, number>();
    sectors.forEach((s, i) => {
      const angle = (2 * Math.PI * i) / sectorCount - Math.PI / 2;
      map.set(s.sector, angle);
    });
    return map;
  }, [sectors, sectorCount]);

  const countKey: keyof Pick<RadarSector, "count7d" | "count30d" | "count90d"> =
    timeframe === "7d" ? "count7d" : timeframe === "30d" ? "count30d" : "count90d";

  const maxFilingCount = Math.max(1, ...sectors.map((s) => s[countKey]));

  // Concentric rings
  const rings = [0.25, 0.5, 0.75, 1].map((f) => f * radius);

  return (
    <div
      className="rounded-2xl p-4 flex items-center justify-center"
      style={{
        background:
          "linear-gradient(180deg, rgba(255,255,255,0.025) 0%, rgba(255,255,255,0.005) 100%)",
        border: `1px solid ${LINE_2}`,
        minHeight: 540,
      }}
    >
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full max-w-[720px]" aria-hidden>
        <defs>
          <radialGradient id="radarHaze" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={VIOLET} stopOpacity="0.10" />
            <stop offset="100%" stopColor={VIOLET} stopOpacity="0" />
          </radialGradient>
        </defs>

        <circle cx={cx} cy={cy} r={radius + 20} fill="url(#radarHaze)" />

        {/* Concentric rings */}
        {rings.map((r, i) => (
          <circle
            key={i}
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth="1"
            strokeDasharray={i === rings.length - 1 ? "" : "2 3"}
          />
        ))}

        {/* Sector spokes & labels */}
        {sectors.map((s) => {
          const angle = sectorAngles.get(s.sector) ?? 0;
          const tx = cx + Math.cos(angle) * (radius + 30);
          const ty = cy + Math.sin(angle) * (radius + 30);
          const lx = cx + Math.cos(angle) * radius;
          const ly = cy + Math.sin(angle) * radius;
          const isFocused = focusedSector === s.sector;
          const count = s[countKey];
          return (
            <g key={s.sector}>
              <line
                x1={cx}
                y1={cy}
                x2={lx}
                y2={ly}
                stroke="rgba(255,255,255,0.06)"
                strokeWidth="1"
              />
              {/* count bubble at sector position based on filing weight */}
              {count > 0 && (
                <motion.circle
                  initial={{ r: 0, opacity: 0 }}
                  animate={{ r: 4 + (count / maxFilingCount) * 14, opacity: 0.9 }}
                  transition={{ duration: 0.7, ease: "easeOut" }}
                  cx={cx + Math.cos(angle) * ((count / maxFilingCount) * radius)}
                  cy={cy + Math.sin(angle) * ((count / maxFilingCount) * radius)}
                  fill={s.color}
                  fillOpacity="0.35"
                  stroke={s.color}
                  strokeWidth="1.5"
                />
              )}
              <g
                onClick={() => setFocusedSector(isFocused ? null : s.sector)}
                style={{ cursor: "pointer" }}
              >
                <text
                  x={tx}
                  y={ty}
                  textAnchor={Math.abs(Math.cos(angle)) < 0.2 ? "middle" : Math.cos(angle) > 0 ? "start" : "end"}
                  dominantBaseline="middle"
                  fontFamily="var(--font-mono, ui-monospace, monospace)"
                  fontSize="11.5"
                  fontWeight={isFocused ? 700 : 500}
                  fill={isFocused ? s.color : TEXT_MID}
                  style={{ textTransform: "uppercase", letterSpacing: "0.16em" }}
                >
                  {s.sector}
                </text>
                <text
                  x={tx}
                  y={ty + 14}
                  textAnchor={Math.abs(Math.cos(angle)) < 0.2 ? "middle" : Math.cos(angle) > 0 ? "start" : "end"}
                  dominantBaseline="middle"
                  fontFamily="var(--font-mono, ui-monospace, monospace)"
                  fontSize="10"
                  fill={TEXT_LOW}
                >
                  {count}
                </text>
              </g>
            </g>
          );
        })}

        {/* Politician polygons */}
        {politicians.map((p, idx) => {
          if (!activeSlugs.has(p.slug)) return null;
          const totalWeight = p.sectorWeights.reduce((s, x) => s + x.weight, 0) || 1;
          const max = Math.max(...p.sectorWeights.map((sw) => sw.weight)) || 1;
          const pts = p.sectorWeights.map((sw) => {
            const angle = sectorAngles.get(sw.sector) ?? 0;
            const r = (sw.weight / max) * radius;
            return `${(cx + Math.cos(angle) * r).toFixed(1)},${(cy + Math.sin(angle) * r).toFixed(1)}`;
          });
          // skip if all-zero
          if (max === 0) return null;
          void totalWeight;
          return (
            <motion.polygon
              key={p.slug}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.55, delay: idx * 0.05, ease: "easeOut" }}
              points={pts.join(" ")}
              fill={p.color}
              fillOpacity="0.10"
              stroke={p.color}
              strokeWidth="1.6"
              strokeOpacity="0.85"
              style={{
                transformOrigin: `${cx}px ${cy}px`,
              }}
            />
          );
        })}

        {/* center hub */}
        <circle cx={cx} cy={cy} r="3" fill={TEXT_MID} />
        <text
          x={cx}
          y={cy + 18}
          textAnchor="middle"
          fontFamily="var(--font-mono, ui-monospace, monospace)"
          fontSize="9"
          fill={TEXT_LOW}
          style={{ textTransform: "uppercase", letterSpacing: "0.18em" }}
        >
          insider attention
        </text>
      </svg>
    </div>
  );
}

/* ─────────────── Legend ─────────────── */

function Legend({
  politicians,
  activeSlugs,
  togglePol,
}: {
  politicians: RadarPolitician[];
  activeSlugs: Set<string>;
  togglePol: (slug: string) => void;
}) {
  return (
    <div
      className="rounded-2xl p-4"
      style={{
        background:
          "linear-gradient(180deg, rgba(255,255,255,0.025) 0%, rgba(255,255,255,0.005) 100%)",
        border: `1px solid ${LINE_2}`,
      }}
    >
      <div
        className="font-mono text-[10px] uppercase tracking-[0.18em] mb-3 inline-flex items-center gap-1.5"
        style={{ color: TEXT_LOW }}
      >
        <Filter size={11} /> Politicians
      </div>
      <div className="space-y-1.5">
        {politicians.map((p) => {
          const active = activeSlugs.has(p.slug);
          return (
            <button
              key={p.slug}
              onClick={() => togglePol(p.slug)}
              className="w-full flex items-center gap-2.5 px-2 py-1.5 rounded-md text-[12.5px] text-left transition-colors hover:bg-white/[0.04]"
              style={{ color: active ? TEXT_HI : TEXT_LOW }}
            >
              <span
                className="w-3 h-3 rounded-sm shrink-0"
                style={{
                  background: active ? p.color : "transparent",
                  border: `1px solid ${active ? p.color : LINE_2}`,
                }}
              />
              <span className="flex-1 truncate">{p.name}</span>
              <span
                className="font-mono text-[9.5px] uppercase tracking-[0.18em] px-1.5 py-0.5 rounded-sm shrink-0"
                style={{
                  background:
                    p.kind === "llm" ? "rgba(247,210,74,0.12)" : "rgba(124,95,255,0.14)",
                  color: p.kind === "llm" ? YELLOW : VIOLET_2,
                }}
              >
                {p.kind === "llm" ? "AI" : "POL"}
              </span>
              {active ? (
                <Eye size={12} style={{ color: TEXT_MID }} />
              ) : (
                <EyeOff size={12} style={{ color: TEXT_LOW }} />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ─────────────── Sector cards ─────────────── */

function SectorCards({
  sectors,
  timeframe,
  focusedSector,
  setFocusedSector,
}: {
  sectors: RadarSector[];
  timeframe: Timeframe;
  focusedSector: Sector | null;
  setFocusedSector: (s: Sector | null) => void;
}) {
  const sorted = [...sectors].sort((a, b) => {
    const k =
      timeframe === "7d" ? "count7d" : timeframe === "30d" ? "count30d" : "count90d";
    return (b[k] as number) - (a[k] as number);
  });
  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <div
          className="font-mono text-[10px] uppercase tracking-[0.18em]"
          style={{ color: TEXT_LOW }}
        >
          Top sectors · {timeframe}
        </div>
        {focusedSector && (
          <button
            onClick={() => setFocusedSector(null)}
            className="font-mono text-[10.5px] uppercase tracking-[0.16em] hover:underline"
            style={{ color: VIOLET_2 }}
          >
            Clear filter
          </button>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sorted.slice(0, 6).map((s, i) => (
          <SectorCard
            key={s.sector}
            s={s}
            timeframe={timeframe}
            isFocused={focusedSector === s.sector}
            onFocus={() => setFocusedSector(focusedSector === s.sector ? null : s.sector)}
            delay={i * 0.04}
          />
        ))}
      </div>
    </section>
  );
}

function SectorCard({
  s,
  timeframe,
  isFocused,
  onFocus,
  delay,
}: {
  s: RadarSector;
  timeframe: Timeframe;
  isFocused: boolean;
  onFocus: () => void;
  delay: number;
}) {
  const count =
    timeframe === "7d" ? s.count7d : timeframe === "30d" ? s.count30d : s.count90d;
  return (
    <motion.button
      onClick={onFocus}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay, ease: "easeOut" }}
      className="rounded-2xl p-5 text-left transition-colors hover:bg-white/[0.025]"
      style={{
        background:
          "linear-gradient(180deg, rgba(255,255,255,0.025) 0%, rgba(255,255,255,0.005) 100%)",
        border: `1px solid ${isFocused ? s.color : LINE_2}`,
        boxShadow: isFocused
          ? `0 0 0 1px ${s.color}40, 0 18px 50px -20px ${s.color}40`
          : undefined,
      }}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span
            className="w-2.5 h-2.5 rounded-sm"
            style={{ background: s.color }}
          />
          <span
            className="font-mono text-[10.5px] uppercase tracking-[0.18em]"
            style={{ color: TEXT_MID }}
          >
            {s.sector}
          </span>
        </div>
        <SectorOpenIcon sector={s.sector} />
      </div>
      <div className="mt-3 flex items-end justify-between">
        <div>
          <div
            className="font-mono text-[10px] uppercase tracking-[0.18em]"
            style={{ color: TEXT_LOW }}
          >
            {timeframe} filings
          </div>
          <div
            className="font-mono tabular-nums text-[28px] font-semibold mt-0.5"
            style={{ color: TEXT_HI }}
          >
            {count}
          </div>
        </div>
        <WeeklySpark weekly={s.weeklyCounts} color={s.color} />
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2 text-[11.5px]">
        <div>
          <div
            className="font-mono text-[9.5px] uppercase tracking-[0.18em]"
            style={{ color: TEXT_LOW }}
          >
            Top ticker
          </div>
          <div className="font-mono mt-0.5" style={{ color: YELLOW }}>
            {s.topTicker ?? "—"}
          </div>
        </div>
        <div>
          <div
            className="font-mono text-[9.5px] uppercase tracking-[0.18em]"
            style={{ color: TEXT_LOW }}
          >
            Net buys
          </div>
          <div
            className="font-mono mt-0.5 tabular-nums"
            style={{ color: s.netBuys >= 0 ? POSITIVE : NEGATIVE }}
          >
            {s.netBuys >= 0 ? "+" : ""}
            {s.netBuys}
          </div>
        </div>
      </div>
    </motion.button>
  );
}

function WeeklySpark({
  weekly,
  color,
}: {
  weekly: number[];
  color: string;
}) {
  const w = 84;
  const h = 28;
  if (weekly.length < 2) return <div style={{ width: w, height: h }} />;
  const max = Math.max(1, ...weekly);
  const step = w / (weekly.length - 1);
  const path = weekly
    .map((v, i) => `${i === 0 ? "M" : "L"} ${(i * step).toFixed(1)} ${(h - (v / max) * h).toFixed(1)}`)
    .join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} style={{ width: w, height: h }} aria-hidden>
      <path d={path} fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
      {weekly.map((v, i) => (
        <circle
          key={i}
          cx={i * step}
          cy={h - (v / max) * h}
          r={1.5}
          fill={color}
          opacity={0.6}
        />
      ))}
    </svg>
  );
}

function SectorOpenIcon({ sector }: { sector: string }) {
  const router = useRouter();
  return (
    <span
      role="link"
      tabIndex={0}
      onClick={(e) => {
        e.stopPropagation();
        router.push(`/sector/${encodeURIComponent(sector)}`);
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          e.stopPropagation();
          router.push(`/sector/${encodeURIComponent(sector)}`);
        }
      }}
      aria-label={`Open ${sector} sector page`}
      className="inline-flex items-center justify-center opacity-60 hover:opacity-100 transition-opacity cursor-pointer"
      style={{ color: TEXT_MID }}
    >
      <ArrowUpRight size={13} />
    </span>
  );
}

// Mark some lucide imports as used in case
void ChevronsUpDown;
void VIOLET;
