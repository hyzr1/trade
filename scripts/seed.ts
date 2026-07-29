// scripts/seed.ts
//
// Insert the portfolio rows. Real PTR data and prices are populated by
// `scripts/ingest-real-politicians.ts`. Mock LLM portfolios are populated by
// hitting the /api/cron/llms endpoint.

import "dotenv/config";
import { db, portfolios } from "../lib/db";

const rows = [
  {
    id: "pelosi", slug: "pelosi", name: "Nancy Pelosi", kind: "politician" as const,
    sourceId: "house-clerk:CA11",
    blurb: "Speaker Emerita and US Representative for California's 11th district (San Francisco). One of the most-watched members of Congress for stock activity. Trades disclosed under the STOCK Act.",
    inceptionDate: "2024-01-01",
  },
  {
    id: "greene", slug: "greene", name: "Marjorie Taylor Greene", kind: "politician" as const,
    sourceId: "house-clerk:GA14",
    blurb: "US Representative for Georgia's 14th district. Active trader with frequent PTR filings spanning equities, bonds, and short-term Treasuries.",
    inceptionDate: "2024-01-01",
  },
  {
    id: "gottheimer", slug: "gottheimer", name: "Josh Gottheimer", kind: "politician" as const,
    sourceId: "house-clerk:NJ05",
    blurb: "US Representative for New Jersey's 5th district. Trades through a Morgan Stanley UMA account; disclosures show frequent rebalances across large-cap equities.",
    inceptionDate: "2024-01-01",
  },
  {
    id: "hern", slug: "hern", name: "Kevin Hern", kind: "politician" as const,
    sourceId: "house-clerk:OK01",
    blurb: "US Representative for Oklahoma's 1st district and Chair of the Republican Study Committee. Active trader with disclosures across equities, ETFs, and corporate bonds.",
    inceptionDate: "2024-01-01",
  },
  {
    id: "gpt", slug: "gpt", name: "GPT Portfolio", kind: "llm" as const,
    sourceId: "gpt-5",
    blurb: "Weekly portfolio constructed by OpenAI's GPT-5 model. Rebalances every Monday.",
    inceptionDate: new Date().toISOString().slice(0, 10),
  },
  {
    id: "claude", slug: "claude", name: "Claude Portfolio", kind: "llm" as const,
    sourceId: "claude-opus-4-7",
    blurb: "Weekly portfolio constructed by Anthropic's Claude model. Rebalances every Monday.",
    inceptionDate: new Date().toISOString().slice(0, 10),
  },
];

for (const row of rows) {
  db.insert(portfolios).values(row).onConflictDoNothing().run();
}
console.log(`seeded ${rows.length} portfolios`);
process.exit(0);
