// components/profile/AttributionWaterfall.tsx
"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { BarChart3, Info } from "lucide-react";
import type { ProfileData } from "@/lib/queries";
import {
  LINE,
  LINE_2,
  NEGATIVE,
  POSITIVE,
  TEXT_HI,
  TEXT_LOW,
  TEXT_MID,
  YELLOW,
} from "@/lib/theme";

const EASE = [0.22, 1, 0.36, 1] as const;

type Holding = ProfileData["holdings"][number];

type Contribution = {
  ticker: string;
  weight: number;
  /** Percentage points contributed to overall portfolio return. */
  contribution: number;
  /** Per-position return, e.g. +14.2%. */
  perReturn: number;
};

export function AttributionWaterfall({
  holdings,
}: {
  holdings: Holding[];
}) {
  const reduced = useReducedMotion();
  const [sortMode, setSortMode] = useState<"contribution" | "weight">("contribution");

  // Compute contributions. Skip holdings where we don't have both prices —
  // we don't fake a return out of thin air.
  const { rows, total, skipped } = useMemo(() => {
    const computed: Contribution[] = [];
    let skippedCount = 0;
    for (const h of holdings) {
      if (
        h.lastBuyPrice == null ||
        h.currentPrice == null ||
        h.lastBuyPrice === 0 ||
        !Number.isFinite(h.lastBuyPrice) ||
        !Number.isFinite(h.currentPrice)
      ) {
        skippedCount++;
        continue;
      }
      const perReturn = (h.currentPrice - h.lastBuyPrice) / h.lastBuyPrice;
      // weight is in percent (0-100). Contribution in pp.
      const contribution = (h.weight / 100) * perReturn * 100;
      computed.push({
        ticker: h.ticker,
        weight: h.weight,
        contribution,
        perReturn: perReturn * 100,
      });
    }
    const t = computed.reduce((sum, c) => sum + c.contribution, 0);
    const sortFn =
      sortMode === "contribution"
        ? (a: Contribution, b: Contribution) => b.contribution - a.contribution
        : (a: Contribution, b: Contribution) => b.weight - a.weight;
    return { rows: computed.sort(sortFn), total: t, skipped: skippedCount };
  }, [holdings, sortMode]);

  // Empty / sparse states
  if (rows.length === 0) {
    return (
      <section
        className="rounded-2xl px-6 py-8 text-center"
        style={{
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.025) 0%, rgba(255,255,255,0.01) 100%)",
          border: `1px solid ${LINE_2}`,
        }}
      >
        <BarChart3 size={18} className="inline" style={{ color: TEXT_LOW }} />
        <div className="text-[13.5px] mt-2" style={{ color: TEXT_MID }}>
          Attribution unavailable — we don't have buy-price data for these holdings yet.
        </div>
      </section>
    );
  }

  // Scale: largest absolute contribution → bar widths.
  const maxAbs = Math.max(
    Math.abs(total),
    ...rows.map((r) => Math.abs(r.contribution)),
    0.01,
  );

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
      <div
        className="flex items-center justify-between px-5 py-3 border-b"
        style={{ borderColor: LINE }}
      >
        <div className="flex items-center gap-2.5">
          <BarChart3 size={12} style={{ color: YELLOW }} />
          <span
            className="text-[10.5px] uppercase tracking-[0.16em]"
            style={{ color: TEXT_LOW }}
          >
            Return contributions by holding
          </span>
        </div>
        <div className="flex items-center gap-2">
          <SortToggle value={sortMode} onChange={setSortMode} />
        </div>
      </div>

      {/* Total bar */}
      <div className="px-5 pt-4">
        <div className="flex items-center justify-between mb-1.5">
          <span
            className="font-mono text-[10.5px] uppercase tracking-[0.18em]"
            style={{ color: TEXT_LOW }}
          >
            Portfolio total
          </span>
          <span
            className="font-mono text-[14px] tabular-nums"
            style={{ color: total >= 0 ? POSITIVE : NEGATIVE }}
          >
            {total >= 0 ? "+" : ""}
            {total.toFixed(2)}pp
          </span>
        </div>
        <CenterBar value={total} max={maxAbs} thick reduced={!!reduced} />
        <div
          className="mt-2 text-[11.5px] flex items-center gap-1.5"
          style={{ color: TEXT_LOW }}
        >
          <Info size={11} />
          Sum of <span style={{ color: TEXT_MID }}>weight × per-holding return</span> since last buy.
          {skipped > 0 && (
            <span className="ml-1">
              ({skipped} holding{skipped === 1 ? "" : "s"} missing buy-price data)
            </span>
          )}
        </div>
      </div>

      <div
        className="my-4 mx-5 h-px"
        style={{ background: LINE }}
      />

      {/* Per-holding rows */}
      <div className="px-5 pb-5 space-y-2">
        {rows.map((r, i) => (
          <motion.div
            key={r.ticker}
            initial={reduced ? { opacity: 0 } : { opacity: 0, y: 6 }}
            animate={reduced ? { opacity: 1 } : { opacity: 1, y: 0 }}
            transition={{ duration: 0.22, delay: 0.02 * i, ease: EASE }}
            className="flex items-center gap-3"
          >
            <Link
              href={`/ticker/${r.ticker}`}
              className="w-14 sm:w-16 shrink-0 font-mono text-[12.5px] hover:underline"
              style={{ color: YELLOW }}
            >
              {r.ticker}
            </Link>
            <span
              className="hidden sm:block w-12 shrink-0 font-mono text-[10.5px] tabular-nums text-right"
              style={{ color: TEXT_LOW }}
            >
              {r.weight.toFixed(1)}%
            </span>
            <div className="flex-1">
              <CenterBar value={r.contribution} max={maxAbs} reduced={!!reduced} />
            </div>
            <span
              className="w-14 shrink-0 font-mono text-[11.5px] tabular-nums text-right"
              style={{ color: r.contribution >= 0 ? POSITIVE : NEGATIVE }}
            >
              {r.contribution >= 0 ? "+" : ""}
              {r.contribution.toFixed(2)}pp
            </span>
            <span
              className="hidden md:block w-16 shrink-0 font-mono text-[10.5px] tabular-nums text-right"
              style={{ color: TEXT_MID }}
            >
              {r.perReturn >= 0 ? "+" : ""}
              {r.perReturn.toFixed(1)}%
            </span>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

/* ───────────────────────── Center bar ───────────────────────── */

function CenterBar({
  value,
  max,
  thick,
  reduced,
}: {
  value: number;
  max: number;
  thick?: boolean;
  reduced: boolean;
}) {
  const pct = max === 0 ? 0 : (Math.abs(value) / max) * 50; // 50% per side
  const isPos = value >= 0;
  const color = isPos ? POSITIVE : NEGATIVE;
  return (
    <div
      className="relative w-full overflow-hidden"
      style={{
        height: thick ? 12 : 8,
        background: "rgba(255,255,255,0.03)",
        borderRadius: 4,
      }}
    >
      {/* Center divider */}
      <div
        className="absolute left-1/2 top-0 bottom-0 w-px"
        style={{ background: "rgba(255,255,255,0.15)" }}
      />
      <motion.div
        initial={reduced ? { width: `${pct}%` } : { width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.55, ease: EASE }}
        className="absolute top-0 bottom-0"
        style={{
          background: color,
          opacity: 0.85,
          left: isPos ? "50%" : undefined,
          right: isPos ? undefined : "50%",
          boxShadow: thick ? `0 0 18px ${color}55` : undefined,
        }}
      />
    </div>
  );
}

/* ───────────────────────── Sort toggle ───────────────────────── */

function SortToggle({
  value,
  onChange,
}: {
  value: "contribution" | "weight";
  onChange: (v: "contribution" | "weight") => void;
}) {
  return (
    <div
      className="rounded-full inline-flex items-center"
      style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${LINE_2}` }}
    >
      {(["contribution", "weight"] as const).map((v) => (
        <button
          key={v}
          onClick={() => onChange(v)}
          className="px-2.5 py-1 font-mono text-[9.5px] uppercase tracking-[0.14em] transition-colors rounded-full"
          style={{
            background: value === v ? "#fff" : "transparent",
            color: value === v ? "#000" : TEXT_MID,
          }}
        >
          by {v}
        </button>
      ))}
    </div>
  );
}
