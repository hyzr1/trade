// tests/llms.test.ts
import { describe, it, expect, beforeEach } from "vitest";
import { db, portfolios, positions, snapshots, transactions } from "../lib/db";
import { eq } from "drizzle-orm";
import { rebalanceLLM } from "../lib/ingest/llms";

describe("rebalanceLLM (mock mode)", () => {
  const pid = "gpt";

  beforeEach(() => {
    db.delete(transactions).where(eq(transactions.portfolioId, pid)).run();
    db.delete(snapshots).where(eq(snapshots.portfolioId, pid)).run();
    db.delete(positions).where(eq(positions.portfolioId, pid)).run();
  });

  it("writes a snapshot and updates positions from fixture", async () => {
    process.env.ENABLE_LLM_API = "false";
    await rebalanceLLM(pid, "2025-06-02");
    const snaps = db.select().from(snapshots).where(eq(snapshots.portfolioId, pid)).all();
    expect(snaps).toHaveLength(1);
    expect(snaps[0].snapshotDate).toBe("2025-06-02");
    const holdings = JSON.parse(snaps[0].holdingsJson);
    const sum = Object.values(holdings).reduce((a: number, b: any) => a + b, 0);
    expect(sum).toBeCloseTo(100, 1);
    const pos = db.select().from(positions).where(eq(positions.portfolioId, pid)).all();
    expect(pos.length).toBeGreaterThan(0);
  });

  it("writes 'buy' transactions for every ticker on first rebalance", async () => {
    process.env.ENABLE_LLM_API = "false";
    await rebalanceLLM(pid, "2025-06-02");
    const txs = db.select().from(transactions).where(eq(transactions.portfolioId, pid)).all();
    expect(txs.length).toBeGreaterThan(0);
    expect(txs.every((t) => t.action === "buy")).toBe(true);
  });
});
