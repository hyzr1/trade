// lib/chat-mock.ts
// Pure stub for the chat page. No external calls — we pattern-match the user
// prompt and return canned-but-credible replies that reference real portfolio
// names and data points. Returned strings use a tiny Markdown subset that the
// renderer in app/chat/page.tsx handles: **bold**, `code`, "- " bullets, and
// two newlines for paragraph breaks.

export type ChatRole = "user" | "assistant";
export type ChatMessage = {
  id: string;
  role: ChatRole;
  content: string;
  /** Epoch millis — used to render relative time and ordering. */
  createdAt: number;
};

export type ChatThread = {
  id: string;
  title: string;
  preview: string;
  /** Epoch millis */
  updatedAt: number;
  messages: ChatMessage[];
};

let _id = 1000;
export function makeId(): string {
  _id += 1;
  return `m_${_id.toString(36)}`;
}

/** Starter prompts shown in the right rail. Tuned to autotrade's data set. */
export const SUGGESTED_PROMPTS: string[] = [
  "Why did Pelosi load up on NVDA?",
  "Compare Greene vs Hern this quarter",
  "Which AI minds agreed on TSLA this week?",
  "Show me the biggest defense buys since November",
  "What's the consensus position between Claude and GPT-5?",
  "Which senator has the best YTD return?",
  "Find anomalous cluster trades in semis",
  "When was Pelosi's last NVDA filing?",
  "What did Gottheimer buy this month?",
  "How does autotrade weigh AI-mind consensus?",
];

/** Mock historical threads displayed in the left rail. */
export function seedThreads(): ChatThread[] {
  const now = Date.now();
  const ago = (mins: number) => now - mins * 60_000;
  return [
    {
      id: "t_seed_1",
      title: "Why did Pelosi load NVDA?",
      preview: "Nancy Pelosi's portfolio is currently 67% Tech, with NVDA…",
      updatedAt: ago(38),
      messages: [
        userMsg("Why did Pelosi load up on NVDA?", ago(40)),
        assistantMsg(replyFor("Why did Pelosi load up on NVDA?"), ago(38)),
      ],
    },
    {
      id: "t_seed_2",
      title: "Greene vs Hern this quarter",
      preview: "MTG and Kevin Hern diverged sharply in Q4 — here's the…",
      updatedAt: ago(180),
      messages: [
        userMsg("Compare Greene vs Hern this quarter", ago(182)),
        assistantMsg(replyFor("Compare Greene vs Hern this quarter"), ago(180)),
      ],
    },
    {
      id: "t_seed_3",
      title: "Defense cluster, November",
      preview: "Five senators filed PTRs in LMT, RTX, and GD within 72 hours…",
      updatedAt: ago(720),
      messages: [
        userMsg("Show me the biggest defense buys since November", ago(722)),
        assistantMsg(replyFor("Show me the biggest defense buys since November"), ago(720)),
      ],
    },
    {
      id: "t_seed_4",
      title: "Claude's rotation into semis",
      preview: "Claude added AVGO at 3.4% — first semi position since…",
      updatedAt: ago(2880),
      messages: [
        userMsg("What's Claude doing in semis lately?", ago(2882)),
        assistantMsg(replyFor("What's Claude doing in semis lately?"), ago(2880)),
      ],
    },
  ];
}

function userMsg(content: string, at: number): ChatMessage {
  return { id: makeId(), role: "user", content, createdAt: at };
}
function assistantMsg(content: string, at: number): ChatMessage {
  return { id: makeId(), role: "assistant", content, createdAt: at };
}

/* ───────────────────────── Reply generation ───────────────────────── */

/** Choose a credible reply based on simple keyword routing. */
export function replyFor(prompt: string): string {
  const q = prompt.toLowerCase();

  if (q.includes("pelosi") && (q.includes("nvda") || q.includes("nvidia"))) {
    return [
      "Nancy Pelosi's portfolio is currently **67% Tech**, with **NVDA** as her largest single holding (≈18.4% weight by last filing).",
      "Her PTR on **Jan 14** disclosed a **$5M–$25M** buy ahead of NVIDIA's Q4 print. Three of the four AI minds we track — **GPT-5**, **Claude**, and **Gemini 2.5** — already held NVDA going into the same week.",
      "Worth noting:\n- Average disclosure lag for Pelosi's tech buys is **34 days**\n- Her last NVDA add returned **+14.2%** in the 30 days post-filing\n- Pelosi vs SPY YTD: **+18.4% vs +9.1%**",
      "Want me to surface the filings side-by-side with the AI consensus grid? Open the **/pelosi** profile for the full breakdown.",
    ].join("\n\n");
  }

  if (q.includes("pelosi")) {
    return [
      "**Nancy Pelosi** — Speaker Emerita (D-CA). Estimated AUM **≈$112M**, YTD return **+18.4%**.",
      "Top three positions by weight:\n- **NVDA** — 18.4%\n- **AAPL** — 11.2%\n- **AVGO** — 7.8%",
      "Her trading style skews toward concentrated mega-cap tech with long holding periods. Filings tend to disclose 30–45 days after the trade date.",
      "Open the **/pelosi** profile for the return chart, holdings table, and the AI scorecard.",
    ].join("\n\n");
  }

  if (q.includes("compare") || q.includes(" vs ") || q.includes("versus")) {
    return [
      "I can read **autotrade's** filing record but I can't run the diff side-by-side here. The fastest way is the **/compare** tool — pick two portfolios, get a returns delta, sector overlap, and shared/divergent positions.",
      "If you want a quick read first:\n- **Greene** runs a small-cap energy + materials book; high turnover\n- **Hern** is concentrated REITs and pipelines; very low turnover\n- YTD: Greene **+6.2%**, Hern **+11.7%**, S&P **+9.1%**",
      "Hit **/compare?a=greene&b=hern** to load it pre-populated.",
    ].join("\n\n");
  }

  if (q.includes("tsla") || q.includes("tesla")) {
    return [
      "On **TSLA**, three of the four minds we track (**GPT-5**, **Claude**, **Gemini 2.5**) are currently long. **Grok 4** is flat.",
      "Most recent Congressional activity:\n- **Hern** added a small position on Jan 11 ($50K–$100K)\n- **Pelosi** has been flat on TSLA since 2024\n- **Gottheimer** trimmed his position on Jan 9",
      "Cluster signal is **weak-positive**. The AI minds have higher conviction than Congress on this one.",
    ].join("\n\n");
  }

  if (q.includes("consensus") || q.includes("agree")) {
    return [
      "Right now the four minds agree most strongly on:\n- **MSFT** — 4/4 hold\n- **GOOGL** — 4/4 hold\n- **NVDA** — 3/4 hold (Grok 4 dissents)\n- **AVGO** — 3/4 hold",
      "Where they split: **TSLA**, **META**, **AMZN**. The biggest dissenter this month has been **Grok 4** — it cut tech 6pp and added healthcare.",
      "The full grid is on **/terminal** under \"AI consensus\".",
    ].join("\n\n");
  }

  if (q.includes("defense") || q.includes("lmt") || q.includes("rtx")) {
    return [
      "There's been a **clear cluster** in defense since November. Five senators filed PTRs in **LMT, RTX, and GD** within 72 hours of the Pentagon supplemental announcement.",
      "Biggest individual buys:\n- **Hern** — RTX, $100K–$250K\n- **Gottheimer** — LMT, $50K–$100K\n- **Pelosi** — no direct defense, but added an industrial ETF",
      "Open **/radar** with the *Defense* sector chip on — you'll see the cluster heatmap.",
    ].join("\n\n");
  }

  if (q.includes("anomal") || q.includes("cluster") || q.includes("unusual")) {
    return [
      "Two clusters worth flagging right now:",
      "- **Semis** — three lawmakers bought AVGO within a 5-day window pre-earnings (avg disclosure lag: 31 days)\n- **Regional banks** — bipartisan cluster of small buys after the SVB-style stress test results dropped",
      "Both score above the **2.0** anomaly threshold on the cluster detector. Drill in on **/radar**.",
    ].join("\n\n");
  }

  if (q.includes("claude")) {
    return [
      "**Claude** — autotrade's frontier-mind portfolio for Anthropic's Claude.",
      "Current top positions:\n- **MSFT** — 11.5%\n- **GOOGL** — 9.8%\n- **AVGO** — 3.4% *(new — rotated in this week)*",
      "Claude has been the most defensive of the four minds this quarter. It's underweight TSLA and overweight defensive-tech vs the others.",
      "Full breakdown on **/claude**.",
    ].join("\n\n");
  }

  if (q.includes("gpt") || q.includes("openai")) {
    return [
      "**GPT-5** — autotrade's frontier-mind portfolio for OpenAI's GPT-5.",
      "Top three positions:\n- **NVDA** — 14.2%\n- **MSFT** — 12.0%\n- **META** — 8.6%",
      "GPT-5's portfolio has the highest factor loading on momentum and the highest YTD return of the four minds (+19.1%).",
      "Full breakdown on **/gpt**.",
    ].join("\n\n");
  }

  if (q.includes("return") || q.includes("performance") || q.includes("ytd")) {
    return [
      "YTD returns across the leaderboard:",
      "- **GPT-5** — +19.1%\n- **Pelosi** — +18.4%\n- **Hern** — +11.7%\n- **Claude** — +10.9%\n- **Gottheimer** — +9.2%\n- **S&P 500** — +9.1%\n- **Greene** — +6.2%",
      "Five of seven beat the index. The dispersion is real — but be careful with disclosure-lag drift; PTRs land 30–45 days late on average.",
    ].join("\n\n");
  }

  if (q.includes("methodology") || q.includes("how") && (q.includes("work") || q.includes("calculate"))) {
    return [
      "Quick rundown of how autotrade scores trades:",
      "- We ingest filings from the **House Clerk** and **Senate eFD** within seconds of publication\n- Each portfolio is rebuilt from the cumulative PTR record (no extrapolation)\n- AI-mind portfolios are paper-traded weekly from each model's stated picks\n- Returns are time-weighted and disclosed alongside SPY and QQQ benchmarks",
      "Full write-up on **/methodology**.",
    ].join("\n\n");
  }

  if (q.includes("hello") || q.includes("hi") || q.length < 8) {
    return [
      "Hi — I'm your autotrade research assistant. Ask me about any politician's holdings, the AI consensus grid, sector clusters, or how the methodology works.",
      "A few things to try:\n- *What's Pelosi holding?*\n- *Compare Hern vs Gottheimer*\n- *Which minds agreed on NVDA?*",
    ].join("\n\n");
  }

  // Generic fallback — still uses real names so it doesn't feel hollow.
  return [
    "I can dig into that. Here's what I'm pulling from autotrade's filing record right now:",
    "- The four most-watched portfolios this week are **Pelosi**, **Hern**, **Greene**, and **Gottheimer**\n- The AI minds (**GPT-5**, **Claude**, **Gemini 2.5**, **Grok 4**) collectively hold **NVDA**, **MSFT**, **GOOGL**, and **AVGO**\n- The consensus grid is updated nightly; the firehose runs sub-30s during market hours",
    "Want me to focus on one of those, or pull a specific ticker?",
  ].join("\n\n");
}

/** Pick a credible thinking delay for the typing indicator. */
export const TYPING_DELAY_MS = 800;
