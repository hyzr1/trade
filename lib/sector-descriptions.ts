// lib/sector-descriptions.ts
// One-paragraph context blurbs per sector, surfaced on /sector/[name].
// Kept short and editorial — not a glossary entry, more like a 30-second
// orientation from a market-desk colleague.
import type { Sector } from "./sectors";

export type SectorDescription = {
  /** Short headline phrase under the title — 6-10 words. */
  tagline: string;
  /** Single-paragraph blurb — 1-3 sentences. */
  blurb: string;
  /** Representative tickers shown inline. */
  examples: string[];
};

export const SECTOR_DESCRIPTIONS: Record<Sector, SectorDescription> = {
  Tech: {
    tagline: "Software, semiconductors, internet platforms.",
    blurb:
      "Where most lawmaker filings concentrate. Datacenter capex, AI infrastructure, and consumer internet drive almost every concentrated bet on the desk.",
    examples: ["NVDA", "MSFT", "AAPL", "GOOGL", "META"],
  },
  Defense: {
    tagline: "Primes, missile systems, defense electronics.",
    blurb:
      "Tightly correlated with appropriations cycles and committee assignments. House Armed Services members file here twice as often as the average rep.",
    examples: ["LMT", "RTX", "NOC", "GEV", "BA"],
  },
  Healthcare: {
    tagline: "Pharma, devices, biotech, payors.",
    blurb:
      "Heavily watched around drug-pricing legislation and FDA milestones. A handful of senators on HELP have outsized filings cadence here.",
    examples: ["UNH", "LLY", "JNJ", "PFE", "ABBV"],
  },
  Finance: {
    tagline: "Banks, payments, asset managers.",
    blurb:
      "Senate Banking and House Financial Services members file disproportionately. Rate-sensitive — clusters around FOMC dates.",
    examples: ["JPM", "BAC", "GS", "V", "MA"],
  },
  Energy: {
    tagline: "Oil, gas, renewables, utilities-adjacent.",
    blurb:
      "Geographic concentration: Texas, Louisiana, Oklahoma delegations dominate. Commodity-cycle driven, with sharp filings spikes around OPEC meetings.",
    examples: ["XOM", "CVX", "COP", "OXY", "FSLR"],
  },
  Consumer: {
    tagline: "Retail, restaurants, autos, staples.",
    blurb:
      "The broadest sector by ticker count. Useful as a sentiment proxy — when reps rotate from staples into discretionary, risk-on signals tend to follow.",
    examples: ["WMT", "COST", "TSLA", "NKE", "KO"],
  },
  Industrials: {
    tagline: "Machinery, transports, aerospace.",
    blurb:
      "Cyclical leaders. Disclosures cluster around infrastructure bills and tariff news — a useful sentiment read on capex.",
    examples: ["CAT", "DE", "UNP", "GE", "HON"],
  },
  Utilities: {
    tagline: "Power, water, regulated yield.",
    blurb:
      "Lowest filings cadence of any sector. When a member does file here, it usually signals a state-level regulatory or rate-case event.",
    examples: ["NEE", "DUK", "SO", "D", "EXC"],
  },
  Materials: {
    tagline: "Chemicals, mining, building products.",
    blurb:
      "Quiet under normal conditions, spikes on commodity supercycles. Watch for senators from mining-heavy states stepping in early.",
    examples: ["LIN", "APD", "FCX", "RIO", "BHP"],
  },
  REIT: {
    tagline: "Data centers, industrial, residential REITs.",
    blurb:
      "Filings concentrated in data-center REITs and industrial logistics. A canary on AI infrastructure demand and onshoring.",
    examples: ["PLD", "CCI", "DLR", "STAG", "ADC"],
  },
  Crypto: {
    tagline: "Digital-asset products and ETPs.",
    blurb:
      "Newest category on the desk. Filings here are rare but politically loud — a small sample, watch the trade-disclosure timing closely.",
    examples: ["IBIT"],
  },
  Comms: {
    tagline: "Telecom, streaming, legacy media.",
    blurb:
      "Slow-moving incumbents alongside high-volatility streamers. Often shows up in 'safe yield' bracket buys from longer-tenured members.",
    examples: ["NFLX", "DIS", "VZ", "T", "CMCSA"],
  },
  Other: {
    tagline: "Everything we haven't tagged yet.",
    blurb:
      "Catch-all bucket for tickers without a sector assignment in our map. We add coverage continuously — if this is large, expect it to shrink.",
    examples: [],
  },
};

export function describeSector(name: string): SectorDescription {
  if (name in SECTOR_DESCRIPTIONS) {
    return SECTOR_DESCRIPTIONS[name as Sector];
  }
  return SECTOR_DESCRIPTIONS.Other;
}
