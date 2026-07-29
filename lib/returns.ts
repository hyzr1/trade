// lib/returns.ts
//
// Compute a daily value-index for each portfolio from snapshots + prices.
//
// Methodology — rolling rebalance:
//   - The portfolio is indexed to 100 on its first snapshot day.
//   - On every snapshot date, holdings rebalance to the new weights; the
//     *value* carries forward. We do NOT normalize each ticker to a single
//     global inception price (that would phantom-boost the index whenever a
//     new ticker gets added mid-life).
//   - Within a snapshot's lifespan, each ticker contributes
//     (weight_pct / 100) × (price_today / price_at_rebalance_date) to the
//     portfolio's growth factor. Multiply by the index value at rebalance.
//
// Edge cases:
//   - If a snapshot date is a weekend / holiday, we use the next available
//     trading day's price as the rebalance reference.
//   - If a ticker has no price data at all in the date range, we omit it
//     from that snapshot's weighting and renormalise the remaining weights
//     so the basket still sums to 1.
import { db, snapshots, prices, dailyReturns } from "./db";
import { and, eq, gte, lte } from "drizzle-orm";

type Holdings = Record<string, number>;

export async function recomputeFor(portfolioId: string): Promise<void> {
  const allSnaps = db
    .select()
    .from(snapshots)
    .where(eq(snapshots.portfolioId, portfolioId))
    .all()
    .sort((a, b) => a.snapshotDate.localeCompare(b.snapshotDate));

  if (allSnaps.length === 0) return;

  const startDate = allSnaps[0].snapshotDate;
  const endDate = new Date().toISOString().slice(0, 10);

  // Collect every ticker referenced anywhere across all snapshots.
  const tickers = new Set<string>();
  for (const s of allSnaps) {
    for (const t of Object.keys(JSON.parse(s.holdingsJson) as Holdings)) {
      tickers.add(t);
    }
  }

  // Load every price for those tickers across the date range.
  const allPrices = db
    .select()
    .from(prices)
    .where(and(gte(prices.date, startDate), lte(prices.date, endDate)))
    .all();

  // priceMap: ticker → (date → close)
  const priceMap = new Map<string, Map<string, number>>();
  for (const p of allPrices) {
    if (!tickers.has(p.ticker)) continue;
    if (!priceMap.has(p.ticker)) priceMap.set(p.ticker, new Map());
    priceMap.get(p.ticker)!.set(p.date, p.close);
  }

  // All dates with at least one price; sorted ascending.
  const dateSet = new Set<string>();
  for (const t of tickers) {
    for (const d of priceMap.get(t)?.keys() ?? []) dateSet.add(d);
  }
  const sortedDates = [...dateSet].sort();
  if (sortedDates.length === 0) return;

  // For a snapshot date that's a weekend / holiday, find the first trading
  // day on or after it that actually has prices for at least one ticker we
  // care about. We use that day's prices as the rebalance reference.
  function refDateForSnapshot(snapDate: string): string | null {
    for (let i = 0; i < sortedDates.length; i++) {
      if (sortedDates[i] >= snapDate) return sortedDates[i];
    }
    return null;
  }

  // Pre-resolve, per snapshot: the reference date and per-ticker reference
  // price (the close on the reference date). Renormalize weights to drop
  // tickers we have no price for at all.
  type ResolvedSnap = {
    snapshotDate: string;
    refDate: string;
    weights: Record<string, number>;   // renormalized so values sum to 1
    refPrices: Record<string, number>;
  };
  const resolved: ResolvedSnap[] = [];
  for (const s of allSnaps) {
    const refDate = refDateForSnapshot(s.snapshotDate);
    if (!refDate) continue;
    const holdings = JSON.parse(s.holdingsJson) as Holdings;
    const refPrices: Record<string, number> = {};
    const surviving: Record<string, number> = {};
    let sum = 0;
    for (const [t, w] of Object.entries(holdings)) {
      const p = priceMap.get(t)?.get(refDate);
      if (p == null) continue;
      refPrices[t] = p;
      surviving[t] = w;
      sum += w;
    }
    if (sum === 0) continue;
    const weights: Record<string, number> = {};
    for (const [t, w] of Object.entries(surviving)) weights[t] = w / sum;
    resolved.push({ snapshotDate: s.snapshotDate, refDate, weights, refPrices });
  }
  if (resolved.length === 0) return;

  // Clear prior returns rows.
  db.delete(dailyReturns).where(eq(dailyReturns.portfolioId, portfolioId)).run();

  // Walk dates. For each date, find the active snapshot (the most recent one
  // whose refDate <= date). When the active snapshot changes, anchor the new
  // snapshot at the current portfolio value.
  let snapIdx = 0;
  let snapBaseValueIndex = 100; // value when current snapshot took effect
  let prevValueIndex: number | null = null;

  for (const date of sortedDates) {
    // Skip dates before the first snapshot's reference date.
    if (date < resolved[0].refDate) continue;

    // Advance snapIdx to the latest snapshot whose refDate <= date.
    while (
      snapIdx + 1 < resolved.length &&
      resolved[snapIdx + 1].refDate <= date
    ) {
      // Transitioning to a new snapshot. The "base" is whatever the
      // portfolio is worth right now under the *previous* snapshot, computed
      // at the new snapshot's reference date.
      if (prevValueIndex != null) snapBaseValueIndex = prevValueIndex;
      snapIdx++;
    }

    const snap = resolved[snapIdx];

    // Compute the basket growth factor since this snapshot took effect.
    let factor = 0;
    let anyPrice = false;
    for (const [t, w] of Object.entries(snap.weights)) {
      const pToday = priceMap.get(t)?.get(date);
      const p0 = snap.refPrices[t];
      if (pToday == null || p0 == null || p0 === 0) continue;
      factor += w * (pToday / p0);
      anyPrice = true;
    }
    if (!anyPrice) continue;

    const valueIndex = snapBaseValueIndex * factor;
    const dailyPct =
      prevValueIndex == null ? 0 : ((valueIndex - prevValueIndex) / prevValueIndex) * 100;

    db.insert(dailyReturns).values({ portfolioId, date, valueIndex, dailyPct }).run();
    prevValueIndex = valueIndex;
  }
}
