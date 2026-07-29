// app/api/search/route.ts
import { NextResponse } from "next/server";
import { db, portfolios, transactions } from "@/lib/db";
import { desc } from "drizzle-orm";

export const revalidate = 60;

export async function GET() {
  const allPortfolios = db.select().from(portfolios).all();

  const recentTxs = db
    .select()
    .from(transactions)
    .orderBy(desc(transactions.disclosedDate))
    .limit(20)
    .all();

  // Top tickers by total transaction count
  const tickerCounts = new Map<string, number>();
  for (const t of db.select().from(transactions).all()) {
    tickerCounts.set(t.ticker, (tickerCounts.get(t.ticker) ?? 0) + 1);
  }
  const topTickers = [...tickerCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 60)
    .map(([ticker, count]) => ({ ticker, count }));

  const slugById = new Map(allPortfolios.map((p) => [p.id, p.slug]));
  const nameById = new Map(allPortfolios.map((p) => [p.id, p.name]));

  const recentFilings = recentTxs.map((t) => ({
    id: t.id,
    ticker: t.ticker,
    action: t.action,
    tradeDate: t.tradeDate,
    disclosedDate: t.disclosedDate,
    portfolioSlug: slugById.get(t.portfolioId) ?? null,
    portfolioName: nameById.get(t.portfolioId) ?? "Unknown",
  }));

  return NextResponse.json({
    portfolios: allPortfolios.map((p) => ({
      slug: p.slug,
      name: p.name,
      kind: p.kind,
    })),
    tickers: topTickers,
    recentFilings,
  });
}
