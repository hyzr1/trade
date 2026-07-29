// lib/benchmarks.ts
import { db, prices } from "./db";
import { eq, asc } from "drizzle-orm";
import { normalizeSeries } from "./derived";

export type Benchmark = "SPY" | "QQQ";

export function getBenchmarkSeries(
  ticker: Benchmark,
  sinceDate: string,
): { date: string; value: number }[] {
  const rows = db
    .select()
    .from(prices)
    .where(eq(prices.ticker, ticker))
    .orderBy(asc(prices.date))
    .all()
    .filter((r) => r.date >= sinceDate);
  return normalizeSeries(rows.map((r) => ({ date: r.date, close: r.close })));
}
