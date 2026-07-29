// components/profile/HoldingsTable.tsx
"use client";
import { Star } from "lucide-react";
import { LINE, LINE_2, TEXT_HI, TEXT_MID, TEXT_LOW, YELLOW, POSITIVE, NEGATIVE, VIOLET, VIOLET_2 } from "@/lib/theme";
import { SECTOR_COLORS, type Sector } from "@/lib/sectors";
import { useWatchlist } from "@/lib/watchlist";
import type { ProfileData } from "@/lib/queries";

export function HoldingsTable({
  holdings,
  filterSector,
  onClearFilter,
}: {
  holdings: ProfileData["holdings"];
  filterSector?: Sector | null;
  onClearFilter?: () => void;
}) {
  const filtered = filterSector ? holdings.filter((h) => h.sector === filterSector) : holdings;
  const { has, toggle, hydrated } = useWatchlist();
  return (
    <section
      className="rounded-2xl overflow-hidden"
      style={{
        background: "linear-gradient(180deg, rgba(255,255,255,0.025) 0%, rgba(255,255,255,0.005) 100%)",
        border: `1px solid ${LINE_2}`,
      }}
    >
      <div className="flex items-center justify-between px-5 py-3 border-b" style={{ borderColor: LINE }}>
        <span className="text-[10.5px] uppercase tracking-[0.16em]" style={{ color: TEXT_LOW }}>
          Holdings {filterSector && <span style={{ color: TEXT_HI }}>· {filterSector}</span>}
        </span>
        <div className="flex items-center gap-3 font-mono text-[10.5px]" style={{ color: TEXT_MID }}>
          {filterSector && (
            <button onClick={onClearFilter} className="hover:underline">clear filter</button>
          )}
          <span>{filtered.length} positions</span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-[10px] uppercase tracking-[0.16em]" style={{ color: TEXT_LOW, background: "rgba(255,255,255,0.02)" }}>
              <th className="px-4 sm:px-5 py-2.5 text-left font-normal">Ticker</th>
              <th className="hidden sm:table-cell px-3 py-2.5 text-left font-normal">Sector</th>
              <th className="px-3 py-2.5 text-right font-normal">Weight</th>
              <th className="hidden md:table-cell px-3 py-2.5 text-right font-normal">Shares</th>
              <th className="hidden md:table-cell px-3 py-2.5 text-left font-normal">Last buy</th>
              <th className="px-4 sm:px-5 py-2.5 text-right font-normal">30d</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((h, i) => {
              const last = h.sparkPrice[h.sparkPrice.length - 1] ?? 0;
              const first = h.sparkPrice[0] ?? 0;
              const pct = first === 0 ? 0 : ((last - first) / first) * 100;
              const positive = pct >= 0;
              return (
                <tr
                  key={h.ticker}
                  className="text-[13px] hover:bg-white/[0.02] transition-colors"
                  style={{ borderTop: i === 0 ? "none" : `1px solid ${LINE}`, color: TEXT_HI }}
                >
                  <td className="px-4 sm:px-5 py-3 font-mono font-semibold" style={{ color: YELLOW }}>
                    <div className="group/star inline-flex items-center gap-2">
                      <a href={`/ticker/${h.ticker}`} className="hover:underline" style={{ color: YELLOW }}>
                        {h.ticker}
                      </a>
                      <button
                        onClick={() => toggle("ticker", h.ticker)}
                        aria-label={hydrated && has("ticker", h.ticker) ? "Unwatch" : "Watch"}
                        className={`inline-flex items-center justify-center w-5 h-5 rounded-md transition-opacity ${
                          hydrated && has("ticker", h.ticker)
                            ? "opacity-100"
                            : "opacity-0 group-hover/star:opacity-100"
                        }`}
                        style={{
                          color: hydrated && has("ticker", h.ticker) ? VIOLET_2 : TEXT_LOW,
                        }}
                      >
                        <Star
                          size={11}
                          fill={hydrated && has("ticker", h.ticker) ? VIOLET : "transparent"}
                        />
                      </button>
                    </div>
                  </td>
                  <td className="hidden sm:table-cell px-3 py-3">
                    <a
                      href={`/sector/${encodeURIComponent(h.sector)}`}
                      className="inline-flex items-center gap-1.5 font-mono text-[10.5px] hover:underline"
                      style={{ color: TEXT_MID }}
                    >
                      <span className="w-2 h-2 rounded-sm" style={{ background: SECTOR_COLORS[h.sector as Sector] }} />
                      {h.sector}
                    </a>
                  </td>
                  <td className="px-3 py-3 font-mono tabular-nums text-right">
                    <div className="inline-flex items-center justify-end gap-2 w-full">
                      <div className="h-1.5 rounded-sm overflow-hidden" style={{ width: 56, background: "rgba(255,255,255,0.06)" }}>
                        <div style={{ width: `${h.weight}%`, height: "100%", background: VIOLET }} />
                      </div>
                      <span>{h.weight.toFixed(1)}%</span>
                    </div>
                  </td>
                  <td className="hidden md:table-cell px-3 py-3 font-mono tabular-nums text-right" style={{ color: TEXT_MID }}>
                    {h.shares.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </td>
                  <td className="hidden md:table-cell px-3 py-3 font-mono text-[11.5px]" style={{ color: TEXT_MID }}>
                    {h.lastBuyDate ?? "—"}
                  </td>
                  <td className="px-4 sm:px-5 py-3 text-right">
                    <div className="inline-flex items-center justify-end gap-2">
                      <MiniSpark points={h.sparkPrice} positive={positive} />
                      <span className="font-mono tabular-nums w-14 text-right" style={{ color: positive ? POSITIVE : NEGATIVE }}>
                        {positive ? "+" : ""}{pct.toFixed(1)}%
                      </span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function MiniSpark({ points, positive }: { points: number[]; positive: boolean }) {
  const w = 60, h = 18;
  if (points.length < 2) return <div style={{ width: w, height: h }} />;
  const min = Math.min(...points), max = Math.max(...points), range = max - min || 1;
  const step = w / (points.length - 1);
  const path = points.map((v, i) => `${i === 0 ? "M" : "L"} ${(i * step).toFixed(1)} ${(h - ((v - min) / range) * h).toFixed(1)}`).join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} style={{ width: w, height: h }} aria-hidden>
      <path d={path} fill="none" stroke={positive ? POSITIVE : NEGATIVE} strokeWidth="1.2" />
    </svg>
  );
}
