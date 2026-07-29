// lib/pricing.ts
import YahooFinance from "yahoo-finance2";
import { db, prices } from "./db";
import { and, eq } from "drizzle-orm";

const yahooFinance = new YahooFinance({ suppressNotices: ["yahooSurvey"] });

export async function getDailyClose(ticker: string, date: string): Promise<number | null> {
  const cached = db.select().from(prices).where(and(eq(prices.ticker, ticker), eq(prices.date, date))).get();
  if (cached) return cached.close;

  try {
    const result = await yahooFinance.historical(ticker, {
      period1: date,
      period2: new Date(new Date(date).getTime() + 24 * 3600 * 1000).toISOString().slice(0, 10),
      interval: "1d",
    });
    const close = result[0]?.close ?? null;
    if (close != null) {
      db.insert(prices).values({ ticker, date, close, stale: 0 }).onConflictDoNothing().run();
    }
    return close;
  } catch (err) {
    console.warn(`pricing: yahoo failed for ${ticker} ${date}`, err);
    return null;
  }
}

export async function backfillPrices(tickers: string[], fromDate: string): Promise<void> {
  const today = new Date().toISOString().slice(0, 10);
  for (const ticker of tickers) {
    try {
      const rows = await yahooFinance.historical(ticker, { period1: fromDate, period2: today, interval: "1d" });
      for (const r of rows) {
        const dateStr = r.date.toISOString().slice(0, 10);
        db.insert(prices).values({ ticker, date: dateStr, close: r.close, stale: 0 }).onConflictDoNothing().run();
      }
    } catch (err) {
      console.warn(`pricing: backfill failed for ${ticker}`, err);
    }
  }
}
