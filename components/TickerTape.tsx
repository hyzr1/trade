// components/TickerTape.tsx
//
// Infinite-scrolling marquee of recent disclosures. Real tickers + actions
// from the DB, sourced from `lib/queries.ts`. Pauses on hover.
import { db, transactions, portfolios } from "@/lib/db";
import { eq, desc } from "drizzle-orm";

type Tick = { name: string; action: "buy" | "sell"; ticker: string };

export function TickerTape() {
  // Most recent N disclosed transactions across all politicians.
  const all = db
    .select({
      portfolioId: transactions.portfolioId,
      ticker: transactions.ticker,
      action: transactions.action,
      tradeDate: transactions.tradeDate,
    })
    .from(transactions)
    .orderBy(desc(transactions.tradeDate))
    .limit(30)
    .all();

  const names = new Map(
    db.select({ id: portfolios.id, name: portfolios.name }).from(portfolios).all()
      .map((p) => [p.id, p.name])
  );

  const ticks: Tick[] = all.map((t) => ({
    name: names.get(t.portfolioId) ?? t.portfolioId,
    action: t.action as "buy" | "sell",
    ticker: t.ticker,
  }));

  if (ticks.length === 0) return null;

  // Duplicate the list so the loop is seamless.
  const list: Tick[] = [...ticks, ...ticks];

  return (
    <div
      className="group relative overflow-hidden border-y border-white/[0.05] bg-black/30 backdrop-blur-sm"
      aria-label="Live ticker"
    >
      <div className="flex animate-[ticker_60s_linear_infinite] hover:[animation-play-state:paused] whitespace-nowrap">
        {list.map((t, i) => (
          <div key={i} className="flex items-center gap-2 px-5 py-2.5 text-[12px]">
            <span
              className={`inline-flex w-1.5 h-1.5 rounded-full ${
                t.action === "buy" ? "bg-emerald-400" : "bg-red-400"
              }`}
              aria-hidden
            />
            <span className="text-zinc-500">{t.name}</span>
            <span className={t.action === "buy" ? "text-emerald-300" : "text-red-300"}>
              {t.action === "buy" ? "bought" : "sold"}
            </span>
            <span className="font-mono text-zinc-100">{t.ticker}</span>
            <span className="text-zinc-700">·</span>
          </div>
        ))}
      </div>

      <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-black to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-black to-transparent" />
    </div>
  );
}
