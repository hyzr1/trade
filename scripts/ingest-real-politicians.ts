// scripts/ingest-real-politicians.ts
//
// One-shot: ingest real US House PTR data for the 4 politician portfolios,
// backfill Yahoo prices for every ticker that appears, and recompute returns.

import "dotenv/config";
import { db, portfolios, positions, snapshots, transactions, dailyReturns } from "../lib/db";
import { eq } from "drizzle-orm";
import {
  downloadAndParseIndex,
  ingestHousePoliticianReal,
  type TargetRep,
} from "../lib/ingest/house-clerk";
import { backfillPrices } from "../lib/pricing";
import { recomputeFor } from "../lib/returns";

// Locked-in lineup based on PTR volume + parseable-PDF availability.
const REPS: TargetRep[] = [
  { slug: "pelosi",     last: "Pelosi",     stateDst: "CA11" },
  { slug: "greene",     last: "Greene",     stateDst: "GA14" },
  { slug: "gottheimer", last: "Gottheimer", stateDst: "NJ05" },
  { slug: "hern",       last: "Hern",       stateDst: "OK01" },
];

// Portfolio metadata for fresh seed.
const PORTFOLIO_META: Record<string, { name: string; blurb: string; inception: string }> = {
  pelosi: {
    name: "Nancy Pelosi",
    blurb:
      "Speaker Emerita and US Representative for California's 11th district (San Francisco). One of the most-watched members of Congress for stock activity. Trades disclosed under the STOCK Act.",
    inception: "2024-01-01",
  },
  greene: {
    name: "Marjorie Taylor Greene",
    blurb:
      "US Representative for Georgia's 14th district. Active trader with frequent PTR filings spanning equities, bonds, and short-term Treasuries.",
    inception: "2024-01-01",
  },
  gottheimer: {
    name: "Josh Gottheimer",
    blurb:
      "US Representative for New Jersey's 5th district. Trades through a Morgan Stanley UMA account; disclosures show frequent rebalances across large-cap equities.",
    inception: "2024-01-01",
  },
  hern: {
    name: "Kevin Hern",
    blurb:
      "US Representative for Oklahoma's 1st district and Chair of the Republican Study Committee. Active trader with disclosures across equities, ETFs, and corporate bonds.",
    inception: "2024-01-01",
  },
};

async function ensurePortfolioRows() {
  for (const rep of REPS) {
    const meta = PORTFOLIO_META[rep.slug];
    db.insert(portfolios).values({
      id: rep.slug,
      slug: rep.slug,
      name: meta.name,
      kind: "politician",
      sourceId: `house-clerk:${rep.stateDst}`,
      blurb: meta.blurb,
      inceptionDate: meta.inception,
    }).onConflictDoUpdate({
      target: portfolios.id,
      set: {
        name: meta.name,
        sourceId: `house-clerk:${rep.stateDst}`,
        blurb: meta.blurb,
        inceptionDate: meta.inception,
      },
    }).run();
  }

  // Remove portfolios that are no longer part of the lineup.
  // Must cascade-delete dependent rows first since foreign_keys=ON.
  const keep = new Set([...REPS.map((r) => r.slug), "gpt", "claude"]);
  const all = db.select().from(portfolios).all();
  for (const p of all) {
    if (!keep.has(p.id)) {
      console.log(`removing legacy portfolio: ${p.slug}`);
      db.delete(dailyReturns).where(eq(dailyReturns.portfolioId, p.id)).run();
      db.delete(transactions).where(eq(transactions.portfolioId, p.id)).run();
      db.delete(snapshots).where(eq(snapshots.portfolioId, p.id)).run();
      db.delete(positions).where(eq(positions.portfolioId, p.id)).run();
      db.delete(portfolios).where(eq(portfolios.id, p.id)).run();
    }
  }
}

async function main() {
  console.log("==> ensuring portfolio rows…");
  await ensurePortfolioRows();

  console.log("==> downloading and parsing FD index for 2024 / 2025 / 2026…");
  const index = await downloadAndParseIndex(["2024", "2025", "2026"]);
  console.log(`    total filings indexed: ${index.length}`);

  console.log("==> ingesting PTRs (most recent 30 per rep)…");
  for (const rep of REPS) {
    process.stdout.write(`    ${rep.slug.padEnd(12)} … `);
    const r = await ingestHousePoliticianReal(rep, index, { maxPtrs: 30 });
    console.log(
      `${r.ptrsFound} PTRs found, ${r.ptrsParsed} parsed, ${r.transactionsAdded} txns ` +
      `(${r.stockTransactions} stock, ${r.optionTransactions} option), ${r.ptrsSkipped} skipped`
    );
    if (r.errors.length > 0) {
      for (const e of r.errors.slice(0, 5)) console.log(`        - ${e}`);
      if (r.errors.length > 5) console.log(`        … and ${r.errors.length - 5} more`);
    }
  }

  console.log("==> backfilling prices for every ticker that appears…");
  const tickerSet = new Set<string>();
  const allTx = db.select().from(transactions).all();
  for (const t of allTx) tickerSet.add(t.ticker);
  // Benchmark ETFs for chart overlay (SPY = S&P 500, QQQ = Nasdaq-100).
  tickerSet.add("SPY");
  tickerSet.add("QQQ");
  console.log(`    ${tickerSet.size} unique tickers across all portfolios`);
  await backfillPrices([...tickerSet], "2024-01-01");

  console.log("==> recomputing returns for every portfolio…");
  const all = db.select().from(portfolios).all();
  for (const p of all) {
    await recomputeFor(p.id);
    console.log(`    recomputed ${p.slug}`);
  }

  console.log("==> done.");
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
