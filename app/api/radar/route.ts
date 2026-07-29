// app/api/radar/route.ts
import { NextResponse } from "next/server";
import { db, portfolios, positions, transactions } from "@/lib/db";
import { asc } from "drizzle-orm";
import { sectorOf, SECTOR_COLORS, type Sector } from "@/lib/sectors";

export const revalidate = 60;

export type RadarSector = {
  sector: Sector;
  color: string;
  count7d: number;
  count30d: number;
  count90d: number;
  netBuys: number; // buys - sells in window
  topTicker: string | null;
  weeklyCounts: number[]; // recent 8 weeks
  contributors: string[]; // portfolio slugs
};

export type RadarPolitician = {
  slug: string;
  name: string;
  kind: "politician" | "llm";
  color: string;
  sectorWeights: { sector: Sector; weight: number }[];
};

export type RadarResponse = {
  timeframes: { days: number; label: "7d" | "30d" | "90d" }[];
  sectors: RadarSector[];
  politicians: RadarPolitician[];
};

const SECTORS_LIST: Sector[] = [
  "Tech",
  "Comms",
  "Defense",
  "Healthcare",
  "Finance",
  "Energy",
  "Consumer",
  "Industrials",
  "Utilities",
  "Materials",
  "REIT",
  "Crypto",
];

// Distinct polygon colors per politician. Stable order.
const POL_COLORS: Record<string, string> = {
  pelosi: "#7C5FFF", // violet
  greene: "#F87171", // red
  gottheimer: "#60A5FA", // blue
  hern: "#F7D24A", // yellow
  gpt: "#34D399", // green
  claude: "#EC4899", // pink
};

function daysAgoIso(d: number): string {
  return new Date(Date.now() - d * 86400000).toISOString().slice(0, 10);
}

export async function GET() {
  const allPortfolios = db.select().from(portfolios).all();
  const slugById = new Map(allPortfolios.map((p) => [p.id, p.slug]));

  const allTxs = db
    .select()
    .from(transactions)
    .orderBy(asc(transactions.disclosedDate))
    .all();

  const today7 = daysAgoIso(7);
  const today30 = daysAgoIso(30);
  const today90 = daysAgoIso(90);

  // Sector buckets
  const bySector = new Map<Sector, {
    txs7: typeof allTxs;
    txs30: typeof allTxs;
    txs90: typeof allTxs;
  }>();
  for (const s of SECTORS_LIST) bySector.set(s, { txs7: [], txs30: [], txs90: [] });

  for (const t of allTxs) {
    const s = sectorOf(t.ticker);
    if (s === "Other") continue;
    const bucket = bySector.get(s);
    if (!bucket) continue;
    if (t.disclosedDate >= today90) bucket.txs90.push(t);
    if (t.disclosedDate >= today30) bucket.txs30.push(t);
    if (t.disclosedDate >= today7) bucket.txs7.push(t);
  }

  const sectors: RadarSector[] = [];
  for (const s of SECTORS_LIST) {
    const b = bySector.get(s)!;
    // top ticker by frequency in 30d window
    const tickerCount = new Map<string, number>();
    for (const t of b.txs30) {
      tickerCount.set(t.ticker, (tickerCount.get(t.ticker) ?? 0) + 1);
    }
    const top = [...tickerCount.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;

    // contributors: which portfolios filed in this sector (30d)
    const contributors = Array.from(
      new Set(b.txs30.map((t) => slugById.get(t.portfolioId)).filter(Boolean) as string[]),
    );

    // weekly sparkline: last 8 weeks
    const weekly: number[] = [];
    for (let wk = 7; wk >= 0; wk--) {
      const start = daysAgoIso((wk + 1) * 7);
      const end = daysAgoIso(wk * 7);
      const n = b.txs90.filter((t) => t.disclosedDate >= start && t.disclosedDate < end).length;
      weekly.push(n);
    }

    const buys = b.txs30.filter((t) => t.action === "buy").length;
    const sells = b.txs30.filter((t) => t.action === "sell").length;

    sectors.push({
      sector: s,
      color: SECTOR_COLORS[s],
      count7d: b.txs7.length,
      count30d: b.txs30.length,
      count90d: b.txs90.length,
      netBuys: buys - sells,
      topTicker: top,
      weeklyCounts: weekly,
      contributors,
    });
  }

  // Politician polygons: each portfolio's sector weight breakdown
  const allPos = db.select().from(positions).all();
  const posByPortfolio = new Map<string, typeof allPos>();
  for (const p of allPos) {
    const arr = posByPortfolio.get(p.portfolioId) ?? [];
    arr.push(p);
    posByPortfolio.set(p.portfolioId, arr);
  }

  const politicians: RadarPolitician[] = allPortfolios.map((p) => {
    const myPos = posByPortfolio.get(p.id) ?? [];
    const sectorMap = new Map<Sector, number>();
    for (const s of SECTORS_LIST) sectorMap.set(s, 0);
    for (const pos of myPos) {
      const s = sectorOf(pos.ticker);
      if (s === "Other") continue;
      sectorMap.set(s, (sectorMap.get(s) ?? 0) + pos.weightPct);
    }
    return {
      slug: p.slug,
      name: p.name,
      kind: p.kind as "politician" | "llm",
      color: POL_COLORS[p.slug] ?? "#fff",
      sectorWeights: SECTORS_LIST.map((s) => ({
        sector: s,
        weight: sectorMap.get(s) ?? 0,
      })),
    };
  });

  const out: RadarResponse = {
    timeframes: [
      { days: 7, label: "7d" },
      { days: 30, label: "30d" },
      { days: 90, label: "90d" },
    ],
    sectors,
    politicians,
  };
  return NextResponse.json(out);
}
