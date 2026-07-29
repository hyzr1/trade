// components/profile/RelatedPortfolios.tsx
"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { LINE_2, TEXT_HI, TEXT_MID, TEXT_LOW, YELLOW, VIOLET } from "@/lib/theme";
import { initialsFor } from "@/lib/format";
import type { ProfileData } from "@/lib/queries";

export function RelatedPortfolios({ related }: { related: ProfileData["related"] }) {
  return (
    <section>
      <div className="text-[10.5px] uppercase tracking-[0.16em] mb-4" style={{ color: TEXT_LOW }}>Most overlap</div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {related.map((r) => (
          <Link href={`/${r.slug}`} key={r.slug} className="block">
            <motion.div
              className="rounded-xl p-4 transition-colors"
              style={{
                background: "linear-gradient(180deg, rgba(255,255,255,0.025) 0%, rgba(255,255,255,0.005) 100%)",
                border: `1px solid ${LINE_2}`,
              }}
              whileHover={{
                y: -2,
                borderColor: "rgba(167,139,250,0.30)",
                boxShadow:
                  "0 8px 32px -8px rgba(124,95,255,0.25), inset 0 1px 0 rgba(255,255,255,0.05)",
              }}
              transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="flex items-center gap-2.5 mb-3">
                <span
                  className="inline-flex items-center justify-center w-7 h-7 rounded-md font-mono text-[10.5px]"
                  style={{ background: "rgba(255,255,255,0.06)", border: `1px solid ${LINE_2}`, color: TEXT_HI }}
                >
                  {initialsFor(r.name)}
                </span>
                <span className="text-[13px] truncate" style={{ color: TEXT_HI }}>{r.name}</span>
              </div>
              <div className="font-mono text-[28px] tabular-nums font-semibold" style={{ color: VIOLET }}>
                {r.overlapPct.toFixed(0)}%
              </div>
              <div className="text-[10px] uppercase tracking-[0.16em] mt-1 mb-3" style={{ color: TEXT_LOW }}>overlap</div>
              <div className="flex flex-wrap gap-1">
                {r.sharedTickers.slice(0, 6).map((t) => (
                  <span key={t} className="font-mono text-[10px] px-1.5 py-0.5 rounded" style={{ background: "rgba(255,255,255,0.04)", color: YELLOW }}>
                    {t}
                  </span>
                ))}
                {r.sharedTickers.length > 6 && (
                  <span className="font-mono text-[10px] px-1.5 py-0.5 rounded" style={{ color: TEXT_MID }}>+{r.sharedTickers.length - 6}</span>
                )}
              </div>
            </motion.div>
          </Link>
        ))}
      </div>
    </section>
  );
}
