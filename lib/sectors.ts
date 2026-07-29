// lib/sectors.ts
export type Sector =
  | "Tech" | "Defense" | "Healthcare" | "Finance" | "Energy"
  | "Consumer" | "Industrials" | "Utilities" | "Materials"
  | "REIT" | "Crypto" | "Comms" | "Other";

const MAP: Record<string, Sector> = {
  // Tech
  NVDA: "Tech", MSFT: "Tech", AAPL: "Tech", GOOGL: "Tech", GOOG: "Tech",
  META: "Tech", AMZN: "Tech", AVGO: "Tech", AMD: "Tech", INTC: "Tech",
  ORCL: "Tech", CRM: "Tech", ADBE: "Tech", NOW: "Tech", SNOW: "Tech",
  PLTR: "Tech", PANW: "Tech", CRWD: "Tech", NET: "Tech", ASML: "Tech",
  TSM: "Tech", MU: "Tech", QCOM: "Tech", TXN: "Tech", ADI: "Tech",
  AMAT: "Tech", LRCX: "Tech", IBM: "Tech", CSCO: "Tech", DELL: "Tech",
  HPQ: "Tech", APP: "Tech", DASH: "Tech", SHOP: "Tech", UBER: "Tech",
  ABNB: "Tech", SPOT: "Tech", BKNG: "Tech", WDAY: "Tech", INTU: "Tech",
  // Comms
  T: "Comms", VZ: "Comms", CMCSA: "Comms", NFLX: "Comms", DIS: "Comms",
  // Defense
  LMT: "Defense", RTX: "Defense", NOC: "Defense", GEV: "Defense", BA: "Defense",
  // Healthcare
  UNH: "Healthcare", LLY: "Healthcare", JNJ: "Healthcare", PFE: "Healthcare",
  ABT: "Healthcare", MRK: "Healthcare", TMO: "Healthcare", ABBV: "Healthcare",
  GILD: "Healthcare", AMGN: "Healthcare", REGN: "Healthcare", ISRG: "Healthcare",
  MDT: "Healthcare", BSX: "Healthcare", EW: "Healthcare", DXCM: "Healthcare",
  MRNA: "Healthcare", BNTX: "Healthcare", HCA: "Healthcare", VRT: "Healthcare",
  // Finance
  JPM: "Finance", BAC: "Finance", GS: "Finance", MS: "Finance", SCHW: "Finance",
  BLK: "Finance", V: "Finance", MA: "Finance", AXP: "Finance", PYPL: "Finance",
  SQ: "Finance", CB: "Finance", PGR: "Finance", ICE: "Finance", BRK: "Finance",
  "BRK.B": "Finance", KKR: "Finance", BX: "Finance",
  // Energy
  XOM: "Energy", CVX: "Energy", COP: "Energy", OXY: "Energy", SHEL: "Energy",
  BP: "Energy", DVN: "Energy", PXD: "Energy", LNG: "Energy", FSLR: "Energy",
  // Consumer
  WMT: "Consumer", COST: "Consumer", HD: "Consumer", LOW: "Consumer", TGT: "Consumer",
  MCD: "Consumer", SBUX: "Consumer", NKE: "Consumer", LULU: "Consumer", PG: "Consumer",
  KO: "Consumer", PEP: "Consumer", TSLA: "Consumer", F: "Consumer", GM: "Consumer",
  // Industrials
  CAT: "Industrials", DE: "Industrials", UNP: "Industrials", UPS: "Industrials",
  FDX: "Industrials", CSX: "Industrials", NSC: "Industrials", ETN: "Industrials",
  EMR: "Industrials", MMM: "Industrials", HON: "Industrials", GE: "Industrials",
  // Utilities
  NEE: "Utilities", DUK: "Utilities", SO: "Utilities", D: "Utilities",
  EXC: "Utilities", VST: "Utilities",
  // Materials
  LIN: "Materials", APD: "Materials", FCX: "Materials", SCCO: "Materials",
  MLM: "Materials", RIO: "Materials", BHP: "Materials",
  // REIT
  PLD: "REIT", CCI: "REIT", DLR: "REIT", STAG: "REIT", IRT: "REIT", ADC: "REIT",
  // Crypto / digital assets
  IBIT: "Crypto",
};

export function sectorOf(ticker: string): Sector {
  return MAP[ticker] ?? "Other";
}

export const SECTOR_COLORS: Record<Sector, string> = {
  Tech:        "#7C5FFF",
  Comms:       "#A78BFA",
  Defense:     "#F7D24A",
  Healthcare:  "#4ADE80",
  Finance:     "#60A5FA",
  Energy:      "#F59E0B",
  Consumer:    "#EC4899",
  Industrials: "#94A3B8",
  Utilities:   "#34D399",
  Materials:   "#A16207",
  REIT:        "#14B8A6",
  Crypto:      "#F0B429",
  Other:       "rgba(255,255,255,0.20)",
};
