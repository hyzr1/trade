// components/profile/TransactionLog.tsx
"use client";
import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Receipt } from "lucide-react";
import { LINE, LINE_2, TEXT_HI, TEXT_MID, TEXT_LOW, YELLOW, POSITIVE, NEGATIVE } from "@/lib/theme";
import type { ProfileData } from "@/lib/queries";
import { EmptyState } from "@/components/ui/EmptyState";
import { useStaggerVariants } from "@/components/ui/MotionList";
import { TimeAgo } from "@/components/ui/TimeAgo";

const PAGE = 40;

export function TransactionLog({ transactions }: { transactions: ProfileData["transactions"] }) {
  const [side, setSide] = useState<"all" | "buys" | "sells">("all");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(0);

  const filtered = useMemo(() => {
    return transactions.filter((t) => {
      if (side === "buys" && t.action !== "buy") return false;
      if (side === "sells" && t.action !== "sell") return false;
      if (query && !t.ticker.toLowerCase().includes(query.toLowerCase())) return false;
      return true;
    });
  }, [transactions, side, query]);

  const pages = Math.ceil(filtered.length / PAGE);
  const visible = filtered.slice(page * PAGE, (page + 1) * PAGE);
  const { list, item } = useStaggerVariants();

  return (
    <section
      className="rounded-2xl overflow-hidden"
      style={{
        background: "linear-gradient(180deg, rgba(255,255,255,0.025) 0%, rgba(255,255,255,0.005) 100%)",
        border: `1px solid ${LINE_2}`,
      }}
    >
      <div className="flex items-center justify-between px-5 py-3 border-b flex-wrap gap-3" style={{ borderColor: LINE }}>
        <div className="flex items-center gap-3">
          <span className="text-[10.5px] uppercase tracking-[0.16em]" style={{ color: TEXT_LOW }}>Transaction log</span>
          <span className="font-mono text-[10.5px]" style={{ color: TEXT_MID }}>{filtered.length} trades</span>
        </div>
        <div className="flex items-center gap-1.5">
          {(["all", "buys", "sells"] as const).map((s) => (
            <button
              key={s}
              onClick={() => { setSide(s); setPage(0); }}
              className="rounded-full px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider"
              style={{
                background: side === s ? "#fff" : "transparent",
                color: side === s ? "#000" : TEXT_MID,
                border: `1px solid ${side === s ? "transparent" : LINE_2}`,
              }}
            >
              {s}
            </button>
          ))}
          <input
            value={query}
            onChange={(e) => { setQuery(e.target.value); setPage(0); }}
            placeholder="ticker…"
            className="bg-transparent border rounded-full px-3 py-1 text-[11.5px] outline-none w-28 ml-2"
            style={{ borderColor: LINE_2, color: TEXT_HI }}
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<Receipt size={18} />}
          headline="No trades match"
          body="Try a different side or clear the ticker query."
          cta={
            side !== "all" || query
              ? {
                  label: "Clear filters",
                  onClick: () => {
                    setSide("all");
                    setQuery("");
                    setPage(0);
                  },
                }
              : undefined
          }
          compact
        />
      ) : (
      <table className="w-full">
        <thead>
          <tr className="text-[10px] uppercase tracking-[0.16em]" style={{ color: TEXT_LOW, background: "rgba(255,255,255,0.02)" }}>
            <th className="px-4 sm:px-5 py-2.5 text-left font-normal">Trade date</th>
            <th className="hidden md:table-cell px-3 py-2.5 text-left font-normal">Disclosed</th>
            <th className="hidden sm:table-cell px-3 py-2.5 text-left font-normal">Days late</th>
            <th className="px-3 py-2.5 text-left font-normal">Side</th>
            <th className="px-3 py-2.5 text-left font-normal">Ticker</th>
            <th className="hidden sm:table-cell px-4 sm:px-5 py-2.5 text-right font-normal">Source</th>
          </tr>
        </thead>
        <motion.tbody variants={list} initial="hidden" animate="show" key={`${page}|${side}|${query}`}>
          {visible.map((t, i) => (
            <motion.tr
              variants={item}
              key={t.id}
              className="text-[12.5px] font-mono hover:bg-white/[0.02] transition-colors"
              style={{ borderTop: i === 0 ? "none" : `1px solid ${LINE}`, color: TEXT_HI }}
            >
              <td className="px-4 sm:px-5 py-2.5 tabular-nums">{t.tradeDate}</td>
              <td className="hidden md:table-cell px-3 py-2.5 tabular-nums" style={{ color: TEXT_MID }}>
                <TimeAgo iso={t.disclosedDate} />
              </td>
              <td className="hidden sm:table-cell px-3 py-2.5 tabular-nums" style={{ color: t.daysDelayed > 45 ? NEGATIVE : TEXT_MID }}>
                {t.daysDelayed}d
              </td>
              <td className="px-3 py-2.5 font-semibold" style={{ color: t.action === "buy" ? POSITIVE : NEGATIVE }}>
                {t.action.toUpperCase()}
              </td>
              <td className="px-3 py-2.5" style={{ color: YELLOW }}>
                <a href={`/ticker/${t.ticker}`} className="hover:underline" style={{ color: YELLOW }}>
                  {t.ticker}
                </a>
              </td>
              <td className="hidden sm:table-cell px-4 sm:px-5 py-2.5 text-right">
                {t.sourceUrl ? (
                  <a href={t.sourceUrl} target="_blank" rel="noreferrer" className="hover:underline" style={{ color: TEXT_MID }}>
                    PDF →
                  </a>
                ) : (
                  <span style={{ color: TEXT_LOW }}>—</span>
                )}
              </td>
            </motion.tr>
          ))}
        </motion.tbody>
      </table>
      )}

      {pages > 1 && (
        <div className="px-5 py-3 border-t flex items-center justify-between font-mono text-[11.5px]" style={{ borderColor: LINE, color: TEXT_MID }}>
          <span>page {page + 1} / {pages}</span>
          <div className="flex gap-2">
            <button onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0} className="px-3 py-1 rounded border disabled:opacity-30" style={{ borderColor: LINE_2 }}>← prev</button>
            <button onClick={() => setPage((p) => Math.min(pages - 1, p + 1))} disabled={page === pages - 1} className="px-3 py-1 rounded border disabled:opacity-30" style={{ borderColor: LINE_2 }}>next →</button>
          </div>
        </div>
      )}
    </section>
  );
}
