// tests/derived.test.ts
import { describe, it, expect } from "vitest";
import { maxDrawdown, overlapScore, aiConcurrence, normalizeSeries } from "@/lib/derived";

describe("maxDrawdown", () => {
  it("returns 0 for monotonic increases", () => {
    expect(maxDrawdown([100, 105, 110, 120])).toBe(0);
  });
  it("returns negative percentage of largest peak-to-trough", () => {
    expect(maxDrawdown([100, 120, 90, 110])).toBeCloseTo(-0.25, 4);
  });
  it("handles empty/single point", () => {
    expect(maxDrawdown([])).toBe(0);
    expect(maxDrawdown([100])).toBe(0);
  });
});

describe("overlapScore", () => {
  it("returns 1 for identical sets", () => {
    expect(overlapScore(["AAPL", "MSFT"], ["AAPL", "MSFT"])).toBe(1);
  });
  it("returns 0 for disjoint sets", () => {
    expect(overlapScore(["AAPL"], ["MSFT"])).toBe(0);
  });
  it("Jaccard for partial overlap", () => {
    expect(overlapScore(["AAPL", "NVDA", "MSFT"], ["AAPL", "NVDA", "GOOGL"])).toBe(0.5);
  });
});

describe("aiConcurrence", () => {
  it("returns fraction of holdings that any LLM also holds", () => {
    const pol = [{ ticker: "NVDA", weight: 10 }, { ticker: "TSLA", weight: 5 }, { ticker: "F", weight: 3 }];
    const llms = [[{ ticker: "NVDA", weight: 12 }], [{ ticker: "AAPL", weight: 8 }]];
    expect(aiConcurrence(pol, llms)).toBeCloseTo(1 / 3, 4);
  });
  it("returns 0 for empty holdings", () => {
    expect(aiConcurrence([], [[{ ticker: "AAPL", weight: 10 }]])).toBe(0);
  });
});

describe("normalizeSeries", () => {
  it("rebases to 100 at first point", () => {
    const out = normalizeSeries([{ date: "2025-01-01", close: 200 }, { date: "2025-01-02", close: 220 }]);
    expect(out[0].value).toBe(100);
    expect(out[1].value).toBeCloseTo(110, 4);
  });
});
