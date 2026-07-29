// app/api/watchlist/preview/route.ts
import { NextResponse } from "next/server";
import { db, portfolios, transactions } from "@/lib/db";
import { desc } from "drizzle-orm";

export const revalidate = 60;

export type WatchlistPreviewRow = {
  ticker: string;
  weekFilings: number;
  lastBuyer: string | null;
  lastBuyDate: string | null;
  lastAction: "buy" | "sell" | null;
};

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const idsParam = searchParams.get("ids");
  const tickers = (idsParam ?? "")
    .split(",")
    .map((t) => t.trim().toUpperCase())
    .filter(Boolean);

  if (tickers.length === 0) {
    return NextResponse.json({ rows: [] satisfies WatchlistPreviewRow[] });
  }

  const allPortfolios = db.select().from(portfolios).all();
  const nameById = new Map(allPortfolios.map((p) => [p.id, p.name]));

  const allTxs = db
    .select()
    .from(transactions)
    .orderBy(desc(transactions.disclosedDate))
    .all();

  const weekCutoff = Date.now() - WEEK_MS;
  const rows: WatchlistPreviewRow[] = tickers.map((ticker) => {
    const forTicker = allTxs.filter((t) => t.ticker.toUpperCase() === ticker);
    const weekFilings = forTicker.filter((t) => {
      const ts = new Date(t.disclosedDate).getTime();
      return Number.isFinite(ts) && ts >= weekCutoff;
    }).length;
    const latest = forTicker[0];
    return {
      ticker,
      weekFilings,
      lastBuyer: latest ? nameById.get(latest.portfolioId) ?? null : null,
      lastBuyDate: latest?.disclosedDate ?? null,
      lastAction: latest?.action ?? null,
    };
  });

  return NextResponse.json({ rows });
}
