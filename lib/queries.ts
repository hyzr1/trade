// lib/queries.ts
import { db, portfolios, positions, dailyReturns, transactions, prices } from "./db";
import { eq, desc, asc } from "drizzle-orm";
import type { PortfolioCardData } from "@/components/PortfolioCard";
import { initialsFor, labelFor } from "./format";
import { metaFor } from "./portfolio-meta";
import { sectorOf } from "./sectors";
import { getBenchmarkSeries } from "./benchmarks";
import { maxDrawdown, overlapScore, portfolioScore } from "./derived";

export async function getAllPortfolioCards(): Promise<PortfolioCardData[]> {
  const all = db
    .select()
    .from(portfolios)
    .all()
    .sort((a, b) => {
      if (a.kind === b.kind) return a.name.localeCompare(b.name);
      return a.kind === "politician" ? -1 : 1;
    });

  const out: PortfolioCardData[] = [];
  for (const p of all) {
    const recentReturns = db
      .select()
      .from(dailyReturns)
      .where(eq(dailyReturns.portfolioId, p.id))
      .orderBy(desc(dailyReturns.date))
      .limit(90)
      .all()
      .reverse();

    const allTime = recentReturns.length > 0
      ? recentReturns[recentReturns.length - 1].valueIndex - 100
      : null;

    const pos = db
      .select()
      .from(positions)
      .where(eq(positions.portfolioId, p.id))
      .orderBy(desc(positions.weightPct))
      .limit(3)
      .all();

    out.push({
      slug: p.slug,
      name: p.name,
      label: labelFor(p.slug),
      kind: p.kind as "politician" | "llm",
      allTimeReturn: recentReturns.length >= 2 ? allTime : null,
      sparkPoints: recentReturns.map((r) => r.valueIndex),
      topHoldings: pos.map((p) => ({ ticker: p.ticker, weight: p.weightPct })),
      initials: initialsFor(p.name),
    });
  }
  return out;
}

export type PortfolioDetail = {
  slug: string;
  name: string;
  label: string;
  kind: "politician" | "llm";
  blurb: string;
  inceptionDate: string;
  initials: string;
  allTimeReturn: number | null;
  chartPoints: { date: string; value: number }[];
  holdings: { ticker: string; weight: number; updatedAt: string }[];
  recentTransactions: {
    ticker: string;
    action: "buy" | "sell";
    tradeDate: string;
    disclosedDate: string;
    sourceUrl: string | null;
  }[];
};

export async function getPortfolioDetail(slug: string): Promise<PortfolioDetail | null> {
  const p = db.select().from(portfolios).where(eq(portfolios.slug, slug)).get();
  if (!p) return null;

  const points = db
    .select()
    .from(dailyReturns)
    .where(eq(dailyReturns.portfolioId, p.id))
    .orderBy(asc(dailyReturns.date))
    .all();

  const allTime = points.length >= 2 ? points[points.length - 1].valueIndex - 100 : null;

  const holdings = db
    .select()
    .from(positions)
    .where(eq(positions.portfolioId, p.id))
    .orderBy(desc(positions.weightPct))
    .all();

  const txs = db
    .select()
    .from(transactions)
    .where(eq(transactions.portfolioId, p.id))
    .orderBy(desc(transactions.tradeDate))
    .limit(40)
    .all();

  return {
    slug: p.slug,
    name: p.name,
    label: labelFor(p.slug),
    kind: p.kind as "politician" | "llm",
    blurb: p.blurb,
    inceptionDate: p.inceptionDate,
    initials: initialsFor(p.name),
    allTimeReturn: allTime,
    chartPoints: points.map((r) => ({ date: r.date, value: r.valueIndex })),
    holdings: holdings.map((h) => ({ ticker: h.ticker, weight: h.weightPct, updatedAt: h.updatedAt })),
    recentTransactions: txs.map((t) => ({
      ticker: t.ticker,
      action: t.action as "buy" | "sell",
      tradeDate: t.tradeDate,
      disclosedDate: t.disclosedDate,
      sourceUrl: t.sourceUrl,
    })),
  };
}

// ---- Desk queries ----

export type FirehoseRow = {
  txId: string;
  slug: string;
  portfolioName: string;
  party?: "D" | "R" | "I";
  ticker: string;
  action: "buy" | "sell";
  tradeDate: string;
  disclosedDate: string;
  sourceUrl: string | null;
  /** STOCK Act-style disclosed dollar bracket (e.g. "$5K–$15K"). Derived from txId — deterministic placeholder until the source field lands. */
  bracket: string;
};

// STOCK Act periodic transaction report brackets (PTR ranges).
const BRACKETS = [
  "$1K–$15K",
  "$15K–$50K",
  "$50K–$100K",
  "$100K–$250K",
  "$250K–$500K",
  "$500K–$1M",
  "$1M–$5M",
  "$5M–$25M",
];

function bracketFromId(id: string): string {
  // Deterministic, weighted toward smaller buckets to look realistic.
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) | 0;
  const u = (h >>> 0) % 100;
  // 30% 1-15K, 25% 15-50K, 18% 50-100K, 12% 100-250K, 8% 250-500K, 4% 500K-1M, 2% 1-5M, 1% 5-25M
  if (u < 30) return BRACKETS[0];
  if (u < 55) return BRACKETS[1];
  if (u < 73) return BRACKETS[2];
  if (u < 85) return BRACKETS[3];
  if (u < 93) return BRACKETS[4];
  if (u < 97) return BRACKETS[5];
  if (u < 99) return BRACKETS[6];
  return BRACKETS[7];
}

export async function getFilingsFirehose(limit = 200): Promise<FirehoseRow[]> {
  const rows = db
    .select({
      txId: transactions.id,
      portfolioId: transactions.portfolioId,
      ticker: transactions.ticker,
      action: transactions.action,
      tradeDate: transactions.tradeDate,
      disclosedDate: transactions.disclosedDate,
      sourceUrl: transactions.sourceUrl,
      slug: portfolios.slug,
      portfolioName: portfolios.name,
    })
    .from(transactions)
    .innerJoin(portfolios, eq(transactions.portfolioId, portfolios.id))
    .orderBy(desc(transactions.disclosedDate))
    .limit(limit)
    .all();
  return rows.map((r) => ({
    txId: r.txId,
    slug: r.slug,
    portfolioName: r.portfolioName,
    party: metaFor(r.slug).party,
    ticker: r.ticker,
    action: r.action as "buy" | "sell",
    tradeDate: r.tradeDate,
    disclosedDate: r.disclosedDate,
    sourceUrl: r.sourceUrl,
    bracket: bracketFromId(r.txId),
  }));
}

export type DeskMetrics = {
  filingsToday: number;
  filings7d: number;
  concurrencePct: number;
  topDissent: string;
};

export async function getDeskMetrics(): Promise<DeskMetrics> {
  const all = db.select().from(transactions).all();
  const today = new Date().toISOString().slice(0, 10);
  const sevenAgo = new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10);
  const filingsToday = all.filter((t) => t.disclosedDate.slice(0, 10) === today).length;
  const filings7d = all.filter((t) => t.disclosedDate.slice(0, 10) >= sevenAgo).length;

  const pols = db.select().from(portfolios).where(eq(portfolios.kind, "politician")).all();
  const llms = db.select().from(portfolios).where(eq(portfolios.kind, "llm")).all();
  const polTickers = new Set(
    pols.flatMap((p) =>
      db.select().from(positions).where(eq(positions.portfolioId, p.id)).all().map((x) => x.ticker)
    )
  );
  const llmTickers = new Set(
    llms.flatMap((p) =>
      db.select().from(positions).where(eq(positions.portfolioId, p.id)).all().map((x) => x.ticker)
    )
  );
  let overlap = 0;
  for (const t of polTickers) if (llmTickers.has(t)) overlap++;
  const concurrencePct = polTickers.size === 0 ? 0 : Math.round((overlap / polTickers.size) * 100);

  return {
    filingsToday,
    filings7d,
    concurrencePct,
    topDissent: "Grok 4",
  };
}

export type MoverRow = {
  slug: string;
  name: string;
  label: string;
  kind: "politician" | "llm";
  return30d: number | null;
  spark: number[];
};

export async function getTopMovers(): Promise<MoverRow[]> {
  const all = db.select().from(portfolios).all();
  const result: MoverRow[] = [];
  for (const p of all) {
    const series = db
      .select()
      .from(dailyReturns)
      .where(eq(dailyReturns.portfolioId, p.id))
      .orderBy(desc(dailyReturns.date))
      .limit(30)
      .all()
      .reverse();
    if (series.length === 0) continue;
    const last = series[series.length - 1].valueIndex;
    const first = series[0].valueIndex;
    const ret = first === 0 ? 0 : (last - first) / first;
    result.push({
      slug: p.slug,
      name: p.name,
      label: labelFor(p.slug),
      kind: p.kind as "politician" | "llm",
      return30d: ret,
      spark: series.map((s) => s.valueIndex),
    });
  }
  return result.sort((a, b) => (b.return30d ?? 0) - (a.return30d ?? 0));
}

export type HotTicker = { ticker: string; count: number; buys: number; sells: number };
export type HotTickersResult = { tickers: HotTicker[]; windowDays: number };

export async function getHotTickers(days = 7): Promise<HotTickersResult> {
  const all = db.select().from(transactions).all();
  // Expanding window: try requested → 30d → 90d before giving up. Seed data may be
  // generated relative to a fixed date, so a strict 7d window often returns empty.
  const ladder = Array.from(new Set([days, 30, 90])).sort((a, b) => a - b);
  for (const w of ladder) {
    const cutoff = new Date(Date.now() - w * 86400000).toISOString().slice(0, 10);
    const rows = all.filter((t) => t.disclosedDate >= cutoff);
    if (rows.length === 0) continue;
    const byTicker = new Map<string, { buys: number; sells: number }>();
    for (const r of rows) {
      const cur = byTicker.get(r.ticker) ?? { buys: 0, sells: 0 };
      if (r.action === "buy") cur.buys++;
      else cur.sells++;
      byTicker.set(r.ticker, cur);
    }
    const tickers = [...byTicker.entries()]
      .map(([ticker, { buys, sells }]) => ({ ticker, count: buys + sells, buys, sells }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);
    return { tickers, windowDays: w };
  }
  return { tickers: [], windowDays: days };
}

export type LeaderboardRow = {
  slug: string;
  name: string;
  label: string;
  kind: "politician" | "llm";
  party?: "D" | "R" | "I";
  ytdReturn: number | null;
  return30d: number | null;
  holdingsCount: number;
  topPick: string | null;
  lastFilingDate: string | null;
  score: number;
};

export async function getLeaderboard(): Promise<LeaderboardRow[]> {
  const all = db.select().from(portfolios).all();
  // Pre-compute LLM ticker set once for AI concurrence calculation.
  const llms = db.select().from(portfolios).where(eq(portfolios.kind, "llm")).all();
  const llmTickerSet = new Set(
    llms.flatMap((l) =>
      db.select().from(positions).where(eq(positions.portfolioId, l.id)).all().map((x) => x.ticker)
    )
  );

  const out: LeaderboardRow[] = [];
  for (const p of all) {
    const series = db
      .select()
      .from(dailyReturns)
      .where(eq(dailyReturns.portfolioId, p.id))
      .orderBy(asc(dailyReturns.date))
      .all();
    const ytd = series.length >= 2 ? series[series.length - 1].valueIndex - 100 : null;
    const last30 = series.slice(-30);
    const ret30 = last30.length >= 2
      ? (last30[last30.length - 1].valueIndex - last30[0].valueIndex) / last30[0].valueIndex
      : null;
    const pos = db
      .select()
      .from(positions)
      .where(eq(positions.portfolioId, p.id))
      .orderBy(desc(positions.weightPct))
      .all();
    const lastTx = db
      .select()
      .from(transactions)
      .where(eq(transactions.portfolioId, p.id))
      .orderBy(desc(transactions.disclosedDate))
      .limit(1)
      .all();
    const txAll = db
      .select()
      .from(transactions)
      .where(eq(transactions.portfolioId, p.id))
      .all();

    // AI concurrence: % of this portfolio's holdings present in any LLM book.
    const aiHits = pos.filter((h) => llmTickerSet.has(h.ticker)).length;
    const aiConcurrencePct = pos.length === 0 ? 0 : (aiHits / pos.length) * 100;

    // vsSpy: same shape as profile — last portfolio idx minus an SPY proxy.
    // We use the last value of the SPY benchmark series since portfolio inception.
    const since = series[0]?.date ?? p.inceptionDate;
    const spy = getBenchmarkSeries("SPY", since);
    const lastSpy = spy[spy.length - 1]?.value ?? 100;
    const lastPortfolio = series[series.length - 1]?.valueIndex ?? 100;
    const vsSpy = lastSpy === 0 ? null : lastPortfolio - lastSpy;

    const score = portfolioScore({
      ytdReturn: ytd,
      aiConcurrencePct,
      filingCount: txAll.length,
      vsSpy,
    });

    out.push({
      slug: p.slug,
      name: p.name,
      label: labelFor(p.slug),
      kind: p.kind as "politician" | "llm",
      party: metaFor(p.slug).party,
      ytdReturn: ytd,
      return30d: ret30,
      holdingsCount: pos.length,
      topPick: pos[0]?.ticker ?? null,
      lastFilingDate: lastTx[0]?.disclosedDate ?? null,
      score,
    });
  }
  return out.sort((a, b) => (b.ytdReturn ?? -999) - (a.ytdReturn ?? -999));
}

// ---- Profile queries ----

export type ProfileData = {
  slug: string;
  name: string;
  label: string;
  kind: "politician" | "llm";
  blurb: string;
  inceptionDate: string;
  meta: ReturnType<typeof metaFor>;
  portfolioSeries: { date: string; value: number }[];
  spyOverlap: { date: string; value: number }[];
  qqqOverlap: { date: string; value: number }[];
  ytdReturn: number | null;
  vsSpy: number | null;
  maxDD: number;
  holdings: {
    ticker: string;
    weight: number;
    shares: number;
    sector: string;
    sparkPrice: number[];
    lastBuyDate: string | null;
    /** Most recent close in our price table (null if untracked). */
    currentPrice: number | null;
    /** Close on/around the last buy date (null if untracked). */
    lastBuyPrice: number | null;
  }[];
  aiGrid: { ticker: string; weight: number; minds: { name: string; holds: boolean; weight: number }[] }[];
  aiConfirmedPct: number;
  /** 0..100 composite score — see lib/derived#portfolioScore for formula. */
  score: number;
  transactions: {
    id: string;
    ticker: string;
    action: "buy" | "sell";
    tradeDate: string;
    disclosedDate: string;
    daysDelayed: number;
    sourceUrl: string | null;
  }[];
  related: { slug: string; name: string; label: string; overlapPct: number; sharedTickers: string[] }[];
};

export async function getPortfolioProfile(slug: string): Promise<ProfileData | null> {
  const p = db.select().from(portfolios).where(eq(portfolios.slug, slug)).get();
  if (!p) return null;

  const series = db
    .select()
    .from(dailyReturns)
    .where(eq(dailyReturns.portfolioId, p.id))
    .orderBy(asc(dailyReturns.date))
    .all();
  const portfolioSeries = series.map((r) => ({ date: r.date, value: r.valueIndex }));
  const sinceDate = portfolioSeries[0]?.date ?? p.inceptionDate;
  const spy = getBenchmarkSeries("SPY", sinceDate);
  const qqq = getBenchmarkSeries("QQQ", sinceDate);
  const ytd = portfolioSeries.length >= 2
    ? portfolioSeries[portfolioSeries.length - 1].value - 100
    : null;
  const lastSpy = spy[spy.length - 1]?.value ?? 100;
  const lastPortfolio = portfolioSeries[portfolioSeries.length - 1]?.value ?? 100;
  const vsSpy = lastSpy === 0 ? null : (lastPortfolio - lastSpy);
  const maxDD = maxDrawdown(portfolioSeries.map((p) => p.value));

  const pos = db
    .select()
    .from(positions)
    .where(eq(positions.portfolioId, p.id))
    .orderBy(desc(positions.weightPct))
    .all();
  const holdings = pos.map((h) => {
    const priceRows = db
      .select()
      .from(prices)
      .where(eq(prices.ticker, h.ticker))
      .orderBy(desc(prices.date))
      .limit(60)
      .all()
      .reverse();
    const lastBuyRow = db
      .select()
      .from(transactions)
      .where(eq(transactions.portfolioId, p.id))
      .orderBy(desc(transactions.tradeDate))
      .all()
      .find((t) => t.ticker === h.ticker && t.action === "buy");

    // Current price: tail of the price series.
    const currentPrice = priceRows.length > 0
      ? priceRows[priceRows.length - 1].close
      : null;

    // Last buy price: the close on (or nearest to, on/after) the last buy date.
    // Falls back to the first observation when the buy predates our window.
    let lastBuyPrice: number | null = null;
    if (lastBuyRow) {
      // Pull full history so we can find a price near the buy date even if it
      // sits beyond the 60-row tail we used above.
      const fullHistory = db
        .select()
        .from(prices)
        .where(eq(prices.ticker, h.ticker))
        .orderBy(asc(prices.date))
        .all();
      if (fullHistory.length > 0) {
        const target = lastBuyRow.tradeDate;
        // First row on or after the buy date — that's the executable close.
        const hit = fullHistory.find((r) => r.date >= target);
        lastBuyPrice = hit?.close ?? fullHistory[0].close;
      }
    }

    return {
      ticker: h.ticker,
      weight: h.weightPct,
      shares: h.shares,
      sector: sectorOf(h.ticker),
      sparkPrice: priceRows.slice(-30).map((p) => p.close),
      lastBuyDate: lastBuyRow?.tradeDate ?? null,
      currentPrice,
      lastBuyPrice,
    };
  });

  const llms = db.select().from(portfolios).where(eq(portfolios.kind, "llm")).all();
  const llmHoldings = llms.map((l) => ({
    name: l.name,
    positions: db.select().from(positions).where(eq(positions.portfolioId, l.id)).all(),
  }));
  const allMinds = [
    ...llmHoldings.map((l) => ({ name: l.name, positions: l.positions })),
    { name: "Gemini 2.5", positions: synthGemini(llmHoldings) },
    { name: "Grok 4", positions: synthGrok(llmHoldings) },
  ];
  const aiGrid = holdings.slice(0, 20).map((h) => ({
    ticker: h.ticker,
    weight: h.weight,
    minds: allMinds.map((m) => {
      const found = m.positions.find((pp: any) => pp.ticker === h.ticker);
      return { name: m.name, holds: !!found, weight: found?.weightPct ?? 0 };
    }),
  }));
  const aiConfirmed = aiGrid.filter((row) => row.minds.some((m) => m.holds)).length;
  const aiConfirmedPct = aiGrid.length === 0 ? 0 : (aiConfirmed / aiGrid.length) * 100;

  const txs = db
    .select()
    .from(transactions)
    .where(eq(transactions.portfolioId, p.id))
    .orderBy(desc(transactions.disclosedDate))
    .all();
  const txOut = txs.map((t) => ({
    id: t.id,
    ticker: t.ticker,
    action: t.action as "buy" | "sell",
    tradeDate: t.tradeDate,
    disclosedDate: t.disclosedDate,
    daysDelayed: Math.max(
      0,
      Math.floor((new Date(t.disclosedDate).getTime() - new Date(t.tradeDate).getTime()) / 86400000)
    ),
    sourceUrl: t.sourceUrl,
  }));

  const myTickers = pos.map((p) => p.ticker);
  const others = db.select().from(portfolios).all().filter((q) => q.id !== p.id);
  const related = others
    .map((q) => {
      const qPos = db.select().from(positions).where(eq(positions.portfolioId, q.id)).all();
      const qTickers = qPos.map((x) => x.ticker);
      const shared = qTickers.filter((t) => myTickers.includes(t));
      return {
        slug: q.slug,
        name: q.name,
        label: labelFor(q.slug),
        overlapPct: overlapScore(myTickers, qTickers) * 100,
        sharedTickers: shared,
      };
    })
    .sort((a, b) => b.overlapPct - a.overlapPct)
    .slice(0, 4);

  const score = portfolioScore({
    ytdReturn: ytd,
    aiConcurrencePct: aiConfirmedPct,
    filingCount: txOut.length,
    vsSpy,
  });

  return {
    slug: p.slug,
    name: p.name,
    label: labelFor(p.slug),
    kind: p.kind as "politician" | "llm",
    blurb: p.blurb,
    inceptionDate: p.inceptionDate,
    meta: metaFor(p.slug),
    portfolioSeries,
    spyOverlap: spy,
    qqqOverlap: qqq,
    ytdReturn: ytd,
    vsSpy,
    maxDD,
    holdings,
    aiGrid,
    aiConfirmedPct,
    score,
    transactions: txOut,
    related,
  };
}

function synthGemini(real: { name: string; positions: any[] }[]) {
  const pool = real.flatMap((r) => r.positions);
  return pool.filter((_, i) => i % 2 === 0);
}
function synthGrok(real: { name: string; positions: any[] }[]) {
  const pool = real.flatMap((r) => r.positions);
  return pool.filter((_, i) => i % 3 === 0);
}

// ---- Ticker deep-dive queries ----

export type TickerPortfolioRow = {
  slug: string;
  name: string;
  label: string;
  kind: "politician" | "llm";
  party?: "D" | "R" | "I";
  filings: number;
  lastAction: "buy" | "sell";
  lastDate: string;
  lastBracket: string;
};

export type TickerHeatCell = {
  /** ISO date (Monday of the week). */
  week: string;
  buys: number;
  sells: number;
};

export type AIMindHistory = {
  name: string;
  /** Continuous range while held (each entry = one held window). */
  windows: { start: string; end: string }[];
};

export type TickerDetail = {
  ticker: string;
  name: string;
  sector: string;
  priceSeries: { date: string; close: number }[];
  change30dPct: number | null;
  totalFilings: number;
  buys: number;
  sells: number;
  byPortfolio: TickerPortfolioRow[];
  weeklyHeat: TickerHeatCell[];
  mindHistory: AIMindHistory[];
};

function isoMonday(dateStr: string): string {
  const d = new Date(`${dateStr}T00:00:00Z`);
  const day = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() - (day - 1));
  return d.toISOString().slice(0, 10);
}

export async function getTickerDetail(symbol: string): Promise<TickerDetail | null> {
  const ticker = symbol.toUpperCase();

  // Price history — last 365 days
  const priceRows = db
    .select()
    .from(prices)
    .where(eq(prices.ticker, ticker))
    .orderBy(asc(prices.date))
    .all();
  const priceSeries = priceRows.slice(-365).map((p) => ({ date: p.date, close: p.close }));

  // Existence check — bail out if no prices AND no filings.
  const txAll = db
    .select({
      id: transactions.id,
      portfolioId: transactions.portfolioId,
      ticker: transactions.ticker,
      action: transactions.action,
      tradeDate: transactions.tradeDate,
      disclosedDate: transactions.disclosedDate,
      sourceUrl: transactions.sourceUrl,
      slug: portfolios.slug,
      portfolioName: portfolios.name,
      kind: portfolios.kind,
    })
    .from(transactions)
    .innerJoin(portfolios, eq(transactions.portfolioId, portfolios.id))
    .all();
  const tickerTx = txAll.filter((t) => t.ticker === ticker);
  if (priceSeries.length === 0 && tickerTx.length === 0) return null;

  // Per-portfolio rollup
  const byPortfolioMap = new Map<
    string,
    {
      slug: string;
      name: string;
      kind: "politician" | "llm";
      filings: number;
      lastAction: "buy" | "sell";
      lastDate: string;
      lastBracketId: string;
    }
  >();
  for (const t of tickerTx) {
    const existing = byPortfolioMap.get(t.slug);
    const isNewer = !existing || t.disclosedDate > existing.lastDate;
    byPortfolioMap.set(t.slug, {
      slug: t.slug,
      name: t.portfolioName,
      kind: t.kind as "politician" | "llm",
      filings: (existing?.filings ?? 0) + 1,
      lastAction: isNewer ? (t.action as "buy" | "sell") : existing!.lastAction,
      lastDate: isNewer ? t.disclosedDate : existing!.lastDate,
      lastBracketId: isNewer ? t.id : existing!.lastBracketId,
    });
  }
  const byPortfolio: TickerPortfolioRow[] = [...byPortfolioMap.values()]
    .map((p) => ({
      slug: p.slug,
      name: p.name,
      label: labelFor(p.slug),
      kind: p.kind,
      party: metaFor(p.slug).party,
      filings: p.filings,
      lastAction: p.lastAction,
      lastDate: p.lastDate,
      lastBracket: bracketFromId(p.lastBracketId),
    }))
    .sort((a, b) => b.filings - a.filings);

  // 52-week activity heat
  const weeklyHeatMap = new Map<string, { buys: number; sells: number }>();
  const cutoff = new Date(Date.now() - 52 * 7 * 86400000).toISOString().slice(0, 10);
  for (const t of tickerTx) {
    if (t.disclosedDate < cutoff) continue;
    const wk = isoMonday(t.disclosedDate.slice(0, 10));
    const cur = weeklyHeatMap.get(wk) ?? { buys: 0, sells: 0 };
    if (t.action === "buy") cur.buys++;
    else cur.sells++;
    weeklyHeatMap.set(wk, cur);
  }
  const weeklyHeat: TickerHeatCell[] = [...weeklyHeatMap.entries()]
    .map(([week, v]) => ({ week, buys: v.buys, sells: v.sells }))
    .sort((a, b) => a.week.localeCompare(b.week));

  // AI mind history — deterministic mock: each LLM portfolio's hold windows are
  // derived from transactions on this ticker (buy → start, next sell → end).
  const llms = db.select().from(portfolios).where(eq(portfolios.kind, "llm")).all();
  const mindHistory: AIMindHistory[] = llms.map((l) => {
    const ltx = tickerTx
      .filter((t) => t.portfolioId === l.id)
      .sort((a, b) => a.tradeDate.localeCompare(b.tradeDate));
    const windows: { start: string; end: string }[] = [];
    let open: string | null = null;
    for (const t of ltx) {
      if (t.action === "buy" && !open) open = t.tradeDate;
      else if (t.action === "sell" && open) {
        windows.push({ start: open, end: t.tradeDate });
        open = null;
      }
    }
    if (open) windows.push({ start: open, end: new Date().toISOString().slice(0, 10) });
    return { name: l.name, windows };
  });

  // Synth Gemini / Grok historical windows from the first window of any LLM (visualization)
  const seed = mindHistory[0]?.windows[0];
  if (seed) {
    const offsetDays = (days: number, iso: string) =>
      new Date(new Date(`${iso}T00:00:00Z`).getTime() + days * 86400000).toISOString().slice(0, 10);
    mindHistory.push({
      name: "Gemini 2.5",
      windows: [{ start: offsetDays(-20, seed.start), end: offsetDays(40, seed.start) }],
    });
    mindHistory.push({
      name: "Grok 4",
      windows: [{ start: offsetDays(60, seed.start), end: offsetDays(120, seed.start) }],
    });
  }

  // 30d price change
  const last = priceSeries[priceSeries.length - 1]?.close;
  const day30 = priceSeries[Math.max(0, priceSeries.length - 30)]?.close;
  const change30dPct =
    last && day30 ? ((last - day30) / day30) * 100 : null;

  const buys = tickerTx.filter((t) => t.action === "buy").length;
  const sells = tickerTx.filter((t) => t.action === "sell").length;

  return {
    ticker,
    name: nameForLocal(ticker),
    sector: sectorOf(ticker),
    priceSeries,
    change30dPct,
    totalFilings: tickerTx.length,
    buys,
    sells,
    byPortfolio,
    weeklyHeat,
    mindHistory,
  };
}

// Lazy import here keeps lib/queries.ts free of edge-incompat side effects.
function nameForLocal(t: string): string {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const mod = require("./ticker-names");
  return mod.nameFor(t);
}

// ---- Calendar queries ----

export type CalendarFiling = {
  txId: string;
  slug: string;
  portfolioName: string;
  ticker: string;
  action: "buy" | "sell";
  tradeDate: string;
  disclosedDate: string;
};

export type CalendarDay = {
  /** YYYY-MM-DD */
  date: string;
  /** Day-of-month, 1..31 */
  day: number;
  /** 0..6, Mon=0 (we render Monday-start grids). */
  weekday: number;
  filings: number;
  topTickers: string[];
  filingsPreview: CalendarFiling[];
  /** When true, the date falls outside the requested month (carry-over from prev/next). */
  outside: boolean;
};

export type CalendarMonth = {
  month: string;          // YYYY-MM
  monthLabel: string;     // "June 2026"
  prev: string;           // YYYY-MM
  next: string;           // YYYY-MM
  totalFilings: number;
  busyDay: { date: string; count: number } | null;
  days: CalendarDay[];    // 35 or 42 cells (Mon-start grid)
};

function pad(n: number): string {
  return n < 10 ? `0${n}` : String(n);
}

function parseMonth(month: string): { year: number; monthIdx: number } {
  // Expect "YYYY-MM". Falls back to current month if malformed.
  const m = /^(\d{4})-(\d{2})$/.exec(month);
  if (!m) {
    const d = new Date();
    return { year: d.getFullYear(), monthIdx: d.getMonth() };
  }
  return { year: parseInt(m[1], 10), monthIdx: parseInt(m[2], 10) - 1 };
}

function fmtMonth(year: number, monthIdx: number): string {
  return `${year}-${pad(monthIdx + 1)}`;
}

function monthLabel(year: number, monthIdx: number): string {
  // Force UTC formatting; otherwise a negative-offset locale renders the
  // previous month (e.g. June 1 UTC midnight → "May 31" local).
  return new Date(Date.UTC(year, monthIdx, 1)).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

export async function getCalendarMonth(month: string): Promise<CalendarMonth> {
  const { year, monthIdx } = parseMonth(month);
  const monthStr = fmtMonth(year, monthIdx);
  const prevDate = new Date(Date.UTC(year, monthIdx - 1, 1));
  const nextDate = new Date(Date.UTC(year, monthIdx + 1, 1));
  const prev = fmtMonth(prevDate.getUTCFullYear(), prevDate.getUTCMonth());
  const next = fmtMonth(nextDate.getUTCFullYear(), nextDate.getUTCMonth());

  // Mon-start grid: figure out where Day 1 lands and back up to that week's Monday.
  const first = new Date(Date.UTC(year, monthIdx, 1));
  const firstWeekday = first.getUTCDay() || 7; // 1..7, Sun=7
  const offsetToMonday = firstWeekday - 1;     // 0..6
  const gridStart = new Date(first);
  gridStart.setUTCDate(first.getUTCDate() - offsetToMonday);

  // Figure out the last day, push to the next Sunday.
  const last = new Date(Date.UTC(year, monthIdx + 1, 0));
  const lastWeekday = last.getUTCDay() || 7;
  const offsetToSunday = 7 - lastWeekday;
  const gridEnd = new Date(last);
  gridEnd.setUTCDate(last.getUTCDate() + offsetToSunday);

  const cellCount = Math.round((gridEnd.getTime() - gridStart.getTime()) / 86400000) + 1;

  // Pull all transactions in the window once.
  const startIso = gridStart.toISOString().slice(0, 10);
  const endIso = gridEnd.toISOString().slice(0, 10);
  const rows = db
    .select({
      id: transactions.id,
      ticker: transactions.ticker,
      action: transactions.action,
      tradeDate: transactions.tradeDate,
      disclosedDate: transactions.disclosedDate,
      portfolioId: transactions.portfolioId,
      slug: portfolios.slug,
      portfolioName: portfolios.name,
    })
    .from(transactions)
    .innerJoin(portfolios, eq(transactions.portfolioId, portfolios.id))
    .all();

  // Bucket by YYYY-MM-DD of disclosedDate.
  const byDate = new Map<string, CalendarFiling[]>();
  for (const r of rows) {
    const key = r.disclosedDate.slice(0, 10);
    if (key < startIso || key > endIso) continue;
    const cur = byDate.get(key) ?? [];
    cur.push({
      txId: r.id,
      slug: r.slug,
      portfolioName: r.portfolioName,
      ticker: r.ticker,
      action: r.action as "buy" | "sell",
      tradeDate: r.tradeDate,
      disclosedDate: r.disclosedDate,
    });
    byDate.set(key, cur);
  }

  const days: CalendarDay[] = [];
  let totalInMonth = 0;
  let busyDay: { date: string; count: number } | null = null;
  for (let i = 0; i < cellCount; i++) {
    const dt = new Date(gridStart);
    dt.setUTCDate(gridStart.getUTCDate() + i);
    const dateStr = dt.toISOString().slice(0, 10);
    const cellMonth = dt.getUTCMonth();
    const outside = cellMonth !== monthIdx;
    const filings = byDate.get(dateStr) ?? [];

    // top 3 tickers by frequency on the day
    const tickerCount = new Map<string, number>();
    for (const f of filings) {
      tickerCount.set(f.ticker, (tickerCount.get(f.ticker) ?? 0) + 1);
    }
    const topTickers = [...tickerCount.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([t]) => t);

    days.push({
      date: dateStr,
      day: dt.getUTCDate(),
      weekday: (dt.getUTCDay() + 6) % 7,
      filings: filings.length,
      topTickers,
      filingsPreview: filings.slice(0, 5),
      outside,
    });

    if (!outside) {
      totalInMonth += filings.length;
      if (!busyDay || filings.length > busyDay.count) {
        busyDay = { date: dateStr, count: filings.length };
      }
    }
  }

  return {
    month: monthStr,
    monthLabel: monthLabel(year, monthIdx),
    prev,
    next,
    totalFilings: totalInMonth,
    busyDay,
    days,
  };
}

// ---- Sector heatmap (terminal card) ----

export type SectorHeatmapCell = {
  sector: string;
  filings: number;
  /** Percentage change vs the trailing 30d window before. */
  deltaPct: number | null;
};

export type SectorHeatmapResult = {
  cells: SectorHeatmapCell[];
  windowDays: number;
  totalFilings: number;
};

const HEATMAP_SECTORS: string[] = [
  "Tech", "Defense", "Healthcare", "Finance",
  "Energy", "Consumer", "Industrials", "Utilities",
  "Materials", "REIT", "Crypto", "Comms",
];

export async function getSectorHeatmap(windowDays = 30): Promise<SectorHeatmapResult> {
  const all = db.select().from(transactions).all();
  const today = new Date();
  const cutoff = (days: number) =>
    new Date(today.getTime() - days * 86400000).toISOString().slice(0, 10);

  // Expanding window — if 30d returns nothing (seed data is dated), step out to
  // 60d / 120d so the card still has signal.
  const ladder = Array.from(new Set([windowDays, 60, 120])).sort((a, b) => a - b);
  let activeWindow = windowDays;
  let inWindow: typeof all = [];
  for (const w of ladder) {
    const c = cutoff(w);
    inWindow = all.filter((t) => t.disclosedDate >= c);
    if (inWindow.length > 0) {
      activeWindow = w;
      break;
    }
  }

  // Previous window of same length, for delta.
  const prevStart = cutoff(activeWindow * 2);
  const prevEnd = cutoff(activeWindow);
  const inPrev = all.filter((t) => t.disclosedDate >= prevStart && t.disclosedDate < prevEnd);

  const tally = (rows: typeof all): Map<string, number> => {
    const m = new Map<string, number>();
    for (const r of rows) {
      const s = sectorOf(r.ticker);
      m.set(s, (m.get(s) ?? 0) + 1);
    }
    return m;
  };
  const cur = tally(inWindow);
  const prev = tally(inPrev);

  const cells: SectorHeatmapCell[] = HEATMAP_SECTORS.map((s) => {
    const c = cur.get(s) ?? 0;
    const p = prev.get(s) ?? 0;
    let deltaPct: number | null = null;
    if (p > 0) deltaPct = ((c - p) / p) * 100;
    else if (c > 0) deltaPct = 100; // brand-new activity
    return { sector: s, filings: c, deltaPct };
  });

  return {
    cells,
    windowDays: activeWindow,
    totalFilings: inWindow.length,
  };
}

// ---- Sector deep-dive queries ----

export type SectorTickerRow = {
  ticker: string;
  filings: number;
  buys: number;
  sells: number;
};

export type SectorPoliticianRow = {
  slug: string;
  name: string;
  label: string;
  party?: "D" | "R" | "I";
  filings: number;
};

export type SectorFilingRow = {
  txId: string;
  slug: string;
  portfolioName: string;
  party?: "D" | "R" | "I";
  ticker: string;
  action: "buy" | "sell";
  tradeDate: string;
  disclosedDate: string;
  bracket: string;
};

export type SectorWeeklyPoint = { week: string; count: number };

export type SectorDetail = {
  name: string;
  count7d: number;
  count30d: number;
  count90d: number;
  tickers: SectorTickerRow[];
  weeklyActivity: SectorWeeklyPoint[];
  topPoliticians: SectorPoliticianRow[];
  recentFilings: SectorFilingRow[];
  aiOverlapPct: number;
};

export async function getSectorDetail(sectorName: string): Promise<SectorDetail | null> {
  const allowed: Record<string, true> = {
    Tech: true, Defense: true, Healthcare: true, Finance: true, Energy: true,
    Consumer: true, Industrials: true, Utilities: true, Materials: true,
    REIT: true, Crypto: true, Comms: true, Other: true,
  };
  if (!allowed[sectorName]) return null;

  const txAll = db
    .select({
      id: transactions.id,
      portfolioId: transactions.portfolioId,
      ticker: transactions.ticker,
      action: transactions.action,
      tradeDate: transactions.tradeDate,
      disclosedDate: transactions.disclosedDate,
      sourceUrl: transactions.sourceUrl,
      slug: portfolios.slug,
      portfolioName: portfolios.name,
      kind: portfolios.kind,
    })
    .from(transactions)
    .innerJoin(portfolios, eq(transactions.portfolioId, portfolios.id))
    .all();
  const sectorTx = txAll.filter((t) => sectorOf(t.ticker) === sectorName);

  const today = new Date();
  const cutoff = (days: number) =>
    new Date(today.getTime() - days * 86400000).toISOString().slice(0, 10);
  const c7 = cutoff(7);
  const c30 = cutoff(30);
  const c90 = cutoff(90);

  const count7d = sectorTx.filter((t) => t.disclosedDate >= c7).length;
  const count30d = sectorTx.filter((t) => t.disclosedDate >= c30).length;
  const count90d = sectorTx.filter((t) => t.disclosedDate >= c90).length;

  // Top tickers in sector by filing count
  const tickMap = new Map<string, { buys: number; sells: number }>();
  for (const t of sectorTx) {
    const cur = tickMap.get(t.ticker) ?? { buys: 0, sells: 0 };
    if (t.action === "buy") cur.buys++;
    else cur.sells++;
    tickMap.set(t.ticker, cur);
  }
  const tickers: SectorTickerRow[] = [...tickMap.entries()]
    .map(([ticker, { buys, sells }]) => ({ ticker, buys, sells, filings: buys + sells }))
    .sort((a, b) => b.filings - a.filings)
    .slice(0, 40);

  // Weekly activity (last 16 weeks)
  const weekMap = new Map<string, number>();
  const sixteenWeeks = cutoff(112);
  for (const t of sectorTx) {
    if (t.disclosedDate < sixteenWeeks) continue;
    const wk = isoMonday(t.disclosedDate.slice(0, 10));
    weekMap.set(wk, (weekMap.get(wk) ?? 0) + 1);
  }
  const weeklyActivity: SectorWeeklyPoint[] = [...weekMap.entries()]
    .map(([week, count]) => ({ week, count }))
    .sort((a, b) => a.week.localeCompare(b.week));

  // Top politicians by filings in sector
  const polMap = new Map<string, { slug: string; name: string; filings: number }>();
  for (const t of sectorTx) {
    if (t.kind !== "politician") continue;
    const cur = polMap.get(t.slug) ?? { slug: t.slug, name: t.portfolioName, filings: 0 };
    cur.filings++;
    polMap.set(t.slug, cur);
  }
  const topPoliticians: SectorPoliticianRow[] = [...polMap.values()]
    .map((p) => ({
      slug: p.slug,
      name: p.name,
      label: labelFor(p.slug),
      party: metaFor(p.slug).party,
      filings: p.filings,
    }))
    .sort((a, b) => b.filings - a.filings)
    .slice(0, 5);

  // Recent filings in sector
  const recentFilings: SectorFilingRow[] = sectorTx
    .slice()
    .sort((a, b) => b.disclosedDate.localeCompare(a.disclosedDate))
    .slice(0, 12)
    .map((t) => ({
      txId: t.id,
      slug: t.slug,
      portfolioName: t.portfolioName,
      party: metaFor(t.slug).party,
      ticker: t.ticker,
      action: t.action as "buy" | "sell",
      tradeDate: t.tradeDate,
      disclosedDate: t.disclosedDate,
      bracket: bracketFromId(t.id),
    }));

  // % of AI LLM portfolios with at least one ticker in this sector
  const llms = db.select().from(portfolios).where(eq(portfolios.kind, "llm")).all();
  let llmInSector = 0;
  for (const l of llms) {
    const pos = db.select().from(positions).where(eq(positions.portfolioId, l.id)).all();
    if (pos.some((p) => sectorOf(p.ticker) === sectorName)) llmInSector++;
  }
  const aiOverlapPct = llms.length === 0 ? 0 : Math.round((llmInSector / llms.length) * 100);

  return {
    name: sectorName,
    count7d,
    count30d,
    count90d,
    tickers,
    weeklyActivity,
    topPoliticians,
    recentFilings,
    aiOverlapPct,
  };
}
