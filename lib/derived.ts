// lib/derived.ts
export function maxDrawdown(series: number[]): number {
  if (series.length < 2) return 0;
  let peak = series[0];
  let maxDD = 0;
  for (const v of series) {
    if (v > peak) peak = v;
    const dd = (v - peak) / peak;
    if (dd < maxDD) maxDD = dd;
  }
  return maxDD;
}

export function overlapScore(a: string[], b: string[]): number {
  if (a.length === 0 && b.length === 0) return 0;
  const A = new Set(a);
  const B = new Set(b);
  let intersection = 0;
  for (const t of A) if (B.has(t)) intersection++;
  const union = A.size + B.size - intersection;
  return union === 0 ? 0 : intersection / union;
}

export function aiConcurrence(
  holdings: { ticker: string; weight: number }[],
  llmPortfolios: { ticker: string; weight: number }[][]
): number {
  if (holdings.length === 0) return 0;
  const llmTickers = new Set(llmPortfolios.flatMap((p) => p.map((h) => h.ticker)));
  const matched = holdings.filter((h) => llmTickers.has(h.ticker)).length;
  return matched / holdings.length;
}

export function normalizeSeries(
  series: { date: string; close: number }[]
): { date: string; value: number }[] {
  if (series.length === 0) return [];
  const base = series[0].close;
  return series.map((p) => ({ date: p.date, value: (p.close / base) * 100 }));
}

/**
 * Composite portfolio score 0–100. Weighted blend of return, AI agreement,
 * filing activity, and alpha vs SPY. Designed to surface "well-rounded" books
 * — a high return with poor AI agreement and zero filings still scores below
 * a moderate-return portfolio with broad AI consensus and active filings.
 */
export function portfolioScore({
  ytdReturn,
  aiConcurrencePct,
  filingCount,
  vsSpy,
}: {
  ytdReturn: number | null;
  aiConcurrencePct: number;
  filingCount: number;
  vsSpy: number | null;
}): number {
  // Return component (40%) — map ±50% to 0..100, centered at 50.
  const ytd = ytdReturn ?? 0;
  const returnPart = clamp(50 + (ytd / 50) * 50, 0, 100);

  // AI agreement (25%) — already 0..100.
  const aiPart = clamp(aiConcurrencePct, 0, 100);

  // Activity (15%) — 0..50 filings maps to 0..100.
  const activityPart = clamp((filingCount / 50) * 100, 0, 100);

  // Alpha (20%) — ±25pp maps to 0..100 centered at 50.
  const vs = vsSpy ?? 0;
  const alphaPart = clamp(50 + (vs / 25) * 50, 0, 100);

  const raw =
    returnPart * 0.4 + aiPart * 0.25 + activityPart * 0.15 + alphaPart * 0.2;
  return Math.round(clamp(raw, 0, 100));
}

function clamp(v: number, lo: number, hi: number): number {
  if (v < lo) return lo;
  if (v > hi) return hi;
  return v;
}

/** Color-band helper for the score ring — violet 80+, yellow 60-79, dim <60. */
export function scoreBand(score: number): "high" | "mid" | "low" {
  if (score >= 80) return "high";
  if (score >= 60) return "mid";
  return "low";
}
