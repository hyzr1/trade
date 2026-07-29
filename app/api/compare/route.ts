// app/api/compare/route.ts
import { NextResponse } from "next/server";
import { db, portfolios, positions, transactions, dailyReturns } from "@/lib/db";
import { eq, asc, desc } from "drizzle-orm";
import { sectorOf } from "@/lib/sectors";
import { getBenchmarkSeries } from "@/lib/benchmarks";
import { overlapScore } from "@/lib/derived";
import { metaFor } from "@/lib/portfolio-meta";

export const revalidate = 60;

export type ComparePortfolio = {
  slug: string;
  name: string;
  kind: "politician" | "llm";
  meta: ReturnType<typeof metaFor>;
  ytdReturn: number | null;
  return30d: number | null;
  holdingsCount: number;
  lastFilingDate: string | null;
  topHoldings: {
    ticker: string;
    weight: number;
    sector: string;
  }[];
  /** ALL tickers held (not just top 10) — used for overlap math and chips. */
  allTickers: string[];
  recentTransactions: {
    id: string;
    ticker: string;
    action: "buy" | "sell";
    tradeDate: string;
    disclosedDate: string;
  }[];
  portfolioSeries: { date: string; value: number }[];
  sectorWeights: { sector: string; weight: number; color: string }[];
  /** Sum of recent buy actions across pulled txs — used for "AI confirmed" surrogate %. */
  aiConfirmedPct: number;
};

/** Legacy 2-side response (kept for back-compat with any cached clients). */
export type CompareResponse = {
  a: ComparePortfolio;
  b: ComparePortfolio;
  /** N-portfolio array (mirrors a,b at indices 0,1 when only two slugs requested). */
  portfolios: ComparePortfolio[];
  spy: { date: string; value: number }[];
  /** Legacy: pairwise overlap of a vs b. */
  overlapPct: number;
  /** Legacy: shared tickers between a and b. */
  sharedTickers: string[];
  /** Legacy: tickers exclusive to a. */
  onlyInA: string[];
  /** Legacy: tickers exclusive to b. */
  onlyInB: string[];
  /** N×N matrix of overlap %; matrix[i][j] = overlap(portfolios[i], portfolios[j]). */
  overlapMatrix: number[][];
};

import { SECTOR_COLORS } from "@/lib/sectors";

function buildPortfolio(slug: string): ComparePortfolio | null {
  const p = db.select().from(portfolios).where(eq(portfolios.slug, slug)).get();
  if (!p) return null;

  const series = db
    .select()
    .from(dailyReturns)
    .where(eq(dailyReturns.portfolioId, p.id))
    .orderBy(asc(dailyReturns.date))
    .all();
  const ytd = series.length >= 2 ? series[series.length - 1].valueIndex - 100 : null;
  const last30 = series.slice(-30);
  const ret30 =
    last30.length >= 2
      ? (last30[last30.length - 1].valueIndex - last30[0].valueIndex) /
        last30[0].valueIndex
      : null;

  const allPos = db
    .select()
    .from(positions)
    .where(eq(positions.portfolioId, p.id))
    .orderBy(desc(positions.weightPct))
    .all();

  // Aggregate weights by sector
  const sectorMap = new Map<string, number>();
  for (const pos of allPos) {
    const sec = sectorOf(pos.ticker);
    sectorMap.set(sec, (sectorMap.get(sec) ?? 0) + pos.weightPct);
  }
  const sectorWeights = Array.from(sectorMap.entries())
    .map(([sector, weight]) => ({
      sector,
      weight,
      color: SECTOR_COLORS[sector as keyof typeof SECTOR_COLORS] ?? "#888",
    }))
    .sort((a, b) => b.weight - a.weight);

  const txs = db
    .select()
    .from(transactions)
    .where(eq(transactions.portfolioId, p.id))
    .orderBy(desc(transactions.disclosedDate))
    .limit(20)
    .all();

  // Crude "AI confirmed %" — share of recent transactions that are buys.
  // Good enough as a surrogate when we just need a sortable scalar per portfolio.
  const recentBuys = txs.filter((t) => t.action === "buy").length;
  const aiConfirmedPct = txs.length === 0 ? 0 : (recentBuys / txs.length) * 100;

  return {
    slug: p.slug,
    name: p.name,
    kind: p.kind as "politician" | "llm",
    meta: metaFor(p.slug),
    ytdReturn: ytd,
    return30d: ret30,
    holdingsCount: allPos.length,
    lastFilingDate: txs[0]?.disclosedDate ?? null,
    topHoldings: allPos.slice(0, 10).map((h) => ({
      ticker: h.ticker,
      weight: h.weightPct,
      sector: sectorOf(h.ticker),
    })),
    allTickers: allPos.map((h) => h.ticker),
    recentTransactions: txs.map((t) => ({
      id: t.id,
      ticker: t.ticker,
      action: t.action as "buy" | "sell",
      tradeDate: t.tradeDate,
      disclosedDate: t.disclosedDate,
    })),
    portfolioSeries: series.map((r) => ({ date: r.date, value: r.valueIndex })),
    sectorWeights,
    aiConfirmedPct,
  };
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  // Two input shapes:
  //   1. ?slugs=pelosi,gpt,greene,claude   (preferred, N up to 4)
  //   2. ?a=pelosi&b=gpt[&c=...&d=...]     (legacy 2-side + new 3rd/4th slot)
  let slugs: string[] = [];
  const slugsParam = searchParams.get("slugs");
  if (slugsParam) {
    slugs = slugsParam
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  } else {
    const a = searchParams.get("a");
    const b = searchParams.get("b");
    const c = searchParams.get("c");
    const d = searchParams.get("d");
    slugs = [a, b, c, d].filter((x): x is string => !!x);
  }
  if (slugs.length === 0) slugs = ["pelosi", "gpt"];
  // Cap at 4 — UI doesn't render more.
  slugs = slugs.slice(0, 4);

  const built = slugs.map((s) => buildPortfolio(s));
  const all = built.filter((p): p is ComparePortfolio => p !== null);
  if (all.length < 2) {
    return NextResponse.json({ error: "need at least two valid portfolios" }, { status: 404 });
  }

  // N×N pairwise overlap matrix using full ticker sets.
  const overlapMatrix: number[][] = all.map((p) =>
    all.map((q) => (p.slug === q.slug ? 100 : overlapScore(p.allTickers, q.allTickers) * 100)),
  );

  // SPY benchmark series aligned to the earliest portfolio start.
  const earliestDate = all
    .map((p) => p.portfolioSeries[0]?.date)
    .filter((x): x is string => !!x)
    .sort()[0] ?? "2024-01-01";
  const spy = getBenchmarkSeries("SPY", earliestDate);

  // Legacy 2-side fields. When N >= 2 these match indices 0/1.
  const a = all[0];
  const b = all[1];
  const aSet = new Set(a.allTickers);
  const bSet = new Set(b.allTickers);
  const sharedTickers = a.allTickers.filter((t) => bSet.has(t));
  const onlyInA = a.allTickers.filter((t) => !bSet.has(t));
  const onlyInB = b.allTickers.filter((t) => !aSet.has(t));
  const overlapPct = overlapMatrix[0][1];

  // Suppress unused: aSet appears in the comprehension above
  void aSet;

  const out: CompareResponse = {
    a,
    b,
    portfolios: all,
    spy,
    overlapPct,
    sharedTickers,
    onlyInA,
    onlyInB,
    overlapMatrix,
  };
  return NextResponse.json(out);
}
