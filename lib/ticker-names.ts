// lib/ticker-names.ts
// Compact map of common ticker symbols → company names.
// Falls back to the ticker itself when unknown.

const NAMES: Record<string, string> = {
  // Mega-cap tech
  NVDA: "NVIDIA Corporation",
  MSFT: "Microsoft Corporation",
  AAPL: "Apple Inc.",
  GOOGL: "Alphabet Inc.",
  GOOG: "Alphabet Inc.",
  META: "Meta Platforms",
  AMZN: "Amazon.com",
  AVGO: "Broadcom Inc.",
  AMD: "Advanced Micro Devices",
  INTC: "Intel Corporation",
  ORCL: "Oracle Corporation",
  CRM: "Salesforce, Inc.",
  ADBE: "Adobe Inc.",
  NOW: "ServiceNow, Inc.",
  SNOW: "Snowflake Inc.",
  PLTR: "Palantir Technologies",
  PANW: "Palo Alto Networks",
  CRWD: "CrowdStrike Holdings",
  NET: "Cloudflare, Inc.",
  ASML: "ASML Holding",
  TSM: "Taiwan Semiconductor",
  MU: "Micron Technology",
  QCOM: "QUALCOMM Inc.",
  TXN: "Texas Instruments",
  ADI: "Analog Devices",
  AMAT: "Applied Materials",
  LRCX: "Lam Research",
  IBM: "International Business Machines",
  CSCO: "Cisco Systems",
  DELL: "Dell Technologies",
  HPQ: "HP Inc.",
  APP: "AppLovin Corporation",
  DASH: "DoorDash, Inc.",
  SHOP: "Shopify Inc.",
  UBER: "Uber Technologies",
  ABNB: "Airbnb, Inc.",
  SPOT: "Spotify Technology",
  BKNG: "Booking Holdings",
  WDAY: "Workday, Inc.",
  INTU: "Intuit Inc.",

  // Comms / media
  T: "AT&T Inc.",
  VZ: "Verizon Communications",
  CMCSA: "Comcast Corporation",
  NFLX: "Netflix, Inc.",
  DIS: "The Walt Disney Company",

  // Defense
  LMT: "Lockheed Martin",
  RTX: "RTX Corporation",
  NOC: "Northrop Grumman",
  GEV: "GE Vernova",
  BA: "The Boeing Company",

  // Healthcare
  UNH: "UnitedHealth Group",
  LLY: "Eli Lilly and Company",
  JNJ: "Johnson & Johnson",
  PFE: "Pfizer Inc.",
  ABT: "Abbott Laboratories",
  MRK: "Merck & Co.",
  TMO: "Thermo Fisher Scientific",
  ABBV: "AbbVie Inc.",
  GILD: "Gilead Sciences",
  AMGN: "Amgen Inc.",

  // Finance
  JPM: "JPMorgan Chase",
  BAC: "Bank of America",
  GS: "Goldman Sachs",
  MS: "Morgan Stanley",
  SCHW: "Charles Schwab",
  BLK: "BlackRock, Inc.",
  V: "Visa Inc.",
  MA: "Mastercard Inc.",
  AXP: "American Express",
  PYPL: "PayPal Holdings",

  // Energy
  XOM: "Exxon Mobil",
  CVX: "Chevron Corporation",
  COP: "ConocoPhillips",
  OXY: "Occidental Petroleum",
  SHEL: "Shell plc",
  BP: "BP p.l.c.",
  FSLR: "First Solar, Inc.",

  // Consumer
  WMT: "Walmart Inc.",
  COST: "Costco Wholesale",
  HD: "The Home Depot",
  TGT: "Target Corporation",
  MCD: "McDonald's Corporation",
  SBUX: "Starbucks Corporation",
  NKE: "Nike, Inc.",
  TSLA: "Tesla, Inc.",
  PG: "Procter & Gamble",
  KO: "The Coca-Cola Company",
  PEP: "PepsiCo, Inc.",
  F: "Ford Motor Company",
  GM: "General Motors",

  // Industrials
  CAT: "Caterpillar Inc.",
  DE: "Deere & Company",
  UNP: "Union Pacific",
  GE: "GE Aerospace",
  HON: "Honeywell International",

  // Crypto
  IBIT: "iShares Bitcoin Trust",
};

export function nameFor(ticker: string): string {
  return NAMES[ticker.toUpperCase()] ?? ticker.toUpperCase();
}

export function hasName(ticker: string): boolean {
  return ticker.toUpperCase() in NAMES;
}
