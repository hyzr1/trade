// components/desk/Leaderboard.tsx
"use client";
import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { LINE, LINE_2, TEXT_HI, TEXT_MID, TEXT_LOW, POSITIVE, NEGATIVE, YELLOW } from "@/lib/theme";
import { initialsFor } from "@/lib/format";
import type { LeaderboardRow } from "@/lib/queries";
import { useStaggerVariants } from "@/components/ui/MotionList";
import { ScoreBadge } from "@/components/ui/ScoreBadge";

type SortKey = "ytdReturn" | "return30d" | "holdingsCount" | "score";

export function Leaderboard({ rows }: { rows: LeaderboardRow[] }) {
  const [sort, setSort] = useState<SortKey>("ytdReturn");
  const sorted = [...rows].sort((a, b) => ((b[sort] ?? -999) as number) - ((a[sort] ?? -999) as number));
  const { list, item } = useStaggerVariants();

  return (
    <section
      id="leaderboard"
      className="rounded-2xl overflow-hidden"
      style={{
        background: "linear-gradient(180deg, rgba(255,255,255,0.025) 0%, rgba(255,255,255,0.01) 100%)",
        border: `1px solid ${LINE_2}`,
      }}
    >
      <div className="flex items-center justify-between px-5 py-3 border-b" style={{ borderColor: LINE }}>
        <span className="text-[10.5px] uppercase tracking-[0.16em]" style={{ color: TEXT_LOW }}>Leaderboard · all portfolios</span>
        <span className="font-mono text-[10.5px]" style={{ color: TEXT_MID }}>{rows.length} tracked</span>
      </div>

      <table className="w-full">
        <thead>
          <tr className="text-[10px] uppercase tracking-[0.16em]" style={{ color: TEXT_LOW, background: "rgba(255,255,255,0.02)" }}>
            <th className="px-5 py-2.5 text-left font-normal">Portfolio</th>
            <th className="px-3 py-2.5 text-left font-normal">Kind</th>
            <SortHeader k="score" current={sort} set={setSort}>Score</SortHeader>
            <SortHeader k="ytdReturn" current={sort} set={setSort}>YTD</SortHeader>
            <SortHeader k="return30d" current={sort} set={setSort}>30d</SortHeader>
            <SortHeader k="holdingsCount" current={sort} set={setSort}>Holdings</SortHeader>
            <th className="px-3 py-2.5 text-left font-normal">Top pick</th>
            <th className="px-3 py-2.5 text-left font-normal">Last filing</th>
            <th className="px-5 py-2.5"></th>
          </tr>
        </thead>
        <motion.tbody variants={list} initial="hidden" animate="show" key={sort}>
          {sorted.map((r, i) => {
            const ytd = (r.ytdReturn ?? 0);
            const r30 = (r.return30d ?? 0) * 100;
            return (
              <motion.tr
                variants={item}
                key={r.slug}
                className="text-[13px] hover:bg-white/[0.02] transition-colors"
                style={{ borderTop: i === 0 ? "none" : `1px solid ${LINE}`, color: TEXT_HI }}
              >
                <td className="px-5 py-3">
                  <Link href={`/${r.slug}`} className="flex items-center gap-3">
                    <span
                      className="inline-flex items-center justify-center w-7 h-7 rounded-md font-mono text-[10.5px]"
                      style={{ background: "rgba(255,255,255,0.06)", border: `1px solid ${LINE_2}`, color: TEXT_HI }}
                    >
                      {initialsFor(r.name)}
                    </span>
                    <span>{r.name}</span>
                    {r.party && (
                      <span className="font-mono text-[10px] px-1.5 py-0.5 rounded"
                            style={{ color: r.party === "D" ? "#60A5FA" : "#F87171", border: `1px solid ${LINE_2}` }}>
                        {r.party}
                      </span>
                    )}
                  </Link>
                </td>
                <td className="px-3 py-3 font-mono text-[10.5px] uppercase tracking-wider" style={{ color: TEXT_MID }}>{r.kind}</td>
                <td className="px-3 py-3">
                  <ScoreBadge score={r.score} size="sm" />
                </td>
                <td className="px-3 py-3 font-mono tabular-nums" style={{ color: ytd >= 0 ? POSITIVE : NEGATIVE }}>
                  {r.ytdReturn === null ? "—" : `${ytd >= 0 ? "+" : ""}${ytd.toFixed(1)}%`}
                </td>
                <td className="px-3 py-3 font-mono tabular-nums" style={{ color: r30 >= 0 ? POSITIVE : NEGATIVE }}>
                  {r.return30d === null ? "—" : `${r30 >= 0 ? "+" : ""}${r30.toFixed(1)}%`}
                </td>
                <td className="px-3 py-3 font-mono tabular-nums" style={{ color: TEXT_MID }}>{r.holdingsCount}</td>
                <td className="px-3 py-3 font-mono" style={{ color: YELLOW }}>{r.topPick ?? "—"}</td>
                <td className="px-3 py-3 font-mono text-[11.5px]" style={{ color: TEXT_MID }}>{r.lastFilingDate ?? "—"}</td>
                <td className="px-5 py-3 text-right" style={{ color: TEXT_MID }}>→</td>
              </motion.tr>
            );
          })}
        </motion.tbody>
      </table>
    </section>
  );
}

function SortHeader({ k, current, set, children }: { k: SortKey; current: SortKey; set: (k: SortKey) => void; children: React.ReactNode }) {
  return (
    <th
      className="px-3 py-2.5 text-left font-normal cursor-pointer select-none"
      style={{ color: current === k ? "#fff" : undefined }}
      onClick={() => set(k)}
    >
      {children} {current === k && <span>↓</span>}
    </th>
  );
}
