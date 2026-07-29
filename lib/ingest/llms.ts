// lib/ingest/llms.ts
import { db, portfolios, positions, snapshots, transactions } from "../db";
import { eq } from "drizzle-orm";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { randomUUID } from "node:crypto";
import { recomputeFor } from "../returns";

type Holdings = Record<string, number>;

function loadMockHoldings(slug: string): Holdings {
  const path = join(process.cwd(), "fixtures", `llm-${slug}.json`);
  const arr = JSON.parse(readFileSync(path, "utf-8")) as Holdings[];
  const existingCount = db.select().from(snapshots).where(eq(snapshots.portfolioId, slug)).all().length;
  return arr[existingCount % arr.length];
}

async function fetchLiveHoldings(_slug: string): Promise<Holdings> {
  // TODO future: call OpenAI/Anthropic SDK and parse JSON response.
  throw new Error("live LLM mode not implemented yet");
}

export async function rebalanceLLM(portfolioId: string, date: string): Promise<void> {
  const portfolio = db.select().from(portfolios).where(eq(portfolios.id, portfolioId)).get();
  if (!portfolio || portfolio.kind !== "llm") throw new Error(`unknown LLM portfolio: ${portfolioId}`);

  const useLive = process.env.ENABLE_LLM_API === "true";
  const holdings = useLive ? await fetchLiveHoldings(portfolio.slug) : loadMockHoldings(portfolio.slug);

  const total = Object.values(holdings).reduce((a, b) => a + b, 0);
  if (Math.abs(total - 100) > 1) throw new Error(`LLM holdings do not sum to 100: ${total}`);

  // Diff against current positions → write transactions.
  const current = db.select().from(positions).where(eq(positions.portfolioId, portfolioId)).all();
  const currentMap = new Map(current.map((p) => [p.ticker, p.weightPct]));
  for (const [ticker, weight] of Object.entries(holdings)) {
    const prev = currentMap.get(ticker) ?? 0;
    if (weight > prev) {
      db.insert(transactions).values({
        id: randomUUID(), portfolioId, ticker, action: "buy",
        tradeDate: date, disclosedDate: date, sourceUrl: null,
      }).run();
    }
  }
  for (const p of current) {
    if (!(p.ticker in holdings)) {
      db.insert(transactions).values({
        id: randomUUID(), portfolioId, ticker: p.ticker, action: "sell",
        tradeDate: date, disclosedDate: date, sourceUrl: null,
      }).run();
    }
  }

  // Replace positions.
  db.delete(positions).where(eq(positions.portfolioId, portfolioId)).run();
  for (const [ticker, weight] of Object.entries(holdings)) {
    db.insert(positions).values({
      portfolioId, ticker, weightPct: weight, shares: weight, updatedAt: date,
    }).run();
  }

  // Write snapshot.
  db.insert(snapshots).values({
    id: randomUUID(), portfolioId, snapshotDate: date, holdingsJson: JSON.stringify(holdings),
  }).onConflictDoNothing().run();

  await recomputeFor(portfolioId);
}
