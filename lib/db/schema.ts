// lib/db/schema.ts
import { sqliteTable, text, real, integer, primaryKey, uniqueIndex } from "drizzle-orm/sqlite-core";

export const portfolios = sqliteTable("portfolios", {
  id: text("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  kind: text("kind", { enum: ["politician", "llm"] }).notNull(),
  sourceId: text("source_id").notNull(),
  blurb: text("blurb").notNull(),
  inceptionDate: text("inception_date").notNull(),
  createdAt: text("created_at").notNull().$defaultFn(() => new Date().toISOString()),
});

export const positions = sqliteTable("positions", {
  portfolioId: text("portfolio_id").notNull().references(() => portfolios.id),
  ticker: text("ticker").notNull(),
  weightPct: real("weight_pct").notNull(),
  shares: real("shares").notNull(),
  updatedAt: text("updated_at").notNull(),
}, (t) => ({ pk: primaryKey({ columns: [t.portfolioId, t.ticker] }) }));

export const snapshots = sqliteTable("snapshots", {
  id: text("id").primaryKey(),
  portfolioId: text("portfolio_id").notNull().references(() => portfolios.id),
  snapshotDate: text("snapshot_date").notNull(),
  holdingsJson: text("holdings_json").notNull(),
}, (t) => ({ uniq: uniqueIndex("snap_portfolio_date").on(t.portfolioId, t.snapshotDate) }));

export const transactions = sqliteTable("transactions", {
  id: text("id").primaryKey(),
  portfolioId: text("portfolio_id").notNull().references(() => portfolios.id),
  ticker: text("ticker").notNull(),
  action: text("action", { enum: ["buy", "sell"] }).notNull(),
  tradeDate: text("trade_date").notNull(),
  disclosedDate: text("disclosed_date").notNull(),
  sourceUrl: text("source_url"),
  createdAt: text("created_at").notNull().$defaultFn(() => new Date().toISOString()),
});

export const prices = sqliteTable("prices", {
  ticker: text("ticker").notNull(),
  date: text("date").notNull(),
  close: real("close").notNull(),
  stale: integer("stale").notNull().default(0),
}, (t) => ({ pk: primaryKey({ columns: [t.ticker, t.date] }) }));

export const dailyReturns = sqliteTable("daily_returns", {
  portfolioId: text("portfolio_id").notNull().references(() => portfolios.id),
  date: text("date").notNull(),
  valueIndex: real("value_index").notNull(),
  dailyPct: real("daily_pct").notNull(),
}, (t) => ({ pk: primaryKey({ columns: [t.portfolioId, t.date] }) }));

export type Portfolio = typeof portfolios.$inferSelect;
export type Position = typeof positions.$inferSelect;
export type Snapshot = typeof snapshots.$inferSelect;
export type Transaction = typeof transactions.$inferSelect;
export type Price = typeof prices.$inferSelect;
export type DailyReturn = typeof dailyReturns.$inferSelect;
