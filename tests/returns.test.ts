// tests/returns.test.ts
import { describe, it, expect, beforeEach } from "vitest";
import { db, portfolios, snapshots, prices, dailyReturns } from "../lib/db";
import { eq } from "drizzle-orm";
import { recomputeFor } from "../lib/returns";

describe("recomputeFor", () => {
  const pid = "test-port";

  beforeEach(() => {
    db.delete(dailyReturns).where(eq(dailyReturns.portfolioId, pid)).run();
    db.delete(snapshots).where(eq(snapshots.portfolioId, pid)).run();
    db.delete(portfolios).where(eq(portfolios.id, pid)).run();
    db.delete(prices).where(eq(prices.ticker, "AAA")).run();
    db.delete(prices).where(eq(prices.ticker, "BBB")).run();
    db.insert(portfolios).values({
      id: pid, slug: pid, name: "Test", kind: "politician",
      sourceId: "x", blurb: "x", inceptionDate: "2025-01-01",
    }).run();
  });

  it("indexes value to 100 on inception and scales by weighted price change", async () => {
    // 50/50 holdings in AAA and BBB. Day 1: AAA=10, BBB=20. Day 2: AAA=11, BBB=20. → +5%.
    db.insert(snapshots).values({
      id: "s1", portfolioId: pid, snapshotDate: "2025-01-01",
      holdingsJson: JSON.stringify({ AAA: 50, BBB: 50 }),
    }).run();
    db.insert(prices).values({ ticker: "AAA", date: "2025-01-01", close: 10, stale: 0 }).run();
    db.insert(prices).values({ ticker: "BBB", date: "2025-01-01", close: 20, stale: 0 }).run();
    db.insert(prices).values({ ticker: "AAA", date: "2025-01-02", close: 11, stale: 0 }).run();
    db.insert(prices).values({ ticker: "BBB", date: "2025-01-02", close: 20, stale: 0 }).run();

    await recomputeFor(pid);

    const rows = db.select().from(dailyReturns).where(eq(dailyReturns.portfolioId, pid)).all()
      .sort((a, b) => a.date.localeCompare(b.date));
    expect(rows).toHaveLength(2);
    expect(rows[0].valueIndex).toBeCloseTo(100, 5);
    expect(rows[1].valueIndex).toBeCloseTo(105, 5);
    expect(rows[1].dailyPct).toBeCloseTo(5, 5);
  });
});
