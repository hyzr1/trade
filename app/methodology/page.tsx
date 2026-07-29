// app/methodology/page.tsx
//
// Long-form editorial: how autotrade works. Single-column ~70ch wide,
// serif display headlines, mono section eyebrows. Each section anchored
// with a lucide icon, animated pipeline diagram via framer-motion stagger.

"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Compass, Database, Brain, Bell, Calendar, ShieldAlert, BookOpen,
  Download, FileText, RotateCw,
} from "lucide-react";
import { PublicHeader } from "@/components/marketing/PublicHeader";
import { PublicFooter } from "@/components/marketing/PublicFooter";
import { CodeBlock, Tok } from "@/components/marketing/CodeBlock";
import {
  BG, BG_2, VIOLET, VIOLET_2, YELLOW, POSITIVE,
  TEXT_HI, TEXT_MID, TEXT_LOW, LINE, LINE_2,
} from "@/lib/theme";

export default function MethodologyPage() {
  return (
    <main
      className="relative min-h-screen overflow-x-hidden"
      style={{ background: BG, color: TEXT_HI, fontFamily: "var(--font-sans)" }}
    >
      <PublicHeader />

      {/* ── HERO ───────────────────────────────────────────────────────────── */}
      <section className="relative">
        <div className="absolute inset-0 pointer-events-none">
          <div
            className="absolute -top-32 left-1/2 -translate-x-1/2 w-[820px] h-[460px] rounded-full blur-[110px] opacity-40"
            style={{ background: `radial-gradient(circle, ${VIOLET}55, transparent 60%)` }}
          />
        </div>

        <div className="relative max-w-3xl mx-auto px-6 lg:px-12 pt-20 sm:pt-28 pb-12">
          <div className="font-mono text-[11px] uppercase tracking-[0.18em]" style={{ color: VIOLET_2 }}>
            Methodology · v0.4 · June 2026
          </div>
          <h1
            className="mt-5 font-semibold tracking-[-0.04em] leading-[0.97] text-[44px] sm:text-[64px] lg:text-[76px]"
            style={{
              fontFamily: "var(--font-display)",
              background: "linear-gradient(180deg, #fff 0%, #B9C1D3 100%)",
              WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent",
            }}
          >
            How autotrade works.
          </h1>
          <p className="mt-6 text-[17px] leading-[1.65]" style={{ color: TEXT_MID }}>
            A clear, technical walkthrough of what we ingest, what we infer, and what we deliberately
            choose not to do. No marketing fog. Read this before you act on anything you see on the desk.
          </p>
        </div>
      </section>

      {/* ── 1. THESIS ──────────────────────────────────────────────────────── */}
      <Article>
        <SectionHeader no="01" icon={<Compass size={18} />} eyebrow="The thesis">
          Two slow signals, side by side.
        </SectionHeader>

        <DropCap>C</DropCap>
        <p>
          ongressional stock disclosures are the most public, least-watched signal in US markets. By law
          (the STOCK Act, 2012), every sitting Representative and Senator must file a Periodic
          Transaction Report within 45 days of any covered trade. The data is free, structured, and
          months behind. Most of it goes unread.
        </p>
        <p>
          Frontier LLMs — GPT-5, Claude, Gemini, Grok — are also being asked to pick stocks every week
          by millions of retail investors, with almost no public record of how those picks perform.
          When everyone is privately asking the same model the same question, the model's answer becomes
          a coordination point worth watching.
        </p>
        <p>
          autotrade puts both signals on the same page. We replay every PTR on the day it was filed
          (the day the trade became <em>publicly knowable</em>) and we snapshot the four LLM portfolios
          every Monday at 09:00 ET. Each portfolio carries forward from its own start date. Neither
          gets a head start. Neither gets backfilled.
        </p>
      </Article>

      {/* ── 2. PIPELINE ────────────────────────────────────────────────────── */}
      <Article>
        <SectionHeader no="02" icon={<Database size={18} />} eyebrow="The pipeline">
          Ingest. Parse. Replay.
        </SectionHeader>

        <p>
          The Clerk of the House publishes a single ZIP each day containing every Financial Disclosure
          filed that year. The same ZIP URL is used by every academic group and trade-tracker, so we
          all start from the same authoritative source.
        </p>

        <PipelineDiagram />

        <p>
          We hit the ZIP every 15 minutes on a cron. New filings get fingerprinted, queued, and processed.
          Each PTR is downloaded as a PDF, text-extracted, then parsed into rows of
          {" "}<code>(member, date, side, ticker, bracket)</code>. The parser is custom — there is no
          public schema, just decades of evolving form layouts.
        </p>

        <CodeBlock raw="curl -s https://disclosures-clerk.house.gov/public_disc/financial-pdfs/2025FD.zip -o /tmp/2025FD.zip" language="curl" title="Daily index pull">
          <Tok.Fn>curl</Tok.Fn> <Tok.Kw>-s</Tok.Kw>{" "}
          <Tok.Str>https://disclosures-clerk.house.gov/public_disc/financial-pdfs/2025FD.zip</Tok.Str>{" "}
          \<br/>
          {"  "}<Tok.Kw>-o</Tok.Kw> <Tok.Str>/tmp/2025FD.zip</Tok.Str>
        </CodeBlock>

        <p>
          Filings are replayed into the affected lawmaker's portfolio on the filing date, not the
          execution date. Buys create equally-weighted positions; sells remove them. Sub-30-second
          worst-case latency from the ZIP refresh to a row appearing on the desk.
        </p>
      </Article>

      {/* ── 3. FOUR MINDS ──────────────────────────────────────────────────── */}
      <Article>
        <SectionHeader no="03" icon={<Brain size={18} />} eyebrow="The four minds">
          One prompt. Four models. Every Monday.
        </SectionHeader>

        <p>
          Every Monday at 09:00 ET we hit the four leading frontier model APIs with the same prompt and
          the same temperature. The response — a JSON portfolio of 5 to 10 large-cap US tickers with
          weights summing to 100% — is hashed, persisted, and replayed forward like any other portfolio.
        </p>

        <CodeBlock raw={SYSTEM_PROMPT} language="prompt" title="prompts/weekly_v3.txt">
          <Tok.Cmt># prompts/weekly_v3.txt — sealed Jan 2026 (v3)</Tok.Cmt><br/>
          <Tok.Kw>You are</Tok.Kw> a portfolio manager managing a long-only US equity book.<br/>
          <Tok.Kw>Constraints</Tok.Kw>:<br/>
          {"  "}- 5 to 10 positions, US large-cap only.<br/>
          {"  "}- Weights are integers, sum exactly to 100.<br/>
          {"  "}- Output strict JSON: <Tok.Op>{`{ "portfolio": [{ "ticker": "..."`}</Tok.Op>, <Tok.Op>{`"weight": <int> }] }`}</Tok.Op>.<br/>
          {"  "}- No prose. No reasoning. No disclaimers.<br/>
          <br/>
          <Tok.Kw>Today's date</Tok.Kw>: <Tok.Str>{`{{ISO_TODAY}}`}</Tok.Str>.
        </CodeBlock>

        <p>
          The prompt is versioned in git. When it changes, the version bumps and we start a new
          generation lineage. We never re-run an old portfolio with a new prompt — that would be
          backfilling. v3 has been frozen since January 2026.
        </p>
        <p>
          Models currently in the rotation: <strong style={{ color: TEXT_HI }}>GPT-5</strong> (OpenAI),
          {" "}<strong style={{ color: TEXT_HI }}>Claude Opus 4.8</strong> (Anthropic),
          {" "}<strong style={{ color: TEXT_HI }}>Gemini 2.5 Pro</strong> (Google),
          {" "}<strong style={{ color: TEXT_HI }}>Grok 4</strong> (xAI). We will add and rotate as the
          frontier moves, with each transition logged in the changelog.
        </p>
      </Article>

      {/* ── 4. ALERTS ──────────────────────────────────────────────────────── */}
      <Article>
        <SectionHeader no="04" icon={<Bell size={18} />} eyebrow="Alerts">
          Concurrence and dissent.
        </SectionHeader>

        <p>
          An <strong style={{ color: TEXT_HI }}>alert</strong> is a state where three or more of the
          four minds independently pick the same ticker in the same Monday snapshot. We call this
          {" "}<em>concurrence</em>. When concurrence appears on a ticker that's also showing fresh
          Congressional flow inside the prior 14 days, the desk flags it as the
          {" "}<span style={{ color: YELLOW }}>Trade of the day</span>.
        </p>
        <p>
          <strong style={{ color: TEXT_HI }}>Dissent</strong> is the inverse — a single model picking
          something the other three explicitly avoided. Dissent is interesting precisely because it's
          rare; the alert highlights it without endorsing it.
        </p>
        <p>
          Neither signal is a recommendation. Both are scored, dated, and source-linked so you can
          reconstruct exactly what was visible on the desk at any historical moment.
        </p>
      </Article>

      {/* ── 5. FILING-DATE BASIS ───────────────────────────────────────────── */}
      <Article>
        <SectionHeader no="05" icon={<Calendar size={18} />} eyebrow="Measurement">
          Why returns start at the disclosed date.
        </SectionHeader>

        <p>
          A PTR can disclose a trade that happened 45 days ago. If we measured returns from the
          trade-execution date, we'd be giving every portfolio a head start that no real reader of the
          disclosure could have captured. That's not a backtest — that's look-ahead bias.
        </p>
        <p>
          Every replicated portfolio on autotrade starts the clock on the <em>filing</em> date. The
          number you see is the return an attentive reader could have earned, in the limit, by reading
          the filing the day it became public and replicating the disclosed trade. It excludes
          slippage, taxes, and fees — those are real and meaningful, and you should subtract them
          mentally before drawing any conclusion.
        </p>
        <p>
          For LLM portfolios the equivalent rule applies: we mark from the snapshot timestamp forward.
          A model added Monday morning does not retroactively claim last week's NVDA rally.
        </p>
      </Article>

      {/* ── 6. LIMITATIONS ─────────────────────────────────────────────────── */}
      <Article id="limits">
        <SectionHeader no="06" icon={<ShieldAlert size={18} />} eyebrow="Limitations">
          What we don't know, in writing.
        </SectionHeader>

        <ul className="list-none pl-0 space-y-4 mt-2">
          <Limit title="Bracket reconstruction">
            PTRs disclose dollar ranges, not exact share counts. Equal weighting is a stable
            approximation — it is not what the lawmaker actually traded.
          </Limit>
          <Limit title="Weekly LLM cadence">
            One snapshot per week per model means the LLM signal is structurally low-frequency.
            Higher cadences are possible but would invite prompt drift and noise.
          </Limit>
          <Limit title="Scanned PDFs">
            A non-trivial minority of older PTRs are image scans with no text layer. We skip them
            silently rather than risk OCR fabrication.
          </Limit>
          <Limit title="No real-money execution">
            We do not custody assets. We do not place trades. Copy-trading via connected brokerages
            is on the roadmap; you can join the waitlist from the desk.
          </Limit>
          <Limit title="Senate eFD">
            The Senate's filing portal sits behind a privacy acknowledgment cookie our scraper does
            not currently negotiate. House filings are complete; Senate is partial.
          </Limit>
          <Limit title="LLM alpha decay">
            Lopez-Lira (2023) shows LLM long-short alpha from news decays as adoption rises.
            Historical backtests of LLM portfolios overstate forward expected returns.
          </Limit>
        </ul>
      </Article>

      {/* ── 7. OPEN DATA ───────────────────────────────────────────────────── */}
      <Article>
        <SectionHeader no="07" icon={<BookOpen size={18} />} eyebrow="Open data">
          Sources and citations.
        </SectionHeader>

        <p>
          Every figure on autotrade resolves to a primary source. We do not synthesize, we do not
          buy data feeds, and we do not enrich with proprietary fields you cannot independently
          verify.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6">
          <SourceCard
            title="House Clerk · Financial Disclosure"
            href="https://disclosures-clerk.house.gov/FinancialDisclosure"
            body="The authoritative index of every PTR filed by a sitting Representative."
          />
          <SourceCard
            title="Senate Office of Public Records · eFD"
            href="https://efdsearch.senate.gov"
            body="Senate equivalent. Partial coverage — see Limitations."
          />
          <SourceCard
            title="STOCK Act, 2012"
            href="https://www.congress.gov/bill/112th-congress/senate-bill/2038"
            body="The statute that requires PTRs in the first place. 45-day disclosure window."
          />
          <SourceCard
            title="Lopez-Lira & Tang, 2023"
            href="https://papers.ssrn.com/sol3/papers.cfm?abstract_id=4412788"
            body="Can ChatGPT Forecast Stock Returns? Foundational work on LLM-derived alpha decay."
          />
        </div>

        <div className="mt-12 pt-6 flex items-center justify-between text-[13px]" style={{ borderTop: `1px solid ${LINE}` }}>
          <Link href="/" className="hover:text-white" style={{ color: TEXT_MID }}>← Home</Link>
          <Link href="/docs" className="hover:text-white" style={{ color: TEXT_MID }}>Read the docs →</Link>
        </div>
      </Article>

      <PublicFooter />
    </main>
  );
}

/* ─────────────────────────────────────────────────────────────────────
   Editorial primitives
   ───────────────────────────────────────────────────────────────────── */

function Article({ children, id }: { children: React.ReactNode; id?: string }) {
  return (
    <article
      id={id}
      className="max-w-3xl mx-auto px-6 lg:px-12 py-14 sm:py-20 scroll-mt-24"
      style={{ borderTop: `1px solid ${LINE}` }}
    >
      <div
        className="text-[16.5px] leading-[1.8] space-y-5"
        style={{ color: TEXT_MID }}
      >
        {children}
      </div>
    </article>
  );
}

function SectionHeader({
  no, eyebrow, icon, children,
}: {
  no: string; eyebrow: string; icon: React.ReactNode; children: React.ReactNode;
}) {
  return (
    <header className="mb-10">
      <div className="flex items-center gap-3 mb-5">
        <span
          className="inline-flex w-9 h-9 items-center justify-center rounded-lg"
          style={{
            background: `linear-gradient(180deg, rgba(124,95,255,0.18) 0%, rgba(124,95,255,0.04) 100%)`,
            border: `1px solid rgba(124,95,255,0.35)`,
            color: VIOLET_2,
          }}
        >
          {icon}
        </span>
        <span className="font-mono text-[11px] uppercase tracking-[0.20em]" style={{ color: TEXT_LOW }}>
          §{no} · {eyebrow}
        </span>
      </div>
      <h2
        className="font-semibold tracking-[-0.025em] leading-[1.05] text-[30px] sm:text-[40px]"
        style={{ fontFamily: "var(--font-display)", color: "#fff" }}
      >
        {children}
      </h2>
    </header>
  );
}

function DropCap({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="float-left mr-3 mt-1 font-semibold leading-[0.9]"
      style={{
        fontFamily: "var(--font-display)",
        fontSize: "72px",
        color: "#fff",
        textShadow: `0 4px 30px ${VIOLET}55`,
      }}
    >
      {children}
    </span>
  );
}

function Limit({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <li
      className="rounded-xl px-5 py-4"
      style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${LINE}` }}
    >
      <div className="text-[14.5px] font-semibold tracking-tight" style={{ color: "#fff" }}>{title}</div>
      <p className="mt-1.5 text-[14.5px] leading-[1.6]" style={{ color: TEXT_MID }}>{children}</p>
    </li>
  );
}

function SourceCard({ title, href, body }: { title: string; href: string; body: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="block rounded-xl px-5 py-4 transition-colors hover:bg-white/[0.04]"
      style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${LINE_2}` }}
    >
      <div className="text-[14px] font-semibold" style={{ color: "#fff" }}>{title}</div>
      <p className="mt-1 text-[13px] leading-[1.55]" style={{ color: TEXT_MID }}>{body}</p>
      <div className="mt-2 font-mono text-[10.5px]" style={{ color: VIOLET_2 }}>open ↗</div>
    </a>
  );
}

/* ─────────────────────────────────────────────────────────────────────
   Animated pipeline diagram (Download → Parse → Replay)
   ───────────────────────────────────────────────────────────────────── */

function PipelineDiagram() {
  const steps = [
    { icon: <Download size={18} />,  label: "Download",  desc: "Daily ZIP from House Clerk", color: VIOLET_2 },
    { icon: <FileText size={18} />,  label: "Parse",     desc: "PDF → structured rows",      color: YELLOW   },
    { icon: <RotateCw size={18} />,  label: "Replay",    desc: "Index forward from filing",  color: POSITIVE },
  ];
  return (
    <div
      className="my-10 p-6 sm:p-8 rounded-xl relative overflow-hidden"
      style={{
        background: `linear-gradient(180deg, ${BG_2} 0%, ${BG} 100%)`,
        border: `1px solid ${LINE_2}`,
      }}
    >
      <div className="font-mono text-[10.5px] uppercase tracking-[0.18em] mb-5" style={{ color: TEXT_LOW }}>
        Pipeline · 3 steps
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-1.5 items-stretch relative">
        {steps.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ delay: i * 0.18, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            className="relative flex-1"
          >
            <div
              className="rounded-lg p-4 h-full"
              style={{
                background: "rgba(255,255,255,0.025)",
                border: `1px solid ${LINE_2}`,
              }}
            >
              <div
                className="inline-flex w-9 h-9 items-center justify-center rounded-md mb-3"
                style={{ background: `${s.color}1A`, color: s.color, border: `1px solid ${s.color}33` }}
              >
                {s.icon}
              </div>
              <div className="font-mono text-[10.5px] uppercase tracking-[0.16em]" style={{ color: TEXT_LOW }}>
                Step {i + 1}
              </div>
              <div className="mt-1 text-[15px] font-semibold tracking-tight" style={{ color: "#fff" }}>
                {s.label}
              </div>
              <div className="mt-1 text-[12.5px] leading-snug" style={{ color: TEXT_MID }}>
                {s.desc}
              </div>
            </div>

            {i < steps.length - 1 && (
              <motion.div
                aria-hidden
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.18 + 0.35, duration: 0.4 }}
                className="hidden sm:block absolute top-1/2 -right-1 -translate-y-1/2 font-mono text-[14px]"
                style={{ color: TEXT_LOW }}
              >
                →
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}

const SYSTEM_PROMPT = `# prompts/weekly_v3.txt — sealed Jan 2026 (v3)
You are a portfolio manager managing a long-only US equity book.
Constraints:
  - 5 to 10 positions, US large-cap only.
  - Weights are integers, sum exactly to 100.
  - Output strict JSON: { "portfolio": [{ "ticker": "...", "weight": <int> }] }.
  - No prose. No reasoning. No disclaimers.

Today's date: {{ISO_TODAY}}.`;
