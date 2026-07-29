// lib/insights-mock.ts
// Mock generator for /insights. Deterministic per ISO week — pick the same
// week and you get the same copy. Pick a different week and the rotation kicks
// in. No real model calls. All names + tickers reference autotrade's seeded
// portfolios so the page never feels hollow.

export type InsightsSection = {
  weekLabel: string;
  weekStartIso: string;
  weekEndIso: string;
  filingsIndexed: number;

  whatMoved: string[];
  dissents: { title: string; body: string }[];
  rotation: { incoming: { name: string; delta: string }[]; outgoing: { name: string; delta: string }[] };

  portfolios: PortfolioMemo[];
  anomalies: AnomalyCard[];
  crossAsset: CrossAssetPoint[];
};

export type PortfolioMemo = {
  slug: string;
  name: string;
  label: string;
  paragraph: string;
  stats: { label: string; value: string; positive?: boolean | null }[];
};

export type AnomalyCard = {
  emoji: string;
  headline: string;
  body: string;
  /** Display tag, e.g. "37 lawmakers" */
  tag: string;
  /** "Cluster", "Dissent", "Sector rotation", etc. */
  kind: string;
  score: number;
};

export type CrossAssetPoint = {
  sector: string;
  filings: number;
  /** -1..1 sentiment skew (buy-heavy = +) */
  netBuy: number;
  /** Headline news anchor, e.g. "Fed minutes" */
  anchor: string;
};

/* ───────────────────────── ISO week helpers ───────────────────────── */

function isoWeekKey(d: Date): string {
  // YYYY-Www. Used as the deterministic seed.
  const date = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  const day = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((date.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  return `${date.getUTCFullYear()}-W${String(weekNo).padStart(2, "0")}`;
}

function weekRange(d: Date): { start: Date; end: Date; label: string } {
  // Monday → Sunday window.
  const dt = new Date(d);
  const day = dt.getDay() || 7;
  const start = new Date(dt);
  start.setDate(dt.getDate() - (day - 1));
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  const mShort = (x: Date) => x.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  const label =
    start.getMonth() === end.getMonth()
      ? `Week of ${start.toLocaleDateString("en-US", { month: "short" })} ${start.getDate()}–${end.getDate()}`
      : `Week of ${mShort(start)} – ${mShort(end)}`;
  return { start, end, label };
}

/* Deterministic PRNG seeded by ISO week key. mulberry32. */
function seededRng(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6D2B79F5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hash(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) | 0;
  return h;
}

function pick<T>(arr: T[], rng: () => number): T {
  return arr[Math.floor(rng() * arr.length)];
}

function pickN<T>(arr: T[], n: number, rng: () => number): T[] {
  const pool = arr.slice();
  const out: T[] = [];
  while (out.length < n && pool.length > 0) {
    const idx = Math.floor(rng() * pool.length);
    out.push(pool[idx]);
    pool.splice(idx, 1);
  }
  return out;
}

/* ───────────────────────── Source phrases ───────────────────────── */

const TRENDS = [
  "Semis exposure rotated up across three House portfolios while the Senate stayed cautious.",
  "Defense names — LMT, RTX, NOC — saw their largest cluster of bipartisan buys since November.",
  "Healthcare landed three notable trims, all in mega-cap biotech, signaling profit-taking after the LLY rip.",
  "The AI minds' consensus on AVGO tightened to 4/4 — the first unanimous hold since GOOGL.",
  "Pelosi's NVDA position quietly compounded another 2.4pp as several PTRs disclosed late.",
  "Energy picked up a notable bid from Hern, with a $250K–$500K OXY add disclosed mid-week.",
  "Regional banks saw thirteen lawmakers file PTRs within a 96-hour window after the stress test results.",
  "Crypto exposure (IBIT) inched up across two LLM portfolios; politicians remained absent.",
  "Industrials cooled — net-sell across Pelosi, Gottheimer, and Greene for the first time in 7 weeks.",
  "Comms is the lone sector with a YTD return below SPY across every politician we track.",
  "Cluster detector flagged five small-cap defense names; signal score 2.4 — second-highest of the quarter.",
];

const DISSENTS = [
  {
    title: "Grok 4 holds the bear case on NVDA",
    body: "While GPT-5, Claude, and Gemini 2.5 all stayed long NVDA this week, Grok 4 trimmed 4.6pp and rotated into IBM. The model cited \"compressed near-term GPU upgrade cycles\" in its weekly note.",
  },
  {
    title: "Hern vs. the House on UNH",
    body: "Kevin Hern (R-OK) sold UNH on Tuesday — the same week Gottheimer doubled his position. Hern's bracket was $50K–$100K, Gottheimer's $100K–$250K. The split is unusual within House Democrats.",
  },
  {
    title: "Claude breaks from the consensus on TSLA",
    body: "Three of four AI minds remain long TSLA. Claude is flat. It cut to zero last week, citing \"valuation dispersion vs. delivery guidance.\" The minds we model rarely diverge mid-quarter on a name this concentrated.",
  },
  {
    title: "Greene exits a defense cluster early",
    body: "While four other House Republicans piled into LMT and RTX after the supplemental announcement, M.T. Greene sold both. The mover sequencing makes her one of the first lawmakers to exit a confirmed cluster trade.",
  },
];

const ROTATION_IN = [
  { name: "Semis (AVGO, AMD)", delta: "+3.4pp" },
  { name: "Defense (LMT, RTX)", delta: "+2.1pp" },
  { name: "Mega-cap Tech", delta: "+1.6pp" },
  { name: "Energy (OXY, XOM)", delta: "+1.2pp" },
  { name: "REITs (PLD, CCI)", delta: "+0.9pp" },
];

const ROTATION_OUT = [
  { name: "Healthcare (UNH, LLY)", delta: "−2.2pp" },
  { name: "Industrials", delta: "−1.4pp" },
  { name: "Consumer Disc (TSLA, NKE)", delta: "−1.1pp" },
  { name: "Comms", delta: "−0.8pp" },
  { name: "Materials", delta: "−0.4pp" },
];

const PORTFOLIO_VERBS = [
  "leaned harder into",
  "trimmed exposure to",
  "rotated capital toward",
  "doubled down on",
  "stayed measured on",
  "began an opening position in",
  "took chips off the table in",
];

const PORTFOLIOS = [
  { slug: "pelosi", name: "Nancy Pelosi", label: "House Rep · CA · D" },
  { slug: "greene", name: "M.T. Greene", label: "House Rep · GA · R" },
  { slug: "gottheimer", name: "Josh Gottheimer", label: "House Rep · NJ · D" },
  { slug: "hern", name: "Kevin Hern", label: "House Rep · OK · R" },
  { slug: "gpt", name: "GPT-5", label: "OpenAI · weekly" },
  { slug: "claude", name: "Claude", label: "Anthropic · weekly" },
];

const TICKER_CHOICES = ["NVDA", "AVGO", "MSFT", "AAPL", "LMT", "RTX", "TSLA", "META", "JPM", "OXY", "GOOGL", "AMD"];

const SECTOR_CHOICES = ["Tech", "Defense", "Healthcare", "Energy", "Finance", "Consumer", "Industrials", "REIT", "Comms"];

const ANOMALY_TEMPLATES: ((rng: () => number) => AnomalyCard)[] = [
  (rng) => ({
    emoji: "✈",
    headline: `${Math.floor(rng() * 25) + 24} lawmakers all bought the same airline last week`,
    body: "Delta (DAL) saw the largest concentration of Congressional buys since the 2023 reopening trade. Mostly $1K–$15K brackets, but the cluster is unusually wide across both parties.",
    tag: `${Math.floor(rng() * 25) + 24} lawmakers`,
    kind: "Cluster trade",
    score: 2.0 + rng() * 1.6,
  }),
  (rng) => ({
    emoji: "⚡",
    headline: `Four AI minds disagreed on ${pick(["NVDA", "AVGO", "META"], rng)} for the first time this year`,
    body: "GPT-5 stayed long, Claude trimmed, Gemini opened a new position, and Grok went flat — all on the same name in the same week. The consensus grid hasn't shown a 4-way split since January.",
    tag: "4-way split",
    kind: "Dissent",
    score: 1.9 + rng() * 0.9,
  }),
  (rng) => ({
    emoji: "✺",
    headline: `Three senators disclosed late on ${pick(TICKER_CHOICES, rng)} — same trade date`,
    body: "Trade date: identical. Disclosure dates: spread across 39 days. The clustering pattern in the underlying transactions suggests a coordinated entry timed to a single catalyst.",
    tag: "Late disclosure",
    kind: "Disclosure anomaly",
    score: 2.2 + rng() * 0.8,
  }),
  (rng) => ({
    emoji: "◈",
    headline: "Defense names traded above their weekly upper band of activity",
    body: "LMT and RTX hit the 95th percentile of weekly filing density. The last time both sat above the band simultaneously was Q4 — and the cluster ran for 11 trading days.",
    tag: "Sector spike",
    kind: "Volume anomaly",
    score: 1.7 + rng() * 1.1,
  }),
  (rng) => ({
    emoji: "⌁",
    headline: `${pick(["Pelosi", "Hern", "Greene"], rng)} broke a 14-week pattern`,
    body: "First buy in a sector that has been radio-silent in this portfolio since February. Bracket size suggests an opening position, not a top-up — the directional read here is meaningful.",
    tag: "Pattern break",
    kind: "Behavioral",
    score: 1.5 + rng() * 1.2,
  }),
];

/* ───────────────────────── Generator ───────────────────────── */

export function getInsightsForCurrentWeek(now: Date = new Date()): InsightsSection {
  return getInsightsForWeek(now);
}

export function getInsightsForWeek(d: Date): InsightsSection {
  const { start, end, label } = weekRange(d);
  const seedKey = isoWeekKey(start);
  const rng = seededRng(hash(`autotrade::insights::${seedKey}`));

  // Hero stat: 180–260 filings, varies by week. Determined by the seed.
  const filingsIndexed = 180 + Math.floor(rng() * 80);

  // Top 5 trends.
  const whatMoved = pickN(TRENDS, 5, rng);

  // Top 3 dissents.
  const dissents = pickN(DISSENTS, 3, rng);

  // Rotation: 4 in, 4 out, distinct.
  const incoming = pickN(ROTATION_IN, 4, rng);
  const outgoing = pickN(ROTATION_OUT, 4, rng);

  // Per-portfolio commentary.
  const portfolios: PortfolioMemo[] = PORTFOLIOS.map((p) => {
    const memo = makeMemo(p, rng);
    return memo;
  });

  // Anomaly cards — pick 3 unique templates.
  const anomalyTemplates = pickN(ANOMALY_TEMPLATES, 3, rng);
  const anomalies = anomalyTemplates.map((fn) => fn(rng));

  // Cross-asset moves.
  const crossAsset: CrossAssetPoint[] = SECTOR_CHOICES.slice(0, 6).map((s) => {
    const filings = 8 + Math.floor(rng() * 36);
    const netBuy = rng() * 1.6 - 0.8;
    const anchor = pick(
      ["Fed minutes", "CPI print", "Pentagon supplemental", "earnings cluster", "OPEC update", "stress test", "regulatory hearing"],
      rng,
    );
    return { sector: s, filings, netBuy, anchor };
  });

  return {
    weekLabel: label,
    weekStartIso: start.toISOString().slice(0, 10),
    weekEndIso: end.toISOString().slice(0, 10),
    filingsIndexed,
    whatMoved,
    dissents,
    rotation: { incoming, outgoing },
    portfolios,
    anomalies,
    crossAsset,
  };
}

function makeMemo(p: { slug: string; name: string; label: string }, rng: () => number): PortfolioMemo {
  const verb = pick(PORTFOLIO_VERBS, rng);
  const sector = pick(SECTOR_CHOICES, rng);
  const tickerA = pick(TICKER_CHOICES, rng);
  const tickerB = pick(TICKER_CHOICES.filter((t) => t !== tickerA), rng);

  // Stats — deterministic from the seed.
  const filings = 2 + Math.floor(rng() * 12);
  const netRatio = (rng() * 1.4 - 0.4);
  const vsSector = (rng() * 8 - 3);

  // 100-ish word paragraph stitched from short phrases. Keeps the writing
  // varied while remaining safely on-brand.
  const opens = [
    `${p.name} ${verb} ${sector.toLowerCase()} this week.`,
    `${p.name}'s book ${verb} ${sector.toLowerCase()}.`,
    `${p.name} ${verb} ${sector.toLowerCase()} — the bigger story underneath the headline number.`,
  ];
  const middles = [
    `The marquee filings were ${tickerA} (${pick(["buy", "buy", "buy", "sell"], rng)}, ${pick(["$15K–$50K", "$50K–$100K", "$100K–$250K"], rng)}) and ${tickerB} on Tuesday.`,
    `${tickerA} was the most-watched line item; disclosed late, executed earlier, and matched what two of the four AI minds already held.`,
    `${tickerA} and ${tickerB} drove most of the net flow. The bracket size on the second is what's interesting — bigger than usual for this portfolio.`,
  ];
  const closes = [
    `Net buy ratio sits at ${netRatio >= 0 ? "+" : ""}${netRatio.toFixed(2)} for the week, ${vsSector >= 0 ? "outperforming" : "lagging"} the sector by ${Math.abs(vsSector).toFixed(1)} percentage points.`,
    `vs. sector benchmark, the book ran ${vsSector >= 0 ? "ahead" : "behind"} by ${Math.abs(vsSector).toFixed(1)}pp. ${filings} filings in total, with a buy/sell balance that ${netRatio >= 0 ? "leans long" : "tilts defensive"}.`,
    `${filings} disclosures landed during the window; net flow ${netRatio >= 0 ? "leans constructive" : "skews defensive"}; cross-section vs. the sector is ${vsSector >= 0 ? "+" : ""}${vsSector.toFixed(1)}pp.`,
  ];

  const paragraph = `${pick(opens, rng)} ${pick(middles, rng)} ${pick(closes, rng)}`;

  return {
    slug: p.slug,
    name: p.name,
    label: p.label,
    paragraph,
    stats: [
      { label: "Filings", value: String(filings), positive: null },
      { label: "Net buy", value: `${netRatio >= 0 ? "+" : ""}${netRatio.toFixed(2)}`, positive: netRatio >= 0 },
      { label: "vs sector", value: `${vsSector >= 0 ? "+" : ""}${vsSector.toFixed(1)}pp`, positive: vsSector >= 0 },
    ],
  };
}
