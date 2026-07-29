// components/ActivityFeed.tsx
import { formatDateRelative, formatDateLong } from "@/lib/format";

type Item = {
  ticker: string;
  action: "buy" | "sell";
  tradeDate: string;
  disclosedDate: string;
  sourceUrl: string | null;
};

export function ActivityFeed({ items }: { items: Item[] }) {
  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-white/10 p-8 text-center text-zinc-500 text-sm">
        No activity yet.
      </div>
    );
  }
  return (
    <ul className="rounded-xl border border-white/[0.06] divide-y divide-white/[0.04] overflow-hidden">
      {items.map((t, i) => {
        const buy = t.action === "buy";
        return (
          <li key={i} className="flex items-center gap-3 px-3.5 py-2.5 hover:bg-white/[0.015] transition-colors">
            <span
              className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-[10px] font-semibold ${
                buy ? "bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20" : "bg-red-500/10 text-red-400 ring-1 ring-red-500/20"
              }`}
              aria-hidden
            >
              {buy ? "↑" : "↓"}
            </span>
            <div className="min-w-0 flex-1">
              <div className="text-[13px]">
                <span className={buy ? "text-emerald-400" : "text-red-400"}>{buy ? "Bought" : "Sold"}</span>
                <span className="font-mono ml-2 text-zinc-100">{t.ticker}</span>
              </div>
              <div className="text-[10.5px] text-zinc-500 mt-0.5">
                <span title={formatDateLong(t.tradeDate)}>{formatDateRelative(t.tradeDate)}</span>
                {t.disclosedDate !== t.tradeDate && (
                  <> · disclosed {formatDateRelative(t.disclosedDate)}</>
                )}
              </div>
            </div>
            {t.sourceUrl && (
              <a
                href={t.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10.5px] text-zinc-400 hover:text-zinc-100 border border-white/[0.06] hover:border-white/20 rounded-full px-2 py-0.5 transition-colors"
                title="View source PTR"
              >
                PTR ↗
              </a>
            )}
          </li>
        );
      })}
    </ul>
  );
}
