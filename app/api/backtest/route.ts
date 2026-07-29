// app/api/backtest/route.ts
import { NextResponse } from "next/server";
import { db, portfolios, transactions, prices } from "@/lib/db";
import { eq, asc } from "drizzle-orm";
import { getBenchmarkSeries } from "@/lib/benchmarks";
import { maxDrawdown } from "@/lib/derived";

export const revalidate = 60;

export type BacktestTrade = {
  date: string;
  ticker: string;
  action: "buy" | "sell";
  entryPrice: number | null;
  exitPrice: number | null;
  shares: number;
  pnl: number;
  pnlPct: number | null;
};

export type BacktestResponse = {
  portfolioSlug: string;
  portfolioName: string;
  startDate: string;
  capital: number;
  endingValue: number;
  totalReturnPct: number;
  vsSpyPct: number;
  maxDrawdownPct: number;
  winRatePct: number;
  totalTrades: number;
  valueSeries: { date: string; portfolio: number; spy: number }[];
  trades: BacktestTrade[];
};

type Position = { shares: number; avgPrice: number };

function findClose(rows: { date: string; close: number }[], target: string): number | null {
  // Find the first close on or after target
  let best: number | null = null;
  for (const r of rows) {
    if (r.date >= target) {
      best = r.close;
      break;
    }
  }
  if (best !== null) return best;
  // fall back to last available
  return rows.length > 0 ? rows[rows.length - 1].close : null;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const portfolioSlug = searchParams.get("portfolio") ?? "pelosi";
  const startDate = searchParams.get("startDate") ?? "2025-01-01";
  const capital = Math.max(1, Number(searchParams.get("capital") ?? "10000"));

  const p = db
    .select()
    .from(portfolios)
    .where(eq(portfolios.slug, portfolioSlug))
    .get();
  if (!p) {
    return NextResponse.json({ error: "portfolio not found" }, { status: 404 });
  }

  const allTxs = db
    .select()
    .from(transactions)
    .where(eq(transactions.portfolioId, p.id))
    .orderBy(asc(transactions.disclosedDate))
    .all();
  const txInRange = allTxs.filter((t) => t.disclosedDate >= startDate);

  // Pre-load all prices for tickers we'll touch.
  const tickerSet = new Set<string>();
  for (const t of txInRange) tickerSet.add(t.ticker);
  tickerSet.add("SPY");

  const priceByTicker = new Map<string, { date: string; close: number }[]>();
  for (const tk of tickerSet) {
    const rows = db
      .select()
      .from(prices)
      .where(eq(prices.ticker, tk))
      .orderBy(asc(prices.date))
      .all()
      .filter((r) => r.date >= startDate)
      .map((r) => ({ date: r.date, close: r.close }));
    priceByTicker.set(tk, rows);
  }

  // Build unified date axis from SPY (most reliable)
  const spyRows = priceByTicker.get("SPY") ?? [];
  if (spyRows.length === 0) {
    return NextResponse.json({
      portfolioSlug: p.slug,
      portfolioName: p.name,
      startDate,
      capital,
      endingValue: capital,
      totalReturnPct: 0,
      vsSpyPct: 0,
      maxDrawdownPct: 0,
      winRatePct: 0,
      totalTrades: 0,
      valueSeries: [],
      trades: [],
    } satisfies BacktestResponse);
  }

  const totalTrades = txInRange.length;
  // Equal-weight allocation per buy
  const buyCount = txInRange.filter((t) => t.action === "buy").length || 1;
  const allocPerBuy = capital / buyCount;

  let cash = capital;
  const book = new Map<string, Position>();
  const trades: BacktestTrade[] = [];
  let wins = 0;
  let realizedTradeCount = 0;

  // Walk per day, applying any transactions disclosed on that date
  const txByDate = new Map<string, typeof txInRange>();
  for (const t of txInRange) {
    const arr = txByDate.get(t.disclosedDate) ?? [];
    arr.push(t);
    txByDate.set(t.disclosedDate, arr);
  }

  const valueSeries: { date: string; portfolio: number; spy: number }[] = [];
  const spyStartClose = spyRows[0].close;

  for (const day of spyRows) {
    // apply trades disclosed on this day
    const todays = txByDate.get(day.date);
    if (todays) {
      for (const t of todays) {
        const tickerRows = priceByTicker.get(t.ticker) ?? [];
        const entryPrice = findClose(tickerRows, t.disclosedDate);
        if (entryPrice === null || entryPrice <= 0) continue;
        if (t.action === "buy") {
          const dollars = Math.min(allocPerBuy, cash);
          if (dollars <= 0) {
            trades.push({
              date: t.disclosedDate,
              ticker: t.ticker,
              action: "buy",
              entryPrice,
              exitPrice: null,
              shares: 0,
              pnl: 0,
              pnlPct: null,
            });
            continue;
          }
          const shares = dollars / entryPrice;
          cash -= dollars;
          const cur = book.get(t.ticker) ?? { shares: 0, avgPrice: entryPrice };
          const newShares = cur.shares + shares;
          const newAvg =
            newShares === 0
              ? 0
              : (cur.avgPrice * cur.shares + entryPrice * shares) / newShares;
          book.set(t.ticker, { shares: newShares, avgPrice: newAvg });
          trades.push({
            date: t.disclosedDate,
            ticker: t.ticker,
            action: "buy",
            entryPrice,
            exitPrice: null,
            shares,
            pnl: 0,
            pnlPct: null,
          });
        } else {
          // sell — liquidate position
          const cur = book.get(t.ticker);
          if (!cur || cur.shares <= 0) {
            trades.push({
              date: t.disclosedDate,
              ticker: t.ticker,
              action: "sell",
              entryPrice: null,
              exitPrice: entryPrice,
              shares: 0,
              pnl: 0,
              pnlPct: null,
            });
            continue;
          }
          const proceeds = cur.shares * entryPrice;
          const cost = cur.shares * cur.avgPrice;
          const pnl = proceeds - cost;
          const pnlPct = cost > 0 ? pnl / cost : null;
          cash += proceeds;
          if (pnl > 0) wins++;
          realizedTradeCount++;
          trades.push({
            date: t.disclosedDate,
            ticker: t.ticker,
            action: "sell",
            entryPrice: cur.avgPrice,
            exitPrice: entryPrice,
            shares: cur.shares,
            pnl,
            pnlPct,
          });
          book.delete(t.ticker);
        }
      }
    }

    // mark-to-market for the day
    let positionsValue = 0;
    for (const [ticker, pos] of book.entries()) {
      const tickerRows = priceByTicker.get(ticker) ?? [];
      const close = findClose(tickerRows, day.date);
      positionsValue += pos.shares * (close ?? pos.avgPrice);
    }
    const portfolioValue = cash + positionsValue;
    const spyValue = (day.close / spyStartClose) * capital;
    valueSeries.push({ date: day.date, portfolio: portfolioValue, spy: spyValue });
  }

  // Compute unrealized P&L for open positions using the last close
  const lastDate = spyRows[spyRows.length - 1].date;
  for (const [ticker, pos] of book.entries()) {
    const tickerRows = priceByTicker.get(ticker) ?? [];
    const close = findClose(tickerRows, lastDate);
    if (close === null) continue;
    const pnl = (close - pos.avgPrice) * pos.shares;
    const pnlPct = pos.avgPrice > 0 ? (close - pos.avgPrice) / pos.avgPrice : null;
    // Update trades: tag the last buy of this ticker with open P&L
    for (let i = trades.length - 1; i >= 0; i--) {
      if (trades[i].ticker === ticker && trades[i].action === "buy" && trades[i].pnl === 0 && trades[i].exitPrice === null) {
        trades[i] = {
          ...trades[i],
          pnl,
          pnlPct,
          exitPrice: close,
        };
        if (pnl > 0) wins++;
        realizedTradeCount++;
        break;
      }
    }
  }

  const endingValue = valueSeries[valueSeries.length - 1]?.portfolio ?? capital;
  const spyEnd = valueSeries[valueSeries.length - 1]?.spy ?? capital;
  const totalReturnPct = ((endingValue - capital) / capital) * 100;
  const spyReturnPct = ((spyEnd - capital) / capital) * 100;
  const vsSpyPct = totalReturnPct - spyReturnPct;
  const portValues = valueSeries.map((d) => d.portfolio);
  const dd = maxDrawdown(portValues) * 100;
  const winRate =
    realizedTradeCount === 0 ? 0 : (wins / realizedTradeCount) * 100;

  // Also enrich SPY benchmark for completeness using the existing helper
  void getBenchmarkSeries;

  const out: BacktestResponse = {
    portfolioSlug: p.slug,
    portfolioName: p.name,
    startDate,
    capital,
    endingValue,
    totalReturnPct,
    vsSpyPct,
    maxDrawdownPct: dd,
    winRatePct: winRate,
    totalTrades,
    valueSeries,
    trades,
  };

  return NextResponse.json(out);
}
