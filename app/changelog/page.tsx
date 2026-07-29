// app/changelog/page.tsx
//
// Release timeline. Vertical line + dots, version badges, scroll-reveal
// via framer-motion. Six entries seeded; new entries get appended at top.

"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  LayoutDashboard, ChartLine, ListChecks, Radio,
  Sparkles, Wrench,
} from "lucide-react";
import { PublicHeader } from "@/components/marketing/PublicHeader";
import { PublicFooter } from "@/components/marketing/PublicFooter";
import {
  BG, VIOLET, VIOLET_2, YELLOW, POSITIVE,
  TEXT_HI, TEXT_MID, TEXT_LOW, LINE, LINE_2,
} from "@/lib/theme";

type Entry = {
  version: string;
  date: string;     // ISO yyyy-mm-dd
  title: string;
  tag?: string;     // "release" | "patch" | "infra"
  icon: React.ReactNode;
  accent?: string;  // override the dot color
  bullets: string[];
};

const ENTRIES: Entry[] = [
  {
    version: "v0.4",
    date: "2026-06-26",
    title: "Sidebar Terminal, Google OAuth, polished benchmarks chart",
    tag: "release",
    icon: <LayoutDashboard size={16} />,
    bullets: [
      "Desk-wide sidebar shell (DeskShell) replaces the old top-bar layout — every authenticated route now shares one chrome.",
      "Google OAuth wired end-to-end via NextAuth. Sign-in UX matches Linear/Vercel: one click, redirect home, no email/password fallback.",
      "ReturnChartBenchmarks repolished with overlaid S&P 500 and NASDAQ-100 series, side-by-side legend, and an annotation strip.",
      "Removed three orphaned wrapper components left over from the pre-DeskShell era.",
    ],
  },
  {
    version: "v0.3",
    date: "2026-06-22",
    title: "Deep portfolio profiles, transaction log, AI scorecard",
    tag: "release",
    icon: <ChartLine size={16} />,
    bullets: [
      "Every portfolio gets a profile page at /[slug] with seven modules: header, KPIs, return chart, holdings, transactions, AI scorecard, peer compare.",
      "Transaction log: chronological feed of every disclosed trade, source-linked to the original PTR.",
      "AI scorecard: hit/miss bars showing where each model concurred or dissented with the portfolio.",
    ],
  },
  {
    version: "v0.2",
    date: "2026-06-20",
    title: "Initial Desk view with live firehose",
    tag: "release",
    icon: <Radio size={16} />,
    bullets: [
      "Six Desk modules ship: market snapshot, consensus pick, four-minds row, roster preview, today's filings, firehose feed.",
      "Filings firehose streams up to 50 most recent rows with auto-update on new ZIP refresh.",
      "Sub-30-second filing-to-feed latency achieved end-to-end.",
    ],
  },
  {
    version: "v0.1",
    date: "2026-06-18",
    title: "First dispatch — the desk goes live",
    tag: "release",
    icon: <Sparkles size={16} />,
    accent: YELLOW,
    bullets: [
      "Public landing at /, methodology stub at /about, theme tokens centralized in lib/theme.ts.",
      "House Clerk ZIP ingestion pipeline running on a 15-minute cron with backfill scripts for 2024–present.",
      "Equally-weighted reconstruction logic and the index-from-100 calculator land with unit tests.",
    ],
  },
  {
    version: "v0.0.3",
    date: "2026-06-15",
    title: "Compare, backtest, insider radar",
    tag: "patch",
    icon: <ListChecks size={16} />,
    bullets: [
      "/compare lets you stack 2–4 portfolios on one chart with a peer-relative bar.",
      "/backtest runs a filing-date-basis simulation across a configurable date range and cash starting balance.",
      "/radar surfaces unusual cluster filings (≥3 distinct members on the same ticker inside a 14-day window).",
    ],
  },
  {
    version: "v0.0.1",
    date: "2026-06-12",
    title: "Repository bootstrap",
    tag: "infra",
    icon: <Wrench size={16} />,
    accent: TEXT_LOW,
    bullets: [
      "Next 16 + React 19 + Tailwind 4 scaffold.",
      "Drizzle ORM + better-sqlite3 for local development; Postgres in production via Vercel.",
      "NextAuth beta + JetBrains Mono / Fraunces / Inter Tight font stack pinned.",
    ],
  },
];

export default function ChangelogPage() {
  return (
    <main
      className="relative min-h-screen overflow-x-hidden"
      style={{ background: BG, color: TEXT_HI, fontFamily: "var(--font-sans)" }}
    >
      <PublicHeader />

      {/* HERO */}
      <section className="relative">
        <div className="absolute inset-0 pointer-events-none">
          <div
            className="absolute -top-32 left-1/2 -translate-x-1/2 w-[760px] h-[420px] rounded-full blur-[110px] opacity-40"
            style={{ background: `radial-gradient(circle, ${VIOLET}55, transparent 60%)` }}
          />
        </div>
        <div className="relative max-w-3xl mx-auto px-6 lg:px-12 pt-20 sm:pt-28 pb-12">
          <div className="font-mono text-[11px] uppercase tracking-[0.18em]" style={{ color: VIOLET_2 }}>
            Changelog · {ENTRIES.length} releases
          </div>
          <h1
            className="mt-5 font-semibold tracking-[-0.04em] leading-[0.97] text-[44px] sm:text-[64px] lg:text-[72px]"
            style={{
              fontFamily: "var(--font-display)",
              background: "linear-gradient(180deg, #fff 0%, #B9C1D3 100%)",
              WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent",
            }}
          >
            What we shipped.
          </h1>
          <p className="mt-6 text-[16.5px] leading-[1.6]" style={{ color: TEXT_MID }}>
            Every meaningful release, dated and described. Subscribe via{" "}
            <a className="underline underline-offset-2 hover:text-white" href="/changelog/feed.atom">Atom</a>
            {" "}or watch the{" "}
            <a className="underline underline-offset-2 hover:text-white" href="https://github.com/autotrade/changelog" target="_blank" rel="noopener noreferrer">GitHub repo</a>.
          </p>
        </div>
      </section>

      {/* TIMELINE */}
      <section className="max-w-3xl mx-auto px-6 lg:px-12 pb-24">
        <ol className="relative pl-8 sm:pl-12">
          {/* spine */}
          <span
            aria-hidden
            className="absolute left-3 sm:left-5 top-2 bottom-2 w-px"
            style={{ background: `linear-gradient(180deg, ${VIOLET}88 0%, ${VIOLET}11 100%)` }}
          />

          {ENTRIES.map((e, i) => (
            <ChangelogEntry key={`${e.version}-${e.date}`} entry={e} index={i} />
          ))}
        </ol>

        <div
          className="mt-12 pt-6 flex items-center justify-between text-[13px]"
          style={{ borderTop: `1px solid ${LINE}`, color: TEXT_MID }}
        >
          <Link href="/docs" className="hover:text-white">← Docs</Link>
          <Link href="/" className="hover:text-white">Home →</Link>
        </div>
      </section>

      <PublicFooter />
    </main>
  );
}

/* ─── Entry ───────────────────────────────────────────────────────────── */
function ChangelogEntry({ entry, index }: { entry: Entry; index: number }) {
  const accent = entry.accent ?? VIOLET_2;
  const tagColor = entry.tag === "patch" ? YELLOW : entry.tag === "infra" ? TEXT_LOW : POSITIVE;

  return (
    <motion.li
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ delay: Math.min(index, 4) * 0.05, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      className="relative pb-10 last:pb-0"
    >
      {/* dot */}
      <span
        aria-hidden
        className="absolute -left-8 sm:-left-12 top-1.5 inline-flex w-6 h-6 sm:w-9 sm:h-9 items-center justify-center rounded-full"
        style={{
          background: `radial-gradient(circle, ${accent}55 0%, ${accent}11 60%, transparent 70%)`,
        }}
      >
        <span
          className="inline-flex w-3.5 h-3.5 sm:w-4 sm:h-4 items-center justify-center rounded-full"
          style={{
            background: BG,
            border: `1.5px solid ${accent}`,
            boxShadow: `0 0 0 4px ${BG}, 0 0 14px -2px ${accent}`,
          }}
        >
          <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full" style={{ background: accent }} />
        </span>
      </span>

      {/* card */}
      <motion.article
        className="rounded-xl p-5 sm:p-6 transition-colors"
        style={{
          background: "rgba(255,255,255,0.025)",
          border: `1px solid ${LINE_2}`,
          boxShadow: "0 30px 60px -36px rgba(0,0,0,0.6)",
        }}
        whileHover={{
          y: -2,
          boxShadow:
            "0 30px 60px -36px rgba(0,0,0,0.6), 0 8px 32px -8px rgba(124,95,255,0.25)",
        }}
        transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
      >
        <header className="flex items-start gap-3 flex-wrap">
          <span
            className="inline-flex items-center justify-center w-8 h-8 rounded-md shrink-0"
            style={{ background: `${accent}1A`, color: accent, border: `1px solid ${accent}44` }}
          >
            {entry.icon}
          </span>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-[11px] tabular-nums" style={{ color: TEXT_LOW }}>
                {formatDate(entry.date)}
              </span>
              <span
                className="inline-flex items-center font-mono text-[10.5px] uppercase tracking-[0.16em] rounded-md px-1.5 py-0.5"
                style={{ background: `${accent}1A`, color: accent, border: `1px solid ${accent}44` }}
              >
                {entry.version}
              </span>
              {entry.tag && (
                <span
                  className="inline-flex items-center font-mono text-[9.5px] uppercase tracking-[0.18em] rounded-sm px-1.5 py-0.5"
                  style={{ background: `${tagColor}15`, color: tagColor, border: `1px solid ${tagColor}44` }}
                >
                  {entry.tag}
                </span>
              )}
            </div>

            <h2
              className="mt-2 text-[19px] sm:text-[22px] font-semibold leading-snug tracking-tight"
              style={{ color: "#fff" }}
            >
              {entry.title}
            </h2>
          </div>
        </header>

        <ul className="mt-4 space-y-2 text-[14px] leading-[1.6]" style={{ color: TEXT_MID }}>
          {entry.bullets.map((b, i) => (
            <li key={i} className="flex gap-2.5">
              <span className="mt-2 inline-block w-1 h-1 rounded-full shrink-0" style={{ background: accent }} />
              <span>{b}</span>
            </li>
          ))}
        </ul>
      </motion.article>
    </motion.li>
  );
}

function formatDate(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  return date.toLocaleDateString("en-US", {
    year: "numeric", month: "short", day: "numeric", timeZone: "UTC",
  });
}
