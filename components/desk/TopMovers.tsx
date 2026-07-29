// components/desk/TopMovers.tsx
"use client";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { LINE, LINE_2, TEXT_HI, TEXT_MID, TEXT_LOW, POSITIVE, NEGATIVE } from "@/lib/theme";
import type { MoverRow } from "@/lib/queries";
import { useStaggerVariants } from "@/components/ui/MotionList";

export function TopMovers({ movers }: { movers: MoverRow[] }) {
  const reduced = useReducedMotion();
  const { list, item } = useStaggerVariants();
  return (
    <section
      id="movers"
      className="rounded-2xl overflow-hidden"
      style={{
        background: "linear-gradient(180deg, rgba(255,255,255,0.025) 0%, rgba(255,255,255,0.01) 100%)",
        border: `1px solid ${LINE_2}`,
      }}
    >
      <div className="flex items-center justify-between px-5 py-3 border-b" style={{ borderColor: LINE }}>
        <span className="text-[10.5px] uppercase tracking-[0.16em]" style={{ color: TEXT_LOW }}>Top movers · 30d</span>
        <span className="font-mono text-[10.5px]" style={{ color: TEXT_MID }}>{movers.length} portfolios</span>
      </div>
      <motion.div variants={list} initial="hidden" animate="show">
        {movers.map((m, i) => {
          const pct = (m.return30d ?? 0) * 100;
          const positive = pct >= 0;
          return (
            <motion.div variants={item} key={m.slug}>
              <Link
                href={`/${m.slug}`}
                className="grid items-center gap-4 px-5 py-3 hover:bg-white/[0.02] transition-colors"
                style={{
                  borderBottom: i < movers.length - 1 ? `1px solid ${LINE}` : "none",
                  gridTemplateColumns: "24px minmax(140px, 1.4fr) minmax(120px, 1fr) 200px 72px",
                }}
              >
                <span className="text-right font-mono text-[10px]" style={{ color: TEXT_LOW }}>{i + 1}</span>
                <span className="truncate text-[13px]" style={{ color: TEXT_HI }}>{m.name}</span>
                <span className="text-[10.5px] uppercase tracking-wider truncate" style={{ color: TEXT_MID }}>{m.label}</span>
                <div className="min-w-0">
                  <Spark points={m.spark} positive={positive} animate={!reduced} />
                </div>
                <span
                  className="font-mono text-[13px] tabular-nums text-right"
                  style={{ color: positive ? POSITIVE : NEGATIVE }}
                >
                  {positive ? "+" : ""}{pct.toFixed(1)}%
                </span>
              </Link>
            </motion.div>
          );
        })}
      </motion.div>
    </section>
  );
}

function Spark({ points, positive, animate }: { points: number[]; positive: boolean; animate: boolean }) {
  const w = 120, h = 28;
  if (points.length < 2) return <div className="h-7" />;
  const min = Math.min(...points), max = Math.max(...points), range = max - min || 1;
  const step = w / (points.length - 1);
  const path = points.map((v, i) => `${i === 0 ? "M" : "L"} ${(i * step).toFixed(1)} ${(h - ((v - min) / range) * h).toFixed(1)}`).join(" ");
  const color = positive ? POSITIVE : NEGATIVE;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-7" aria-hidden>
      <motion.path
        d={path}
        fill="none"
        stroke={color}
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={animate ? { pathLength: 0, opacity: 0 } : { pathLength: 1, opacity: 1 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
      />
    </svg>
  );
}
