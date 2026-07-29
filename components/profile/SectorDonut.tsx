// components/profile/SectorDonut.tsx
"use client";
import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { ArrowUpRight } from "lucide-react";
import { LINE_2, TEXT_HI, TEXT_MID, TEXT_LOW } from "@/lib/theme";
import { SECTOR_COLORS, type Sector } from "@/lib/sectors";
import type { ProfileData } from "@/lib/queries";

export function SectorDonut({
  holdings,
  selected,
  onSelect,
}: {
  holdings: ProfileData["holdings"];
  selected?: Sector | null;
  onSelect?: (s: Sector | null) => void;
}) {
  const router = useRouter();
  const slices = useMemo(() => {
    const by = new Map<Sector, number>();
    for (const h of holdings) {
      by.set(h.sector as Sector, (by.get(h.sector as Sector) ?? 0) + h.weight);
    }
    return [...by.entries()].sort((a, b) => b[1] - a[1]);
  }, [holdings]);

  const total = slices.reduce((s, [, w]) => s + w, 0) || 1;
  const r = 80, R = 110, cx = 130, cy = 130;
  let acc = 0;

  return (
    <section
      className="rounded-2xl p-4 sm:p-6"
      style={{
        background: "linear-gradient(180deg, rgba(255,255,255,0.025) 0%, rgba(255,255,255,0.005) 100%)",
        border: `1px solid ${LINE_2}`,
      }}
    >
      <div className="text-[10.5px] uppercase tracking-[0.16em] mb-4" style={{ color: TEXT_LOW }}>Sector mix</div>
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6">
        <svg viewBox="0 0 260 260" className="shrink-0 w-[180px] h-[180px] sm:w-[200px] sm:h-[200px]" aria-hidden>
          {slices.map(([sector, w]) => {
            const a0 = (acc / total) * Math.PI * 2 - Math.PI / 2;
            acc += w;
            const a1 = (acc / total) * Math.PI * 2 - Math.PI / 2;
            const large = a1 - a0 > Math.PI ? 1 : 0;
            const x0 = cx + R * Math.cos(a0), y0 = cy + R * Math.sin(a0);
            const x1 = cx + R * Math.cos(a1), y1 = cy + R * Math.sin(a1);
            const ix0 = cx + r * Math.cos(a1), iy0 = cy + r * Math.sin(a1);
            const ix1 = cx + r * Math.cos(a0), iy1 = cy + r * Math.sin(a0);
            const isActive = selected === sector || !selected;
            return (
              <path
                key={sector}
                d={`M ${x0} ${y0} A ${R} ${R} 0 ${large} 1 ${x1} ${y1} L ${ix0} ${iy0} A ${r} ${r} 0 ${large} 0 ${ix1} ${iy1} Z`}
                fill={SECTOR_COLORS[sector]}
                opacity={isActive ? 1 : 0.25}
                onClick={() => onSelect?.(selected === sector ? null : sector)}
                style={{ cursor: "pointer", transition: "opacity .15s" }}
              />
            );
          })}
          <text x={cx} y={cy - 4} textAnchor="middle" style={{ fontSize: 14, fill: TEXT_MID, fontFamily: "ui-monospace" }}>
            {holdings.length}
          </text>
          <text x={cx} y={cy + 12} textAnchor="middle" style={{ fontSize: 9, fill: TEXT_LOW, fontFamily: "ui-monospace", letterSpacing: "0.18em", textTransform: "uppercase" }}>
            positions
          </text>
        </svg>

        <ul className="flex-1 min-w-0 space-y-1.5 text-[12.5px]">
          {slices.map(([sector, w]) => (
            <li
              key={sector}
              className="group flex items-center gap-2.5"
              style={{ opacity: !selected || selected === sector ? 1 : 0.45 }}
            >
              <button
                type="button"
                onClick={() => onSelect?.(selected === sector ? null : sector)}
                className="flex flex-1 items-center gap-2.5 min-w-0 text-left cursor-pointer"
                title={`Filter holdings by ${sector}`}
              >
                <span className="w-2.5 h-2.5 rounded-sm" style={{ background: SECTOR_COLORS[sector] }} />
                <span className="flex-1 truncate" style={{ color: TEXT_HI }}>{sector}</span>
                <span className="font-mono tabular-nums" style={{ color: TEXT_MID }}>
                  {((w / total) * 100).toFixed(1)}%
                </span>
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  router.push(`/sector/${encodeURIComponent(sector)}`);
                }}
                aria-label={`Open ${sector} sector page`}
                title={`Open ${sector} sector page`}
                className="inline-flex items-center justify-center w-5 h-5 rounded opacity-50 group-hover:opacity-100 transition-opacity"
                style={{ color: TEXT_MID }}
              >
                <ArrowUpRight size={12} />
              </button>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
