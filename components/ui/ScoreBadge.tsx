// components/ui/ScoreBadge.tsx
"use client";
import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Info } from "lucide-react";
import {
  LINE,
  LINE_2,
  TEXT_HI,
  TEXT_LOW,
  TEXT_MID,
  VIOLET,
  VIOLET_2,
  YELLOW,
} from "@/lib/theme";
import { scoreBand } from "@/lib/derived";

type Size = "sm" | "md" | "lg";

export function ScoreBadge({
  score,
  size = "md",
  /** Show the explainer tooltip on hover. */
  withTooltip = true,
}: {
  score: number;
  size?: Size;
  withTooltip?: boolean;
}) {
  const [hover, setHover] = useState(false);
  const reduced = useReducedMotion();
  const band = scoreBand(score);
  const color = band === "high" ? VIOLET_2 : band === "mid" ? YELLOW : TEXT_LOW;
  const glow =
    band === "high"
      ? `0 0 24px ${VIOLET}66`
      : band === "mid"
      ? `0 0 18px ${YELLOW}55`
      : "none";

  const dim = size === "sm" ? 38 : size === "lg" ? 80 : 60;
  const stroke = size === "sm" ? 3 : size === "lg" ? 6 : 4.5;
  const r = (dim - stroke) / 2;
  const c = 2 * Math.PI * r;
  const dash = (score / 100) * c;
  const fontMain = size === "sm" ? 11 : size === "lg" ? 22 : 16;
  const fontSub = size === "sm" ? 7 : size === "lg" ? 10 : 8.5;

  return (
    <div
      className="relative inline-flex shrink-0"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{ width: dim, height: dim }}
    >
      <svg width={dim} height={dim} viewBox={`0 0 ${dim} ${dim}`}>
        {/* Track */}
        <circle
          cx={dim / 2}
          cy={dim / 2}
          r={r}
          fill="transparent"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth={stroke}
        />
        {/* Score arc */}
        <motion.circle
          cx={dim / 2}
          cy={dim / 2}
          r={r}
          fill="transparent"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          initial={reduced ? { strokeDashoffset: c - dash } : { strokeDashoffset: c }}
          animate={{ strokeDashoffset: c - dash }}
          transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
          transform={`rotate(-90 ${dim / 2} ${dim / 2})`}
          style={{ filter: band === "high" ? `drop-shadow(${glow})` : undefined }}
        />
      </svg>
      <div
        className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none"
        style={{ color }}
      >
        <span className="font-mono tabular-nums leading-none" style={{ fontSize: fontMain, fontWeight: 600 }}>
          {score}
        </span>
        <span
          className="font-mono uppercase tracking-[0.14em] leading-none mt-0.5"
          style={{ fontSize: fontSub, color: TEXT_LOW }}
        >
          /100
        </span>
      </div>

      {/* Hover tooltip */}
      {withTooltip && hover && (
        <ScoreTooltip />
      )}
    </div>
  );
}

function ScoreTooltip() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
      role="tooltip"
      className="absolute z-50 left-1/2 -translate-x-1/2 top-full mt-2 rounded-xl p-3 w-[240px]"
      style={{
        background: "rgba(14,11,26,0.96)",
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
        border: `1px solid ${LINE_2}`,
        boxShadow: "0 30px 80px -20px rgba(0,0,0,0.85), inset 0 1px 0 rgba(255,255,255,0.06)",
      }}
    >
      <div className="flex items-center gap-1.5 mb-2">
        <Info size={11} style={{ color: VIOLET_2 }} />
        <span
          className="font-mono text-[9.5px] uppercase tracking-[0.18em]"
          style={{ color: TEXT_LOW }}
        >
          Composite score
        </span>
      </div>
      <ul className="space-y-1 text-[11.5px]" style={{ color: TEXT_MID }}>
        <Row label="Return" pct="40%" />
        <Row label="AI agreement" pct="25%" />
        <Row label="Alpha vs SPY" pct="20%" />
        <Row label="Activity" pct="15%" />
      </ul>
      <div
        className="mt-2.5 pt-2 text-[10.5px]"
        style={{ borderTop: `1px solid ${LINE}`, color: TEXT_LOW }}
      >
        <span style={{ color: VIOLET_2 }}>80+</span> violet ·{" "}
        <span style={{ color: YELLOW }}>60-79</span> yellow · &lt;60 dim
      </div>
    </motion.div>
  );
}

function Row({ label, pct }: { label: string; pct: string }) {
  return (
    <li className="flex items-center justify-between">
      <span style={{ color: TEXT_HI }}>{label}</span>
      <span className="font-mono tabular-nums text-[10.5px]" style={{ color: TEXT_LOW }}>
        {pct}
      </span>
    </li>
  );
}
