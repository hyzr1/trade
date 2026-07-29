// tests/pricing.test.ts
import { describe, it, expect, beforeEach } from "vitest";
import { db, prices } from "../lib/db";
import { eq } from "drizzle-orm";
import { getDailyClose } from "../lib/pricing";

describe("getDailyClose", () => {
  beforeEach(() => {
    db.delete(prices).where(eq(prices.ticker, "TEST")).run();
  });

  it("returns cached price without hitting network if present", async () => {
    db.insert(prices).values({ ticker: "TEST", date: "2025-01-02", close: 123.45, stale: 0 }).run();
    const result = await getDailyClose("TEST", "2025-01-02");
    expect(result).toBe(123.45);
  });
});
