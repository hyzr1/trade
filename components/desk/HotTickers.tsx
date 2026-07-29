// components/desk/HotTickers.tsx
"use client";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { LINE, LINE_2, TEXT_MID, TEXT_LOW, YELLOW, POSITIVE, NEGATIVE } from "@/lib/theme";
import type { HotTicker } from "@/lib/queries";
import { useStaggerVariants } from "@/components/ui/MotionList";

export function HotTickers({ tickers, windowDays = 7 }: { tickers: HotTicker[]; windowDays?: number }) {
  const max = Math.max(...tickers.map((t) => t.count), 1);
  const reduced = useReducedMotion();
  const { list, item } = useStaggerVariants();
  return (
    <section
      id="hot"
      className="rounded-2xl overflow-hidden h-full flex flex-col"
      style={{
        background: "linear-gradient(180deg, rgba(255,255,255,0.025) 0%, rgba(255,255,255,0.01) 100%)",
        border: `1px solid ${LINE_2}`,
      }}
    >
      <div className="flex items-center justify-between px-5 py-3 border-b" style={{ borderColor: LINE }}>
        <span className="text-[10.5px] uppercase tracking-[0.16em]" style={{ color: TEXT_LOW }}>
          Hot tickers · {windowDays}d
        </span>
        <span className="font-mono text-[10.5px]" style={{ color: TEXT_MID }}>top {tickers.length}</span>
      </div>
      <motion.div
        variants={list}
        initial="hidden"
        animate="show"
        className="px-5 py-3 space-y-2.5"
      >
        {tickers.map((t) => {
          const buyPct = (t.buys / max) * 100;
          const sellPct = (t.sells / max) * 100;
          return (
            <motion.div variants={item} key={t.ticker}>
              <Link
                href={`/ticker/${t.ticker}`}
                className="flex items-center gap-3 group rounded-md -mx-1 px-1 py-0.5 hover:bg-white/[0.025] transition-colors"
              >
                <span
                  className="font-mono text-[12.5px] w-16 shrink-0 group-hover:underline"
                  style={{ color: YELLOW }}
                >
                  {t.ticker}
                </span>
                <div
                  className="flex-1 h-2.5 rounded-sm overflow-hidden flex"
                  style={{ background: "rgba(255,255,255,0.04)" }}
                >
                  <motion.div
                    initial={reduced ? { width: `${buyPct}%` } : { width: 0 }}
                    animate={{ width: `${buyPct}%` }}
                    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
                    style={{ background: POSITIVE, height: "100%" }}
                  />
                  <motion.div
                    initial={reduced ? { width: `${sellPct}%` } : { width: 0 }}
                    animate={{ width: `${sellPct}%` }}
                    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
                    style={{ background: NEGATIVE, height: "100%" }}
                  />
                </div>
                <span
                  className="font-mono text-[11px] tabular-nums w-20 text-right"
                  style={{ color: TEXT_MID }}
                >
                  {t.buys}b · {t.sells}s
                </span>
              </Link>
            </motion.div>
          );
        })}
      </motion.div>
    </section>
  );
}
