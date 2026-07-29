// lib/ingest/politicians.ts
import * as cheerio from "cheerio";
import { db, portfolios, positions, snapshots, transactions } from "../db";
import { eq } from "drizzle-orm";
import { randomUUID } from "node:crypto";
import { recomputeFor } from "../returns";

export type ParsedTrade = {
  ticker: string;
  action: "buy" | "sell";
  tradeDate: string;
  disclosedDate: string;
};

export function parseCapitolTradesHtml(html: string): ParsedTrade[] {
  const $ = cheerio.load(html);
  const out: ParsedTrade[] = [];
  $("tr.q-tr").each((_, el) => {
    const ticker = $(el).find(".issuer-ticker").first().text().trim();
    const dates = $(el).find(".q-cell").map((_, d) => $(d).text().trim()).get();
    const action = $(el).find(".tx-type").first().text().trim().toLowerCase();
    if (!ticker || dates.length < 2 || (action !== "buy" && action !== "sell")) return;
    out.push({ ticker, action: action as "buy" | "sell", tradeDate: dates[0], disclosedDate: dates[1] });
  });
  return out;
}

async function fetchPoliticianTradesHtml(slug: string): Promise<string> {
  const url = `https://www.capitoltrades.com/politicians/${slug}`;
  const res = await fetch(url, { headers: { "User-Agent": "autotrade/1.0 (research)" } });
  if (!res.ok) throw new Error(`capitoltrades fetch failed: ${res.status}`);
  return res.text();
}

export async function ingestPolitician(portfolioId: string): Promise<void> {
  const portfolio = db.select().from(portfolios).where(eq(portfolios.id, portfolioId)).get();
  if (!portfolio || portfolio.kind !== "politician") throw new Error(`unknown politician portfolio: ${portfolioId}`);

  const html = await fetchPoliticianTradesHtml(portfolio.slug);
  const trades = parseCapitolTradesHtml(html);

  // Insert transactions we haven't seen (dedupe by ticker+tradeDate+disclosedDate+action).
  const existing = db.select().from(transactions).where(eq(transactions.portfolioId, portfolioId)).all();
  const seen = new Set(existing.map((t) => `${t.ticker}|${t.tradeDate}|${t.disclosedDate}|${t.action}`));

  for (const t of trades) {
    const key = `${t.ticker}|${t.tradeDate}|${t.disclosedDate}|${t.action}`;
    if (seen.has(key)) continue;
    db.insert(transactions).values({
      id: randomUUID(), portfolioId, ticker: t.ticker, action: t.action,
      tradeDate: t.tradeDate, disclosedDate: t.disclosedDate,
      sourceUrl: `https://www.capitoltrades.com/politicians/${portfolio.slug}`,
    }).run();
  }

  // Rebuild current positions by replaying all transactions in trade_date order (equal-weight approximation).
  const allTx = db.select().from(transactions).where(eq(transactions.portfolioId, portfolioId)).all()
    .sort((a, b) => a.tradeDate.localeCompare(b.tradeDate));
  const held = new Set<string>();
  for (const t of allTx) {
    if (t.action === "buy") held.add(t.ticker);
    else held.delete(t.ticker);
  }
  const weight = held.size > 0 ? 100 / held.size : 0;
  const today = new Date().toISOString().slice(0, 10);
  db.delete(positions).where(eq(positions.portfolioId, portfolioId)).run();
  for (const ticker of held) {
    db.insert(positions).values({
      portfolioId, ticker, weightPct: weight, shares: weight, updatedAt: today,
    }).run();
  }

  // Daily snapshot.
  const holdings = Object.fromEntries([...held].map((t) => [t, weight]));
  db.insert(snapshots).values({
    id: randomUUID(), portfolioId, snapshotDate: today, holdingsJson: JSON.stringify(holdings),
  }).onConflictDoNothing().run();

  await recomputeFor(portfolioId);
}
