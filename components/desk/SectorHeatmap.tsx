// components/desk/SectorHeatmap.tsx
"use client";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { Flame } from "lucide-react";
import { SECTOR_COLORS, type Sector } from "@/lib/sectors";
import type { SectorHeatmapResult } from "@/lib/queries";
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

type Intensity = "off" | "low" | "med" | "high" | "top";

function bandFor(filings: number, max: number): Intensity {
  if (max === 0 || filings === 0) return "off";
  const q = filings / max;
  if (q >= 0.75) return "top";
  if (q >= 0.5) return "high";
  if (q >= 0.25) return "med";
  return "low";
}

function bgFor(intensity: Intensity, accent: string): string {
  switch (intensity) {
    case "off":  return "rgba(255,255,255,0.02)";
    case "low":  return "rgba(255,255,255,0.04)";
    case "med":  return `${accent}1A`; // ~10%
    case "high": return `${accent}33`; // ~20%
    case "top":  return `linear-gradient(135deg, ${accent}66 0%, ${accent}33 100%)`;
  }
}

function borderFor(intensity: Intensity, accent: string): string {
  if (intensity === "top") return `${accent}66`;
  if (intensity === "high") return `${accent}40`;
  return LINE_2;
}

export function SectorHeatmap({ data }: { data: SectorHeatmapResult }) {
  const reduced = useReducedMotion();
  const max = Math.max(1, ...data.cells.map((c) => c.filings));

  return (
    <section
      id="sector-heatmap"
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
          <Flame size={12} style={{ color: VIOLET_2 }} />
          <span
            className="text-[10.5px] uppercase tracking-[0.16em]"
            style={{ color: TEXT_LOW }}
          >
            Sector heatmap · {data.windowDays}d
          </span>
        </div>
        <span className="font-mono text-[10.5px]" style={{ color: TEXT_MID }}>
          <span className="tabular-nums" style={{ color: TEXT_HI }}>
            {data.totalFilings}
          </span>{" "}
          filings
        </span>
      </div>

      <div className="p-3 sm:p-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
          {data.cells.map((c, i) => {
            const accent = SECTOR_COLORS[c.sector as Sector] ?? VIOLET;
            const intensity = bandFor(c.filings, max);
            const deltaPos = (c.deltaPct ?? 0) >= 0;
            const deltaText =
              c.deltaPct == null
                ? "—"
                : `${deltaPos ? "+" : ""}${Math.round(c.deltaPct)}%`;
            return (
              <motion.div
                key={c.sector}
                initial={reduced ? { opacity: 0 } : { opacity: 0, y: 6 }}
                animate={reduced ? { opacity: 1 } : { opacity: 1, y: 0 }}
                transition={{ duration: 0.28, delay: 0.02 * i, ease: EASE }}
              >
                <Link
                  href={`/sector/${c.sector}`}
                  className="block rounded-xl px-3.5 py-3 transition-transform hover:-translate-y-0.5"
                  style={{
                    background: bgFor(intensity, accent),
                    border: `1px solid ${borderFor(intensity, accent)}`,
                    boxShadow:
                      intensity === "top"
                        ? `0 18px 38px -16px ${accent}66, inset 0 1px 0 rgba(255,255,255,0.06)`
                        : "inset 0 1px 0 rgba(255,255,255,0.04)",
                  }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span
                        className="w-1.5 h-1.5 rounded-full shrink-0"
                        style={{ background: accent }}
                      />
                      <span
                        className="text-[12.5px] font-medium truncate"
                        style={{ color: TEXT_HI }}
                      >
                        {c.sector}
                      </span>
                    </div>
                    {intensity === "top" && (
                      <span
                        className="font-mono text-[8.5px] uppercase tracking-[0.16em]"
                        style={{ color: YELLOW }}
                      >
                        hot
                      </span>
                    )}
                  </div>
                  <div className="flex items-end justify-between">
                    <div
                      className="font-mono text-[20px] tabular-nums leading-none"
                      style={{
                        color: intensity === "off" ? TEXT_LOW : TEXT_HI,
                      }}
                    >
                      {c.filings}
                    </div>
                    <div
                      className="font-mono text-[10.5px] tabular-nums"
                      style={{
                        color:
                          c.deltaPct == null
                            ? TEXT_LOW
                            : deltaPos
                            ? POSITIVE
                            : NEGATIVE,
                      }}
                    >
                      {deltaText}
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
