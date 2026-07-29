# Hyzr Trade

A research terminal for exploring stock trades disclosed by members of the United States Congress and comparing their portfolios with market benchmarks and model-generated portfolios.

Hyzr Trade turns public PTR filings into a searchable, source-linked research product rather than a collection of PDFs. It includes ingestion, normalization, portfolio reconstruction, return calculations, and a responsive interface for investigating activity.

Part of the Hyzr product family. Repository: `trade`. Reserved address: `trade.hyzr.ai`.

## Highlights

- House Clerk PTR ingestion and PDF parsing
- Source-linked transaction history for every imported filing
- Reconstructed holdings, snapshots, prices, and daily return series
- Portfolio performance against SPY and QQQ
- Filing firehose with party, chamber, ticker, and time filters
- Side-by-side portfolio comparison and configurable backtests
- Cluster radar for unusual multi-member ticker activity
- Watchlists, alerts, saved views, and onboarding
- Search command palette and responsive mobile navigation
- Google authentication through NextAuth

## Product areas

| Route | Purpose |
| --- | --- |
| `/terminal` | Market overview, filings, consensus, movers, and leaderboard |
| `/[slug]` | Holdings, returns, transactions, scorecards, and related portfolios |
| `/compare` | Compare several portfolios on the same timeline |
| `/backtest` | Simulate a disclosure-date strategy |
| `/radar` | Find clusters of related congressional activity |
| `/calendar` | Explore disclosures over time |
| `/ticker/[symbol]` | Ticker-specific activity and portfolio exposure |
| `/sector/[name]` | Sector-level concentration and flows |

## Architecture

| Area | Implementation |
| --- | --- |
| Application | Next.js 16, React 19, TypeScript |
| Database | SQLite with Drizzle ORM |
| Market data | Yahoo Finance |
| Disclosure data | House Clerk PTR filings |
| Parsing | ZIP and PDF ingestion with Cheerio and pdf-parse |
| Visualization | Recharts, Three.js, GSAP, Framer Motion |
| Authentication | NextAuth |
| Testing | Vitest |

The data model keeps portfolios, positions, immutable snapshots, transactions, prices, and daily returns separate. That makes every chart traceable back to a source filing and allows returns to be recomputed when ingestion logic changes.

## Run locally

Requirements: Node.js 22+ and npm.

```bash
npm install
copy .env.example .env.local
npm run db:migrate
npm run seed
npm run dev
```

The application uses local SQLite by default. Real OAuth, scheduled ingestion, and live model portfolio generation require additional environment variables.

## Data commands

```bash
npm run db:generate   # generate Drizzle migrations
npm run db:migrate    # apply migrations
npm run seed          # create baseline portfolio records
npm run backfill      # process historical disclosure data
```

## Validation

```bash
npm test
npm run build
```

## Important limitations

- Congressional disclosures are delayed and contain value ranges rather than exact position sizes.
- A disclosure-date backtest is not the same as trading when the original transaction occurred.
- Model portfolios are a comparison feature, not financial advice.
- The project does not connect to a brokerage or execute trades.

## Status

The ingestion pipeline, database, terminal, profile pages, comparison tools, backtest, radar, authentication, and responsive application shell are implemented. A public release still requires production credential configuration and deployment hardening.

---

A project by [Kaylem](https://github.com/hyzr1).
